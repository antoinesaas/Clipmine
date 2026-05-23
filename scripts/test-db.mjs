import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  const n = await prisma.user.count();
  console.log("DB OK, users:", n);
} catch (e) {
  console.error("DB FAIL:", e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
