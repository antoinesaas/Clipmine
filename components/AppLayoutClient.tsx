"use client";

import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import ClerkProductionBanner from "@/components/ClerkProductionBanner";

type Me = {
  plan: string;
  freeExportAvailable: boolean;
  exportsThisMonth: number;
  monthlyQuota: number | null;
  bonusCredits: number;
  waitlist?: boolean;
  pipelineReady?: boolean;
};

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const reload = useCallback(async () => {
    try {
      const r = await fetch("/api/me");
      if (r.ok) setMe(await r.json());
    } catch {}
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { me, reload };
}

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { me } = useMe();

  const quotaLabel = me
    ? me.bonusCredits > 0
      ? `${me.bonusCredits} export${me.bonusCredits > 1 ? "s" : ""} bonus`
      : me.freeExportAvailable
        ? "1 export 4K offert"
        : me.monthlyQuota === null
          ? "Exports illimités"
          : `${me.exportsThisMonth}/${me.monthlyQuota} ce mois`
    : "";

  return (
    <AppShell quotaLabel={quotaLabel}>
      <ClerkProductionBanner />
      {me?.waitlist && (
        <div className="waitlist-banner" role="status">
          Pipeline export en connexion — si le téléchargement échoue, réessaie dans 1–2 min.
        </div>
      )}
      {children}
    </AppShell>
  );
}
