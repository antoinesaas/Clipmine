import { NextRequest, NextResponse } from "next/server";

const CLERK_FAPI = "https://frontend-api.clerk.dev";

function proxyUrlFromRequest(req: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.replace(/\/$/, "");
  if (configured?.startsWith("http")) return configured;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "www.clipmine.fr";
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}/api/clerk-fapi`;
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

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

type Ctx = { params: { path?: string[] } };

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
