"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadExportsLocal } from "@/components/SearchPanel";

type ExportJob = {
  id: string;
  title: string;
  ratio: string;
  status: string;
  date: string;
};

export default function ExportsPage() {
  const [exports, setExports] = useState<ExportJob[]>([]);

  useEffect(() => {
    setExports(loadExportsLocal());
  }, []);

  return (
    <div className="app-page-min">
      <header className="app-hero-min">
        <h1>Mes exports</h1>
        <p>Clips en 9:16 · 4K</p>
      </header>

      {exports.length === 0 ? (
        <div className="empty-state">
          <p>Aucun export.</p>
          <Link href="/app/search" className="btn btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
            Chercher une scène
          </Link>
        </div>
      ) : (
        <div className="export-list">
          {exports.map((e) => (
            <div key={e.id} className="export-row">
              <div>
                <div className="export-row-title">{e.title}</div>
                <div className="export-row-meta">
                  {e.ratio} · {e.status === "queued" ? "En attente" : e.status}
                  {e.date && ` · ${new Date(e.date).toLocaleDateString("fr-FR")}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
