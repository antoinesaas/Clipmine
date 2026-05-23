"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { useAuth } from "@clerk/nextjs";

/** Nav landing : liens statiques si Clerk JS ne charge pas (SSL / réseau). */
export default function LandingNav() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <nav className="site-nav">
      <div className="nav-in">
        <Logo />
        <div className="nav-links">
          <a href="#models">Modèles AI</a>
          <a href="#demos">Démos</a>
          <a href="#pricing">Tarifs</a>
          {isLoaded && isSignedIn ? (
            <Link href="/app/search">Mon espace</Link>
          ) : (
            <Link href="/sign-in" className="nav-link-btn">
              Connexion
            </Link>
          )}
        </div>
        {isLoaded && isSignedIn ? (
          <Link href="/app/search" className="btn btn-primary btn-nav-cta">
            Mon espace
          </Link>
        ) : (
          <Link href="/sign-up" className="btn btn-primary btn-nav-cta">
            <span className="only-desktop">Essayer gratuitement</span>
            <span className="only-mobile">Essayer</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
