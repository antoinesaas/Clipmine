import { NextRequest, NextResponse } from "next/server";
import { DEMO_CLIPS, searchDemo, thumbForId, groupByScene } from "@/lib/demo-clips";
import {
  augmentSearchQuery,
  inferMediaType,
  isFilmOrSeries,
  extractMovieTitle,
} from "@/lib/film-filter";
import type { MediaType } from "@/lib/film-filter";
import { fetchTranscriptSnippet } from "@/lib/youtube-transcript";

export type SearchResult = {
  youtubeId: string;
  title: string;
  movie: string;
  scene?: string;
  channel: string;
  thumb?: string;
  views: number;
  viralScore: number;
  type: MediaType;
  transcript?: string;
  is4K?: boolean;
  direct?: boolean;
};

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

function extractScene(title: string): string {
  const parts = title.split(/\s*[—\-|:]\s*/);
  return parts.length > 1 ? parts.slice(1).join(" — ").trim() : title;
}

function mapResult(v: {
  id: string;
  snippet: { title: string; channelTitle: string; description?: string; thumbnails?: { maxres?: { url: string }; high?: { url: string } }; publishedAt?: string };
  statistics?: { viewCount?: string };
  contentDetails?: { duration?: string; definition?: string };
}, extra?: { direct?: boolean; transcript?: string }) {
  const title = v.snippet.title;
  const channel = v.snippet.channelTitle;
  const views = Number(v.statistics?.viewCount ?? 0);
  const ageDays = Math.max(1, (Date.now() - new Date(v.snippet.publishedAt ?? Date.now()).getTime()) / 864e5);
  const viralScore = Math.min(100, Math.round(Math.log10(views / ageDays + 1) * 14));
  const type = inferMediaType(title, channel);
  const movie = extractMovieTitle(title);
  const is4K = /4k|2160|uhd/i.test(title) || v.contentDetails?.definition === "hd";
  return {
    youtubeId: v.id,
    title,
    movie,
    scene: extractScene(title),
    channel,
    thumb: v.snippet.thumbnails?.maxres?.url ?? v.snippet.thumbnails?.high?.url,
    views,
    duration: v.contentDetails?.duration,
    viralScore: is4K ? Math.min(100, viralScore + 8) : viralScore,
    type,
    transcript: extra?.transcript ?? v.snippet.description?.slice(0, 180),
    is4K,
    direct: extra?.direct,
  };
}

