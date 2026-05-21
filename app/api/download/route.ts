import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, hasDatabase } from "@/lib/prisma";
import { checkExportEntitlement, consumeExport } from "@/lib/entitlements";
import { hasWorker, WORKER_SECRET, WORKER_URL } from "@/lib/constants";

async function dispatchToWorker(payload: {
  jobId: string;
  youtubeId: string;
  title: string;
  ratio: string;
  quality: string;
  enhance: boolean;
}) {
  if (!hasWorker()) return;
  try {
    await fetch(`${WORKER_URL}/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WORKER_SECRET}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("[/api/download] worker dispatch failed", e);
  }
}

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
      message: "File d'attente — le worker vidéo sera activé dès que WORKER_URL est configuré.",
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
        status: hasWorker() ? "processing" : "queued",
      },
    });

    await consumeExport(user.id, ent.source);

    if (hasWorker()) {
      await dispatchToWorker({
        jobId: dl.id,
        youtubeId,
        title: title ?? "Untitled",
        ratio: ratio ?? "9:16",
        quality: quality ?? "4K",
        enhance: !!enhance,
      });
    }

    return NextResponse.json({
      jobId: dl.id,
      status: hasWorker() ? "processing" : "queued",
      mode: hasWorker() ? "live" : "waitlist",
      message: hasWorker()
        ? "Export en cours sur le worker vidéo."
        : "Export en file — configure WORKER_URL (Railway/Fly) pour le pipeline ffmpeg.",
    });
  } catch (e) {
    console.error("[/api/download] error", e);
    return NextResponse.json({
      jobId: `error-${Date.now()}`,
      status: "queued",
      mode: "waitlist",
      message: "Erreur — réessaie dans un instant.",
    });
  }
}

export const dynamic = "force-dynamic";
