import { PRIME_AFFILIATE_LABEL, PRIME_AFFILIATE_URL } from "@/lib/constants";

export default function PrimeLink({ compact }: { compact?: boolean }) {
  return (
    <a
      href={PRIME_AFFILIATE_URL}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`prime-link ${compact ? "prime-link-compact" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="prime-dot" aria-hidden />
      {compact ? "Prime · 30j gratuits" : PRIME_AFFILIATE_LABEL}
    </a>
  );
}
