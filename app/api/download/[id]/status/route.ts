import { NextRequest, NextResponse } from "next/server";
import { isPipelineReady } from "@/lib/pipeline";
import { prisma, hasDatabase } from "@/lib/prisma";
import { refreshExportFileUrl } from "@/lib/user-exports";

// GET /api/download/[id]/status
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!hasDatabase || params.id.startsWith("waitlist-") || params.id.startsWith("error-")) {
    return NextResponse.json({
      status: "queued",
      waitlist: true,
      pipelineReady: false,
    });
  }

  try {
    const dl = await prisma.download.findUnique({ where: { id: params.id } });
    if (!dl) return NextResponse.json({ error: "not_found" }, { status: 404 });

    let fileUrl = dl.fileUrl;
    if (dl.status === "ready") {
      const fresh = await refreshExportFileUrl(dl.id, dl.status);
      if (fresh) {
        fileUrl = fresh;
        await prisma.download.update({ where: { id: dl.id }, data: { fileUrl: fresh } }).catch(() => {});
      }
    }

    return NextResponse.json({
      status: dl.status,
      pipelineStage: dl.pipelineStage ?? null,
      fileUrl,
      errorMessage: dl.errorMessage ?? null,
      quality: dl.quality,
      ratio: dl.ratio,
      enhanced: dl.enhanced,
      createdAt: dl.createdAt.toISOString(),
      pipelineReady: isPipelineReady(),
    });
  } catch {
    return NextResponse.json({ status: "queued", waitlist: true, pipelineReady: false });
  }
}

export const dynamic = "force-dynamic";
