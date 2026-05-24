import { EDIT_SOURCE_RE, KNOWN_FILM_TITLES } from "@/lib/film-filter";

export const EDIT_READY_CHANNEL_RE =
  /movieclips|scene\s*pack|clips?\s*for|edit|footage|cinematic|4k\s*hdr|imax|warner|universal|sony|paramount|hbo|netflix/i;

/** Déjà monté pour TikTok — moins utile comme source. */
const ALREADY_EDITED_RE =
  /\b(tiktok\s+version|for\s+tiktok|for\s+reels|with\s+lyrics\s+on\s+screen|lyric\s+edit|capcut\s+edit|fan\s+edit\s+comp|sped\s+up|nightcore|status\s+video)\b/i;

export type RelevanceInput = {
  title: string;
  movie: string;
  channel: string;
  views: number;
  viralScore: number;
  is4K?: boolean;
};

export function queryTokens(q: string): string[] {
  return q
    .trim()
    .toLowerCase()
    .replace(/\b(movie|film|scene|scenes|4k|clip|clips|official|hd|pack|edit|edits|scene pack|movieclips)\b/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function tokenMatchCount(hay: string, tokens: string[]): number {
  return tokens.filter((w) => hay.includes(w)).length;
}

/** Score de pertinence — plus haut = meilleur pour éditeurs TikTok. */
export function clipRelevanceScore(clip: RelevanceInput, query: string, filmSearch: boolean): number {
  const titleHay = `${clip.title} ${clip.movie}`.toLowerCase();
  const hay = `${titleHay} ${clip.channel}`.toLowerCase();
  const tokens = queryTokens(query);
  let s = Math.min(clip.viralScore, 85);

  if (tokens.length) {
    const matchedAll = tokenMatchCount(hay, tokens);
    const matchedTitle = tokenMatchCount(titleHay, tokens);

    if (matchedAll === 0) return -999;

    s += matchedAll * 32;
    s += matchedTitle * 28;

    if (matchedAll === tokens.length) s += 55;
    if (matchedTitle === tokens.length) s += 70;

    if (tokens.length >= 2 && matchedTitle < tokens.length) {
      s -= (tokens.length - matchedTitle) * 45;
    }

    if (tokens.length >= 1 && clip.title.toLowerCase().startsWith(tokens[0]!)) s += 22;
    if (tokens.length >= 2 && titleHay.includes(tokens.join(" "))) s += 90;
  }

  if (EDIT_SOURCE_RE.test(hay)) s += 55;
  if (EDIT_READY_CHANNEL_RE.test(clip.channel)) s += 28;
  if (/movieclips/i.test(clip.channel)) s += 38;
  if (clip.is4K || /\b4k|2160|uhd|imax\b/i.test(hay)) s += 12;

  if (filmSearch && tokens.length) {
    const franchiseHit = tokens.some((t) => t.length > 3 && KNOWN_FILM_TITLES.test(t) && hay.includes(t));
    if (franchiseHit) s += 15;
  }

  if (/\b(scene|clip|trailer|fight|moment|extended)\b/i.test(clip.title)) s += 8;

  if (ALREADY_EDITED_RE.test(hay)) s -= 45;
  if (/\b(reaction|review|explained|breakdown|podcast|interview|behind the scenes)\b/i.test(hay)) s -= 35;
  if (/\b(lyric video|lyrics video|official audio|music video|vevo)\b/i.test(hay)) s -= 50;
  if (/#shorts\b/i.test(hay) || /\bshorts\b/i.test(clip.title)) s -= 40;

  return s;
}

export function sortByRelevance<T extends RelevanceInput>(
  results: T[],
  query: string,
  filmSearch: boolean,
): T[] {
  const scored = results.map((r) => ({
    r,
    score: clipRelevanceScore(r, query, filmSearch),
  }));

  const filtered = scored.filter((x) => x.score > -500);
  const pool = filtered.length ? filtered : scored;

  return pool
    .sort((a, b) => b.score - a.score)
    .map((x) => x.r);
}
