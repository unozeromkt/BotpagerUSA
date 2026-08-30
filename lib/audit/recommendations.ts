import type { AuditAnswers, AuditOpportunity, AuditReport, BusinessContext } from "./types";

type RankedOpportunity = AuditOpportunity & { rank: number };

const capabilityLabels = {
  response: "AI Agent + Lead Capture",
  followUp: "CRM + Follow-up Automation",
  demand: "Ads + Local Lead Generation",
  conversion: "Smart Website + Conversion Flow",
  local: "Google Business Profile + Local SEO",
  visibility: "Dashboard + Lead Management",
};

function responseOpportunity(answer: string): RankedOpportunity {
  const highRisk = answer === "often-missed" || answer === "voicemail";
  const delayed = answer === "reply-later";

  return {
    id: "faster-response",
    title: highRisk ? "Respond before interested customers move on" : "Create a faster first response",
    problem: highRisk
      ? "New inquiries may have to wait or try again when your team is unavailable."
      : delayed
        ? "Your team follows up, but the first response can depend on someone becoming available."
        : "Your current response process can be strengthened with a more guided next step.",
    whyItMatters: "Local customers often contact more than one provider, so the first helpful response can shape who they choose.",
    recommendedAction: "Add an immediate website and messaging response that answers common questions, captures intent and guides the prospect to the next step.",
    relatedBotpagerCapability: capabilityLabels.response,
    severity: highRisk ? "high" : delayed ? "medium" : "low",
    rank: highRisk ? 100 : delayed ? 78 : 32,
  };
}

function followUpOpportunity(answer: string): RankedOpportunity {
  const noSystem = answer === "none" || answer === "not-sure";
  const basic = answer === "basic";

  return {
    id: "consistent-follow-up",
    title: noSystem ? "Keep every new lead from falling through the cracks" : "Make follow-up consistent without adding more work",
    problem: noSystem
      ? "There is no dependable system making sure every new inquiry receives the right follow-up."
      : basic
        ? "Basic messages help, but the follow-up process may still stop before a prospect is ready to decide."
        : "Lead tracking and follow-up can be connected more closely to the customer journey.",
    whyItMatters: "Many prospects are interested before they are ready. Consistent, relevant follow-up helps preserve those opportunities.",
    recommendedAction: "Use a simple CRM pipeline with automatic email or text follow-up based on each lead's status and next action.",
    relatedBotpagerCapability: capabilityLabels.followUp,
    severity: noSystem ? "high" : basic ? "medium" : "low",
    rank: noSystem ? 98 : basic ? 84 : answer === "crm-only" ? 66 : 28,
  };
}

function demandOpportunity(source: string, volume: string): RankedOpportunity {
  const lowVolume = volume === "0-10" || volume === "not-sure";
  const referralDependent = source === "referrals" || source === "repeat";

  return {
    id: "predictable-demand",
    title: referralDependent ? "Build a more predictable source of new inquiries" : "Increase qualified local demand",
    problem: referralDependent
      ? "Most growth depends on customers or partners recommending the business."
      : lowVolume
        ? "The current volume of new inquiries leaves room for a stronger lead generation system."
        : "Lead generation can be made easier to measure and improve over time.",
    whyItMatters: "A predictable flow of qualified inquiries makes growth easier to plan and reduces dependence on any single channel.",
    recommendedAction: "Strengthen the local offer and connect focused Google or Meta campaigns to a conversion path that can be tracked.",
    relatedBotpagerCapability: capabilityLabels.demand,
    severity: lowVolume && referralDependent ? "high" : lowVolume || referralDependent ? "medium" : "low",
    rank: lowVolume && referralDependent ? 88 : lowVolume ? 76 : referralDependent ? 70 : 38,
  };
}

function conversionOpportunity(): RankedOpportunity {
  return {
    id: "clear-conversion-path",
    title: "Give every prospect one clear next step",
    problem: "Customers can arrive from different channels with different questions and levels of urgency.",
    whyItMatters: "A simple path to ask a question, request a quote or book can turn more existing interest into real conversations.",
    recommendedAction: "Use a focused, mobile-friendly conversion experience with a clear CTA, short qualification and immediate confirmation.",
    relatedBotpagerCapability: capabilityLabels.conversion,
    severity: "medium",
    rank: 61,
  };
}

function localOpportunity(source: string): RankedOpportunity {
  return {
    id: "local-visibility",
    title: "Turn local visibility into more customer conversations",
    problem: source === "google"
      ? "Google is already an important source of customers, making visibility and conversion there especially valuable."
      : "Local search can provide another path for nearby customers to discover the business.",
    whyItMatters: "People searching locally often have immediate intent and compare trust signals before contacting a provider.",
    recommendedAction: "Keep the Google Business Profile, local relevance and website conversion path working as one connected system.",
    relatedBotpagerCapability: capabilityLabels.local,
    severity: source === "google" ? "medium" : "low",
    rank: source === "google" ? 73 : 45,
  };
}

function trackingOpportunity(volume: string): RankedOpportunity {
  return {
    id: "lead-visibility",
    title: "Know which inquiries are becoming customers",
    problem: volume === "not-sure"
      ? "Monthly inquiry volume is not currently easy to see."
      : "Lead sources, response and outcomes may live in separate places.",
    whyItMatters: "Clear visibility makes it easier to invest in what is working and fix the steps where opportunities are being lost.",
    recommendedAction: "Bring leads, conversations and outcomes into one simple dashboard with consistent statuses.",
    relatedBotpagerCapability: capabilityLabels.visibility,
    severity: volume === "not-sure" ? "medium" : "low",
    rank: volume === "not-sure" ? 82 : 42,
  };
}

export function getPreliminaryOpportunities(answers: AuditAnswers): AuditOpportunity[] {
  const candidates = [
    responseOpportunity(answers.missed_inquiry_handling),
    followUpOpportunity(answers.crm_follow_up),
    demandOpportunity(answers.lead_source, answers.monthly_inquiries),
    conversionOpportunity(),
    localOpportunity(answers.lead_source),
    trackingOpportunity(answers.monthly_inquiries),
  ];

  return candidates
    .sort((left, right) => right.rank - left.rank)
    .slice(0, 3)
    .map(({ rank: _rank, ...opportunity }) => opportunity);
}

export function buildFallbackReport(business: BusinessContext, answers: AuditAnswers): AuditReport {
  const opportunities = getPreliminaryOpportunities(answers);
  const location = [business.city, business.state].filter(Boolean).join(", ");
  const businessType = business.industry || "local service business";
  const recommendedSystem = answers.lead_source === "google" || opportunities.some((item) => item.id === "local-visibility")
    ? "BotPager Local Growth System"
    : "BotPager Growth System";

  return {
    businessSummary: `Your ${businessType.toLowerCase()}${location ? ` in ${location}` : ""} has a practical opportunity to connect lead generation, response and follow-up into a simpler customer journey. The priorities below focus on the areas most likely to reduce missed inquiries and create more consistent growth.`,
    opportunities,
    recommendedSystem,
    recommendationReason: recommendedSystem === "BotPager Local Growth System"
      ? "Your answers point to an opportunity to improve both how local customers find the business and what happens after they make contact. This system combines local visibility with faster response, lead management and automatic follow-up."
      : "Your strongest opportunities are centered on capturing inquiries, responding faster and following up consistently. This system connects those steps without adding a complicated process for your team.",
  };
}
