/**
 * ClipMine Video Worker — Railway / Fly.io
 * ffmpeg + yt-dlp ne tournent PAS sur Vercel serverless.
 *
 * Deploy:
 *   cd worker && npm install
 *   fly launch  OR  railway up
 *
 * Env: WORKER_SECRET, R2_*, DATABASE_URL (optionnel pour update status)
 */
import express from "express";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdir, rm } from "fs/promises";
import path from "path";

const exec = promisify(execFile);
const app = express();
app.use(express.json({ limit: "1mb" }));

const SECRET = process.env.WORKER_SECRET ?? "";
const PORT = Number(process.env.PORT ?? 8080);
const TMP = process.env.TMP_DIR ?? "/tmp/clipmine";

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const h = req.headers.authorization ?? "";
  if (!SECRET || h !== `Bearer ${SECRET}`) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "clipmine-worker" });
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

    // TODO: upload out → R2, update Download.status via DATABASE_URL + Prisma
    console.log("[worker] done", jobId, out);
  } catch (e) {
    console.error("[worker] fail", jobId, e);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
});

app.listen(PORT, () => console.log(`ClipMine worker :${PORT}`));
