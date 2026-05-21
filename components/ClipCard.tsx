"use client";

import PrimeLink from "./PrimeLink";
import type { ClipResult } from "./SearchPanel";

function formatViews(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n > 0 ? String(n) : "";
}

export default function ClipCard({
  clip,
  ratio,
  onSelect,
}: {
  clip: ClipResult;
  ratio: string;
  onSelect: () => void;
}) {
  return (
    <article className="clip-card">
      <PrimeLink compact />
      <button type="button" className="clip-card-main" onClick={onSelect}>
        <div
          className="clip-card-thumb"
          style={{ backgroundImage: clip.thumb ? `url(${clip.thumb})` : undefined }}
        >
          <span className="clip-type">{clip.type === "series" ? "Série" : "Film"}</span>
          <span className="clip-ratio">{ratio}</span>
        </div>
        <div className="clip-card-body">
          <h3 className="clip-movie">{clip.movie ?? clip.title}</h3>
          {clip.quote && <p className="clip-quote">&ldquo;{clip.quote}&rdquo;</p>}
          <p className="clip-meta">
            {formatViews(clip.views) && `${formatViews(clip.views)} vues · `}
            {clip.channel}
          </p>
        </div>
      </button>
    </article>
  );
}
