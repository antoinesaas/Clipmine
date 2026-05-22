// Scènes films & séries 4K — IDs YouTube vérifiés (thumbnails 200 OK)

import type { MediaType } from "./film-filter";

export type DemoClip = {
  youtubeId: string;
  title: string;
  scene: string;
  movie: string;
  channel: string;
  views: number;
  viralScore: number;
  duration: string;
  type: MediaType;
  tags: string[];
  transcript: string;
  is4K?: boolean;
};

export const DEMO_CLIPS: DemoClip[] = [
  { youtubeId: "i9zjvUywVG8", title: "Inception", scene: "The Dream Collapses", movie: "Inception", channel: "Movieclips", views: 510_654, viralScore: 98, duration: "PT2M46S", type: "film", is4K: true, tags: ["inception", "dream", "4k", "scene", "nolan"], transcript: "Mal sabotages Cobb's mission." },
  { youtubeId: "P2tfZksgEy4", title: "Inception", scene: "Hallway Fight 4K", movie: "Inception", channel: "4K HDR Media", views: 495_602, viralScore: 97, duration: "PT2M48S", type: "film", is4K: true, tags: ["inception", "hallway", "4k", "fight"], transcript: "Arthur's hallway fights — sourced from 4K Blu-ray." },
  { youtubeId: "zSWdZVtXT7E", title: "Interstellar", scene: "Docking Maneuver", movie: "Interstellar", channel: "Warner Bros.", views: 38_000_000, viralScore: 97, duration: "PT2M28S", type: "film", is4K: true, tags: ["interstellar", "space", "docking", "4k"], transcript: "Do not go gentle into that good night." },
  { youtubeId: "uRJQJcy3f8w", title: "Oppenheimer", scene: "Trinity Test 4K IMAX", movie: "Oppenheimer", channel: "IMAX", views: 2_500_000, viralScore: 96, duration: "PT3M00S", type: "film", is4K: true, tags: ["oppenheimer", "4k", "imax"], transcript: "Now I am become Death, the destroyer of worlds." },
  { youtubeId: "mqqft2x_Aa4", title: "The Batman", scene: "Batmobile Chase", movie: "The Batman", channel: "Warner Bros.", views: 18_000_000, viralScore: 94, duration: "PT2M45S", type: "film", is4K: true, tags: ["batman", "dark", "4k"], transcript: "I am vengeance." },
  { youtubeId: "BEO2D_hhXDs", title: "Dune", scene: "Paul vs Baron 4K", movie: "Dune: Part Two", channel: "4K Clips", views: 1_200_000, viralScore: 95, duration: "PT2M30S", type: "film", is4K: true, tags: ["dune", "desert", "4k"], transcript: "Fear is the mind-killer." },
  { youtubeId: "cAIiF1DlFDs", title: "John Wick 4", scene: "Best Fights 4K", movie: "John Wick: Chapter 4", channel: "Action Clips", views: 3_500_000, viralScore: 93, duration: "PT3M00S", type: "film", is4K: true, tags: ["john wick", "fight", "4k"], transcript: "Yeah, I'm thinking I'm back." },
  { youtubeId: "VyHV0BRtdxo", title: "Harry Potter", scene: "Hogwarts First Day", movie: "Harry Potter", channel: "Warner Bros.", views: 12_000_000, viralScore: 91, duration: "PT2M15S", type: "film", is4K: true, tags: ["harry potter", "hogwarts", "4k"], transcript: "You're a wizard, Harry." },
  { youtubeId: "vetKTtM7YyU", title: "The Dark Knight", scene: "Bank Heist (Joker)", movie: "The Dark Knight", channel: "IMAX", views: 8_000_000, viralScore: 99, duration: "PT4M10S", type: "film", is4K: true, tags: ["dark knight", "joker", "4k"], transcript: "Why so serious?" },
  { youtubeId: "0oG5tdcFiUk", title: "Gladiator", scene: "Arena Fight", movie: "Gladiator", channel: "Epic Scenes", views: 4_000_000, viralScore: 95, duration: "PT2M30S", type: "film", is4K: true, tags: ["gladiator", "arena", "4k"], transcript: "Are you not entertained?" },
  { youtubeId: "uXGE0vuuaDo", title: "The Matrix", scene: "Neo vs Merovingian", movie: "The Matrix Reloaded", channel: "IMAX", views: 2_800_000, viralScore: 97, duration: "PT2M00S", type: "film", is4K: true, tags: ["matrix", "neo", "4k"], transcript: "I know kung fu." },

  { youtubeId: "gkyNick_VAM", title: "Breaking Bad", scene: "I Am The Danger", movie: "Breaking Bad", channel: "Rotten Tomatoes", views: 5_000_000, viralScore: 98, duration: "PT2M22S", type: "series", is4K: true, tags: ["breaking bad", "walter white"], transcript: "I am the danger. I am the one who knocks." },
  { youtubeId: "fmydmS7sxu4", title: "Game of Thrones", scene: "Dragon Scene", movie: "Game of Thrones", channel: "HBO Clips", views: 6_000_000, viralScore: 97, duration: "PT3M00S", type: "series", is4K: true, tags: ["game of thrones", "dragon"], transcript: "Dracarys." },
  { youtubeId: "b9EkMc79ZSU", title: "Stranger Things", scene: "Eleven vs Demogorgon", movie: "Stranger Things", channel: "Netflix", views: 19_000_000, viralScore: 95, duration: "PT2M50S", type: "series", is4K: true, tags: ["stranger things", "eleven"], transcript: "Friends don't lie." },
  { youtubeId: "WmVLcj-XKnM", title: "Peaky Blinders", scene: "By Order of the Peaky Blinders", movie: "Peaky Blinders", channel: "BBC", views: 24_000_000, viralScore: 96, duration: "PT2M15S", type: "series", is4K: true, tags: ["peaky blinders"], transcript: "By order of the Peaky Blinders." },
];

