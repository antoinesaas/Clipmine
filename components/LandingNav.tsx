import Link from "next/link";
import Logo from "@/components/Logo";

/** Nav landing 100 % statique (pas de Clerk) — visible immédiatement sur mobile. */
export default function LandingNav() {
  return (
    <nav className="site-nav">
      <div className="nav-in">
        <Logo />
        <div className="nav-links">
          <a href="#models">Modèles AI</a>
          <a href="#demos">Démos</a>
          <a href="#pricing">Tarifs</a>
          <Link href="/sign-in" className="nav-link-btn">
            Connexion
          </Link>
        </div>
        <Link href="/sign-up" className="btn btn-primary btn-nav-cta">
          <span className="only-desktop">Essayer gratuitement</span>
          <span className="only-mobile">Essayer</span>
        </Link>
      </div>
    </nav>
  );
}
