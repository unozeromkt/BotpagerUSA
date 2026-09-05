import type { Metadata } from "next";
import { GrowthGameExperience } from "./growth-game-experience";
import "./growth-game.css";

export const metadata: Metadata = {
  title: "Master the Local Business Growth Game",
  description: "Discover your local business growth level, see the next move, and get a clear BotPager package and starting price.",
  alternates: { canonical: "/growth-game" },
  openGraph: {
    title: "Master the Local Business Growth Game | BotPager",
    description: "Find your level. See what is holding you back. Make the next move.",
    url: "/growth-game",
  },
  twitter: {
    title: "Master the Local Business Growth Game | BotPager",
    description: "Find your level. See what is holding you back. Make the next move.",
  },
};

export default function GrowthGamePage() {
  return <GrowthGameExperience />;
}
