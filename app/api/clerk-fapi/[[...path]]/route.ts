import { NextRequest, NextResponse } from "next/server";
import { CLERK_PROXY_URL } from "@/lib/clerk-config";

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

function proxyUrlFromRequest(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  if (host.startsWith("www.")) {
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}/api/clerk-fapi`;
  }
  return CLERK_PROXY_URL;
}

async function proxyClerk(req: NextRequest, path: string[]) {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "clerk_not_configured" }, { status: 500 });
  }

  const subpath = path.join("/");
  const target = `${CLERK_FAPI}/${subpath}${req.nextUrl.search}`;
  const proxyUrl = proxyUrlFromRequest(req);

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "connection" || lower === "content-length") return;
    headers.set(key, value);
  });
  headers.set("Clerk-Proxy-Url", proxyUrl);
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
