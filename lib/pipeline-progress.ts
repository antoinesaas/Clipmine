import type { AiToolId } from "@/lib/video-tools";
import { AI_TOOL_LABELS } from "@/lib/video-tools";

export type PipelineStageId =
  | "queued"
  | "download"
  | "ffmpeg"
  | "upload"
  | "ready"
  | "failed";

export const PIPELINE_STAGES: { id: PipelineStageId; label: string; pct: number }[] = [
  { id: "queued", label: "Mise en file d'attente", pct: 5 },
  { id: "download", label: "Téléchargement YouTube", pct: 28 },
  { id: "ffmpeg", label: "Pipeline IA (ffmpeg)", pct: 72 },
  { id: "upload", label: "Envoi vers le cloud", pct: 92 },
  { id: "ready", label: "Export prêt", pct: 100 },
];

export function stageIndex(id: PipelineStageId): number {
  return PIPELINE_STAGES.findIndex((s) => s.id === id);
}

export function resolveStage(
  status: string,
  pipelineStage?: string | null,
): PipelineStageId {
  if (status === "ready") return "ready";
  if (status === "failed") return "failed";
  const s = (pipelineStage ?? "download") as PipelineStageId;
  if (PIPELINE_STAGES.some((x) => x.id === s)) return s;
  if (status === "processing") return "download";
  return "queued";
}

export function ffmpegStepLabels(tools: AiToolId[]): string[] {
  const lines = ["Décodage de la source YouTube"];
  for (const id of tools) {
    lines.push(`${AI_TOOL_LABELS[id].model} — ${AI_TOOL_LABELS[id].name}`);
  }
  lines.push("Encodage final MP4");
  return lines;
}

export function progressPercent(stage: PipelineStageId, subProgress = 0): number {
  const idx = stageIndex(stage);
  if (idx < 0) return 8;
  const base = PIPELINE_STAGES[idx]?.pct ?? 5;
  const next = PIPELINE_STAGES[idx + 1]?.pct ?? 100;
  return Math.min(100, Math.round(base + (next - base) * subProgress));
}
