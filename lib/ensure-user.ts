import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/** Crée ou récupère l'utilisateur Prisma (webhook Clerk en retard ou email déjà connu). */
export async function ensureDbUser(clerkId: string) {
  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) return existing;

  const cu = await currentUser();
  const email = cu?.emailAddresses[0]?.emailAddress ?? `${clerkId}@clipmine.fr`;

  try {
    return await prisma.user.upsert({
      where: { clerkId },
      update: { email },
      create: { clerkId, email },
    });
  } catch {
    const byEmail = await prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      return prisma.user.update({
        where: { id: byEmail.id },
        data: { clerkId },
      });
    }
    throw new Error("ensureDbUser_failed");
  }
}
