import { execFile } from "child_process";
import { promisify } from "util";
import { access, unlink, writeFile } from "fs/promises";

const exec = promisify(execFile);

/**
 * Cobalt API endpoints.
 * L'instance officielle (api.cobalt.tools) exige désormais un JWT via COBALT_API_KEY.
 * Si COBALT_API_KEY est défini, on l'utilise en premier.
 * Sinon on ne tente que les instances communautaires sans auth.
 */
function getCobaltEndpoints(): string[] {
  const key = process.env.COBALT_API_KEY?.trim();
  if (key) {
    // Avec une clé, l'instance officielle fonctionne
    return ["https://api.cobalt.tools/"];
  }
  // Sans clé : instances communautaires sans authentification
  return [
    "https://cobalt.seodei.hackclub.app/",
    "https://cobalt.api.bato.nu/",
  ];
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

type CobaltPicker = { url: string; type?: string };

type CobaltResponse = {
  status?: string;
  url?: string;
  text?: string;
  picker?: CobaltPicker[];
  audio?: string;
  error?: { code?: string };
};

async function requestCobalt(watchUrl: string): Promise<CobaltResponse | null> {
  const key = process.env.COBALT_API_KEY?.trim();
  const endpoints = getCobaltEndpoints();

  const body = {
    url: watchUrl,
    videoQuality: "1080",
    youtubeVideoCodec: "h264",
    downloadMode: "auto",
    filenameStyle: "basic",
  };

  for (const endpoint of endpoints) {
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
      };
      if (key) {
        headers["Authorization"] = `Api-Key ${key}`;
      }

      const r = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(45_000),
      });

      if (!r.ok) {
        const errBody = await r.text().catch(() => "");
        console.warn("[cobalt] endpoint error", endpoint, r.status, errBody.slice(0, 120));
        continue;
      }

      const data = (await r.json()) as CobaltResponse;
      const status = data.status;
      if (status === "error" || status === "rate-limit") {
        console.warn("[cobalt] api error", endpoint, data.error?.code ?? data.text);
        continue;
      }
      // stream / redirect / tunnel → URL directe
      if (data.url) return data;
      // picker → plusieurs options, on prend la première vidéo
      if (status === "picker" && data.picker?.[0]?.url) {
        return { ...data, url: data.picker[0].url };
      }
    } catch (e) {
      console.warn("[cobalt] fetch error", endpoint, String(e).slice(0, 100));
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
      ["-y", ...t, "-i", tmp, "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
        "-c:a", "aac", "-movflags", "+faststart", outputPath],
      { timeout: 600_000, maxBuffer: 8 * 1024 * 1024 },
    );
  } finally {
    await unlink(tmp).catch(() => {});
  }

  await access(outputPath);
}

/** Téléchargement via API Cobalt. Nécessite COBALT_API_KEY pour l'instance officielle. */
export async function downloadViaCobalt(
  youtubeId: string,
  outputPath: string,
  maxSec?: number,
): Promise<void> {
  const key = process.env.COBALT_API_KEY?.trim();
  if (!key && getCobaltEndpoints().length === 0) {
    throw new Error("Cobalt non configuré (COBALT_API_KEY manquant)");
  }

  const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
  const res = await requestCobalt(watchUrl);
  if (!res?.url) {
    throw new Error(res?.text ?? "Cobalt indisponible");
  }
  console.log("[cobalt] stream", youtubeId, res.status);
  await downloadUrlToFile(res.url, outputPath, maxSec);
  console.log("[cobalt] ok", youtubeId);
}
