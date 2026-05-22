import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
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
    return NextResponse.json({
      error: "invalid_plan",
      message: plan === "PRO"
        ? "Tarif Pro indisponible. Contacte le support."
        : "Plan invalide.",
    }, { status: 400 });
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

    const base = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
    const isCredits = plan === "CREDITS_10";
    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId!,
      mode: isCredits ? "payment" : "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/app?success=1`,
      cancel_url: `${base}/app?canceled=1`,
      metadata: { userId: user.id, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[/api/checkout] error", e);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
