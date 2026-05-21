/**
 * ClipMine Video Worker — Fly.io
 * ffmpeg + yt-dlp ne tournent PAS sur Vercel serverless.
 */
import express from "express";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdir, rm, readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const exec = promisify(execFile);
const app = express();
app.use(express.json({ limit: "1mb" }));

const SECRET = process.env.WORKER_SECRET ?? "";
const PORT = Number(process.env.PORT ?? 8080);
const TMP = process.env.TMP_DIR ?? "/tmp/clipmine";

const prisma = process.env.DATABASE_URL ? new PrismaClient() : null;

const hasR2 = Boolean(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET
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

async function setStatus(jobId: string, status: string, fileUrl?: string) {
  if (!prisma) return;
  try {
    await prisma.download.update({
      where: { id: jobId },
      data: { status, ...(fileUrl ? { fileUrl } : {}) },
    });
  } catch (e) {
    console.error("[worker] db update failed", jobId, e);
  }
}

async function uploadToR2(localPath: string, key: string): Promise<string> {
  if (!r2) throw new Error("R2 not configured");
  const body = await readFile(localPath);
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: "video/mp4" }));
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

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "clipmine-worker", r2: hasR2, db: Boolean(prisma) });
});

app.post("/process", auth, async (req, res) => {
  const { jobId, youtubeId, ratio = "9:16", enhance = true } = req.body ?? {};
  if (!jobId || !youtubeId) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }

  res.json({ status: "accepted", jobId });

  const workDir = path.join(TMP, jobId);
  try {
    await mkdir(workDir, { recursive: true });
    const raw = path.join(workDir, "raw.mp4");
    const out = path.join(workDir, "export.mp4");

    await exec("yt-dlp", [
      "-f", "bestvideo[height<=2160]+bestaudio/best",
      "-o", raw,
      `https://www.youtube.com/watch?v=${youtubeId}`,
    ], { timeout: 600_000 });

    const crop = ratio === "9:16"
      ? "crop=ih*9/16:ih:(iw-ih*9/16)/2:0"
      : ratio === "4:3"
        ? "crop=ih*4/3:ih:(iw-ih*4/3)/2:0"
        : "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2";

    const vf = enhance
      ? `${crop},unsharp=5:5:1.0:5:5:0.0,fps=60`
      : crop;

    await exec("ffmpeg", ["-y", "-i", raw, "-vf", vf, "-c:v", "libx264", "-crf", "18", "-c:a", "aac", out], {
      timeout: 600_000,
    });

    let fileUrl: string | undefined;
    if (hasR2) {
      fileUrl = await uploadToR2(out, `exports/${jobId}.mp4`);
    }

    await setStatus(jobId, "ready", fileUrl);
    console.log("[worker] done", jobId, fileUrl ?? out);
  } catch (e) {
    console.error("[worker] fail", jobId, e);
    await setStatus(jobId, "failed");
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
});

app.listen(PORT, () => console.log(`ClipMine worker :${PORT}`));
