"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
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
  const router = useRouter();
  const href = searchHref(query);

  if (isSignedIn) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          onClick?.();
          router.push(href);
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <SignInButton mode="modal" forceRedirectUrl={href}>
      <button type="button" className={className} onClick={onClick}>
        {children}
      </button>
    </SignInButton>
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
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const href = searchHref(query);

  if (isSignedIn) {
    return (
      <button type="button" className={className} onClick={() => router.push(href)}>
        {children}
      </button>
    );
  }

  return (
    <SignInButton mode="modal" forceRedirectUrl={href}>
      <button type="button" className={className}>
        {children}
      </button>
    </SignInButton>
  );
}