export const TRENDING_FILMS: [string, string][] = [
  ["Interstellar", "Interstellar movie scene 4k"],
  ["Oppenheimer", "Oppenheimer movie scene 4k"],
  ["The Batman", "The Batman movie scene 4k"],
  ["Dune", "Dune movie scene 4k"],
  ["John Wick", "John Wick 4 fight scene 4k"],
  ["Harry Potter", "Harry Potter movie scene 4k"],
];

export function thumbForId(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/** Clip court pour démos avant/après (comparateur vidéo landing + cartes features). */
export const DEMO_COMPARE_VIDEO =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
export const DEMO_COMPARE_POSTER = thumbForId("P2tfZksgEy4");

export function embedUrl(id: string) {
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
}

export type SceneGroup = {
  movie: string;
  type: MediaType;
  clips: DemoClip[];
};

export function groupByScene(clips: DemoClip[]): SceneGroup[] {
  const map = new Map<string, SceneGroup>();
  for (const clip of clips) {
    const key = clip.movie;
    if (!map.has(key)) map.set(key, { movie: clip.movie, type: clip.type, clips: [] });
    map.get(key)!.clips.push(clip);
  }
  return [...map.values()]
    .map((g) => ({
      ...g,
      clips: g.clips.sort((a, b) => b.viralScore - a.viralScore),
    }))
    .sort((a, b) => {
      const maxA = Math.max(...a.clips.map((c) => c.viralScore));
      const maxB = Math.max(...b.clips.map((c) => c.viralScore));
      return maxB - maxA;
    });
}

export function searchDemo(q: string, max = 16, typeFilter?: MediaType | "all"): DemoClip[] {
  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 1);

  const pool = typeFilter && typeFilter !== "all"
    ? DEMO_CLIPS.filter((c) => c.type === typeFilter)
    : DEMO_CLIPS;

  const scored = pool.map((clip) => {
    const hay = `${clip.title} ${clip.movie} ${clip.scene} ${clip.channel} ${clip.tags.join(" ")} ${clip.transcript}`.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (hay.includes(w)) score += 2;
      if (clip.tags.some((t) => t.includes(w) || w.includes(t))) score += 3;
      if (clip.movie.toLowerCase().includes(w)) score += 5;
      if (clip.transcript.toLowerCase().includes(w)) score += 6;
    }
    if (words.some((w) => w === "4k") && clip.is4K) score += 4;
    return { clip, score };
  });

  const matches = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  if (matches.length) return matches.slice(0, max).map((s) => s.clip);

  if (words.length === 0) return pool.slice(0, max);
  return pool
    .slice()
    .sort((a, b) => b.viralScore - a.viralScore)
    .slice(0, max);
}

