export type DemoConfig = {
  slug: string;
  clientName: string;
  pageTitle: string;
  websiteUrl: string;
  widgetId?: string;
  widgetVariant?: "botpager" | "exotics";
};

export const demoConfigs: Record<string, DemoConfig> = {
  "energetic-exotics-demo": {
    slug: "energetic-exotics-demo",
    clientName: "Energetic Exotics",
    pageTitle: "Luxury Rental Cars & Concierge Services",
    websiteUrl: "https://www.energeticexotics.com/",
    widgetId: "6a98f5ea98f3179f2ea0a02f",
    widgetVariant: "exotics",
  },
};

export function getDemoConfig(slug: string) {
  return demoConfigs[slug];
}
