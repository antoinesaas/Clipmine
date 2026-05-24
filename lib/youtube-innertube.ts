/**
 * YouTube InnerTube API — extraction des URLs de stream côté serveur.
 * Utilise le client ANDROID qui retourne des URLs directes (non chiffrées).
 * Appelé depuis Vercel avant de dispatcher au worker Fly.io.
 */

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
  // ANDROID : URLs directes, peu bloqué, idéal pour extraire
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
  // IOS : autre client mobile avec URLs directes
  {
    clientName: "IOS",
    clientVersion: "18.09.2",
    clientNameId: "5",
  },
  // TV_EMBEDDED : souvent moins restreint pour le contenu avec Content ID
  {
    clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER",
    clientVersion: "2.0",
    clientNameId: "85",
  },
];

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
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20_000),
      },
    );

    if (!res.ok) return null;
    return (await res.json()) as InnerTubeResponse;
  } catch {
    return null;
  }
}

function pickBestStreams(data: InnerTubeResponse): YouTubeStreams | null {
  const streaming = data.streamingData;
  if (!streaming) return null;

  const formats: InnerTubeFormat[] = [
    ...(streaming.formats ?? []),
  ];
  const adaptive: InnerTubeFormat[] = [
    ...(streaming.adaptiveFormats ?? []),
  ];

  // 1. Préférer les formats muxés mp4 (vidéo + audio ensemble)
  const muxedMp4 = formats
    .filter((f) => f.url && f.mimeType?.includes("video/mp4") && f.height)
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));

  if (muxedMp4[0]?.url) {
    console.log("[innertube] muxed mp4", muxedMp4[0].height, muxedMp4[0].qualityLabel);
    return { videoUrl: muxedMp4[0].url };
  }

  // 2. Formats adaptatifs : meilleure vidéo mp4 + meilleur audio
  const videoMp4 = adaptive
    .filter((f) => f.url && f.mimeType?.startsWith("video/mp4"))
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));

  const audioStreams = adaptive
    .filter((f) => f.url && f.mimeType?.startsWith("audio/"))
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));

  if (videoMp4[0]?.url) {
    console.log("[innertube] adaptive", videoMp4[0].height, "px +", audioStreams[0]?.mimeType);
    return {
      videoUrl: videoMp4[0].url,
      audioUrl: audioStreams[0]?.url,
    };
  }

  // 3. N'importe quel format vidéo avec URL directe
  const anyVideo = [...formats, ...adaptive]
    .filter((f) => f.url && f.mimeType?.startsWith("video/"))
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));

  if (anyVideo[0]?.url) {
    return { videoUrl: anyVideo[0].url };
  }

  return null;
}

/**
 * Extrait les URLs de stream YouTube via l'API InnerTube.
 * Retourne null si la vidéo est privée, supprimée, ou si toutes les tentatives échouent.
 */
export async function extractYouTubeStreams(videoId: string): Promise<YouTubeStreams | null> {
  for (const client of INNERTUBE_CLIENTS) {
    const data = await fetchInnerTube(videoId, client);
    if (!data) continue;

    // Vidéo non lisible (supprimée, privée, âge, etc.)
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
