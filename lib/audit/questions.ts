import type { AuditAnswerKey } from "./types";

export type AuditQuestion = {
  key: AuditAnswerKey;
  eyebrow: string;
  question: string;
  helper: string;
  options: Array<{
    value: string;
    label: string;
    description: string;
  }>;
};

export const auditQuestions: AuditQuestion[] = [
  {
    key: "lead_source",
    eyebrow: "Finding new customers",
    question: "How do most new customers currently find your business?",
    helper: "Choose the source that brings you the most new opportunities today.",
    options: [
      { value: "google", label: "Google", description: "Search results or Google Maps" },
      { value: "referrals", label: "Referrals", description: "Word of mouth and recommendations" },
      { value: "social", label: "Social media", description: "Facebook, Instagram or other platforms" },
      { value: "paid-ads", label: "Paid advertising", description: "Google, Meta or other paid campaigns" },
      { value: "repeat", label: "Repeat customers", description: "Existing customers returning" },
      { value: "mixed", label: "A mix of sources", description: "No single source dominates" },
    ],
  },
  {
    key: "monthly_inquiries",
    eyebrow: "Current lead flow",
    question: "About how many new inquiries do you receive in a typical month?",
    helper: "A rough estimate is enough. This helps us prioritize the right opportunities.",
    options: [
      { value: "0-10", label: "0–10", description: "A few inquiries each month" },
      { value: "11-25", label: "11–25", description: "A steady but limited flow" },
      { value: "26-50", label: "26–50", description: "Consistent monthly demand" },
      { value: "51-100", label: "51–100", description: "A strong volume of inquiries" },
      { value: "100+", label: "100+", description: "High-volume lead flow" },
      { value: "not-sure", label: "Not sure", description: "We do not track this yet" },
    ],
  },
  {
    key: "missed_inquiry_handling",
    eyebrow: "Response experience",
    question: "What happens when someone contacts you and you cannot respond immediately?",
    helper: "Think about evenings, weekends and moments when your team is busy.",
    options: [
      { value: "automatic-response", label: "They get an automatic response", description: "A message acknowledges them right away" },
      { value: "booking-link", label: "They can book online", description: "They can choose a time without waiting" },
      { value: "reply-later", label: "We reply later", description: "Someone follows up when available" },
      { value: "voicemail", label: "They reach voicemail", description: "They need to leave a message" },
      { value: "often-missed", label: "Some inquiries get missed", description: "There is no consistent process" },
    ],
  },
  {
    key: "crm_follow_up",
    eyebrow: "Follow-up system",
    question: "Do you currently use a CRM or automated follow-up system?",
    helper: "Select the option that best describes how new inquiries are managed.",
    options: [
      { value: "crm-automation", label: "CRM + automation", description: "Leads are tracked and followed up automatically" },
      { value: "crm-only", label: "CRM only", description: "Leads are tracked, but follow-up is mostly manual" },
      { value: "basic", label: "Basic email or text", description: "We use a few templates or reminders" },
      { value: "none", label: "No system", description: "Follow-up depends on the team remembering" },
      { value: "not-sure", label: "Not sure", description: "I am not sure what is currently set up" },
    ],
  },
  {
    key: "average_customer_value",
    eyebrow: "Customer value",
    question: "What is the approximate value of an average new customer or booked job?",
    helper: "This helps us understand the potential impact of each missed opportunity.",
    options: [
      { value: "under-250", label: "Under $250", description: "Smaller or recurring transactions" },
      { value: "250-1000", label: "$250–$1,000", description: "Typical local service work" },
      { value: "1000-5000", label: "$1,000–$5,000", description: "Higher-value jobs or projects" },
      { value: "5000+", label: "$5,000+", description: "Large projects or long-term customers" },
      { value: "varies", label: "It varies", description: "Customer value changes significantly" },
      { value: "not-sure", label: "Not sure", description: "We do not track this yet" },
    ],
  },
];

export function getAnswerLabel(key: AuditAnswerKey, value: string) {
  const question = auditQuestions.find((item) => item.key === key);
  return question?.options.find((option) => option.value === value)?.label ?? value;
}
