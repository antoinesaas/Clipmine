import { prisma } from "@/lib/prisma";
import { deleteR2Key, exportStorageKey, hasR2, signR2Key } from "@/lib/r2";

export const MAX_STORED_EXPORTS = 15;

/** Garde les 15 exports les plus récents ; supprime le reste (DB + R2). */
export async function pruneUserExports(userId: string) {
  const rows = await prisma.download.findMany({
    where: { userId, status: { in: ["ready", "processing", "failed", "queued"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (rows.length <= MAX_STORED_EXPORTS) return;

  const excess = rows.slice(MAX_STORED_EXPORTS);
  for (const row of excess) {
    if (hasR2) await deleteR2Key(exportStorageKey(row.id));
    await prisma.download.delete({ where: { id: row.id } }).catch(() => {});
  }
}

export async function refreshExportFileUrl(jobId: string, status: string): Promise<string | null> {
  if (status !== "ready" || !hasR2) return null;
  try {
    return await signR2Key(exportStorageKey(jobId));
  } catch {
    return null;
  }
}
