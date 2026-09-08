import type { MetadataRoute } from "next";
import { publishedIndustryPages, servicePages } from "@/lib/seo/site-architecture";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://botpager.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://botpager.com/services",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://botpager.com/local-seo-ai-search-optimization",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://botpager.com/visibility-audit",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...servicePages.map(({ href }) => ({
      url: `https://botpager.com${href}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    {
      url: "https://botpager.com/industries",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...publishedIndustryPages.map(({ href }) => ({
      url: `https://botpager.com${href}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: "https://botpager.com/about",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: "https://botpager.com/growth-game",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://botpager.com/terms",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://botpager.com/privacy",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
