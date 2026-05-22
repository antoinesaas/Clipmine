# Worker ClipMine (Fly.io)

## Prérequis

1. **Carte bancaire Fly.io** — [Billing](https://fly.io/dashboard/flynox-contact-gmail-com/billing) (sinon `fly apps create` échoue).
2. Connexion CLI :

```bash
fly auth login
```

## Secrets (après R2 + Supabase configurés sur Vercel)

```bash
cd worker
fly secrets set \
  WORKER_SECRET=meme_que_vercel \
  DATABASE_URL="postgresql://postgres.elwqdulkxprjmkejwcai:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true" \
  R2_ACCOUNT_ID=xxx \
  R2_ACCESS_KEY_ID=xxx \
  R2_SECRET_ACCESS_KEY=xxx \
  R2_BUCKET=clipmine
fly deploy
```

Puis sur Vercel : `WORKER_URL=https://clipmine-worker.fly.dev`

## Cloudflare R2

Bucket : **`clipmine`** (déjà créé).

Clés S3 : voir **`docs/CLOUDFLARE-R2.md`** → [Manage R2 API Tokens](https://dash.cloudflare.com/dfefdda279c793dfde26aa23da8511c6/r2/api-tokens)

Puis `.env.infra` + `powershell -File scripts/setup-vercel-infra.ps1`

Sans R2, les exports restent en file d’attente (statut `processing` en DB).

## Pipeline IA (v2)

| Modèle UI | ID outil | Traitement ffmpeg |
|-----------|----------|-------------------|
| Starlight | upscale | Scale 4K Lanczos |
| Proteus | enhance | unsharp + eq |
| Nyx | denoise | hqdn3d |
| Themis | stabilize | deshake |
| Aion | fps | minterpolate 60fps |
| Chronos | slowmo | setpts + atempo (plan Pro) |

Option : `MAX_CLIP_SEC=180` (limite durée, évite timeout Fly).

```bash
cd worker && fly deploy
```
