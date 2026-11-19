import type { Metadata } from "next";
import { AuditExperience } from "@/app/audit/audit-experience";
import "../../audit/audit.css";

export const metadata: Metadata = {
  title: "Free Roofing Growth Audit",
  description: "Answer five questions about your roofing business and get three personalized recommendations for lead response, inspection booking and estimate follow-up.",
  alternates: { canonical: "/free-growth-audit/roofing" },
};

export default function RoofingGrowthAuditPage() {
  return <AuditExperience variant="roofing" />;
}
