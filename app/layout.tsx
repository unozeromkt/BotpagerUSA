import type { Metadata, Viewport } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/600.css";
import "@fontsource/oswald/700.css";
import { LeadConnectorWidget } from "@/components/leadconnector-widget";
import "./globals.css";

const siteUrl = "https://botpager.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BotPager | Get More Customers for Your Local Service Business",
    template: "%s | BotPager",
  },
  description:
    "BotPager helps local service businesses attract more customers, respond 24/7, follow up automatically, and turn more inquiries into real business.",
  keywords: [
    "AI website for local businesses",
    "lead follow-up automation",
    "AI chatbot for contractors",
    "local service business CRM",
    "book more service jobs",
  ],
  authors: [{ name: "BotPager" }],
  creator: "BotPager",
  publisher: "BotPager",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "BotPager",
    title: "Get More Customers for Your Business | BotPager",
    description:
      "Attract new customers, respond 24/7, follow up automatically, and turn more inquiries into real customers.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "BotPager lead-to-job system" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get More Customers for Your Business | BotPager",
    description: "A simpler way to attract, respond to, and convert more customers with BotPager.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4b22f4",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <LeadConnectorWidget
          widgetId="6a935fe3731304959723e37d"
          hideOnDemos
          hideOnPaths={["/voxpage-widget-lab"]}
        />
      </body>
    </html>
  );
}
