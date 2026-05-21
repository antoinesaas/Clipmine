import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions legales",
  description: "Mentions legales et politique de confidentialite de ClipMine.",
};

export default function MentionsLegales() {
  return (
    <>
      <nav>
        <div className="nav-in">
          <Link href="/" className="logo">
            <span className="dot" />Clip<span className="b">Mine</span>
          </Link>
          <Link href="/" className="btn btn-ghost">Retour</Link>
        </div>
      </nav>

      <main className="legal-main">
        <div className="wrap-sm">
          <div className="legal-head">
            <div className="eyebrow">Legal</div>
            <h1 className="legal-h1">Mentions légales</h1>
            <p className="legal-date">Dernière mise à jour : 20 mai 2026</p>
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
              <p className="legal-note">Numéro SIRET et adresse à compléter lors de l&apos;immatriculation.</p>
            </section>

            <section>
              <h2>2. Directeur de la publication</h2>
              <p>Le directeur de la publication est <strong>Antoine Saas</strong>.</p>
            </section>

            <section>
              <h2>3. Hébergement</h2>
              <p>Le site est hébergé par :</p>
              <ul>
                <li><strong>Vercel Inc.</strong></li>
                <li>340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</li>
                <li><a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a></li>
              </ul>
              <p>Base de données via <strong>Supabase</strong>, stockage fichiers via <strong>Cloudflare R2</strong>.</p>
            </section>

            <section>
              <h2>4. Propriété intellectuelle</h2>
              <p>Tous les éléments du site (textes, graphismes, code, marque, logo) sont la propriété exclusive de l&apos;Éditeur.</p>
              <p>Les vidéos traitées via la Plateforme demeurent la propriété de leurs auteurs respectifs.</p>
            </section>

            <section>
              <h2>5. RGPD - Données personnelles</h2>
              <h3>Données collectées</h3>
              <ul>
                <li><strong>Identification :</strong> email, nom (via Clerk)</li>
                <li><strong>Facturation :</strong> traitée par Stripe (carte non stockée)</li>
                <li><strong>Utilisation :</strong> historique, logs techniques</li>
                <li><strong>Analytiques :</strong> Vercel Analytics anonymisé</li>
              </ul>

              <h3>Finalités</h3>
              <ul>
                <li>Fourniture du service</li>
                <li>Gestion des abonnements</li>
                <li>Sécurité et prévention de fraude</li>
              </ul>

              <h3>Sous-traitants</h3>
              <ul>
                <li><strong>Clerk</strong> - <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer">clerk.com/privacy</a></li>
                <li><strong>Stripe</strong> - <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer">stripe.com/fr/privacy</a></li>
                <li><strong>Vercel</strong> - <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a></li>
                <li><strong>Cloudflare</strong> - <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">cloudflare.com/privacypolicy</a></li>
              </ul>
            </section>

            <section>
              <h2>6. Droits des utilisateurs</h2>
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul>
                <li>Droit d&apos;accès, rectification, effacement</li>
                <li>Droit à la portabilité</li>
                <li>Droit d&apos;opposition et de limitation</li>
              </ul>
              <p>Pour exercer ces droits : <a href="mailto:contact@clipmine.fr">contact@clipmine.fr</a>. Réclamation possible auprès de la <strong>CNIL</strong> (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a>).</p>
            </section>

            <section>
              <h2>7. Cookies</h2>
              <p>Cookies techniques (session) + analytiques anonymisés (Vercel Analytics). Aucun cookie publicitaire.</p>
            </section>

            <section>
              <h2>8. Contact</h2>
              <ul>
                <li><strong>Email :</strong> <a href="mailto:contact@clipmine.fr">contact@clipmine.fr</a></li>
                <li><strong>Site :</strong> <a href="https://clipmine.fr">clipmine.fr</a></li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <footer>
        <div className="foot-bottom">
          <Link href="/" className="logo">
            <span className="dot" />Clip<span className="b">Mine</span>
          </Link>
          <div className="legal-foot-links">
            <Link href="/#models">Modèles AI</Link>
            <Link href="/#pricing">Tarifs</Link>
            <Link href="/cgu">CGU</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
          </div>
          <p>© 2026 ClipMine</p>
        </div>
      </footer>
    </>
  );
}
