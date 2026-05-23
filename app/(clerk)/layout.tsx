import { ClerkProvider } from "@clerk/nextjs";

const clerkProxyUrl =
  process.env.NEXT_PUBLIC_CLERK_PROXY_URL ?? "/api/clerk-fapi";

export default function ClerkRootLayout({ children }: { children: React.ReactNode }) {
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
      {children}
    </ClerkProvider>
  );
}
