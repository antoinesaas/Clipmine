import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/download/[id]/status
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const dl = await prisma.download.findUnique({ where: { id: params.id } });
  if (!dl) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ status: dl.status, fileUrl: dl.fileUrl });
}
