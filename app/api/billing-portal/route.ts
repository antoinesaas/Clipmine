import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, hasDatabase } from "@/lib/prisma";
import { hasStripe, stripe } from "@/lib/stripe";

export async function POST() {
  const { userId: clerkId } = auth();
  if (!clerkId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasStripe || !hasDatabase) {
    return NextResponse.json({ message: "Paiements bientôt disponibles." }, { status: 503 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "no_user" }, { status: 404 });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://www.clipmine.fr";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/app/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[billing-portal]", e);
    return NextResponse.json({ message: "Impossible d'ouvrir Stripe." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
