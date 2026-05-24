export type MediaType = "film" | "series" | "sport" | "person" | "animation";

/** Packs / clips bruts pour montage (priorité recherche). */
export const EDIT_SOURCE_RE =
  /\b(scene\s*pack|scenes\s*pack|clip\s*pack|clips\s*pack|clips?\s+for\s+edits?|clip\s+for\s+edit|for\s+editing|edit\s+material|raw\s+clips?|raw\s+footage|cinematic\s+clips?|movie\s+scenes?|film\s+scenes?|footage\s+pack|b-?roll|best\s+scenes?|iconic\s+scenes?|moments\s+compilation|scenes?\s+compilation|no\s+copyright|nocopyright|free\s+to\s+use|cc0|source\s+footage|hd\s+clips?|4k\s+clips?)\b/i;

const SERIES_HINTS =
  /\b(série|series|season|saison|episode|épisode|ep\.|s\d{1,2}e\d{1,2}|tv show|breaking bad|game of thrones|stranger things|the office|squid game|peaky blinders|succession|euphoria|arcane)\b/i;

const ANIMATION_HINTS =
  /\b(anime|cartoon|animated|animation|pixar|disney|dreamworks|lego|dessin animé|dessin animé|cnl|nickelodeon|studio ghibli|marvel animation|batman animation)\b/i;

const SPORT_HINTS =
  /\b(sport|sports|football|soccer|nba|nfl|ufc|mma|match|goal|goals|highlights|basketball|tennis|f1|formula 1|champions league|psg|real madrid|rugby|olympics|jo\b|world cup)\b/i;

const PERSON_HINTS =
  /\b(interview|concert|live performance|red carpet|awards|grammy|oscar speech|celebrity|actor|actress|singer|chanteur|chanteuse|official video|vevo|feat\.|ft\.)\b/i;

const BLOCKLIST =
  /\b(gameplay|reaction|unboxing|podcast|asmr|tutorial|how to|minecraft|fortnite|roblox|vlog\b)\b/i;

