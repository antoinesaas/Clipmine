/**
 * Pipeline vidéo ClipMine — chaîne ffmpeg stable (Fly.io).
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
  const q = String(quality).toLowerCase();
  const tier = /4k|2160/.test(q) ? "4k" : /1440/.test(q) ? "1440" : "1080";

  if (ratio === "9:16") {
    if (tier === "4k") return { w: 2160, h: 3840 };
    if (tier === "1440") return { w: 1440, h: 2560 };
    return { w: 1080, h: 1920 };
  }
  if (ratio === "4:3") {
    if (tier === "4k") return { w: 2880, h: 2160 };
    if (tier === "1440") return { w: 1920, h: 1440 };
    return { w: 1440, h: 1080 };
  }
  if (tier === "4k") return { w: 3840, h: 2160 };
  if (tier === "1440") return { w: 2560, h: 1440 };
  return { w: 1920, h: 1080 };
}

/** slowmo et 60fps sont incompatibles dans la même chaîne -vf. */
export function reconcileTools(tools: AiTool[]): AiTool[] {
  if (tools.includes("slowmo")) {
    return tools.filter((x) => x !== "fps");
  }
  if (tools.includes("fps")) {
    return tools.filter((x) => x !== "slowmo");
  }
  return tools;
}

export function buildVideoFilters(input: PipelineInput): string {
  const tools = reconcileTools(input.tools);
  const { ratio, quality } = input;
  const { w, h } = targetSize(ratio, quality);
  const f: string[] = [];

  if (ratio === "9:16") {
    f.push("crop='min(iw,ih*9/16)':ih:(iw-min(iw,ih*9/16))/2:0");
    f.push(`scale=${w}:${h}:flags=lanczos`);
  } else if (ratio === "4:3") {
    f.push("crop='min(iw,ih*4/3)':ih:(iw-min(iw,ih*4/3))/2:0");
  } else {
    f.push(
      `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=black`,
    );
  }

  if (tools.includes("denoise")) {
    f.push("hqdn3d=3:2:4:3");
  }

  if (tools.includes("stabilize")) {
    f.push("deshake");
  }

  if (ratio !== "16:9") {
    f.push(`scale=${w}:${h}:flags=lanczos`);
  }

  if (tools.includes("upscale")) {
    f.push("unsharp=7:7:0.85:5:5:0.0");
  }

  if (tools.includes("enhance")) {
    f.push("unsharp=5:5:0.6:5:5:0.0,eq=contrast=1.06:brightness=0.02:saturation=1.08");
  }

  if (tools.includes("fps")) {
    f.push("fps=60");
  } else if (tools.includes("slowmo")) {
    f.push("setpts=2*PTS");
  }

  return f.join(",");
}

export function buildFfmpegArgs(
  inputPath: string,
  outputPath: string,
  input: PipelineInput,
  maxSec?: number,
): string[] {
  const tools = reconcileTools(input.tools);
  const vf = buildVideoFilters({ ...input, tools });
  const args = ["-y", "-i", inputPath];
  if (maxSec && maxSec > 0) args.push("-t", String(maxSec));
  args.push("-vf", vf, "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p");

  if (tools.includes("slowmo")) {
    args.push("-filter:a", "atempo=0.5");
  }
  args.push("-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", outputPath);
  return args;
}

/** Chaînes de repli si ffmpeg échoue (filtres lourds / incompatibles). */
export function buildFallbackFilterChains(input: PipelineInput): string[] {
  const { ratio, quality } = input;
  const tools = reconcileTools(input.tools);
  const { w, h } = targetSize(ratio, quality);

  const crop =
    ratio === "9:16"
      ? "crop='min(iw,ih*9/16)':ih:(iw-min(iw,ih*9/16))/2:0"
      : ratio === "4:3"
        ? "crop='min(iw,ih*4/3)':ih:(iw-min(iw,ih*4/3))/2:0"
        : `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=black`;

  const scale = ratio === "16:9" ? "" : `,scale=${w}:${h}:flags=lanczos`;
  const denoise = tools.includes("denoise") ? ",hqdn3d=3:2:4:3" : "";
  const enhance = tools.includes("enhance")
    ? ",unsharp=5:5:0.5:5:5:0.0,eq=contrast=1.05:saturation=1.06"
    : "";
  const motion = tools.includes("fps") ? ",fps=60" : tools.includes("slowmo") ? ",setpts=2*PTS" : "";

  const full = `${crop}${scale}${denoise}${enhance}${motion}`.replace(/^,/, "");
  const medium = `${crop}${scale}${denoise}${enhance}`.replace(/^,/, "");
  const minimal = `${crop}${scale || `scale=${w}:${h}`}`.replace(/^,/, "");

  return [full, medium, minimal].filter(Boolean);
}

export function normalizeTools(raw: unknown, enhance: boolean): AiTool[] {
  const all: AiTool[] = ["upscale", "enhance", "denoise", "stabilize", "fps", "slowmo"];
  if (!enhance) return [];
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const picked = raw.filter((t): t is AiTool => typeof t === "string" && all.includes(t as AiTool));
  return reconcileTools(picked);
}
