"use client";

import { useState } from "react";
import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { DEMO_CLIPS, thumbForId } from "@/lib/demo-clips";

const UPSCALE_MODELS = [
  {
    name: "Starlight Precise",
    badge: "Phare",
    desc: "Notre modèle d'upscale phare. Reconstruit fidèlement chaque détail, idéal pour les clips live action récents.",
    use: "Pour : clips récents 720p/1080p → 4K",
  },
  {
    name: "Starlight HQ",
    badge: "Cinema",
    desc: "Précision maximale. Reproduction des micro-détails de peau, textures et matières. Plus lent mais imbattable.",
    use: "Pour : portraits, gros plans, films",
  },
  {
    name: "Starlight Fast",
    badge: "Speed",
    desc: "L'équilibre vitesse/qualité. Idéal quand tu as 50 clips à traiter et que le délai compte.",
    use: "Pour : batchs de clips TikTok / Reels",
  },
  {
    name: "Iris",
    badge: "Detail",
    desc: "Spécialisé sur la récupération de détails fins. Texte, visages, motifs complexes.",
    use: "Pour : clips où le texte/visage doit être net",
  },
  {
    name: "Proteus",
    badge: "Adapt",
    desc: "Réglages adaptatifs scène par scène. Le modèle qui s'ajuste tout seul à ton contenu.",
    use: "Pour : clips mixtes, vlogs",
  },
  {
    name: "Rhea XL",
    badge: "Archive",
    desc: "Restauration d'archive. Désentrelacement, suppression du grain de pellicule, récupération de la définition.",
    use: "Pour : VHS, archives, vieux YouTube",
  },
];

