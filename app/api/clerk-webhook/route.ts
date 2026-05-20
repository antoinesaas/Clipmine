import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

// POST /api/clerk-webhook
// Configure dans Clerk Dashboard -> Webhooks : événement user.created
// Mets le signing secret dans CLERK_WEBHOOK_SECRET
export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "no_secret" }, { status: 500 });

  const payload = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };

  let evt: any;
  try {
    evt = new Webhook(secret).verify(payload, headers);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (evt.type === "user.created") {
    const clerkId = evt.data.id;
    const email = evt.data.email_addresses?.[0]?.email_address ?? `${clerkId}@clipmine.io`;
    await prisma.user.upsert({
      where: { clerkId },
      update: {},
      create: { clerkId, email },
    });
  }

  return NextResponse.json({ received: true });
}
