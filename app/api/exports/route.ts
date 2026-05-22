import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, hasDatabase } from "@/lib/prisma";
import { pruneUserExports, refreshExportFileUrl } from "@/lib/user-exports";

export async function GET() {
  const { userId: clerkId } = auth();
  if (!clerkId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasDatabase) return NextResponse.json({ exports: [], bonusCredits: 0 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ exports: [], bonusCredits: 0 });

    await pruneUserExports(user.id);

    const rows = await prisma.download.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    const exports = await Promise.all(
      rows.map(async (d) => {
        let fileUrl = d.fileUrl;
        if (d.status === "ready") {
          const fresh = await refreshExportFileUrl(d.id, d.status);
          if (fresh) {
            fileUrl = fresh;
            await prisma.download.update({
              where: { id: d.id },
              data: { fileUrl: fresh },
            });
          }
        }
        return {
          id: d.id,
          title: d.title,
          ratio: d.ratio,
          quality: d.quality,
          status: d.status,
          pipelineStage: d.pipelineStage,
          errorMessage: d.errorMessage,
          fileUrl,
          createdAt: d.createdAt.toISOString(),
        };
      }),
    );

    return NextResponse.json({
      exports,
      bonusCredits: user.bonusCredits,
      plan: user.plan,
    });
  } catch (e) {
    console.error("[/api/exports]", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
