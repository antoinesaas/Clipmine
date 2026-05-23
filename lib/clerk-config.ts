/** URL canonique du proxy Clerk — toujours www pour éviter CORS www ↔ apex. */
export const CLERK_PROXY_URL =
  process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.replace(/\/$/, "") ??
  "https://www.clipmine.fr/api/clerk-fapi";

export const CLERK_JS_URL = `${CLERK_PROXY_URL}/npm/@clerk/clerk-js@5/dist/clerk.browser.js`;