export default function UpscalePage() {
  const [comparePos, setComparePos] = useState(50);
  const [selectedModel, setSelectedModel] = useState(0);

  function handleCompareMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setComparePos(Math.max(0, Math.min(100, x)));
  }

  return (
    <>
      <nav>
        <div className="nav-in">
          <Link href="/" className="logo">
            <span className="dot" />Clip<span className="b">Mine</span>
          </Link>
          <div className="nav-links">
            <Link href="/#models">Modèles AI</Link>
            <Link href="/upscale">Upscale</Link>
            <Link href="/#pricing">Tarifs</Link>
            <SignedOut><SignInButton mode="modal"><a>Connexion</a></SignInButton></SignedOut>
            <SignedIn><Link href="/app">Mon espace</Link></SignedIn>
          </div>
          <SignedOut>
            <SignInButton mode="modal">
              <button type="button" className="btn btn-primary btn-nav-cta">
                <span className="only-desktop">Essayer gratuitement</span>
                <span className="only-mobile">Essayer</span>
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="hero-in wrap">
          <div className="badge">
            <span className="pulse" />UPSCALE · CINEMATIC AI · 4K · 8K
          </div>
          <h1>
            Cinematic superpowers.<br />
            <span className="grad">Ultra smooth. Ultra sharp. Ultra steady.</span>
          </h1>
          <p className="sub">
            ClipMine Upscale utilise plus de 6 modèles AI temporally aware pour reconstruire
            chaque pixel de tes clips YouTube. Recovery 720p → 4K, restauration d'archives,
            désentrelacement, slow-mo natif. Résultat cinéma, en quelques minutes.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
            <SignInButton mode="modal">
              <button className="btn btn-primary btn-lg">Upscale mon premier clip →</button>
            </SignInButton>
            <a href="#models" className="btn btn-ghost btn-lg">Voir les modèles</a>
          </div>

          <div className="hero-note" style={{ marginTop: 32 }}>
            Disponible en cloud · 1 export 4K offert · pas de carte requise
          </div>
        </div>
      </header>

      {/* BEFORE / AFTER */}
      <section style={{ paddingTop: 60 }}>
        <div className="wrap">
          <div className="eyebrow">Avant / Après</div>
          <h2 className="h2">Ton footage n'a jamais été aussi… net.</h2>
          <p className="sec-sub">
            Glisse le curseur pour voir la différence. Pas de tricherie : c'est le même clip,
            avant et après passage dans nos modèles Starlight.
          </p>

          <div
            className="compare-wrap"
            onMouseMove={handleCompareMove}
          >
            <div className="compare">
              <div
                className="compare-img"
                style={{
                  backgroundImage: `url(${thumbForId(DEMO_CLIPS[1].youtubeId)})`,
                  filter: "blur(3px) brightness(0.8) saturate(0.6) contrast(0.9)",
                }}
              />
              <div
                className="compare-img after"
                style={{
                  backgroundImage: `url(${thumbForId(DEMO_CLIPS[1].youtubeId)})`,
                  clipPath: `inset(0 0 0 ${comparePos}%)`,
                  filter: "saturate(1.2) contrast(1.08) brightness(1.05)",
                }}
              />
              <div className="compare-label left">YouTube 720p</div>
              <div className="compare-label right">ClipMine 4K</div>
              <div className="compare-handle" style={{ left: `${comparePos}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* MODELS */}
      <section id="models" style={{ background: "var(--bg-elev)" }}>
        <div className="wrap">
          <div className="eyebrow">Modèles d'upscale</div>
          <h2 className="h2">Choisis ton modèle. On fait le reste.</h2>
          <p className="sec-sub">
            Chaque modèle a sa spécialité. Sélectionne-le à l'export, ou laisse l'auto-pilot choisir pour toi.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, maxWidth: 1100, margin: "0 auto" }} className="upscale-models">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {UPSCALE_MODELS.map((m, i) => (
                <div
                  key={m.name}
                  onClick={() => setSelectedModel(i)}
                  style={{
                    padding: "16px 18px",
                    borderRadius: 12,
                    border: "1px solid",
                    borderColor: selectedModel === i ? "var(--accent)" : "var(--line)",
                    background: selectedModel === i ? "rgba(0,102,255,0.08)" : "var(--surface)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{m.name}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "var(--accent-2)",
                      background: "rgba(0,102,255,0.12)", padding: "2px 8px", borderRadius: 4,
                      fontFamily: "var(--mono)", letterSpacing: "0.05em",
                    }}>{m.badge}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--dim)" }}>{m.use}</div>
                </div>
              ))}
            </div>

            <div style={{
              padding: 32, background: "var(--surface)",
              borderRadius: 18, border: "1px solid var(--line-2)",
              minHeight: 320,
            }}>
              <div style={{
                fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent-2)",
                letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12,
              }}>
                Modèle sélectionné
              </div>
              <h3 style={{
                fontFamily: "var(--display)", fontSize: 32, fontWeight: 800,
                letterSpacing: "-0.02em", marginBottom: 16,
              }}>
                {UPSCALE_MODELS[selectedModel].name}
              </h3>
              <p style={{ color: "var(--mut)", fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
                {UPSCALE_MODELS[selectedModel].desc}
              </p>
              <div style={{
                background: "var(--bg)", padding: 16, borderRadius: 12,
                fontFamily: "var(--mono)", fontSize: 13, color: "var(--mut)",
                borderLeft: "3px solid var(--accent)",
              }}>
                <strong style={{ color: "var(--accent-2)" }}>↳ </strong>
                {UPSCALE_MODELS[selectedModel].use}
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 760px) {
              .upscale-models { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <div className="wrap">
          <div className="eyebrow">Capacités</div>
          <h2 className="h2">Tout ce dont a besoin un éditeur pro.</h2>

          <div className="models-grid">
            <div className="model-card feat">
              <span className="tag">UPSCALE</span>
              <div className="ic">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9" />
                  <path d="M12 17V8m-4 5 4 4 4-4" />
                </svg>
              </div>
              <h3>Jusqu'en 4K natif</h3>
              <p>Reconstruction pixel par pixel. Pas de simple agrandissement bicubique. L'IA invente les détails plausibles avec un réalisme bluffant.</p>
            </div>

            <div className="model-card feat">
              <span className="tag">DENOISE</span>
              <div className="ic">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
              <h3>Denoise cinéma</h3>
              <p>Élimine le bruit numérique sans tuer le grain artistique. Préserve la sensation cinéma tout en nettoyant les artefacts de compression.</p>
            </div>

            <div className="model-card">
              <span className="tag">FRAME RATE</span>
              <div className="ic">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3>Interpolation 60/120fps</h3>
              <p>De 24fps à 60 ou 120fps en quelques minutes. Sans artefact de morphing, sans halo. Génération de frames intermédiaires précise.</p>
            </div>

            <div className="model-card">
              <span className="tag">STABILIZE</span>
              <div className="ic">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <h3>Stabilisation gimbal</h3>
              <p>Compense les tremblements caméra a posteriori. Donne à n'importe quel clip un rendu gimbal pro, même si tourné à la main.</p>
            </div>

            <div className="model-card">
              <span className="tag">SLOW-MO</span>
              <div className="ic">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3>Slow-mo fluide</h3>
              <p>Ralentis tes plans à 25%, 50% ou 12% de la vitesse originale. L'IA génère les frames manquantes pour un rendu hyper fluide.</p>
            </div>

            <div className="model-card">
              <span className="tag">RESTORE</span>
              <div className="ic">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </div>
              <h3>Restauration d'archive</h3>
              <p>Désentrelacement, suppression de grain de pellicule, récupération de définition. Parfait pour les VHS, vieux clips YouTube, archives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta">
            <h2>Prêt à upscale ?</h2>
            <p>1 export 4K offert. Pas de carte. Pas d'engagement.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <SignInButton mode="modal">
                <button className="btn btn-primary btn-lg">Démarrer maintenant →</button>
              </SignInButton>
              <Link href="/#pricing" className="btn btn-ghost btn-lg">Voir les tarifs</Link>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="foot-grid">
          <div className="foot-col">
            <Link href="/" className="logo">
              <span className="dot" />Clip<span className="b">Mine</span>
            </Link>
            <p className="foot-tagline">
              Cinema-grade AI video enhancement.
            </p>
          </div>
          <div className="foot-col">
            <h4>Produit</h4>
            <ul>
              <li><Link href="/#models">Modèles AI</Link></li>
              <li><Link href="/upscale">Upscale</Link></li>
              <li><Link href="/#pricing">Tarifs</Link></li>
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
        </div>
      </footer>
    </>
  );
}
