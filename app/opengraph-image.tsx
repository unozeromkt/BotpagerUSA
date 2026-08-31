import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "BotPager — Get more customers for your local service business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const logoData = await readFile(join(process.cwd(), "public/images/botpager-isotype.png"), "base64");
const logoSrc = `data:image/png;base64,${logoData}`;
const heroData = await readFile(join(process.cwd(), "public/images/hero-botpager-image.png"), "base64");
const heroSrc = `data:image/png;base64,${heroData}`;
const oswaldFont = await readFile(join(process.cwd(), "node_modules/@fontsource/oswald/files/oswald-latin-700-normal.woff"));
const interFont = await readFile(join(process.cwd(), "node_modules/@fontsource/inter/files/inter-latin-800-normal.woff"));

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        fontFamily: "Inter",
        padding: "58px 64px",
        color: "#07163f",
        background: "linear-gradient(135deg, #ffffff 0%, #f7f8ff 58%, #eef0ff 100%)",
      }}
    >
      <div style={{ width: "53%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15, fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
          <img src={logoSrc} width={62} height={62} style={{ borderRadius: 18 }} />
          <span><span style={{ color: "#07163f" }}>Bot</span><span style={{ color: "#4b22f4" }}>Pager</span></span>
        </div>
        <div style={{ marginTop: 42, color: "#4b22f4", fontSize: 20, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase" }}>
          Built for local service businesses
        </div>
        <div style={{ marginTop: 17, fontFamily: "Oswald", fontSize: 67, lineHeight: 1.02, fontWeight: 700, letterSpacing: -1 }}>
          GET MORE CUSTOMERS FOR YOUR BUSINESS.
        </div>
        <div style={{ marginTop: 25, color: "#52607b", fontSize: 25, lineHeight: 1.3 }}>
          Attract. Respond. Follow up. Convert.
        </div>
      </div>
      <div style={{ width: "47%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src={heroSrc} width={590} height={332} style={{ objectFit: "contain" }} />
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Oswald", data: oswaldFont, style: "normal", weight: 700 },
        { name: "Inter", data: interFont, style: "normal", weight: 800 },
      ],
    },
  );
}
