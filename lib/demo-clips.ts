// Scènes films & séries 4K — IDs YouTube vérifiés (trailers/scènes officielles)

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
  /** Réplique / transcription affichée sur la carte */
  transcript: string;
  is4K?: boolean;
};

export const DEMO_CLIPS: DemoClip[] = [
  { youtubeId: "CPh5lJ5aZqk", title: "Inception", scene: "Dream Is Collapsing", movie: "Inception", channel: "Warner Bros.", views: 42_000_000, viralScore: 98, duration: "PT2M30S", type: "film", is4K: true, tags: ["inception", "dream", "4k", "scene", "nolan"], transcript: "You mustn't be afraid to dream a little bigger, darling." },
  { youtubeId: "zSWdZVtXT7E", title: "Interstellar", scene: "Docking Maneuver", movie: "Interstellar", channel: "Warner Bros.", views: 38_000_000, viralScore: 97, duration: "PT2M28S", type: "film", is4K: true, tags: ["interstellar", "space", "docking", "4k", "nolan"], transcript: "Do not go gentle into that good night." },
  { youtubeId: "uYPbbissJHA", title: "Oppenheimer", scene: "Trinity Test", movie: "Oppenheimer", channel: "Universal Pictures", views: 25_000_000, viralScore: 96, duration: "PT3M10S", type: "film", is4K: true, tags: ["oppenheimer", "4k", "scene", "nolan"], transcript: "Now I am become Death, the destroyer of worlds." },
  { youtubeId: "mqqft2x_Aa4", title: "The Batman", scene: "Batmobile Chase", movie: "The Batman", channel: "Warner Bros.", views: 18_000_000, viralScore: 94, duration: "PT2M45S", type: "film", is4K: true, tags: ["batman", "dark", "4k", "scene"], transcript: "I am vengeance." },
  { youtubeId: "n9xhJrPxop0", title: "Dune", scene: "Desert Power", movie: "Dune", channel: "Warner Bros.", views: 22_000_000, viralScore: 95, duration: "PT3M00S", type: "film", is4K: true, tags: ["dune", "desert", "4k", "scene"], transcript: "Fear is the mind-killer." },
  { youtubeId: "qEVUtrk8_B0", title: "John Wick 4", scene: "Arc de Triomphe Fight", movie: "John Wick: Chapter 4", channel: "Lionsgate", views: 15_000_000, viralScore: 93, duration: "PT2M20S", type: "film", is4K: true, tags: ["john wick", "fight", "4k", "action"], transcript: "Yeah, I'm thinking I'm back." },
  { youtubeId: "VyHV0BRtdxo", title: "Harry Potter", scene: "Hogwarts First Day", movie: "Harry Potter", channel: "Warner Bros.", views: 12_000_000, viralScore: 91, duration: "PT2M15S", type: "film", is4K: true, tags: ["harry potter", "hogwarts", "4k", "magic"], transcript: "You're a wizard, Harry." },
  { youtubeId: "s7EdQ4D51qc", title: "The Dark Knight", scene: "Joker Interrogation", movie: "The Dark Knight", channel: "Warner Bros.", views: 55_000_000, viralScore: 99, duration: "PT4M10S", type: "film", is4K: true, tags: ["dark knight", "joker", "batman", "4k"], transcript: "Why so serious?" },
  { youtubeId: "WzID9_3LrpU", title: "Gladiator", scene: "Are You Not Entertained", movie: "Gladiator", channel: "Universal Pictures", views: 14_000_000, viralScore: 95, duration: "PT2M05S", type: "film", is4K: true, tags: ["gladiator", "arena", "4k"], transcript: "Are you not entertained?" },
  { youtubeId: "Ty8jA6z_x00", title: "The Matrix", scene: "Bullet Time", movie: "The Matrix", channel: "Warner Bros.", views: 22_000_000, viralScore: 97, duration: "PT1M55S", type: "film", is4K: true, tags: ["matrix", "neo", "4k", "bullet time"], transcript: "I know kung fu." },

  { youtubeId: "H12aua7_h08", title: "Breaking Bad", scene: "I Am The Danger", movie: "Breaking Bad", channel: "AMC", views: 28_000_000, viralScore: 98, duration: "PT2M22S", type: "series", is4K: true, tags: ["breaking bad", "walter white", "series"], transcript: "I am the danger. I am the one who knocks." },
  { youtubeId: "KPL_WIOQv_c", title: "Game of Thrones", scene: "Battle of the Bastards", movie: "Game of Thrones", channel: "HBO", views: 35_000_000, viralScore: 97, duration: "PT4M30S", type: "series", is4K: true, tags: ["game of thrones", "battle", "series"], transcript: "Your brother was a rebel and a traitor." },
  { youtubeId: "b9EkMc79ZSU", title: "Stranger Things", scene: "Eleven vs Demogorgon", movie: "Stranger Things", channel: "Netflix", views: 19_000_000, viralScore: 95, duration: "PT2M50S", type: "series", is4K: true, tags: ["stranger things", "eleven", "series"], transcript: "Friends don't lie." },
  { youtubeId: "WmVLcj-XKnM", title: "Peaky Blinders", scene: "By Order of the Peaky Blinders", movie: "Peaky Blinders", channel: "BBC", views: 24_000_000, viralScore: 96, duration: "PT2M15S", type: "series", is4K: true, tags: ["peaky blinders", "tommy shelby", "series"], transcript: "By order of the Peaky Blinders." },
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

export type SceneGroup = {
  movie: string;
  type: MediaType;
  clips: DemoClip[];
};

/** Tri par film puis par score (meilleures scènes en premier). */
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
