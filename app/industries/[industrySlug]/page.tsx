import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchitectureDetailPage } from "@/components/seo-architecture-pages";
import { getIndustryPage, industryPages } from "@/lib/seo/site-architecture";

type IndustryPageProps = {
  params: Promise<{ industrySlug: string }>;
};

export function generateStaticParams() {
  return industryPages.map(({ slug }) => ({ industrySlug: slug }));
}

export async function generateMetadata({ params }: IndustryPageProps): Promise<Metadata> {
  const { industrySlug } = await params;
  const industry = getIndustryPage(industrySlug);

  if (!industry) return {};

  return {
    title: industry.title,
    description: industry.description,
    alternates: { canonical: industry.href },
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      url: industry.href,
      title: `${industry.title} | BotPager`,
      description: industry.description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${industry.name} growth systems by BotPager` }],
    },
  };
}

export default async function IndustryDetailRoute({ params }: IndustryPageProps) {
  const { industrySlug } = await params;
  const industry = getIndustryPage(industrySlug);

  if (!industry) notFound();

  return <ArchitectureDetailPage item={industry} parentLabel="Industries" parentHref="/industries" />;
}
