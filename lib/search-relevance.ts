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
    .replace(/\b(movie|film|scene|scenes|4k|clip|clips|official|hd|pack|edit|edits)\b/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/** Score de pertinence — plus haut = meilleur pour éditeurs TikTok. */
export function clipRelevanceScore(clip: RelevanceInput, query: string, filmSearch: boolean): number {
  const hay = `${clip.title} ${clip.movie} ${clip.channel}`.toLowerCase();
  const tokens = queryTokens(query);
  let s = clip.viralScore;

  if (EDIT_SOURCE_RE.test(hay)) s += 55;
  if (EDIT_READY_CHANNEL_RE.test(clip.channel)) s += 28;
  if (/movieclips/i.test(clip.channel)) s += 35;
  if (clip.is4K || /\b4k|2160|uhd|imax\b/i.test(hay)) s += 14;

  if (tokens.length) {
    const matched = tokens.filter((w) => hay.includes(w)).length;
    s += matched * 22;
    if (matched === tokens.length) s += 25;
  }

  if (filmSearch && KNOWN_FILM_TITLES.test(hay)) s += 18;
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
  return [...results].sort(
    (a, b) => clipRelevanceScore(b, query, filmSearch) - clipRelevanceScore(a, query, filmSearch),
  );
}
