import { ClerkProvider } from "@clerk/nextjs";
import { CLERK_APPEARANCE } from "@/lib/clerk-appearance";
import { CLERK_JS_URL, CLERK_PROXY_PUBLIC } from "@/lib/clerk-config";

export default function ClerkRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      proxyUrl={CLERK_PROXY_PUBLIC}
      clerkJSUrl={CLERK_JS_URL}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/app/search"
      signUpFallbackRedirectUrl="/app/search"
      appearance={CLERK_APPEARANCE}
    >
      {children}
    </ClerkProvider>
  );
}
