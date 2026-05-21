"use client";

import { useEffect, useState } from "react";
import ClipCard from "./ClipCard";

export type MediaType = "film" | "series";

export type ClipResult = {
  youtubeId: string;
  title: string;
  movie?: string;
  scene?: string;
  channel: string;
  thumb?: string;
  views: number;
  viralScore: number;
  type?: MediaType;
  transcript?: string;
  quote?: string;
  is4K?: boolean;
  direct?: boolean;
};

const CHIPS: [string, string][] = [
  ["Inception", "Inception movie scene 4k"],
  ["Breaking Bad", "Breaking Bad series scene 4k"],
  ["Dark Knight", "Dark Knight Joker scene 4k"],
  ["Interstellar", "Interstellar docking scene 4k"],
  ["Oppenheimer", "Oppenheimer movie scene 4k"],
  ["John Wick", "John Wick 4 fight scene 4k"],
];

type TypeFilter = "all" | MediaType;
type SortMode = "scene" | "popular";

export default function SearchPanel({
  initialQuery = "",
  onSelect,
  compact,
}: {
  initialQuery?: string;
  onSelect: (clip: ClipResult) => void;
  compact?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ClipResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [ratio, setRatio] = useState("9:16");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<SortMode>("scene");

  useEffect(() => {
    if (initialQuery.trim()) runSearch(initialQuery, typeFilter, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  async function runSearch(q?: string, type: TypeFilter = typeFilter, sortMode: SortMode = sort) {
    const term = (q ?? query).trim();
    if (!term) return;
    setQuery(term);
    setLoading(true);
    setResults([]);
    setError(null);
    setDemoMode(false);

    try {
      const params = new URLSearchParams({ q: term, sort: sortMode });
      if (type !== "all") params.set("type", type);
      const r = await fetch(`/api/search?${params}`);
      const data = await r.json();
      if (!r.ok) {
        setError(data.message ?? "Erreur de recherche.");
        return;
      }
      if (!data.results?.length) {
        setError(data.hint ?? "Aucune scène trouvée. Essaie un film, une réplique, ou colle un lien YouTube.");
        return;
      }
      setResults(data.results);
      setDemoMode(data.mode === "demo");
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  function setFilter(type: TypeFilter) {
    setTypeFilter(type);
    if (query.trim()) runSearch(query, type, sort);
  }

  function setSortMode(mode: SortMode) {
    setSort(mode);
    if (query.trim()) runSearch(query, typeFilter, mode);
  }

  return (
    <div className="search-panel">
      {!compact && (
        <p className="search-hint">
          Meilleurs clips YouTube 4K · triés par scène · avec transcription.
          Tape une réplique, un film — ou <strong>colle un lien YouTube</strong>.
        </p>
      )}

      <div className="search-box-min">
        <input
          className="search-input-min"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="Réplique, film, série… ou lien YouTube"
          autoFocus={!!initialQuery}
          enterKeyHint="search"
        />
        <button type="button" className="btn-mine" onClick={() => runSearch()}>
          Chercher
        </button>
      </div>

      <div className="type-tabs">
        {([
          ["all", "Tout"],
          ["film", "Films"],
          ["series", "Séries"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`type-tab ${typeFilter === id ? "on" : ""}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="type-tabs">
        <button type="button" className={`type-tab ${sort === "scene" ? "on" : ""}`} onClick={() => setSortMode("scene")}>
          Par scène
        </button>
        <button type="button" className={`type-tab ${sort === "popular" ? "on" : ""}`} onClick={() => setSortMode("popular")}>
          Popularité
        </button>
      </div>

      {!compact && (
        <div className="chips-min">
          {CHIPS.map(([label, q]) => (
            <button key={q} type="button" className="chip-min" onClick={() => runSearch(q)}>
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="ratio-tabs">
        {["9:16", "16:9", "4:3"].map((r) => (
          <button
            key={r}
            type="button"
            className={`ratio-tab ${ratio === r ? "on" : ""}`}
            onClick={() => setRatio(r)}
          >
            {r}
          </button>
        ))}
      </div>

      {demoMode && (
        <p className="demo-hint">Mode démo · configure <code>YOUTUBE_API_KEY</code> pour les clips 4K live + transcriptions auto.</p>
      )}

      {error && !loading && <p className="search-err">{error}</p>}

      {(loading || (results && results.length > 0)) && (
        <div className="clips-list">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="clip-skeleton" />
              ))
            : results!.map((r) => (
                <ClipCard key={`${r.youtubeId}-${r.scene ?? r.title}`} clip={r} ratio={ratio} onSelect={() => onSelect(r)} />
              ))}
        </div>
      )}
    </div>
  );
}

export function saveExportLocal(job: { id: string; title: string; ratio: string; status: string; date: string }) {
  try {
    const prev = JSON.parse(localStorage.getItem("clipmine_exports") ?? "[]");
    localStorage.setItem("clipmine_exports", JSON.stringify([job, ...prev].slice(0, 50)));
  } catch {}
}

export function loadExportsLocal() {
  try {
    return JSON.parse(localStorage.getItem("clipmine_exports") ?? "[]");
  } catch {
    return [];
  }
}
