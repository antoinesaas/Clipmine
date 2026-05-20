"use client";

import { useEffect, useState, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";

const GRADS = ["linear-gradient(135deg,#1e3a8a,#0ea5e9)", "linear-gradient(135deg,#7c2d12,#f59e0b)", "linear-gradient(135deg,#581c87,#ec4899)", "linear-gradient(135deg,#064e3b,#10b981)", "linear-gradient(135deg,#1e1b4b,#6366f1)", "linear-gradient(135deg,#0c4a6e,#22d3ee)"];
const rg = () => GRADS[Math.floor(Math.random() * GRADS.length)];

type Result = { youtubeId: string; title: string; channel: string; thumb?: string; views: number; viralScore: number; bg?: string };
type Me = { plan: string; freeExportAvailable: boolean; exportsThisMonth: number; monthlyQuota: number | null; bonusCredits: number };

export default function AppPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Result | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const loadMe = useCallback(async () => {
    const r = await fetch("/api/me");
    if (r.ok) setMe(await r.json());
  }, []);
  useEffect(() => { loadMe(); }, [loadMe]);

  async function runSearch(q?: string) {
    const term = (q ?? query).trim();
    if (!term) return;
    setQuery(term); setLoading(true); setResults([]);
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const data = await r.json();
      setResults((data.results ?? []).map((x: Result) => ({ ...x, bg: rg() })));
    } finally { setLoading(false); }
  }

  const quotaLabel = me
    ? me.freeExportAvailable ? "1 export 4K offert"
      : me.monthlyQuota === null ? "Exports illimités"
        : `${me.exportsThisMonth}/${me.monthlyQuota} ce mois${me.bonusCredits ? ` · +${me.bonusCredits} crédits` : ""}`
    : "";

  return (
    <>
      <div className="app-bar">
        <Link href="/" className="logo"><span className="dot" />Clip<span className="b">Mine</span></Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {me && <span className="quota-badge">{quotaLabel}</span>}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      <main className="app-main">
        <div className="search-box" style={{ marginBottom: 32 }}>
          <div className="search-shell">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            <input className="search-input" value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()} placeholder="Que veux-tu miner aujourd'hui ?" />
            <button className="btn btn-primary" onClick={() => runSearch()}>Miner</button>
          </div>
        </div>

        {(loading || results) && (
          <div className="res-grid">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (<div key={i} className="res-card"><div className="skeleton" /></div>))
              : results!.map((r) => (
                <div key={r.youtubeId} className="res-card" onClick={() => setSelected(r)}>
                  <div className="res-thumb" style={{ background: r.bg, backgroundImage: r.thumb ? `url(${r.thumb})` : undefined }}>
                    <span className="score">🔥 {r.viralScore}</span><span className="dur">4K</span>
                  </div>
                  <div className="res-body"><div className="t">{r.title}</div><div className="m">{(r.views / 1e6).toFixed(1)}M vues · {r.channel}</div></div>
                </div>
              ))}
          </div>
        )}

        {!results && !loading && (
          <p style={{ textAlign: "center", color: "var(--dim)", marginTop: 80 }}>Lance une recherche pour commencer à miner.</p>
        )}
      </main>

      {selected && <ExportModal clip={selected} onClose={() => setSelected(null)} onPaywall={() => { setSelected(null); setShowPaywall(true); }} onDone={loadMe} />}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </>
  );
}

function ExportModal({ clip, onClose, onPaywall, onDone }: { clip: Result; onClose: () => void; onPaywall: () => void; onDone: () => void }) {
  const [ratio, setRatio] = useState("9:16");
  const [enhance, setEnhance] = useState(true);
  const [busy, setBusy] = useState(false);

  async function exportClip() {
    setBusy(true);
    const r = await fetch("/api/download", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtubeId: clip.youtubeId, title: clip.title, ratio, quality: "4K", enhance }),
    });
    setBusy(false);
    if (r.status === 402) { onPaywall(); return; }
    if (!r.ok) { toast.error("Erreur lors de l'export"); return; }
    const { jobId } = await r.json();
    toast.success("Export lancé ! On te prévient quand c'est prêt.");
    onDone(); onClose();
    pollStatus(jobId);
  }

  async function pollStatus(jobId: string) {
    const tick = async () => {
      const r = await fetch(`/api/download/${jobId}/status`);
      const d = await r.json();
      if (d.status === "ready") { toast.success(<a href={d.fileUrl} download style={{ color: "var(--teal)" }}>Clip prêt — télécharger ↓</a>, { duration: 999999 }); return; }
      if (d.status === "failed") { toast.error("Le traitement a échoué"); return; }
      setTimeout(tick, 4000);
    };
    setTimeout(tick, 4000);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
        <h3>Exporter ce clip</h3>
        <p style={{ color: "var(--dim)", fontSize: 14, marginBottom: 8 }}>{clip.title}</p>
        <div style={{ fontSize: 13, color: "var(--mut)", marginTop: 16, fontWeight: 600 }}>Format</div>
        <div className="ratio-row">
          {["9:16", "16:9", "4:3"].map((rt) => (<div key={rt} className={`ratio-opt ${ratio === rt ? "on" : ""}`} onClick={() => setRatio(rt)}>{rt}</div>))}
        </div>
        <div className="toggle-row">
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>Enhance IA</div><div style={{ fontSize: 12, color: "var(--dim)" }}>Upscale + stabilisation + 60fps</div></div>
          <div className={`switch ${enhance ? "on" : ""}`} onClick={() => setEnhance(!enhance)}><div className="knob" /></div>
        </div>
        <button className="btn btn-primary" style={{ width: "100%", padding: 14, marginTop: 20 }} disabled={busy} onClick={exportClip}>
          {busy ? "Traitement..." : "Exporter en 4K"}
        </button>
      </div>
    </div>
  );
}

function PaywallModal({ onClose }: { onClose: () => void }) {
  async function checkout(plan: string) {
    const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
    const { url } = await r.json();
    if (url) window.location.href = url;
  }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
        <h3>Ton export 4K offert est utilisé 🎬</h3>
        <p style={{ color: "var(--mut)", fontSize: 14, margin: "8px 0 20px" }}>Passe Creator pour des exports illimités en qualité max, ou prends un pack de crédits.</p>
        <button className="btn btn-primary" style={{ width: "100%", padding: 14, marginBottom: 10 }} onClick={() => checkout("CREATOR")}>Passer Creator — 9€/mois</button>
        <button className="btn btn-ghost" style={{ width: "100%", padding: 14, marginBottom: 10 }} onClick={() => checkout("PRO")}>Passer Pro — 24€/mois</button>
        <button className="btn btn-ghost" style={{ width: "100%", padding: 14 }} onClick={() => checkout("CREDITS_10")}>10 exports — 1,99€</button>
      </div>
    </div>
  );
}
