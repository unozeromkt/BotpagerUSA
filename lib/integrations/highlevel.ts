import "server-only";

import { getAnswerLabel } from "@/lib/audit/questions";
import type { AuditReport, AuditSubmission } from "@/lib/audit/types";

const HIGHLEVEL_BASE_URL = "https://services.leadconnectorhq.com";
const AUDIT_CUSTOM_FIELD_COUNT = 6;
const AUDIT_SUBMITTED_TAG = "botpager-audit-submitted";

type HighLevelContact = {
  id: string;
};

type HighLevelConfig = {
  token: string;
  locationId: string;
  userId: string;
  apiVersion: string;
};

function getConfig(): HighLevelConfig | null {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) return null;

  return {
    token,
    locationId,
    userId: process.env.GHL_USER_ID ?? "",
    apiVersion: process.env.GHL_API_VERSION ?? "v3",
  };
}

async function highLevelRequest<T>(config: HighLevelConfig, path: string, init: RequestInit) {
  const response = await fetch(`${HIGHLEVEL_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      Version: config.apiVersion,
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("[BotPager Audit] HighLevel request failed.", {
      method: init.method ?? "GET",
      path,
      status: response.status,
    });
    throw new Error(`HighLevel request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

function buildCustomFields(report: AuditReport) {
  const definitions = [
    [process.env.GHL_FIELD_AUDIT_SUMMARY, report.businessSummary],
    [process.env.GHL_FIELD_OPPORTUNITY_1, formatOpportunity(report.opportunities[0])],
    [process.env.GHL_FIELD_OPPORTUNITY_2, formatOpportunity(report.opportunities[1])],
    [process.env.GHL_FIELD_OPPORTUNITY_3, formatOpportunity(report.opportunities[2])],
    [process.env.GHL_FIELD_RECOMMENDED_SYSTEM, `${report.recommendedSystem}\n\n${report.recommendationReason}`],
    [process.env.GHL_FIELD_AUDIT_COMPLETED_AT, new Date().toISOString()],
  ];

  return definitions
    .filter((entry): entry is [string, string] => Boolean(entry[0]))
    .map(([id, fieldValue]) => ({ id, fieldValue }));
}

function formatOpportunity(opportunity: AuditReport["opportunities"][number]) {
  return [
    opportunity.title,
    opportunity.problem,
    `Why it matters: ${opportunity.whyItMatters}`,
    `Recommended action: ${opportunity.recommendedAction}`,
  ].join("\n\n");
}

function buildNote(submission: AuditSubmission, report: AuditReport) {
  const answerLines = Object.entries(submission.answers).map(([key, value]) =>
    `${key.replaceAll("_", " ")}: ${getAnswerLabel(key as keyof typeof submission.answers, value)}`
  );
  const trackingLines = submission.tracking
    ? Object.entries(submission.tracking)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
    : [];

  return [
    "BUSINESS CONTEXT",
    `Business: ${submission.contact.businessName}`,
    `Type: ${submission.business.industry}`,
    `Location: ${submission.business.city}, ${submission.business.state}`,
    `Website: ${submission.business.website || "Not provided"}`,
    "",
    "DISCOVERY ANSWERS",
    ...answerLines,
    ...(trackingLines.length ? ["", "ATTRIBUTION", ...trackingLines] : []),
    "",
    "AUDIT SUMMARY",
    report.businessSummary,
    "",
    ...report.opportunities.flatMap((opportunity, index) => [
      `OPPORTUNITY ${index + 1}: ${opportunity.title}`,
      opportunity.problem,
      `Why it matters: ${opportunity.whyItMatters}`,
      `Recommended action: ${opportunity.recommendedAction}`,
      `BotPager capability: ${opportunity.relatedBotpagerCapability}`,
      "",
    ]),
    "RECOMMENDED SYSTEM",
    report.recommendedSystem,
    report.recommendationReason,
  ].join("\n");
}

export function isHighLevelConfigured() {
  return getConfig() !== null;
}

export async function upsertAuditContact(submission: AuditSubmission): Promise<HighLevelContact | null> {
  const config = getConfig();
  if (!config) return null;

  const payload = await highLevelRequest<{ contact?: HighLevelContact }>(config, "/contacts/upsert", {
    method: "POST",
    body: JSON.stringify({
      firstName: submission.contact.firstName,
      email: submission.contact.email,
      phone: submission.contact.phone || undefined,
      companyName: submission.contact.businessName,
      website: submission.business.website || undefined,
      city: submission.business.city,
      state: submission.business.state,
      country: "US",
      source: "BotPager Local Growth Audit",
      locationId: config.locationId,
      createNewIfDuplicateAllowed: false,
    }),
  });

  if (!payload.contact?.id) throw new Error("HighLevel did not return a contact id.");

  // Mark the contact as soon as the audit form has been submitted. This tag is
  // intentionally separate from the workflow trigger added after report fields
  // are saved, so every completed form can be filtered in HighLevel.
  try {
    await highLevelRequest(config, `/contacts/${payload.contact.id}/tags`, {
      method: "POST",
      body: JSON.stringify({ tags: [AUDIT_SUBMITTED_TAG] }),
    });
  } catch {
    // Keep the audit flowing if tagging is temporarily unavailable; the contact
    // upsert succeeded and the failure is visible in server logs.
    console.warn("[BotPager Audit] Submitted-form tag could not be added.");
  }

  return payload.contact;
}

export async function completeAuditContact(
  contact: HighLevelContact,
  submission: AuditSubmission,
  report: AuditReport,
) {
  const config = getConfig();
  if (!config) return { emailQueued: false, warnings: ["HighLevel is not configured."] };

  const warnings: string[] = [];
  const customFields = buildCustomFields(report);
  let reportFieldsSaved = false;

  if (customFields.length === AUDIT_CUSTOM_FIELD_COUNT) {
    try {
      await highLevelRequest(config, "/contacts/upsert", {
        method: "POST",
        body: JSON.stringify({
          email: submission.contact.email,
          locationId: config.locationId,
          customFields,
          createNewIfDuplicateAllowed: false,
        }),
      });
      reportFieldsSaved = true;
    } catch {
      warnings.push("The audit fields could not be updated.");
    }
  } else {
    warnings.push("All six HighLevel audit field IDs must be configured before email delivery can run.");
  }

  if (config.userId) {
    try {
      await highLevelRequest(config, `/contacts/${contact.id}/notes`, {
        method: "POST",
        body: JSON.stringify({
          userId: config.userId,
          title: "BotPager Local Growth Audit",
          body: buildNote(submission, report),
          color: "#562ff4",
          pinned: false,
        }),
      });
    } catch {
      warnings.push("The contact note could not be created.");
    }
  } else {
    warnings.push("GHL_USER_ID is not configured, so the audit note was skipped.");
  }

  let emailQueued = false;
  if (reportFieldsSaved) {
    // A tag-added workflow does not fire again when the contact already has the
    // tag. Removing it first makes repeated staging tests deterministic.
    try {
      await highLevelRequest(config, `/contacts/${contact.id}/tags`, {
        method: "DELETE",
        body: JSON.stringify({ tags: ["botpager-audit-ready"] }),
      });
    } catch {
      warnings.push("The previous workflow trigger tag could not be cleared.");
    }

    try {
      await highLevelRequest(config, `/contacts/${contact.id}/tags`, {
        method: "POST",
        body: JSON.stringify({ tags: ["botpager-audit-ready"] }),
      });
      emailQueued = true;
    } catch {
      warnings.push("The workflow trigger tag could not be added.");
    }
  }

  return { emailQueued, warnings };
}

export async function markAuditContactFailed(contact: HighLevelContact) {
  const config = getConfig();
  if (!config) return;
  try {
    await highLevelRequest(config, `/contacts/${contact.id}/tags`, {
      method: "POST",
      body: JSON.stringify({ tags: ["botpager-audit-generation-failed"] }),
    });
  } catch {
    // The original error is more useful to the caller than a secondary tag error.
  }
}
