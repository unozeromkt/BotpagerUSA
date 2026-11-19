import type { AuditQuestion } from "./questions";
import type { RoofingAuditAnswerKey } from "./types";

export const ROOFING_AUDIT_HREF = "/free-growth-audit/roofing";

export const roofingServices = [
  { value: "replacements", label: "Roof replacements" },
  { value: "repairs", label: "Roof repairs & leaks" },
  { value: "storm-damage", label: "Storm damage" },
  { value: "commercial", label: "Commercial roofing" },
  { value: "mixed", label: "A mix of roofing services" },
  { value: "other", label: "Other roofing services" },
] as const;

export function getRoofingServiceLabel(value?: string) {
  return roofingServices.find(service => service.value === value)?.label ?? "Roofing services";
}

export const roofingAuditQuestions: AuditQuestion<RoofingAuditAnswerKey>[] = [
  {
    key: "lead_source", eyebrow: "Finding roofing customers",
    question: "Where do most of your roofing leads come from?",
    helper: "Choose the source that brings you the most inquiries today.",
    options: [
      { value: "google", label: "Google Search or Maps", description: "Homeowners find our business when searching locally" },
      { value: "referrals", label: "Referrals", description: "Past customers, neighbors or other contractors recommend us" },
      { value: "social", label: "Social media", description: "Facebook, Instagram or community groups" },
      { value: "paid-ads", label: "Paid advertising", description: "Google, Meta or other paid campaigns" },
      { value: "mixed", label: "A mix of sources", description: "No single source brings most of our inquiries" },
      { value: "not-sure", label: "Not sure", description: "We do not track the source consistently" },
    ],
  },
  {
    key: "monthly_inquiries", eyebrow: "Your roofing lead flow",
    question: "About how many roofing inquiries do you receive each month?",
    helper: "Count new calls, messages and form requests. A rough estimate for a typical month is enough.",
    options: [
      { value: "0-10", label: "0–10", description: "A few roofing inquiries each month" },
      { value: "11-25", label: "11–25", description: "A steady but limited flow" },
      { value: "26-50", label: "26–50", description: "Consistent monthly demand" },
      { value: "51-100", label: "51–100", description: "A strong volume of inquiries" },
      { value: "100+", label: "100+", description: "A busy pipeline of roofing requests" },
      { value: "not-sure", label: "Not sure", description: "We do not have a reliable count yet" },
    ],
  },
  {
    key: "missed_inquiry_handling", eyebrow: "While your crew is on the roof",
    question: "What happens when a homeowner contacts you while you’re on a job or after hours?",
    helper: "For commercial roofing, think of a property manager reaching out. Choose what usually happens.",
    options: [
      { value: "automatic-response", label: "They get instant answers", description: "An assistant answers questions and helps with the next step" },
      { value: "live-team", label: "Our team answers", description: "Someone covers incoming inquiries, including after hours" },
      { value: "reply-later", label: "We get back to them later", description: "We call or message when someone is available" },
      { value: "voicemail", label: "They reach voicemail", description: "They leave a message and wait for a callback" },
      { value: "often-missed", label: "Some inquiries get missed", description: "It is difficult to keep up while the team is busy" },
    ],
  },
  {
    key: "inspection_booking", eyebrow: "From inquiry to inspection",
    question: "How do homeowners schedule a roof inspection or estimate?",
    helper: "Think about the steps between their first inquiry and a confirmed visit.",
    options: [
      { value: "phone", label: "They need to call us", description: "Someone checks availability and books the visit" },
      { value: "messages", label: "We coordinate by text or email", description: "It usually takes a few messages to agree on a time" },
      { value: "request-form", label: "They submit a request form", description: "Our team contacts them later to confirm a time" },
      { value: "online-calendar", label: "They choose a time online", description: "Available visits can be booked and confirmed online" },
      { value: "no-process", label: "There is no consistent process", description: "It depends on who receives the inquiry" },
    ],
  },
  {
    key: "estimate_follow_up", eyebrow: "Keeping estimates moving",
    question: "What happens after you send an estimate and the homeowner doesn’t respond?",
    helper: "Choose the follow-up process you use most often.",
    options: [
      { value: "none", label: "We usually wait for them", description: "There is no planned follow-up after the estimate" },
      { value: "one-manual", label: "We follow up once", description: "Someone calls or sends a message" },
      { value: "several-manual", label: "Our team follows up several times", description: "We have a routine, but it is handled manually" },
      { value: "automated", label: "Follow-up happens automatically", description: "Messages follow the estimate’s status and stop when appropriate" },
      { value: "not-sure", label: "Not sure", description: "We cannot easily see which estimates need attention" },
    ],
  },
];
