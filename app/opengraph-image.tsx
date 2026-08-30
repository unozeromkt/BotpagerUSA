import { ImageResponse } from "next/og";

export const alt = "BotPager — Turn more leads into booked jobs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "76px",
        color: "white",
        background: "linear-gradient(135deg, #07163f 0%, #3b20ed 52%, #7653ff 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 38, fontWeight: 700 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: "white", color: "#4b22f4", display: "flex", alignItems: "center", justifyContent: "center" }}>●●</div>
        BotPager
      </div>
      <div style={{ fontSize: 82, lineHeight: 1.02, fontWeight: 800, marginTop: 50, maxWidth: 980 }}>
        Turn more leads into booked jobs.
      </div>
      <div style={{ fontSize: 28, opacity: 0.82, marginTop: 28 }}>Your AI-powered lead-to-job system.</div>
    </div>,
    size,
  );
}
