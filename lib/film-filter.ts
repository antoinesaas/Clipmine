export type MediaType = "film" | "series";

const SERIES_HINTS =
  /\b(série|series|season|saison|episode|épisode|ep\.|s\d{1,2}e\d{1,2}|tv show|breaking bad|game of thrones|stranger things|the office|squid game|peaky blinders|succession|euphoria|arcane)\b/i;

const BLOCKLIST =
  /\b(music video|official video|lyrics|lyric|amv|gameplay|reaction|unboxing|podcast|asmr|tutorial|how to|cover|remix|full album|concert live|minecraft|fortnite)\b/i;

const FILM_HINTS =
  /\b(film|movie|cinema|cinéma|scene|scène|trailer|bande.?annonce|clip officiel|official clip|4k remaster)\b/i;

export function inferMediaType(title: string, channel = ""): MediaType {
  const hay = `${title} ${channel}`;
  if (SERIES_HINTS.test(hay)) return "series";
  return "film";
}

export function isFilmOrSeries(title: string, channel = ""): boolean {
  const hay = `${title} ${channel}`.toLowerCase();
  if (BLOCKLIST.test(hay)) return false;
  if (SERIES_HINTS.test(hay) || FILM_HINTS.test(hay)) return true;
  // Titres courts type "Inception — Dream Scene" sans mot-clé explicite
  if (/ — | - | \| /.test(title) && title.length < 120) return true;
  return false;
}

export function augmentSearchQuery(q: string): string {
  const trimmed = q.trim();
  if (/(youtube\.com|youtu\.be)/.test(trimmed)) return trimmed;
  return `${trimmed} (movie scene OR film scene OR series scene OR official clip)`;
}

export function extractMovieTitle(title: string): string {
  const parts = title.split(/\s*[—\-|]\s*/);
  return parts[0]?.trim() || title;
}
