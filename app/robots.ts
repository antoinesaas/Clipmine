import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/app/"] },
    ],
    sitemap: "https://clipmine.fr/sitemap.xml",
    host: "https://clipmine.fr",
  };
}
