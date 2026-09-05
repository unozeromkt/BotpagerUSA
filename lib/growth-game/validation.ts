import { growthQuestions } from "./config";
import { calculateGrowthResult } from "./score";
import type { GrowthAnswers, GrowthContact, GrowthSubmission, GrowthTracking } from "./types";

class GrowthValidationError extends Error {}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new GrowthValidationError(`${label} is invalid.`);
  }
  return value as Record<string, unknown>;
}

function cleanString(value: unknown, label: string, maxLength: number, required = true) {
  if (typeof value !== "string") {
    if (!required && (value === undefined || value === null)) return "";
    throw new GrowthValidationError(`${label} is required.`);
  }
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (required && !cleaned) throw new GrowthValidationError(`${label} is required.`);
  if (cleaned.length > maxLength) throw new GrowthValidationError(`${label} is too long.`);
  return cleaned;
}

function parseAnswers(value: unknown): GrowthAnswers {
  const record = asRecord(value, "Answers");
  return Object.fromEntries(growthQuestions.map((question) => {
    const answer = cleanString(record[question.key], question.question, 80);
    if (!question.options.some((option) => option.value === answer)) {
      throw new GrowthValidationError("One of the selected answers is invalid.");
    }
    return [question.key, answer];
  })) as GrowthAnswers;
}

function parseContact(value: unknown): GrowthContact {
  const record = asRecord(value, "Contact information");
  const email = cleanString(record.email, "Email", 160).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new GrowthValidationError("Enter a valid email address.");
  }
  if (record.consent !== true) throw new GrowthValidationError("Consent is required to send your growth plan.");

  return {
    name: cleanString(record.name, "Name", 100),
    email,
    businessName: cleanString(record.businessName, "Business name", 140),
    phone: cleanString(record.phone, "Phone", 40, false),
    consent: true,
    websiteTrap: cleanString(record.websiteTrap, "Website confirmation", 160, false),
  };
}

function parseTracking(value: unknown): GrowthTracking | undefined {
  if (value === undefined || value === null) return undefined;
  const record = asRecord(value, "Tracking information");
  return {
    source: cleanString(record.source, "Source", 160, false),
    utmSource: cleanString(record.utmSource, "UTM source", 100, false),
    utmMedium: cleanString(record.utmMedium, "UTM medium", 100, false),
    utmCampaign: cleanString(record.utmCampaign, "UTM campaign", 140, false),
  };
}

export function parseGrowthSubmission(value: unknown) {
  const record = asRecord(value, "Request");
  const submission: GrowthSubmission = {
    answers: parseAnswers(record.answers),
    contact: parseContact(record.contact),
    tracking: parseTracking(record.tracking),
  };
  return { submission, result: calculateGrowthResult(submission.answers) };
}

export function getGrowthValidationMessage(reason: unknown) {
  return reason instanceof GrowthValidationError ? reason.message : "We could not validate your growth game answers.";
}
