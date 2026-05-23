/** Détecte les clés Clerk de développement (à ne pas utiliser sur clipmine.fr). */

export function isClerkTestKey(key?: string | null): boolean {
  const pk = (key ?? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "").trim();
  return pk.startsWith("pk_test_");
}

export function clerkKeyMode(): "live" | "test" | "missing" {
  const pk = (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "").trim();
  if (!pk) return "missing";
  return pk.startsWith("pk_live_") ? "live" : "test";
}
