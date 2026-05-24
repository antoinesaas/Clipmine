import { NextRequest, NextResponse } from "next/server";
import { searchDemo, thumbForId, groupByScene } from "@/lib/demo-clips";
import {
  augmentSearchQuery,
  inferMediaType,
  isUsableClip,
  isArtistQuery,
  isFilmTitleQuery,
  filmSearchQueries,
  extractMovieTitle,
  parseDurationSeconds,
} from "@/lib/film-filter";
import type { MediaType } from "@/lib/film-filter";
import { sortByRelevance } from "@/lib/search-relevance";
import { normalizeSearchQuery } from "@/lib/normalize-search-query";
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

function finalizeResults(results: SearchResult[], q: string, sort: string, rankQuery?: string): SearchResult[] {
  const filmSearch = isFilmTitleQuery(q);
  const ranked = sortByRelevance(results, rankQuery ?? q, filmSearch);
  if (sort === "popular") {
    return ranked.sort((a, b) => b.views - a.views);
  }
  return ranked;
}

export async function GET(req: NextRequest) {
  const rawQ = req.nextUrl.searchParams.get("q")?.trim();
  if (!rawQ) return NextResponse.json({ error: "missing_query" }, { status: 400 });

  const { userInput, apiQuery } = normalizeSearchQuery(rawQ);
  const q = apiQuery || rawQ;
  const typeParam = req.nextUrl.searchParams.get("type") as MediaType | "all" | null;
  const sort = req.nextUrl.searchParams.get("sort") ?? "scene";

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
      const live = await searchLive(q, key, typeParam, userInput || q);
      if (live?.length) {
        const sorted = finalizeResults(live, q, sort, userInput || q);
        return NextResponse.json({
          results: sorted.slice(0, 16),
          mode: "live",
          sort,
          queryUsed: q,
          queryInput: userInput,
        });
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

  const results = finalizeResults(demo, q, sort, userInput || q);
  const groups = groupByScene(demoClips);

  return NextResponse.json({
    results: results.slice(0, 16),
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
    hint: demo.length
      ? undefined
      : isArtistQuery(q)
        ? "Aucun clip trouvé. Essaie un autre artiste ou colle un lien YouTube direct."
        : "Essaie un titre de film, une réplique, ou colle un lien YouTube.",
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

async function searchLiveOnce(
  searchQ: string,
  key: string,
  opts: {
    artist: boolean;
    filmSearch?: boolean;
    searchQ?: string;
    typeFilter?: MediaType | "all" | null;
    videoDuration?: "medium" | "long" | "short";
  },
) {
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", searchQ);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("maxResults", "25");
  searchUrl.searchParams.set("videoDefinition", "high");
  if (!opts.artist && !opts.filmSearch) {
    searchUrl.searchParams.set("videoCategoryId", "1");
  }
  if (opts.filmSearch && opts.videoDuration) {
    searchUrl.searchParams.set("videoDuration", opts.videoDuration);
  }
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

  type Mapped = ReturnType<typeof mapResult> & { duration?: string };
  const mapped = (vr.items ?? []).map((v: Parameters<typeof mapResult>[0]) => {
    const r = mapResult(v);
    const durationSec = parseDurationSeconds(v.contentDetails?.duration);
    return { r, durationSec };
  });

  return mapped
    .filter((row: { r: Mapped; durationSec: number | null }) =>
      isUsableClip(row.r.title, row.r.channel, row.durationSec, {
        allowArtist: opts.artist,
        filmSearch: opts.filmSearch,
        query: opts.searchQ,
      }),
    )
    .map((row: { r: Mapped }) => row.r);
}

function demoToResults(q: string, typeFilter?: MediaType | "all" | null): SearchResult[] {
  return searchDemo(q, 12, typeFilter ?? "all").map((c) => ({
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
}

async function searchLive(q: string, key: string, typeFilter?: MediaType | "all" | null, rankQuery?: string) {
  const core = (rankQuery ?? q).trim();
  const artist = isArtistQuery(core);
  const filmSearch = isFilmTitleQuery(core);
  const queries = artist
    ? [
        augmentSearchQuery(core),
        `${core} official music video`,
        `${core} vevo 4k`,
      ]
    : filmSearch
      ? filmSearchQueries(q)
      : [`${q.trim()} scene pack clips for edits`, `${q.trim()} movie scene 4k`];

  const seen = new Set<string>();
  const merged: SearchResult[] = [];

  const durations: Array<"medium" | "long" | "short" | undefined> = filmSearch
    ? ["medium", "long", "short"]
    : [undefined];

  for (const searchQ of queries) {
    for (const dur of durations) {
      const batch = await searchLiveOnce(searchQ, key, {
        artist,
        filmSearch,
        searchQ: rankQuery ?? q,
        typeFilter,
        videoDuration: dur,
      });
      if (!batch) continue;
      for (const r of batch) {
        if (seen.has(r.youtubeId)) continue;
        seen.add(r.youtubeId);
        merged.push(r);
      }
      if (merged.length >= 28) break;
    }
    if (merged.length >= 28) break;
  }

  if (merged.length === 0) {
    for (const d of demoToResults(q, typeFilter)) {
      if (seen.has(d.youtubeId)) continue;
      seen.add(d.youtubeId);
      merged.push(d);
    }
  }

  const results: SearchResult[] = await Promise.all(
    merged.slice(0, 20).map(async (r) => {
      const transcript = await fetchTranscriptSnippet(r.youtubeId);
      return { ...r, transcript: transcript ?? r.transcript };
    }),
  );

  return filterByType(results, artist ? "all" : typeFilter);
}

export const dynamic = "force-dynamic";
