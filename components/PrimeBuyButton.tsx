import { PRIME_AFFILIATE_LABEL, PRIME_AFFILIATE_URL } from "@/lib/constants";

export default function PrimeBuyButton({ onClick }: { onClick?: (e: React.MouseEvent) => void }) {
  return (
    <a
      href={PRIME_AFFILIATE_URL}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="prime-buy-btn"
      onClick={onClick}
    >
      {PRIME_AFFILIATE_LABEL}
    </a>
  );
}
