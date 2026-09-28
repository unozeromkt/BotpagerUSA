import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LatamServicePage } from "@/components/latam-pages";
import { englishEquivalentByLatamSlug, getLatamService, latamServices } from "@/lib/latam/services";

type LatamServicePageProps = {
  params: Promise<{ serviceSlug: string }>;
};

export function generateStaticParams() {
  return latamServices.map(({ slug }) => ({ serviceSlug: slug }));
}

export async function generateMetadata({ params }: LatamServicePageProps): Promise<Metadata> {
  const { serviceSlug } = await params;
  const service = getLatamService(serviceSlug);
  if (!service) return {};

  const canonical = `/es/${service.slug}/`;
  return {
    title: { absolute: `${service.seoTitle} | BotPager` },
    description: service.seoDescription,
    keywords: service.keywords,
    alternates: {
      canonical,
      languages: { "en-US": englishEquivalentByLatamSlug[service.slug], es: canonical },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      type: "website",
      locale: "es_419",
      url: canonical,
      siteName: "BotPager",
      title: `${service.seoTitle} | BotPager`,
      description: service.seoDescription,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${service.name} de BotPager para Latinoamérica` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.seoTitle} | BotPager`,
      description: service.seoDescription,
      images: ["/opengraph-image"],
    },
  };
}

export default async function LatamServiceRoute({ params }: LatamServicePageProps) {
  const { serviceSlug } = await params;
  const service = getLatamService(serviceSlug);
  if (!service) notFound();

  const url = `https://botpager.com/es/${service.slug}/`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: service.seoTitle,
        description: service.seoDescription,
        inLanguage: "es-419",
        isPartOf: { "@id": "https://botpager.com/#website" },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: "https://botpager.com/es/" },
          { "@type": "ListItem", position: 2, name: "Soluciones", item: "https://botpager.com/es/#soluciones" },
          { "@type": "ListItem", position: 3, name: service.name, item: url },
        ],
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: service.seoTitle,
        description: service.seoDescription,
        serviceType: service.name,
        url,
        provider: { "@type": "Organization", "@id": "https://botpager.com/#organization", name: "BotPager", url: "https://botpager.com" },
        areaServed: "Latin America",
        audience: { "@type": "BusinessAudience", audienceType: "Empresas, PYMES y organizaciones de Latinoamérica" },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <LatamServicePage service={service} />
    </>
  );
}
