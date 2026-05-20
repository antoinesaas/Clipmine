import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe, PRICES } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// POST /api/checkout  { plan: "CREATOR" | "PRO" | "CREDITS_10" }
export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  const priceId = PRICES[plan as keyof typeof PRICES];
  if (!priceId) return NextResponse.json({ error: "invalid_plan" }, { status: 400 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;

  // Récupère/crée le user en DB + le customer Stripe
  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    user = await prisma.user.create({
      data: { clerkId: userId, email: email ?? `${userId}@clipmine.io` },
    });
  }
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
    user = await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });
  }

  const isCredits = plan === "CREDITS_10";
  const session = await stripe.checkout.sessions.create({
    customer: user.stripeCustomerId!,
    mode: isCredits ? "payment" : "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app?canceled=1`,
    metadata: { userId: user.id, plan },
  });

  return NextResponse.json({ url: session.url });
}
