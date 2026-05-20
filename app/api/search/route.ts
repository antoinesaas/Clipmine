import { NextRequest, NextResponse } from "next/server";

// Extrait l'ID YouTube depuis une URL ou un texte brut
function extractYoutubeId(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // ID brut
  ];
  for (const re of patterns) {
    const m = input.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

// GET /api/search?q=...
// Si q est une URL YouTube -> retourne directement cette vidéo
// Sinon -> scanne YouTube via Data API v3 et calcule un score de viralité
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "missing_query" }, { status: 400 });

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "config_error", message: "YOUTUBE_API_KEY non configurée. Ajoute-la dans les variables d'environnement Vercel." },
      { status: 503 }
    );
  }

  // Détecte si l'input est un lien/ID YouTube direct
  const directId = extractYoutubeId(q);

  if (directId) {
    // Fetch direct de la vidéo
    const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    videosUrl.searchParams.set("part", "snippet,statistics,contentDetails");
    videosUrl.searchParams.set("id", directId);
    videosUrl.searchParams.set("key", key);

    const vr = await fetch(videosUrl).then((r) => r.json());
    if (!vr.items?.length) {
      return NextResponse.json({ error: "not_found", message: "Vidéo introuvable ou privée." }, { status: 404 });
    }

    const v = vr.items[0];
    const views = Number(v.statistics?.viewCount ?? 0);
    const ageDays = Math.max(1, (Date.now() - new Date(v.snippet.publishedAt).getTime()) / 864e5);
    const viralRaw = views / ageDays;
    const score = Math.min(100, Math.round(Math.log10(viralRaw + 1) * 14));

    return NextResponse.json({
      results: [{
        youtubeId: v.id,
        title: v.snippet.title,
        channel: v.snippet.channelTitle,
        thumb: v.snippet.thumbnails?.maxres?.url ?? v.snippet.thumbnails?.high?.url,
        views,
        duration: v.contentDetails?.duration,
        viralScore: score,
        direct: true,
      }],
    });
  }

  // Recherche classique
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", q);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("maxResults", "24");
  searchUrl.searchParams.set("videoDefinition", "high");
  searchUrl.searchParams.set("order", "relevance");
  searchUrl.searchParams.set("key", key);

  const sr = await fetch(searchUrl).then((r) => r.json());

  if (sr.error) {
    return NextResponse.json(
      { error: "youtube_api_error", message: sr.error.message },
      { status: 502 }
    );
  }

  const ids: string[] = (sr.items ?? []).map((i: any) => i.id.videoId).filter(Boolean);
  if (!ids.length) return NextResponse.json({ results: [] });

  const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  videosUrl.searchParams.set("part", "snippet,statistics,contentDetails");
  videosUrl.searchParams.set("id", ids.join(","));
  videosUrl.searchParams.set("key", key);

  const vr = await fetch(videosUrl).then((r) => r.json());

  const results = (vr.items ?? []).map((v: any) => {
    const views = Number(v.statistics?.viewCount ?? 0);
    const ageDays = Math.max(1, (Date.now() - new Date(v.snippet.publishedAt).getTime()) / 864e5);
    const viralRaw = views / ageDays;
    const score = Math.min(100, Math.round(Math.log10(viralRaw + 1) * 14));
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

  results.sort((a: any, b: any) => b.viralScore - a.viralScore);
  return NextResponse.json({ results });
}
