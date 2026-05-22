"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  PIPELINE_STAGES,
  ffmpegStepLabels,
  progressPercent,
  resolveStage,
  type PipelineStageId,
} from "@/lib/pipeline-progress";
import type { AiToolId } from "@/lib/video-tools";
import { AI_TOOL_LABELS } from "@/lib/video-tools";

type JobStatus = {
  status: string;
  pipelineStage?: string | null;
  fileUrl?: string | null;
  errorMessage?: string | null;
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
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const r = await fetch(`/api/download/${jobId}/status`);
        if (!r.ok) return;
        const json = await r.json();
        if (!cancelled) setData(json);
      } catch {
        /* retry */
      }
    }
    poll();
    const id = setInterval(poll, 2000);
    const anim = setInterval(() => setTick((t) => t + 1), 400);
    return () => {
      cancelled = true;
      clearInterval(id);
      clearInterval(anim);
    };
  }, [jobId]);

  const stage = resolveStage(data?.status ?? "processing", data?.pipelineStage);
  const failed = stage === "failed" || data?.status === "failed";
  const ready = stage === "ready" || data?.status === "ready";

  const subProgress = useMemo(() => {
    if (ready) return 1;
    if (stage === "ffmpeg") return 0.35 + (tick % 8) * 0.08;
    if (stage === "download") return 0.2 + (tick % 6) * 0.1;
    if (stage === "upload") return 0.5 + (tick % 4) * 0.12;
    return (tick % 5) * 0.15;
  }, [stage, ready, tick]);

  const pct = progressPercent(stage, subProgress);
  const ffmpegSteps = ffmpegStepLabels(tools);

  return (
    <div className="export-progress-page">
      <div className="export-progress-card">
        <div className="export-progress-header">
          <span className="export-progress-pulse" aria-hidden />
          <div>
            <h1>Pipeline en cours</h1>
            <p className="export-progress-title">{title}</p>
            <p className="export-progress-meta">
              {ratio} · {quality}
              {tools.length > 0 && ` · ${tools.length} modèle${tools.length > 1 ? "s" : ""} IA`}
            </p>
          </div>
        </div>

        <div className="export-progress-bar-wrap">
          <div
            className="export-progress-bar-fill"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="export-progress-pct">{pct}%</p>

        <ol className="export-progress-steps">
          {PIPELINE_STAGES.filter((s) => s.id !== "failed").map((step) => {
            const stepId = step.id as PipelineStageId;
            const idx = PIPELINE_STAGES.findIndex((x) => x.id === stepId);
            const currentIdx = PIPELINE_STAGES.findIndex((x) => x.id === stage);
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
                {active && stepId === "download" && (
                  <p className="export-progress-sub">yt-dlp · contournement anti-bot</p>
                )}
              </li>
            );
          })}
        </ol>

        {tools.length > 0 && (
          <div className="export-progress-tools">
            {tools.map((id) => (
              <span key={id} className="export-progress-tool-chip">
                {AI_TOOL_LABELS[id].model}
              </span>
            ))}
          </div>
        )}

        {failed && (
          <div className="export-progress-error">
            <p>{data?.errorMessage ?? "Export échoué."}</p>
            <Link href="/app/search" className="btn-mine">
              Nouvelle recherche
            </Link>
          </div>
        )}

        {ready && data?.fileUrl && (
          <div className="export-progress-done">
            <p>Export terminé.</p>
            <a href={data.fileUrl} className="btn-mine" target="_blank" rel="noopener noreferrer">
              Télécharger le clip
            </a>
            <Link href="/app/exports" className="export-progress-link">
              Voir tous mes exports
            </Link>
          </div>
        )}

        {!ready && !failed && (
          <p className="export-progress-hint">
            Tu peux quitter cette page — l&apos;export continue en arrière-plan.
          </p>
        )}
      </div>
    </div>
  );
}
