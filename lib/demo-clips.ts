// Scènes films & séries — mode démo sans YOUTUBE_API_KEY (inspiré Clip.Cafe)

import type { MediaType } from "./film-filter";
import { inferMediaType, extractMovieTitle } from "./film-filter";

export type DemoClip = {
  youtubeId: string;
  title: string;
  movie: string;
  channel: string;
  views: number;
  viralScore: number;
  duration: string;
  type: MediaType;
  tags: string[];
  quote?: string;
};

export const DEMO_CLIPS: DemoClip[] = [
  // --- FILMS ---
  { youtubeId: "YoHD9XEInc0", title: "Inception — Dream Is Collapsing", movie: "Inception", channel: "Warner Bros.", views: 42_000_000, viralScore: 98, duration: "PT2M30S", type: "film", tags: ["inception", "dream", "film", "movie", "scene", "nolan", "4k"], quote: "You mustn't be afraid to dream a little bigger, darling." },
  { youtubeId: "zSWdZVtXT7E", title: "Interstellar — Docking Scene", movie: "Interstellar", channel: "Warner Bros.", views: 38_000_000, viralScore: 97, duration: "PT3M45S", type: "film", tags: ["interstellar", "space", "film", "movie", "scene", "nolan"], quote: "Do not go gentle into that good night." },
  { youtubeId: "EXeTwQWrcwY", title: "Fight Club — Chemical Burn", movie: "Fight Club", channel: "20th Century Fox", views: 12_000_000, viralScore: 94, duration: "PT2M12S", type: "film", tags: ["fight club", "film", "movie", "scene", "brad pitt"], quote: "The first rule of Fight Club is..." },
  { youtubeId: "s7EdQ4D51qc", title: "The Dark Knight — Joker Interrogation", movie: "The Dark Knight", channel: "Warner Bros.", views: 55_000_000, viralScore: 99, duration: "PT4M10S", type: "film", tags: ["dark knight", "joker", "batman", "film", "movie", "scene"], quote: "Why so serious?" },
  { youtubeId: "tGpTpVyI_OQ", title: "Pulp Fiction — Say What Again", movie: "Pulp Fiction", channel: "Miramax", views: 18_000_000, viralScore: 96, duration: "PT2M48S", type: "film", tags: ["pulp fiction", "tarantino", "film", "movie", "scene"], quote: "Say 'what' again. Say 'what' again!" },
  { youtubeId: "6hB3S9bIaco", title: "The Shawshank Redemption — Hope", movie: "The Shawshank Redemption", channel: "Warner Bros.", views: 8_500_000, viralScore: 93, duration: "PT3M20S", type: "film", tags: ["shawshank", "film", "movie", "scene", "hope"], quote: "Get busy living, or get busy dying." },
  { youtubeId: "WzID9_3LrpU", title: "Gladiator — Are You Not Entertained", movie: "Gladiator", channel: "Universal Pictures", views: 14_000_000, viralScore: 95, duration: "PT2M05S", type: "film", tags: ["gladiator", "film", "movie", "scene", "russell crowe"], quote: "Are you not entertained?" },
  { youtubeId: "Ty8jA6z_x00", title: "The Matrix — Bullet Time", movie: "The Matrix", channel: "Warner Bros.", views: 22_000_000, viralScore: 97, duration: "PT1M55S", type: "film", tags: ["matrix", "neo", "film", "movie", "scene", "bullet time"], quote: "I know kung fu." },
  { youtubeId: "eOrNdBpGvMI", title: "Whiplash — Not My Tempo", movie: "Whiplash", channel: "Sony Pictures", views: 9_200_000, viralScore: 92, duration: "PT2M40S", type: "film", tags: ["whiplash", "film", "movie", "scene", "drums"], quote: "Not my tempo." },
  { youtubeId: "iszwqXFXkXI", title: "The Wolf of Wall Street — Sales Speech", movie: "The Wolf of Wall Street", channel: "Paramount", views: 16_000_000, viralScore: 94, duration: "PT3M10S", type: "film", tags: ["wolf of wall street", "film", "movie", "scene", "motivation"], quote: "Sell me this pen." },

  // --- SÉRIES ---
  { youtubeId: "H12aua7_h08", title: "Breaking Bad — I Am The Danger", movie: "Breaking Bad", channel: "AMC", views: 28_000_000, viralScore: 98, duration: "PT2M22S", type: "series", tags: ["breaking bad", "walter white", "series", "scene", "heisenberg"], quote: "I am the danger." },
  { youtubeId: "KPL_WIOQv_c", title: "Game of Thrones — Battle of the Bastards", movie: "Game of Thrones", channel: "HBO", views: 35_000_000, viralScore: 97, duration: "PT4M30S", type: "series", tags: ["game of thrones", "got", "series", "scene", "battle"], quote: "Your brother was a rebel and a traitor." },
  { youtubeId: "b9EkMc79ZSU", title: "Stranger Things — Eleven vs Demogorgon", movie: "Stranger Things", channel: "Netflix", views: 19_000_000, viralScore: 95, duration: "PT2M50S", type: "series", tags: ["stranger things", "eleven", "series", "scene", "netflix"], quote: "Friends don't lie." },
  { youtubeId: "X0b46-VOF08", title: "The Office — That's What She Said", movie: "The Office", channel: "NBC", views: 11_000_000, viralScore: 91, duration: "PT1M30S", type: "series", tags: ["the office", "michael scott", "series", "scene", "comedy"], quote: "That's what she said." },
  { youtubeId: "WmVLcj-XKnM", title: "Peaky Blinders — By Order of the Peaky Blinders", movie: "Peaky Blinders", channel: "BBC", views: 24_000_000, viralScore: 96, duration: "PT2M15S", type: "series", tags: ["peaky blinders", "tommy shelby", "series", "scene"], quote: "By order of the Peaky Blinders." },
  { youtubeId: "OAfxs0IDeMs", title: "Succession — Logan Roy Speech", movie: "Succession", channel: "HBO", views: 4_800_000, viralScore: 89, duration: "PT2M00S", type: "series", tags: ["succession", "logan roy", "series", "scene", "hbo"], quote: "You can't make a Tomlette without breaking some Gregs." },
];

export function thumbForId(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function searchDemo(q: string, max = 16, typeFilter?: MediaType | "all"): DemoClip[] {
  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 1);

  const pool = typeFilter && typeFilter !== "all"
    ? DEMO_CLIPS.filter((c) => c.type === typeFilter)
    : DEMO_CLIPS;

  const scored = pool.map((clip) => {
    const hay = `${clip.title} ${clip.movie} ${clip.channel} ${clip.tags.join(" ")} ${clip.quote ?? ""}`.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (hay.includes(w)) score += 2;
      if (clip.tags.some((t) => t.includes(w) || w.includes(t))) score += 3;
      if (clip.movie.toLowerCase().includes(w)) score += 5;
    }
    return { clip, score };
  });

  const matches = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  if (matches.length) return matches.slice(0, max).map((s) => s.clip);

  if (words.length === 0) return pool.slice(0, max);
  return [];
}

export function clipsForHero(): string[] {
  return DEMO_CLIPS.map((c) => thumbForId(c.youtubeId));
}

export { inferMediaType, extractMovieTitle };
