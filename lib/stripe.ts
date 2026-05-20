import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const PRICES = {
  CREATOR: process.env.STRIPE_PRICE_CREATOR!,
  PRO: process.env.STRIPE_PRICE_PRO!,
  CREDITS_10: process.env.STRIPE_PRICE_CREDITS_10!,
};
