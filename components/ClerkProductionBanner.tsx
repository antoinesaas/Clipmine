"use client";

import { isClerkTestKey } from "@/lib/clerk-env";

/** Bandeau admin si Clerk tourne en pk_test sur le domaine public. */
export default function ClerkProductionBanner() {
  if (typeof window === "undefined") return null;
  if (!isClerkTestKey()) return null;

  const host = window.location.hostname;
  if (!host.includes("clipmine.fr") && host !== "localhost") return null;

  return (
    <div
      className="clerk-prod-banner"
      role="status"
    >
      <strong>Clerk en mode test</strong> — mets les clés <code>pk_live_</code> / <code>sk_live_</code> sur Vercel
      (voir <code>docs/LANCEMENT-PRODUCTION.md</code>).
    </div>
  );
}
