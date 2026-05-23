# Google Search Console — ClipMine

## Pourquoi la validation TXT échoue

Tu as choisi **Domaine** (`clipmine.fr`) + **Fournisseur DNS**. Google cherche un enregistrement **TXT à la racine** du domaine. Ce n’est **pas** la même chose que la balise HTML déjà dans le site.

| Méthode | Où configurer | Déjà sur ClipMine |
|--------|----------------|-------------------|
| **Domaine** + TXT | DNS chez OVH / Cloudflare / etc. | Non — tu dois l’ajouter toi-même |
| **Préfixe d’URL** + balise HTML | `app/layout.tsx` | Oui (`ugb2nRHQkqm2ixZX9NxWkh3RHJIuRO5x94vpmmNnJN8`) |
| **Fichier HTML** | `public/googleugb2nRHQkqm2ixZX9NxWkh3RHJIuRO5x94vpmmNnJN8.html` | Oui |

**Recommandation :** abandonne la propriété « Domaine » et utilise **Préfixe d’URL** → `https://www.clipmine.fr` → **Balise HTML** → Vérifier (2 min).

---

## Option A — Préfixe d’URL (recommandé)

1. [Search Console](https://search.google.com/search-console) → **Ajouter une propriété**
2. Choisir **Préfixe d’URL** (pas « Domaine »)
3. URL exacte : `https://www.clipmine.fr`
4. Vérification → **Balise HTML**
5. Code : `ugb2nRHQkqm2ixZX9NxWkh3RHJIuRO5x94vpmmNnJN8` (déjà dans `app/layout.tsx`)
6. **Vérifier** → déployer sur Vercel si besoin
7. **Sitemaps** → `https://www.clipmine.fr/sitemap.xml`

---

## Option B — Domaine + TXT (si tu insistes)

1. Search Console → propriété **Domaine** `clipmine.fr`
2. Copie la valeur TXT **exacte** affichée (ex. `google-site-verification=XXXXXXXX`)
3. Chez ton registrar / Cloudflare :

| Champ | Valeur |
|-------|--------|
| Type | `TXT` |
| Nom / Host | `@` (ou vide, ou `clipmine.fr` selon le registrar) |
| Valeur | Colle **toute** la chaîne fournie par Google |
| TTL | 300 ou Auto |

4. Attends **15 min à 48 h** (souvent 1–4 h)
5. Vérifie avec [dnschecker.org](https://dnschecker.org) → TXT sur `clipmine.fr`
6. Re-clique **Vérifier** dans Search Console

### Erreurs fréquentes

- TXT sur `www` au lieu de la racine `@`
- Guillemets en trop dans la valeur
- Token de la **balise HTML** utilisé dans le TXT (codes différents)
- Propriété `clipmine.fr` mais site canonique `www.clipmine.fr` — préfère Option A

---

## Canonique www

Le site redirige `clipmine.fr` → `www.clipmine.fr`. Utilise **toujours** `https://www.clipmine.fr` dans Search Console et le sitemap.
