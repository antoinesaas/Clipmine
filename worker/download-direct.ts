/**
 * Téléchargement depuis des URLs CDN YouTube directes (googlevideo.com).
 * Utilisé quand Vercel/InnerTube a pré-extrait les URLs — le worker n'a pas
 * besoin d'appeler l'API YouTube, il télécharge directement depuis le CDN.
 * Les URLs googlevideo.com sont accessibles depuis n'importe quelle IP (datacenter inclus).
 */

import { execFile } from "child_process";
import { promisify } from "util";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const exec = promisify(execFile);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function fetchToBuffer(url: string): Promise<Buffer> {
  const r = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Referer: "https://www.youtube.com/",
      Origin: "https://www.youtube.com",
    },
    signal: AbortSignal.timeout(300_000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} lors du téléchargement du flux CDN`);
  return Buffer.from(await r.arrayBuffer());
}

async function ffmpegCopy(inputs: string[], outputPath: string, maxSec?: number): Promise<void> {
  const t = maxSec && maxSec > 0 ? ["-t", String(maxSec)] : [];
  const inputArgs = inputs.flatMap((i) => ["-i", i]);
  await exec(
    "ffmpeg",
    ["-y", ...t, ...inputArgs, "-c", "copy", "-movflags", "+faststart", outputPath],
    { timeout: 600_000, maxBuffer: 8 * 1024 * 1024 },
  );
}

async function ffmpegReencode(inputs: string[], outputPath: string, maxSec?: number): Promise<void> {
  const t = maxSec && maxSec > 0 ? ["-t", String(maxSec)] : [];
  const inputArgs = inputs.flatMap((i) => ["-i", i]);
  await exec(
    "ffmpeg",
    [
      "-y", ...t, ...inputArgs,
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
      "-c:a", "aac", "-b:a", "192k",
      "-movflags", "+faststart",
      outputPath,
    ],
    { timeout: 600_000, maxBuffer: 8 * 1024 * 1024 },
  );
}

/**
 * Télécharge une vidéo YouTube depuis des URLs CDN directes.
 * - Si audioUrl est absent : flux muxé (vidéo + audio ensemble)
 * - Si audioUrl est présent : flux adaptatifs séparés, muxés par ffmpeg
 * Essaie d'abord un stream copy (-c copy) puis re-encode si nécessaire.
 */
export async function downloadFromUrls(
  videoUrl: string,
  audioUrl: string | undefined,
  outputPath: string,
  maxSec?: number,
): Promise<void> {
  const dir = path.dirname(outputPath);
  await mkdir(dir, { recursive: true });

  if (!audioUrl) {
    // Flux muxé (vidéo + audio dans le même fichier)
    console.log("[direct] downloading muxed stream...");
    const buf = await fetchToBuffer(videoUrl);
    const tmp = `${outputPath}.mux.part`;
    await writeFile(tmp, buf);
    try {
      try {
        await ffmpegCopy([tmp], outputPath, maxSec);
      } catch {
        await ffmpegReencode([tmp], outputPath, maxSec);
      }
    } finally {
      await unlink(tmp).catch(() => {});
    }
    console.log("[direct] muxed ok");
    return;
  }

  // Flux adaptatifs : télécharger vidéo + audio en parallèle puis muxer
  console.log("[direct] downloading adaptive streams (video + audio) in parallel...");
  const [videoBuf, audioBuf] = await Promise.all([
    fetchToBuffer(videoUrl),
    fetchToBuffer(audioUrl),
  ]);

  const tmpVideo = `${outputPath}.video.part`;
  const tmpAudio = `${outputPath}.audio.part`;
  await Promise.all([writeFile(tmpVideo, videoBuf), writeFile(tmpAudio, audioBuf)]);

  try {
    try {
      await ffmpegCopy([tmpVideo, tmpAudio], outputPath, maxSec);
    } catch {
      await ffmpegReencode([tmpVideo, tmpAudio], outputPath, maxSec);
    }
  } finally {
    await Promise.all([unlink(tmpVideo).catch(() => {}), unlink(tmpAudio).catch(() => {})]);
  }
  console.log("[direct] adaptive ok");
}
