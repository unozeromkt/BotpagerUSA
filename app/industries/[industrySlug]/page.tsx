import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchitectureDetailPage, IndustryDetailPage } from "@/components/seo-architecture-pages";
import { getIndustryPage, getPublishedIndustryPage, industryPages } from "@/lib/seo/site-architecture";

type IndustryPageProps = {
  params: Promise<{ industrySlug: string }>;
};

export function generateStaticParams() {
  return industryPages.map(({ slug }) => ({ industrySlug: slug }));
}

export async function generateMetadata({ params }: IndustryPageProps): Promise<Metadata> {
  const { industrySlug } = await params;
  const industry = getIndustryPage(industrySlug);
  const publishedIndustry = getPublishedIndustryPage(industrySlug);

  if (!industry) return {};

  const seoTitle = publishedIndustry?.seoTitle ?? industry.title;
  const description = publishedIndustry?.description ?? industry.description;
  const isIndexable = Boolean(publishedIndustry);

  return {
    title: seoTitle,
    description,
    alternates: { canonical: industry.href },
    robots: {
      index: isIndexable,
      follow: true,
      googleBot: { index: isIndexable, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      type: "website",
      url: industry.href,
      title: `${seoTitle} | BotPager`,
      description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${industry.name} growth systems by BotPager` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${seoTitle} | BotPager`,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function IndustryDetailRoute({ params }: IndustryPageProps) {
  const { industrySlug } = await params;
  const industry = getIndustryPage(industrySlug);

  if (!industry) notFound();

  const publishedIndustry = getPublishedIndustryPage(industrySlug);

  if (!publishedIndustry) {
    return <ArchitectureDetailPage item={industry} parentLabel="Industries" parentHref="/industries" />;
  }

  const url = `https://botpager.com${publishedIndustry.href}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://botpager.com" },
          { "@type": "ListItem", position: 2, name: "Industries", item: "https://botpager.com/industries" },
          { "@type": "ListItem", position: 3, name: publishedIndustry.name, item: url },
        ],
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: publishedIndustry.seoTitle,
        url,
        description: publishedIndustry.description,
        serviceType: "Digital marketing systems for plumbing companies",
        provider: { "@type": "Organization", "@id": "https://botpager.com/#organization", name: "BotPager", url: "https://botpager.com" },
        areaServed: { "@type": "Country", name: "United States" },
        audience: { "@type": "BusinessAudience", audienceType: "Plumbing companies" },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: publishedIndustry.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <IndustryDetailPage industry={publishedIndustry} />
    </>
  );
}
