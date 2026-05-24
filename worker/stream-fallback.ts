import { execFile } from "child_process";
import { promisify } from "util";
import { access } from "fs/promises";

const exec = promisify(execFile);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/** Instances Piped / Invidious publiques (repli si yt-dlp bloqué par YouTube). */
const PIPED_BASES = [
  "https://pipedapi.adminforge.de",
  "https://api.piped.yt",
  "https://pipedapi.in.projectsegfau.lt",
  "https://piped-api.garudalinux.org",
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.tokhmi.xyz",
  "https://pipedapi.moomoo.me",
];

const INVIDIOUS_BASES = [
  "https://inv.nadeko.net",
  "https://yewtu.be",
  "https://invidious.privacyredirect.com",
  "https://invidious.fdn.fr",
  "https://yt.artemislena.eu",
  "https://invidious.protokolla.fi",
  "https://invidious.perennialte.ch",
  "https://inv.riverside.rocks",
];

type StreamPick = { videoUrl: string; audioUrl?: string; label: string };

function qualityScore(q: string | undefined): number {
  if (!q) return 0;
  const m = q.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(35_000),
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

function pickFromPiped(data: Record<string, unknown>): StreamPick | null {
  const videos = (data.videoStreams as Array<Record<string, unknown>>) ?? [];
  const audios = (data.audioStreams as Array<Record<string, unknown>>) ?? [];

  const muxed = videos
    .filter((s) => s.url && s.videoOnly === false)
    .sort((a, b) => qualityScore(String(b.quality)) - qualityScore(String(a.quality)))[0];
  if (muxed?.url) {
    return { videoUrl: String(muxed.url), label: "piped-muxed" };
  }

  const video = videos
    .filter((s) => s.url && s.videoOnly === true)
    .sort((a, b) => qualityScore(String(b.quality)) - qualityScore(String(a.quality)))[0];
  const audio = audios
    .filter((s) => s.url)
    .sort((a, b) => qualityScore(String(b.quality)) - qualityScore(String(a.quality)))[0];

  if (video?.url && audio?.url) {
    return {
      videoUrl: String(video.url),
      audioUrl: String(audio.url),
      label: "piped-separate",
    };
  }
  return null;
}

function pickFromInvidious(data: Record<string, unknown>): StreamPick | null {
  const streams = (data.formatStreams as Array<Record<string, unknown>>) ?? [];
  const adaptive = (data.adaptiveFormats as Array<Record<string, unknown>>) ?? [];

  const mp4 = streams
    .filter((s) => s.url && String(s.type ?? "").includes("video"))
    .sort((a, b) => qualityScore(String(b.quality)) - qualityScore(String(a.quality)))[0];
  if (mp4?.url) {
    return { videoUrl: String(mp4.url), label: "invidious-muxed" };
  }

  const video = adaptive
    .filter((s) => s.url && String(s.type ?? "").startsWith("video/"))
    .sort((a, b) => qualityScore(String(b.quality)) - qualityScore(String(a.quality)))[0];
  const audio = adaptive
    .filter((s) => s.url && String(s.type ?? "").startsWith("audio/"))
    .sort((a, b) => qualityScore(String(b.quality)) - qualityScore(String(a.quality)))[0];

  if (video?.url && audio?.url) {
    return {
      videoUrl: String(video.url),
      audioUrl: String(audio.url),
      label: "invidious-separate",
    };
  }
  return null;
}

async function resolveStream(youtubeId: string): Promise<StreamPick | null> {
  for (const base of PIPED_BASES) {
    const data = await fetchJson(`${base}/streams/${youtubeId}`);
    if (data && typeof data === "object") {
      const pick = pickFromPiped(data as Record<string, unknown>);
      if (pick) return { ...pick, label: `${pick.label}@${base}` };
    }
  }

  for (const base of INVIDIOUS_BASES) {
    const data = await fetchJson(`${base}/api/v1/videos/${youtubeId}`);
    if (data && typeof data === "object") {
      const pick = pickFromInvidious(data as Record<string, unknown>);
      if (pick) return { ...pick, label: `${pick.label}@${base}` };
    }
  }

  return null;
}

async function ffmpegFetch(
  pick: StreamPick,
  outputPath: string,
  maxSec?: number,
): Promise<void> {
  const t = maxSec && maxSec > 0 ? ["-t", String(maxSec)] : [];

  const ua = ["-user_agent", USER_AGENT];

  if (pick.audioUrl) {
    await exec(
      "ffmpeg",
      [
        "-y",
        ...ua,
        ...t,
        "-i",
        pick.videoUrl,
        "-i",
        pick.audioUrl,
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "20",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-movflags",
        "+faststart",
        "-shortest",
        outputPath,
      ],
      { timeout: 600_000, maxBuffer: 8 * 1024 * 1024 },
    );
    return;
  }

  await exec(
    "ffmpeg",
    [
      "-y",
      ...ua,
      ...t,
      "-i",
      pick.videoUrl,
      "-c",
      "copy",
      "-movflags",
      "+faststart",
      outputPath,
    ],
    { timeout: 600_000, maxBuffer: 8 * 1024 * 1024 },
  );
}

/** Télécharge via Piped/Invidious quand yt-dlp est bloqué. */
export async function downloadViaStreamFallback(
  youtubeId: string,
  outputPath: string,
  maxSec?: number,
): Promise<void> {
  const pick = await resolveStream(youtubeId);
  if (!pick) {
    throw new Error("Aucun flux alternatif disponible (Piped/Invidious).");
  }
  console.log("[stream-fallback] try", pick.label, youtubeId);
  await ffmpegFetch(pick, outputPath, maxSec);
  await access(outputPath);
  console.log("[stream-fallback] ok", pick.label, youtubeId);
}
