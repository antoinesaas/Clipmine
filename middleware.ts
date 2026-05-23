import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// La landing "/" reste publique. /app et les API sensibles sont protégées.
const isProtected = createRouteMatcher(["/app(.*)", "/api/download(.*)", "/api/checkout(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (req.nextUrl.pathname.startsWith("/api/clerk-fapi")) return;
  if (isProtected(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
