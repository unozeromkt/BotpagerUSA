import type { VisibilityAuditInput, VisibilityAuditReport, VisibilityLead } from "./types";

class VisibilityAuditValidationError extends Error {}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new VisibilityAuditValidationError(`${label} is invalid.`);
  }
  return value as Record<string, unknown>;
}

function cleanString(value: unknown, label: string, maxLength: number, required = true) {
  if (typeof value !== "string") {
    if (!required && (value === undefined || value === null)) return "";
    throw new VisibilityAuditValidationError(`${label} is required.`);
  }
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (required && !cleaned) throw new VisibilityAuditValidationError(`${label} is required.`);
  if (cleaned.length > maxLength) throw new VisibilityAuditValidationError(`${label} is too long.`);
  return cleaned;
}

export function normalizeWebsiteUrl(value: unknown) {
  const website = cleanString(value, "Website URL", 240);
  const withProtocol = /^https?:\/\//i.test(website) ? website : `https://${website}`;
  try {
    const url = new URL(withProtocol);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) throw new Error();
    url.hash = "";
    return url.toString();
  } catch {
    throw new VisibilityAuditValidationError("Enter a valid public website URL.");
  }
}

export function parseVisibilityAuditInput(value: unknown): VisibilityAuditInput {
  const record = asRecord(value, "Audit request");
  return {
    websiteUrl: normalizeWebsiteUrl(record.websiteUrl),
    businessType: cleanString(record.businessType, "Business type", 100),
    city: cleanString(record.city, "City or service area", 120),
  };
}

export function parseVisibilityLead(value: unknown): VisibilityLead {
  const record = asRecord(value, "Contact information");
  const email = cleanString(record.email, "Email", 160).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new VisibilityAuditValidationError("Enter a valid email address.");
  }
  if (record.consent !== true) {
    throw new VisibilityAuditValidationError("Please confirm that we can prepare and email your report.");
  }
  return {
    name: cleanString(record.name, "Name", 100),
    email,
    phone: cleanString(record.phone, "Phone", 40, false),
    businessName: cleanString(record.businessName, "Business name", 140),
    consent: true,
    websiteTrap: cleanString(record.websiteTrap, "Website confirmation", 160, false),
  };
}

export function parseVisibilityReport(value: unknown): VisibilityAuditReport {
  const record = asRecord(value, "Audit report");
  const scores = Array.isArray(record.scores) ? record.scores : [];
  const issues = Array.isArray(record.issues) ? record.issues : [];
  const strengths = Array.isArray(record.strengths) ? record.strengths : [];
  const recommendations = Array.isArray(record.recommendations) ? record.recommendations : [];
  const checks = Array.isArray(record.checks) ? record.checks : [];
  const scannedUrls = Array.isArray(record.scannedUrls) ? record.scannedUrls : [];
  const preview = record.sitePreview && typeof record.sitePreview === "object" ? record.sitePreview as Record<string, unknown> : {};
  if (scores.length !== 5 || issues.length > 5 || strengths.length > 3 || recommendations.length > 8) {
    throw new VisibilityAuditValidationError("The audit report is invalid.");
  }

  return {
    websiteUrl: normalizeWebsiteUrl(record.websiteUrl),
    businessType: cleanString(record.businessType, "Business type", 100),
    city: cleanString(record.city, "City", 120),
    overallScore: Math.max(0, Math.min(100, Number(record.overallScore) || 0)),
    rating: ["Poor", "Needs Improvement", "Good", "Strong"].includes(String(record.rating))
      ? (record.rating as VisibilityAuditReport["rating"])
      : "Needs Improvement",
    scannedPages: Math.max(1, Math.min(20, Number(record.scannedPages) || 1)),
    generatedAt: cleanString(record.generatedAt, "Generated date", 80),
    scores: scores.map((item) => {
      const score = asRecord(item, "Category score");
      return {
        key: cleanString(score.key, "Score key", 20) as VisibilityAuditReport["scores"][number]["key"],
        label: cleanString(score.label, "Score label", 80),
        score: Math.max(0, Math.min(100, Number(score.score) || 0)),
        summary: cleanString(score.summary, "Score summary", 240),
      };
    }),
    strengths: strengths.map((item) => cleanString(item, "Strength", 220)),
    issues: issues.map((item) => {
      const issue = asRecord(item, "Finding");
      return {
        id: cleanString(issue.id, "Finding ID", 80),
        priority: cleanString(issue.priority, "Priority", 30) as VisibilityAuditReport["issues"][number]["priority"],
        title: cleanString(issue.title, "Finding title", 180),
        impact: cleanString(issue.impact, "Finding impact", 360),
        evidence: cleanString(issue.evidence, "Finding evidence", 280),
        recommendation: cleanString(issue.recommendation, "Recommendation", 360),
        category: cleanString(issue.category, "Finding category", 30) as VisibilityAuditReport["issues"][number]["category"],
      };
    }),
    recommendations: recommendations.map((item) => cleanString(item, "Recommendation", 220)),
    checks: checks.slice(0, 12).map((item) => {
      const check = asRecord(item, "Audit check");
      return {
        label: cleanString(check.label, "Check label", 100),
        status: cleanString(check.status, "Check status", 30) as VisibilityAuditReport["checks"][number]["status"],
        detail: cleanString(check.detail, "Check detail", 300),
      };
    }),
    sitePreview: {
      imageUrl: "",
      imageKind: ["Mobile screenshot", "Website preview", "No preview available"].includes(String(preview.imageKind))
        ? preview.imageKind as VisibilityAuditReport["sitePreview"]["imageKind"]
        : "No preview available",
      pageTitle: cleanString(preview.pageTitle, "Page title", 180, false),
      mainHeading: cleanString(preview.mainHeading, "Main heading", 220, false),
      performanceScore: preview.performanceScore === undefined ? undefined : Math.max(0, Math.min(100, Number(preview.performanceScore) || 0)),
    },
    scannedUrls: scannedUrls.slice(0, 20).map((item) => normalizeWebsiteUrl(item)),
  };
}

export function getVisibilityValidationMessage(reason: unknown) {
  return reason instanceof VisibilityAuditValidationError
    ? reason.message
    : "We could not validate the information provided.";
}
