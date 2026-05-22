import { execFile } from "child_process";
import { promisify } from "util";
import { access } from "fs/promises";

const exec = promisify(execFile);

/** Téléchargement YouTube résistant aux IP datacenter (Fly.io). */
export async function downloadYoutubeMp4(youtubeId: string, outputPath: string) {
  const url = `https://www.youtube.com/watch?v=${youtubeId}`;
  const args = [
    "--js-runtimes",
    "node",
    "--extractor-args",
    "youtube:player_client=android,web_embedded;player_skip=webpage",
    "-f",
    "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]/best[ext=mp4]/best",
    "--merge-output-format",
    "mp4",
    "--no-playlist",
    "--no-warnings",
    "--retries",
    "3",
    "--fragment-retries",
    "3",
    "-o",
    outputPath,
    url,
  ];

  try {
    await exec("yt-dlp", args, { timeout: 600_000, maxBuffer: 8 * 1024 * 1024 });
  } catch (e) {
    // Fallback client iOS (souvent moins bloqué)
    const fallback = [
      "--extractor-args",
      "youtube:player_client=ios",
      "-f",
      "best[ext=mp4]/best",
      "--merge-output-format",
      "mp4",
      "--no-playlist",
      "-o",
      outputPath,
      url,
    ];
    await exec("yt-dlp", fallback, { timeout: 600_000, maxBuffer: 8 * 1024 * 1024 });
  }

  try {
    await access(outputPath);
  } catch {
    throw new Error("Téléchargement YouTube impossible (blocage bot ou vidéo indisponible).");
  }
}
