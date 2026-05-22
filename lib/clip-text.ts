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

export function primeAffiliateUrl(): string {
  return PRIME_AFFILIATE_URL;
}
