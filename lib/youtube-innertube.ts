/**
 * YouTube InnerTube API — extraction des URLs de stream côté serveur.
 * Appelé depuis Vercel avant de dispatcher au worker Fly.io.
 * Si YT_COOKIES_BASE64 est défini, les requêtes sont authentifiées avec
 * la session YouTube de l'admin → contourne les restrictions IP datacenter.
 */

import { createHash } from "crypto";

export type YouTubeStreams = {
  videoUrl: string;
  audioUrl?: string;
};

type InnerTubeFormat = {
  url?: string;
  mimeType?: string;
  height?: number;
  bitrate?: number;
  qualityLabel?: string;
  contentLength?: string;
  approxDurationMs?: string;
};

type InnerTubeResponse = {
  streamingData?: {
    formats?: InnerTubeFormat[];
    adaptiveFormats?: InnerTubeFormat[];
  };
  videoDetails?: {
    videoId?: string;
    title?: string;
    isPrivate?: boolean;
  };
  playabilityStatus?: {
    status?: string;
    reason?: string;
  };
};

const INNERTUBE_CLIENTS = [
  // ANDROID_VR : pas de PO token requis, très fiable depuis datacenter
  {
    clientName: "ANDROID_VR",
    clientVersion: "1.60.19",
    androidSdkVersion: 32,
    clientNameId: "28",
  },
  // TV_EMBEDDED : très peu restreint, fonctionne sans PO token
  {
    clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER",
    clientVersion: "2.0",
    clientNameId: "85",
  },
  // ANDROID : URLs directes non-chiffrées
  {
    clientName: "ANDROID",
    clientVersion: "18.11.34",
    androidSdkVersion: 30,
    clientNameId: "3",
  },
  // ANDROID_TESTSUITE : contourne certaines restrictions
  {
    clientName: "ANDROID_TESTSUITE",
    clientVersion: "1.9",
    androidSdkVersion: 30,
    clientNameId: "30",
  },
  // IOS : client mobile avec URLs directes
  {
    clientName: "IOS",
    clientVersion: "18.09.2",
    clientNameId: "5",
  },
  // MWEB : mobile web, formats muxés
  {
    clientName: "MWEB",
    clientVersion: "2.20241202.07.00",
    clientNameId: "2",
  },
  // WEB_EMBEDDED_PLAYER : player embarqué, moins restreint
  {
    clientName: "WEB_EMBEDDED_PLAYER",
    clientVersion: "2.20241202.00.00",
    clientNameId: "56",
  },
];

/** Parse le format Netscape cookies.txt → objet { nom: valeur } */
function parseCookieTxt(raw: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    if (line.startsWith("#") || !line.trim()) continue;
    const parts = line.split("\t");
    // Format: domain \t flag \t path \t secure \t expiry \t name \t value
    if (parts.length >= 7 && parts[0].includes("youtube.com")) {
      const name = parts[5]?.trim();
      const value = parts[6]?.trim();
      if (name && value) cookies[name] = value;
    }
  }
  return cookies;
}

/** Construit les headers d'auth à partir de YT_COOKIES_BASE64 (si dispo). */
function buildAuthHeaders(): Record<string, string> {
  const b64 = process.env.YT_COOKIES_BASE64?.trim();
  if (!b64) return {};
  try {
    const raw = Buffer.from(b64, "base64").toString("utf8");
    const cookies = parseCookieTxt(raw);
    const sapisid = cookies["__Secure-1PAPISID"] ?? cookies["SAPISID"];
    if (!sapisid) return {};

    // Cookie header — toutes les cookies youtube.com
    const cookieHeader = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");

    // SAPISIDHASH : signature HMAC-SHA1 standard de YouTube
    const ts = Math.floor(Date.now() / 1000);
    const hash = createHash("sha1")
      .update(`${ts} ${sapisid} https://www.youtube.com`)
      .digest("hex");

    return {
      Cookie: cookieHeader,
      Authorization: `SAPISIDHASH ${ts}_${hash}`,
      "X-Goog-AuthUser": "0",
      "X-Origin": "https://www.youtube.com",
    };
  } catch (e) {
    console.warn("[innertube] buildAuthHeaders error:", String(e).slice(0, 100));
    return {};
  }
}

