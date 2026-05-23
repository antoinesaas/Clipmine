import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, hasDatabase } from "@/lib/prisma";
import { ensureDbUser } from "@/lib/ensure-user";
import { refreshExportFileUrl } from "@/lib/user-exports";

/** GET — URL signée fraîche pour retélécharger un export. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { userId: clerkId } = auth();
  if (!clerkId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasDatabase) return NextResponse.json({ error: "no_db" }, { status: 503 });

  const user = await ensureDbUser(clerkId);

  const dl = await prisma.download.findFirst({
    where: { id: params.id, userId: user.id },
  });
  if (!dl) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (dl.status !== "ready") {
    return NextResponse.json({ error: "not_ready", status: dl.status }, { status: 400 });
  }

  const fileUrl = await refreshExportFileUrl(dl.id, dl.status);
  if (!fileUrl) return NextResponse.json({ error: "file_missing" }, { status: 404 });

  await prisma.download.update({ where: { id: dl.id }, data: { fileUrl } });

  return NextResponse.json({ fileUrl, title: dl.title });
}

export const dynamic = "force-dynamic";
