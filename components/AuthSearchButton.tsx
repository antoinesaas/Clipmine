"use client";

import { useClerk, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function searchHref(q: string) {
  return `/app/search?q=${encodeURIComponent(q.trim())}`;
}

export default function AuthSearchButton({
  query,
  className,
  children,
  onClick,
}: {
  query: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const href = searchHref(query);

  function handleClick() {
    onClick?.();
    if (isSignedIn) {
      router.push(href);
      return;
    }
    openSignIn({ forceRedirectUrl: href });
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children}
    </button>
  );
}

export function AuthSearchLink({
  query,
  className,
  children,
}: {
  query: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <AuthSearchButton query={query} className={className}>
      {children}
    </AuthSearchButton>
  );
}
