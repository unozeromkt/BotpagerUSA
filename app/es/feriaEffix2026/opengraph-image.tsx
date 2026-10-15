import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
export const alt = "BotPager en Feria Effix 2026: convierte conversaciones en oportunidades con IA. Beneficio EFFIX50 del 14 al 30 de octubre.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function CampaignImage() {
  const [font, logo, groovy] = await Promise.all([
    readFile(join(process.cwd(), "node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff")),
    readFile(join(process.cwd(), "public/images/botpager-isotype.png"), "base64"),
    readFile(join(process.cwd(), "public/es/feriaEffix2026/groovy-logo.png"), "base64"),
  ]);
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#f7f9ff", color: "#091e3f", padding: 64, fontFamily: "Poppins", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 32 }}><img src={`data:image/png;base64,${logo}`} width={48} height={48} alt="" />BotPager</div><div style={{ display: "flex", fontSize: 23, color: "#6633ff" }}>EFFIX 2026</div></div>
      <div style={{ display: "flex", marginTop: 45, flexDirection: "column", fontSize: 61, lineHeight: 1.16, letterSpacing: -2 }}><div style={{ display: "flex" }}>Convierte conversaciones</div><div style={{ display: "flex", color: "#6633ff" }}>en oportunidades con IA.</div></div>
      <div style={{ display: "flex", marginTop: 38, padding: "22px 27px", borderRadius: 16, background: "#091e3f", alignItems: "center", justifyContent: "space-between" }}><div style={{ display: "flex", color: "#32ff78", fontSize: 46 }}>50% OFF</div><div style={{ display: "flex", flexDirection: "column", fontSize: 22, color: "white" }}><div style={{ display: "flex" }}>En implementación inicial · EFFIX50</div><div style={{ display: "flex", fontSize: 17, color: "#cad8ff", marginTop: 5 }}>Contrata del 14 al 30 de octubre de 2026</div></div></div>
      <div style={{ display: "flex", marginTop: "auto", alignItems: "center", gap: 20 }}><img src={`data:image/png;base64,${groovy}`} width={140} height={36} alt="Groovy" /><div style={{ display: "flex", fontSize: 15, color: "#66748e" }}>Groovy, aliado de contenido · Conoce las condiciones en la página</div></div>
    </div>,
    { ...size, fonts: [{ name: "Poppins", data: font, weight: 600, style: "normal" }] },
  );
}
