import { getAnswerLabel } from "./questions";
import { getRoofingServiceLabel } from "./roofing-questions";
import type { AuditOpportunity, AuditReport, BusinessContext, RoofingAuditAnswers } from "./types";

type RankedOpportunity = AuditOpportunity & { rank: number };

export function getRoofingOpportunities(business: BusinessContext, answers: RoofingAuditAnswers): AuditOpportunity[] {
  const service = getRoofingServiceLabel(business.roofingService).toLowerCase();
  const afterHours = answers.missed_inquiry_handling;
  const booking = answers.inspection_booking;
  const followUp = answers.estimate_follow_up;
  const alreadyResponding = afterHours === "automatic-response" || afterHours === "live-team";
  const onlineBooking = booking === "online-calendar";
  const automatedFollowUp = followUp === "automated";
  const unknownFlow = answers.monthly_inquiries === "not-sure" || answers.lead_source === "not-sure";
  const lowVolume = answers.monthly_inquiries === "0-10" || answers.monthly_inquiries === "11-25";
  const referralLed = answers.lead_source === "referrals";
  const location = [business.city, business.state].filter(Boolean).join(", ");

  const candidates: RankedOpportunity[] = [
    {
      id: "roofing-response",
      title: alreadyResponding ? "Connect your first response to the inspection" : "Give roofing inquiries a next step, even after hours",
      problem: alreadyResponding
        ? "You already provide a prompt response. The next opportunity is to connect that conversation with the details needed for a roofing visit."
        : afterHours === "often-missed"
          ? "You told us some inquiries get missed while the team is busy. These requests may not reach the inspection stage."
          : afterHours === "voicemail"
            ? "New roofing inquiries reach voicemail when your team is unavailable, leaving customers waiting for a callback."
            : "New roofing inquiries wait until someone can respond, including when your crew is on a job or after hours.",
      whyItMatters: `Someone asking about ${service} needs clear answers about your services, coverage and next steps before a visit can be arranged.`,
      recommendedAction: alreadyResponding
        ? `Keep your existing response coverage and capture the property location, ${service} request and preferred visit time in one conversation. Pass inspection-dependent questions to your team.`
        : `Configure a 24/7 AI agent with your ${service} information and service area. Have it answer common questions, collect the property and project details, and guide eligible inquiries toward an inspection. Hand urgent or specialist requests to your team.`,
      relatedBotpagerCapability: "AI Agent + Lead Capture",
      severity: alreadyResponding ? "low" : afterHours === "reply-later" ? "medium" : "high",
      rank: alreadyResponding ? 20 : afterHours === "often-missed" ? 100 : afterHours === "voicemail" ? 95 : 85,
    },
    {
      id: "roofing-inspections",
      title: onlineBooking ? "Prepare your crew before each booked inspection" : "Make roof inspections easier to book",
      problem: onlineBooking
        ? "Customers can already choose a visit time online. Booking details and preparation can be the next area to refine."
        : booking === "no-process"
          ? "Inspection scheduling depends on who receives the inquiry, so there is no consistent path to a confirmed visit."
          : booking === "messages"
            ? "Your team coordinates visits through text or email, which adds back-and-forth before a time is confirmed."
            : booking === "request-form"
              ? "Your form captures the request, but a customer still needs to wait for your team to confirm an inspection time."
              : "Customers need to reach your team by phone before availability can be checked and a visit booked.",
      whyItMatters: "A clear booking process connects an interested customer with an available inspection slot and gives your crew the information it needs.",
      recommendedAction: onlineBooking
        ? `Keep your existing calendar and review how property details, ${service} requests, confirmations and reminders reach your inspection team.`
        : `Connect available inspection slots to your calendar, service area and visit rules. Collect the property address and ${service} details, confirm eligible bookings, and send reminders. Route visits needing approval to your team. Appointment booking is included in your BotPager plan.`,
      relatedBotpagerCapability: "Quote / Booking Automation",
      severity: onlineBooking ? "low" : booking === "no-process" ? "high" : "medium",
      rank: onlineBooking ? 21 : booking === "no-process" ? 98 : 88,
    },
    {
      id: "roofing-estimates",
      title: automatedFollowUp ? "Keep automated estimate follow-up relevant" : "Give every open roofing estimate a next action",
      problem: automatedFollowUp
        ? "You already follow up automatically. The next opportunity is to review how messages reflect each estimate’s current status."
        : followUp === "none"
          ? "After sending an estimate, you usually wait for the customer. There is no planned follow-up to address unanswered questions."
          : followUp === "not-sure"
            ? "You cannot easily see which estimates need attention, making it difficult to prioritize the next contact."
            : followUp === "one-manual"
              ? "Your team follows up once after an estimate. Further contact depends on whether someone picks the conversation up again."
              : "Your team follows up several times, but each attempt still requires manual work.",
      whyItMatters: `Customers considering ${service} may need to discuss scope, materials, timing or options before making a decision.`,
      recommendedAction: automatedFollowUp
        ? "Review estimate statuses and stop rules: pause reminders when a customer replies, accepts, declines or opts out. Keep specialist questions with your estimator."
        : "Track estimates as sent, awaiting response, accepted or declined. Set helpful follow-ups that invite questions and alert your estimator when a customer responds. Stop or adjust messages when the status changes or the customer opts out.",
      relatedBotpagerCapability: "CRM + Follow-up Automation",
      severity: automatedFollowUp ? "low" : followUp === "none" || followUp === "not-sure" ? "high" : "medium",
      rank: automatedFollowUp ? 22 : followUp === "none" ? 97 : followUp === "not-sure" ? 94 : followUp === "one-manual" ? 86 : 75,
    },
    {
      id: unknownFlow ? "roofing-lead-tracking" : "roofing-local-demand",
      title: unknownFlow ? "See which roofing inquiries become inspections" : referralLed ? "Build on referrals with a measurable local lead source" : "Connect local roofing demand to booked visits",
      problem: unknownFlow
        ? "You are not sure about your inquiry volume or primary source. That makes the opportunity at each stage harder to measure."
        : `You reported ${getAnswerLabel("monthly_inquiries", answers.monthly_inquiries, "roofing")} inquiries in a typical month, mainly from ${getAnswerLabel("lead_source", answers.lead_source, "roofing").toLowerCase()}. This is your starting point for reviewing the path to booked work.`,
      whyItMatters: "Seeing the source, inspection and estimate outcome together helps your team decide where to focus its time and marketing effort.",
      recommendedAction: unknownFlow
        ? "Track the source of each new roofing inquiry and its progress through inspection requested, inspection booked, estimate sent and job won or lost. Use that baseline before setting growth targets."
        : `Review the path from ${answers.lead_source === "google" ? "your Google Business Profile" : answers.lead_source === "paid-ads" ? "your paid campaigns" : "local discovery"} to a dedicated ${service} page${location ? ` for ${location}` : ""}, with a clear inspection request. Record which inquiries become visits and accepted estimates before expanding campaigns.`,
      relatedBotpagerCapability: unknownFlow ? "Dashboard + Lead Management" : answers.lead_source === "paid-ads" ? "Ads + Local Lead Generation" : "Google Business Profile + Local SEO",
      severity: unknownFlow || lowVolume ? "medium" : "low",
      rank: unknownFlow ? 90 : lowVolume && referralLed ? 89 : lowVolume ? 80 : 40,
    },
  ];
  return candidates.sort((a, b) => b.rank - a.rank).slice(0, 3).map(({ rank: _rank, ...opportunity }) => opportunity);
}

