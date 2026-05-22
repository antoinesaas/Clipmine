"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PRICING, formatPrice } from "@/lib/plans";

type Plan = "CREATOR" | "PRO" | "CREDITS_10";

export default function BillingPage() {
  const [me, setMe] = useState<{ plan: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.ok && r.json()).then(setMe).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("checkout") as Plan | null;
    if (plan && ["CREATOR", "PRO", "CREDITS_10"].includes(plan)) {
      void checkout(plan);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkout(plan: Plan) {
    setBusy(plan);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await r.json();
      if (r.status === 503) {
        toast.info(data.message ?? "Paiements bientôt disponibles.");
        return;
      }
      if (r.status === 401) {
        toast.error("Connecte-toi pour continuer.");
        return;
      }
      if (!r.ok || !data.url) {
        toast.error(data.message ?? "Impossible d'ouvrir Stripe. Réessaie.");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="app-page-min">
      <header className="app-hero-min">
        <h1>Plan</h1>
        <p>Actuel : <strong>{me?.plan ?? "FREE"}</strong></p>
      </header>

      <div className="plan-stack">
        <div className="plan-min">
          <div>
            <strong>Creator</strong>
            <span>{PRICING.CREATOR.monthlyExports} exports / mois · {formatPrice(PRICING.CREATOR.priceMonthly)} <s>{formatPrice(PRICING.CREATOR.priceWas)}</s></span>
          </div>
          <button type="button" className="btn-mine" disabled={busy === "CREATOR"} onClick={() => checkout("CREATOR")}>
            {busy === "CREATOR" ? "…" : "Choisir"}
          </button>
        </div>
        <div className="plan-min feat">
          <div>
            <strong>Pro</strong>
            <span>Illimité · {formatPrice(PRICING.PRO.priceMonthly)} <s>{formatPrice(PRICING.PRO.priceWas)}</s></span>
          </div>
          <button type="button" className="btn-mine" disabled={busy === "PRO"} onClick={() => checkout("PRO")}>
            {busy === "PRO" ? "…" : "Choisir"}
          </button>
        </div>
        <div className="plan-min">
          <div>
            <strong>10 exports</strong>
            <span>Ponctuel · {formatPrice(PRICING.CREDITS_10.priceOnce)} <s>{formatPrice(PRICING.CREDITS_10.priceWas)}</s></span>
          </div>
          <button type="button" className="btn-mine" disabled={busy === "CREDITS_10"} onClick={() => checkout("CREDITS_10")}>
            {busy === "CREDITS_10" ? "…" : "Acheter"}
          </button>
        </div>
      </div>
    </div>
  );
}
