import { NextRequest, NextResponse } from "next/server";
import youtubedl from "youtube-dl-exec";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { tmpdir } from "os";
import { join } from "path";
import { unlink } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const maxDuration = 300; // 5 min (passe en worker dédié si tes clips sont longs)

// Map ratio -> filtre ffmpeg de recadrage centré + scale qualité
const CROP: Record<string, string> = {
  "9:16": "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=1080:1920",
  "16:9": "crop='min(iw,ih*16/9)':'min(ih,iw*9/16)',scale=3840:2160",
  "4:3": "crop='min(iw,ih*4/3)':'min(ih,iw*3/4)',scale=1440:1080",
};

// POST /api/process  { jobId }
// Déclenché juste après la création du Download (via Upstash QStash ou fetch interne).
export async function POST(req: NextRequest) {
  const { jobId } = await req.json();
  const job = await prisma.download.findUnique({ where: { id: jobId } });
  if (!job) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const raw = join(tmpdir(), `${jobId}-raw.mp4`);
  const out = join(tmpdir(), `${jobId}-out.mp4`);

  try {
    // 1) Télécharge la meilleure qualité dispo (jusqu'à 4K)
    await youtubedl(`https://www.youtube.com/watch?v=${job.youtubeId}`, {
      format: "bestvideo[height<=2160]+bestaudio/best",
      output: raw,
      mergeOutputFormat: "mp4",
    });

    // 2) Construit la chaîne de filtres
    const filters: string[] = [CROP[job.ratio] ?? CROP["9:16"]];
    if (job.enhanced) {
      filters.push("unsharp=5:5:1.0");                 // netteté
      filters.push("minterpolate=fps=60:mi_mode=mci"); // fluidité 60fps
    }

    // 3) Traite avec ffmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(raw)
        .videoFilters(filters.join(","))
        .outputOptions(["-c:v libx264", "-preset slow", "-crf 18", "-c:a aac", "-b:a 192k"])
        .on("end", () => resolve())
        .on("error", reject)
        .save(out);
    });

    // 4) Upload R2 + maj DB
    const url = await uploadToR2(out, `exports/${jobId}.mp4`);
    await prisma.download.update({ where: { id: jobId }, data: { status: "ready", fileUrl: url } });

    return NextResponse.json({ status: "ready", fileUrl: url });
  } catch (err) {
    await prisma.download.update({ where: { id: jobId }, data: { status: "failed" } });
    return NextResponse.json({ status: "failed", error: String(err) }, { status: 500 });
  } finally {
    await unlink(raw).catch(() => {});
    await unlink(out).catch(() => {});
  }
}
