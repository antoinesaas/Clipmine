import { NextRequest, NextResponse } from "next/server";

// MODE WAITLIST : ffmpeg + youtube-dl ne tournent PAS dans le runtime serverless Vercel.
// Cette route reste en place pour le compat front, mais l'exécution réelle se fait
// dans un worker dédié (à brancher : Railway / Fly / Hetzner + queue Upstash QStash).
// Ici on accepte la requête et on retourne "queued" pour ne rien casser.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  console.log("[/api/process] received", body);
  return NextResponse.json({
    status: "queued",
    mode: "waitlist",
    note: "Pipeline en attente d'activation. Le clip sera traité dès que le worker dédié est en ligne.",
  });
}

export const dynamic = "force-dynamic";
