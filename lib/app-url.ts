/** URL publique du site (toujours www en prod). */
export function appBaseUrl(fallbackOrigin?: string): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (fallbackOrigin) return fallbackOrigin.replace(/\/$/, "");
  return "https://www.clipmine.fr";
}
