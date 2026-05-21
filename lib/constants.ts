/** Lien d'affiliation Amazon Prime Video — 30 jours d'essai */
export const PRIME_AFFILIATE_URL = "https://www.primevideo.com/?tag=clipmine-21";

export const PRIME_AFFILIATE_LABEL = "Prime Video · 30 jours gratuits";

/** Worker ffmpeg (Fly.io) — absent sur Vercel serverless */
export const WORKER_URL = process.env.WORKER_URL ?? "";
export const WORKER_SECRET = process.env.WORKER_SECRET ?? "";

export function hasWorker() {
  return Boolean(WORKER_URL && WORKER_SECRET);
}
