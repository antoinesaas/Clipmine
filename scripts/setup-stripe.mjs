/**
 * Crée les produits Stripe ClipMine + webhook de prod.
 * Usage: STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe.mjs
 */
const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Missing STRIPE_SECRET_KEY");
  process.exit(1);
}

const BASE = "https://api.stripe.com/v1";
const APP = process.env.NEXT_PUBLIC_APP_URL?.replace(/\r?\n/g, "") ?? "https://clipmine.fr";

async function stripe(path, body = {}) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "object" && !Array.isArray(v)) {
      for (const [sk, sv] of Object.entries(v)) params.append(`${k}[${sk}]`, String(sv));
    } else if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === "object") {
          for (const [sk, sv] of Object.entries(item)) params.append(`${k}[${i}][${sk}]`, String(sv));
        } else {
          params.append(`${k}[${i}]`, String(item));
        }
      });
    } else {
      params.append(k, String(v));
    }
  }
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

async function main() {
  const plans = [
    { env: "STRIPE_PRICE_CREATOR", name: "ClipMine Creator (-40%)", amount: 549, interval: "month" },
    { env: "STRIPE_PRICE_PRO", name: "ClipMine Pro (-40%)", amount: 1499, interval: "month" },
    { env: "STRIPE_PRICE_CREDITS_10", name: "ClipMine 10 exports (-40%)", amount: 119, interval: null },
  ];

  const out = {};
  for (const plan of plans) {
    const product = await stripe("/products", { name: plan.name, metadata: { app: "clipmine" } });
    const priceBody = {
      product: product.id,
      currency: "eur",
      unit_amount: plan.amount,
    };
    if (plan.interval) {
      priceBody.recurring = { interval: plan.interval };
    }
    const price = await stripe("/prices", priceBody);
    out[plan.env] = price.id;
    console.log(`${plan.env}=${price.id}  (${plan.name})`);
  }

  const webhook = await stripe("/webhook_endpoints", {
    url: `${APP}/api/stripe-webhook`,
    enabled_events: ["checkout.session.completed", "customer.subscription.deleted"],
  });

  console.log("\n# Ajoute sur Vercel :");
  console.log(`STRIPE_SECRET_KEY=${key}`);
  console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
  for (const [k, v] of Object.entries(out)) console.log(`${k}=${v}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
