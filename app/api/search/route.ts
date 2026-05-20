import { NextRequest, NextResponse } from "next/server";

// GET /api/search?q=...&duration=short&order=viewCount
// Scanne YouTube via Data API v3 et calcule un score de viralité.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ error: "missing_query" }, { status: 400 });

  const key = process.env.YOUTUBE_API_KEY!;

  // 1) search.list -> récupère les videoId
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", q);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("maxResults", "24");
  searchUrl.searchParams.set("videoDefinition", "high"); // qualité HD/4K
  searchUrl.searchParams.set("order", "relevance");
  searchUrl.searchParams.set("key", key);

  const sr = await fetch(searchUrl).then((r) => r.json());
  const ids: string[] = (sr.items ?? []).map((i: any) => i.id.videoId).filter(Boolean);
  if (!ids.length) return NextResponse.json({ results: [] });

  // 2) videos.list -> stats + durée pour scorer
  const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  videosUrl.searchParams.set("part", "snippet,statistics,contentDetails");
  videosUrl.searchParams.set("id", ids.join(","));
  videosUrl.searchParams.set("key", key);

  const vr = await fetch(videosUrl).then((r) => r.json());

  const results = (vr.items ?? []).map((v: any) => {
    const views = Number(v.statistics?.viewCount ?? 0);
    const ageDays = Math.max(1, (Date.now() - new Date(v.snippet.publishedAt).getTime()) / 864e5);
    // score viralité = vues/jour normalisé (0-100)
    const viralRaw = views / ageDays;
    const score = Math.min(100, Math.round(Math.log10(viralRaw + 1) * 14));
    return {
      youtubeId: v.id,
      title: v.snippet.title,
      channel: v.snippet.channelTitle,
      thumb: v.snippet.thumbnails?.high?.url,
      views,
      duration: v.contentDetails?.duration, // ISO 8601
      viralScore: score,
    };
  });

  // Trie par score viral décroissant
  results.sort((a: any, b: any) => b.viralScore - a.viralScore);

  return NextResponse.json({ results });
}
