"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createPageViewTracker, META_PIXEL_BASE_CODE, META_PIXEL_ID, trackEvent } from "@/lib/metaPixel";

function RoutePageViews({ ready, pageViews }: {
  ready: boolean;
  pageViews: ReturnType<typeof createPageViewTracker>;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (ready) pageViews.visit(`${pathname}?${searchParams.toString()}`);
  }, [pathname, searchParams, ready, pageViews]);

  return null;
}

export function MetaPixel() {
  const [ready, setReady] = useState(false);
  const [pageViews] = useState(createPageViewTracker);

  useEffect(() => {
    // Delegation also handles CTA links rendered by Server Components.
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const cta = event.target.closest('[data-meta-event="Contact"]');
      if (cta && !cta.matches(':disabled, [aria-disabled="true"]')) trackEvent("Contact");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive" onReady={() => {
        pageViews.initialize(`${window.location.pathname}?${new URLSearchParams(window.location.search).toString()}`);
        setReady(true);
      }}>{META_PIXEL_BASE_CODE}</Script>
      <Suspense fallback={null}>
        <RoutePageViews ready={ready} pageViews={pageViews} />
      </Suspense>
      <noscript>
        {/* A direct request to Meta is required; this tracking image must not use Next's optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img height="1" width="1" style={{ display: "none" }} alt=""
          src={`https://www.facebook.com/tr?id=${encodeURIComponent(META_PIXEL_ID)}&ev=PageView&noscript=1`} />
      </noscript>
    </>
  );
}
