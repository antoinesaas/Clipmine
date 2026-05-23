/** URL enregistrée dans Clerk Dashboard (domaine racine clipmine.fr). */
export const CLERK_PROXY_REGISTERED =
  process.env.CLERK_PROXY_REGISTERED?.replace(/\/$/, "") ??
  "https://clipmine.fr/api/clerk-fapi";

/** URL publique pour le navigateur (www — même origine que le site). */
export const CLERK_PROXY_PUBLIC =
  process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.replace(/\/$/, "") ??
  "https://www.clipmine.fr/api/clerk-fapi";

/** v5 : compatible avec @clerk/nextjs 5.x (le proxy renvoie le bundle en entier). */
export const CLERK_JS_URL = `${CLERK_PROXY_PUBLIC}/npm/@clerk/clerk-js@5/dist/clerk.browser.js`;
