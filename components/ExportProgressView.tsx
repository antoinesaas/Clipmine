"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  PIPELINE_UI_STAGES,
  computeProgressPercent,
  estimateRemainingSeconds,
  ffmpegStepLabels,
  formatEta,
  resolveStage,
  type PipelineStageId,
} from "@/lib/pipeline-progress";
import type { AiToolId } from "@/lib/video-tools";
import { AI_TOOL_LABELS } from "@/lib/video-tools";
import { openExportUrl } from "@/lib/open-export-url";

type JobStatus = {
  status: string;
  pipelineStage?: string | null;
  fileUrl?: string | null;
  errorMessage?: string | null;
  createdAt?: string | null;
  pipelineReady?: boolean;
  waitlist?: boolean;
};

export default function ExportProgressView({
  jobId,
  title,
  quality,
  ratio,
  tools,
}: {
  jobId: string;
  title: string;
  quality: string;
  ratio: string;
  tools: AiToolId[];
}) {
  const [data, setData] = useState<JobStatus | null>(null);
  const [displayPct, setDisplayPct] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const [, setTick] = useState(0);

  async function downloadFile() {
    setDownloading(true);
    try {
      const r = await fetch(`/api/download/${jobId}/file`);
      const json = await r.json();
      if (!r.ok || !json.fileUrl) {
        throw new Error(json.error ?? "file_missing");
      }
      openExportUrl(json.fileUrl);
    } catch {
      if (data?.fileUrl) {
        openExportUrl(data.fileUrl);
        return;
      }
      toast.error("Impossible d'ouvrir le fichier — réessaie depuis Mes exports.");
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const r = await fetch(`/api/download/${jobId}/status`);
        if (!r.ok) return;
        const json = await r.json();
        if (!cancelled) {
          setData(json);
          if (json.createdAt) {
            const t = new Date(json.createdAt).getTime();
            if (!Number.isNaN(t)) startedAtRef.current = t;
          }
        }
      } catch {
        /* retry */
      }
    }
    poll();
    const id = setInterval(poll, 2000);
    const anim = setInterval(() => setTick((t) => t + 1), 500);
    return () => {
      cancelled = true;
      clearInterval(id);
      clearInterval(anim);
    };
  }, [jobId]);

  const stage = resolveStage(data?.status ?? "processing", data?.pipelineStage);
  const failed = stage === "failed" || data?.status === "failed";
  const ready = stage === "ready" || data?.status === "ready";
  const stalled =
    !ready &&
    !failed &&
    (data?.status === "queued" || data?.waitlist) &&
    Date.now() - startedAtRef.current > 45_000;
  const activeTools = tools.filter((t) => t !== "stabilize");

  useEffect(() => {
    if (ready) {
      setDisplayPct(100);
      return;
    }
    const elapsed = Date.now() - startedAtRef.current;
    const next = computeProgressPercent(stage, elapsed, activeTools.length);
    setDisplayPct((prev) => Math.max(prev, next));
  }, [stage, ready, activeTools.length, data?.pipelineStage, data?.status]);

  const elapsed = Date.now() - startedAtRef.current;
  const etaSec = ready ? 0 : estimateRemainingSeconds(stage, elapsed, activeTools.length);
  const ffmpegSteps = ffmpegStepLabels(tools);

  return (
    <div className="export-progress-page">
      <div className="export-progress-card">
        <div className="export-progress-header">
          <span className="export-progress-pulse" aria-hidden />
          <div>
            <h1>
              {failed
                ? "Export échoué"
                : ready
                  ? "Clip prêt"
                  : "Préparation de votre téléchargement"}
            </h1>
            <p className="export-progress-title">{title}</p>
            <p className="export-progress-meta">
              {ratio} · {quality}
              {activeTools.length > 0 &&
                ` · ${activeTools.length} modèle${activeTools.length > 1 ? "s" : ""} IA`}
            </p>
          </div>
        </div>

        <div className="export-progress-bar-wrap">
          <div
            className="export-progress-bar-fill"
            style={{ width: `${displayPct}%` }}
            role="progressbar"
            aria-valuenow={displayPct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="export-progress-stats">
          <span className="export-progress-pct">{displayPct}%</span>
          {!ready && !failed && (
            <span className="export-progress-eta">Temps restant {formatEta(etaSec)}</span>
          )}
        </div>

        <ol className="export-progress-steps">
          {PIPELINE_UI_STAGES.map((step) => {
            const stepId = step.id;
            const idx = PIPELINE_UI_STAGES.findIndex((x) => x.id === stepId);
            const currentIdx = PIPELINE_UI_STAGES.findIndex((x) => x.id === stage);
            const done = currentIdx > idx || ready;
            const active = stepId === stage && !ready && !failed;

            return (
              <li
                key={step.id}
                className={`export-progress-step ${done ? "done" : ""} ${active ? "active" : ""}`}
              >
                <span className="export-progress-step-dot" />
                <span className="export-progress-step-label">{step.label}</span>
                {active && stepId === "ffmpeg" && (
                  <ul className="export-progress-substeps">
                    {ffmpegSteps.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>

        {activeTools.length > 0 && (
          <div className="export-progress-tools">
            {activeTools.map((id) => (
              <span key={id} className="export-progress-tool-chip">
                {AI_TOOL_LABELS[id].model}
              </span>
            ))}
          </div>
        )}

        {failed && (
          <div className="export-progress-error">
            <p>{data?.errorMessage ?? "Export échoué."}</p>
            {/téléchargement|youtube|privée|réseau/i.test(data?.errorMessage ?? "") && (
              <p className="export-progress-error-tip">
                Essaie un autre clip (Movieclips / scene pack), ou colle un lien YouTube direct.
                Les blocages YouTube côté serveur nécessitent parfois des cookies sur Fly (
                <code>YT_COOKIES_BASE64</code>).
              </p>
            )}
            <Link href="/app/search" className="btn-mine">
              Nouvelle recherche
            </Link>
          </div>
        )}

        {stalled && (
          <div className="export-progress-error">
            <p>L&apos;export met plus de temps que prévu. Le worker vidéo est peut‑être en réveil — patiente encore un peu.</p>
            <Link href="/app/exports" className="export-progress-link">
              Voir mes exports
            </Link>
          </div>
        )}

        {ready && (
          <div className="export-progress-done">
            <p>Export terminé.</p>
            <button
              type="button"
              className="btn-mine"
              disabled={downloading}
              onClick={() => void downloadFile()}
            >
              {downloading ? "Ouverture…" : "Télécharger le clip"}
            </button>
            <Link href="/app/exports" className="export-progress-link">
              Voir tous mes exports
            </Link>
          </div>
        )}

        {!ready && !failed && !stalled && (
          <p className="export-progress-hint">
            Tu peux quitter cette page — l&apos;export continue en arrière-plan.
          </p>
        )}
      </div>
    </div>
  );
}
