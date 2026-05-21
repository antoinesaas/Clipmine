import { NextRequest, NextResponse } from "next/server";
import { DEMO_CLIPS, searchDemo, thumbForId } from "@/lib/demo-clips";
import {
  augmentSearchQuery,
  inferMediaType,
  isFilmOrSeries,
  extractMovieTitle,
} from "@/lib/film-filter";
import type { MediaType } from "@/lib/film-filter";

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

function mapResult(v: {
  id: string;
  snippet: { title: string; channelTitle: string; thumbnails?: { maxres?: { url: string }; high?: { url: string } }; publishedAt?: string };
  statistics?: { viewCount?: string };
  contentDetails?: { duration?: string };
}, extra?: { direct?: boolean }) {
  const title = v.snippet.title;
  const channel = v.snippet.channelTitle;
  const views = Number(v.statistics?.viewCount ?? 0);
  const ageDays = Math.max(1, (Date.now() - new Date(v.snippet.publishedAt ?? Date.now()).getTime()) / 864e5);
  const viralScore = Math.min(100, Math.round(Math.log10(views / ageDays + 1) * 14));
  const type = inferMediaType(title, channel);
  const movie = extractMovieTitle(title);
  return {
    youtubeId: v.id,
    title,
    movie,
    channel,
    thumb: v.snippet.thumbnails?.maxres?.url ?? v.snippet.thumbnails?.high?.url,
    views,
    duration: v.contentDetails?.duration,
    viralScore,
    type,
    direct: extra?.direct,
  };
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const typeParam = req.nextUrl.searchParams.get("type") as MediaType | "all" | null;
  if (!q) return NextResponse.json({ error: "missing_query" }, { status: 400 });

  const key = process.env.YOUTUBE_API_KEY;
  const directId = extractYoutubeId(q);

  if (directId) {
    if (key) {
      try {
        const v = await fetchVideo(directId, key);
        if (v) {
          const filtered = filterByType([v], typeParam);
          return NextResponse.json({ results: filtered, mode: "live" });
        }
      } catch (e) {
        console.error("[search] direct fetch fail", e);
      }
    }
    return NextResponse.json({
      results: filterByType([{
        youtubeId: directId,
        title: "Vidéo YouTube",
        movie: "YouTube",
        channel: "—",
        thumb: thumbForId(directId),
        views: 0,
        viralScore: 80,
        type: "film" as MediaType,
        direct: true,
      }], typeParam),
      mode: "fallback",
    });
  }

  if (key) {
    try {
      const live = await searchLive(q, key, typeParam);
      if (live) return NextResponse.json({ results: live, mode: "live" });
    } catch (e) {
      console.error("[search] live fail, fallback to demo", e);
    }
  }

  const demo = searchDemo(q, 16, typeParam ?? "all").map((c) => ({
    youtubeId: c.youtubeId,
    title: c.title,
    movie: c.movie,
    channel: c.channel,
    thumb: thumbForId(c.youtubeId),
    views: c.views,
    viralScore: c.viralScore,
    type: c.type,
    quote: c.quote,
  }));

  return NextResponse.json({
    results: demo,
    mode: "demo",
    hint: demo.length ? undefined : "Essaie un titre de film ou série, ou colle un lien YouTube.",
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
  searchUrl.searchParams.set("q", augmentSearchQuery(q));
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

  const results = (vr.items ?? [])
    .map((v: Parameters<typeof mapResult>[0]) => mapResult(v))
    .filter((r: ReturnType<typeof mapResult>) => isFilmOrSeries(r.title, r.channel));

  const typed = filterByType(results, typeFilter);
  return typed
    .sort((a, b) => (b as { viralScore: number }).viralScore - (a as { viralScore: number }).viralScore)
    .slice(0, 16);
}

export const dynamic = "force-dynamic";
