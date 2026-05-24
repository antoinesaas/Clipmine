import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasStripe, stripe } from "@/lib/stripe";
import { prisma, hasDatabase } from "@/lib/prisma";
import { ensureDbUser } from "@/lib/ensure-user";
import { createCheckoutSession, type CheckoutPlan } from "@/lib/stripe-checkout";

// POST /api/checkout  { plan: "CREATOR" | "PRO" | "CREDITS_10" }
export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!hasStripe || !hasDatabase) {
    return NextResponse.json(
      {
        error: "waitlist",
        message: "Les paiements ne sont pas encore activés. Tu seras notifié dès le lancement.",
      },
      { status: 503 },
    );
  }

  const { plan: rawPlan } = await req.json();
  const plan = rawPlan as CheckoutPlan;
  if (!["CREATOR", "PRO", "CREDITS_10"].includes(plan)) {
    return NextResponse.json({ error: "invalid_plan", message: "Plan inconnu." }, { status: 400 });
  }

  try {
    let user = await ensureDbUser(userId);
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      user = await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    const { url } = await createCheckoutSession({
      plan,
      stripeCustomerId: user.stripeCustomerId!,
      userId: user.id,
      origin: new URL(req.url).origin,
    });

    return NextResponse.json({ url });
  } catch (e) {
    console.error("[/api/checkout] error", e);
    const message = e instanceof Error ? e.message : "checkout_failed";
    return NextResponse.json({ error: "checkout_failed", message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
