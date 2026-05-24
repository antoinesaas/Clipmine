/** Normalise la requête utilisateur selon le type de contenu. */

import {
  isArtistQuery,
  isFilmTitleQuery,
  type MediaType,
} from "@/lib/film-filter";

const YOUTUBE_RE = /(?:youtube\.com|youtu\.be)/i;

const ALREADY_OPTIMIZED_RE =
  /\b(movieclips?|scene\s*pack|clips?\s+for\s+edits?|clip\s+for\s+edit|for\s+editing|cinematic\s+scenes?|raw\s+footage|scenepack)\b/i;

const SERIES_IN_QUERY =
  /\b(série|series|season|saison|episode|épisode|breaking bad|game of thrones|stranger things|peaky blinders)\b/i;

const SPORT_IN_QUERY =
  /\b(sport|sports|football|soccer|nba|nfl|ufc|mma|match|goal|highlights|basketball|tennis|f1|rugby|psg|real madrid|champions league)\b/i;

export function isYoutubeUrl(input: string): boolean {
  return YOUTUBE_RE.test(input.trim());
}

function suffixFor(raw: string, typeHint?: MediaType | "all"): string {
  if (typeHint === "person" || isArtistQuery(raw)) {
    return "scenepack clips for edits";
  }
  if (typeHint === "sport" || SPORT_IN_QUERY.test(raw)) {
    return "sports highlights 4k";
  }
  if (typeHint === "animation") {
    return "animated scene pack clips for edits";
  }
  if (typeHint === "series" || SERIES_IN_QUERY.test(raw)) {
    return "scene pack clips for edits";
  }
  if (isFilmTitleQuery(raw)) {
    return "scene pack movieclips";
  }
  return "scene pack clips for edits";
}

/**
 * Requête envoyée à l’API YouTube.
 * Chanteurs → « scenepack clips for edits » (pas movieclips).
 */
export function normalizeSearchQuery(
  raw: string,
  typeHint?: MediaType | "all",
): {
  userInput: string;
  apiQuery: string;
  augmented: boolean;
} {
  const userInput = raw.trim();
  if (!userInput) {
    return { userInput: "", apiQuery: "", augmented: false };
  }
  if (isYoutubeUrl(userInput)) {
    return { userInput, apiQuery: userInput, augmented: false };
  }
  if (ALREADY_OPTIMIZED_RE.test(userInput)) {
    return { userInput, apiQuery: userInput, augmented: false };
  }

  const suffix = suffixFor(userInput, typeHint);
  return {
    userInput,
    apiQuery: `${userInput} ${suffix}`.replace(/\s+/g, " ").trim(),
    augmented: true,
  };
}
