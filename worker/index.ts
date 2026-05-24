/**
 * ClipMine Video Worker — Fly.io
 * yt-dlp → pipeline IA (ffmpeg) → upload R2
 */
import express from "express";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdir, rm, readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  buildFfmpegArgs,
  buildFallbackFilterChains,
  normalizeTools,
  type PipelineInput,
} from "./pipeline.js";
import { downloadYoutubeMp4 } from "./download-youtube.js";
import { hasYoutubeCookies } from "./ytdlp.js";

const exec = promisify(execFile);
const app = express();
app.use(express.json({ limit: "2mb" }));

const SECRET = (process.env.WORKER_SECRET ?? "").trim().replace(/[\r\n]+/g, "");
const PORT = Number(process.env.PORT ?? 8080);
const TMP = process.env.TMP_DIR ?? "/tmp/clipmine";
const MAX_CLIP_SEC = Number(process.env.MAX_CLIP_SEC ?? 180);

const prisma = process.env.DATABASE_URL ? new PrismaClient() : null;

const hasR2 = Boolean(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET,
);

const r2 = hasR2
  ? new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

const BUCKET = process.env.R2_BUCKET ?? "";

async function setStatus(
  jobId: string,
  status: string,
  opts?: { fileUrl?: string; errorMessage?: string; pipelineStage?: string },
) {
  if (!prisma) return;
  try {
    await prisma.download.update({
      where: { id: jobId },
      data: {
        status,
        ...(opts?.pipelineStage ? { pipelineStage: opts.pipelineStage } : {}),
        ...(opts?.fileUrl ? { fileUrl: opts.fileUrl } : {}),
        ...(opts?.errorMessage !== undefined ? { errorMessage: opts.errorMessage } : {}),
      },
    });
  } catch (e) {
    console.error("[worker] db update failed", jobId, e);
  }
}

async function uploadToR2(localPath: string, key: string): Promise<string> {
  if (!r2) throw new Error("R2 not configured");
  const body = await readFile(localPath);
  await r2.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: "video/mp4" }),
  );
  return getSignedUrl(r2, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 60 * 60 * 24 * 7 });
}

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const h = req.headers.authorization ?? "";
  if (!SECRET || h !== `Bearer ${SECRET}`) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}

function replaceVf(args: string[], vf: string): string[] {
  const out = [...args];
  const i = out.indexOf("-vf");
  if (i >= 0) out[i + 1] = vf;
  return out;
}

async function runFfmpegOnce(args: string[], timeout = 900_000) {
  await exec("ffmpeg", args, { timeout, maxBuffer: 24 * 1024 * 1024 });
}

async function runFfmpegWithFallbacks(
  inputPath: string,
  outputPath: string,
  pipeline: PipelineInput,
  maxSec?: number,
) {
  const primary = buildFfmpegArgs(inputPath, outputPath, pipeline, maxSec);
  const chains = buildFallbackFilterChains(pipeline);
  const attempts = [primary, ...chains.map((vf) => replaceVf(primary, vf))];

  let lastErr: unknown;
  for (let i = 0; i < attempts.length; i++) {
    try {
      console.log("[worker] ffmpeg attempt", i + 1, attempts[i][attempts[i].indexOf("-vf") + 1]?.slice(0, 120));
      await runFfmpegOnce(attempts[i]);
      if (i > 0) console.log("[worker] ffmpeg ok on fallback", i + 1);
      return;
    } catch (e) {
      lastErr = e;
      const err = e as { stderr?: string; message?: string };
      console.warn("[worker] ffmpeg fail", i + 1, (err.stderr ?? err.message ?? "").slice(0, 300));
    }
  }
  throw lastErr;
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "clipmine-worker",
    r2: hasR2,
    db: Boolean(prisma),
    pipeline: "ffmpeg-ai-v4",
    youtubeCookies: hasYoutubeCookies(),
  });
});

app.post("/process", auth, async (req, res) => {
  const { jobId, youtubeId, ratio = "9:16", quality = "4K", enhance = true, tools: rawTools } = req.body ?? {};
  if (!jobId || !youtubeId) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }

  const tools = normalizeTools(rawTools, enhance !== false);
  res.json({ status: "accepted", jobId, tools });

  const workDir = path.join(TMP, jobId);
  const pipeline: PipelineInput = { ratio, quality, tools };

  void (async () => {
    try {
      await mkdir(workDir, { recursive: true });
      const rawMp4 = path.join(workDir, "raw.mp4");
      const out = path.join(workDir, "export.mp4");

      console.log("[worker] start", jobId, { ratio, quality, tools });
      await setStatus(jobId, "processing", { pipelineStage: "download" });

      await downloadYoutubeMp4(youtubeId, rawMp4);

      await setStatus(jobId, "processing", { pipelineStage: "ffmpeg" });
      await runFfmpegWithFallbacks(rawMp4, out, pipeline, MAX_CLIP_SEC);

      let fileUrl: string | undefined;
      if (hasR2) {
        fileUrl = await uploadToR2(out, `exports/${jobId}.mp4`);
      } else {
        throw new Error("Stockage R2 non configuré sur le worker.");
      }

      await setStatus(jobId, "ready", { fileUrl, pipelineStage: "ready" });
      console.log("[worker] done", jobId, tools.join("+"), fileUrl);
    } catch (e) {
      const err = e as { stderr?: string; message?: string };
      const raw = [err.message, err.stderr].filter(Boolean).join("\n") || String(e);
      const short =
        /bot|sign in|login required/i.test(raw)
          ? "Impossible de télécharger cette vidéo YouTube. Essaie un autre clip."
          : /ffmpeg/i.test(raw)
            ? "Pipeline vidéo échoué. Réessaie avec moins d'outils IA ou un autre format."
            : err.message && err.message.length < 280 && !/Command failed/i.test(err.message)
              ? err.message
              : raw.slice(0, 240);
      console.error("[worker] fail", jobId, raw.slice(0, 800));
      await setStatus(jobId, "failed", { errorMessage: short });
    } finally {
      await rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  })();
});

app.listen(PORT, "0.0.0.0", () => console.log(`ClipMine worker :${PORT} (pipeline ffmpeg-ai-v3)`));
