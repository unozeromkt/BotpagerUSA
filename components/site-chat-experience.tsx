"use client";

import { usePathname } from "next/navigation";
import { demoConfigs } from "@/lib/demos";
import { LeadConnectorWidget } from "@/components/leadconnector-widget";
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

  if (pathname === "/demos" || pathname.startsWith("/demos/") || pathname === "/growth-game" || pathname.startsWith("/es/feriaEffix2026") || pathname.startsWith("/es/experienciaEffix") || pathname.startsWith("/es/AuditoríaEffix") || pathname.startsWith("/es/Auditor%C3%ADaEffix") || pathname.startsWith("/es/AuditoriaEffix")) {
    return null;
  }

  if (pathname === "/es" || pathname.startsWith("/es/")) {
    return <LeadConnectorWidget widgetId="6ad0de08e0d80451b7509374" />;
  }

  return <VoxPagePopupExperience inlineWidgetId={mainWidgetId} />;
}
