export type DemoWidgetVariant = "botpager" | "exotics" | "drs";

export type DemoConfig = {
  slug: string;
  clientName: string;
  pageTitle: string;
  websiteUrl: string;
  widgetId?: string;
  widgetVariant?: DemoWidgetVariant;
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
  "drs-roofing-demo": {
    slug: "drs-roofing-demo",
    clientName: "DRS Roofing",
    pageTitle: "Roof Repair, Replacement & Inspections",
    websiteUrl: "https://drs-roofing.com/",
    widgetId: "6afbbc0f75f0c3a5208316c1",
    widgetVariant: "drs",
  },
};

export function getDemoConfig(slug: string) {
  return demoConfigs[slug];
}
