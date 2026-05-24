import { execFile } from "child_process";
import { promisify } from "util";
import { access, unlink, writeFile } from "fs/promises";

const exec = promisify(execFile);

const COBALT_ENDPOINTS = [
  "https://api.cobalt.tools/api/json",
  "https://api.cobalt.tools/",
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

type CobaltResponse = {
  status?: string;
  url?: string;
  text?: string;
};

async function requestCobalt(watchUrl: string): Promise<CobaltResponse | null> {
  const body = {
    url: watchUrl,
    videoQuality: "1080",
    youtubeVideoCodec: "h264",
    downloadMode: "auto",
    filenameStyle: "basic",
  };

  for (const endpoint of COBALT_ENDPOINTS) {
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": USER_AGENT,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(45_000),
      });
      if (!r.ok) continue;
      const data = (await r.json()) as CobaltResponse;
      if (data.status === "error" || data.status === "rate-limit") continue;
      if (data.url) return data;
    } catch {
      /* next endpoint */
    }
  }
  return null;
}

async function downloadUrlToFile(fileUrl: string, outputPath: string, maxSec?: number): Promise<void> {
  const r = await fetch(fileUrl, {
    headers: {
      "User-Agent": USER_AGENT,
      Referer: "https://www.youtube.com/",
    },
    signal: AbortSignal.timeout(600_000),
  });
  if (!r.ok) {
    throw new Error(`HTTP ${r.status} sur le flux vidéo`);
  }

  const t = maxSec && maxSec > 0 ? ["-t", String(maxSec)] : [];
  const tmp = `${outputPath}.part`;
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(tmp, buf);

  try {
    await exec(
      "ffmpeg",
      ["-y", ...t, "-i", tmp, "-c", "copy", "-movflags", "+faststart", outputPath],
      { timeout: 600_000, maxBuffer: 8 * 1024 * 1024 },
    );
  } catch {
    await exec(
      "ffmpeg",
      [
        "-y",
        ...t,
        "-i",
        tmp,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "20",
        "-c:a",
        "aac",
        "-movflags",
        "+faststart",
        outputPath,
      ],
      { timeout: 600_000, maxBuffer: 8 * 1024 * 1024 },
    );
  } finally {
    await unlink(tmp).catch(() => {});
  }

  await access(outputPath);
}

/** Téléchargement via API Cobalt (souvent fiable quand yt-dlp est bloqué). */
export async function downloadViaCobalt(
  youtubeId: string,
  outputPath: string,
  maxSec?: number,
): Promise<void> {
  const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
  const res = await requestCobalt(watchUrl);
  if (!res?.url) {
    throw new Error(res?.text ?? "Cobalt indisponible");
  }
  console.log("[cobalt] stream", youtubeId, res.status);
  await downloadUrlToFile(res.url, outputPath, maxSec);
  console.log("[cobalt] ok", youtubeId);
}
