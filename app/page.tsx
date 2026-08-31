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
  title: "Get More Customers for Your Local Service Business",
  description: "BotPager helps local service businesses attract more customers, respond 24/7, follow up automatically, and turn more inquiries into real business.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Get More Customers for Your Business | BotPager",
    description: "Attract new customers, respond 24/7, follow up automatically, and turn more inquiries into real customers.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "BotPager customer growth system" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get More Customers for Your Business | BotPager",
    description: "A simpler way for local service businesses to attract, respond to, and convert more customers.",
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
      description: "AI-powered websites, chatbots, and follow-up systems for local service businesses.",
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
      areaServed: "North America",
      serviceType: "Customer acquisition, 24/7 response, and automatic follow-up",
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
