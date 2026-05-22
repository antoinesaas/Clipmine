"use client";

import { UserButton, useClerk } from "@clerk/nextjs";

const clerkDarkMenu = {
  variables: {
    colorText: "#f2f4f8",
    colorTextSecondary: "#a8b0c0",
    colorBackground: "#1a1a20",
    colorNeutral: "#f2f4f8",
    colorInputText: "#f2f4f8",
  },
  elements: {
    userButtonBox: "w-9 h-9",
    userButtonTrigger: "focus:shadow-none",
    userButtonPopoverCard: "!bg-[#1a1a20] !border !border-[#2a2a35] !shadow-xl",
    userButtonPopoverActions: "!bg-[#1a1a20]",
    userButtonPopoverActionButton: "!text-[#f2f4f8] hover:!bg-white/10",
    userButtonPopoverActionButtonText: "!text-[#f2f4f8]",
    userButtonPopoverActionButtonIcon: "!text-[#f2f4f8]",
    userButtonPopoverFooter: "hidden",
  },
} as const;

export default function AppUserButton() {
  const { openUserProfile, signOut } = useClerk();

  return (
    <UserButton afterSignOutUrl="/" appearance={clerkDarkMenu}>
      <UserButton.MenuItems>
        <UserButton.Action
          label="Paramètres du compte"
          labelIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          }
          onClick={() => openUserProfile()}
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
