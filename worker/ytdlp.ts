import { execFile } from "child_process";
import { promisify } from "util";
import { access, writeFile } from "fs/promises";
import path from "path";

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
      await writeFile(COOKIES_PATH, Buffer.from(b64, "base64"));
      return COOKIES_PATH;
    } catch {
      /* ignore */
    }
  }
  return null;
}

function baseArgs(outputPath: string, url: string): string[] {
  return [
    "--js-runtimes",
    "node",
    "--remote-components",
    "ejs:github",
    "--geo-bypass",
    "--extractor-retries",
    "4",
    "--retries",
    "6",
    "--fragment-retries",
    "6",
    "--socket-timeout",
    "45",
    "--no-playlist",
    "--no-warnings",
    "--referer",
    "https://www.youtube.com/",
    "--merge-output-format",
    "mp4",
    "-o",
    outputPath,
    url,
  ];
}

type Strategy = { label: string; extra: string[]; format: string[] };

const STRATEGIES: Strategy[] = [
  {
    label: "android+web",
    extra: [
      "--extractor-args",
      "youtube:player_client=android,web,web_embedded;player_skip=webpage,configs",
    ],
    format: ["-f", "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]/best[ext=mp4]/best"],
  },
  {
    label: "tv_embedded",
    extra: ["--extractor-args", "youtube:player_client=tv_embedded,web"],
    format: ["-f", "best[height<=1080][ext=mp4]/best[ext=mp4]/best"],
  },
  {
    label: "android_vr",
    extra: ["--extractor-args", "youtube:player_client=android_vr"],
    format: ["-f", "best[height<=1080][ext=mp4]/best"],
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
    format: ["-f", "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best"],
  },
];

async function runYtdlp(args: string[]) {
  await exec("yt-dlp", args, { timeout: 600_000, maxBuffer: 16 * 1024 * 1024 });
}

/** Téléchargement YouTube — multi-clients ; cookies Fly recommandés. */
export async function downloadYoutubeMp4(youtubeId: string, outputPath: string) {
  const url = `https://www.youtube.com/watch?v=${youtubeId}`;
  const cookies = await ensureCookiesFile();
  const errors: string[] = [];

  for (const strategy of STRATEGIES) {
    const args = [...baseArgs(outputPath, url), ...strategy.extra, ...strategy.format];
    if (cookies) args.splice(1, 0, "--cookies", cookies);

    try {
      await runYtdlp(args);
      await access(outputPath);
      console.log("[ytdlp] ok", strategy.label, youtubeId, cookies ? "cookies" : "no-cookies");
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${strategy.label}: ${msg.slice(0, 160)}`);
      console.warn("[ytdlp] fail", strategy.label, msg.slice(0, 240));
    }
  }

  const botBlock = errors.some((x) => /bot|sign in|confirm|not a bot/i.test(x));
  throw new Error(
    botBlock
      ? cookies
        ? "YouTube bloque encore ce clip. Essaie un autre extrait ou régénère les cookies."
        : "YouTube bloque le téléchargement : configure YT_COOKIES_BASE64 sur Fly (cookies navigateur)."
      : "Téléchargement impossible (vidéo privée, région ou réseau).",
  );
}
