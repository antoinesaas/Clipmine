/** Normalise la requête utilisateur pour cibler scene packs / Movieclips. */

const YOUTUBE_RE = /(?:youtube\.com|youtu\.be)/i;

const ALREADY_OPTIMIZED_RE =
  /\b(movieclips?|scene\s*pack|clips?\s+for\s+edits?|for\s+editing|cinematic\s+scenes?|raw\s+footage)\b/i;

export function isYoutubeUrl(input: string): boolean {
  return YOUTUBE_RE.test(input.trim());
}

/** Suffixe ajouté automatiquement à la recherche YouTube (hors lien direct). */
export function searchQuerySuffix(): string {
  return "scene pack movieclips";
}

/**
 * Requête envoyée à l’API / YouTube.
 * L’utilisateur tape « Inception » → « Inception scene pack movieclips ».
 */
export function normalizeSearchQuery(raw: string): {
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
  return {
    userInput,
    apiQuery: `${userInput} ${searchQuerySuffix()}`.replace(/\s+/g, " ").trim(),
    augmented: true,
  };
}
