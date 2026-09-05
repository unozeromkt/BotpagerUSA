import type { GrowthCategory, GrowthQuestionKey } from "./types";

export type GrowthQuestion = {
  key: GrowthQuestionKey;
  category: GrowthCategory;
  kicker: string;
  question: string;
  helper: string;
  options: Array<{
    value: string;
    label: string;
    description: string;
    points: number;
  }>;
};

export const growthQuestions: GrowthQuestion[] = [
  {
    key: "website",
    category: "foundation",
    kicker: "Your home base",
    question: "What best describes your website today?",
    helper: "Choose the answer that feels closest — perfection is not the goal.",
    options: [
      { value: "none", label: "I don't have one yet", description: "Customers rely on social pages, directories or word of mouth.", points: 0 },
      { value: "basic", label: "It exists, but it's basic", description: "It shares information but does not consistently create inquiries.", points: 1 },
      { value: "professional", label: "Professional and up to date", description: "It clearly explains what we do and makes us look credible.", points: 2 },
      { value: "conversion-ready", label: "Built to win customers", description: "It is fast, focused and turns visits into calls, forms or bookings.", points: 3 },
    ],
  },
  {
    key: "google_visibility",
    category: "visibility",
    kicker: "Getting discovered",
    question: "Can nearby customers find you on Google?",
    helper: "Think about what happens when someone searches for your service in your city.",
    options: [
      { value: "not-visible", label: "Not really", description: "We rarely appear, or I am not sure where we show up.", points: 0 },
      { value: "profile", label: "We have a Google profile", description: "The listing exists, but we do not actively improve it.", points: 1 },
      { value: "sometimes", label: "We show up sometimes", description: "Customers find us for a few searches or locations.", points: 2 },
      { value: "strong", label: "We are easy to find", description: "We rank well, have fresh reviews and receive regular Google leads.", points: 3 },
    ],
  },
  {
    key: "lead_generation",
    category: "demand",
    kicker: "Creating demand",
    question: "How consistently do you generate leads online?",
    helper: "Include Google, social media, paid campaigns and your website.",
    options: [
      { value: "none", label: "No consistent source", description: "Most new business arrives unpredictably or through referrals.", points: 0 },
      { value: "occasional", label: "Occasionally", description: "We post or run promotions from time to time.", points: 1 },
      { value: "one-channel", label: "One reliable channel", description: "At least one source creates a steady flow of opportunities.", points: 2 },
      { value: "multi-channel", label: "Several reliable channels", description: "We actively invest in and improve multiple lead sources.", points: 3 },
    ],
  },
  {
    key: "response_speed",
    category: "response",
    kicker: "Winning the moment",
    question: "How quickly do new inquiries hear from you?",
    helper: "Use your typical response time during a busy workday.",
    options: [
      { value: "next-day", label: "Usually the next day", description: "We respond when someone has time to get back to them.", points: 0 },
      { value: "few-hours", label: "Within a few hours", description: "Most leads hear back during the same business day.", points: 1 },
      { value: "under-30", label: "Within 30 minutes", description: "We move quickly when a new inquiry comes in.", points: 2 },
      { value: "instant", label: "Almost instantly", description: "Every lead is acknowledged and guided right away.", points: 3 },
    ],
  },
  {
    key: "after_hours",
    category: "response",
    kicker: "After-hours experience",
    question: "What happens when someone contacts you after hours?",
    helper: "Picture an ideal customer reaching out tonight or this weekend.",
    options: [
      { value: "waits", label: "They wait until we reopen", description: "There is no immediate reply or next step.", points: 0 },
      { value: "voicemail", label: "They can leave a message", description: "We review voicemail, email or forms later.", points: 1 },
      { value: "acknowledged", label: "They receive a quick reply", description: "An instant message confirms that we received the inquiry.", points: 2 },
      { value: "qualified", label: "They can keep moving", description: "They get answers, share details and can request a time or quote.", points: 3 },
    ],
  },
  {
    key: "follow_up",
    category: "followUp",
    kicker: "Staying in the game",
    question: "What happens when a lead does not respond?",
    helper: "Many good customers need more than one helpful follow-up.",
    options: [
      { value: "none", label: "We usually move on", description: "There is no consistent second attempt.", points: 0 },
      { value: "one-manual", label: "We try once more", description: "Someone calls or messages again when they remember.", points: 1 },
      { value: "several-manual", label: "We make several attempts", description: "The team follows a repeatable but mostly manual routine.", points: 2 },
      { value: "consistent", label: "Every lead gets a full follow-up", description: "Helpful messages continue automatically until there is an answer.", points: 3 },
    ],
  },
  {
    key: "online_conversion",
    category: "conversion",
    kicker: "Removing friction",
    question: "Can customers take the next step online?",
    helper: "A clear next step helps turn interest into a real opportunity.",
    options: [
      { value: "call-only", label: "They need to call us", description: "There is no online form, quote request or booking option.", points: 0 },
      { value: "contact-form", label: "They can send a basic form", description: "We collect their name and contact information.", points: 1 },
      { value: "detailed-request", label: "They can request a quote", description: "We capture enough details to prepare the next conversation.", points: 2 },
      { value: "book-or-quote", label: "They can book or request a quote", description: "The next action is fast, clear and available at any time.", points: 3 },
    ],
  },
  {
    key: "lead_tracking",
    category: "tracking",
    kicker: "Knowing what works",
    question: "Do you know which leads become customers?",
    helper: "Choose the best description of the visibility you have today.",
    options: [
      { value: "unknown", label: "Not consistently", description: "It is hard to connect inquiries to booked work.", points: 0 },
      { value: "notes", label: "We piece it together", description: "The information lives in inboxes, notes or team memory.", points: 1 },
      { value: "partial", label: "We track most of it", description: "We can usually see the source and outcome of a lead.", points: 2 },
      { value: "clear", label: "Yes, clearly", description: "We can see what creates leads, bookings and revenue.", points: 3 },
    ],
  },
];

export function getGrowthAnswerLabel(key: GrowthQuestionKey, value: string) {
  const question = growthQuestions.find((item) => item.key === key);
  return question?.options.find((option) => option.value === value)?.label ?? value;
}
