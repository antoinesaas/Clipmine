import { PRIME_AFFILIATE_URL } from "./constants";

const BUY_MOVIE_RE = /\bBUY\s+THE\s+MOVIE\b/gi;

/** Nettoie les descriptions type Movieclips. */
export function cleanTranscript(text: string): string {
  return text
    .replace(BUY_MOVIE_RE, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function hasBuyMovieCta(text: string): boolean {
  return BUY_MOVIE_RE.test(text);
}

const PRIME_CHANNEL_RE =
  /movieclips|warner|universal|sony pictures|paramount|mgm|lionsgate|official clips|fandango/i;

/** Affiche le bouton Prime (film / studio officiel). */
export function shouldShowPrimeBuy(clip: {
  channel?: string;
  movie?: string;
  title?: string;
  transcript?: string;
  quote?: string;
  type?: string;
}): boolean {
  const raw = clip.transcript ?? clip.quote ?? "";
  if (hasBuyMovieCta(raw)) return true;
  if (PRIME_CHANNEL_RE.test(clip.channel ?? "")) return true;
  if (clip.type === "film" && clip.movie && clip.movie !== "YouTube") return true;
  if (/\(\d{4}\)/.test(clip.title ?? "") || /\(\d{4}\)/.test(clip.movie ?? "")) return true;
  return false;
}

export function primeAffiliateUrl(): string {
  return PRIME_AFFILIATE_URL;
}
