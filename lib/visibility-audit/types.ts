export type VisibilityAuditInput = {
  websiteUrl: string;
  businessType: string;
  city: string;
};

export type VisibilityCategoryKey =
  | "search"
  | "local"
  | "reputation"
  | "ai"
  | "conversion";

export type VisibilityCategoryScore = {
  key: VisibilityCategoryKey;
  label: string;
  score: number;
  summary: string;
};

export type VisibilityFinding = {
  id: string;
  priority: "High Priority" | "Medium Priority" | "Opportunity";
  title: string;
  impact: string;
  evidence: string;
  recommendation: string;
  category: VisibilityCategoryKey;
};

export type VisibilityCheck = {
  label: string;
  status: "Found" | "Not found" | "Needs attention" | "Allowed" | "Blocked" | "Not measured";
  detail: string;
};

export type SitePreview = {
  imageUrl: string;
  imageKind: "Mobile screenshot" | "Website preview" | "No preview available";
  pageTitle: string;
  mainHeading: string;
  performanceScore?: number;
};

export type VisibilityAuditReport = {
  websiteUrl: string;
  businessType: string;
  city: string;
  overallScore: number;
  rating: "Poor" | "Needs Improvement" | "Good" | "Strong";
  scannedPages: number;
  generatedAt: string;
  scores: VisibilityCategoryScore[];
  strengths: string[];
  issues: VisibilityFinding[];
  recommendations: string[];
  checks: VisibilityCheck[];
  sitePreview: SitePreview;
  scannedUrls: string[];
};

export type VisibilityAuditResponse = {
  ok: boolean;
  report?: VisibilityAuditReport;
  message?: string;
};

export type VisibilityLead = {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  consent: boolean;
  websiteTrap?: string;
};

export type VisibilityLeadResponse = {
  ok: boolean;
  delivery?: "crm_saved" | "preview" | "failed";
  message?: string;
};
