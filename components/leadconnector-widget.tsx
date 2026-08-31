"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export function LeadConnectorWidget() {
  const pathname = usePathname();
  if (pathname.startsWith("/audit") || pathname.startsWith("/admin")) return null;

  return (
    <Script
      id="leadconnector-chat-widget"
      src="https://widgets.leadconnectorhq.com/loader.js"
      strategy="afterInteractive"
      data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
      data-widget-id="6a93574c9f17bc64b324038c"
    />
  );
}
