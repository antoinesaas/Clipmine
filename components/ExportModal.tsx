"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { PRICING, formatPrice } from "@/lib/plans";
import type { ClipResult } from "./SearchPanel";
import { saveExportLocal } from "./SearchPanel";
import { embedUrl, thumbForId } from "@/lib/demo-clips";
import {
  AI_TOOL_IDS,
  AI_TOOL_LABELS,
  allowedToolsForPlan,
  defaultToolsForPlan,
  type AiToolId,
  type PlanTier,
} from "@/lib/video-tools";
import PrimeBuyButton from "@/components/PrimeBuyButton";
import { shouldShowPrimeBuy } from "@/lib/clip-text";
import { EXPORT_QUALITIES, type ExportQuality } from "@/lib/export-quality";

function useBodyLock(open: boolean) {
  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [open]);
}

function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}

function ClipVideo({ youtubeId, title }: { youtubeId: string; title: string }) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (mobile) {
    return (
      <a
        className="modal-video modal-video-link"
        href={`https://www.youtube.com/watch?v=${youtubeId}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={thumbForId(youtubeId)} alt={title} />
        <span className="modal-video-play" aria-hidden>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="modal-video-label">Lire sur YouTube</span>
      </a>
    );
  }

  return (
    <div className="modal-video">
      <iframe
        src={embedUrl(youtubeId)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function ModalShell({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEscape(onClose);

  if (!mounted) return null;

  return createPortal(
    <>
      <button type="button" className="overlay-backdrop" onClick={onClose} aria-label="Fermer" />
      <div className="clip-sheet" role="dialog" aria-modal="true">
        {children}
      </div>
    </>,
    document.body,
  );
}

export function ExportModal({
  clip,
  plan: planProp = "FREE",
  waitlist,
  onClose,
  onPaywall,
  onDone,
}: {
  clip: ClipResult;
  plan?: PlanTier;
  waitlist?: boolean;
  onClose: () => void;
  onPaywall: () => void;
  onDone: () => void;
}) {
  const plan = planProp;
  const [ratio, setRatio] = useState("9:16");
  const [quality, setQuality] = useState<ExportQuality>("4K");
  const [enhance, setEnhance] = useState(true);
  const [busy, setBusy] = useState(false);
  const allowed = allowedToolsForPlan(plan, enhance);
  const [tools, setTools] = useState<AiToolId[]>(() => defaultToolsForPlan(plan, true));

  useBodyLock(true);

  function toggleTool(id: AiToolId) {
    if (!allowed.includes(id)) return;
    setTools((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  function setEnhanceOn(on: boolean) {
    setEnhance(on);
    if (on) setTools(defaultToolsForPlan(plan, true));
    else setTools([]);
  }

  async function exportClip() {
    setBusy(true);
    try {
      const r = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeId: clip.youtubeId,
          title: clip.title,
          ratio,
          quality,
          enhance,
          tools: enhance ? tools : [],
        }),
      });
      if (r.status === 402) {
        onPaywall();
        return;
      }
      const data = await r.json();
      if (!r.ok && r.status !== 200) {
        toast.error(data.message ?? "Erreur export");
        return;
      }
      saveExportLocal({
        id: data.jobId ?? String(Date.now()),
        title: clip.title,
        ratio,
        status: data.status ?? "queued",
        date: new Date().toISOString(),
      });
      toast.success(data.message ?? "Export lancé !");
      onDone();
      onClose();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell onClose={onClose}>
      <button type="button" className="clip-sheet-close" onClick={onClose} aria-label="Fermer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <ClipVideo youtubeId={clip.youtubeId} title={clip.title} />

      <h3 className="clip-sheet-title">{clip.movie ?? clip.title}</h3>
      {clip.scene && <p className="modal-scene">{clip.scene}</p>}
      {clip.transcript && (
        <p className="modal-quote">&ldquo;{clip.transcript}&rdquo;</p>
      )}

      {waitlist && (
        <div className="waitlist-inline">
          Pipeline en activation — export en file d&apos;attente.
        </div>
      )}

      {shouldShowPrimeBuy(clip) && (
        <div className="modal-prime-row">
          <PrimeBuyButton />
        </div>
      )}

      <div className="field-label">Format export</div>
      <div className="ratio-row">
        {["9:16", "16:9", "4:3"].map((rt) => (
          <button
            key={rt}
            type="button"
            className={`ratio-opt ${ratio === rt ? "on" : ""}`}
            onClick={() => setRatio(rt)}
          >
            {rt}
          </button>
        ))}
      </div>

      <div className="field-label">Qualité</div>
      <div className="ratio-row">
        {EXPORT_QUALITIES.map((q) => (
          <button
            key={q}
            type="button"
            className={`ratio-opt ${quality === q ? "on" : ""}`}
            onClick={() => setQuality(q)}
          >
            {q}
          </button>
        ))}
      </div>

      <div className="toggle-row">
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Pipeline IA</div>
          <div style={{ fontSize: 12, color: "var(--dim)" }}>Upscale 4K, denoise, stabilisation, 60fps…</div>
        </div>
        <button
          type="button"
          className={`switch ${enhance ? "on" : ""}`}
          onClick={() => setEnhanceOn(!enhance)}
          aria-pressed={enhance}
        >
          <span className="knob" />
        </button>
      </div>

      {enhance && (
        <div className="ai-tools-grid">
          {AI_TOOL_IDS.map((id) => {
            const meta = AI_TOOL_LABELS[id];
            const on = tools.includes(id);
            const can = allowed.includes(id);
            return (
              <button
                key={id}
                type="button"
                className={`ai-tool-chip ${on ? "on" : ""} ${!can ? "off" : ""}`}
                disabled={!can}
                onClick={() => toggleTool(id)}
              >
                <span className="ai-tool-model">{meta.model}</span>
                <span className="ai-tool-name">{meta.name}</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary"
        style={{ width: "100%", padding: 14, marginTop: 20, justifyContent: "center" }}
        disabled={busy}
        onClick={exportClip}
      >
        {busy ? "Traitement..." : waitlist ? "Rejoindre la file" : `Exporter en ${quality}`}
      </button>
    </ModalShell>
  );
}

export function PaywallModal({ onClose }: { onClose: () => void }) {
  useBodyLock(true);

  async function checkout(plan: string) {
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await r.json();
      if (r.status === 503) {
        toast.info(data.message ?? "Paiements bientôt disponibles.");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error("Erreur checkout");
    }
  }

  return (
    <ModalShell onClose={onClose}>
      <button type="button" className="clip-sheet-close" onClick={onClose} aria-label="Fermer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      <h3 className="clip-sheet-title">Quota épuisé</h3>
      <p style={{ color: "var(--mut)", fontSize: 14, margin: "8px 0 20px" }}>
        Passe Creator ou Pro pour continuer à exporter en 4K.
      </p>
      <button type="button" className="btn btn-primary" style={{ width: "100%", padding: 14, marginBottom: 10, justifyContent: "center" }} onClick={() => checkout("CREATOR")}>
        Creator — {formatPrice(PRICING.CREATOR.priceMonthly)}/mois <span style={{ opacity: 0.7, textDecoration: "line-through", marginLeft: 6 }}>{formatPrice(PRICING.CREATOR.priceWas)}</span>
      </button>
      <button type="button" className="btn btn-ghost" style={{ width: "100%", padding: 14, marginBottom: 10, justifyContent: "center" }} onClick={() => checkout("PRO")}>
        Pro — {formatPrice(PRICING.PRO.priceMonthly)}/mois <span style={{ opacity: 0.7, textDecoration: "line-through", marginLeft: 6 }}>{formatPrice(PRICING.PRO.priceWas)}</span>
      </button>
      <button type="button" className="btn btn-ghost" style={{ width: "100%", padding: 14, justifyContent: "center" }} onClick={() => checkout("CREDITS_10")}>
        10 exports — {formatPrice(PRICING.CREDITS_10.priceOnce)}
      </button>
    </ModalShell>
  );
}
