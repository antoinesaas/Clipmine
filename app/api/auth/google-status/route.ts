import { NextResponse } from "next/server";
import { CLERK_PROXY_PUBLIC } from "@/lib/clerk-config";
import { appBaseUrl } from "@/lib/app-url";

/** GET — diagnostic Google OAuth (Clerk prod). */
export async function GET() {
  const origin = appBaseUrl();
  try {
    const r = await fetch(`${CLERK_PROXY_PUBLIC}/v1/environment`, {
      headers: { Origin: origin },
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });
    if (!r.ok) {
      return NextResponse.json({
        ok: false,
        reason: "clerk_unreachable",
        message: "Impossible de joindre l'API Clerk.",
      });
    }
    const data = (await r.json()) as Record<string, unknown>;
    const display = data.display_config as Record<string, unknown> | undefined;
    const oneTap =
      (display?.google_one_tap_client_id as string | undefined) ??
      (data.google_one_tap_client_id as string | undefined) ??
      "";

    const validClientId = /\.apps\.googleusercontent\.com$/i.test(oneTap);
    const looksLikeUrl = oneTap.startsWith("http");

    return NextResponse.json({
      ok: validClientId,
      googleOneTapClientId: validClientId ? `${oneTap.slice(0, 12)}…` : oneTap ? oneTap.slice(0, 80) : null,
      misconfigured: looksLikeUrl || (Boolean(oneTap) && !validClientId),
      fix:
        looksLikeUrl || !validClientId
          ? "Dans Clerk (Production) → Google : colle un vrai Client ID (*.apps.googleusercontent.com), pas l'URL de callback. Voir docs/GOOGLE-OAUTH-CLERK.md"
          : null,
      redirectHint: `${origin.replace(/\/$/, "")}/api/clerk-fapi/v1/oauth_callback`,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      reason: "check_failed",
      message: "Diagnostic Google indisponible.",
    });
  }
}

export const dynamic = "force-dynamic";
