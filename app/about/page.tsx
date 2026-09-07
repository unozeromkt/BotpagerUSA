import type { Metadata } from "next";
import { AboutBotPagerPage } from "@/components/seo-architecture-pages";

export const metadata: Metadata = {
  title: "About Our Local Business Growth System",
  description: "Learn how BotPager helps local service businesses connect websites, AI response, CRM automation, local visibility, and paid acquisition.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: "/about",
    title: "About BotPager | Local Business Growth Systems",
    description: "BotPager helps local service businesses get found, respond faster, follow up automatically, and turn more opportunities into customers.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "About BotPager" }],
  },
};

export default function AboutRoute() {
  return <AboutBotPagerPage />;
}
