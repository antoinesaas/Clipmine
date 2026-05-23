/** Thème sombre ClipMine — texte lisible sur boutons Google / formulaires. */
export const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: "#0066FF",
    colorBackground: "#0B0B10",
    colorText: "#FFFFFF",
    colorTextSecondary: "#A1A1AA",
    colorInputBackground: "#16161F",
    colorInputText: "#FFFFFF",
    colorNeutral: "#E4E4E7",
    borderRadius: "12px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  elements: {
    rootBox: { width: "100%", maxWidth: "420px" },
    card: {
      width: "100%",
      background: "#0B0B10",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
    },
    headerTitle: { color: "#FFFFFF", fontWeight: "700" },
    headerSubtitle: { color: "#A1A1AA" },
    socialButtonsBlockButton: {
      color: "#FFFFFF",
      backgroundColor: "#16161F",
      border: "1px solid rgba(255,255,255,0.14)",
      "&:hover": {
        backgroundColor: "#1e1e28",
        borderColor: "rgba(255,255,255,0.22)",
      },
    },
    socialButtonsBlockButtonText: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
    formButtonPrimary: {
      backgroundColor: "#0066FF",
      color: "#FFFFFF",
      "&:hover": { backgroundColor: "#1A7AFF" },
    },
    formFieldLabel: { color: "#C4C4CC" },
    formFieldInput: { color: "#FFFFFF" },
    footerActionLink: { color: "#6BA4FF" },
    identityPreviewText: { color: "#FFFFFF" },
    formResendCodeLink: { color: "#6BA4FF" },
    dividerLine: { background: "rgba(255,255,255,0.1)" },
    dividerText: { color: "#71717A" },
  },
};
