import "server-only";

import { getAnswerLabel } from "@/lib/audit/questions";
import { buildFallbackReport } from "@/lib/audit/recommendations";
import type { AuditAnswers, AuditReport, BusinessContext } from "@/lib/audit/types";

const reportSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    businessSummary: { type: "string", minLength: 80, maxLength: 700 },
    opportunities: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", minLength: 3, maxLength: 60 },
          title: { type: "string", minLength: 10, maxLength: 110 },
          problem: { type: "string", minLength: 30, maxLength: 420 },
          whyItMatters: { type: "string", minLength: 30, maxLength: 420 },
          recommendedAction: { type: "string", minLength: 30, maxLength: 520 },
          relatedBotpagerCapability: {
            type: "string",
            enum: [
              "Smart Website",
              "AI Agent + Lead Capture",
              "CRM + Follow-up Automation",
              "Ads + Local Lead Generation",
              "Smart Website + Conversion Flow",
              "Google Business Profile + Local SEO",
              "Dashboard + Lead Management",
              "Quote / Booking Automation",
            ],
          },
          severity: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: ["id", "title", "problem", "whyItMatters", "recommendedAction", "relatedBotpagerCapability", "severity"],
      },
    },
    recommendedSystem: {
      type: "string",
      enum: ["BotPager Growth System", "BotPager Local Growth System"],
    },
    recommendationReason: { type: "string", minLength: 60, maxLength: 700 },
  },
  required: ["businessSummary", "opportunities", "recommendedSystem", "recommendationReason"],
} as const;

function isReport(value: unknown): value is AuditReport {
  if (!value || typeof value !== "object") return false;
  const report = value as Partial<AuditReport>;
  return (
    typeof report.businessSummary === "string" &&
    Array.isArray(report.opportunities) &&
    report.opportunities.length === 3 &&
    report.opportunities.every((item) =>
      item &&
      typeof item.title === "string" &&
      typeof item.problem === "string" &&
      typeof item.whyItMatters === "string" &&
      typeof item.recommendedAction === "string" &&
      typeof item.relatedBotpagerCapability === "string"
    ) &&
    (report.recommendedSystem === "BotPager Growth System" || report.recommendedSystem === "BotPager Local Growth System") &&
    typeof report.recommendationReason === "string"
  );
}

function getOutputText(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const response = value as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ type?: string; text?: unknown }> }>;
  };

  if (typeof response.output_text === "string") return response.output_text;
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  return "";
}

export async function generateAuditReport(business: BusinessContext, answers: AuditAnswers) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  const fallback = buildFallbackReport(business, answers);

  if (!apiKey || !model) {
    return { report: fallback, source: "rules" as const };
  }

  const safeInput = {
    business,
    answers: Object.fromEntries(
      Object.entries(answers).map(([key, value]) => [key, getAnswerLabel(key as keyof AuditAnswers, value)])
    ),
    preliminaryPriorities: fallback.opportunities.map((item) => ({
      id: item.id,
      title: item.title,
      capability: item.relatedBotpagerCapability,
    })),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        store: false,
        max_output_tokens: 1800,
        instructions: [
          "You are BotPager's Local Growth Advisor for US local service businesses.",
          "Create a concise, useful and encouraging audit based only on the supplied business context and answers.",
          "Do not claim to have inspected the website, Google profile, advertising account or CRM.",
          "Do not invent facts. Frame uncertain points as opportunities, not verified deficiencies.",
          "Select exactly three priorities that BotPager can directly address.",
          "Use plain US English and a consultative, confidence-building tone.",
        ].join("\n"),
        input: JSON.stringify(safeInput),
        text: {
          format: {
            type: "json_schema",
            name: "botpager_local_growth_audit",
            strict: true,
            schema: reportSchema,
          },
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) return { report: fallback, source: "rules" as const };
    const payload: unknown = await response.json();
    const outputText = getOutputText(payload);
    const parsed: unknown = outputText ? JSON.parse(outputText) : null;
    return isReport(parsed)
      ? { report: parsed, source: "openai" as const }
      : { report: fallback, source: "rules" as const };
  } catch {
    return { report: fallback, source: "rules" as const };
  } finally {
    clearTimeout(timeout);
  }
}
