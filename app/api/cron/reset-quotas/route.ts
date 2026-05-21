import { NextRequest, NextResponse } from "next/server";
import { prisma, hasDatabase } from "@/lib/prisma";

// GET /api/cron/reset-quotas
// Déclenché par Vercel Cron le 1er de chaque mois (voir vercel.json).
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasDatabase) return NextResponse.json({ ok: true, skipped: "no_db" });

  try {
    await prisma.user.updateMany({ data: { exportsThisMonth: 0 } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[cron] reset-quotas error", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
