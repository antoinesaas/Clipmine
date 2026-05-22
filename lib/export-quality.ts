export const EXPORT_QUALITIES = ["4K", "1440p", "1080p"] as const;
export type ExportQuality = (typeof EXPORT_QUALITIES)[number];

export function normalizeExportQuality(raw: unknown): ExportQuality {
  const q = String(raw ?? "4K").trim();
  if (q === "1440p" || q === "1080p") return q;
  return "4K";
}
