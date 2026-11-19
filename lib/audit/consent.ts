// Shared verbatim by the form and the server-side consent evidence.
export const auditConsent = {
  email: "I agree that BotPager may use this information to prepare and email my audit. I can unsubscribe from marketing emails at any time.",
  smsTransactional: "I consent to receive non-marketing text messages from BotPager, operated by Uno Zero Marketing LLC, about my Growth Audit, appointment reminders, and follow-up related to my request. Message frequency may vary. Message and data rates may apply. Text HELP for assistance, reply STOP to opt out.",
  smsMarketing: "I consent to receive promotional and marketing SMS messages from BotPager, operated by Uno Zero Marketing LLC, about special offers, discounts, and service updates. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is not a condition of purchase.",
} as const;

export const AUDIT_CONSENT_VERSION = "2026-11-19";
