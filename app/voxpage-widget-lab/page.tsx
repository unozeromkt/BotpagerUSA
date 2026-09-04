import type { Metadata } from "next";
import Home from "@/app/page";
import { VoxPagePopupExperience } from "@/components/voxpage-popup-experience";

export const metadata: Metadata = {
  title: "VoxPage Popup Experience Lab",
  description: "Private prototype for the VoxPage inline chat experience.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function VoxPageWidgetLabPage() {
  return (
    <>
      <Home />
      <VoxPagePopupExperience
        inlineWidgetId={process.env.NEXT_PUBLIC_GHL_VOXPAGE_INLINE_WIDGET_ID}
      />
    </>
  );
}
