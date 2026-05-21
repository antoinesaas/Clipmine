import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma, hasDatabase } from "@/lib/prisma";

// POST /api/clerk-webhook
// Configure dans Clerk Dashboard -> Webhooks : événement user.created
export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret || !hasDatabase) {
    return NextResponse.json({ ok: true, skipped: "config_missing" });
  }

  const payload = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  let evt: any;
  try {
    evt = new Webhook(secret).verify(payload, headers);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    if (evt.type === "user.created") {
      const clerkId = evt.data.id;
      const email = evt.data.email_addresses?.[0]?.email_address ?? `${clerkId}@clipmine.fr`;
      await prisma.user.upsert({
        where: { clerkId },
        update: {},
        create: { clerkId, email },
      });
    }
  } catch (e) {
    console.error("[clerk-webhook] handler error", e);
  }

  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";
