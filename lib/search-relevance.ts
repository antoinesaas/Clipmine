import { EDIT_SOURCE_RE } from "@/lib/film-filter";

export const EDIT_READY_CHANNEL_RE =
  /movieclips|scene\s*pack|clips?\s*for|edit|footage|cinematic|4k\s*hdr|imax|warner|universal|sony|paramount|hbo|netflix/i;

const ALREADY_EDITED_RE =
  /\b(tiktok\s+version|for\s+tiktok|for\s+reels|with\s+lyrics\s+on\s+screen|lyric\s+edit|capcut\s+edit|fan\s+edit\s+comp|sped\s+up|nightcore|status\s+video)\b/i;

const LOW_QUALITY_RE =
  /\b(mega\.nz|mega link|workprint|hdcam|camrip|telecine|ts version|dvdrip)\b/i;

const WRONG_FRANCHISE_RE: [RegExp, RegExp][] = [
  [/\bbreaking\s+bad\b/i, /\b(bad guys|breaking dawn|breaking point)\b/i],
  [/\bharry\s+potter\b/i, /\b(harry styles|potter county)\b/i],
  [/\bdark\s+knight\b/i, /\b(knight and day|knight rider)\b/i],
];

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
    .replace(/\b(movie|film|scene|scenes|4k|clip|clips|official|hd|pack|edit|edits|scene pack|movieclips|series|season)\b/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function tokenMatchCount(hay: string, tokens: string[]): number {
  return tokens.filter((w) => {
    if (w.length <= 3) {
      return new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(hay);
    }
    return hay.includes(w);
  }).length;
}

/** Score de pertinence — plus haut = meilleur pour éditeurs TikTok. */
export function clipRelevanceScore(clip: RelevanceInput, query: string, filmSearch: boolean): number {
  const titleHay = `${clip.title} ${clip.movie}`.toLowerCase();
  const hay = `${titleHay} ${clip.channel}`.toLowerCase();
  const tokens = queryTokens(query);
  const phrase = tokens.join(" ").trim();
  let s = Math.min(clip.viralScore, 80);

  if (LOW_QUALITY_RE.test(hay)) return -999;

  if (tokens.length) {
    const matchedAll = tokenMatchCount(hay, tokens);
    const matchedTitle = tokenMatchCount(titleHay, tokens);

    if (matchedAll === 0) return -999;

    s += matchedAll * 34;
    s += matchedTitle * 30;

    if (phrase.length > 3 && titleHay.includes(phrase)) s += 100;
    if (matchedAll === tokens.length) s += 50;
    if (matchedTitle === tokens.length) s += 65;

    if (tokens.length >= 2 && matchedTitle < tokens.length) {
      s -= (tokens.length - matchedTitle) * 55;
    }
  }

  for (const [want, wrong] of WRONG_FRANCHISE_RE) {
    if (want.test(query) && wrong.test(hay) && !want.test(hay)) s -= 120;
  }

  if (EDIT_SOURCE_RE.test(hay)) s += 58;
  if (EDIT_READY_CHANNEL_RE.test(clip.channel)) s += 26;
  if (/movieclips/i.test(clip.channel)) s += 36;
  if (clip.is4K || /\b4k|2160|uhd|imax\b/i.test(hay)) s += 14;
  if (/\b1080p|1440p|2160p|uhd\b/i.test(hay)) s += 6;

  if (/\b(scene|clip|trailer|fight|moment|extended)\b/i.test(clip.title)) s += 8;

  if (ALREADY_EDITED_RE.test(hay)) s -= 45;
  if (/\b(reaction|review|explained|breakdown|podcast)\b/i.test(hay)) s -= 35;
  if (/\b(lyric video|lyrics video|official audio)\b/i.test(hay) && !/\bfor edits?\b/i.test(hay)) s -= 40;
  if (/#shorts\b/i.test(hay) || /\bshorts\b/i.test(clip.title)) s -= 40;

  if (filmSearch && clip.views < 5000 && !EDIT_SOURCE_RE.test(hay)) s -= 15;

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

  const filtered = scored.filter((x) => x.score > 0);
  const pool = filtered.length >= 3 ? filtered : scored.filter((x) => x.score > -500);

  return pool
    .sort((a, b) => b.score - a.score)
    .map((x) => x.r);
}
