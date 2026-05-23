"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ background: "#050507", color: "#fff", fontFamily: "system-ui,sans-serif", padding: 24 }}>
        <h1 style={{ fontSize: 20, marginBottom: 12 }}>ClipMine — erreur</h1>
        <p style={{ color: "#a1a1aa", marginBottom: 20 }}>
          Une erreur a bloqué l&apos;affichage. Tu peux réessayer ou revenir à l&apos;accueil.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#0066FF",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 18px",
              fontWeight: 600,
            }}
          >
            Réessayer
          </button>
          <a
            href="/"
            style={{
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 10,
              padding: "12px 18px",
              textDecoration: "none",
            }}
          >
            Accueil
          </a>
        </div>
        {process.env.NODE_ENV === "development" && (
          <pre style={{ marginTop: 24, fontSize: 11, color: "#6b6b76", overflow: "auto" }}>
            {error.message}
          </pre>
        )}
      </body>
    </html>
  );
}
