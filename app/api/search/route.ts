import { NextRequest, NextResponse } from "next/server";
import { DEMO_CLIPS, searchDemo, thumbForId } from "@/lib/demo-clips";

// Extrait l'ID YouTube depuis une URL ou un texte brut
function extractYoutubeId(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const m = input.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

// GET /api/search?q=...
// 1) lien YouTube direct → fetch direct si clé dispo, sinon mock minimal
// 2) mots-clés → search YouTube si clé dispo, sinon démo locale
// Toujours 200 avec results[], jamais 5xx pour ne pas casser l'UX.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "missing_query" }, { status: 400 });

  const key = process.env.YOUTUBE_API_KEY;
  const directId = extractYoutubeId(q);

  if (directId) {
    if (key) {
      try {
        const v = await fetchVideo(directId, key);
        if (v) return NextResponse.json({ results: [v], mode: "live" });
      } catch (e) {
        console.error("[search] direct fetch fail", e);
      }
    }
    return NextResponse.json({
      results: [{
        youtubeId: directId,
        title: "Vidéo YouTube",
        channel: "—",
        thumb: thumbForId(directId),
        views: 0,
        viralScore: 80,
        direct: true,
      }],
      mode: "fallback",
    });
  }

  if (key) {
    try {
      const live = await searchLive(q, key);
      if (live) return NextResponse.json({ results: live, mode: "live" });
    } catch (e) {
      console.error("[search] live fail, fallback to demo", e);
    }
  }

  const demo = searchDemo(q).map((c) => ({
    ...c,
    thumb: thumbForId(c.youtubeId),
  }));
  return NextResponse.json({ results: demo, mode: "demo" });
}

async function fetchVideo(id: string, key: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,statistics,contentDetails");
  url.searchParams.set("id", id);
  url.searchParams.set("key", key);
  const vr = await fetch(url).then((r) => r.json());
  if (!vr.items?.length) return null;
  const v = vr.items[0];
  const views = Number(v.statistics?.viewCount ?? 0);
  const ageDays = Math.max(1, (Date.now() - new Date(v.snippet.publishedAt).getTime()) / 864e5);
  const score = Math.min(100, Math.round(Math.log10(views / ageDays + 1) * 14));
  return {
    youtubeId: v.id,
    title: v.snippet.title,
    channel: v.snippet.channelTitle,
    thumb: v.snippet.thumbnails?.maxres?.url ?? v.snippet.thumbnails?.high?.url,
    views,
    duration: v.contentDetails?.duration,
    viralScore: score,
    direct: true,
  };
}

async function searchLive(q: string, key: string) {
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", q);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("maxResults", "24");
  searchUrl.searchParams.set("videoDefinition", "high");
  searchUrl.searchParams.set("order", "relevance");
  searchUrl.searchParams.set("key", key);
  const sr = await fetch(searchUrl).then((r) => r.json());
  if (sr.error) return null;

  const ids: string[] = (sr.items ?? []).map((i: any) => i.id.videoId).filter(Boolean);
  if (!ids.length) return [];

  const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  videosUrl.searchParams.set("part", "snippet,statistics,contentDetails");
  videosUrl.searchParams.set("id", ids.join(","));
  videosUrl.searchParams.set("key", key);
  const vr = await fetch(videosUrl).then((r) => r.json());

  const results = (vr.items ?? []).map((v: any) => {
    const views = Number(v.statistics?.viewCount ?? 0);
    const ageDays = Math.max(1, (Date.now() - new Date(v.snippet.publishedAt).getTime()) / 864e5);
    const score = Math.min(100, Math.round(Math.log10(views / ageDays + 1) * 14));
    return {
      youtubeId: v.id,
      title: v.snippet.title,
      channel: v.snippet.channelTitle,
      thumb: v.snippet.thumbnails?.high?.url,
      views,
      duration: v.contentDetails?.duration,
      viralScore: score,
    };
  });
  return results.sort((a: any, b: any) => b.viralScore - a.viralScore);
}

export const dynamic = "force-dynamic";
