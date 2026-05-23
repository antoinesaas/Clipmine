# Checklist lancement public — ClipMine

## 1. Clerk (obligatoire)

**Clés Vercel Production :** `pk_live_Y2xlcmsuY2xpcG1pbmUuZnIk` + `sk_live_...` — déjà sur Vercel.

**Blocage actuel : DNS Clerk manquant** → voir **`docs/CLERK-DNS-CLIPMINE.md`** (5 CNAME à ajouter chez le registrar de `clipmine.fr`, dont `clerk` → `frontend-api.clerk.services`).

Sans ces CNAME, `/sign-up` reste vide (le JS ne charge pas depuis `clerk.clipmine.fr`).

Après DNS : Clerk Dashboard → **Domains** → Verified, puis redéploie Vercel si tu changes une variable.

---

## 2. Google (connexion)

Voir **`docs/GOOGLE-OAUTH-CLERK.md`** — si Google affiche *OAuth client was not found*, le Client ID dans Clerk est incorrect (sur ClipMine, une URL de callback avait été collée à la place du Client ID `….apps.googleusercontent.com`).

## 3. Stripe

Remplacer `pk_test_` / `sk_test_` par les clés **Live** et les `price_` live sur Vercel Production. Détails variables : `docs/GOOGLE-OAUTH-CLERK.md` (section Stripe).

---

## 4. YouTube exports (Fly)

```bash
curl https://clipmine-worker.fly.dev/health
# "youtubeCookies": true  ← indispensable pour éviter les échecs de téléchargement
```

Sans cookies :

```bash
fly secrets set YT_COOKIES_BASE64="<base64 de cookies.txt>" -a clipmine-worker
```

---

## 5. Google Search Console

Voir `docs/GOOGLE-SEARCH-CONSOLE.md` — méthode **Préfixe d’URL** + `www.clipmine.fr`.

---

## 6. Variables Vercel Production (résumé)

| Variable | Attendu |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | `https://www.clipmine.fr` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` |
| `CLERK_SECRET_KEY` | `sk_live_...` |
| `YOUTUBE_API_KEY` | clé API active |
| `WORKER_URL` | `https://clipmine-worker.fly.dev` |
| `WORKER_SECRET` | identique au worker Fly |
| `DATABASE_URL` | Supabase pooler |

---

## 7. Après déploiement

- [ ] Plus d’avertissement Clerk dans la console sur www.clipmine.fr
- [ ] Connexion / inscription OK
- [ ] Recherche « Inception » → clips pertinents en tête
- [ ] Export test (ou message d’erreur clair si YouTube bloque)
- [ ] Search Console : sitemap soumis
