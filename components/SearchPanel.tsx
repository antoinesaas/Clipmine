"use client";

import { useEffect, useState } from "react";
import ClipCard from "./ClipCard";
import { TRENDING_FILMS } from "@/lib/demo-clips";
import { normalizeSearchQuery } from "@/lib/normalize-search-query";
import type { MediaType } from "@/lib/film-filter";

export type { MediaType };

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
  ["Inception", "Inception movieclips"],
  ["Breaking Bad", "Breaking Bad series scene"],
  ["Interstellar", "Interstellar movieclips"],
  ["Dark Knight", "Dark Knight movieclips"],
  ["Oppenheimer", "Oppenheimer scene pack clips for edits"],
  ["John Wick", "John Wick movieclips"],
  ["Harry Potter", "Harry Potter movieclips"],
  ["Dune", "Dune movieclips"],
  ...TRENDING_FILMS.filter(([label]) =>
    !["Inception", "Interstellar", "John Wick", "Harry Potter", "Dune", "Oppenheimer"].includes(label),
  ),
];

type TypeFilter = "all" | MediaType;
type SortMode = "scene" | "popular";

export default function SearchPanel({
  initialQuery = "",
  onSelect,
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
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<SortMode>("scene");
  const [showMoreChips, setShowMoreChips] = useState(false);
  const [lastQueryUsed, setLastQueryUsed] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery.trim()) runSearch(initialQuery, typeFilter, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  async function runSearch(q?: string, type: TypeFilter = typeFilter, sortMode: SortMode = sort) {
    const raw = (q ?? query).trim();
    if (!raw) return;
    const { userInput, apiQuery, augmented } = normalizeSearchQuery(raw);
    setQuery(userInput);
    setLastQueryUsed(augmented ? apiQuery : null);
    setLoading(true);
    setResults([]);
    setError(null);
    setDemoMode(false);

    try {
      const params = new URLSearchParams({ q: apiQuery, sort: sortMode });
      if (type !== "all") params.set("type", type);
      const r = await fetch(`/api/search?${params}`);
      const data = await r.json();
      if (!r.ok) {
        setError(data.message ?? "Erreur de recherche.");
        return;
      }
      if (!data.results?.length) {
        setError(data.hint ?? "Aucun clip trouvé. Essaie un autre titre ou un lien YouTube.");
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
      <div className="search-panel-controls">
        <p className="search-hint">
          Film, série, artiste ou <strong>lien YouTube</strong> — puis export 4K.
          <span className="search-hint-sub"> Entrée = recherche optimisée scene pack / Movieclips.</span>
        </p>
        {lastQueryUsed && (
          <p className="search-query-used">
            Recherche YouTube : <strong>{lastQueryUsed}</strong>
          </p>
        )}

        <div className="search-box-min">
          <input
            className="search-input-min"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Inception, Breaking Bad, lien YouTube…"
            autoFocus={!!initialQuery}
            enterKeyHint="search"
          />
          <button type="button" className="btn-mine" onClick={() => runSearch()}>
            Chercher
          </button>
        </div>

        <div className="search-toolbar">
          <div className="type-tabs type-tabs-inline">
            {([
              ["all", "Tout"],
              ["film", "Films"],
              ["series", "Séries"],
              ["sport", "Sport"],
              ["person", "Personnes"],
              ["animation", "Dessin animé"],
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
          <div className="search-sort">
            <button
              type="button"
              className={`sort-pill ${sort === "scene" ? "on" : ""}`}
              onClick={() => setSortMode("scene")}
            >
              Par scène
            </button>
            <button
              type="button"
              className={`sort-pill ${sort === "popular" ? "on" : ""}`}
              onClick={() => setSortMode("popular")}
            >
              Popularité
            </button>
          </div>
        </div>

        <div className="chips-min">
          {CHIPS.slice(0, showMoreChips ? CHIPS.length : 3).map(([label, q]) => (
            <button key={q} type="button" className="chip-min" onClick={() => runSearch(q)}>
              {label}
            </button>
          ))}
          <button
            type="button"
            className="chip-min chip-more"
            onClick={() => setShowMoreChips(!showMoreChips)}
          >
            {showMoreChips ? "Moins" : "+ Suggestions"}
          </button>
        </div>

        {demoMode && (
          <p className="demo-hint">Mode démo — certains titres nécessitent la clé YouTube live.</p>
        )}

        {error && !loading && <p className="search-err">{error}</p>}
      </div>

      <div className="search-panel-results">
        {(loading || (results && results.length > 0)) && (
          <div className="clips-list">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="clip-skeleton" />
                ))
              : results!.map((r) => (
                  <ClipCard
                    key={`${r.youtubeId}-${r.scene ?? r.title}`}
                    clip={r}
                    onSelect={() => onSelect(r)}
                  />
                ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function saveExportLocal(job: {
  id: string;
  title: string;
  ratio: string;
  quality?: string;
  status: string;
  date: string;
  fileUrl?: string;
}) {
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
