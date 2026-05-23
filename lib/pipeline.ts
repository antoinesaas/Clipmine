import { hasWorker } from "@/lib/constants";
import { hasDatabase } from "@/lib/prisma";
import { hasR2 } from "@/lib/r2";

/** Pipeline complet : DB + worker Fly + stockage R2. */
export function isPipelineReady(): boolean {
  return hasDatabase && hasWorker() && hasR2;
}

export function pipelineBlockMessage(): string {
  if (!hasDatabase) return "Base de données non configurée.";
  if (!hasWorker()) return "Worker vidéo non connecté (WORKER_URL sur Vercel).";
  if (!hasR2) return "Stockage export non configuré (R2).";
  return "Pipeline indisponible.";
}
