# Google OAuth (Clerk) — erreur « OAuth client was not found » / 401 invalid_client

## Symptôme

Sur **Continuer avec Google** :

- *Access blocked: Authorization Error*
- *The OAuth client was not found*
- *Error 401: invalid_client*

Ce n’est **pas** un bug du code Next.js : Google rejette un **Client ID invalide** (inexistant, supprimé, ou mauvaise valeur collée dans Clerk).

## Cause constatée sur ClipMine (mai 2026)

L’API Clerk (`/v1/environment`) expose :

```json
"google_one_tap_client_id": "https://clipmine.fr/api/clerk-fapi/v1/oauth_callback"
```

Une **URL de callback** a été mise à la place d’un vrai Client ID Google, qui ressemble à :

`123456789012-abcdefghijklmnop.apps.googleusercontent.com`

Tant que ce champ (et/ou la connexion SSO Google dans Clerk) n’est pas corrigé, Google répondra *invalid_client*.

---

## Correctif (15–20 min)

### 1. Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) → projet ClipMine (ou en créer un).
2. **APIs & Services** → **OAuth consent screen** → type **External** → remplir nom app, email support, domaines :
   - `clipmine.fr`
   - `www.clipmine.fr`
3. **Credentials** → **Create credentials** → **OAuth client ID** → type **Web application**.

**Authorized JavaScript origins** (ajouter les deux) :

| Origine |
|---------|
| `https://www.clipmine.fr` |
| `https://clipmine.fr` |

**Authorized redirect URIs** — utiliser **exactement** l’URL affichée dans Clerk (étape 2). Avec le proxy FAPI actuel, c’est en général :

| Redirect URI |
|--------------|
| `https://clipmine.fr/api/clerk-fapi/v1/oauth_callback` |

Si Clerk affiche une autre URL (ex. `https://accounts.clipmine.fr/v1/oauth_callback`), **copier celle de Clerk**, pas celle de ce doc.

4. Copier **Client ID** et **Client secret**.

### 2. Clerk Dashboard (production)

1. [Clerk](https://dashboard.clerk.com) → instance **Production** (pas Development).
2. **User & Authentication** → **Social connections** → **Google** → activer.
3. Coller **Client ID** et **Client secret** Google (pas l’URL de callback).
4. Vérifier l’**Authorized redirect URI** indiquée par Clerk et la reporter dans Google Cloud (étape 1).

**Google One Tap** (si activé) :

- Le champ **Client ID** doit être le **même** Client ID OAuth (`….apps.googleusercontent.com`), **jamais** l’URL `/oauth_callback`.
- Si tu ne utilises pas One Tap, tu peux le désactiver dans Clerk pour simplifier.

### 3. Vérification

1. Attendre 1–2 min après sauvegarde Clerk + Google.
2. Navigation privée → [https://www.clipmine.fr/sign-in](https://www.clipmine.fr/sign-in) → **Google**.
3. Optionnel : contrôler l’environnement :

```bash
curl -s "https://www.clipmine.fr/api/clerk-fapi/v1/environment" -H "Origin: https://www.clipmine.fr" | findstr google_one_tap
```

`google_one_tap_client_id` doit se terminer par `.apps.googleusercontent.com`, pas par `/oauth_callback`.

---

## Erreurs fréquentes

| Erreur | Cause |
|--------|--------|
| OAuth client not found | Client ID faux, client supprimé dans Google Cloud, ou URL collée à la place du Client ID |
| redirect_uri_mismatch | URI de redirection dans Google ≠ celle affichée par Clerk |
| 404 sur une URL Google | Ancien lien / mauvais domaine — repasser par le bouton Google du formulaire Clerk |
| Ça marche en dev mais pas en prod | Credentials Google ou connexion SSO configurés seulement sur l’instance **Development** Clerk |

---

## Stripe (séparé de Google OAuth)

Les paiements passent par `/api/checkout` (Stripe direct), pas par Clerk Billing.

Sur Vercel **Production**, vérifier :

| Variable | Attendu |
|----------|---------|
| `STRIPE_SECRET_KEY` | `sk_live_…` |
| `STRIPE_PRICE_CREATOR` | `price_…` (live) |
| `STRIPE_PRICE_PRO` | `price_…` (live) |
| `STRIPE_PRICE_CREDITS_10` | `price_…` (live) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` (endpoint webhook prod) |
| `NEXT_PUBLIC_APP_URL` | `https://www.clipmine.fr` |
| `DATABASE_URL` | pooler Supabase actif |

Sans ça : **503** « paiements pas encore activés » ou « STRIPE_PRICE_* manquant », ou **500** `checkout_failed` si la clé Stripe est invalide.

Dans l’onglet **Network** du navigateur, regarder la réponse de `POST /api/checkout` pour le message exact.
