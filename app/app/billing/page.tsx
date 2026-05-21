"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Me = {
  plan: string;
};

export default function BillingPage() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.ok && r.json()).then(setMe).catch(() => {});
  }, []);

  async function checkout(plan: string) {
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
    if (data.url) window.location.href = data.url;
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
            <span>50 exports / mois · 9€</span>
          </div>
          <button type="button" className="btn-mine" onClick={() => checkout("CREATOR")}>Choisir</button>
        </div>
        <div className="plan-min feat">
          <div>
            <strong>Pro</strong>
            <span>Illimité · 24€</span>
          </div>
          <button type="button" className="btn-mine" onClick={() => checkout("PRO")}>Choisir</button>
        </div>
        <div className="plan-min">
          <div>
            <strong>10 exports</strong>
            <span>Ponctuel · 1,99€</span>
          </div>
          <button type="button" className="btn-mine" onClick={() => checkout("CREDITS_10")}>Acheter</button>
        </div>
      </div>
    </div>
  );
}
