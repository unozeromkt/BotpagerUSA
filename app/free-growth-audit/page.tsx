import type { Metadata } from "next";
import { AuditExperience } from "@/app/audit/audit-experience";
import "../audit/audit.css";

export const metadata: Metadata = {
  title: "Free Local Growth Audit",
  description: "Answer a few quick questions and discover three practical opportunities to help your local service business attract and convert more customers.",
  alternates: { canonical: "/free-growth-audit" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function FreeGrowthAuditPage() {
  return <AuditExperience />;
}
