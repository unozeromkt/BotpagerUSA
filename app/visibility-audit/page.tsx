import type { Metadata } from "next";
import { VisibilityAuditExperience } from "./visibility-audit-experience";
import styles from "./visibility-audit.module.css";

export const metadata: Metadata = {
  title: { absolute: "Free Search & AI Visibility Audit | BotPager" },
  description:
    "See how easy it is for customers and AI to find your local business. Get a free visibility score across Search, Maps, reputation, AI readiness and conversion.",
  alternates: { canonical: "/visibility-audit" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "/visibility-audit",
    title: "How Visible Is Your Business on Google & AI? | BotPager",
    description:
      "Scan your website and get a free Search + AI Visibility Score in about two minutes.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "BotPager Search and AI Visibility Audit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How Visible Is Your Business on Google & AI? | BotPager",
    description: "Get a free Search + AI Visibility Score for your local business.",
    images: ["/opengraph-image"],
  },
};

export default function VisibilityAuditPage() {
  return (
    <main className={styles.page}>
      <VisibilityAuditExperience />
    </main>
  );
}
