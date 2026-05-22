# Google Search Console — ClipMine

## Erreur « domaine introuvable » (fournisseur DNS)

Tu as choisi **Domaine** + **Fournisseur de nom de domaine**. Google cherche un enregistrement TXT sur le DNS de `clipmine.fr`. Si le domaine n’est pas chez ton registrar ou le TXT n’est pas propagé → échec.

**Ne pas utiliser cette méthode** sauf si tu gères le DNS chez OVH/Cloudflare/etc.

## Méthode recommandée (2 minutes)

1. [Google Search Console](https://search.google.com/search-console)
2. **Ajouter une propriété** → **Préfixe d’URL** (pas « Domaine »)
3. URL exacte : `https://clipmine.fr` (ou `https://www.clipmine.fr` — une seule, celle de ton site principal)
4. Vérification → **Balise HTML**
5. Colle le code : `Fumx5QHDih4MJ6PdWDZUSWBGnQ6p1eSyhfm3Ql9dtPI` (déjà dans `app/layout.tsx`)
6. **Vérifier**

Alternative : **Fichier HTML** → `https://clipmine.fr/googleFumx5QHDih4MJ6PdWDZUSWBGnQ6p1eSyhfm3Ql9dtPI.html`

## Après vérification

- **Sitemaps** → ajouter `https://clipmine.fr/sitemap.xml`
- **Inspection d’URL** → demander l’indexation de `/`

L’indexation prend souvent **3–14 jours** pour un site neuf.
