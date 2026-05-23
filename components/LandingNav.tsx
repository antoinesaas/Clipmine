import Link from "next/link";
import DiscordIcon from "@/components/DiscordIcon";
import Logo from "@/components/Logo";

const DISCORD_URL = "https://discord.gg/Q4uBaxqDNJ";

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
        <div className="nav-actions">
          <a
            href={DISCORD_URL}
            className="nav-discord"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Rejoindre le Discord ClipMine"
          >
            <DiscordIcon size={20} />
          </a>
          <Link href="/sign-up" className="btn btn-primary btn-nav-cta">
            <span className="only-desktop">Essayer gratuitement</span>
            <span className="only-mobile">Essayer</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
