/**
 * Met un compte en plan PRO (usage: node scripts/set-pro-plan.mjs antoine08.pro)
 * Charge DATABASE_URL depuis .env.production.local ou .env.local
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

function loadEnv() {
  for (const name of [".env.production.local", ".env.local", ".env"]) {
    const p = resolve(process.cwd(), name);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) {
        process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
      }
    }
    break;
  }
}

loadEnv();
const needle = (process.argv[2] ?? "antoine08.pro").toLowerCase();
const prisma = new PrismaClient();

try {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: needle, mode: "insensitive" } },
        { clerkId: { contains: needle, mode: "insensitive" } },
      ],
    },
  });

  if (!users.length) {
    console.error(`Aucun utilisateur trouvé pour "${needle}".`);
    process.exit(1);
  }

  for (const u of users) {
    await prisma.user.update({
      where: { id: u.id },
      data: { plan: "PRO", exportsThisMonth: 0 },
    });
    console.log(`OK PRO → ${u.email} (${u.clerkId})`);
  }
} finally {
  await prisma.$disconnect();
}
