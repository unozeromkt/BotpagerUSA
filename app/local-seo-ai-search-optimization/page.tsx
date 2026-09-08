import type { Metadata } from "next";
import { SeoGeoLanding } from "@/components/seo-geo-landing";

const pageUrl = "https://botpager.com/local-seo-ai-search-optimization";

const faqs = [
  {
    question: "What is Local SEO?",
    answer:
      "Local SEO is the process of improving how prominently your business appears when people search for services in your geographic area, including Google Search and Google Maps.",
  },
  {
    question: "What is GEO?",
    answer:
      "GEO stands for Generative Engine Optimization. It is a term used for work focused on improving visibility in AI-powered search and generative answers.",
  },
  {
    question: "Is GEO different from SEO?",
    answer:
      "Not completely. Strong technical SEO, useful content, clear business information and authority remain the foundation. GEO focuses additional attention on how easily AI-powered systems can understand and reference that information.",
  },
  {
    question: "Can BotPager guarantee that ChatGPT or Google will recommend my business?",
    answer:
      "No legitimate provider can guarantee rankings, citations or recommendations from a search engine or AI system. BotPager improves the measurable signals and technical foundation that support discoverability.",
  },
  {
    question: "Can you improve my Google Business Profile?",
    answer:
      "Yes. Local visibility can include Google Business Profile optimization, service relevance, business information consistency, reviews and local content strategy.",
  },
  {
    question: "How do I know if my business needs SEO or AI search optimization?",
    answer:
      "Start with the free BotPager Visibility Audit. It identifies weaknesses in search visibility, local presence, reputation, AI readiness and conversion readiness.",
  },
];

export const metadata: Metadata = {
  title: { absolute: "Local SEO & AI Search Optimization (GEO) | BotPager" },
  description:
    "Improve your visibility across Google Search, Google Maps and AI-powered search. BotPager helps local businesses strengthen SEO, local authority and AI search readiness.",
  keywords: [
    "local SEO services",
    "AI search optimization",
    "generative engine optimization",
    "GEO services",
    "local search optimization",
    "Google Maps SEO",
    "AI visibility",
    "ChatGPT search visibility",
    "SEO for local businesses",
  ],
  alternates: { canonical: "/local-seo-ai-search-optimization" },
  openGraph: {
    type: "website",
    url: "/local-seo-ai-search-optimization",
    title: "Get Found on Google, Maps & AI Search | BotPager",
    description:
      "One visibility strategy for Google Search, Google Maps and AI-powered discovery.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "BotPager Local SEO and AI search visibility",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Found on Google, Maps & AI Search | BotPager",
    description:
      "Strengthen your local search presence and prepare your business for AI-powered discovery.",
    images: ["/opengraph-image"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "Local SEO & AI Search Optimization (GEO)",
      description:
        "Local SEO and AI search visibility services for local businesses in the United States.",
      isPartOf: { "@id": "https://botpager.com/#website" },
      about: { "@id": `${pageUrl}#service` },
      inLanguage: "en-US",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://botpager.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Local SEO & AI Search Optimization",
          item: pageUrl,
        },
      ],
    },
    {
      "@type": "Service",
      "@id": `${pageUrl}#service`,
      name: "Local SEO & AI Search Optimization",
      serviceType: "Local SEO services and Generative Engine Optimization",
      url: pageUrl,
      provider: {
        "@type": "Organization",
        "@id": "https://botpager.com/#organization",
        name: "BotPager",
        url: "https://botpager.com",
      },
      areaServed: { "@type": "Country", name: "United States" },
      audience: {
        "@type": "BusinessAudience",
        audienceType: "Local service businesses",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: faqs.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

export default function LocalSeoAiSearchOptimizationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <SeoGeoLanding faqs={faqs} />
    </>
  );
}
