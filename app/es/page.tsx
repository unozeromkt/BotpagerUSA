import type { Metadata } from "next";
import { LatamHomePage } from "@/components/latam-pages";
import { latamServices } from "@/lib/latam/services";

const pageUrl = "https://botpager.com/es/";

export const metadata: Metadata = {
  title: { absolute: "Marketing, IA y Automatización para Empresas LATAM | BotPager" },
  description:
    "Evoluciona tu empresa con Smart Websites, inteligencia artificial y automatización. Atrae prospectos, responde al instante y convierte más oportunidades con BotPager.",
  keywords: ["marketing para empresas", "inteligencia artificial para empresas", "automatización de ventas", "BotPager LATAM"],
  alternates: {
    canonical: "/es/",
    languages: { "en-US": "/", es: "/es/" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "es_419",
    url: "/es/",
    siteName: "BotPager",
    title: "Más oportunidades. Mejor atención. Más ventas. | BotPager LATAM",
    description: "Tu web, atención y proceso comercial evolucionan con IA. Smart Websites, respuesta 24/7 y seguimiento automático, todo conectado.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Sistema comercial BotPager para empresas de Latinoamérica" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketing, IA y Automatización para Empresas LATAM | BotPager",
    description: "Un sistema conectado para atraer prospectos, responder más rápido y convertir más oportunidades en clientes.",
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
      name: "BotPager Latinoamérica",
      description: metadata.description,
      inLanguage: "es-419",
      isPartOf: { "@id": "https://botpager.com/#website" },
    },
    {
      "@type": "ItemList",
      name: "Soluciones BotPager para Latinoamérica",
      itemListElement: latamServices.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: service.name,
          url: `${pageUrl}${service.slug}/`,
          provider: { "@type": "Organization", "@id": "https://botpager.com/#organization", name: "BotPager" },
          areaServed: "Latin America",
        },
      })),
    },
  ],
};

export default function LatamHomeRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <LatamHomePage />
    </>
  );
}
