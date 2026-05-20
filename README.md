# ClipMine 🎬

**Mine the internet. Build the viral.**
Web app de recherche, recadrage et amélioration de clips YouTube — la matière première de tes édits TikTok / Reels / Shorts.

---

## ✅ État du projet
La base est **complète et fonctionnelle**. Tout le code est écrit :
landing, dashboard connecté, auth, paiements, pipeline vidéo, webhooks, cron.
Il ne reste qu'à **brancher les clés** (voir `CURSOR_PROMPT.md`) et déployer.

## 🚀 Démarrage
```bash
npm install                 # génère aussi le client Prisma
cp .env.example .env.local  # remplis les clés
npx prisma migrate dev --name init
npm run dev                 # http://localhost:3000
```

## 🔑 Comptes à créer (tous ont un free tier)
| Service | Pour quoi |
|---|---|
| Clerk | Connexion Google / Email |
| Stripe | Paiements (abos + crédits) |
| Supabase | Base Postgres |
| Google Cloud | YouTube Data API v3 |
| Cloudflare R2 | Stockage des exports |
| Vercel | Hébergement |

## 💰 Monétisation (stratégie agressive)
Le wedge : **1 export 4K offert**, puis paywall. Logique dans `lib/entitlements.ts`.
Priorité quand un user exporte : free 4K → quota mensuel → crédits → paywall (HTTP 402).

| Plan | Prix | Exports 4K | Enhance | B-roll / API |
|---|---|---|---|---|
| Free | 0€ | 1 (offert) | ❌ | ❌ |
| Creator | 9€/mois | 50/mois | ✅ | ❌ |
| Pro | 24€/mois | illimité | ✅ | ✅ |
| Crédits | 1,99€ | +10 exports | — | — |

## 🗂️ Architecture
```
app/
  page.tsx                       Landing (recherche + clips en fond + démos + pricing)
  app/page.tsx                   Dashboard connecté (export modal + paywall)
  sign-in / sign-up              Pages Clerk
  api/
    search/                      YouTube + score viralité
    download/                    Gate monétisation + déclenche le pipeline
    download/[id]/status/        Polling du job
    process/                     yt-dlp + ffmpeg + upload R2
    checkout/  stripe-webhook/   Stripe
    clerk-webhook/               Sync user
    me/                          État user (plan, quota)
    cron/reset-quotas/           Reset mensuel
lib/  entitlements · stripe · prisma · r2
prisma/schema.prisma · middleware.ts · vercel.json
```

## ⚙️ Pipeline vidéo
`/api/process` : `yt-dlp` (4K) → `ffmpeg` autocrop ratio → enhance (unsharp + 60fps) → R2.
Nécessite `yt-dlp` et `ffmpeg` installés. Pour scaler : worker dédié + Upstash QStash.

> ⚠️ L'utilisateur est seul responsable de l'usage des contenus (droits d'auteur). Disclaimer en footer.

---
`landing-preview.html` = aperçu statique du design (ouvrable direct dans le navigateur, sans build).