async function fetchInnerTube(
  videoId: string,
  client: (typeof INNERTUBE_CLIENTS)[0],
): Promise<InnerTubeResponse | null> {
  try {
    const body: Record<string, unknown> = {
      videoId,
      context: {
        client: {
          clientName: client.clientName,
          clientVersion: client.clientVersion,
          ...(client.androidSdkVersion ? { androidSdkVersion: client.androidSdkVersion } : {}),
          hl: "en",
          gl: "US",
          platform: client.clientName.startsWith("IOS") ? "MOBILE" : "TV",
        },
      },
    };

    const authHeaders = buildAuthHeaders();
    const hasAuth = Boolean(authHeaders.Cookie);

    const res = await fetch(
      `https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-YouTube-Client-Name": client.clientNameId,
          "X-YouTube-Client-Version": client.clientVersion,
          "User-Agent":
            client.clientName === "IOS"
              ? "com.google.ios.youtube/18.09.2 (iPhone; CPU iPhone OS 16_0 like Mac OS X)"
              : "com.google.android.youtube/18.11.34(Linux; U; Android 12; GB) gzip",
          Origin: "https://www.youtube.com",
          Referer: "https://www.youtube.com/",
          ...authHeaders,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20_000),
      },
    );

    if (!res.ok) {
      console.warn(`[innertube] ${client.clientName} HTTP ${res.status} for ${videoId} (auth=${hasAuth})`);
      return null;
    }
    const data = (await res.json()) as InnerTubeResponse;
    if (!data.streamingData) {
      console.warn(
        `[innertube] ${client.clientName} no streamingData for ${videoId} (auth=${hasAuth}) — status: ${data.playabilityStatus?.status ?? "?"} ${data.playabilityStatus?.reason?.slice(0, 120) ?? ""}`,
      );
    }
    return data;
  } catch (e) {
    console.warn(`[innertube] ${client.clientName} fetch error for ${videoId}:`, String(e).slice(0, 150));
    return null;
  }
}

function pickBestStreams(data: InnerTubeResponse): YouTubeStreams | null {
  const streaming = data.streamingData;
  if (!streaming) return null;

  const formats: InnerTubeFormat[] = [...(streaming.formats ?? [])];
  const adaptive: InnerTubeFormat[] = [...(streaming.adaptiveFormats ?? [])];

  // 1. Formats muxés mp4 (vidéo + audio ensemble)
  const muxedMp4 = formats
    .filter((f) => f.url && f.mimeType?.includes("video/mp4") && f.height)
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));

  if (muxedMp4[0]?.url) {
    console.log("[innertube] muxed mp4", muxedMp4[0].height, muxedMp4[0].qualityLabel);
    return { videoUrl: muxedMp4[0].url };
  }

  // 2. Adaptatifs : meilleure vidéo mp4 + meilleur audio
  const videoMp4 = adaptive
    .filter((f) => f.url && f.mimeType?.startsWith("video/mp4"))
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));

  const audioStreams = adaptive
    .filter((f) => f.url && f.mimeType?.startsWith("audio/"))
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));

  if (videoMp4[0]?.url) {
    console.log("[innertube] adaptive", videoMp4[0].height, "px +", audioStreams[0]?.mimeType);
    return { videoUrl: videoMp4[0].url, audioUrl: audioStreams[0]?.url };
  }

  // 3. N'importe quel format vidéo
  const anyVideo = [...formats, ...adaptive]
    .filter((f) => f.url && f.mimeType?.startsWith("video/"))
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));

  if (anyVideo[0]?.url) return { videoUrl: anyVideo[0].url };

  return null;
}

/**
 * Extrait les URLs de stream YouTube via l'API InnerTube.
 * Si YT_COOKIES_BASE64 est défini (sur Vercel), les requêtes sont authentifiées.
 */
export async function extractYouTubeStreams(videoId: string): Promise<YouTubeStreams | null> {
  const hasAuth = Boolean(process.env.YT_COOKIES_BASE64?.trim());
  console.log(`[innertube] extracting ${videoId} (auth=${hasAuth})`);

  for (const client of INNERTUBE_CLIENTS) {
    const data = await fetchInnerTube(videoId, client);
    if (!data) continue;

    const status = data.playabilityStatus?.status;
    if (status && !["OK", "CONTENT_CHECK_REQUIRED"].includes(status)) {
      console.warn("[innertube]", client.clientName, "playability:", status, data.playabilityStatus?.reason);
      continue;
    }

    const streams = pickBestStreams(data);
    if (streams) {
      console.log("[innertube] ok via", client.clientName, videoId);
      return streams;
    }
  }

  console.warn("[innertube] no streams found for", videoId);
  return null;
}
