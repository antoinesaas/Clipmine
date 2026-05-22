"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import ImageBeforeAfter from "@/components/ImageBeforeAfter";
import { FEATURE_SHOWCASE, type FeatureDemo } from "@/lib/demo-clips";

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
              <ImageBeforeAfter
                image={f.thumb}
                beforeFilter={f.beforeFilter}
                afterFilter={f.afterFilter}
                beforeLabel="Avant"
                afterLabel="Après"
                className="feature-ba-inline"
                aspect="16/9"
              />
              <span className="feature-tag">{f.badge}</span>
            </div>
            <div className="feature-copy">
              <strong>{f.title}</strong>
              <span>{f.subtitle}</span>
            </div>
          </button>
        ))}
      </div>

      {active && typeof document !== "undefined" && createPortal(
        <div className="feature-modal-shell" role="presentation">
          <button type="button" className="overlay-backdrop" onClick={() => setActive(null)} aria-label="Fermer" />
          <div className="feature-modal-panel" role="dialog" aria-modal="true">
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
            <ImageBeforeAfter
              image={active.thumb}
              beforeFilter={active.beforeFilter}
              afterFilter={active.afterFilter}
              beforeLabel="Source"
              afterLabel="ClipMine"
              className="feature-ba-modal"
              aspect="16/9"
            />
            <p className="feature-modal-note">{active.note}</p>
            <p className="feature-modal-hint">Glisse le curseur pour comparer avant / après.</p>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
