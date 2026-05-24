import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, hasDatabase } from "@/lib/prisma";
import { ensureDbUser } from "@/lib/ensure-user";
import { checkExportEntitlement, consumeExport } from "@/lib/entitlements";
import { hasWorker, WORKER_SECRET, WORKER_URL } from "@/lib/constants";
import { sanitizeTools, type AiToolId } from "@/lib/video-tools";
import { normalizeExportQuality } from "@/lib/export-quality";
import { isPipelineReady, pipelineBlockMessage } from "@/lib/pipeline";
import { pruneUserExports } from "@/lib/user-exports";

async function dispatchToWorker(payload: {
  jobId: string;
  youtubeId: string;
  title: string;
  ratio: string;
  quality: string;
  enhance: boolean;
  tools: AiToolId[];
}): Promise<{ ok: boolean; error?: string }> {
  if (!hasWorker()) return { ok: false, error: "worker_not_configured" };
  const secret = WORKER_SECRET.trim();
  const base = WORKER_URL.replace(/\/$/, "");

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        await fetch(`${base}/health`, { signal: AbortSignal.timeout(25_000) });
        await new Promise((r) => setTimeout(r, 2000));
      }
      const r = await fetch(`${base}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(60_000),
      });
      if (r.status === 401) return { ok: false, error: "worker_auth" };
      if (!r.ok) {
        const t = await r.text();
        console.error("[/api/download] worker HTTP", r.status, t);
        if (attempt < 2) continue;
        return { ok: false, error: "worker_http" };
      }
      return { ok: true };
    } catch (e) {
      console.error("[/api/download] worker dispatch attempt", attempt, e);
      if (attempt === 2) return { ok: false, error: "worker_unreachable" };
    }
  }
  return { ok: false, error: "worker_unreachable" };
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = auth();
  if (!clerkId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { youtubeId, title, ratio, quality, enhance, tools: rawTools } = body ?? {};

  const ytId = String(youtubeId ?? "").trim();
  if (!ytId) {
    return NextResponse.json({ error: "missing_youtube_id" }, { status: 400 });
  }
  if (!/^[a-zA-Z0-9_-]{11}$/.test(ytId)) {
    return NextResponse.json(
      { error: "invalid_youtube_id", message: "ID YouTube invalide pour cet export." },
      { status: 400 },
    );
  }

  if (!hasDatabase || !isPipelineReady()) {
    return NextResponse.json(
      {
        error: "pipeline_unavailable",
        message: pipelineBlockMessage(),
      },
      { status: 503 },
    );
  }

  try {
    const user = await ensureDbUser(clerkId);

    const ent = await checkExportEntitlement(user.id);
    if (!ent.allowed) {
      return NextResponse.json({ error: "paywall", reason: ent.reason }, { status: 402 });
    }

    const wantsEnhance = enhance !== false;
    const tools = sanitizeTools(rawTools, user.plan, wantsEnhance);
    const exportQuality = normalizeExportQuality(quality);

    const dl = await prisma.download.create({
      data: {
        userId: user.id,
        youtubeId: ytId,
        title: title ?? "Untitled",
        ratio: ratio ?? "9:16",
        quality: exportQuality,
        enhanced: wantsEnhance && tools.length > 0,
        status: hasWorker() ? "processing" : "queued",
        pipelineStage: hasWorker() ? "download" : "queued",
      },
    });

    let dispatchError: string | undefined;
    if (hasWorker()) {
      const dispatched = await dispatchToWorker({
        jobId: dl.id,
        youtubeId: ytId,
        title: title ?? "Untitled",
        ratio: ratio ?? "9:16",
        quality: exportQuality,
        enhance: wantsEnhance,
        tools,
      });
      if (!dispatched.ok) {
        dispatchError = dispatched.error;
        const errMsg =
          dispatched.error === "worker_auth"
            ? "Erreur de configuration worker (secret). Contacte le support."
            : "Worker indisponible. Réessaie dans 1 minute.";
        await prisma.download.update({
          where: { id: dl.id },
          data: {
            status: "failed",
            errorMessage: errMsg,
          },
        });
      } else {
        await consumeExport(user.id, ent.source);
        await pruneUserExports(user.id);
      }
    } else {
      await consumeExport(user.id, ent.source);
      await pruneUserExports(user.id);
    }

    const toolLabels = tools.map((t) => t).join(", ");
    return NextResponse.json({
      jobId: dl.id,
      status: hasWorker() ? "processing" : "queued",
      mode: hasWorker() ? "live" : "waitlist",
      tools,
      message: dispatchError
        ? "Export échoué — worker en réveil ou indisponible. Réessaie."
        : hasWorker()
          ? `Pipeline IA lancé (${toolLabels || "recadrage"}).`
          : "Export en file — configure WORKER_URL (Fly.io) pour activer le pipeline.",
      error: dispatchError,
    });
  } catch (e) {
    console.error("[/api/download] error", e);
    return NextResponse.json(
      { error: "export_failed", message: "Erreur serveur — réessaie dans un instant." },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
