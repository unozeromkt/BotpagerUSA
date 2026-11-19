import "server-only";

import { isIP } from "node:net";
import { randomUUID } from "node:crypto";
import { auditConsent, AUDIT_CONSENT_VERSION } from "@/lib/audit/consent";
import { normalizeAuditPhone } from "@/lib/audit/phone";
import { roofingAuditQuestions, roofingServices } from "@/lib/audit/roofing-questions";
import type { AuditReport, AuditSubmission } from "@/lib/audit/types";

export type RoofingSubmission = Extract<AuditSubmission, { variant: "roofing" }>;
export type AuditEvidence = { requestId: string; submittedAt: string; ip: string; userAgent: string; formVersion: string };
export type RoofingSyncJob = { submission: RoofingSubmission; report: AuditReport; evidence: AuditEvidence };

export const auditFieldIds = {
  roofingService: "2F6wpI6dxrSrGUObjGjv", lead_source: "j1hVXjbtfT818ZkUksLH",
  monthly_inquiries: "QX96xG1bt41Bi5SBntih", missed_inquiry_handling: "9lDFLRqBTsAAbVN0jcp0",
  inspection_booking: "Wx4Suspv1FCRMseOOxPV", estimate_follow_up: "MOChQ0SvIxhNnXx8pVDv",
  variant: "tboHhi7Png3f3k4WmSbr", emailConsent: "dhCyMcdVYU1c0Gm6Wavd",
  smsTransactionalConsent: "xcNNml0lkY71ZshwbVkl", smsMarketingConsent: "PUTGqy22Krmb0ZqtJvmM",
  consentTimestamp: "RKpicueZc6nE92f4upYZ", consentIp: "V9mtRNPHTbkdK8rgG32Q",
  consentEvidence: "j6DyfpH1XsPvydBSiBEI", utmSource: "84tINOq71KPmu4lpdaMR",
  utmMedium: "bhLVbxip1TU1exDwKCdZ", utmCampaign: "3qdvLTXvq1MOJe509il0",
  referrer: "TFUhyt4LmwvDMVqZkt0g", summary: "1ubwGsDi00JaR7FIZlws",
  opportunity1: "HWoxreo4VBHGRkMWfTHd", opportunity2: "ycDIZBuTFgOP7YRXhseF",
  opportunity3: "Y7N1RAcJgD9r3An3I5Ws", recommendedSystem: "EUrTUj5nFgsQueFE2hMv",
  completedAt: "Yk1DK4L5KQz1macc16uq",
} as const;

// GHL SINGLE_OPTIONS values are fixed. Update GHL and the contract tests if labels change.
export const auditOptionLabels: Record<string, Record<string, string>> = {
  roofingService: Object.fromEntries(roofingServices.map(option => [option.value, option.label])),
  ...Object.fromEntries(roofingAuditQuestions.map(question => [question.key,
    Object.fromEntries(question.options.map(option => [option.value,
      question.key === "monthly_inquiries" ? option.label.replaceAll("–", "-") : option.label,
    ])),
  ])),
};

export function captureAuditEvidence(request: Request): AuditEvidence {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  return {
    requestId: randomUUID(), submittedAt: new Date().toISOString(),
    ip: isIP(forwarded) ? forwarded : "",
    userAgent: (request.headers.get("user-agent") ?? "").replace(/[\r\n\u0000-\u001f]/g, " ").slice(0, 512),
    formVersion: process.env.VERCEL_GIT_COMMIT_SHA || AUDIT_CONSENT_VERSION,
  };
}

const yesNo = (value: boolean) => value ? "Yes" : "No";

export function buildAuditConsentEvidence({ submission, evidence }: RoofingSyncJob) {
  const { contact } = submission;
  const phone = normalizeAuditPhone(contact.phone);
  return [
    `Form: botpager.com/free-growth-audit/roofing (variant=roofing, form version ${evidence.formVersion})`,
    `Submitted (UTC): ${evidence.submittedAt}`,
    `IP: ${evidence.ip || "unavailable"}  User-Agent: ${evidence.userAgent || "unavailable"}`,
    `Email audit consent: ${yesNo(contact.consent)} - "${auditConsent.email}"`,
    `SMS non-marketing consent: ${yesNo(contact.smsNonMarketingConsent && Boolean(phone))} - "${auditConsent.smsTransactional}"`,
    `SMS marketing consent: ${yesNo(contact.smsMarketingConsent && Boolean(phone))} - "${auditConsent.smsMarketing}"`,
    `Phone provided: ${phone || "none"}`,
  ].join("\n");
}

