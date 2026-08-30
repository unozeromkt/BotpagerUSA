import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BotPager",
    short_name: "BotPager",
    description: "AI-powered lead-to-job systems for local service businesses.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4b22f4",
    icons: [],
  };
}
