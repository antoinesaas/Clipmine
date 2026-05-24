"use client";

import { useEffect, useState } from "react";

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

  if (!status?.misconfigured && status?.ok !== false) return null;
  if (status?.ok) return null;

  return (
    <div
      className="google-auth-notice"
      role="alert"
      style={{
        maxWidth: 420,
        margin: "0 auto 16px",
        padding: "12px 14px",
        borderRadius: 10,
        background: "rgba(255, 80, 80, 0.12)",
        border: "1px solid rgba(255, 80, 80, 0.35)",
        color: "#f8d0d0",
        fontSize: 13,
        lineHeight: 1.45,
        textAlign: "left",
      }}
    >
      <strong>Connexion Google indisponible</strong>
      <p style={{ margin: "8px 0 0" }}>
        {status.fix ??
          "Le Client ID Google dans Clerk est invalide. Un admin doit le corriger dans le dashboard Clerk + Google Cloud."}
      </p>
    </div>
  );
}
