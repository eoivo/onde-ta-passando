import type { MetadataRoute } from "next";
import { getTrending } from "@/services/tmdb-api";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://onde-ta-passando.netlify.app";

export const revalidate = 86400; // Revalida o sitemap a cada 24h

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/filmes`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/series`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/sintonia`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/privacidade`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/termos`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const [trendingMovies, trendingTV] = await Promise.all([
      getTrending("movie", "week", 1),
      getTrending("tv", "week", 1),
    ]);

    const movieEntries: MetadataRoute.Sitemap = (trendingMovies || [])
      .slice(0, 20)
      .map((movie: any) => ({
        url: `${SITE_URL}/filme/${movie.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    const tvEntries: MetadataRoute.Sitemap = (trendingTV || [])
      .slice(0, 20)
      .map((tv: any) => ({
        url: `${SITE_URL}/serie/${tv.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    return [...staticRoutes, ...movieEntries, ...tvEntries];
  } catch {
    return staticRoutes;
  }
}
