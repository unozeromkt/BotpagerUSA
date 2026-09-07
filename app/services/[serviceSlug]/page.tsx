import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailPage } from "@/components/seo-architecture-pages";
import { getServicePage, servicePages } from "@/lib/seo/site-architecture";

type ServicePageProps = {
  params: Promise<{ serviceSlug: string }>;
};

export function generateStaticParams() {
  return servicePages.map(({ slug }) => ({ serviceSlug: slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { serviceSlug } = await params;
  const service = getServicePage(serviceSlug);

  if (!service) return {};

  return {
    title: service.seoTitle,
    description: service.description,
    alternates: { canonical: service.href },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      type: "website",
      url: service.href,
      title: `${service.seoTitle} | BotPager`,
      description: service.description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${service.name} by BotPager` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.seoTitle} | BotPager`,
      description: service.description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function ServiceDetailRoute({ params }: ServicePageProps) {
  const { serviceSlug } = await params;
  const service = getServicePage(serviceSlug);

  if (!service) notFound();

  const url = `https://botpager.com${service.href}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://botpager.com" },
          { "@type": "ListItem", position: 2, name: "Services", item: "https://botpager.com/services" },
          { "@type": "ListItem", position: 3, name: service.name, item: url },
        ],
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: service.seoTitle,
        url,
        description: service.description,
        serviceType: service.name,
        provider: { "@type": "Organization", "@id": "https://botpager.com/#organization", name: "BotPager", url: "https://botpager.com" },
        areaServed: { "@type": "Country", name: "United States" },
        audience: { "@type": "BusinessAudience", audienceType: "Local service businesses" },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: service.faqs.map((faq) => ({
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
      <ServiceDetailPage service={service} />
    </>
  );
}
