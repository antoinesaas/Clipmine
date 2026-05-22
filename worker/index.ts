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
import { buildFfmpegArgs, normalizeTools } from "./pipeline.js";
import { downloadYoutubeMp4 } from "./ytdlp.js";

const exec = promisify(execFile);
const app = express();
app.use(express.json({ limit: "2mb" }));

const SECRET = process.env.WORKER_SECRET ?? "";
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
  opts?: { fileUrl?: string; errorMessage?: string },
) {
  if (!prisma) return;
  try {
    await prisma.download.update({
      where: { id: jobId },
      data: {
        status,
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

async function runFfmpeg(args: string[], timeout = 900_000) {
  try {
    await exec("ffmpeg", args, { timeout, maxBuffer: 20 * 1024 * 1024 });
  } catch (e: unknown) {
    const err = e as { stderr?: string; message?: string };
    const msg = err.stderr ?? err.message ?? "ffmpeg failed";
    if (msg.includes("deshake") || msg.includes("minterpolate")) {
      console.warn("[worker] fallback filters", msg.slice(0, 200));
      const vf = args[args.indexOf("-vf") + 1] ?? "";
      const fallback = vf
        .replace(/deshake=[^,]+,?/g, "")
        .replace(/minterpolate=[^,]+/g, "fps=60")
        .replace(/,,/g, ",")
        .replace(/^,|,$/g, "");
      const args2 = [...args];
      args2[args2.indexOf("-vf") + 1] = fallback || "scale=1920:1080";
      await exec("ffmpeg", args2, { timeout, maxBuffer: 20 * 1024 * 1024 });
      return;
    }
    throw e;
  }
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "clipmine-worker", r2: hasR2, db: Boolean(prisma), pipeline: "ffmpeg-ai-v2" });
});

app.post("/process", auth, async (req, res) => {
  const { jobId, youtubeId, ratio = "9:16", quality = "4K", enhance = true, tools: rawTools } = req.body ?? {};
  if (!jobId || !youtubeId) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }

  const tools = normalizeTools(rawTools, !!enhance);
  res.json({ status: "accepted", jobId, tools });

  const workDir = path.join(TMP, jobId);
  void (async () => {
    try {
      await mkdir(workDir, { recursive: true });
      const rawMp4 = path.join(workDir, "raw.mp4");
      const out = path.join(workDir, "export.mp4");

      console.log("[worker] start", jobId, { ratio, quality, tools });

      await downloadYoutubeMp4(youtubeId, rawMp4);

      const ffArgs = buildFfmpegArgs(rawMp4, out, { ratio, quality, tools }, MAX_CLIP_SEC);
      await runFfmpeg(ffArgs);

      let fileUrl: string | undefined;
      if (hasR2) {
        fileUrl = await uploadToR2(out, `exports/${jobId}.mp4`);
      } else {
        throw new Error("Stockage R2 non configuré sur le worker.");
      }

      await setStatus(jobId, "ready", { fileUrl });
      console.log("[worker] done", jobId, tools.join("+"), fileUrl);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const short =
        msg.includes("bot") || msg.includes("Sign in")
          ? "YouTube a bloqué le téléchargement (anti-bot). Réessaie avec un autre clip."
          : msg.slice(0, 240);
      console.error("[worker] fail", jobId, msg);
      await setStatus(jobId, "failed", { errorMessage: short });
    } finally {
      await rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  })();
});

app.listen(PORT, "0.0.0.0", () => console.log(`ClipMine worker :${PORT} (pipeline ffmpeg-ai-v2)`));
