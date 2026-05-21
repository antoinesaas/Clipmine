"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ClipResult } from "./SearchPanel";
import { saveExportLocal } from "./SearchPanel";

export function ExportModal({
  clip,
  waitlist,
  onClose,
  onPaywall,
  onDone,
}: {
  clip: ClipResult;
  waitlist?: boolean;
  onClose: () => void;
  onPaywall: () => void;
  onDone: () => void;
}) {
  const [ratio, setRatio] = useState("9:16");
  const [enhance, setEnhance] = useState(true);
  const [busy, setBusy] = useState(false);

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
          quality: "4K",
          enhance,
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
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="x" onClick={onClose} aria-label="Fermer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <h3>Exporter ce clip</h3>
        <p style={{ color: "var(--dim)", fontSize: 14 }}>{clip.movie ?? clip.title}</p>

        {waitlist && (
          <div className="waitlist-inline">
            Pipeline en activation — tu seras notifié par email quand le clip sera prêt.
          </div>
        )}

        <div className="field-label">Format</div>
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

        <div className="toggle-row">
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Enhance IA</div>
            <div style={{ fontSize: 12, color: "var(--dim)" }}>Upscale + stabilisation + 60fps</div>
          </div>
          <button
            type="button"
            className={`switch ${enhance ? "on" : ""}`}
            onClick={() => setEnhance(!enhance)}
            aria-pressed={enhance}
          >
            <span className="knob" />
          </button>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ width: "100%", padding: 14, marginTop: 20, justifyContent: "center" }}
          disabled={busy}
          onClick={exportClip}
        >
          {busy ? "Traitement..." : waitlist ? "Rejoindre la file" : "Exporter en 4K"}
        </button>
      </div>
    </div>
  );
}

export function PaywallModal({ onClose }: { onClose: () => void }) {
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
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="x" onClick={onClose} aria-label="Fermer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <h3>Quota épuisé</h3>
        <p style={{ color: "var(--mut)", fontSize: 14, margin: "8px 0 20px" }}>
          Passe Creator ou Pro pour continuer à exporter en 4K.
        </p>
        <button type="button" className="btn btn-primary" style={{ width: "100%", padding: 14, marginBottom: 10, justifyContent: "center" }} onClick={() => checkout("CREATOR")}>
          Creator — 9€/mois
        </button>
        <button type="button" className="btn btn-ghost" style={{ width: "100%", padding: 14, marginBottom: 10, justifyContent: "center" }} onClick={() => checkout("PRO")}>
          Pro — 24€/mois
        </button>
        <button type="button" className="btn btn-ghost" style={{ width: "100%", padding: 14, justifyContent: "center" }} onClick={() => checkout("CREDITS_10")}>
          10 exports — 1,99€
        </button>
      </div>
    </div>
  );
}
