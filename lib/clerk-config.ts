/** URL enregistrée dans Clerk Dashboard (domaine racine clipmine.fr). */
export const CLERK_PROXY_REGISTERED =
  process.env.CLERK_PROXY_REGISTERED?.replace(/\/$/, "") ??
  "https://clipmine.fr/api/clerk-fapi";

/** URL publique pour le navigateur (www — même origine que le site). */
export const CLERK_PROXY_PUBLIC =
  process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.replace(/\/$/, "") ??
  "https://www.clipmine.fr/api/clerk-fapi";

/**
 * CDN direct : le proxy Vercel recompresse mal les gros bundles (br tronqué → SyntaxError).
 * Les appels API Clerk passent toujours par CLERK_PROXY_PUBLIC.
 */
export const CLERK_JS_URL =
  "https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5.125.10/dist/clerk.browser.js";
