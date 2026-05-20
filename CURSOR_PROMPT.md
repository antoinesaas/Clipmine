# Prompt Cursor — brancher & déployer ClipMine

> La base du projet est COMPLÈTE et code-clean (landing, dashboard, auth, Stripe,
> pipeline vidéo, webhooks, cron). Il ne reste QUE les connexions externes.
> Colle ce prompt dans Cursor (Agent mode) à la racine du projet.

---

Tu travailles sur **ClipMine**, une web app Next.js 14 App Router déjà entièrement codée.
Ton rôle : brancher les services externes, vérifier les liaisons, et déployer.
NE RÉÉCRIS PAS la logique existante sauf bug avéré. Tout le code métier est déjà là.

## Ce qui est DÉJÀ fait (ne pas refaire)
- `app/page.tsx` — landing complète (recherche live, clips en fond, démos, pricing)
- `app/app/page.tsx` — dashboard connecté : recherche, modal export (ratio + enhance), paywall Stripe
- `app/api/search` — YouTube Data API + score viralité
- `app/api/download` — gate monétisation (1 free 4K -> quota -> crédits -> paywall) + déclenche le pipeline
- `app/api/process` — yt-dlp + ffmpeg (download 4K, autocrop ratio, enhance 60fps) + upload R2
- `app/api/download/[id]/status` — polling du job
- `app/api/checkout` + `app/api/stripe-webhook` — Stripe (abos + crédits)
- `app/api/clerk-webhook` — sync user en DB
- `app/api/cron/reset-quotas` — reset mensuel (Vercel Cron)
- `lib/entitlements.ts` — coeur monétisation · `lib/stripe.ts` `lib/prisma.ts` `lib/r2.ts`
- `middleware.ts`, `prisma/schema.prisma`, `vercel.json`

## Ta checklist de CONNEXIONS

### 1. Variables d'env
Vérifie que `.env.local` (copié depuis `.env.example`) contient toutes les clés.
Repère les `process.env.X` utilisés dans le code et confirme qu'aucune n'est oubliée.

### 2. Clerk (auth)
- Vérifie que `<ClerkProvider>` enveloppe bien l'app (layout.tsx) ✓
- Dans Clerk Dashboard : active Google + Email. Configure les URLs sign-in/sign-up.
- Crée le webhook Clerk -> `https://clipmine.io/api/clerk-webhook` (event `user.created`).
- Teste : un nouveau compte doit créer une ligne `User` en DB.

### 3. Stripe
- Crée les 3 produits (Creator 9€/mois, Pro 24€/mois, 10 exports 1,99€ one-time).
- Reporte les `price_id` dans `.env.local`.
- Crée le webhook -> `/api/stripe-webhook` (events `checkout.session.completed`, `customer.subscription.deleted`).
- Teste un paiement en mode test : le plan doit passer à CREATOR en DB.

### 4. Base de données (Supabase)
- `npx prisma migrate dev --name init` puis `npx prisma generate`.

### 5. YouTube Data API
- Active YouTube Data API v3 dans Google Cloud, mets la clé dans `YOUTUBE_API_KEY`.
- Teste `/api/search?q=cars` -> doit renvoyer des résultats classés par score viral.

### 6. Pipeline vidéo
- En local : installe `yt-dlp` et `ffmpeg` sur la machine.
- Sur Vercel : le pipeline (`/api/process`) a `maxDuration: 300`. Pour des clips longs ou
  beaucoup de trafic, déplace le traitement vers un worker dédié (Railway/Render) + Upstash QStash.
  Le code de `app/api/download/route.ts` déclenche déjà `/api/process` en fire-and-forget —
  remplace ce fetch par un enqueue QStash si tu veux des retries fiables.
- Configure Cloudflare R2 (bucket + clés) pour le stockage des exports.

### 7. Cron
- Génère un `CRON_SECRET` aléatoire. Vercel Cron est déjà déclaré dans `vercel.json`.

### 8. Déploiement
- `vercel` puis ajoute toutes les variables d'env dans Vercel.
- Connecte le domaine déjà acheté (Vercel -> Domains).
- Mets à jour `NEXT_PUBLIC_APP_URL` avec le domaine de prod.

### 9. Démos
- L'utilisateur ajoutera ses vidéos dans `public/demos/0.mp4 ... 3.mp4`.
- Dans `app/page.tsx` section démos, décommente la balise `<video>` quand les fichiers sont là.

## Règle
Ne touche pas à `lib/entitlements.ts` (logique business du 1 export 4K offert) sans demander.
Commence par la checklist 1->5, teste chaque liaison, puis le pipeline et le déploiement.
