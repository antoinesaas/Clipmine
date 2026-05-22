"use client";

import { useClerk, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

type Plan = "CREATOR" | "PRO" | "CREDITS_10";

export default function CheckoutButton({
  plan,
  className,
  children,
  redirectAfterSignIn,
}: {
  plan: Plan;
  className?: string;
  children: React.ReactNode;
  redirectAfterSignIn?: string;
}) {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
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
        openSignIn({
          forceRedirectUrl: redirectAfterSignIn ?? `/app/billing?checkout=${plan}`,
        });
        return;
      }
      if (!r.ok || !data.url) {
        toast.error(data.message ?? "Impossible d'ouvrir le paiement Stripe.");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Erreur réseau. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  function handleClick() {
    if (loading) return;
    if (isSignedIn) {
      void startCheckout();
      return;
    }
    openSignIn({
      forceRedirectUrl: redirectAfterSignIn ?? `/app/billing?checkout=${plan}`,
    });
  }

  return (
    <button type="button" className={className} onClick={handleClick} disabled={loading}>
      {loading ? "Redirection…" : children}
    </button>
  );
}