export function clipsForHero(): string[] {
  return [...new Set(DEMO_CLIPS.map((c) => c.youtubeId))].map(thumbForId);
}

export function buildHeroBgRows(): string[][] {
  const thumbs = clipsForHero();
  return [0, 1, 2].map((i) => {
    const rotated = [...thumbs.slice(i), ...thumbs.slice(0, i)];
    return Array.from({ length: 14 }, (_, j) => rotated[j % rotated.length]);
  });
}

export type FeatureDemo = {
  id: string;
  youtubeId: string;
  thumb: string;
  title: string;
  subtitle: string;
  badge: string;
  note: string;
  beforeFilter: string;
  afterFilter: string;
  beforeTransform?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
};

/** Démos « En action » — une fonctionnalité ClipMine par carte, rendu 9:16 simulé */
export const FEATURE_SHOWCASE: FeatureDemo[] = [
  {
    id: "crop916",
    youtubeId: "vetKTtM7YyU",
    thumb: thumbForId("vetKTtM7YyU"),
    title: "Recadrage 9:16",
    subtitle: "Autocrop vertical pour TikTok / Reels",
    badge: "9:16",
    note: "ClipMine détecte le sujet et recadre automatiquement en vertical prêt à publier.",
    beforeFilter: "brightness(0.8) saturate(0.85)",
    afterFilter: "brightness(1.05) saturate(1.1)",
    backgroundSize: "220% auto",
    backgroundPosition: "center center",
  },
  {
    id: "upscale4k",
    youtubeId: "P2tfZksgEy4",
    thumb: thumbForId("P2tfZksgEy4"),
    title: "Upscale Starlight 4K",
    subtitle: "720p YouTube → 4K cinéma",
    badge: "4K",
    note: "Modèle Starlight : reconstruction pixel par pixel, netteté et détails restaurés.",
    beforeFilter: "blur(2px) brightness(0.82) contrast(0.9)",
    afterFilter: "contrast(1.12) saturate(1.15) brightness(1.04)",
    backgroundSize: "cover",
    backgroundPosition: "center 35%",
  },
  {
    id: "stabilize",
    youtubeId: "mqqft2x_Aa4",
    thumb: thumbForId("mqqft2x_Aa4"),
    title: "Stabilisation Themis",
    subtitle: "Compensation tremblements caméra",
    badge: "STABLE",
    note: "Themis lisse les mouvements de caméra pour un rendu gimbal pro.",
    beforeFilter: "brightness(0.9)",
    afterFilter: "brightness(1.02) contrast(1.05)",
    beforeTransform: "rotate(-1.8deg) scale(1.08)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  {
    id: "denoise",
    youtubeId: "uRJQJcy3f8w",
    thumb: thumbForId("uRJQJcy3f8w"),
    title: "Denoise Nyx",
    subtitle: "Scènes sombres sans bruit numérique",
    badge: "DENOISE",
    note: "Nyx supprime le bruit low-light tout en gardant le grain cinéma.",
    beforeFilter: "brightness(0.55) contrast(1.2) saturate(0.7)",
    afterFilter: "brightness(0.95) contrast(1.05) saturate(1.05)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  {
    id: "enhance",
    youtubeId: "zSWdZVtXT7E",
    thumb: thumbForId("zSWdZVtXT7E"),
    title: "Enhance Proteus",
    subtitle: "Netteté et détails révélés",
    badge: "ENHANCE",
    note: "Proteus corrige compression YouTube et rétablit les micro-détails.",
    beforeFilter: "blur(1px) saturate(0.75) contrast(0.88)",
    afterFilter: "saturate(1.2) contrast(1.1) brightness(1.03)",
    backgroundSize: "cover",
    backgroundPosition: "center 40%",
  },
  {
    id: "slowmo",
    youtubeId: "i9zjvUywVG8",
    thumb: thumbForId("i9zjvUywVG8"),
    title: "Slow-motion Chronos",
    subtitle: "Ralenti fluide généré par IA",
    badge: "60FPS",
    note: "Chronos étire le temps avec interpolation IA jusqu'à 120fps.",
    beforeFilter: "brightness(0.88) contrast(0.95)",
    afterFilter: "brightness(1.04) contrast(1.08) saturate(1.08)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
];
