import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, hasDatabase } from "@/lib/prisma";

/** DELETE — supprime les données utilisateur en base (compte Clerk côté client). */
export async function DELETE() {
  const { userId: clerkId } = auth();
  if (!clerkId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasDatabase) return NextResponse.json({ ok: true });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ ok: true });

    await prisma.download.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/account] delete", e);
    return NextResponse.json({ message: "Erreur suppression compte." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
