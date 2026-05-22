/**
 * Source unique : tarifs affichés + limites réelles (entitlements.ts).
 * Promo -40% sur les prix publics d'origine.
 */

export const PRICING = {
  CREATOR: {
    plan: "CREATOR" as const,
    name: "Creator",
    priceMonthly: 5.49,
    priceWas: 9,
    discountLabel: "-40%",
    stripeAmountCents: 549,
    monthlyExports: 50,
    tagline: "Pour les éditeurs actifs",
  },
  PRO: {
    plan: "PRO" as const,
    name: "Pro",
    priceMonthly: 14.99,
    priceWas: 24,
    discountLabel: "-40%",
    stripeAmountCents: 1499,
    monthlyExports: null as null,
    tagline: "Pour les power users",
  },
  CREDITS_10: {
    plan: "CREDITS_10" as const,
    name: "10 exports",
    priceOnce: 1.19,
    priceWas: 1.99,
    discountLabel: "-40%",
    stripeAmountCents: 119,
    exports: 10,
    tagline: "Sans abonnement",
  },
} as const;

export const APP_TOOLS = [
  { id: "search", label: "Recherche films & séries" },
  { id: "crop", label: "Recadrage 9:16 / 16:9" },
  { id: "upscale", label: "Upscale Starlight 4K" },
  { id: "enhance", label: "Enhance Proteus" },
  { id: "denoise", label: "Denoise Nyx" },
  { id: "stabilize", label: "Stabilisation Themis" },
  { id: "fps", label: "Interpolation Aion 60fps" },
  { id: "slowmo", label: "Slow-motion Chronos" },
] as const;

export function formatPrice(n: number) {
  const s = n.toFixed(2).replace(".", ",");
  return s.endsWith(",00") ? `${Math.round(n)}€` : `${s}€`;
}

type Bullet = { text: string; bold?: boolean; off?: boolean };

export function planBullets(plan: "FREE" | "CREATOR" | "PRO"): Bullet[] {
  if (plan === "FREE") {
    return [
      { text: "Recherches illimitées" },
      { text: "1 export 4K offert", bold: true },
      { text: "Recadrage 9:16 / 16:9" },
      { text: "Upscale & modèles IA", off: true },
      { text: "Denoise, 60fps, stabilisation", off: true },
    ];
  }
  if (plan === "CREATOR") {
    return [
      { text: "Tout du plan Free", bold: true },
      { text: "50 exports 4K / mois", bold: true },
      { text: "Upscale, Enhance, Denoise, Stabilisation" },
      { text: "Interpolation 60fps (Aion)" },
      { text: "Slow-motion Chronos", off: true },
    ];
  }
  return [
    { text: "Tout du plan Creator", bold: true },
    { text: "Exports 4K illimités", bold: true },
    { text: "Tous les modèles IA (dont Chronos slow-mo)" },
    { text: "Support prioritaire par email" },
  ];
}
