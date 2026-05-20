import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

// POST /api/stripe-webhook
// Configure l'endpoint dans Stripe Dashboard -> Webhooks
// Écoute : checkout.session.completed, customer.subscription.updated/deleted
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.metadata?.userId;
      const plan = s.metadata?.plan;
      if (!userId) break;

      if (plan === "CREDITS_10") {
        // Achat one-shot de 10 exports
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

  return NextResponse.json({ received: true });
}
