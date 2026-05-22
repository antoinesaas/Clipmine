import type { AiToolId } from "@/lib/video-tools";
import { AI_TOOL_LABELS } from "@/lib/video-tools";

/** Étapes affichées dans l'UI (pas d'« envoi cloud »). */
export type PipelineStageId = "queued" | "download" | "ffmpeg" | "ready" | "failed";

export const PIPELINE_UI_STAGES: { id: PipelineStageId; label: string; weight: number }[] = [
  { id: "queued", label: "Mise en file d'attente", weight: 0.05 },
  { id: "download", label: "Téléchargement YouTube", weight: 0.3 },
  { id: "ffmpeg", label: "Outils IA (ffmpeg)", weight: 0.6 },
  { id: "ready", label: "Export prêt", weight: 0.05 },
];

const STAGE_ORDER: PipelineStageId[] = ["queued", "download", "ffmpeg", "ready"];

export function resolveStage(
  status: string,
  pipelineStage?: string | null,
): PipelineStageId {
  if (status === "ready") return "ready";
  if (status === "failed") return "failed";
  const raw = (pipelineStage ?? "download").toLowerCase();
  if (raw === "upload") return "ffmpeg";
  if (STAGE_ORDER.includes(raw as PipelineStageId)) return raw as PipelineStageId;
  if (status === "processing") return "download";
  return "queued";
}

export function stageIndex(id: PipelineStageId): number {
  return STAGE_ORDER.indexOf(id);
}

export function ffmpegStepLabels(tools: AiToolId[]): string[] {
  const lines = ["Décodage de la source YouTube"];
  for (const id of tools) {
    lines.push(`${AI_TOOL_LABELS[id].model} — ${AI_TOOL_LABELS[id].name}`);
  }
  lines.push("Encodage final MP4");
  return lines;
}

/** Durées estimées (secondes) pour l'ETA. */
export function estimatedTotalSeconds(toolCount: number): number {
  return 50 + 55 + 90 + toolCount * 22;
}

export function stageBasePercent(stage: PipelineStageId): number {
  let pct = 0;
  for (const s of PIPELINE_UI_STAGES) {
    if (s.id === stage) {
      return Math.min(99, Math.round(pct * 100));
    }
    pct += s.weight;
  }
  return stage === "ready" ? 100 : 0;
}

/** Progression stable : avance avec le temps dans l'étape, jamais en arrière. */
export function computeProgressPercent(
  stage: PipelineStageId,
  elapsedMs: number,
  toolCount: number,
): number {
  if (stage === "ready") return 100;
  if (stage === "failed") return 0;

  const total = estimatedTotalSeconds(toolCount) * 1000;
  const base = stageBasePercent(stage);
  const stageIdx = stageIndex(stage);
  const stageWeight = PIPELINE_UI_STAGES.find((s) => s.id === stage)?.weight ?? 0.2;
  const stageDuration = stageWeight * total;
  const inStage = Math.min(0.92, elapsedMs / Math.max(stageDuration, 8000));
  const nextBase =
    stageIdx < STAGE_ORDER.length - 1
      ? stageBasePercent(STAGE_ORDER[stageIdx + 1]!)
      : 100;
  const raw = base + (nextBase - base) * inStage;
  return Math.min(stage === "ffmpeg" ? 96 : 98, Math.round(raw));
}

export function formatEta(seconds: number): string {
  if (seconds <= 0) return "quelques secondes";
  if (seconds < 60) return `~${seconds} s`;
  const m = Math.ceil(seconds / 60);
  return m === 1 ? "~1 min" : `~${m} min`;
}

export function estimateRemainingSeconds(
  stage: PipelineStageId,
  elapsedMs: number,
  toolCount: number,
): number {
  if (stage === "ready") return 0;
  const total = estimatedTotalSeconds(toolCount);
  const spent = Math.floor(elapsedMs / 1000);
  return Math.max(5, total - spent);
}