/** Shorts / edits finis — on les exclut sauf packs « for edits ». */
const EDIT_SHORTS_RE =
  /\b(#shorts|#short|#fyp|#fy|youtube shorts|yt shorts|tiktok edit|capcut|alight motion|premiere pro edit|after effects edit|fan edit|status video|shorts edit|vertical edit|sped up|slowed\+reverb|nightcore|lyric edit|audio swap|remix edit|edit comp|edit compilation)\b/i;

const ALREADY_EDITED_RE =
  /\b(edit audio|with lyrics on screen|tiktok version|for tiktok|for reels|for instagram|vertical crop|cropped for|phone edit|mobile edit)\b/i;

const FILM_HINTS =
  /\b(film|movie|cinema|cinéma|scene|scène|trailer|bande.?annonce|clip officiel|official clip|4k remaster|movieclips|warner|universal pictures)\b/i;

export const KNOWN_FILM_TITLES =
  /\b(interstellar|inception|oppenheimer|dune|gladiator|avatar|matrix|batman|joker|harry potter|john wick|spider-?man|avengers|frozen|shrek|titanic|alien|predator|terminator|rocky|godfather|scarface|fight club|shawshank|forrest gump|dark knight|blade runner|mad max|top gun|mission impossible|jurassic|star wars|indiana jones|pirates|transformers|fast and furious|peaky blinders|breaking bad|game of thrones)\b/i;

const MUSIC_IN_QUERY =
  /\b(song|album|lyrics|feat\.?|ft\.?|cover|remix|mv\b|music video|soundtrack|ost\b|official audio|piano|guitar cover|orchestra only)\b/i;

/** Clips musicaux purs — pas les scènes de film avec BO. */
const MUSIC_VIDEO_STRICT_RE =
  /\b(lyric video|lyrics video|official audio|music video|vevo\b|audio only|full album|piano cover|orchestral cover only)\b/i;

const MUSIC_CHANNEL_RE =
  /\b(official audio| - topic$|vevo$|records$|soundtrack channel|ost channel|music group)\b/i;

const TRUSTED_CLIP_CHANNELS =
  /movieclips|warner|universal|sony pictures|paramount|hbo|netflix|rotten tomatoes|scenes|clips|official|imax|4k hdr|film|cinema|scene pack|for edit/i;

export function inferMediaType(title: string, channel = "", query = ""): MediaType {
  const hay = `${title} ${channel} ${query}`;
  if (SPORT_HINTS.test(hay)) return "sport";
  if (ANIMATION_HINTS.test(hay)) return "animation";
  if (PERSON_HINTS.test(hay) || isArtistQuery(query)) return "person";
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

export function isMusicVideo(title: string, channel = "", filmSearch = false): boolean {
  const hay = `${title} ${channel}`;
  if (MUSIC_VIDEO_STRICT_RE.test(hay)) return true;
  if (MUSIC_CHANNEL_RE.test(channel)) return true;
  if (/\b-\s*topic$/i.test(channel)) return true;
  if (filmSearch && (EDIT_SOURCE_RE.test(hay) || KNOWN_FILM_TITLES.test(hay) || FILM_HINTS.test(hay))) {
    return false;
  }
  return false;
}

export function isShortOrEditedClip(title: string, channel = "", durationSec?: number | null): boolean {
  const hay = `${title} ${channel}`.toLowerCase();
  if (EDIT_SOURCE_RE.test(hay)) return false;
  if (EDIT_SHORTS_RE.test(hay) || ALREADY_EDITED_RE.test(hay)) return true;
  if (/#shorts/i.test(title)) return true;
  if (durationSec != null && durationSec > 0 && durationSec < 40) return true;
  if (durationSec != null && durationSec > 0 && durationSec <= 58 && /\bshorts?\b/i.test(hay)) return true;
  return false;
}

export function isArtistQuery(q: string): boolean {
  const t = q.trim();
  if (t.length < 2) return false;
  if (/(youtube\.com|youtu\.be)/.test(t)) return false;
  if (KNOWN_FILM_TITLES.test(t)) return false;
  if (FILM_HINTS.test(t) || SERIES_HINTS.test(t)) return false;
  if (/\b(scene|clip|trailer|film|movie|série|series|4k|official clip|saison|episode|movieclips|pack|edit)\b/i.test(t)) {
    return false;
  }
  if (MUSIC_IN_QUERY.test(t)) return true;
  const words = t.split(/\s+/).filter(Boolean);
  return words.length >= 2 && words.length <= 5;
}

export function isFilmTitleQuery(q: string): boolean {
  const t = q.trim();
  if (/(youtube\.com|youtu\.be)/.test(t)) return false;
  return !isArtistQuery(t);
}

export function isFilmOrSeries(title: string, channel = ""): boolean {
  const hay = `${title} ${channel}`.toLowerCase();
  if (BLOCKLIST.test(hay)) return false;
  if (EDIT_SOURCE_RE.test(hay)) return true;
  if (EDIT_SHORTS_RE.test(hay)) return false;
  if (SERIES_HINTS.test(hay) || FILM_HINTS.test(hay)) return true;
  if (KNOWN_FILM_TITLES.test(hay)) return true;
  if (/ — | - | \| /.test(title) && title.length < 140) return true;
  return false;
}

export function isUsableClip(
  title: string,
  channel = "",
  durationSec?: number | null,
  opts?: { allowArtist?: boolean; filmSearch?: boolean; query?: string },
): boolean {
  if (isShortOrEditedClip(title, channel, durationSec)) return false;
  if (BLOCKLIST.test(`${title} ${channel}`)) return false;

  const filmSearch = !!opts?.filmSearch;
  const minDur = EDIT_SOURCE_RE.test(`${title} ${channel}`) ? 35 : 48;

  if (filmSearch) {
    if (isMusicVideo(title, channel, true)) return false;
    if (durationSec != null && durationSec > 0 && durationSec < minDur) return false;

    if (EDIT_SOURCE_RE.test(`${title} ${channel}`)) return true;
    if (isFilmOrSeries(title, channel)) return true;
    if (TRUSTED_CLIP_CHANNELS.test(channel)) return true;
    if (KNOWN_FILM_TITLES.test(`${title} ${channel}`)) return true;

    const q = (opts.query ?? "").trim().toLowerCase();
    if (q.length > 2) {
      const words = q
        .replace(/\b(movie|film|scene|4k|clip|official|pack|edit|movieclips)\b/gi, "")
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 1);
      if (words.length >= 2) {
        const hayLc = `${title} ${channel}`.toLowerCase();
        const hits = words.filter((w) => hayLc.includes(w)).length;
        if (hits >= Math.min(2, words.length)) return true;
        if (hits === 0) return false;
      } else if (words.some((w) => `${title} ${channel}`.toLowerCase().includes(w))) {
        return true;
      }
    }

    if (/\b(scene|clip|trailer|fight|moment|official|extended|4k|hd|imax)\b/i.test(title)) {
      return true;
    }

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
    return `${trimmed} official music video`;
  }
  const core = trimmed.replace(/\b(movie|film|scene|4k|clip|official|pack)\b/gi, "").trim() || trimmed;
  return `${core} scene pack clips for edits`;
}

export function filmSearchQueries(q: string): string[] {
  const t = q.trim();
  const core = t.replace(/\b(movie|film|scene|scenes|4k|clip|clips|official|pack|edit)\b/gi, "").trim() || t;
  const lower = core.toLowerCase();

  if (/\blego\b/i.test(lower)) {
    return [
      `${core} lego movie scene pack clips for edits`,
      `${core} lego batman movieclips 4k`,
      `${core} lego film scenes compilation`,
      `${core} animated movie scenes 4k`,
    ];
  }
  if (ANIMATION_HINTS.test(lower)) {
    return [
      `${core} animated movie scene pack clips for edits`,
      `${core} cartoon scenes 4k`,
      `${core} animation movieclips`,
      `${core} ${core} best scenes HD`,
    ];
  }
  if (SPORT_HINTS.test(lower)) {
    return [
      `${core} sports highlights 4k`,
      `${core} match best moments`,
      `${core} goals compilation HD`,
      `${core} ${core} iconic plays`,
    ];
  }

  return [
    `${core} scene pack clips for edits`,
    `${core} clips for edits 4k`,
    `${core} "${core}" movieclips`,
    `${core} cinematic scenes raw footage`,
    `${core} movie scenes compilation 4k`,
    `${core} best scenes 4k`,
    `${core} iconic scenes HD`,
  ];
}

export function extractMovieTitle(title: string): string {
  const parts = title.split(/\s*[—\-|]\s*/);
  return parts[0]?.trim() || title;
}
