"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

type ExportJob = {
  id: string;
  title: string;
  ratio: string;
  quality?: string;
  status: string;
  pipelineStage?: string | null;
  errorMessage?: string | null;
  fileUrl?: string | null;
  createdAt: string;
};

function ExportsContent() {
  const searchParams = useSearchParams();
  const [exports, setExports] = useState<ExportJob[]>([]);
  const [bonusCredits, setBonusCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redownloading, setRedownloading] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/exports");
      if (!r.ok) return;
      const data = await r.json();
      setExports(data.exports ?? []);
      setBonusCredits(data.bonusCredits ?? 0);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 6000);
    return () => clearInterval(t);
  }, [refresh]);

  useEffect(() => {
    if (searchParams.get("credits_purchased") === "1") {
      toast.success("10 exports ajoutés à ton compte !");
      window.history.replaceState({}, "", "/app/exports");
      refresh();
    }
  }, [searchParams, refresh]);

  async function redownload(id: string) {
    setRedownloading(id);
    try {
      const r = await fetch(`/api/download/${id}/file`);
      const data = await r.json();
      if (!r.ok || !data.fileUrl) {
        toast.error(data.error ?? "Lien indisponible.");
        return;
      }
      window.open(data.fileUrl, "_blank", "noopener,noreferrer");
      await refresh();
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setRedownloading(null);
    }
  }

  return (
    <div className="app-page-min app-page-exports">
      <header className="app-hero-min">
        <h1>Mes exports</h1>
        <p>15 derniers clips · retéléchargement · 4K pipeline IA</p>
      </header>

      {bonusCredits > 0 && (
        <div className="exports-credits-banner">
          <strong>{bonusCredits} export{bonusCredits > 1 ? "s" : ""} bonus</strong>
          <span>Crédits achetés — utilisables sans abonnement</span>
        </div>
      )}

      {loading ? (
        <div className="empty-state">Chargement…</div>
      ) : exports.length === 0 ? (
        <div className="empty-state">
          <p>Aucun export pour l&apos;instant.</p>
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
                  {e.ratio}
                  {e.quality ? ` · ${e.quality}` : ""} ·{" "}
                  {e.status === "ready"
                    ? "Prêt"
                    : e.status === "processing"
                      ? "Pipeline en cours…"
                      : e.status === "failed"
                        ? "Échec"
                        : "En attente"}
                  {e.createdAt &&
                    ` · ${new Date(e.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                </div>
                {e.status === "processing" && e.pipelineStage && (
                  <p className="export-row-stage">Étape : {stageLabel(e.pipelineStage)}</p>
                )}
                {e.status === "failed" && e.errorMessage && (
                  <p className="export-row-err">{e.errorMessage}</p>
                )}
              </div>
              <div className="export-row-actions">
                {e.status === "ready" && (
                  <button
                    type="button"
                    className="btn-mine"
                    disabled={redownloading === e.id}
                    onClick={() => redownload(e.id)}
                  >
                    {redownloading === e.id ? "…" : "Retélécharger"}
                  </button>
                )}
                {e.status === "processing" && (
                  <Link href={`/app/export/${e.id}`} className="btn-mine btn-mine-ghost">
                    Suivre
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="exports-retention-hint">
        Seuls tes <strong>15 exports les plus récents</strong> sont conservés. Les plus anciens sont supprimés
        automatiquement.
      </p>
    </div>
  );
}

function stageLabel(stage: string) {
  const map: Record<string, string> = {
    download: "Téléchargement YouTube",
    ffmpeg: "Pipeline IA",
    upload: "Envoi cloud",
    ready: "Terminé",
    queued: "File d'attente",
  };
  return map[stage] ?? stage;
}

export default function ExportsPage() {
  return (
    <Suspense fallback={<div className="app-page-min empty-state">Chargement…</div>}>
      <ExportsContent />
    </Suspense>
  );
}
