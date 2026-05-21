import { NextRequest, NextResponse } from "next/server";
import { stripe, hasStripe } from "@/lib/stripe";
import { prisma, hasDatabase } from "@/lib/prisma";
import type Stripe from "stripe";

// POST /api/stripe-webhook
// Désactivé tant que STRIPE_SECRET_KEY et DATABASE_URL ne sont pas configurés.
export async function POST(req: NextRequest) {
  if (!hasStripe || !hasDatabase) {
    return NextResponse.json({ ok: true, skipped: "config_missing" });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "no_signature_or_secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.metadata?.userId;
        const plan = s.metadata?.plan;
        if (!userId) break;

        if (plan === "CREDITS_10") {
          await prisma.user.update({
            where: { id: userId },
            data: { bonusCredits: { increment: 10 } },
          });
        } else if (plan === "CREATOR" || plan === "PRO") {
          await prisma.user.update({ where: { id: userId }, data: { plan } });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: sub.customer as string } });
        if (user) await prisma.user.update({ where: { id: user.id }, data: { plan: "FREE" } });
        break;
      }
    }
  } catch (e) {
    console.error("[stripe-webhook] handler error", e);
  }

  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";
