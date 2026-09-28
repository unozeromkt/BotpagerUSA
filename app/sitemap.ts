import type { MetadataRoute } from "next";
import { industryPages, servicePages } from "@/lib/seo/site-architecture";
import { englishEquivalentByLatamSlug, latamServices } from "@/lib/latam/services";

const spanishEquivalentByEnglishHref = Object.fromEntries(
  Object.entries(englishEquivalentByLatamSlug).map(([slug, href]) => [href, `/es/${slug}/`]),
);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://botpager.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          "en-US": "https://botpager.com",
          es: "https://botpager.com/es/",
        },
      },
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
      alternates: {
        languages: {
          "en-US": "https://botpager.com/local-seo-ai-search-optimization",
          es: "https://botpager.com/es/seo-geo/",
        },
      },
    },
    {
      url: "https://botpager.com/visibility-audit",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://botpager.com/free-growth-audit",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    ...servicePages.map(({ href }) => ({
      url: `https://botpager.com${href}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.85,
      ...(spanishEquivalentByEnglishHref[href]
        ? {
            alternates: {
              languages: {
                "en-US": `https://botpager.com${href}`,
                es: `https://botpager.com${spanishEquivalentByEnglishHref[href]}`,
              },
            },
          }
        : {}),
    })),
    {
      url: "https://botpager.com/industries",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...industryPages.map(({ href }) => ({
      url: `https://botpager.com${href}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: "https://botpager.com/resources",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
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
    {
      url: "https://botpager.com/es/",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.95,
      alternates: {
        languages: {
          "en-US": "https://botpager.com",
          es: "https://botpager.com/es/",
        },
      },
    },
    ...latamServices.map(({ slug }) => ({
      url: `https://botpager.com/es/${slug}/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.85,
      alternates: {
        languages: {
          "en-US": `https://botpager.com${englishEquivalentByLatamSlug[slug]}`,
          es: `https://botpager.com/es/${slug}/`,
        },
      },
    })),
  ];
}
