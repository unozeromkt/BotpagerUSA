"use client";

import Script from "next/script";

type LeadConnectorWidgetProps = {
  widgetId: string;
};

export function LeadConnectorWidget({ widgetId }: LeadConnectorWidgetProps) {
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