function sortByScene(results: SearchResult[]): SearchResult[] {
  const groups = new Map<string, SearchResult[]>();
  for (const r of results) {
    const key = r.movie;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  return [...groups.entries()]
    .sort((a, b) => Math.max(...b[1].map((x) => x.viralScore)) - Math.max(...a[1].map((x) => x.viralScore)))
    .flatMap(([, clips]) => clips.sort((a, b) => b.viralScore - a.viralScore));
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const typeParam = req.nextUrl.searchParams.get("type") as MediaType | "all" | null;
  const sort = req.nextUrl.searchParams.get("sort") ?? "scene";
  if (!q) return NextResponse.json({ error: "missing_query" }, { status: 400 });

  const key = process.env.YOUTUBE_API_KEY;
  const directId = extractYoutubeId(q);

  if (directId) {
    let transcript: string | null = null;
    if (key) {
      try {
        const v = await fetchVideo(directId, key);
        if (v) {
          transcript = await fetchTranscriptSnippet(directId);
          const item = { ...v, transcript: transcript ?? v.transcript };
          const filtered = filterByType([item], typeParam);
          return NextResponse.json({ results: filtered, mode: "live", sort });
        }
      } catch (e) {
        console.error("[search] direct fetch fail", e);
      }
    }
    transcript = await fetchTranscriptSnippet(directId);
    return NextResponse.json({
      results: filterByType([{
        youtubeId: directId,
        title: "Vidéo YouTube",
        movie: "YouTube",
        scene: "Clip direct",
        channel: "—",
        thumb: thumbForId(directId),
        views: 0,
        viralScore: 80,
        type: "film" as MediaType,
        transcript: transcript ?? undefined,
        is4K: true,
        direct: true,
      }], typeParam),
      mode: "fallback",
      sort,
    });
  }

  if (key) {
    try {
      const live = await searchLive(q, key, typeParam);
      if (live?.length) {
        const sorted = sort === "scene" ? sortByScene(live) : live.sort((a, b) => b.viralScore - a.viralScore);
        return NextResponse.json({ results: sorted.slice(0, 16), mode: "live", sort });
      }
    } catch (e) {
      console.error("[search] live fail, fallback to demo", e);
    }
  }

  const demoClips = searchDemo(q, 16, typeParam ?? "all");
  const demo: SearchResult[] = demoClips.map((c) => ({
    youtubeId: c.youtubeId,
    title: c.title,
    movie: c.movie,
    scene: c.scene,
    channel: c.channel,
    thumb: thumbForId(c.youtubeId),
    views: c.views,
    viralScore: c.viralScore,
    type: c.type,
    transcript: c.transcript,
    is4K: c.is4K,
  }));

  const results = sort === "scene" ? sortByScene(demo) : demo.sort((a, b) => b.viralScore - a.viralScore);
  const groups = groupByScene(demoClips);

  return NextResponse.json({
    results,
    groups: groups.map((g) => ({
      movie: g.movie,
      type: g.type,
      clips: g.clips.map((c) => ({
        youtubeId: c.youtubeId,
        movie: c.movie,
        scene: c.scene,
        transcript: c.transcript,
        thumb: thumbForId(c.youtubeId),
        viralScore: c.viralScore,
        type: c.type,
        is4K: c.is4K,
      })),
    })),
    mode: "demo",
    sort,
    hint: demo.length ? undefined : "Essaie un titre de film, une réplique, ou colle un lien YouTube.",
  });
}

function filterByType<T extends { type?: MediaType }>(items: T[], type?: MediaType | "all" | null): T[] {
  if (!type || type === "all") return items;
  return items.filter((i) => i.type === type);
}

async function fetchVideo(id: string, key: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,statistics,contentDetails");
  url.searchParams.set("id", id);
  url.searchParams.set("key", key);
  const vr = await fetch(url).then((r) => r.json());
  if (!vr.items?.length) return null;
  return mapResult(vr.items[0], { direct: true });
}

async function searchLive(q: string, key: string, typeFilter?: MediaType | "all" | null) {
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", `${augmentSearchQuery(q)} 4K`);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("maxResults", "30");
  searchUrl.searchParams.set("videoDefinition", "high");
  searchUrl.searchParams.set("videoCategoryId", "1");
  searchUrl.searchParams.set("order", "relevance");
  searchUrl.searchParams.set("key", key);
  const sr = await fetch(searchUrl).then((r) => r.json());
  if (sr.error) return null;

  const ids: string[] = (sr.items ?? []).map((i: { id?: { videoId?: string } }) => i.id?.videoId).filter(Boolean);
  if (!ids.length) return [];

  const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  videosUrl.searchParams.set("part", "snippet,statistics,contentDetails");
  videosUrl.searchParams.set("id", ids.join(","));
  videosUrl.searchParams.set("key", key);
  const vr = await fetch(videosUrl).then((r) => r.json());

  const results: SearchResult[] = await Promise.all(
    (vr.items ?? [])
      .map((v: Parameters<typeof mapResult>[0]) => mapResult(v))
      .filter((r: ReturnType<typeof mapResult>) => isFilmOrSeries(r.title, r.channel))
      .slice(0, 12)
      .map(async (r: SearchResult) => {
        const transcript = await fetchTranscriptSnippet(r.youtubeId);
        return { ...r, transcript: transcript ?? r.transcript };
      })
  );

  return filterByType(results, typeFilter);
}

export const dynamic = "force-dynamic";
