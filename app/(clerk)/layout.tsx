import { ClerkProvider } from "@clerk/nextjs";
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
      {children}
    </ClerkProvider>
  );
}
