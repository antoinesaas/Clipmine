"use client";

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
  const router = useRouter();
  const href = searchHref(query);

  function handleClick() {
    onClick?.();
    router.push(href);
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
