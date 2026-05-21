import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, hasDatabase } from "@/lib/prisma";
import { checkExportEntitlement, consumeExport } from "@/lib/entitlements";

// POST /api/download  { youtubeId, title, ratio, quality, enhance }
// MODE WAITLIST : le pipeline ffmpeg/youtube-dl ne tourne PAS sur Vercel serverless.
// On crée le job en "queued" et on prévient l'utilisateur par email/notification
// quand le worker dédié sera en ligne.
export async function POST(req: NextRequest) {
  const { userId: clerkId } = auth();
  if (!clerkId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { youtubeId, title, ratio, quality, enhance } = body ?? {};

  if (!youtubeId) {
    return NextResponse.json({ error: "missing_youtube_id" }, { status: 400 });
  }

  if (!hasDatabase) {
    return NextResponse.json({
      jobId: `waitlist-${Date.now()}`,
      status: "queued",
      mode: "waitlist",
      message: "Tu es dans la file d'attente. On t'envoie le clip par email dès qu'il est prêt.",
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "no_user" }, { status: 404 });

    const ent = await checkExportEntitlement(user.id);
    if (!ent.allowed) {
      return NextResponse.json({ error: "paywall", reason: ent.reason }, { status: 402 });
    }

    const dl = await prisma.download.create({
      data: {
        userId: user.id,
        youtubeId,
        title: title ?? "Untitled",
        ratio: ratio ?? "9:16",
        quality: quality ?? "4K",
        enhanced: !!enhance,
        status: "queued",
      },
    });

    await consumeExport(user.id, ent.source);

    return NextResponse.json({
      jobId: dl.id,
      status: "queued",
      mode: "waitlist",
      message: "Export ajouté à la file d'attente. Tu recevras un email quand il sera prêt.",
    });
  } catch (e) {
    console.error("[/api/download] error", e);
    return NextResponse.json({
      jobId: `error-${Date.now()}`,
      status: "queued",
      mode: "waitlist",
      message: "On t'a inscrit sur la liste d'attente. On te recontacte vite.",
    });
  }
}

export const dynamic = "force-dynamic";
