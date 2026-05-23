import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.clipmine.fr"),
  title: {
    default: "ClipMine — Cinematic AI Video Enhancement",
    template: "%s · ClipMine",
  },
  description:
    "Scènes films & séries pour éditeurs TikTok. Colle un lien YouTube ou cherche une réplique — export 9:16 en 4K.",
  keywords: [
    "video upscale", "4K AI", "video enhancement", "clip YouTube", "TikTok edit",
    "AI denoise", "frame interpolation", "slow motion", "ClipMine",
  ],
  authors: [{ name: "ClipMine" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.clipmine.fr",
    title: "ClipMine — Cinematic AI Video Enhancement",
    description:
      "Upscale, denoise et restore tes clips YouTube en qualité 4K cinéma. Modèles AI temporally aware.",
    siteName: "ClipMine",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClipMine — Cinematic AI Video Enhancement",
    description: "Upscale tes clips YouTube en 4K cinéma. Modèles AI temporally aware.",
  },
  verification: {
    google: "ugb2nRHQkqm2ixZX9NxWkh3RHJIuRO5x94vpmmNnJN8",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  alternates: {
    canonical: "https://www.clipmine.fr",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const clerkProxyUrl =
  process.env.NEXT_PUBLIC_CLERK_PROXY_URL ?? "https://www.clipmine.fr/api/clerk-fapi";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      proxyUrl={clerkProxyUrl}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/app/search"
      signUpFallbackRedirectUrl="/app/search"
      afterSignInUrl="/app/search"
      afterSignUpUrl="/app/search"
      appearance={{
        variables: {
          colorPrimary: "#0066FF",
          colorBackground: "#0B0B10",
          colorText: "#FFFFFF",
          colorInputBackground: "#16161F",
          colorInputText: "#FFFFFF",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      }}
    >
      <html lang="fr">
        <body>
          {children}
          <Toaster theme="dark" position="bottom-center" richColors />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