export function buildRoofingReport(business: BusinessContext, answers: RoofingAuditAnswers): AuditReport {
  const opportunities = getRoofingOpportunities(business, answers);
  const service = getRoofingServiceLabel(business.roofingService).toLowerCase();
  const location = [business.city, business.state].filter(Boolean).join(", ");
  const localFocus = opportunities.some(item => item.id === "roofing-local-demand");
  const focusAreas: Record<string, string> = {
    "roofing-response": "lead response",
    "roofing-inspections": "inspection scheduling",
    "roofing-estimates": "estimate follow-up",
    "roofing-lead-tracking": "lead tracking",
    "roofing-local-demand": "local lead generation",
  };
  const priorities = opportunities.map(item => focusAreas[item.id]);
  return {
    businessSummary: `Your roofing business${location ? ` in ${location}` : ""} wants more inquiries for ${service}. Based on your answers, the priorities below focus on how inquiries are answered, inspections are booked and estimates move toward a decision. This is a diagnosis of the process you described, not an inspection of your website or Google profile.`,
    opportunities,
    recommendedSystem: localFocus ? "BotPager Local Growth System" : "BotPager Growth System",
    recommendationReason: `For ${service}, prioritize ${priorities.slice(0, -1).join(", ")} and ${priorities.at(-1)}. ${localFocus ? "Connect local visibility with a clear inspection and follow-up process." : "Connect your existing lead flow, calendar and estimate follow-up while preserving the parts of your process that already work."}`,
  };
}
