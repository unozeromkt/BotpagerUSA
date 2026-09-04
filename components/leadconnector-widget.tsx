"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { demoConfigs } from "@/lib/demos";

type LeadConnectorWidgetProps = {
  widgetId: string;
  hideOnDemos?: boolean;
  hideOnPaths?: string[];
};

export function LeadConnectorWidget({
  widgetId,
  hideOnDemos = false,
  hideOnPaths = [],
}: LeadConnectorWidgetProps) {
  const pathname = usePathname();
  const topLevelSlug = pathname.replace(/^\//, "").replace(/\/$/, "");
  const isDemoPage =
    pathname === "/demos" ||
    pathname.startsWith("/demos/") ||
    Object.prototype.hasOwnProperty.call(demoConfigs, topLevelSlug);
  const isExcludedPath = hideOnPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if ((hideOnDemos && isDemoPage) || isExcludedPath) return null;

  return (
    <Script
      id={`leadconnector-chat-widget-${widgetId}`}
      src="https://widgets.leadconnectorhq.com/loader.js"
      strategy="afterInteractive"
      data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
      data-widget-id={widgetId}
      data-source="WEB_USER"
    />
  );
}
