"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export function LeadConnectorWidget() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const widgetId = pathname.startsWith("/terms")
    ? "6a93574c9f17bc64b324038c"
    : "6a935fe3731304959723e37d";

  return (
    <Script
      id="leadconnector-chat-widget"
      src="https://widgets.leadconnectorhq.com/loader.js"
      strategy="afterInteractive"
      data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
      data-widget-id={widgetId}
    />
  );
}
