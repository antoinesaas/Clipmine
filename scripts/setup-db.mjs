#!/usr/bin/env node
/**
 * Applique les migrations Prisma sur Supabase et affiche les commandes Vercel.
 *
 * Usage (PowerShell) :
 *   $env:DIRECT_URL="postgresql://postgres:PASSWORD@db.elwqdulkxprjmkejwcai.supabase.co:5432/postgres"
 *   $env:DATABASE_URL="postgresql://postgres.elwqdulkxprjmkejwcai:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
 *   node scripts/setup-db.mjs
 *
 * Récupère les URI : https://supabase.com/dashboard/project/elwqdulkxprjmkejwcai/settings/database
 */
import { spawnSync } from "node:child_process";

const { DIRECT_URL, DATABASE_URL } = process.env;

if (!DIRECT_URL || !DATABASE_URL) {
  console.error("❌ DIRECT_URL et DATABASE_URL requis.");
  console.error("   Dashboard : https://supabase.com/dashboard/project/elwqdulkxprjmkejwcai/settings/database");
  process.exit(1);
}

console.log("→ prisma migrate deploy …");
const r = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

if (r.status !== 0) process.exit(r.status ?? 1);

console.log("\n✅ Migrations appliquées.");
console.log("\nAjoute sur Vercel (Production + Development) :");
console.log("  vercel env add DATABASE_URL production");
console.log("  vercel env add DIRECT_URL production");
console.log("  vercel env add DATABASE_URL development");
console.log("  vercel env add DIRECT_URL development");
console.log("\nPuis : vercel --prod");
