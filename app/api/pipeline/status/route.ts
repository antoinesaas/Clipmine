import { NextResponse } from "next/server";
import { hasWorker } from "@/lib/constants";
import { hasDatabase } from "@/lib/prisma";
import { hasR2 } from "@/lib/r2";
import { isPipelineReady } from "@/lib/pipeline";

/** Diagnostic public — indique quelles briques du pipeline sont configurées (sans secrets). */
export async function GET() {
  return NextResponse.json({
    ready: isPipelineReady(),
    checks: {
      database: hasDatabase,
      worker: hasWorker(),
      r2: hasR2,
    },
  });
}

export const dynamic = "force-dynamic";
