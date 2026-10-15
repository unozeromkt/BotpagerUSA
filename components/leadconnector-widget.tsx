"use client";

import { useEffect, useRef } from "react";

type LeadConnectorWidgetProps = {
  widgetId: string;
};

export function LeadConnectorWidget({ widgetId }: LeadConnectorWidgetProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // The loader mounts its widget beside the script. A separate container also
    // keeps any delayed provider response detached after navigating away.
    const container = document.createElement("div");
    const script = document.createElement("script");
    script.src = "https://widgets.leadconnectorhq.com/loader.js";
    script.async = true;
    script.dataset.resourcesUrl = "https://widgets.leadconnectorhq.com/chat-widget/loader.js";
    script.dataset.widgetId = widgetId;
    container.appendChild(script);
    host.appendChild(container);

    return () => container.remove();
  }, [widgetId]);

  return <div ref={hostRef} data-site-chat-widget={widgetId} />;
}
