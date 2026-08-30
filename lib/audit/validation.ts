import { auditQuestions } from "./questions";
import type { AuditAnswers, AuditSubmission, BusinessContext, ContactDetails, TrackingContext } from "./types";

class AuditValidationError extends Error {}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AuditValidationError(`${label} is invalid.`);
  }
  return value as Record<string, unknown>;
}

function cleanString(value: unknown, label: string, maxLength: number, required = true) {
  if (typeof value !== "string") {
    if (!required && (value === undefined || value === null)) return "";
    throw new AuditValidationError(`${label} is required.`);
  }

  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (required && !cleaned) throw new AuditValidationError(`${label} is required.`);
  if (cleaned.length > maxLength) throw new AuditValidationError(`${label} is too long.`);
  return cleaned;
}

function cleanWebsite(value: unknown) {
  const website = cleanString(value, "Website", 240, false);
  if (!website) return "";

  const withProtocol = /^https?:\/\//i.test(website) ? website : `https://${website}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
    return url.toString();
  } catch {
    throw new AuditValidationError("Enter a valid website address.");
  }
}

function parseBusiness(value: unknown): BusinessContext {
  const record = asRecord(value, "Business information");
  return {
    industry: cleanString(record.industry, "Business type", 100),
    city: cleanString(record.city, "City", 80),
    state: cleanString(record.state, "State", 40),
    website: cleanWebsite(record.website),
  };
}

function parseAnswers(value: unknown): AuditAnswers {
  const record = asRecord(value, "Answers");
  const entries = auditQuestions.map((question) => {
    const answer = cleanString(record[question.key], question.question, 80);
    if (!question.options.some((option) => option.value === answer)) {
      throw new AuditValidationError("One of the selected answers is invalid.");
    }
    return [question.key, answer];
  });

  return Object.fromEntries(entries) as AuditAnswers;
}

function parseContact(value: unknown): ContactDetails {
  const record = asRecord(value, "Contact information");
  const email = cleanString(record.email, "Email", 160).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AuditValidationError("Enter a valid email address.");
  }

  const consent = record.consent === true;
  if (!consent) throw new AuditValidationError("Consent is required to send the audit.");

  return {
    firstName: cleanString(record.firstName, "First name", 80),
    email,
    phone: cleanString(record.phone, "Phone", 40, false),
    businessName: cleanString(record.businessName, "Business name", 120),
    consent,
    websiteTrap: cleanString(record.websiteTrap, "Website confirmation", 160, false),
  };
}

function parseTracking(value: unknown): TrackingContext | undefined {
  if (value === undefined || value === null) return undefined;
  const record = asRecord(value, "Tracking information");
  return {
    source: cleanString(record.source, "Source", 80, false),
    utmSource: cleanString(record.utmSource, "UTM source", 100, false),
    utmMedium: cleanString(record.utmMedium, "UTM medium", 100, false),
    utmCampaign: cleanString(record.utmCampaign, "UTM campaign", 140, false),
  };
}

export function parseAuditSubmission(value: unknown): AuditSubmission {
  const record = asRecord(value, "Request");
  return {
    business: parseBusiness(record.business),
    answers: parseAnswers(record.answers),
    contact: parseContact(record.contact),
    tracking: parseTracking(record.tracking),
  };
}

export function getValidationMessage(reason: unknown) {
  return reason instanceof AuditValidationError ? reason.message : "We could not validate the audit information.";
}
