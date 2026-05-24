"use client";

import { useEffect, useState } from "react";

const REDIRECT_URI = "https://clipmine.fr/api/clerk-fapi/v1/oauth_callback";

type Status = {
  ok: boolean;
  misconfigured?: boolean;
  fix?: string | null;
};

export default function GoogleAuthNotice() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/auth/google-status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  if (!status || status.ok) return null;

  return (
    <div className="google-auth-notice" role="alert">
      <strong>Google : « invalid client ID »</strong>
      <p>
        Le Client ID dans Clerk est faux (souvent une URL collée à la place). Corrige en 3 minutes :
      </p>
      <ol>
        <li>
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">
            Google Cloud → Credentials
          </a>{" "}
          → OAuth Web → copie le <strong>Client ID</strong> (finit par{" "}
          <code>.apps.googleusercontent.com</code>)
        </li>
        <li>
          Redirect URI dans Google :{" "}
          <code style={{ wordBreak: "break-all" }}>{REDIRECT_URI}</code>
        </li>
        <li>
          <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer">
            Clerk Production
          </a>{" "}
          → Social → Google → colle Client ID + Secret (pas l&apos;URL de callback)
        </li>
      </ol>
      <p className="google-auth-notice-hint">
        En attendant : connecte-toi par <strong>email</strong> (lien magique ou mot de passe).
      </p>
    </div>
  );
}
