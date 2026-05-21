"use client";

import { useEffect, useState, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";

type Result = {
  youtubeId: string; title: string; channel: string;
  thumb?: string; views: number; viralScore: number;
};
type Me = {
  plan: string; freeExportAvailable: boolean;
  exportsThisMonth: number; monthlyQuota: number | null;
  bonusCredits: number; waitlist?: boolean;
};

const CHIPS = [
  ["🚗 Supercars", "supercar drone 4k"],
  ["🔥 Motivation", "motivation speech"],
  ["⚔️ Anime", "anime 4k amv"],
  ["🌍 Cinematic", "cinematic nature 4k"],
];

export default function AppPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Result | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const loadMe = useCallback(async () => {
    try {
      const r = await fetch("/api/me");
      if (r.ok) setMe(await r.json());
    } catch {}
  }, []);
  useEffect(() => { loadMe(); }, [loadMe]);

  async function runSearch(q?: string) {
    const term = (q ?? query).trim();
    if (!term) return;
    setQuery(term); setLoading(true); setResults([]);
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const data = await r.json();
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }

  const quotaLabel = me
    ? me.freeExportAvailable
      ? "1 export 4K offert"
      : me.monthlyQuota === null
        ? "Exports illimités"
        : `${me.exportsThisMonth}/${me.monthlyQuota} ce mois${me.bonusCredits ? ` · +${me.bonusCredits} crédits` : ""}`
    : "";

  return (
    <>
      <div className="app-bar">
        <Link href="/" className="logo">
          <span className="dot" />Clip<span className="b">Mine</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {me && <span className="quota-badge">{quotaLabel}</span>}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      <main className="app-main">
        {me?.waitlist && (
          <div className="waitlist-banner">
            ⏳ <strong>Mode liste d'attente</strong> : tu peux explorer et préparer tes exports.
            Le pipeline de traitement vidéo est en cours d'activation — on te prévient par email dès qu'il est en ligne.
          </div>
        )}

        <div className="search-box" style={{ marginBottom: 28 }}>
          <div className="search-shell">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Mots-clés ou colle un lien YouTube..."
            />
            <button className="btn btn-primary" onClick={() => runSearch()}>Mine →</button>
          </div>
          <div className="chips">
            {CHIPS.map(([label, q]) => (
              <span key={q} className="chip" onClick={() => runSearch(q)}>{label}</span>
            ))}
          </div>
        </div>

        {(loading || results) && (
          <div className="res-grid">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="res-card"><div className="skeleton" /></div>
                ))
              : results!.map((r) => (
                  <div key={r.youtubeId} className="res-card" onClick={() => setSelected(r)}>
                    <div
                      className="res-thumb"
                      style={{ backgroundImage: r.thumb ? `url(${r.thumb})` : undefined }}
                    >
                      <span className="score">🔥 {r.viralScore}</span>
                      <span className="dur">4K</span>
                    </div>
                    <div className="res-body">
                      <div className="t">{r.title}</div>
                      <div className="m">
                        {r.views > 0 ? `${(r.views / 1e6).toFixed(1)}M vues · ` : ""}
                        {r.channel}
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        )}

        {!results && !loading && (
          <div style={{ textAlign: "center", marginTop: 80, color: "var(--dim)" }}>
            <p style={{ marginBottom: 16, fontSize: 16 }}>Lance une recherche pour commencer à miner.</p>
            <p style={{ fontSize: 14 }}>Astuce : tu peux aussi coller directement un lien YouTube.</p>
          </div>
        )}
      </main>

      {selected && (
        <ExportModal
          clip={selected}
          waitlist={me?.waitlist}
          onClose={() => setSelected(null)}
          onPaywall={() => { setSelected(null); setShowPaywall(true); }}
          onDone={loadMe}
        />
      )}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </>
  );
}

function ExportModal({
  clip, waitlist, onClose, onPaywall, onDone,
}: {
  clip: Result; waitlist?: boolean;
  onClose: () => void; onPaywall: () => void; onDone: () => void;
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
          youtubeId: clip.youtubeId, title: clip.title,
          ratio, quality: "4K", enhance,
        }),
      });
      if (r.status === 402) { onPaywall(); return; }
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.message ?? "Erreur lors de l'export");
        return;
      }
      if (data.mode === "waitlist") {
        toast.success(data.message ?? "Tu es sur la liste d'attente !");
      } else {
        toast.success("Export lancé ! On te prévient quand c'est prêt.");
      }
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
        <button className="x" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <h3>Exporter ce clip</h3>
        <p style={{ color: "var(--dim)", fontSize: 14, marginBottom: 8 }}>{clip.title}</p>

        {waitlist && (
          <div style={{
            background: "rgba(255,176,32,0.1)", border: "1px solid rgba(255,176,32,0.3)",
            color: "var(--warn)", padding: "10px 14px", borderRadius: 10,
            fontSize: 12.5, marginTop: 14, lineHeight: 1.5,
          }}>
            Mode liste d'attente : le clip sera traité dès activation du pipeline. Tu recevras un email.
          </div>
        )}

        <div style={{ fontSize: 13, color: "var(--mut)", marginTop: 18, fontWeight: 600 }}>Format</div>
        <div className="ratio-row">
          {["9:16", "16:9", "4:3"].map((rt) => (
            <div
              key={rt}
              className={`ratio-opt ${ratio === rt ? "on" : ""}`}
              onClick={() => setRatio(rt)}
            >
              {rt}
            </div>
          ))}
        </div>

        <div className="toggle-row">
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Enhance IA</div>
            <div style={{ fontSize: 12, color: "var(--dim)" }}>Upscale Starlight + stabilisation + 60fps</div>
          </div>
          <div className={`switch ${enhance ? "on" : ""}`} onClick={() => setEnhance(!enhance)}>
            <div className="knob" />
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: "100%", padding: 14, marginTop: 20, justifyContent: "center" }}
          disabled={busy}
          onClick={exportClip}
        >
          {busy ? "Traitement..." : waitlist ? "Rejoindre la liste d'attente" : "Exporter en 4K"}
        </button>
      </div>
    </div>
  );
}

function PaywallModal({ onClose }: { onClose: () => void }) {
  async function checkout(plan: string) {
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await r.json();
      if (r.status === 503) {
        toast.info(data.message ?? "Paiements en cours d'activation.");
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
        <button className="x" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <h3>Ton export 4K offert est utilisé 🎬</h3>
        <p style={{ color: "var(--mut)", fontSize: 14, margin: "8px 0 20px" }}>
          Passe Creator pour des exports illimités en qualité max, ou prends un pack de crédits.
        </p>
        <button
          className="btn btn-primary"
          style={{ width: "100%", padding: 14, marginBottom: 10, justifyContent: "center" }}
          onClick={() => checkout("CREATOR")}
        >
          Passer Creator — 9€/mois
        </button>
        <button
          className="btn btn-ghost"
          style={{ width: "100%", padding: 14, marginBottom: 10, justifyContent: "center" }}
          onClick={() => checkout("PRO")}
        >
          Passer Pro — 24€/mois
        </button>
        <button
          className="btn btn-ghost"
          style={{ width: "100%", padding: 14, justifyContent: "center" }}
          onClick={() => checkout("CREDITS_10")}
        >
          10 exports — 1,99€
        </button>
      </div>
    </div>
  );
}
