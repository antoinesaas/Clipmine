# Checklist lancement public — ClipMine

## 1. Clerk (obligatoire — corrige l’avertissement console)

**Problème actuel :** Vercel Production utilise `pk_test_...` → message « development keys ».

1. [Clerk Dashboard](https://dashboard.clerk.com) → ton app → **API Keys**
2. Passe en **Production** (pas Development)
3. Copie `pk_live_...` et `sk_live_...`
4. Vercel → Project → Settings → Environment Variables → **Production** :

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

5. Clerk → **Domains** → ajoute `www.clipmine.fr` et `clipmine.fr`
6. **Redéploie** Vercel (obligatoire : les clés `NEXT_PUBLIC_*` sont injectées au build)

---

## 2. Stripe

Remplacer `pk_test_` / `sk_test_` par les clés **Live** et les `price_` live sur Vercel Production.

---

## 3. YouTube exports (Fly)

```bash
curl https://clipmine-worker.fly.dev/health
# "youtubeCookies": true  ← indispensable pour éviter les échecs de téléchargement
```

Sans cookies :

```bash
fly secrets set YT_COOKIES_BASE64="<base64 de cookies.txt>" -a clipmine-worker
```

---

## 4. Google Search Console

Voir `docs/GOOGLE-SEARCH-CONSOLE.md` — méthode **Préfixe d’URL** + `www.clipmine.fr`.

---

## 5. Variables Vercel Production (résumé)

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

## 6. Après déploiement

- [ ] Plus d’avertissement Clerk dans la console sur www.clipmine.fr
- [ ] Connexion / inscription OK
- [ ] Recherche « Inception » → clips pertinents en tête
- [ ] Export test (ou message d’erreur clair si YouTube bloque)
- [ ] Search Console : sitemap soumis
