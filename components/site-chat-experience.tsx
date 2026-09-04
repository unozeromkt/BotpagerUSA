"use client";

import { usePathname } from "next/navigation";
import { demoConfigs } from "@/lib/demos";
import { VoxPagePopupExperience } from "@/components/voxpage-popup-experience";

type SiteChatExperienceProps = {
  mainWidgetId: string;
};

export function SiteChatExperience({ mainWidgetId }: SiteChatExperienceProps) {
  const pathname = usePathname();
  const topLevelSlug = pathname.replace(/^\//, "").replace(/\/$/, "");
  const demo = demoConfigs[topLevelSlug];

  if (demo?.widgetId) {
    return (
      <VoxPagePopupExperience
        inlineWidgetId={demo.widgetId}
        variant={demo.widgetVariant ?? "botpager"}
      />
    );
  }

  if (pathname === "/demos" || pathname.startsWith("/demos/")) {
    return null;
  }

  return <VoxPagePopupExperience inlineWidgetId={mainWidgetId} />;
}
