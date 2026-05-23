import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.clipmine.fr";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/upscale`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/cgu`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
