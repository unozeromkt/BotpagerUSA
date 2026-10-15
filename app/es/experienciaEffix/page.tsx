import { existsSync } from "node:fs";
import path from "node:path";
import { generationAvailable } from "./generation";
import type { Metadata } from "next";
import { experienceSettings } from "../feriaEffix2026/_lib/server";
import { Experience } from "./experience";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Tu negocio en acción · Groovy + BotPager · EFFIX 2026",
  description: "Descubre cómo transformar tu marca con Groovy y BotPager en una experiencia animada personalizada.",
  alternates: { canonical: "/es/experienciaEffix" },
  openGraph: { title: "Mira tu negocio en acción", description: "Groovy + BotPager · EFFIX 2026", url: "/es/experienciaEffix", locale: "es_419" },
};
export default function Page() { return <Experience settings={experienceSettings()} generationEnabled={generationAvailable()} audioSource={existsSync(path.join(process.cwd(),"public/es/experienciaEffix/recorrido.mp3")) ? "/es/experienciaEffix/recorrido.mp3" : null} />; }
