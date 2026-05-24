import { SignUp } from "@clerk/nextjs";
import GoogleAuthNotice from "@/components/GoogleAuthNotice";

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <GoogleAuthNotice />
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/app/search"
      />
    </div>
  );
}
