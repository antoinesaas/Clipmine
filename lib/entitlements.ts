import { prisma } from "./prisma";

// ============================================
//  COEUR DE LA MONÉTISATION
//  Stratégie agressive : 1 export 4K offert,
//  puis paywall. C'est le wedge qui détruit
//  la concurrence (qui fait payer dès le départ).
// ============================================

export const PLAN_QUOTAS = {
  FREE: { monthly: 0, allowEnhance: false, allowBroll: false }, // 0 récurrent, mais 1 free one-shot
  CREATOR: { monthly: 50, allowEnhance: true, allowBroll: false },
  PRO: { monthly: Infinity, allowEnhance: true, allowBroll: true },
} as const;

export type Entitlement = {
  allowed: boolean;
  reason?: "needs_upgrade" | "quota_reached" | "needs_credits";
  source?: "free_4k" | "monthly_quota" | "bonus_credits";
  remaining?: number;
};

/**
 * Décide si un user peut lancer un export 4K.
 * Ordre de priorité :
 *   1. Le 1er export 4K gratuit (jamais utilisé) -> OUI
 *   2. Quota mensuel du plan -> OUI si reste du quota
 *   3. Crédits bonus achetés -> OUI si crédits > 0
 *   4. Sinon -> paywall
 */
export async function checkExportEntitlement(userId: string): Promise<Entitlement> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { allowed: false, reason: "needs_upgrade" };

  // 1) Le fameux export 4K offert
  if (!user.freeExportUsed) {
    return { allowed: true, source: "free_4k" };
  }

  const quota = PLAN_QUOTAS[user.plan as keyof typeof PLAN_QUOTAS].monthly;

  // 2) Quota mensuel du plan
  if (user.exportsThisMonth < quota) {
    return {
      allowed: true,
      source: "monthly_quota",
      remaining: quota === Infinity ? Infinity : quota - user.exportsThisMonth,
    };
  }

  // 3) Crédits bonus
  if (user.bonusCredits > 0) {
    return { allowed: true, source: "bonus_credits", remaining: user.bonusCredits };
  }

  // 4) Paywall
  return {
    allowed: false,
    reason: user.plan === "FREE" ? "needs_upgrade" : "quota_reached",
  };
}

/** À appeler APRÈS un export réussi pour décrémenter le bon compteur. */
export async function consumeExport(userId: string, source: Entitlement["source"]) {
  if (source === "free_4k") {
    await prisma.user.update({ where: { id: userId }, data: { freeExportUsed: true } });
  } else if (source === "monthly_quota") {
    await prisma.user.update({
      where: { id: userId },
      data: { exportsThisMonth: { increment: 1 } },
    });
  } else if (source === "bonus_credits") {
    await prisma.user.update({
      where: { id: userId },
      data: { bonusCredits: { decrement: 1 } },
    });
  }
}
