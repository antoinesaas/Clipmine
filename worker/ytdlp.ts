import { execFile } from "child_process";
import { promisify } from "util";
import { access, writeFile } from "fs/promises";
import path from "path";

const exec = promisify(execFile);

const TMP = process.env.TMP_DIR ?? "/tmp/clipmine";
const COOKIES_PATH = path.join(TMP, "youtube-cookies.txt");

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
  const args = [
    "--js-runtimes",
    "node",
    "--remote-components",
    "ejs:github",
    "--extractor-retries",
    "3",
    "--retries",
    "5",
    "--fragment-retries",
    "5",
    "--socket-timeout",
    "30",
    "--no-playlist",
    "--no-warnings",
    "--merge-output-format",
    "mp4",
    "-o",
    outputPath,
    url,
  ];
  return args;
}

type Strategy = { label: string; extra: string[]; format: string[] };

const STRATEGIES: Strategy[] = [
  {
    label: "android+embed",
    extra: ["--extractor-args", "youtube:player_client=android,web_embedded,tv_embedded;player_skip=webpage"],
    format: ["-f", "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]/best[ext=mp4]/best"],
  },
  {
    label: "android_vr",
    extra: ["--extractor-args", "youtube:player_client=android_vr"],
    format: ["-f", "best[height<=1080][ext=mp4]/best[ext=mp4]/best"],
  },
  {
    label: "tv",
    extra: ["--extractor-args", "youtube:player_client=tv_embedded"],
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
];

async function runYtdlp(args: string[]) {
  await exec("yt-dlp", args, { timeout: 600_000, maxBuffer: 12 * 1024 * 1024 });
}

/** Téléchargement YouTube — plusieurs clients + cookies optionnels (anti-bot Fly). */
export async function downloadYoutubeMp4(youtubeId: string, outputPath: string) {
  const url = `https://www.youtube.com/watch?v=${youtubeId}`;
  const cookies = await ensureCookiesFile();
  const errors: string[] = [];

  for (const strategy of STRATEGIES) {
    const args = [
      ...baseArgs(outputPath, url),
      ...strategy.extra,
      ...strategy.format,
    ];
    if (cookies) args.splice(1, 0, "--cookies", cookies);

    try {
      await runYtdlp(args);
      await access(outputPath);
      console.log("[ytdlp] ok", strategy.label, youtubeId);
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${strategy.label}: ${msg.slice(0, 120)}`);
      console.warn("[ytdlp] fail", strategy.label, msg.slice(0, 200));
    }
  }

  throw new Error(
    errors.some((x) => /bot|sign in|confirm/i.test(x))
      ? "YouTube anti-bot : ajoute des cookies (YT_COOKIES_BASE64) sur Fly ou réessaie un autre clip."
      : "Téléchargement YouTube impossible (vidéo indisponible ou réseau).",
  );
}
