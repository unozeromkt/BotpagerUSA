export type AuditAnswerKey =
  | "lead_source"
  | "monthly_inquiries"
  | "missed_inquiry_handling"
  | "crm_follow_up"
  | "average_customer_value";

export type AuditAnswers = Record<AuditAnswerKey, string>;

export type AuditVariant = "general" | "roofing";
export type RoofingAuditAnswerKey = "lead_source" | "monthly_inquiries" | "missed_inquiry_handling" | "inspection_booking" | "estimate_follow_up";
export type RoofingAuditAnswers = Record<RoofingAuditAnswerKey, string>;
export type AnyAuditAnswers = AuditAnswers | RoofingAuditAnswers;

export type BusinessContext = {
  industry: string;
  city: string;
  state: string;
  website: string;
  roofingService?: string;
};

export type ContactDetails = {
  firstName: string;
  email: string;
  phone: string;
  businessName: string;
  consent: boolean;
  smsNonMarketingConsent: boolean;
  smsMarketingConsent: boolean;
  websiteTrap?: string;
};

export type TrackingContext = {
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export type AuditSubmission = {
  business: BusinessContext;
  contact: ContactDetails;
  tracking?: TrackingContext;
} & ({ variant?: "general"; answers: AuditAnswers } | { variant: "roofing"; answers: RoofingAuditAnswers });

export type AuditOpportunity = {
  id: string;
  title: string;
  problem: string;
  whyItMatters: string;
  recommendedAction: string;
  relatedBotpagerCapability: string;
  severity: "high" | "medium" | "low";
};

export type AuditReport = {
  businessSummary: string;
  opportunities: AuditOpportunity[];
  recommendedSystem: "BotPager Growth System" | "BotPager Local Growth System";
  recommendationReason: string;
};

export type AuditApiResponse = {
  ok: boolean;
  report?: AuditReport;
  delivery?: "queued" | "crm_saved" | "preview" | "failed" | "processing";
  message?: string;
};
