export type MediaType = "film" | "series";

const SERIES_HINTS =
  /\b(série|series|season|saison|episode|épisode|ep\.|s\d{1,2}e\d{1,2}|tv show|breaking bad|game of thrones|stranger things|the office|squid game|peaky blinders|succession|euphoria|arcane)\b/i;

const BLOCKLIST =
  /\b(gameplay|reaction|unboxing|podcast|asmr|tutorial|how to|unboxing|minecraft|fortnite|roblox|vlog\b|podcast)\b/i;

const EDIT_SHORTS_RE =
  /\b(#shorts|#short|#fyp|#fy|#edit|#edits|youtube shorts|yt shorts|tiktok edit|capcut|alight motion|premiere pro edit|after effects edit|fan edit|status video|shorts edit|vertical edit|sped up|slowed\+reverb|nightcore|lyric edit|audio swap|remix edit|edit comp|edit compilation)\b|\bshorts\b/i;

const ALREADY_EDITED_RE =
  /\b(edit audio|with lyrics on screen|tiktok version|for tiktok|for reels|for instagram|vertical crop|cropped for|phone edit|mobile edit)\b/i;

const FILM_HINTS =
  /\b(film|movie|cinema|cinéma|scene|scène|trailer|bande.?annonce|clip officiel|official clip|4k remaster|movieclips)\b/i;

export function inferMediaType(title: string, channel = ""): MediaType {
  const hay = `${title} ${channel}`;
  if (SERIES_HINTS.test(hay)) return "series";
  return "film";
}

/** Durée ISO 8601 → secondes (ex. PT1M32S). */
export function parseDurationSeconds(iso?: string): number | null {
  if (!iso || !iso.startsWith("PT")) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = Number(m[1] ?? 0);
  const min = Number(m[2] ?? 0);
  const s = Number(m[3] ?? 0);
  return h * 3600 + min * 60 + s;
}

export function isShortOrEditedClip(title: string, channel = "", durationSec?: number | null): boolean {
  const hay = `${title} ${channel}`.toLowerCase();
  if (EDIT_SHORTS_RE.test(hay) || ALREADY_EDITED_RE.test(hay)) return true;
  if (/\b\d{1,2}:\d{2}\b/.test(title) && /short|edit|tiktok|reel/i.test(hay)) return true;
  if (durationSec != null && durationSec > 0 && durationSec < 45) return true;
  if (durationSec != null && durationSec > 0 && durationSec <= 58 && /short/i.test(hay)) return true;
  return false;
}

/** Recherche type artiste / clip musical (Madison Beer, etc.). */
export function isArtistQuery(q: string): boolean {
  const t = q.trim();
  if (t.length < 2) return false;
  if (/(youtube\.com|youtu\.be)/.test(t)) return false;
  if (FILM_HINTS.test(t) || SERIES_HINTS.test(t)) return false;
  if (/\b(scene|clip|trailer|film|movie|série|series|4k|official clip|saison|episode)\b/i.test(t)) {
    return false;
  }
  const words = t.split(/\s+/).filter(Boolean);
  return words.length <= 5;
}

export function isFilmOrSeries(title: string, channel = ""): boolean {
  const hay = `${title} ${channel}`.toLowerCase();
  if (BLOCKLIST.test(hay) || EDIT_SHORTS_RE.test(hay)) return false;
  if (SERIES_HINTS.test(hay) || FILM_HINTS.test(hay)) return true;
  if (/ — | - | \| /.test(title) && title.length < 120) return true;
  return false;
}

/** Clip utilisable pour un edit (film, série, ou artiste — pas un short déjà monté). */
export function isUsableClip(
  title: string,
  channel = "",
  durationSec?: number | null,
  opts?: { allowArtist?: boolean },
): boolean {
  if (isShortOrEditedClip(title, channel, durationSec)) return false;
  if (BLOCKLIST.test(`${title} ${channel}`)) return false;
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
  return `${trimmed} movie scene OR film scene OR official clip 4k`;
}

export function extractMovieTitle(title: string): string {
  const parts = title.split(/\s*[—\-|]\s*/);
  return parts[0]?.trim() || title;
}
