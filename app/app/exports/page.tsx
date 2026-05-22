"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { loadExportsLocal } from "@/components/SearchPanel";

type ExportJob = {
  id: string;
  title: string;
  ratio: string;
  status: string;
  date: string;
  fileUrl?: string;
  errorMessage?: string | null;
};

export default function ExportsPage() {
  const [exports, setExports] = useState<ExportJob[]>([]);

  const refresh = useCallback(async () => {
    const local = loadExportsLocal() as ExportJob[];
    const updated = await Promise.all(
      local.map(async (job) => {
        if (job.status === "ready" && job.fileUrl) return job;
        if (!job.id || job.id.startsWith("waitlist-") || job.id.startsWith("error-")) return job;
        try {
          const r = await fetch(`/api/download/${job.id}/status`);
          if (!r.ok) return job;
          const data = await r.json();
          return {
            ...job,
            status: data.status ?? job.status,
            fileUrl: data.fileUrl ?? job.fileUrl,
            errorMessage: data.errorMessage ?? job.errorMessage,
          };
        } catch {
          return job;
        }
      }),
    );
    setExports(updated);
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 8000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <div className="app-page-min">
      <header className="app-hero-min">
        <h1>Mes exports</h1>
        <p>Clips en 9:16 · 4K · pipeline IA</p>
      </header>

      {exports.length === 0 ? (
        <div className="empty-state">
          <p>Aucun export.</p>
          <Link href="/app/search" className="btn btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
            Chercher une scène
          </Link>
        </div>
      ) : (
        <div className="export-list">
          {exports.map((e) => (
            <div key={e.id} className="export-row">
              <div>
                <div className="export-row-title">{e.title}</div>
                <div className="export-row-meta">
                  {e.ratio} ·{" "}
                  {e.status === "ready"
                    ? "Prêt"
                    : e.status === "processing"
                      ? "Pipeline IA en cours…"
                      : e.status === "failed"
                        ? "Échec"
                        : "En attente"}
                  {e.date && ` · ${new Date(e.date).toLocaleDateString("fr-FR")}`}
                </div>
                {e.status === "failed" && e.errorMessage && (
                  <p className="export-row-err">{e.errorMessage}</p>
                )}
              </div>
              {e.status === "ready" && e.fileUrl && (
                <a href={e.fileUrl} className="btn-mine" target="_blank" rel="noopener noreferrer">
                  Télécharger
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