export function completionDate(submittedAt: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(submittedAt));
  const get = (type: string) => parts.find(part => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function buildAuditCustomFields(job: RoofingSyncJob) {
  const { submission: { business, answers, contact, tracking }, report, evidence } = job;
  const phone = normalizeAuditPhone(contact.phone);
  const values: Array<[string, string | undefined]> = [
    [auditFieldIds.roofingService, auditOptionLabels.roofingService[business.roofingService ?? ""]],
    ...roofingAuditQuestions.map(question => [auditFieldIds[question.key], auditOptionLabels[question.key][answers[question.key]]] as [string, string]),
    [auditFieldIds.variant, "roofing"], [auditFieldIds.emailConsent, yesNo(contact.consent)],
    [auditFieldIds.smsTransactionalConsent, yesNo(contact.smsNonMarketingConsent && Boolean(phone))],
    [auditFieldIds.smsMarketingConsent, yesNo(contact.smsMarketingConsent && Boolean(phone))],
    [auditFieldIds.consentTimestamp, evidence.submittedAt], [auditFieldIds.consentIp, evidence.ip],
    [auditFieldIds.consentEvidence, buildAuditConsentEvidence(job)],
    [auditFieldIds.utmSource, tracking?.utmSource], [auditFieldIds.utmMedium, tracking?.utmMedium],
    [auditFieldIds.utmCampaign, tracking?.utmCampaign], [auditFieldIds.referrer, tracking?.source || "direct"],
    [auditFieldIds.summary, report.opportunities.map(item => `${item.severity}: ${item.id}`).join(" | ")],
    ...([auditFieldIds.opportunity1, auditFieldIds.opportunity2, auditFieldIds.opportunity3]).map((id, index) => [id, `${report.opportunities[index].severity} - ${report.opportunities[index].title}`] as [string, string]),
    [auditFieldIds.recommendedSystem, [...new Set(report.opportunities.map(item => item.relatedBotpagerCapability))].join(" | ")],
    [auditFieldIds.completedAt, completionDate(evidence.submittedAt)],
  ];
  return values.filter((entry): entry is [string, string] => Boolean(entry[1])).map(([id, field_value]) => ({ id, field_value }));
}

export function buildRoofingContact(job: RoofingSyncJob, locationId: string) {
  const { business, contact } = job.submission;
  return {
    locationId, firstName: contact.firstName, email: contact.email.trim().toLowerCase(),
    phone: normalizeAuditPhone(contact.phone), companyName: contact.businessName,
    city: business.city, state: business.state.trim().toUpperCase(),
    website: business.website || undefined, source: "Free Growth Audit - Roofing",
    createNewIfDuplicateAllowed: false, customFields: buildAuditCustomFields(job),
  };
}

export function roofingAuditTags({ contact }: RoofingSubmission) {
  const phone = normalizeAuditPhone(contact.phone);
  return ["auditoria-roofing",
    ...(phone && contact.smsNonMarketingConsent ? ["sms-consent-transactional"] : []),
    ...(phone && contact.smsMarketingConsent ? ["sms-consent-marketing"] : []),
  ];
}

export function buildRoofingReportNote(job: RoofingSyncJob) {
  return [
    `Roofing audit ${job.evidence.requestId}`, `Submitted: ${job.evidence.submittedAt}`,
    job.report.businessSummary,
    ...job.report.opportunities.flatMap(item => ["", `${item.severity} - ${item.title}`, item.problem,
      `Why it matters: ${item.whyItMatters}`, `Recommended action: ${item.recommendedAction}`, `Capability: ${item.relatedBotpagerCapability}`]),
    "", "DISCOVERY ANSWERS", `Priority service: ${auditOptionLabels.roofingService[job.submission.business.roofingService ?? ""]}`,
    ...roofingAuditQuestions.map(question => `${question.question} ${auditOptionLabels[question.key][job.submission.answers[question.key]]}`),
  ].join("\n");
}
