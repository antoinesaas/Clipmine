# Cloudflare R2 — clés S3 pour ClipMine

Le bucket **`clipmine`** est déjà créé. Il reste les **clés API S3** (Wrangler ne les génère pas).

## Étapes (2 min)

1. Ouvre **[R2 → Manage R2 API Tokens](https://dash.cloudflare.com/dfefdda279c793dfde26aa23da8511c6/r2/api-tokens)** (connecte-toi avec Google si demandé).

2. **Create API token** :
   - **Token name** : `clipmine-vercel`
   - **Permissions** : **Object Read & Write**
   - **Specify bucket(s)** : coche uniquement **`clipmine`**
   - **TTL** : pas d’expiration (ou 1 an)

3. **Create API token** → copie immédiatement :
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY` (affiché une seule fois)

4. Valeurs fixes pour `.env.infra` :
   ```env
   R2_ACCOUNT_ID=dfefdda279c793dfde26aa23da8511c6
   R2_BUCKET=clipmine
   ```

Ce ne sont **pas** les clés « Workers » ni le token OAuth Wrangler — ce sont les **R2 S3 API credentials** du dashboard.
