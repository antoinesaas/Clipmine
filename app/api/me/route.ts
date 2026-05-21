import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma, hasDatabase } from "@/lib/prisma";
import { PLAN_QUOTAS } from "@/lib/entitlements";

// GET /api/me — renvoie l'état de l'utilisateur courant.
// Si la base de données n'est pas configurée, on renvoie un état "waitlist" par défaut
// pour que l'UI puisse continuer à fonctionner sans crash.
export async function GET() {
  const { userId: clerkId } = auth();
  if (!clerkId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!hasDatabase) {
    return NextResponse.json({
      plan: "FREE",
      freeExportAvailable: true,
      exportsThisMonth: 0,
      monthlyQuota: PLAN_QUOTAS.FREE.monthly,
      bonusCredits: 0,
      waitlist: true,
    });
  }

  try {
    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      const cu = await currentUser();
      user = await prisma.user.create({
        data: { clerkId, email: cu?.emailAddresses[0]?.emailAddress ?? `${clerkId}@clipmine.fr` },
      });
    }

    const quota = PLAN_QUOTAS[user.plan as keyof typeof PLAN_QUOTAS].monthly;
    return NextResponse.json({
      plan: user.plan,
      freeExportAvailable: !user.freeExportUsed,
      exportsThisMonth: user.exportsThisMonth,
      monthlyQuota: quota === Infinity ? null : quota,
      bonusCredits: user.bonusCredits,
    });
  } catch (e) {
    console.error("[/api/me] DB error", e);
    return NextResponse.json({
      plan: "FREE",
      freeExportAvailable: true,
      exportsThisMonth: 0,
      monthlyQuota: PLAN_QUOTAS.FREE.monthly,
      bonusCredits: 0,
      waitlist: true,
    });
  }
}

export const dynamic = "force-dynamic";
