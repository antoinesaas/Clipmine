"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import LandingNav from "@/components/LandingNav";
import { useRouter } from "next/navigation";
import { TRENDING_FILMS, clipsForHero, buildHeroBgRows, DEMO_CLIPS, thumbForId } from "@/lib/demo-clips";
import { normalizeSearchQuery } from "@/lib/normalize-search-query";
import PricingPlans from "@/components/PricingPlans";
import FeatureShowcase from "@/components/FeatureShowcase";
import ImageBeforeAfter from "@/components/ImageBeforeAfter";
import { SUPPORT_EMAIL } from "@/lib/constants";

const HERO_SUGGESTIONS: [string, string][] = [
  ["Inception", "Inception"],
  ["Breaking Bad", "Breaking Bad"],
  ["Dark Knight", "Dark Knight"],
  ["Interstellar", "Interstellar"],
  ["Game of Thrones", "Game of Thrones"],
  ...TRENDING_FILMS.filter(
    ([label]) => !["Inception", "Breaking Bad", "Interstellar", "Game of Thrones"].includes(label),
  ),
];

const MODELS = [
  { name: "Starlight", tag: "EXCLUSIF", title: "Upscale jusqu'à 4K", desc: "Notre modèle phare. Reconstruit chaque pixel avec une précision cinématographique. Idéal pour les vieux clips YouTube en 480p ou 720p.", icon: <><path d="M12 2v6M12 16v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/></> },
  { name: "Proteus", tag: "AI", title: "Enhance intelligent", desc: "Détecte automatiquement les imperfections, rétablit la netteté et révèle les détails que l'encodage YouTube a écrasés.", icon: <><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 10v6M4.22 4.22l4.24 4.24m7.08 7.08 4.24 4.24M1 12h6m10 0h6M4.22 19.78l4.24-4.24m7.08-7.08 4.24-4.24"/></> },
  { name: "Nyx", tag: "AI", title: "Denoise nocturne", desc: "Élimine le bruit numérique sur les scènes sombres sans détruire le grain cinéma. Pour les clips low-light et les concerts.", icon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/> },
  { name: "Aion", tag: "AI", title: "Interpolation 60fps", desc: "Crée des frames intermédiaires pour fluidifier n'importe quel clip. Transforme 24fps en 60 ou 120fps sans artefact.", icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></> },
  { name: "Chronos", tag: "AI", title: "Slow-motion fluide", desc: "Ralenti cinématographique généré par IA. Étire le temps tout en gardant la fluidité d'un tournage à 240fps natif.", icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></> },
  { name: "Themis", tag: "AI", title: "Stabilisation pro", desc: "Compense les tremblements caméra a posteriori. Donne à n'importe quel clip un rendu gimbal pro.", icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></> },
];

const USECASES = [
  { title: "Éditeurs TikTok / Reels", desc: "Sourcing rapide de matière première viral-ready, recadrée en 9:16." },
  { title: "Créateurs YouTube", desc: "Upscale tes archives, remasterise tes anciennes vidéos en 4K." },
  { title: "Agences & Studios", desc: "Volume d'exports, slow-motion Chronos, support prioritaire." },
  { title: "Archivistes & Passionnés", desc: "Restaure des films de famille, des VHS, des archives historiques." },
];

function isYoutubeUrl(s: string) {
  return /(?:youtube\.com\/|youtu\.be\/)/.test(s);
}

export default function Landing() {
  const router = useRouter();
  const [bgRows] = useState(() => buildHeroBgRows());
  const [query, setQuery] = useState("");

  function goSearch(q?: string) {
    const raw = (q ?? query).trim() || "Inception";
    const { userInput, apiQuery } = normalizeSearchQuery(raw);
    setQuery(userInput);
    router.push(`/app/search?q=${encodeURIComponent(apiQuery)}`);
  }

  return (
    <>
      <LandingNav />

      <header className="hero">
        <div className="hero-clips-zone">
          <div className="clip-bg">
            {bgRows.map((row, i) => (
              <div key={i} className={`clip-row r${i + 1}`}>
                {[...row, ...row].map((thumb, j) => (
                  <div
                    key={j}
                    className="clip-thumb"
                    style={{ backgroundImage: `url(${thumb})` }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="hero-fade-clips" aria-hidden />
        </div>

        <div className="hero-in wrap hero-copy">
          <div className="badge">
            <span className="pulse" />FILMS · SÉRIES · ÉDITS TIKTOK
          </div>
          <h1>
            Trouve ta scène.<br />
            <span className="grad">Exporte en 9:16 · 4K.</span>
          </h1>
          <p className="sub">
            Films & séries pour éditeurs TikTok.
            Colle un lien YouTube ou cherche une scène — export 9:16 en 4K.
          </p>
        </div>

        <div className="hero-search wrap">
          <div className="search-box">
            <div className="search-shell">
              <div className="search-input-row">
                {isYoutubeUrl(query) ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#FF4444" stroke="none" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
                  </svg>
                )}
                <input
                  className="search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      goSearch();
                    }
                  }}
                  placeholder="Film, scène ou lien YouTube"
                />
              </div>
              <button
                type="button"
                className="btn btn-primary btn-mine-hero"
                onClick={() => goSearch()}
              >
                Mine →
              </button>
            </div>
            <div className="chips-scroll">
              <div className="chips">
                {HERO_SUGGESTIONS.map(([label, q]) => (
                  <button
                    key={label}
                    type="button"
                    className="chip"
                    onClick={() => goSearch(q)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="hero-note">
              Films & séries · lien YouTube · export 4K
            </div>
          </div>
        </div>

      </header>

      {/* TRUSTED BY */}
      <div className="trusted">
        <div className="wrap">
          <div className="trusted-label">Utilisé par les créateurs de</div>
          <div className="trusted-logos">
            <span>TikTok Edits</span>
            <span>Reels Pros</span>
            <span>YouTube Shorts</span>
            <span>Agences Sociales</span>
            <span>Vidéastes Indé</span>
          </div>
        </div>
      </div>

      {/* MODELS AI */}
      <section id="models">
        <div className="wrap">
          <div className="eyebrow">Powered by AI</div>
          <h2 className="h2">Plus de 6 modèles AI dédiés.</h2>
          <p className="sec-sub">
            Chaque modèle est entraîné sur une tâche précise. Upscale, denoise, stabilisation, slow-mo —
            on enchaîne ce qu'il faut pour transformer un clip YouTube médiocre en source cinéma.
          </p>

          <div className="models-grid">
            {MODELS.map((m, i) => (
              <div key={m.name} className={`model-card ${i < 2 ? "feat" : ""}`}>
                <span className="tag">{m.tag}</span>
                <div className="ic">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {m.icon}
                  </svg>
                </div>
                <h3>{m.name}</h3>
                <p style={{ marginBottom: 14 }}>{m.title}</p>
                <p style={{ fontSize: 14, color: "var(--dim)" }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section style={{ background: "var(--bg-elev)", paddingTop: 90 }}>
        <div className="wrap">
          <div className="eyebrow">Comparateur</div>
          <h2 className="h2">Avant YouTube. Après ClipMine.</h2>
          <p className="sec-sub">
            Glisse le curseur : à gauche la source compressée, à droite le rendu ClipMine 4K (vidéo en boucle).
          </p>

          <div className="compare-wrap compare-wrap-video">
            <ImageBeforeAfter
              image={thumbForId(DEMO_CLIPS[1].youtubeId)}
              beforeFilter="blur(2px) brightness(0.82) saturate(0.72) contrast(0.88)"
              afterFilter="saturate(1.2) contrast(1.12) brightness(1.05)"
              beforeLabel="Source YouTube"
              afterLabel="ClipMine 4K"
              className="hero-ba"
              aspect="16/9"
            />
          </div>
        </div>
      </section>

      {/* DEMOS — résultats ClipMine par fonctionnalité */}
      <section id="demos">
        <div className="wrap">
          <div className="eyebrow">En action</div>
          <h2 className="h2">Ce que ClipMine produit.</h2>
          <p className="sec-sub">
            Chaque carte montre un avant/après : recadrage 9:16, upscale 4K, stabilisation, denoise… Glisse le curseur sur la vignette.
          </p>

          <FeatureShowcase />
        </div>
      </section>

      {/* USE CASES */}
      <section style={{ background: "var(--bg-elev)" }}>
        <div className="wrap">
          <div className="eyebrow">Pour qui ?</div>
          <h2 className="h2">Tu es créateur. ClipMine est pour toi.</h2>
          <p className="sec-sub">
            De l'éditeur TikTok solo aux studios qui produisent en masse, ClipMine s'intègre à ton workflow.
          </p>

          <div className="usecase-grid">
            {USECASES.map((u) => (
              <div key={u.title} className="usecase">
                <div className="check">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4>{u.title}</h4>
                <p>{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing">
        <div className="wrap">
          <div className="eyebrow">Tarifs</div>
          <h2 className="h2">Gratuit pour démarrer.<br />Scalable quand tu veux.</h2>
          <p className="sec-sub">
            <span className="promo-pill">Promo lancement −40%</span> Premier export 4K offert. Pas de carte.
          </p>

          <PricingPlans />
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta">
            <h2>Ton prochain édit viral<br />commence ici.</h2>
            <p>Premier export 4K offert. Pas de carte. Pas d'excuse.</p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => router.push("/app/search")}
            >
              Miner mon premier clip →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="foot-grid">
          <div className="foot-col">
            <Logo />
            <p className="foot-tagline">
              Cinema-grade AI video enhancement. La matière première de tes édits, minée et upscalée en secondes.
            </p>
          </div>
          <div className="foot-col">
            <h4>Produit</h4>
            <ul>
              <li><a href="#models">Modèles AI</a></li>
              <li><a href="#pricing">Tarifs</a></li>
              <li><a href="#demos">Démos</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>Société</h4>
            <ul>
              <li><a href={`mailto:${SUPPORT_EMAIL}`}>Contact</a></li>
              <li><Link href="/cgu">CGU</Link></li>
              <li><Link href="/mentions-legales">Mentions légales</Link></li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>Support</h4>
            <ul>
              <li><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <p>© 2026 ClipMine. Tous droits réservés.</p>
          <p>L'utilisateur est seul responsable du respect des droits d'auteur des contenus téléchargés.</p>
        </div>
      </footer>
    </>
  );
}
