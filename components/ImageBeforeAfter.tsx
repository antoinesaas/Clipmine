"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  image: string;
  beforeFilter?: string;
  afterFilter?: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  aspect?: "16/9" | "9/16";
};

export default function ImageBeforeAfter({
  image,
  beforeFilter = "blur(2px) brightness(0.82) saturate(0.72)",
  afterFilter = "saturate(1.15) contrast(1.08) brightness(1.04)",
  beforeLabel = "Avant",
  afterLabel = "Après",
  className = "",
  aspect = "16/9",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);

  const move = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(6, Math.min(94, x)));
  }, []);

  const aspectClass = aspect === "9/16" ? "ba-aspect-916" : "ba-aspect-169";

  return (
    <div
      ref={wrapRef}
      className={`ba-compare ba-image ${aspectClass} ${className}`.trim()}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) move(e.clientX);
      }}
      onTouchStart={(e) => {
        const t = e.touches[0];
        if (t) move(t.clientX);
      }}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (t) move(t.clientX);
      }}
    >
      <div
        className="ba-img ba-before"
        style={{
          backgroundImage: `url(${image})`,
          filter: beforeFilter,
        }}
      />
      <div
        className="ba-img ba-after"
        style={{
          backgroundImage: `url(${image})`,
          filter: afterFilter,
          clipPath: `inset(0 0 0 ${pos}%)`,
        }}
      />
      <span className="compare-label left">{beforeLabel}</span>
      <span className="compare-label right">{afterLabel}</span>
      <div className="compare-handle" style={{ left: `${pos}%` }} aria-hidden />
    </div>
  );
}
