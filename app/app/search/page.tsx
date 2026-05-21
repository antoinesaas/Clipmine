"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchPanel, { type ClipResult } from "@/components/SearchPanel";
import { ExportModal, PaywallModal } from "@/components/ExportModal";
import { useMe } from "@/components/AppLayoutClient";

function SearchContent() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const { me } = useMe();
  const [selected, setSelected] = useState<ClipResult | null>(null);
  const [paywall, setPaywall] = useState(false);

  return (
    <div className="app-page-min">
      <header className="app-hero-min">
        <h1>Scènes films & séries</h1>
        <p>Pour tes édits TikTok · export 9:16 en 4K</p>
      </header>

      <SearchPanel initialQuery={q} onSelect={setSelected} />

      {selected && (
        <ExportModal
          clip={selected}
          waitlist={me?.waitlist}
          onClose={() => setSelected(null)}
          onPaywall={() => { setSelected(null); setPaywall(true); }}
          onDone={() => {}}
        />
      )}
      {paywall && <PaywallModal onClose={() => setPaywall(false)} />}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="app-page-min">
        <div className="clip-skeleton" style={{ height: 120, marginTop: 20 }} />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
