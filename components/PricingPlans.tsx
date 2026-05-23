"use client";

import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";
import { PRICING, formatPrice, planBullets } from "@/lib/plans";

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BulletList({ plan }: { plan: "FREE" | "CREATOR" | "PRO" }) {
  return (
    <ul>
      {planBullets(plan).map((b) => (
        <li key={b.text} className={b.off ? "off" : undefined}>
          {Check()}
          {b.bold ? <b>{b.text}</b> : b.text}
        </li>
      ))}
    </ul>
  );
}

export default function PricingPlans() {
  const c = PRICING.CREATOR;
  const p = PRICING.PRO;

  return (
    <div className="price-grid">
      <div className="plan">
        <h3>Free</h3>
        <p className="pdesc">Pour tester</p>
        <div className="price">0€</div>
        <BulletList plan="FREE" />
        <Link href="/sign-up" className="btn btn-ghost">
          Commencer
        </Link>
      </div>

      <div className="plan feat-plan">
        <div className="pop">{c.discountLabel} · promo</div>
        <h3>{c.name}</h3>
        <p className="pdesc">{c.tagline}</p>
        <div className="price">
          {formatPrice(c.priceMonthly)}<small>/mois</small>
          <span className="price-was">{formatPrice(c.priceWas)}</span>
        </div>
        <BulletList plan="CREATOR" />
        <CheckoutButton plan="CREATOR" className="btn btn-primary">
          Passer Creator — {formatPrice(c.priceMonthly)}/mois
        </CheckoutButton>
      </div>

      <div className="plan">
        <div className="pop promo-secondary">{p.discountLabel} · promo</div>
        <h3>{p.name}</h3>
        <p className="pdesc">{p.tagline}</p>
        <div className="price">
          {formatPrice(p.priceMonthly)}<small>/mois</small>
          <span className="price-was">{formatPrice(p.priceWas)}</span>
        </div>
        <BulletList plan="PRO" />
        <CheckoutButton plan="PRO" className="btn btn-ghost">
          Passer Pro — {formatPrice(p.priceMonthly)}/mois
        </CheckoutButton>
      </div>
    </div>
  );
}
