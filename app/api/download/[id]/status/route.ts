import { NextRequest, NextResponse } from "next/server";
import { prisma, hasDatabase } from "@/lib/prisma";

// GET /api/download/[id]/status
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!hasDatabase || params.id.startsWith("waitlist-") || params.id.startsWith("error-")) {
    return NextResponse.json({ status: "queued", waitlist: true });
  }

  try {
    const dl = await prisma.download.findUnique({ where: { id: params.id } });
    if (!dl) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({
      status: dl.status,
      pipelineStage: dl.pipelineStage ?? null,
      fileUrl: dl.fileUrl,
      errorMessage: dl.errorMessage ?? null,
      quality: dl.quality,
      ratio: dl.ratio,
      enhanced: dl.enhanced,
      createdAt: dl.createdAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ status: "queued", waitlist: true });
  }
}

export const dynamic = "force-dynamic";
