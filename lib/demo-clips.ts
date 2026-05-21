// Clips YouTube réels pour le mode démo (utilisés quand YOUTUBE_API_KEY est absent
// ou pour la landing page). Les thumbnails sont servies depuis i.ytimg.com.

export type DemoClip = {
  youtubeId: string;
  title: string;
  channel: string;
  views: number;
  viralScore: number;
  duration: string;
  category: string;
};

export const DEMO_CLIPS: DemoClip[] = [
  { youtubeId: "kJQP7kiw5Fk", title: "Luis Fonsi - Despacito ft. Daddy Yankee", channel: "Luis Fonsi", views: 8_400_000_000, viralScore: 98, duration: "PT4M42S", category: "music" },
  { youtubeId: "JGwWNGJdvx8", title: "Ed Sheeran - Shape of You (Official Music Video)", channel: "Ed Sheeran", views: 6_500_000_000, viralScore: 97, duration: "PT4M24S", category: "music" },
  { youtubeId: "RgKAFK5djSk", title: "Wiz Khalifa - See You Again ft. Charlie Puth", channel: "Wiz Khalifa", views: 6_600_000_000, viralScore: 96, duration: "PT4M58S", category: "music" },
  { youtubeId: "OPf0YbXqDm0", title: "Mark Ronson - Uptown Funk ft. Bruno Mars", channel: "Mark Ronson", views: 5_400_000_000, viralScore: 95, duration: "PT4M31S", category: "music" },
  { youtubeId: "9bZkp7q19f0", title: "PSY - GANGNAM STYLE (강남스타일)", channel: "officialpsy", views: 5_300_000_000, viralScore: 94, duration: "PT4M13S", category: "music" },
  { youtubeId: "CevxZvSJLk8", title: "Katy Perry - Roar (Official)", channel: "Katy Perry", views: 4_300_000_000, viralScore: 92, duration: "PT4M30S", category: "music" },
  { youtubeId: "hT_nvWreIhg", title: "OneRepublic - Counting Stars (Official Music Video)", channel: "OneRepublic", views: 4_700_000_000, viralScore: 91, duration: "PT4M44S", category: "music" },
  { youtubeId: "nfWlot6h_JM", title: "Taylor Swift - Shake It Off", channel: "Taylor Swift", views: 3_700_000_000, viralScore: 90, duration: "PT4M02S", category: "music" },
  { youtubeId: "YQHsXMglC9A", title: "Adele - Hello (Official Music Video)", channel: "Adele", views: 3_500_000_000, viralScore: 89, duration: "PT6M07S", category: "music" },
  { youtubeId: "fLexgOxsZu0", title: "Bruno Mars - The Lazy Song (Official Music Video)", channel: "Bruno Mars", views: 2_400_000_000, viralScore: 87, duration: "PT3M24S", category: "music" },
  { youtubeId: "60ItHLz5WEA", title: "Alan Walker - Faded", channel: "Alan Walker", views: 4_100_000_000, viralScore: 93, duration: "PT3M32S", category: "music" },
  { youtubeId: "lp-EO5I60KA", title: "Ed Sheeran - Thinking Out Loud", channel: "Ed Sheeran", views: 3_900_000_000, viralScore: 88, duration: "PT4M58S", category: "music" },
];

export function thumbForId(id: string) {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

// Petite recherche locale fuzzy par mot-clé sur les démos
export function searchDemo(q: string, max = 12) {
  const term = q.toLowerCase();
  const scored = DEMO_CLIPS.map((c) => {
    const txt = `${c.title} ${c.channel} ${c.category}`.toLowerCase();
    const hit = txt.includes(term) ? 1 : 0;
    return { ...c, _hit: hit };
  });
  const matches = scored.filter((c) => c._hit > 0);
  const list = matches.length ? matches : scored;
  return list.slice(0, max).map(({ _hit, ...c }) => c);
}
