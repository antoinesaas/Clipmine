# Worker ClipMine (Fly.io)

## Prérequis

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
  R2_BUCKET=clipmine-exports
fly deploy
```

Puis sur Vercel : `WORKER_URL=https://clipmine-worker.fly.dev`

Sans R2, les exports restent en file d’attente (statut `processing` en DB).
