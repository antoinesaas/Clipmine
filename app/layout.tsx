import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body>
          {children}
          <Toaster theme="dark" position="bottom-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
