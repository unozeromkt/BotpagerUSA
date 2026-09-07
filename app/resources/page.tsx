import type { Metadata } from "next";
import { ResourceHubPage } from "@/components/seo-architecture-pages";
import { resourceTopics } from "@/lib/seo/site-architecture";

export const metadata: Metadata = {
  title: "Local Business Marketing Resources",
  description: "Practical guidance on local search, lead response, website conversion, AI receptionists, automated follow-up, and local advertising.",
  alternates: { canonical: "/resources" },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    url: "/resources",
    title: "Local Business Marketing Resources | BotPager",
    description: "Practical guidance for local service businesses that want to get found, respond faster, and convert more inquiries.",
  },
};

export default function ResourcesRoute() {
  return <ResourceHubPage topics={resourceTopics} />;
}
