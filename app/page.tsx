"use client";

import { useEffect, useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEMO_CLIPS, TRENDING_FILMS, thumbForId, clipsForHero } from "@/lib/demo-clips";
import AuthSearchButton from "@/components/AuthSearchButton";

const CHIPS = [
  ["Inception", "Inception movie scene"],
  ["Breaking Bad", "Breaking Bad series scene"],
  ["Dark Knight", "Dark Knight Joker scene"],
  ["Interstellar", "Interstellar docking scene"],
  ["Game of Thrones", "Game of Thrones battle scene"],
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
  { title: "Agences & Studios", desc: "Workflow B-roll industriel, batch processing, accès API." },
  { title: "Archivistes & Passionnés", desc: "Restaure des films de famille, des VHS, des archives historiques." },
];

function isYoutubeUrl(s: string) {
  return /(?:youtube\.com\/|youtu\.be\/)/.test(s);
}

export default function Landing() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [bgRows, setBgRows] = useState<string[][]>([]);
  const [query, setQuery] = useState("");
  const [comparePos, setComparePos] = useState(50);

  useEffect(() => {
    const thumbs = clipsForHero();
    setBgRows([0, 1, 2].map((i) => {
      const rotated = [...thumbs.slice(i), ...thumbs.slice(0, i)];
      return Array.from({ length: 14 }, (_, j) => rotated[j % rotated.length]);
    }));
  }, []);

  function goSearch(q?: string) {
    const term = (q ?? query).trim();
    if (!term) return;
    setQuery(term);
    router.push(`/app/search?q=${encodeURIComponent(term)}`);
  }

  function searchUrl(q?: string) {
    const term = (q ?? query).trim();
    return term ? `/app/search?q=${encodeURIComponent(term)}` : "/app/search";
  }

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
            <a href="#models">Modèles AI</a>
            <a href="#demos">Démos</a>
            <a href="#pricing">Tarifs</a>
            <Link href="/upscale">Upscale</Link>
            <SignedOut><SignInButton mode="modal"><a>Connexion</a></SignInButton></SignedOut>
            <SignedIn><Link href="/app/search">Mon espace</Link></SignedIn>
          </div>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn btn-primary">Essayer gratuitement</button>
            </SignInButton>
          </SignedOut>
          <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
        </div>
      </nav>

      <header className="hero">
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
        <div className="hero-fade" />
        <div className="hero-glow" />
        <div className="hero-in wrap">
          <div className="badge">
            <span className="pulse" />FILMS · SÉRIES · ÉDITS TIKTOK
          </div>
          <h1>
            Trouve ta scène.<br />
            <span className="grad">Exporte en 9:16 · 4K.</span>
          </h1>
          <p className="sub">
            Films et séries uniquement — comme une base de répliques pour éditeurs.
            Colle un lien YouTube ou tape une scène. Recadrage auto, upscale IA.
          </p>

          <div className="search-box">
            <div className="search-shell">
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
                    if (isSignedIn) goSearch();
                  }
                }}
                placeholder="Réplique, film, série… ou lien YouTube"
              />
              <AuthSearchButton query={query || "Inception movie scene 4k"} className="btn btn-primary">
                Mine →
              </AuthSearchButton>
            </div>
            <div className="chips">
              {CHIPS.map(([label, q]) => (
                <AuthSearchButton key={q} query={q} className="chip">
                  {label}
                </AuthSearchButton>
              ))}
            </div>
            <div className="hero-note">
              Films & séries · lien YouTube accepté · export 4K
            </div>
          </div>
        </div>

        <div className="trending-row">
          {TRENDING_FILMS.map(([label, q]) => (
            <AuthSearchButton key={q} query={q} className="trending-pill">
              {label}
            </AuthSearchButton>
          ))}
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
            Glisse le curseur pour comparer le clip source compressé YouTube à la version ClipMine 4K upscalée.
          </p>

          <div
            className="compare-wrap"
            onMouseMove={handleCompareMove}
            onTouchMove={(e) => {
              const t = e.touches[0];
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = ((t.clientX - rect.left) / rect.width) * 100;
              setComparePos(Math.max(0, Math.min(100, x)));
            }}
          >
            <div className="compare">
              <div
                className="compare-img"
                style={{
                  backgroundImage: `url(${thumbForId(DEMO_CLIPS[0].youtubeId)})`,
                  filter: "blur(2px) brightness(0.85) saturate(0.7)",
                }}
              />
              <div
                className="compare-img after"
                style={{
                  backgroundImage: `url(${thumbForId(DEMO_CLIPS[0].youtubeId)})`,
                  clipPath: `inset(0 0 0 ${comparePos}%)`,
                  filter: "saturate(1.15) contrast(1.05)",
                }}
              />
              <div className="compare-label left">Source YouTube</div>
              <div className="compare-label right">ClipMine 4K</div>
              <div className="compare-handle" style={{ left: `${comparePos}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* DEMOS - VRAIS CLIPS YOUTUBE */}
      <section id="demos">
        <div className="wrap">
          <div className="eyebrow">En action</div>
          <h2 className="h2">Scènes films & séries.</h2>
          <p className="sec-sub">
            Inspire-toi de ta scène, exporte en 9:16 pour ton prochain édit TikTok.
          </p>

          <div className="demo-grid">
            {DEMO_CLIPS.slice(0, 8).map((c) => (
              <AuthSearchButton
                key={c.youtubeId}
                query={`${c.movie} ${c.scene} 4k`}
                className="demo demo-btn"
              >
                <span
                  className="demo-bg"
                  style={{ backgroundImage: `url(${thumbForId(c.youtubeId)})` }}
                />
                <span className="badge-4k">4K · 9:16</span>
                <span className="play">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="lbl">{c.movie} — {c.scene}</span>
                <span className="demo-transcript">&ldquo;{c.transcript}&rdquo;</span>
              </AuthSearchButton>
            ))}
          </div>
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
            Premier export 4K offert. Pas de carte. Choisis ton plan ensuite.
          </p>

          <div className="price-grid">
            <div className="plan">
              <h3>Free</h3>
              <p className="pdesc">Pour tester la magie</p>
              <div className="price">0€</div>
              <ul>
                <li>{Check()}Recherches illimitées</li>
                <li>{Check()}<b>1 export 4K offert</b></li>
                <li>{Check()}Autocrop basique 9:16 / 16:9</li>
                <li className="off">{Check()}Enhance IA</li>
              </ul>
              <SignInButton mode="modal" forceRedirectUrl="/app/search">
                <button type="button" className="btn btn-ghost">Commencer</button>
              </SignInButton>
            </div>

            <div className="plan feat-plan">
              <div className="pop">Le plus populaire</div>
              <h3>Creator</h3>
              <p className="pdesc">Pour les éditeurs actifs</p>
              <div className="price">9€<small>/mois</small></div>
              <ul>
                <li>{Check()}Tout du plan Free</li>
                <li>{Check()}<b>50 exports 4K / mois</b></li>
                <li>{Check()}Enhance IA + 60fps</li>
                <li>{Check()}Tous les modèles AI</li>
                <li>{Check()}Hook Finder</li>
              </ul>
              <SignInButton mode="modal" forceRedirectUrl="/app/billing">
                <button type="button" className="btn btn-primary">Passer Creator</button>
              </SignInButton>
            </div>

            <div className="plan">
              <h3>Pro</h3>
              <p className="pdesc">Pour les agences & studios</p>
              <div className="price">24€<small>/mois</small></div>
              <ul>
                <li>{Check()}Tout du plan Creator</li>
                <li>{Check()}<b>Exports illimités</b></li>
                <li>{Check()}Trend Radar</li>
                <li>{Check()}Accès API</li>
                <li>{Check()}Support prioritaire</li>
              </ul>
              <SignInButton mode="modal" forceRedirectUrl="/app/billing">
                <button type="button" className="btn btn-ghost">Passer Pro</button>
              </SignInButton>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta">
            <h2>Ton prochain édit viral<br />commence ici.</h2>
            <p>Premier export 4K offert. Pas de carte. Pas d'excuse.</p>
            <SignInButton mode="modal" forceRedirectUrl="/app/search">
              <button type="button" className="btn btn-primary btn-lg">Miner mon premier clip →</button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="foot-grid">
          <div className="foot-col">
            <Link href="/" className="logo">
              <span className="dot" />Clip<span className="b">Mine</span>
            </Link>
            <p className="foot-tagline">
              Cinema-grade AI video enhancement. La matière première de tes édits, minée et upscalée en secondes.
            </p>
          </div>
          <div className="foot-col">
            <h4>Produit</h4>
            <ul>
              <li><a href="#models">Modèles AI</a></li>
              <li><Link href="/upscale">Upscale</Link></li>
              <li><a href="#pricing">Tarifs</a></li>
              <li><a href="#demos">Démos</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>Société</h4>
            <ul>
              <li><a href="mailto:contact@clipmine.fr">Contact</a></li>
              <li><Link href="/cgu">CGU</Link></li>
              <li><Link href="/mentions-legales">Mentions légales</Link></li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>Ressources</h4>
            <ul>
              <li><a href="https://github.com/antoinesaas/Clipmine" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="mailto:contact@clipmine.fr">Support</a></li>
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

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
