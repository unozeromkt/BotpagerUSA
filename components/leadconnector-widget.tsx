"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export function LeadConnectorWidget() {
  const pathname = usePathname();
  // The audit page keeps its own explicit consent form, so the chat widget
  // remains disabled there to avoid presenting two opt-in methods together.
  if (pathname.startsWith("/admin") || pathname.startsWith("/audit")) return null;

  return (
    <Script
      id="leadconnector-chat-widget"
      src="https://widgets.leadconnectorhq.com/loader.js"
      strategy="afterInteractive"
      data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
      data-widget-id="6a935fe3731304959723e37d"
      data-source="WEB_USER"
    />
  );
}
