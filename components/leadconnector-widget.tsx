"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export function LeadConnectorWidget() {
  const pathname = usePathname();
  // The audit page has its own explicit SMS consent form. GHL requires the
  // chat widget to be the only SMS opt-in method on pages where it appears.
  if (pathname.startsWith("/admin") || pathname.startsWith("/audit")) return null;

  const complianceWidgetId = "6a93574c9f17bc64b324038c";
  const defaultWidgetId = "6a935fe3731304959723e37d";
  // The compliance widget is the default while the A2P campaign is under
  // review. Set NEXT_PUBLIC_GHL_WIDGET_MODE=default after approval to restore
  // the regular site widget everywhere except the Terms page.
  const useComplianceWidget = process.env.NEXT_PUBLIC_GHL_WIDGET_MODE !== "default";
  const widgetId = pathname.startsWith("/terms") || useComplianceWidget
    ? complianceWidgetId
    : defaultWidgetId;

  return (
    <Script
      id="leadconnector-chat-widget"
      src="https://widgets.leadconnectorhq.com/loader.js"
      strategy="afterInteractive"
      data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
      data-widget-id={widgetId}
      data-source="WEB_USER"
    />
  );
}
