import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

const faqData: [string, string][] = [
  ["How quickly can you set everything up?", "Most BotPager systems can be designed, configured, and launched in 10–14 business days once we have your brand details and service information."],
  ["Can the website be customized for my brand?", "Yes. Your website is tailored to your logo, colors, services, service area, voice, and conversion goals."],
  ["Do you run ads for my business?", "Our Growth plan includes optional Meta and Google Ads management, with campaigns connected directly to your lead pipeline."],
  ["Do you integrate with other tools?", "BotPager can connect with common calendars, customer management tools, email tools, phone systems, and automation platforms based on your workflow."],
  ["Can I see everything in one dashboard?", "Yes. Customer inquiries, conversations, booked jobs, follow-ups, and revenue indicators are organized in one real-time dashboard."],
  ["Is there a long-term contract?", "Plans are designed to grow with your business. We will review the current service terms with you before your system is activated."],
  ["How does the AI assistant work?", "The AI assistant answers common questions, collects contact details, and helps potential customers request a quote any time of day."],
  ["What kind of results can I expect?", "Results vary by market and offer, but the system is built to help you respond faster, follow up consistently, and turn more inquiries into customers."],
];

export const metadata: Metadata = {
  title: { absolute: "Local Business Marketing & AI Growth System | BotPager" },
  description: "BotPager helps local service businesses get found, capture more leads, respond 24/7 with AI, automate follow-up, and turn more inquiries into customers.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Local Business Marketing & AI Growth System | BotPager",
    description: "Get found, capture more leads, respond 24/7 with AI, automate follow-up, and turn more local inquiries into customers.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "BotPager customer growth system" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Local Business Marketing & AI Growth System | BotPager",
    description: "A connected way for local service businesses to get found, respond faster, automate follow-up, and convert more customers.",
    images: ["/opengraph-image"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://botpager.com/#organization",
      name: "BotPager",
      url: "https://botpager.com",
      logo: "https://botpager.com/images/botpager-isotype.png",
      description: "Local business marketing, Smart Websites, AI receptionists, CRM automation, Local SEO, and paid acquisition for local service businesses.",
    },
    {
      "@type": "WebSite",
      "@id": "https://botpager.com/#website",
      url: "https://botpager.com",
      name: "BotPager",
      publisher: { "@id": "https://botpager.com/#organization" },
      inLanguage: "en-US",
    },
    {
      "@type": "Service",
      "@id": "https://botpager.com/#service",
      name: "Customer Growth System for Local Service Businesses",
      url: "https://botpager.com",
      provider: {
        "@type": "Organization",
        "@id": "https://botpager.com/#organization",
      },
      areaServed: { "@type": "Country", name: "United States" },
      serviceType: "Local business marketing, customer acquisition, 24/7 AI response, CRM automation, and lead follow-up",
      audience: { "@type": "BusinessAudience", audienceType: "Local service businesses" },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqData.map(([name, text]) => ({
        "@type": "Question",
        name,
        acceptedAnswer: { "@type": "Answer", text },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <LandingPage faqData={faqData} variant="conversion" />
    </>
  );
}
