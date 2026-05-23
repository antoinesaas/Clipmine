import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { appBaseUrl } from "@/lib/app-url";
import { stripe, hasStripe, PRICES } from "@/lib/stripe";
import { prisma, hasDatabase } from "@/lib/prisma";

// POST /api/checkout  { plan: "CREATOR" | "PRO" | "CREDITS_10" }
export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!hasStripe || !hasDatabase) {
    return NextResponse.json({
      error: "waitlist",
      message: "Les paiements ne sont pas encore activés. Tu seras notifié dès le lancement.",
    }, { status: 503 });
  }

  const { plan } = await req.json();
  const priceId = PRICES[plan as keyof typeof PRICES];
  if (!priceId) {
    const missingEnv =
      plan === "CREATOR"
        ? "STRIPE_PRICE_CREATOR"
        : plan === "PRO"
          ? "STRIPE_PRICE_PRO"
          : "STRIPE_PRICE_CREDITS_10";
    return NextResponse.json({
      error: "invalid_plan",
      message: `Paiement indisponible (${missingEnv} manquant sur Vercel).`,
    }, { status: 503 });
  }

  try {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;

    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: { clerkId: userId, email: email ?? `${userId}@clipmine.fr` },
      });
    }
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
      user = await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });
    }

    const base = appBaseUrl(new URL(req.url).origin);
    const isCredits = plan === "CREDITS_10";
    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId!,
      mode: isCredits ? "payment" : "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: isCredits
        ? `${base}/app/exports?credits_purchased=1`
        : plan === "CREATOR" || plan === "PRO"
          ? `${base}/app/billing?subscribed=1`
          : `${base}/app/exports?success=1`,
      cancel_url: isCredits
        ? `${base}/app/billing?canceled=1`
        : `${base}/app/billing?canceled=1`,
      metadata: { userId: user.id, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[/api/checkout] error", e);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
