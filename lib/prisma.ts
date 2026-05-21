import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Marche-t-il ? Vrai si DATABASE_URL est définie et que le client peut au moins être instancié.
export const hasDatabase = Boolean(process.env.DATABASE_URL);

function makeClient(): PrismaClient | null {
  if (!hasDatabase) return null;
  try {
    return new PrismaClient();
  } catch (e) {
    console.warn("[prisma] failed to init client", e);
    return null;
  }
}

const client = globalForPrisma.prisma ?? makeClient();

// On garde l'export `prisma` typé non-null pour ne pas casser les routes existantes.
// Les routes doivent désormais checker `hasDatabase` AVANT toute query, sinon
// renvoyer 503 (waitlist mode).
export const prisma = client as PrismaClient;

if (process.env.NODE_ENV !== "production" && client) globalForPrisma.prisma = client;
