import Stripe from "stripe";

export const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);

// On instancie seulement si la clé est dispo, sinon les routes graceful-fallback.
export const stripe = hasStripe
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" })
  : (null as unknown as Stripe);

/** Vercel CLI (PowerShell) peut ajouter \\r\\n aux price IDs — on nettoie avant Stripe. */
function cleanPriceId(v: string | undefined): string {
  return (v ?? "").trim().replace(/[\r\n]+/g, "");
}

export const PRICES = {
  CREATOR: cleanPriceId(process.env.STRIPE_PRICE_CREATOR),
  PRO: cleanPriceId(process.env.STRIPE_PRICE_PRO),
  CREDITS_10: cleanPriceId(process.env.STRIPE_PRICE_CREDITS_10),
};
