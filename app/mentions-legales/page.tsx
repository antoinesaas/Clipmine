import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — ClipMine",
  description: "Mentions légales et politique de confidentialité de ClipMine.",
};

export default function MentionsLegales() {
  return (
    <>
      <nav>
        <div className="nav-in">
          <Link href="/" className="logo">
            <span className="dot" />Clip<span className="b">Mine</span>
          </Link>
          <Link href="/" className="btn btn-ghost" style={{ fontSize: 13 }}>← Retour</Link>
        </div>
      </nav>

      <main style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div className="wrap" style={{ maxWidth: 780 }}>
          <div style={{ marginBottom: 48 }}>
            <div className="eyebrow">Légal</div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(32px,5vw,52px)", fontWeight: 700, letterSpacing: "-.03em", marginTop: 12, marginBottom: 16 }}>
              Mentions légales
            </h1>
            <p style={{ color: "var(--mut)", fontSize: 14 }}>Dernière mise à jour : 20 mai 2026</p>
          </div>

          <div className="legal-body">

            <section>
              <h2>1. Éditeur du site</h2>
              <p>Le site <strong>clipmine.fr</strong> est édité par :</p>
              <ul>
                <li><strong>Nom :</strong> Antoine Saas</li>
                <li><strong>Statut :</strong> Auto-entrepreneur / Entrepreneur individuel</li>
                <li><strong>Email :</strong> <a href="mailto:contact@clipmine.fr">contact@clipmine.fr</a></li>
              </ul>
              <p style={{ fontSize: 13, color: "var(--dim)", fontStyle: "italic" }}>
                * Numéro SIRET et adresse à compléter lors de l'immatriculation de l'entreprise.
              </p>
            </section>

            <section>
              <h2>2. Directeur de la publication</h2>
              <p>Le directeur de la publication est <strong>Antoine Saas</strong>, joignable à l'adresse <a href="mailto:contact@clipmine.fr">contact@clipmine.fr</a>.</p>
            </section>

            <section>
              <h2>3. Hébergement</h2>
              <p>Le site est hébergé par :</p>
              <ul>
                <li><strong>Vercel Inc.</strong></li>
                <li>340 Pine Street, Suite 701 — San Francisco, CA 94104, États-Unis</li>
                <li>Site : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a></li>
              </ul>
              <p>Les données de base de données sont hébergées via <strong>Supabase</strong> (Supabase Inc., San Francisco, CA) et les fichiers exportés via <strong>Cloudflare R2</strong> (Cloudflare Inc., San Francisco, CA).</p>
            </section>

            <section>
              <h2>4. Propriété intellectuelle</h2>
              <p>L'ensemble des éléments constituant le site ClipMine (textes, graphismes, logiciels, code source, marque, logo) sont la propriété exclusive de l'Éditeur et sont protégés par le droit de la propriété intellectuelle français et international.</p>
              <p>Toute reproduction, représentation, modification ou diffusion, totale ou partielle, sans autorisation expresse et préalable de l'Éditeur est interdite et constitue une contrefaçon sanctionnée par le Code de la propriété intellectuelle.</p>
              <p>Les vidéos traitées via la Plateforme demeurent la propriété de leurs auteurs respectifs. ClipMine n'acquiert aucun droit sur ces contenus.</p>
            </section>

            <section>
              <h2>5. Données personnelles et RGPD</h2>
              <p>ClipMine collecte et traite des données personnelles dans le cadre de la fourniture de son service. Ces traitements sont réalisés conformément au <strong>Règlement Général sur la Protection des Données (RGPD)</strong> et à la loi Informatique et Libertés.</p>

              <h3>Données collectées</h3>
              <ul>
                <li><strong>Données d'identification :</strong> adresse email, nom (fournis via Clerk lors de la création du compte) ;</li>
                <li><strong>Données de facturation :</strong> traitées exclusivement par Stripe (numéro de carte non stocké par ClipMine) ;</li>
                <li><strong>Données d'utilisation :</strong> historique des recherches, exports effectués, logs techniques ;</li>
                <li><strong>Données analytiques :</strong> statistiques d'usage anonymisées via Vercel Analytics.</li>
              </ul>

              <h3>Finalités du traitement</h3>
              <ul>
                <li>Fourniture et amélioration du service ;</li>
                <li>Gestion des abonnements et de la facturation ;</li>
                <li>Communication relative au service (emails transactionnels) ;</li>
                <li>Prévention des fraudes et sécurité.</li>
              </ul>

              <h3>Base légale</h3>
              <p>Les traitements sont fondés sur l'exécution du contrat (CGU), le consentement (communications marketing) et l'intérêt légitime (sécurité, amélioration du service).</p>

              <h3>Durée de conservation</h3>
              <p>Les données sont conservées pendant la durée de la relation contractuelle, puis archivées 3 ans à compter de la clôture du compte, sauf obligations légales contraires.</p>

              <h3>Sous-traitants</h3>
              <ul>
                <li><strong>Clerk</strong> (authentification) — <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer">clerk.com/privacy</a></li>
                <li><strong>Stripe</strong> (paiement) — <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer">stripe.com/fr/privacy</a></li>
                <li><strong>Vercel</strong> (hébergement & analytics) — <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a></li>
                <li><strong>Cloudflare</strong> (stockage fichiers) — <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">cloudflare.com/privacypolicy</a></li>
              </ul>
            </section>

            <section>
              <h2>6. Droits des utilisateurs</h2>
              <p>Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :</p>
              <ul>
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données ;</li>
                <li><strong>Droit de rectification :</strong> corriger des données inexactes ;</li>
                <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données ;</li>
                <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré ;</li>
                <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements ;</li>
                <li><strong>Droit à la limitation :</strong> restreindre le traitement dans certains cas.</li>
              </ul>
              <p>Pour exercer ces droits, contactez-nous à <a href="mailto:contact@clipmine.fr">contact@clipmine.fr</a>. Vous pouvez également introduire une réclamation auprès de la <strong>CNIL</strong> (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a>).</p>
            </section>

            <section>
              <h2>7. Cookies</h2>
              <p>ClipMine utilise des cookies techniques strictement nécessaires au fonctionnement du service (session d'authentification) et des cookies analytiques anonymisés (Vercel Analytics). Aucun cookie publicitaire ou de profilage n'est déposé.</p>
              <p>Vous pouvez configurer votre navigateur pour refuser les cookies, ce qui pourrait affecter le fonctionnement de certaines parties du service.</p>
            </section>

            <section>
              <h2>8. Liens hypertextes</h2>
              <p>Le site peut contenir des liens vers des sites tiers. L'Éditeur n'est pas responsable du contenu ou des pratiques de ces sites et ne saurait voir sa responsabilité engagée à ce titre.</p>
            </section>

            <section>
              <h2>9. Contact</h2>
              <p>Pour toute question relative aux présentes mentions légales ou à vos données personnelles :</p>
              <ul>
                <li><strong>Email :</strong> <a href="mailto:contact@clipmine.fr">contact@clipmine.fr</a></li>
                <li><strong>Site :</strong> <a href="https://clipmine.fr">clipmine.fr</a></li>
              </ul>
            </section>

          </div>
        </div>
      </main>

      <footer>
        <div className="wrap">
          <div className="foot-in">
            <div className="logo"><span className="dot" />Clip<span className="b">Mine</span></div>
            <div className="foot-links">
              <Link href="/#features">Fonctions</Link>
              <Link href="/#pricing">Tarifs</Link>
              <Link href="/cgu">CGU</Link>
              <Link href="/mentions-legales">Mentions légales</Link>
            </div>
          </div>
          <p className="legal">© 2026 ClipMine. Tous droits réservés.</p>
        </div>
      </footer>

      <style>{`
        .legal-body { color: var(--mut); line-height: 1.75; font-size: 15px; }
        .legal-body section { margin-bottom: 36px; padding-bottom: 36px; border-bottom: 1px solid var(--line); }
        .legal-body section:last-child { border-bottom: none; }
        .legal-body h2 { font-family: var(--display); font-size: 20px; font-weight: 700; color: var(--txt); margin-bottom: 14px; letter-spacing: -.02em; }
        .legal-body h3 { font-size: 15px; font-weight: 600; color: var(--txt); margin: 18px 0 8px; }
        .legal-body p { margin-bottom: 12px; }
        .legal-body ul { padding-left: 20px; margin-bottom: 12px; }
        .legal-body li { margin-bottom: 6px; }
        .legal-body strong { color: var(--txt); font-weight: 600; }
        .legal-body a { color: var(--blue2); text-decoration: underline; text-underline-offset: 3px; }
      `}</style>
    </>
  );
}
