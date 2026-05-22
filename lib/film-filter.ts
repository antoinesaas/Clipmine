export type MediaType = "film" | "series";

const SERIES_HINTS =
  /\b(série|series|season|saison|episode|épisode|ep\.|s\d{1,2}e\d{1,2}|tv show|breaking bad|game of thrones|stranger things|the office|squid game|peaky blinders|succession|euphoria|arcane)\b/i;

const BLOCKLIST =
  /\b(gameplay|reaction|unboxing|podcast|asmr|tutorial|how to|minecraft|fortnite|roblox|vlog\b)\b/i;

const EDIT_SHORTS_RE =
  /\b(#shorts|#short|#fyp|#fy|#edit|#edits|youtube shorts|yt shorts|tiktok edit|capcut|alight motion|premiere pro edit|after effects edit|fan edit|status video|shorts edit|vertical edit|sped up|slowed\+reverb|nightcore|lyric edit|audio swap|remix edit|edit comp|edit compilation)\b|\bshorts\b/i;

const ALREADY_EDITED_RE =
  /\b(edit audio|with lyrics on screen|tiktok version|for tiktok|for reels|for instagram|vertical crop|cropped for|phone edit|mobile edit)\b/i;

const FILM_HINTS =
  /\b(film|movie|cinema|cinéma|scene|scène|trailer|bande.?annonce|clip officiel|official clip|4k remaster|movieclips|warner|universal pictures)\b/i;

/** Titres films connus (une recherche « interstellar » = film, pas musique). */
export const KNOWN_FILM_TITLES =
  /\b(interstellar|inception|oppenheimer|dune|gladiator|avatar|matrix|batman|joker|harry potter|john wick|spider-?man|avengers|frozen|shrek|titanic|alien|predator|terminator|rocky|godfather|scarface|fight club|shawshank|forrest gump|dark knight|blade runner|mad max|top gun|mission impossible|jurassic|star wars|indiana jones|pirates|transformers|fast and furious)\b/i;

const MUSIC_IN_QUERY =
  /\b(song|album|lyrics|feat\.?|ft\.?|cover|remix|mv\b|music video|soundtrack|ost\b|official audio|piano|guitar cover|orchestra only)\b/i;

const MUSIC_VIDEO_RE =
  /\b(soundtrack|ost\b|theme song|official audio|lyric video|lyrics video|music video|vevo\b|audio only|full album|piano cover|orchestral cover)\b/i;

const MUSIC_CHANNEL_RE =
  /\b(official audio|topic|vevo|records|soundtrack|ost|music group|band\b|singer\b|musician)\b/i;

export function inferMediaType(title: string, channel = ""): MediaType {
  const hay = `${title} ${channel}`;
  if (SERIES_HINTS.test(hay)) return "series";
  return "film";
}

export function parseDurationSeconds(iso?: string): number | null {
  if (!iso || !iso.startsWith("PT")) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = Number(m[1] ?? 0);
  const min = Number(m[2] ?? 0);
  const s = Number(m[3] ?? 0);
  return h * 3600 + min * 60 + s;
}

export function isMusicVideo(title: string, channel = ""): boolean {
  const hay = `${title} ${channel}`;
  if (MUSIC_VIDEO_RE.test(hay)) return true;
  if (MUSIC_CHANNEL_RE.test(channel)) return true;
  if (/\b-\s*topic$/i.test(channel)) return true;
  return false;
}

export function isShortOrEditedClip(title: string, channel = "", durationSec?: number | null): boolean {
  const hay = `${title} ${channel}`.toLowerCase();
  if (EDIT_SHORTS_RE.test(hay) || ALREADY_EDITED_RE.test(hay)) return true;
  if (/#shorts/i.test(title)) return true;
  if (/\b\d{1,2}:\d{2}\b/.test(title) && /short|edit|tiktok|reel/i.test(hay)) return true;
  if (durationSec != null && durationSec > 0 && durationSec < 50) return true;
  if (durationSec != null && durationSec > 0 && durationSec <= 58 && /short/i.test(hay)) return true;
  return false;
}

/** Recherche artiste (Madison Beer…) — pas un titre de film seul. */
export function isArtistQuery(q: string): boolean {
  const t = q.trim();
  if (t.length < 2) return false;
  if (/(youtube\.com|youtu\.be)/.test(t)) return false;
  if (KNOWN_FILM_TITLES.test(t)) return false;
  if (FILM_HINTS.test(t) || SERIES_HINTS.test(t)) return false;
  if (/\b(scene|clip|trailer|film|movie|série|series|4k|official clip|saison|episode|movieclips)\b/i.test(t)) {
    return false;
  }
  if (MUSIC_IN_QUERY.test(t)) return true;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.length <= 5) return true;
  return false;
}

export function isFilmTitleQuery(q: string): boolean {
  const t = q.trim();
  if (/(youtube\.com|youtu\.be)/.test(t)) return false;
  return !isArtistQuery(t);
}

export function isFilmOrSeries(title: string, channel = ""): boolean {
  const hay = `${title} ${channel}`.toLowerCase();
  if (BLOCKLIST.test(hay) || EDIT_SHORTS_RE.test(hay)) return false;
  if (SERIES_HINTS.test(hay) || FILM_HINTS.test(hay)) return true;
  if (KNOWN_FILM_TITLES.test(hay)) return true;
  if (/ — | - | \| /.test(title) && title.length < 120) return true;
  return false;
}

export function isUsableClip(
  title: string,
  channel = "",
  durationSec?: number | null,
  opts?: { allowArtist?: boolean; filmSearch?: boolean },
): boolean {
  if (isShortOrEditedClip(title, channel, durationSec)) return false;
  if (BLOCKLIST.test(`${title} ${channel}`)) return false;

  if (opts?.filmSearch) {
    if (isMusicVideo(title, channel)) return false;
    if (durationSec != null && durationSec > 0 && durationSec < 75) return false;
    if (isFilmOrSeries(title, channel)) return true;
    if (KNOWN_FILM_TITLES.test(`${title} ${channel}`)) return true;
    if (/movieclips|warner|universal|sony pictures|paramount/i.test(channel)) return true;
    return false;
  }

  if (opts?.allowArtist) {
    if (EDIT_SHORTS_RE.test(`${title} ${channel}`)) return false;
    if (durationSec != null && durationSec > 0 && durationSec < 25) return false;
    return true;
  }
  return isFilmOrSeries(title, channel);
}

export function augmentSearchQuery(q: string): string {
  const trimmed = q.trim();
  if (/(youtube\.com|youtu\.be)/.test(trimmed)) return trimmed;
  if (isArtistQuery(trimmed)) {
    return `${trimmed} official music video 4k`;
  }
  const base = trimmed.replace(/\b(movie|film|scene|4k)\b/gi, "").trim() || trimmed;
  return `${base} movie scene 4k movieclips official clip -soundtrack -ost -lyrics`;
}

export function filmSearchQueries(q: string): string[] {
  const t = q.trim();
  const core = t.replace(/\b(movie|film|scene|4k|clip)\b/gi, "").trim() || t;
  return [
    augmentSearchQuery(t),
    `${core} movieclips scene 4k`,
    `${core} film scene official clip 4k`,
    `${core} warner bros scene HD`,
  ];
}

export function extractMovieTitle(title: string): string {
  const parts = title.split(/\s*[—\-|]\s*/);
  return parts[0]?.trim() || title;
}
