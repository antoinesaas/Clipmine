import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CGU — ClipMine",
  description: "Conditions Générales d'Utilisation de ClipMine.",
};

export default function CGU() {
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
              Conditions Générales d'Utilisation
            </h1>
            <p style={{ color: "var(--mut)", fontSize: 14 }}>Dernière mise à jour : 20 mai 2026</p>
          </div>

          <div className="legal-body">

            <section>
              <h2>1. Objet</h2>
              <p>Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de la plateforme <strong>ClipMine</strong>, disponible à l'adresse <strong>clipmine.fr</strong> (ci-après « la Plateforme »), éditée par Antoine Saas (ci-après « l'Éditeur »).</p>
              <p>Toute utilisation de la Plateforme implique l'acceptation pleine et entière des présentes CGU. L'utilisateur qui n'accepte pas ces conditions doit s'abstenir d'utiliser la Plateforme.</p>
            </section>

            <section>
              <h2>2. Description du service</h2>
              <p>ClipMine est un outil en ligne permettant de :</p>
              <ul>
                <li>Rechercher des vidéos YouTube par mots-clés ;</li>
                <li>Visualiser un score de viralité estimé par algorithme ;</li>
                <li>Télécharger des extraits vidéo en haute qualité (jusqu'en 4K) ;</li>
                <li>Recadrer automatiquement les vidéos selon différents formats (9:16, 16:9, 4:3) ;</li>
                <li>Améliorer la qualité et la fluidité des vidéos via des traitements IA.</li>
              </ul>
              <p>Le service est destiné à un usage créatif et éditorial (montage vidéo, contenus courts, etc.) dans le respect du droit applicable.</p>
            </section>

            <section>
              <h2>3. Accès au service et création de compte</h2>
              <p>L'accès à certaines fonctionnalités de la Plateforme nécessite la création d'un compte utilisateur via le service d'authentification tiers <strong>Clerk</strong>. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants.</p>
              <p>L'Éditeur se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU, sans préavis ni indemnité.</p>
            </section>

            <section>
              <h2>4. Plans tarifaires et paiement</h2>
              <p>ClipMine propose plusieurs offres d'abonnement :</p>
              <ul>
                <li><strong>Free :</strong> 1 export 4K offert, recherches illimitées, autocrop basique ;</li>
                <li><strong>Creator (9 €/mois) :</strong> 50 exports 4K par mois, enhance IA, 60fps, Hook Finder ;</li>
                <li><strong>Pro (24 €/mois) :</strong> exports illimités, Trend Radar, accès API.</li>
              </ul>
              <p>Les paiements sont traités par <strong>Stripe</strong>. En souscrivant à un abonnement, l'utilisateur autorise le prélèvement automatique mensuel. Les tarifs s'entendent TTC. Aucun remboursement n'est accordé pour les périodes entamées sauf disposition légale contraire.</p>
              <p>L'Éditeur se réserve le droit de modifier les tarifs avec un préavis de 30 jours.</p>
            </section>

            <section>
              <h2>5. Utilisation acceptable et propriété intellectuelle</h2>
              <p>L'utilisateur reconnaît et accepte que :</p>
              <ul>
                <li>Les vidéos disponibles sur YouTube sont susceptibles d'être protégées par le droit d'auteur ;</li>
                <li>ClipMine est un <strong>outil technique</strong> : il appartient à l'utilisateur de vérifier qu'il dispose des droits nécessaires avant tout téléchargement, réutilisation ou diffusion d'un contenu ;</li>
                <li>L'utilisation de la Plateforme à des fins commerciales implique d'obtenir les autorisations appropriées auprès des titulaires de droits ;</li>
                <li>L'Éditeur se conforme aux obligations légales relatives aux droits d'auteur (DMCA, Directive européenne 2019/790) et pourra retirer tout contenu sur demande des ayants droit.</li>
              </ul>
              <p>Il est <strong>strictement interdit</strong> d'utiliser la Plateforme pour :</p>
              <ul>
                <li>Reproduire, distribuer ou vendre des contenus protégés sans autorisation ;</li>
                <li>Contourner des mesures techniques de protection ;</li>
                <li>Mener des activités illicites, frauduleuses ou portant atteinte aux droits de tiers ;</li>
                <li>Surcharger, attaquer ou compromettre l'infrastructure de la Plateforme.</li>
              </ul>
            </section>

            <section>
              <h2>6. Quotas et limitations techniques</h2>
              <p>Chaque plan inclut un quota mensuel d'exports. Les quotas non utilisés ne sont pas reportables d'un mois à l'autre. En cas de dépassement du quota, l'utilisateur doit souscrire un plan supérieur ou attendre la réinitialisation mensuelle.</p>
              <p>L'Éditeur se réserve le droit de limiter techniquement les usages abusifs (robots, scripts automatisés, accès en masse).</p>
            </section>

            <section>
              <h2>7. Disponibilité et maintenance</h2>
              <p>L'Éditeur s'efforce d'assurer la disponibilité de la Plateforme 24h/24 et 7j/7 mais ne garantit pas une disponibilité sans interruption. Des maintenances programmées ou des incidents techniques peuvent entraîner des interruptions temporaires. L'Éditeur ne saurait être tenu responsable des conséquences de ces interruptions.</p>
            </section>

            <section>
              <h2>8. Limitation de responsabilité</h2>
              <p>Dans les limites autorisées par la loi, l'Éditeur ne saurait être tenu responsable :</p>
              <ul>
                <li>Des contenus téléchargés et de leur utilisation par l'utilisateur ;</li>
                <li>Des dommages indirects, pertes de données ou manques à gagner ;</li>
                <li>Des interruptions de service liées à des tiers (hébergeur, services d'API YouTube, Stripe, Clerk, etc.).</li>
              </ul>
              <p>La responsabilité de l'Éditeur, si elle venait à être engagée, serait limitée au montant payé par l'utilisateur au cours des 3 derniers mois précédant le fait générateur.</p>
            </section>

            <section>
              <h2>9. Données personnelles</h2>
              <p>Les données personnelles collectées (email, données de paiement, historique d'utilisation) sont traitées conformément à la <Link href="/mentions-legales">Politique de confidentialité</Link> et au RGPD. L'authentification est gérée par <strong>Clerk</strong>, les paiements par <strong>Stripe</strong>. Ces prestataires disposent de leurs propres politiques de confidentialité.</p>
              <p>L'utilisateur dispose d'un droit d'accès, de rectification, d'effacement et de portabilité de ses données, exerceable à <strong>contact@clipmine.fr</strong>.</p>
            </section>

            <section>
              <h2>10. Résiliation</h2>
              <p>L'utilisateur peut résilier son abonnement à tout moment depuis son espace personnel. La résiliation prend effet à la fin de la période de facturation en cours. Le compte Free peut être supprimé en contactant le support.</p>
              <p>L'Éditeur peut résilier l'accès d'un utilisateur sans préavis en cas de violation grave des présentes CGU.</p>
            </section>

            <section>
              <h2>11. Modification des CGU</h2>
              <p>L'Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les modifications entrent en vigueur dès leur publication sur la Plateforme. L'utilisateur sera notifié par email en cas de modification substantielle. La poursuite de l'utilisation du service vaut acceptation des nouvelles CGU.</p>
            </section>

            <section>
              <h2>12. Droit applicable et juridiction</h2>
              <p>Les présentes CGU sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents du ressort de Paris seront seuls compétents.</p>
              <p>Conformément à l'article L.616-1 du Code de la consommation, en cas de litige non résolu, l'utilisateur peut recourir à un médiateur de la consommation.</p>
            </section>

          </div>
        </div>
      </main>

      <footer>
        <div className="foot-bottom" style={{ paddingTop: 0, borderTop: "none" }}>
          <div className="logo"><span className="dot" />Clip<span className="b">Mine</span></div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <Link href="/#models" style={{ color: "var(--mut)" }}>Modèles AI</Link>
            <Link href="/#pricing" style={{ color: "var(--mut)" }}>Tarifs</Link>
            <Link href="/cgu" style={{ color: "var(--mut)" }}>CGU</Link>
            <Link href="/mentions-legales" style={{ color: "var(--mut)" }}>Mentions légales</Link>
          </div>
          <p>© 2026 ClipMine</p>
        </div>
      </footer>
    </>
  );
}
