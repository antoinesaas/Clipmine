/** Nettoie les variables d'environnement (espaces, retours ligne Windows / Vercel CLI). */
export function cleanEnv(v: string | undefined): string {
  return (v ?? "").trim().replace(/[\r\n]+/g, "");
}
