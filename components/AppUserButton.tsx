"use client";

import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

const clerkDarkMenu = {
  variables: {
    colorText: "#f2f4f8",
    colorTextSecondary: "#a8b0c0",
    colorBackground: "#1a1a20",
    colorNeutral: "#f2f4f8",
    colorInputText: "#f2f4f8",
  },
  elements: {
    userButtonBox: "app-clerk-user-box",
    userButtonTrigger: "app-clerk-user-trigger focus:shadow-none",
    userButtonAvatarBox: "app-clerk-user-avatar",
    userButtonPopoverCard: "!bg-[#1a1a20] !border !border-[#2a2a35] !shadow-xl",
    userButtonPopoverActions: "!bg-[#1a1a20]",
    userButtonPopoverActionButton: "!text-[#f2f4f8] hover:!bg-white/10",
    userButtonPopoverActionButtonText: "!text-[#f2f4f8]",
    userButtonPopoverActionButtonIcon: "!text-[#f2f4f8]",
    userButtonPopoverFooter: "hidden",
  },
} as const;

export default function AppUserButton() {
  const { signOut } = useClerk();
  const { user } = useUser();

  async function openBillingPortal() {
    try {
      const r = await fetch("/api/billing-portal", { method: "POST" });
      const data = await r.json();
      if (r.status === 503) {
        toast.info(data.message ?? "Abonnement Stripe bientôt disponible.");
        return;
      }
      if (!r.ok || !data.url) {
        toast.error(data.message ?? "Impossible d'ouvrir Stripe.");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Erreur réseau.");
    }
  }

  async function deleteAccount() {
    if (
      !window.confirm(
        "Supprimer définitivement ton compte ClipMine ? Cette action est irréversible.",
      )
    ) {
      return;
    }
    try {
      const r = await fetch("/api/account", { method: "DELETE" });
      if (!r.ok) {
        const data = await r.json();
        toast.error(data.message ?? "Impossible de supprimer le compte.");
        return;
      }
      await user?.delete();
      await signOut({ redirectUrl: "/" });
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  }

  return (
    <UserButton afterSignOutUrl="/" appearance={clerkDarkMenu}>
      <UserButton.MenuItems>
        <UserButton.Action
          label="Gérer mon abonnement"
          labelIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
          }
          onClick={() => openBillingPortal()}
        />
        <UserButton.Action
          label="Supprimer mon compte"
          labelIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
          }
          onClick={() => deleteAccount()}
        />
        <UserButton.Action
          label="Se déconnecter"
          labelIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          }
          onClick={() => signOut({ redirectUrl: "/" })}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
