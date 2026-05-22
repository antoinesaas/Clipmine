import { PRIME_AFFILIATE_LABEL, PRIME_AFFILIATE_URL } from "@/lib/constants";

export default function PrimeBuyButton() {
  return (
    <a
      href={PRIME_AFFILIATE_URL}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="prime-buy-btn"
    >
      <span className="prime-buy-btn-long">{PRIME_AFFILIATE_LABEL}</span>
      <span className="prime-buy-btn-short">Prime · 30j gratuits</span>
    </a>
  );
}
