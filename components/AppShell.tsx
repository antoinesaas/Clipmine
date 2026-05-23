"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AppUserButton from "@/components/AppUserButton";
import DiscordIcon from "@/components/DiscordIcon";
import Logo from "@/components/Logo";
import { DISCORD_URL } from "@/lib/constants";

const NAV = [
  { href: "/app/search", label: "Chercher", icon: "M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" },
  { href: "/app/exports", label: "Exports", icon: "M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9M12 17V8m-4 5 4 4 4-4" },
  { href: "/app/billing", label: "Plan", icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
];

export default function AppShell({
  children,
  quotaLabel,
}: {
  children: React.ReactNode;
  quotaLabel?: string;
}) {
  const path = usePathname();

  return (
    <div className="app-shell">
      <header className="app-top">
        <Logo className="logo app-logo" href="/app/search" />
        <div className="app-top-right">
          {quotaLabel && <span className="quota-badge">{quotaLabel}</span>}
          <div className="app-header-actions">
            <a
              href={DISCORD_URL}
              className="nav-discord"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Rejoindre le Discord ClipMine"
            >
              <DiscordIcon size={18} />
            </a>
            <div className="app-user-btn">
              <AppUserButton />
            </div>
          </div>
        </div>
      </header>

      <main className="app-content">{children}</main>

      <div className="app-bottom-nav" role="navigation" aria-label="Navigation">
        {NAV.map((item) => {
          const active = path.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`bottom-nav-item ${active ? "active" : ""}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
