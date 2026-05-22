# Configuration ClipMine

Guide pour activer toutes les fonctionnalités en production (Vercel + worker Fly.io).

## 1. Vercel — variables d'environnement

| Variable | Rôle |
|---|---|
| `YOUTUBE_API_KEY` | Recherche live films & séries ✅ |
| `DATABASE_URL` | Pooler Supabase (comptes, quotas, exports) |
| `DIRECT_URL` | Connexion directe Postgres (migrations Prisma) |
| `STRIPE_SECRET_KEY` | Paiements |
| `STRIPE_PRICE_CREATOR` / `PRO` / `CREDITS_10` | IDs de prix Stripe |
| `STRIPE_WEBHOOK_SECRET` | Signature webhook Stripe |
| `R2_*` | Stockage MP4 exportés |
| `WORKER_URL` / `WORKER_SECRET` | Pipeline ffmpeg sur Fly.io |
| Clerk + `CRON_SECRET` | ✅ déjà configurés |

### Supabase (projet `elwqdulkxprjmkejwcai`, région eu-west-1)

Voir **`docs/SUPABASE-VERCEL.md`** — URI via bouton **Connect** (Transaction pooler + Direct), pas l’écran « Connection pooling ».

### Google Search Console

Voir **`docs/GOOGLE-SEARCH-CONSOLE.md`** — utiliser **Préfixe d’URL** + balise HTML, pas « Domaine » DNS.

### Tarifs promo (-40%)

| Plan | Promo | Avant |
|------|-------|-------|
| Creator | 5,49 €/mois | 9 € |
| Pro | 14,99 €/mois | 24 € |
| 10 exports | 1,19 € | 1,99 € |

Recréer les prix Stripe : `node --env-file=.env.local scripts/setup-stripe.mjs`

### Supabase (projet `elwqdulkxprjmkejwcai`)

Tables Prisma **`User`** + **`Download`** via migration `clipmine_init`.

1. [Supabase → Database → Connection string](https://supabase.com/dashboard/project/elwqdulkxprjmkejwcai/settings/database)
2. Copie **URI** (mode Transaction pooler → `DATABASE_URL`)
3. Copie **URI** (mode Direct → `DIRECT_URL`)
4. Remplace `PASSWORD` par le mot de passe DB

```bash
npx prisma migrate deploy   # prod (avec DIRECT_URL)
npx prisma migrate dev      # local
```

### Stripe

Avec ta clé secrète test (même compte que `pk_test_51TZG4k...`) :

```bash
STRIPE_SECRET_KEY=sk_test_xxx node scripts/setup-stripe.mjs
```

Le script crée les 3 prix + le webhook `https://clipmine.fr/api/stripe-webhook` et affiche les variables à coller sur Vercel.

### Cloudflare R2

1. Bucket `clipmine-exports`
2. API token avec accès R2
3. Variables `R2_*` sur Vercel **et** sur le worker Fly

---

## 2. Worker vidéo (Fly.io)

**ffmpeg et yt-dlp ne tournent pas sur Vercel serverless.**

```bash
cd worker
npm install
fly auth login
fly launch --no-deploy    # app: clipmine-worker, region: cdg
fly secrets set WORKER_SECRET=xxx DATABASE_URL=xxx R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... R2_BUCKET=clipmine-exports
fly deploy
```

Puis sur Vercel :

```
WORKER_URL=https://clipmine-worker.fly.dev
WORKER_SECRET=même_secret_que_sur_le_worker
```

Le worker : yt-dlp → ffmpeg → upload R2 → met à jour `Download.status` en DB.

---

## 3. Checklist déploiement

- [x] `YOUTUBE_API_KEY` → recherche live
- [ ] `DATABASE_URL` + `DIRECT_URL` → comptes réels
- [ ] Stripe keys + webhooks → paiements
- [ ] R2 → stockage exports
- [ ] Worker Fly + `WORKER_URL` → pipeline vidéo
- [ ] Clerk webhook → sync users (`CLERK_WEBHOOK_SECRET`)

---

## 4. Dev local

```bash
cp .env.example .env.local
npm install
npx prisma migrate dev
npm run dev
```
