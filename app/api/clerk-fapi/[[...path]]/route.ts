import { NextRequest, NextResponse } from "next/server";
import { CLERK_PROXY_PUBLIC, CLERK_PROXY_REGISTERED } from "@/lib/clerk-config";

const CLERK_FAPI = "https://frontend-api.clerk.dev";

const ALLOWED_ORIGINS = new Set([
  "https://www.clipmine.fr",
  "https://clipmine.fr",
  "http://localhost:3000",
]);

function corsHeaders(req: NextRequest): Headers {
  const h = new Headers();
  const origin = req.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    h.set("Access-Control-Allow-Origin", origin);
    h.set("Access-Control-Allow-Credentials", "true");
    h.set("Vary", "Origin");
  }
  h.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  h.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Clerk-Proxy-Url, Clerk-Secret-Key, X-Forwarded-For",
  );
  return h;
}

/** Réécrit les URLs Clerk vers le proxy www visible par le navigateur. */
function rewriteProxyUrls(value: string): string {
  return value
    .replaceAll("https://frontend-api.clerk.dev", CLERK_PROXY_REGISTERED)
    .replaceAll(CLERK_PROXY_REGISTERED, CLERK_PROXY_PUBLIC)
    .replaceAll("https://clerk.clipmine.fr", CLERK_PROXY_PUBLIC);
}

function rewriteResponseHeaders(headers: Headers): void {
  const location = headers.get("location");
  if (location) headers.set("location", rewriteProxyUrls(location));

  // Plusieurs Set-Cookie possibles
  const cookies = headers.getSetCookie?.() ?? [];
  if (cookies.length > 0) {
    headers.delete("set-cookie");
    for (const cookie of cookies) {
      headers.append("set-cookie", rewriteProxyUrls(cookie));
    }
  } else {
    const single = headers.get("set-cookie");
    if (single) headers.set("set-cookie", rewriteProxyUrls(single));
  }
}

async function proxyClerk(req: NextRequest, path: string[]) {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "clerk_not_configured" }, { status: 500 });
  }

  const subpath = path.join("/");
  const target = `${CLERK_FAPI}/${subpath}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "connection" || lower === "content-length") return;
    if (lower === "clerk-proxy-url") return;
    headers.set(key, value);
  });
  // Doit correspondre exactement au proxy_url du dashboard Clerk
  headers.set("Clerk-Proxy-Url", CLERK_PROXY_REGISTERED);
  headers.set("Clerk-Secret-Key", secret);
  headers.set(
    "X-Forwarded-For",
    req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      "127.0.0.1",
  );

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  const upstream = await fetch(target, init);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  rewriteResponseHeaders(responseHeaders);

  const cors = corsHeaders(req);
  cors.forEach((value, key) => responseHeaders.set(key, value));

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

type Ctx = { params: { path?: string[] } };

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxyClerk(req, ctx.params.path ?? []);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return proxyClerk(req, ctx.params.path ?? []);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  return proxyClerk(req, ctx.params.path ?? []);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  return proxyClerk(req, ctx.params.path ?? []);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  return proxyClerk(req, ctx.params.path ?? []);
}
