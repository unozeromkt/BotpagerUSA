import type { Metadata } from "next";
import { ArchitectureHubPage } from "@/components/seo-architecture-pages";
import { industryPages } from "@/lib/seo/site-architecture";

export const metadata: Metadata = {
  title: "Industries We Help",
  description: "Explore customer growth systems for home services, pressure washing, cleaning, landscaping, plumbing, HVAC, roofing, and electrical businesses.",
  alternates: { canonical: "/industries" },
  openGraph: {
    type: "website",
    url: "/industries",
    title: "Marketing Systems for Local Service Industries | BotPager",
    description: "See how BotPager connects local visibility, fast response, lead follow-up, and booking paths for service businesses.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "BotPager systems for local service industries" }],
  },
};

export default function IndustriesRoute() {
  return (
    <ArchitectureHubPage
      eyebrow="Industries"
      title="Growth Systems for Local Service Industries"
      description="Different service businesses have different customer questions, response windows, estimate workflows, and booking paths. Explore the focused architecture BotPager is building for each industry."
      sectionTitle="Choose your industry"
      sectionDescription="Each path connects the services most relevant to how customers find, evaluate, and contact that kind of local business."
      items={industryPages}
    />
  );
}
