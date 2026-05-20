"use client";

import { useEffect, useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const GRADS = [
  "linear-gradient(135deg,#1e3a8a,#0ea5e9)", "linear-gradient(135deg,#7c2d12,#f59e0b)",
  "linear-gradient(135deg,#581c87,#ec4899)", "linear-gradient(135deg,#064e3b,#10b981)",
  "linear-gradient(135deg,#1e1b4b,#6366f1)", "linear-gradient(135deg,#7f1d1d,#ef4444)",
  "linear-gradient(135deg,#0c4a6e,#22d3ee)", "linear-gradient(135deg,#3b0764,#a855f7)",
  "linear-gradient(135deg,#422006,#eab308)", "linear-gradient(135deg,#134e4a,#2dd4bf)",
];
const rg = () => GRADS[Math.floor(Math.random() * GRADS.length)];
const Check = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5L20 7" /></svg>);
const Cross = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 6l12 12M18 6 6 18" /></svg>);

const CHIPS = [
  ["🚗 Cars", "voiture luxe nuit"], ["🔥 Motivation", "motivation discours"],
  ["⚔️ Anime", "anime fight scene 4k"], ["🌍 Nature", "nature drone cinematic"],
  ["💪 Gym", "gym workout"],
];

const FEATURES = [
  { hot: true, tag: "EXCLUSIF", title: "Hook Finder IA", desc: "L'IA repère les 1 à 3 secondes les plus accrocheuses de chaque clip — le moment parfait pour ouvrir ton édit.", icon: <path d="M13 2 3 14h9l-1 8 10-12h-9z" /> },
  { hot: true, tag: "EXCLUSIF", title: "Trend Radar", desc: "Vois en temps réel quels types de clips explosent par niche, pour sourcer la bonne matière avant tout le monde.", icon: <><path d="M3 3v18h18" /><path d="m7 14 4-4 4 4 4-6" /></> },
  { title: "Autocrop intelligent", desc: "Détection du sujet (visage, action, voiture) et recadrage auto en 9:16, 16:9 ou 4:3 avec tracking fluide.", icon: <><path d="M6 3v18M3 6h3M18 3v18M21 18h-3" /><rect x="6" y="6" width="12" height="12" rx="1" /></> },
  { title: "Enhance & 60fps", desc: "Upscale qualité, stabilisation, débruitage et interpolation 24→60fps. Des clips sources nets et fluides.", icon: <path d="m12 3 1.9 5.8L20 9l-5 3.6L17 19l-5-3.5L7 19l2-6.4L4 9l6.1-.2z" /> },
  { title: "Téléchargement 4K", desc: "La meilleure qualité source disponible, jusqu'en 4K. Pas de watermark, pas de compression dégueulasse.", icon: <><path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9" /><path d="M12 17V8m-4 5 4 4 4-4" /></> },
  { title: "Bibliothèque perso", desc: "Sauvegarde tes clips par projet, retrouve ton historique, réutilise ta matière. Tout synchronisé.", icon: <><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" /><path d="M12 8v8M8 12h8" /></> },
];

const DEMOS = ["Cars edit", "Motivation", "Anime AMV", "Nature 4K"];

type Result = { youtubeId: string; title: string; channel: string; thumb?: string; views: number; viralScore: number; bg?: string };

export default function Landing() {
  const [bgRows, setBgRows] = useState<string[][]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBgRows([0, 1, 2].map(() => Array.from({ length: 24 }, rg)));
  }, []);

  async function runSearch(q?: string) {
    const term = (q ?? query).trim();
    if (!term) return;
    setQuery(term);
    setLoading(true);
    setResults([]);
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const data = await r.json();
      setResults((data.results ?? []).map((x: Result) => ({ ...x, bg: rg() })));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <nav>
        <div className="nav-in">
          <div className="logo"><span className="dot" />Clip<span className="b">Mine</span></div>
          <div className="nav-links">
            <a href="#features">Fonctions</a>
            <a href="#demos">Démos</a>
            <a href="#pricing">Tarifs</a>
            <SignedOut><SignInButton mode="modal"><a>Connexion</a></SignInButton></SignedOut>
            <SignedIn><Link href="/app">Mon espace</Link></SignedIn>
          </div>
          <SignedOut>
            <SignInButton mode="modal"><button className="btn btn-primary">Essayer gratuitement</button></SignInButton>
          </SignedOut>
          <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
        </div>
      </nav>

      <header className="hero">
        <div className="clip-bg">
          {bgRows.map((row, i) => (
            <div key={i} className={`clip-row r${i + 1}`}>
              {[...row, ...row].map((g, j) => (<div key={j} className="clip-thumb" style={{ background: g }} />))}
            </div>
          ))}
        </div>
        <div className="hero-fade" />
        <div className="hero-in wrap">
          <div className="badge"><span className="pulse" />1 téléchargement 4K offert · sans carte</div>
          <h1>Trouve le clip parfait.<br /><span className="grad">Mine la matière de tes édits.</span></h1>
          <p className="sub">Tape ce que tu veux. ClipMine scanne tout YouTube, classe les meilleurs clips par potentiel viral, et te les sort recadrés et améliorés — prêts à importer dans ton montage.</p>

          <div className="search-box">
            <div className="search-shell">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              <input className="search-input" value={query} onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="ex : voiture luxe nuit, motivation, anime fight scene..." />
              <button className="btn btn-primary" onClick={() => runSearch()}>Miner</button>
            </div>
            <div className="chips">
              {CHIPS.map(([label, q]) => (<span key={q} className="chip" onClick={() => runSearch(q)}>{label}</span>))}
            </div>
            <div className="hero-note">Résultats en <b>4K source</b> · autocrop 9:16 / 16:9 / 4:3 · enhance IA inclus</div>
          </div>

          {(loading || (results && results.length > 0)) && (
            <div className="results">
              <div className="res-head">
                <h3>Résultats {query && `pour « ${query} »`}</h3>
                <div className="filters"><span className="fpill on">9:16</span><span className="fpill">16:9</span><span className="fpill">4K</span></div>
              </div>
              <div className="res-grid">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (<div key={i} className="res-card"><div className="skeleton" /></div>))
                  : results!.map((r) => (
                    <SignInButton key={r.youtubeId} mode="modal">
                      <div className="res-card">
                        <div className="res-thumb" style={{ background: r.bg, backgroundImage: r.thumb ? `url(${r.thumb})` : undefined }}>
                          <span className="score">🔥 {r.viralScore}</span>
                          <span className="dur">4K</span>
                        </div>
                        <div className="res-body">
                          <div className="t">{r.title}</div>
                          <div className="m">{(r.views / 1e6).toFixed(1)}M vues · {r.channel}</div>
                        </div>
                      </div>
                    </SignInButton>
                  ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <section id="features">
        <div className="wrap">
          <div className="eyebrow">Pourquoi ClipMine</div>
          <h2 className="h2">Tout ce que les autres ne font pas</h2>
          <p className="sec-sub">Pensé pour les éditeurs TikTok, Reels et Shorts. De la recherche à l'export, en un seul endroit.</p>
          <div className="feat-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className={`feat ${f.hot ? "hot" : ""}`}>
                {f.tag && <span className="tag">{f.tag}</span>}
                <div className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{f.icon}</svg></div>
                <h3>{f.title}</h3><p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demos" style={{ background: "var(--bg2)" }}>
        <div className="wrap">
          <div className="eyebrow">En action</div>
          <h2 className="h2">Des clips minés, prêts à monter</h2>
          <p className="sec-sub">Des vrais clips sourcés et recadrés avec ClipMine. Tes démos arrivent ici.</p>
          <div className="demo-grid">
            {DEMOS.map((l, i) => (
              <div key={i} className="demo" style={{ background: rg() }}>
                <span className="slot">TA DÉMO</span>
                <div className="play"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg></div>
                <div className="lbl">{l}</div>
                {/* <video src={`/demos/${i}.mp4`} muted loop playsInline autoPlay /> */}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing">
        <div className="wrap">
          <div className="eyebrow">Tarifs</div>
          <h2 className="h2">Commence gratuit. Scale quand tu veux.</h2>
          <p className="sec-sub">Ton premier export 4K est offert. Ensuite, choisis ton plan.</p>
          <div className="price-grid">
            <div className="plan">
              <h3>Free</h3><p className="pdesc">Pour tester la magie</p><div className="price">0€</div>
              <ul>
                <li><Check />Recherches illimitées</li>
                <li><Check /><b style={{ color: "var(--teal)" }}>1 export 4K offert</b></li>
                <li><Check />Autocrop basique</li>
                <li className="off"><Cross />Enhance IA</li>
              </ul>
              <SignInButton mode="modal"><button className="btn btn-ghost">Commencer</button></SignInButton>
            </div>
            <div className="plan feat-plan">
              <div className="pop">Le plus populaire</div>
              <h3>Creator</h3><p className="pdesc">Pour les éditeurs actifs</p><div className="price">9€<small>/mois</small></div>
              <ul>
                <li><Check />Tout du Free</li><li><Check />50 exports 4K / mois</li>
                <li><Check />Enhance IA + 60fps</li><li><Check />Hook Finder</li>
              </ul>
              <SignInButton mode="modal"><button className="btn btn-primary">Passer Creator</button></SignInButton>
            </div>
            <div className="plan">
              <h3>Pro</h3><p className="pdesc">Pour les agences</p><div className="price">24€<small>/mois</small></div>
              <ul>
                <li><Check />Tout du Creator</li><li><Check />Exports illimités</li>
                <li><Check />B-roll IA + Trend Radar</li><li><Check />Accès API</li>
              </ul>
              <SignInButton mode="modal"><button className="btn btn-ghost">Passer Pro</button></SignInButton>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta">
            <h2>Ton prochain édit viral commence ici.</h2>
            <p>Premier export 4K offert. Pas de carte. Pas d'excuse.</p>
            <SignInButton mode="modal"><button className="btn btn-primary" style={{ padding: "15px 32px", fontSize: 16 }}>Miner mon premier clip</button></SignInButton>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-in">
            <div className="logo"><span className="dot" />Clip<span className="b">Mine</span></div>
            <div className="foot-links"><a href="#features">Fonctions</a><a href="#pricing">Tarifs</a><a href="#">CGU</a><a href="#">Contact</a></div>
          </div>
          <p className="legal">ClipMine est un outil de recherche et de traitement vidéo. L'utilisateur est seul responsable de l'usage des contenus téléchargés et du respect des droits d'auteur applicables. © 2025 ClipMine.</p>
        </div>
      </footer>
    </>
  );
}
