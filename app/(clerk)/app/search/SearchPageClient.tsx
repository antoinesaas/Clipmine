"use client";

import { useState } from "react";
import SearchPanel, { type ClipResult } from "@/components/SearchPanel";
import { ExportModal, PaywallModal } from "@/components/ExportModal";
import { useMe } from "@/components/AppLayoutClient";

export default function SearchPageClient({ initialQuery = "" }: { initialQuery?: string }) {
  const { me } = useMe();
  const [selected, setSelected] = useState<ClipResult | null>(null);
  const [paywall, setPaywall] = useState(false);

  return (
    <div className="app-search-page">
      <header className="app-hero-min app-search-head">
        <h1>Scènes films & séries</h1>
        <p>Pour tes édits TikTok · export 9:16 en 4K</p>
      </header>

      <SearchPanel initialQuery={initialQuery} onSelect={setSelected} />

      {selected && (
        <ExportModal
          clip={selected}
          plan={(me?.plan as "FREE" | "CREATOR" | "PRO") ?? "FREE"}
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
