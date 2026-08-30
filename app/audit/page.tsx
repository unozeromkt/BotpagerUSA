import type { Metadata } from "next";
import { AuditExperience } from "./audit-experience";
import "./audit.css";

export const metadata: Metadata = {
  title: "Free Local Growth Audit",
  description: "Answer a few quick questions and discover three practical opportunities to help your local service business attract and convert more customers.",
  robots: { index: false, follow: false },
};

export default function AuditPage() {
  return <AuditExperience />;
}
