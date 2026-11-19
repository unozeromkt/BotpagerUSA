type MetaPixelFunction = {
  (command: "init", pixelId: string): void;
  (command: "track", name: string, params?: object): void;
};

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2358653438293907";

// Keep Meta's base snippet intact; only the configured pixel ID is interpolated.
export const META_PIXEL_BASE_CODE = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(META_PIXEL_ID).replace(/</g, "\\u003c")});
fbq('track', 'PageView');`;

export function trackEvent(name: string, params?: object): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  try {
    if (params) window.fbq("track", name, params);
    else window.fbq("track", name);
  } catch {
    // Analytics must never interrupt a form submission or navigation.
  }
}

export function createPageViewTracker() {
  let lastUrl: string | null = null;
  return {
    initialize(url: string) {
      // The base snippet already sent this page's PageView.
      lastUrl ??= url;
    },
    visit(url: string) {
      if (lastUrl === null || lastUrl === url) return;
      lastUrl = url;
      trackEvent("PageView");
    },
  };
}
