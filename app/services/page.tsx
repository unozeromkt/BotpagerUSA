import type { Metadata } from "next";
import { ServicesPage } from "@/components/landing-page";

export const metadata: Metadata = {
  title: "Services & Solutions",
  description: "Explore BotPager Smart Websites, multichannel AI agents, CRM automations, and local SEO and GEO services for local service businesses.",
  alternates: { canonical: "/services" },
  openGraph: {
    type: "website",
    url: "/services",
    title: "Services & Solutions | BotPager",
    description: "Four connected services that help local businesses get found, respond faster, follow up, and convert more customers.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "BotPager services and solutions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services & Solutions | BotPager",
    description: "Smart Websites, multichannel AI, CRM automations, and local SEO and GEO—connected as one growth system.",
    images: ["/opengraph-image"],
  },
};

const servicesStructuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "BotPager Services & Solutions",
  url: "https://botpager.com/services",
  itemListElement: [
    ["Smart Websites", "smart-websites"],
    ["Multichannel AI Agent", "multichannel-ai-agent"],
    ["CRM & Automations", "crm-automations"],
    ["Local SEO & Local GEO", "local-seo-geo"],
  ].map(([name, slug], index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Service",
      name,
      url: `https://botpager.com/services#${slug}`,
      provider: { "@type": "Organization", name: "BotPager", url: "https://botpager.com" },
      areaServed: "North America",
    },
  })),
};

export default function ServicesRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesStructuredData).replace(/</g, "\\u003c") }} />
      <ServicesPage />
    </>
  );
}
