import { execFile } from "child_process";
import { promisify } from "util";
import { access, mkdir, readdir, rename, writeFile } from "fs/promises";
import path from "path";
import { downloadViaStreamFallback } from "./stream-fallback.js";

const exec = promisify(execFile);

const TMP = process.env.TMP_DIR ?? "/tmp/clipmine";
const COOKIES_PATH = path.join(TMP, "youtube-cookies.txt");

export function hasYoutubeCookies(): boolean {
  return Boolean(process.env.YT_COOKIES_BASE64?.trim() || process.env.YT_COOKIES_PATH?.trim());
}

async function ensureCookiesFile(): Promise<string | null> {
  const b64 = process.env.YT_COOKIES_BASE64?.trim();
  const filePath = process.env.YT_COOKIES_PATH?.trim();
  if (filePath) {
    try {
      await access(filePath);
      return filePath;
    } catch {
      /* ignore */
    }
  }
  if (b64) {
    try {
      await mkdir(TMP, { recursive: true });
      const raw = Buffer.from(b64, "base64").toString("utf8");
      if (!raw.includes("youtube.com") && !raw.includes("youtu.be")) {
        console.warn("[ytdlp] cookies invalid: missing youtube domain");
        return null;
      }
      await writeFile(COOKIES_PATH, raw, "utf8");
      return COOKIES_PATH;
    } catch {
      /* ignore */
    }
  }
  return null;
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function outputTemplate(finalPath: string): string {
  const dir = path.dirname(finalPath);
  const base = path.basename(finalPath, path.extname(finalPath));
  return path.join(dir, `${base}.%(ext)s`);
}

function poTokenArgs(): string[] {
  const token = process.env.YOUTUBE_PO_TOKEN?.trim();
  if (!token) return [];
  return ["--extractor-args", `youtube:po_token=${token}`];
}

function baseArgs(outputTemplatePath: string, url: string, cookies: string | null): string[] {
  const args = [
    "--user-agent",
    USER_AGENT,
    "--geo-bypass",
    "--extractor-retries",
    "4",
    "--retries",
    "6",
    "--fragment-retries",
    "6",
    "--socket-timeout",
    "90",
    "--no-playlist",
    "--no-warnings",
    "--referer",
    "https://www.youtube.com/",
    "--merge-output-format",
    "mp4",
    "--sleep-interval",
    "1",
    "--max-sleep-interval",
    "3",
    "-o",
    outputTemplatePath,
  ];
  if (cookies) args.push("--cookies", cookies);
  args.push(...poTokenArgs());
  args.push(url);
  return args;
}

type Strategy = { label: string; extra: string[]; format: string[] };

const STRATEGIES: Strategy[] = [
  {
    label: "best_any",
    extra: [],
    format: ["-f", "b/bv*+ba/best"],
  },
  {
    label: "simple_mp4",
    extra: [],
    format: ["-f", "best[ext=mp4][height<=1080]/best[height<=1080][ext=mp4]/best[height<=1080]"],
  },
  {
    label: "android_sdkless",
    extra: ["--extractor-args", "youtube:player_client=android_sdkless,web"],
    format: ["-f", "best[height<=1080]/best"],
  },
  {
    label: "android+web",
    extra: [
      "--extractor-args",
      "youtube:player_client=android,web,web_embedded;player_skip=webpage,configs",
    ],
    format: ["-f", "bv*[height<=1080]+ba/b[height<=1080]/best"],
  },
  {
    label: "android_creator",
    extra: ["--extractor-args", "youtube:player_client=android_creator,android"],
    format: ["-f", "best[height<=1080]/best"],
  },
  {
    label: "tv_embedded",
    extra: ["--extractor-args", "youtube:player_client=tv_embedded,web"],
    format: ["-f", "best[height<=1080]/best"],
  },
  {
    label: "ios",
    extra: ["--extractor-args", "youtube:player_client=ios"],
    format: ["-f", "best[ext=mp4]/best"],
  },
  {
    label: "mweb",
    extra: ["--extractor-args", "youtube:player_client=mweb"],
    format: ["-f", "best[height<=720]/best"],
  },
  {
    label: "fallback_any",
    extra: ["--extractor-args", "youtube:player_client=android"],
    format: ["-f", "bestvideo[height<=1080]+bestaudio/best"],
  },
];

async function runYtdlp(args: string[]): Promise<void> {
  try {
    await exec("yt-dlp", args, { timeout: 600_000, maxBuffer: 16 * 1024 * 1024 });
  } catch (e: unknown) {
    const err = e as { stderr?: string; stdout?: string; message?: string };
    const detail = [err.stderr, err.stdout, err.message].filter(Boolean).join("\n").trim();
    throw new Error(detail.slice(0, 900) || "yt-dlp a échoué");
  }
}

/** Après yt-dlp, le fichier peut être raw.webm / raw.mkv — on normalise vers raw.mp4 */
async function resolveDownloadedFile(dir: string, targetPath: string): Promise<string> {
  try {
    await access(targetPath);
    return targetPath;
  } catch {
    /* continue */
  }

  const base = path.basename(targetPath, path.extname(targetPath));
  const files = await readdir(dir);
  const match = files.find((f) => f.startsWith(`${base}.`) && !f.endsWith(".part"));
  if (!match) {
    throw new Error("Fichier téléchargé introuvable après yt-dlp.");
  }

  const found = path.join(dir, match);
  if (found !== targetPath) {
    await rename(found, targetPath);
  }
  return targetPath;
}

/** Téléchargement YouTube — multi-clients ; cookies Fly recommandés. */
export async function downloadYoutubeMp4(youtubeId: string, outputPath: string) {
  const url = `https://www.youtube.com/watch?v=${youtubeId}`;
  const cookies = await ensureCookiesFile();
  const errors: string[] = [];
  const dir = path.dirname(outputPath);
  const template = outputTemplate(outputPath);

  await mkdir(dir, { recursive: true });

  for (const strategy of STRATEGIES) {
    const args = [...baseArgs(template, url, cookies), ...strategy.extra, ...strategy.format];

    try {
      await runYtdlp(args);
      await resolveDownloadedFile(dir, outputPath);
      console.log("[ytdlp] ok", strategy.label, youtubeId, cookies ? "cookies" : "no-cookies");
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${strategy.label}: ${msg.slice(0, 200)}`);
      console.warn("[ytdlp] fail", strategy.label, msg.slice(0, 300));
    }
  }

  const joined = errors.join(" | ");
  console.warn("[ytdlp] all strategies failed, trying Piped/Invidious", youtubeId);

  try {
    const maxSec = Number(process.env.MAX_CLIP_SEC ?? 180);
    await downloadViaStreamFallback(youtubeId, outputPath, maxSec > 0 ? maxSec : undefined);
    return;
  } catch (fallbackErr) {
    const fbMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
    errors.push(`fallback: ${fbMsg.slice(0, 160)}`);
  }

  const botBlock = /bot|sign in|confirm|not a bot|login required/i.test(joined);
  throw new Error(
    botBlock
      ? "Impossible de récupérer ce clip (YouTube + repli). Essaie un autre lien ou une vidéo Movieclips."
      : "Téléchargement impossible (vidéo privée, région ou réseau).",
  );
}
