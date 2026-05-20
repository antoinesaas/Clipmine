import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipMine — Mine the internet. Build the viral.",
  description:
    "Trouve, recadre et améliore les meilleurs clips YouTube. La matière première de tes édits TikTok, Reels et Shorts.",
  openGraph: {
    title: "ClipMine — Mine the internet. Build the viral.",
    description: "La matière première de tes édits, minée et recadrée en secondes.",
    type: "website",
  },
  verification: {
    google: "Fumx5QHDih4MJ6PdWDZUSWBGnQ6p1eSyhfm3Ql9dtPI",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body>
          {children}
          <Toaster theme="dark" position="bottom-center" />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
