# Clerk — DNS obligatoire pour clipmine.fr

## Ta clé est correcte

`pk_live_Y2xlcmsuY2xpcG1pbmUuZnIk` est **complète** (format Clerk avec domaine personnalisé). Elle encode `clerk.clipmine.fr`.

Ce n’est **pas** le bloc RSA `MIIBIjANBgkq...` du dashboard — celui-là sert à autre chose, ne le mets pas sur Vercel.

## Pourquoi l’inscription ne marche pas

Le site charge le JS Clerk depuis `https://clerk.clipmine.fr`, mais ce sous-domaine **n’existe pas encore dans le DNS public** → page `/sign-up` vide / écran noir.

Vérification (mai 2026) : `clerk.clipmine.fr` et `accounts.clipmine.fr` → **NXDOMAIN**.

## Ce qu’il faut ajouter chez ton registrar DNS

Là où tu gères `clipmine.fr` (pas Vercel : les nameservers actuels sont `dns-parking.com`), ajoute ces **5 enregistrements CNAME** :

| Nom / Host | Type | Valeur (cible) |
|------------|------|----------------|
| `clerk` | CNAME | `frontend-api.clerk.services` |
| `accounts` | CNAME | `accounts.clerk.services` |
| `clkmail` | CNAME | `mail.slhyvut93m7a.clerk.services` |
| `clk._domainkey` | CNAME | `dkim1.slhyvut93m7a.clerk.services` |
| `clk2._domainkey` | CNAME | `dkim2.slhyvut93m7a.clerk.services` |

Selon le registrar, le host peut être `clerk` ou `clerk.clipmine.fr` — l’objectif est `clerk.clipmine.fr` → `frontend-api.clerk.services`.

**Important :** pour `clerk` et `accounts`, mets le proxy DNS en **DNS only** (pas de proxy Cloudflare orange) le temps que Clerk valide le domaine.

## Variables Vercel (Production) — déjà configurées

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_Y2xlcmsuY2xpcG1pbmUuZnIk` |
| `CLERK_SECRET_KEY` | `sk_live_...` (secret, chiffré) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |

Après chaque changement d’env : **redéployer** (`npx vercel --prod`).

## Validation

1. Attendre 5–30 min (propagation DNS).
2. Tester : `nslookup clerk.clipmine.fr` → doit répondre (pas « Non-existent domain »).
3. Ouvrir [https://www.clipmine.fr/sign-up](https://www.clipmine.fr/sign-up) → formulaire Clerk visible.
4. Clerk Dashboard → **Domains** → statut **Verified** (plus « Unverified »).

### DKIM + emails (clkmail, clk._domainkey, clk2._domainkey)

Enregistrements requis (Hostinger / registrar de `clipmine.fr`) :

| Host | Type | Cible exacte |
|------|------|----------------|
| `clk._domainkey` | CNAME | `dkim1.slhyvut93m7a.clerk.services` |
| `clk2._domainkey` | CNAME | `dkim2.slhyvut93m7a.clerk.services` |
| `clkmail` | CNAME | `mail.slhyvut93m7a.clerk.services` |

Pas de proxy orange (DNS only). Puis **Verify** dans Clerk → Domains.

**Auth Google** : les CNAME `clerk` / `accounts` ne sont plus obligatoires si le proxy `https://clipmine.fr/api/clerk-fapi` est actif.

## Dashboard Clerk

[API Keys (instance production)](https://dashboard.clerk.com/apps/app_3E0I8LVBZ18ifEZM2d9qbKTafYP/instances/ins_3E7SjhAdUXjywHUo3VcTxsm7qnf/api-keys)

[Domains / DNS](https://dashboard.clerk.com/apps/app_3E0I8LVBZ18ifEZM2d9qbKTafYP/instances/ins_3E7SjhAdUXjywHUo3VcTxsm7qnf/domains)
