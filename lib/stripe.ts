import Stripe from "stripe";

export const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);

// On instancie seulement si la clé est dispo, sinon les routes graceful-fallback.
export const stripe = hasStripe
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" })
  : (null as unknown as Stripe);

export const PRICES = {
  CREATOR: process.env.STRIPE_PRICE_CREATOR ?? "",
  PRO: process.env.STRIPE_PRICE_PRO ?? "",
  CREDITS_10: process.env.STRIPE_PRICE_CREDITS_10 ?? "",
};
