/** Outils IA ClipMine — exécutés sur le worker (ffmpeg). */

export const AI_TOOL_IDS = [
  "upscale",
  "enhance",
  "denoise",
  "stabilize",
  "fps",
  "slowmo",
] as const;

export type AiToolId = (typeof AI_TOOL_IDS)[number];

export const AI_TOOL_LABELS: Record<AiToolId, { name: string; model: string; desc: string }> = {
  upscale: { name: "Upscale 4K", model: "Starlight", desc: "Montée en 4K (Lanczos + netteté)" },
  enhance: { name: "Enhance", model: "Proteus", desc: "Contraste, saturation, micro-détails" },
  denoise: { name: "Denoise", model: "Nyx", desc: "Réduction du bruit numérique" },
  stabilize: {
    name: "Stabilisation",
    model: "Themis",
    desc: "Bientôt — utilise Denoise + Enhance en attendant",
  },
  fps: { name: "60 fps", model: "Aion", desc: "Fluidification du mouvement" },
  slowmo: { name: "Slow-motion", model: "Chronos", desc: "Ralenti cinéma (Pro)" },
};

export type PlanTier = "FREE" | "CREATOR" | "PRO";

/** Outils autorisés selon le plan (enhance = pipeline IA activé). */
export function allowedToolsForPlan(plan: PlanTier, enhance: boolean): AiToolId[] {
  if (!enhance) return [];
  if (plan === "PRO") return ["upscale", "enhance", "denoise", "fps", "slowmo"];
  if (plan === "CREATOR") return ["upscale", "enhance", "denoise", "fps"];
  // 1er export free : upscale + enhance + denoise
  return ["upscale", "enhance", "denoise"];
}

export function defaultToolsForPlan(plan: PlanTier, enhance: boolean): AiToolId[] {
  return allowedToolsForPlan(plan, enhance);
}

export function sanitizeTools(
  requested: unknown,
  plan: PlanTier,
  enhance: boolean,
): AiToolId[] {
  const allowed = new Set(allowedToolsForPlan(plan, enhance));
  if (!enhance || allowed.size === 0) return [];

  const list = Array.isArray(requested) ? requested : defaultToolsForPlan(plan, enhance);
  const picked = list.filter((t): t is AiToolId =>
    typeof t === "string" && (AI_TOOL_IDS as readonly string[]).includes(t) && allowed.has(t as AiToolId),
  );
  return picked.length ? picked : defaultToolsForPlan(plan, enhance);
}
