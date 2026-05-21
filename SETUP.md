# Configuration ClipMine

Guide pour activer toutes les fonctionnalités en production (Vercel + worker dédié).

## 1. Vercel — variables d'environnement

Dans **Vercel → Project → Settings → Environment Variables**, ajoute :

| Variable | Rôle |
|---|---|
| `YOUTUBE_API_KEY` | Recherche live films & séries via YouTube Data API v3 |
| `DATABASE_URL` | Comptes, quotas, historique exports (Supabase Postgres) |
| `STRIPE_SECRET_KEY` | Paiements |
| `STRIPE_PRICE_CREATOR` / `PRO` / `CREDITS_10` | IDs de prix Stripe |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` | Stockage MP4 exportés |
| `WORKER_URL` / `WORKER_SECRET` | Pipeline vidéo ffmpeg (Railway ou Fly) |
| Clerk + `CRON_SECRET` | Déjà configurés |

Copie `.env.example` en `.env.local` pour le dev local.

### YouTube API

1. [Google Cloud Console](https://console.cloud.google.com) → nouveau projet
2. Activer **YouTube Data API v3**
3. Créer une clé API → `YOUTUBE_API_KEY`

### Database (Supabase)

```bash
npx prisma migrate deploy   # prod
npx prisma migrate dev      # local
```

### Stripe

1. Crée 3 produits/prix dans Stripe Dashboard
2. Colle les `price_xxx` dans les variables
3. Webhook → `https://clipmine.fr/api/stripe-webhook`

### Cloudflare R2

1. Bucket `clipmine-exports`
2. API token avec accès R2
3. Variables `R2_*` sur Vercel **et** sur le worker

---

## 2. Worker vidéo (Railway ou Fly.io)

**ffmpeg et yt-dlp ne tournent pas sur Vercel serverless.**

Le dossier `worker/` contient un serveur Express minimal :

```bash
cd worker
npm install
# Fly.io
fly launch
fly secrets set WORKER_SECRET=xxx R2_ACCOUNT_ID=... DATABASE_URL=...
fly deploy

# Railway
railway up
```

Puis sur Vercel :

```
WORKER_URL=https://ton-worker.fly.dev
WORKER_SECRET=même_secret_que_sur_le_worker
```

Le worker reçoit `POST /process` depuis `/api/download` et exécute yt-dlp → ffmpeg → (upload R2 à brancher).

---

## 3. Affiliation Amazon Prime

Lien configuré dans `lib/constants.ts` :

`https://www.primevideo.com/?tag=clipmine-21`

Affiché au-dessus de chaque scène film/série dans l'app.

---

## 4. Checklist déploiement

- [ ] `YOUTUBE_API_KEY` → recherche live (sinon mode démo)
- [ ] `DATABASE_URL` + `prisma migrate deploy` → comptes réels
- [ ] Stripe keys + webhooks → paiements
- [ ] R2 → stockage exports
- [ ] Worker déployé + `WORKER_URL` → pipeline vidéo réel
- [ ] Clerk webhook → sync users

---

## 5. Dev local

```bash
cp .env.example .env.local
npm install
npx prisma migrate dev
npm run dev
```

Sans `YOUTUBE_API_KEY` : clips démo films/séries.  
Sans `DATABASE_URL` : mode waitlist sur les exports.  
Sans `WORKER_URL` : jobs en file d'attente.
