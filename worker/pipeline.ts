/**
 * Pipeline vidéo ClipMine — chaque « modèle IA » = chaîne ffmpeg dédiée.
 * Exécuté sur Fly.io (yt-dlp → filtres → encode → R2).
 */

export type AiTool =
  | "upscale"
  | "enhance"
  | "denoise"
  | "stabilize"
  | "fps"
  | "slowmo";

export type PipelineInput = {
  ratio: string;
  quality: string;
  tools: AiTool[];
};

export function targetSize(ratio: string, quality: string): { w: number; h: number } {
  const uhd = /4k/i.test(quality);
  if (ratio === "9:16") return uhd ? { w: 2160, h: 3840 } : { w: 1080, h: 1920 };
  if (ratio === "4:3") return uhd ? { w: 2880, h: 2160 } : { w: 1440, h: 1080 };
  return uhd ? { w: 3840, h: 2160 } : { w: 1920, h: 1080 };
}

/** Filtres vidéo ffmpeg (une seule chaîne -vf). */
export function buildVideoFilters(input: PipelineInput): string {
  const { ratio, quality, tools } = input;
  const { w, h } = targetSize(ratio, quality);
  const f: string[] = [];

  // Recadrage ratio (toujours si export TikTok / formats)
  if (ratio === "9:16") {
    f.push("crop=ih*9/16:ih:(iw-ih*9/16)/2:0");
  } else if (ratio === "4:3") {
    f.push("crop=ih*4/3:ih:(iw-ih*4/3)/2:0");
  } else if (ratio === "16:9") {
    f.push("scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2");
  }

  if (tools.includes("denoise")) {
    f.push("hqdn3d=4:3:6:4.5");
  }

  if (tools.includes("stabilize")) {
    f.push("deshake=x=-1:y=-1:w=-1:h=-1:rx=24:ry=24");
  }

  if (tools.includes("slowmo")) {
    f.push("setpts=2*PTS");
  }

  if (tools.includes("upscale")) {
    f.push(`scale=${w}:${h}:flags=lanczos+accurate_rnd+full_chroma_int`);
  } else {
    f.push(`scale=${w}:${h}:flags=lanczos`);
  }

  if (tools.includes("enhance")) {
    f.push("unsharp=7:7:0.9:7:7:0.0,eq=contrast=1.08:brightness=0.03:saturation=1.1:gamma=1.02");
  }

  if (tools.includes("fps")) {
    f.push("minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1");
  }

  return f.join(",");
}

export function buildFfmpegArgs(
  inputPath: string,
  outputPath: string,
  input: PipelineInput,
  maxSec?: number,
): string[] {
  const vf = buildVideoFilters(input);
  const args = ["-y", "-i", inputPath];
  if (maxSec && maxSec > 0) args.push("-t", String(maxSec));
  args.push(
    "-vf",
    vf,
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "17",
    "-pix_fmt",
    "yuv420p",
  );

  if (input.tools.includes("slowmo")) {
    args.push("-filter:a", "atempo=0.5");
  }
  args.push("-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", outputPath);
  return args;
}

export function normalizeTools(raw: unknown, enhance: boolean): AiTool[] {
  const all: AiTool[] = ["upscale", "enhance", "denoise", "stabilize", "fps", "slowmo"];
  if (!enhance) return ["upscale"];
  if (!Array.isArray(raw) || raw.length === 0) {
    return ["upscale", "enhance", "denoise", "stabilize", "fps"];
  }
  const picked = raw.filter((t): t is AiTool => typeof t === "string" && all.includes(t as AiTool));
  return picked.length ? picked : ["upscale", "enhance", "denoise", "stabilize", "fps"];
}
