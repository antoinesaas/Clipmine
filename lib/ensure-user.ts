import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/** Crée l'utilisateur Prisma s'il manque (webhook Clerk en retard ou absent). */
export async function ensureDbUser(clerkId: string) {
  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) return existing;

  const cu = await currentUser();
  const email = cu?.emailAddresses[0]?.emailAddress ?? `${clerkId}@clipmine.fr`;

  try {
    return await prisma.user.create({ data: { clerkId, email } });
  } catch {
    const again = await prisma.user.findUnique({ where: { clerkId } });
    if (again) return again;
    throw new Error("ensureDbUser_failed");
  }
}
