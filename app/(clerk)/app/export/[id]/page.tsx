import ExportProgressView from "@/components/ExportProgressView";
import type { AiToolId } from "@/lib/video-tools";
import { AI_TOOL_IDS } from "@/lib/video-tools";

export default function ExportProgressPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: {
    title?: string;
    quality?: string;
    ratio?: string;
    tools?: string;
  };
}) {
  const tools = (searchParams?.tools ?? "")
    .split(",")
    .filter((t): t is AiToolId =>
      (AI_TOOL_IDS as readonly string[]).includes(t),
    );

  return (
    <ExportProgressView
      jobId={params.id}
      title={searchParams?.title ?? "Export"}
      quality={searchParams?.quality ?? "4K"}
      ratio={searchParams?.ratio ?? "9:16"}
      tools={tools}
    />
  );
}
