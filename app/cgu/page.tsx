import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CGU",
  description: "Conditions Generales d'Utilisation de ClipMine.",
};

export default function CGU() {
  return (
    <>
      <nav className="site-nav">
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
            <h1 className="legal-h1">Conditions Générales d&apos;Utilisation</h1>
            <p className="legal-date">Dernière mise à jour : 20 mai 2026</p>
          </div>

          <div className="legal-body">
            <section>
              <h2>1. Objet</h2>
              <p>Les présentes CGU régissent l&apos;accès et l&apos;utilisation de la plateforme <strong>ClipMine</strong> disponible à l&apos;adresse <strong>clipmine.fr</strong>, éditée par Antoine Saas.</p>
              <p>Toute utilisation de la Plateforme implique l&apos;acceptation pleine et entière des présentes CGU.</p>
            </section>

            <section>
              <h2>2. Description du service</h2>
              <p>ClipMine est un outil en ligne permettant de :</p>
              <ul>
                <li>Rechercher des vidéos YouTube par mots-clés</li>
                <li>Visualiser un score de viralité estimé par algorithme</li>
                <li>Télécharger des extraits vidéo en haute qualité (jusqu&apos;en 4K)</li>
                <li>Recadrer automatiquement (9:16, 16:9, 4:3)</li>
                <li>Améliorer la qualité via des modèles IA (upscale, denoise, stabilize)</li>
              </ul>
            </section>

            <section>
              <h2>3. Accès et compte utilisateur</h2>
              <p>La création d&apos;un compte se fait via <strong>Clerk</strong>. L&apos;utilisateur s&apos;engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants.</p>
            </section>

            <section>
              <h2>4. Plans tarifaires</h2>
              <ul>
                <li><strong>Free :</strong> 1 export 4K offert, recherches illimitées, recadrage 9:16</li>
                <li><strong>Creator (5,49 €/mois, promo −40%) :</strong> 50 exports 4K/mois, upscale, enhance, denoise, stabilisation, 60fps</li>
                <li><strong>Pro (14,99 €/mois, promo −40%) :</strong> exports illimités, tous les modèles IA dont slow-motion Chronos</li>
              </ul>
              <p>Paiements traités par <strong>Stripe</strong>. Prélèvement mensuel automatique. Tarifs TTC.</p>
            </section>

            <section>
              <h2>5. Propriété intellectuelle et droits d&apos;auteur</h2>
              <p>ClipMine est un outil technique. L&apos;utilisateur est seul responsable :</p>
              <ul>
                <li>De vérifier qu&apos;il dispose des droits nécessaires avant tout téléchargement</li>
                <li>D&apos;obtenir les autorisations en cas d&apos;usage commercial</li>
                <li>Du respect du droit d&apos;auteur YouTube et de la directive européenne 2019/790</li>
              </ul>
              <p>L&apos;Éditeur retire tout contenu sur demande légitime des ayants droit.</p>
            </section>

            <section>
              <h2>6. Quotas et limitations</h2>
              <p>Les quotas mensuels ne sont pas reportables. Les usages abusifs (bots, scripts) peuvent être limités techniquement.</p>
            </section>

            <section>
              <h2>7. Disponibilité</h2>
              <p>L&apos;Éditeur s&apos;efforce d&apos;assurer une disponibilité 24/7 sans garantie. Des interruptions de maintenance peuvent survenir.</p>
            </section>

            <section>
              <h2>8. Limitation de responsabilité</h2>
              <p>L&apos;Éditeur ne saurait être tenu responsable :</p>
              <ul>
                <li>Des contenus téléchargés et de leur utilisation</li>
                <li>Des dommages indirects ou pertes de données</li>
                <li>Des interruptions liées à des tiers (Stripe, Clerk, Vercel, YouTube)</li>
              </ul>
            </section>

            <section>
              <h2>9. Données personnelles</h2>
              <p>Traitement conforme RGPD. Voir <Link href="/mentions-legales">Politique de confidentialité</Link>.</p>
            </section>

            <section>
              <h2>10. Résiliation</h2>
              <p>Résiliation possible à tout moment depuis l&apos;espace personnel. Effet à la fin de la période en cours.</p>
            </section>

            <section>
              <h2>11. Modifications</h2>
              <p>L&apos;Éditeur peut modifier les CGU. Notification par email en cas de modification substantielle.</p>
            </section>

            <section>
              <h2>12. Droit applicable</h2>
              <p>Droit français. Litiges : tribunaux de Paris compétents. Médiation de la consommation possible (article L.616-1).</p>
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
