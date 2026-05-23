"use client";

import ImageBeforeAfter from "@/components/ImageBeforeAfter";
import { FEATURE_SHOWCASE } from "@/lib/demo-clips";

/** Démos avant/après inline — pas de modal (comparaison directe sur chaque carte). */
export default function FeatureShowcase() {
  return (
    <div className="feature-grid">
      {FEATURE_SHOWCASE.map((f) => (
        <article key={f.id} className="feature-card">
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
            <p className="feature-note">{f.note}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
