"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { FEATURE_SHOWCASE, embedUrl, type FeatureDemo } from "@/lib/demo-clips";

export default function FeatureShowcase() {
  const [active, setActive] = useState<FeatureDemo | null>(null);

  return (
    <>
      <div className="feature-grid">
        {FEATURE_SHOWCASE.map((f) => (
          <button
            key={f.id}
            type="button"
            className="feature-card"
            onClick={() => setActive(f)}
            aria-label={`Voir la démo ${f.title}`}
          >
            <div className="feature-preview">
              <div
                className="feature-before"
                style={{
                  backgroundImage: `url(${f.thumb})`,
                  filter: f.beforeFilter,
                  transform: f.beforeTransform,
                  backgroundSize: f.backgroundSize ?? "cover",
                  backgroundPosition: f.backgroundPosition ?? "center",
                }}
              />
              <div
                className="feature-after"
                style={{
                  backgroundImage: `url(${f.thumb})`,
                  filter: f.afterFilter,
                  backgroundSize: f.backgroundSize ?? "cover",
                  backgroundPosition: f.backgroundPosition ?? "center",
                }}
              />
              <span className="feature-tag">{f.badge}</span>
              <span className="feature-play">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>
            <div className="feature-copy">
              <strong>{f.title}</strong>
              <span>{f.subtitle}</span>
            </div>
          </button>
        ))}
      </div>

      {active && typeof document !== "undefined" && createPortal(
        <div className="feature-modal overlay-backdrop" onClick={() => setActive(null)}>
          <div className="feature-modal-in clip-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="feature-modal-head">
              <div>
                <span className="feature-tag">{active.badge}</span>
                <h3>{active.title}</h3>
                <p>{active.subtitle}</p>
              </div>
              <button type="button" className="feature-close" onClick={() => setActive(null)} aria-label="Fermer">
                ✕
              </button>
            </div>
            <div className="feature-video-wrap">
              <iframe
                src={`${embedUrl(active.youtubeId)}&autoplay=1`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="feature-modal-note">{active.note}</p>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
