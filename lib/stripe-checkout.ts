import type Stripe from "stripe";
import { stripe, PRICES } from "@/lib/stripe";
import { PRICING } from "@/lib/plans";
import { appBaseUrl } from "@/lib/app-url";

export type CheckoutPlan = "CREATOR" | "PRO" | "CREDITS_10";

function stripeErrorMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) {
    const msg = String((e as { message: string }).message);
    if (/price/i.test(msg)) return "Prix Stripe invalide — vérifie STRIPE_PRICE_* sur Vercel.";
    return msg.slice(0, 200);
  }
  return "Erreur Stripe — réessaie.";
}

export async function createCheckoutSession(opts: {
  plan: CheckoutPlan;
  stripeCustomerId: string;
  userId: string;
  origin?: string;
}): Promise<{ url: string }> {
  const { plan, stripeCustomerId, userId, origin } = opts;
  const base = appBaseUrl(origin);
  const isCredits = plan === "CREDITS_10";

  const priceId =
    plan === "CREATOR" ? PRICES.CREATOR : plan === "PRO" ? PRICES.PRO : PRICES.CREDITS_10;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    isCredits && !priceId
      ? [
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: PRICING.CREDITS_10.stripeAmountCents,
              product_data: {
                name: "ClipMine — 10 exports 4K",
                description: "10 crédits d'export sans abonnement",
              },
            },
          },
        ]
      : priceId
        ? [{ price: priceId, quantity: 1 }]
        : [];

  if (!lineItems.length) {
    throw new Error(
      isCredits
        ? "STRIPE_PRICE_CREDITS_10 manquant sur Vercel."
        : "Prix Stripe manquant pour ce plan.",
    );
  }

  const params: Stripe.Checkout.SessionCreateParams = {
    customer: stripeCustomerId,
    mode: isCredits ? "payment" : "subscription",
    line_items: lineItems,
    locale: "fr",
    payment_method_types: ["card"],
    allow_promotion_codes: !isCredits,
    success_url: isCredits
      ? `${base}/app/exports?credits_purchased=1`
      : plan === "CREATOR" || plan === "PRO"
        ? `${base}/app/billing?subscribed=1`
        : `${base}/app/exports?success=1`,
    cancel_url: `${base}/app/billing?canceled=1`,
    metadata: { userId, plan },
  };

  try {
    const session = await stripe.checkout.sessions.create(params);
    if (!session.url) throw new Error("URL Stripe manquante");
    return { url: session.url };
  } catch (e) {
    if (isCredits && priceId) {
      const fallback: Stripe.Checkout.SessionCreateParams = {
        ...params,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: PRICING.CREDITS_10.stripeAmountCents,
              product_data: {
                name: "ClipMine — 10 exports 4K",
                description: "10 crédits d'export sans abonnement",
              },
            },
          },
        ],
      };
      const session = await stripe.checkout.sessions.create(fallback);
      if (!session.url) throw new Error("URL Stripe manquante");
      return { url: session.url };
    }
    throw new Error(stripeErrorMessage(e));
  }
}
