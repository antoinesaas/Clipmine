import { downloadViaCobalt } from "./cobalt-download.js";
import { downloadViaStreamFallback } from "./stream-fallback.js";
import { downloadYoutubeYtdlp } from "./ytdlp.js";

const MAX_SEC = Number(process.env.MAX_CLIP_SEC ?? 180);

/** Chaîne de téléchargement : Cobalt → Piped/Invidious → yt-dlp */
export async function downloadYoutubeMp4(youtubeId: string, outputPath: string): Promise<void> {
  const errors: string[] = [];
  const maxSec = MAX_SEC > 0 ? MAX_SEC : undefined;

  const attempts: Array<{ label: string; run: () => Promise<void> }> = [
    { label: "cobalt", run: () => downloadViaCobalt(youtubeId, outputPath, maxSec) },
    { label: "piped-invidious", run: () => downloadViaStreamFallback(youtubeId, outputPath, maxSec) },
    { label: "yt-dlp", run: () => downloadYoutubeYtdlp(youtubeId, outputPath) },
  ];

  for (const { label, run } of attempts) {
    try {
      await run();
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${label}: ${msg.slice(0, 120)}`);
      console.warn("[download] fail", label, msg.slice(0, 200));
    }
  }

  throw new Error(
    "Impossible de récupérer ce clip. Colle un lien YouTube direct ou essaie un autre clip.",
  );
}
