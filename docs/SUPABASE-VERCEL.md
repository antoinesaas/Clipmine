# Supabase → Vercel (ClipMine)

Projet : [elwqdulkxprjmkejwcai](https://supabase.com/dashboard/project/elwqdulkxprjmkejwcai) · région **eu-west-1**

## Où trouver les URI (pas dans « Connection pooling »)

1. Ouvre le projet Supabase
2. Clique le bouton vert **Connect** (en haut, à côté du nom du projet)
3. Onglet **Connection string** (pas Framework)
4. Choisis le mode :
   - **Transaction pooler** → `DATABASE_URL` (Vercel)
   - **Direct connection** → `DIRECT_URL` (migrations)

Remplace `[YOUR-PASSWORD]` par le mot de passe DB (celui défini à la création du projet, ou **Reset database password** dans Settings → Database).

### Modèles d’URI (eu-west-1)

```
DATABASE_URL=postgresql://postgres.elwqdulkxprjmkejwcai:MOT_DE_PASSE@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres:MOT_DE_PASSE@db.elwqdulkxprjmkejwcai.supabase.co:5432/postgres
```

## Vercel

```bash
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
# Répéter pour development si besoin
vercel --prod
```

Tables Prisma **User** + **Download** : migration `clipmine_init` déjà appliquée via MCP.
