import type { Metadata } from "next";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/space-mono/400.css";
import { settings } from "./_lib/server";
import { EffixExperience } from "./experience";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Feria Effix 2026 · Convierte conversaciones en oportunidades",
  description: "Prueba un ejemplo de BotPager para tu negocio y activa el beneficio EFFIX: 50% de descuento en implementación inicial para contrataciones del 14 al 20 de octubre de 2026.",
  keywords: ["BotPager", "Feria Effix 2026", "Groovy", "asistente IA", "sitio web inteligente"],
  alternates: { canonical: "/es/feriaEffix2026" },
  openGraph: { title: "Una conversación. Una nueva oportunidad. | BotPager", description: "Descubre BotPager en EFFIX 2026. Prueba tu ejemplo y conoce el beneficio EFFIX50.", url: "/es/feriaEffix2026", locale: "es_CO" },
  twitter: { title: "BotPager · Feria Effix 2026", description: "Prueba cómo convertir consultas en oportunidades con IA.", images: ["/es/feriaEffix2026/opengraph-image"] },
};

export default function EffixPage() { return <EffixExperience settings={settings()} />; }
