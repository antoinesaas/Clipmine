"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PRICING, formatPrice, planBullets } from "@/lib/plans";

type Plan = "CREATOR" | "PRO" | "CREDITS_10";

function BulletList({ plan }: { plan: "FREE" | "CREATOR" | "PRO" }) {
  return (
    <ul className="plan-features">
      {planBullets(plan).map((b) => (
        <li key={b.text} className={b.off ? "off" : ""}>
          {b.off ? "—" : "✓"} {b.text}
        </li>
      ))}
    </ul>
  );
}

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

  const current = (me?.plan ?? "FREE") as "FREE" | "CREATOR" | "PRO";

  return (
    <div className="app-page-min app-page-billing">
      <header className="app-hero-min">
        <h1>Plan</h1>
        <p>
          Actuel : <strong>{current}</strong>
          {current === "FREE" && " · 1 export 4K offert"}
        </p>
      </header>

      <div className="plan-stack">
        <div className={`plan-card ${current === "FREE" ? "current" : ""}`}>
          <div className="plan-card-head">
            <strong>Free</strong>
            <span>{formatPrice(0)}/mois</span>
          </div>
          <BulletList plan="FREE" />
          {current === "FREE" && <span className="plan-badge-current">Plan actuel</span>}
        </div>

        <div className={`plan-card ${current === "CREATOR" ? "current" : ""}`}>
          <div className="plan-card-head">
            <strong>Creator</strong>
            <span>
              {formatPrice(PRICING.CREATOR.priceMonthly)}
              <s>{formatPrice(PRICING.CREATOR.priceWas)}</s>/mois
            </span>
          </div>
          <p className="plan-card-sub">{PRICING.CREATOR.tagline}</p>
          <BulletList plan="CREATOR" />
          <button
            type="button"
            className="btn-mine"
            disabled={busy === "CREATOR" || current === "CREATOR"}
            onClick={() => checkout("CREATOR")}
          >
            {current === "CREATOR" ? "Plan actuel" : busy === "CREATOR" ? "…" : "Choisir Creator"}
          </button>
        </div>

        <div className={`plan-card feat ${current === "PRO" ? "current" : ""}`}>
          <div className="plan-card-head">
            <strong>Pro</strong>
            <span>
              {formatPrice(PRICING.PRO.priceMonthly)}
              <s>{formatPrice(PRICING.PRO.priceWas)}</s>/mois
            </span>
          </div>
          <p className="plan-card-sub">{PRICING.PRO.tagline}</p>
          <BulletList plan="PRO" />
          <button
            type="button"
            className="btn-mine"
            disabled={busy === "PRO" || current === "PRO"}
            onClick={() => checkout("PRO")}
          >
            {current === "PRO" ? "Plan actuel" : busy === "PRO" ? "…" : "Choisir Pro"}
          </button>
        </div>

        <div className="plan-card">
          <div className="plan-card-head">
            <strong>10 exports</strong>
            <span>
              {formatPrice(PRICING.CREDITS_10.priceOnce)}
              <s>{formatPrice(PRICING.CREDITS_10.priceWas)}</s> ponctuel
            </span>
          </div>
          <p className="plan-card-sub">{PRICING.CREDITS_10.tagline}</p>
          <ul className="plan-features">
            <li>✓ 10 exports 4K sans abonnement</li>
            <li>✓ Mêmes outils IA que Creator</li>
            <li>✓ Crédits cumulables sur ton compte</li>
          </ul>
          <button
            type="button"
            className="btn-mine"
            disabled={busy === "CREDITS_10"}
            onClick={() => checkout("CREDITS_10")}
          >
            {busy === "CREDITS_10" ? "…" : "Acheter 10 exports"}
          </button>
        </div>
      </div>
    </div>
  );
}
