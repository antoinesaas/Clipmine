import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, hasDatabase } from "@/lib/prisma";
import { ensureDbUser } from "@/lib/ensure-user";
import { PLAN_QUOTAS } from "@/lib/entitlements";
import { isPipelineReady } from "@/lib/pipeline";

// GET /api/me — renvoie l'état de l'utilisateur courant.
// Si la base de données n'est pas configurée, on renvoie un état "waitlist" par défaut
// pour que l'UI puisse continuer à fonctionner sans crash.
export async function GET() {
  const { userId: clerkId } = auth();
  if (!clerkId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const pipelineReady = isPipelineReady();

  if (!hasDatabase) {
    return NextResponse.json({
      plan: "FREE",
      freeExportAvailable: true,
      exportsThisMonth: 0,
      monthlyQuota: PLAN_QUOTAS.FREE.monthly,
      bonusCredits: 0,
      pipelineReady: false,
      waitlist: true,
    });
  }

  try {
    const user = await ensureDbUser(clerkId);

    const quota = PLAN_QUOTAS[user.plan as keyof typeof PLAN_QUOTAS].monthly;
    return NextResponse.json({
      plan: user.plan,
      freeExportAvailable: !user.freeExportUsed,
      exportsThisMonth: user.exportsThisMonth,
      monthlyQuota: quota === Infinity ? null : quota,
      bonusCredits: user.bonusCredits,
      pipelineReady,
      waitlist: !pipelineReady,
    });
  } catch (e) {
    console.error("[/api/me] DB error", e);
    return NextResponse.json({
      plan: "FREE",
      freeExportAvailable: true,
      exportsThisMonth: 0,
      monthlyQuota: PLAN_QUOTAS.FREE.monthly,
      bonusCredits: 0,
      pipelineReady: false,
      waitlist: true,
    });
  }
}

export const dynamic = "force-dynamic";
