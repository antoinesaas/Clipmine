/** Extrait un extrait de transcription depuis les sous-titres YouTube publics (si dispo). */
export async function fetchTranscriptSnippet(videoId: string, maxLen = 220): Promise<string | null> {
  try {
    const page = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
      },
      next: { revalidate: 86400 },
    });
    if (!page.ok) return null;

    const html = await page.text();
    const tracksMatch = html.match(/"captionTracks":(\[[^\]]+\])/);
    if (!tracksMatch) return null;

    const tracks = JSON.parse(tracksMatch[1].replace(/\\u0026/g, "&")) as {
      baseUrl?: string;
      languageCode?: string;
    }[];

    const track =
      tracks.find((t) => t.languageCode?.startsWith("fr")) ??
      tracks.find((t) => t.languageCode?.startsWith("en")) ??
      tracks[0];

    if (!track?.baseUrl) return null;

    const cap = await fetch(track.baseUrl);
    if (!cap.ok) return null;
    const xml = await cap.text();

    const lines = [...xml.matchAll(/<text[^>]*>([^<]*)<\/text>/g)]
      .map((m) =>
        m[1]
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .trim()
      )
      .filter(Boolean);

    if (!lines.length) return null;
    const text = lines.slice(0, 6).join(" ");
    return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
  } catch {
    return null;
  }
}
