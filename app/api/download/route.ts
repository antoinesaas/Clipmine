import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { checkExportEntitlement, consumeExport } from "@/lib/entitlements";

// POST /api/download  { youtubeId, title, ratio, quality, enhance }
// 1. vérifie le droit (1 free 4K -> quota -> crédits -> paywall)
// 2. crée le job + déclenche le pipeline de traitement
// 3. décrémente le bon compteur
export async function POST(req: NextRequest) {
  const { userId: clerkId } = auth();
  if (!clerkId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "no_user" }, { status: 404 });

  const { youtubeId, title, ratio, quality, enhance } = await req.json();

  // --- GATE monétisation ---
  const ent = await checkExportEntitlement(user.id);
  if (!ent.allowed) {
    return NextResponse.json({ error: "paywall", reason: ent.reason }, { status: 402 });
  }

  // --- Crée le job ---
  const dl = await prisma.download.create({
    data: {
      userId: user.id, youtubeId, title,
      ratio, quality: quality ?? "4K", enhanced: !!enhance,
      status: "processing",
    },
  });

  // --- Déclenche le pipeline (fire-and-forget) ---
  // En prod : remplace par une queue Upstash QStash pour fiabilité + retries.
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: dl.id }),
  }).catch(() => {});

  // Décrémente le bon compteur
  await consumeExport(user.id, ent.source);

  return NextResponse.json({ jobId: dl.id, source: ent.source });
}
