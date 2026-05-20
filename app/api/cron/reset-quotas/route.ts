import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cron/reset-quotas
// Déclenché par Vercel Cron le 1er de chaque mois (voir vercel.json).
// Protégé par le header Authorization: Bearer CRON_SECRET.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await prisma.user.updateMany({ data: { exportsThisMonth: 0 } });
  return NextResponse.json({ ok: true });
}
