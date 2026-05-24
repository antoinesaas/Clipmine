import { SignIn } from "@clerk/nextjs";
import GoogleAuthNotice from "@/components/GoogleAuthNotice";

export default function SignInPage() {
  return (
    <div className="auth-page">
      <GoogleAuthNotice />
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/app/search"
      />
    </div>
  );
}
