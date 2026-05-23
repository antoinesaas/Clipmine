/** Email support client */
export const SUPPORT_EMAIL = "antoinehofmann08@gmail.com";
export const DISCORD_URL = "https://discord.gg/Q4uBaxqDNJ";
export const PRIME_AFFILIATE_URL = "https://www.primevideo.com/?tag=clipmine-21";

export const PRIME_AFFILIATE_LABEL = "Prime Video · 30 jours gratuits";

import { cleanEnv } from "@/lib/env";

/** Worker ffmpeg (Fly.io) — absent sur Vercel serverless */
export const WORKER_URL = cleanEnv(process.env.WORKER_URL);
export const WORKER_SECRET = cleanEnv(process.env.WORKER_SECRET);

export function hasWorker() {
  return Boolean(WORKER_URL && WORKER_SECRET);
}
