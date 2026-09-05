import { growthQuestions } from "./config";
import type { GrowthAnswers, GrowthCategory, GrowthInsight, GrowthLevel, GrowthResult } from "./types";

export const growthLevels: GrowthLevel[] = [
  {
    id: "getting-started",
    number: 1,
    name: "Getting Started",
    shortName: "Start",
    minScore: 0,
    headline: "Your foundation is the next winning move.",
    description: "The opportunity is wide open: build a credible home base and make it simple for nearby customers to find and contact you.",
    nextLevel: "Online",
    package: {
      name: "Foundation Pack",
      price: 397,
      description: "Get the essentials in place so your business can look credible, get discovered and capture every opportunity.",
      features: ["Conversion-ready website", "Google presence setup", "Simple lead capture"],
    },
  },
  {
    id: "online",
    number: 2,
    name: "Online",
    shortName: "Online",
    minScore: 20,
    headline: "You are online. Now it is time to get noticed.",
    description: "Your digital foundation exists, but consistent visibility is the move that unlocks more opportunities.",
    nextLevel: "Getting Found",
    package: {
      name: "Visibility Pack",
      price: 597,
      description: "Turn your online presence into a dependable discovery engine for customers in your service area.",
      features: ["Local search improvements", "Google profile growth", "Review generation system"],
    },
  },
  {
    id: "getting-found",
    number: 3,
    name: "Getting Found",
    shortName: "Found",
    minScore: 40,
    headline: "Attention is arriving. Make more of it count.",
    description: "People can discover your business. Your biggest upside is turning more of that attention into real conversations and bookings.",
    nextLevel: "Converting",
    package: {
      name: "Conversion Pack",
      price: 797,
      description: "Convert more website and campaign traffic with instant answers, easier next steps and persistent follow-up.",
      features: ["24/7 instant response", "Online quote or booking path", "Multi-touch lead follow-up"],
    },
  },
  {
    id: "converting",
    number: 4,
    name: "Converting",
    shortName: "Convert",
    minScore: 60,
    headline: "You convert leads. Now build the engine.",
    description: "The pieces are working. Connecting response, follow-up and visibility will make growth more predictable and easier to manage.",
    nextLevel: "Growth Engine",
    package: {
      name: "Growth Engine Pack",
      price: 997,
      description: "Connect the customer journey from first click to booked job and give your team one clear growth system.",
      features: ["Connected lead journey", "Automated nurturing", "Source-to-customer tracking"],
    },
  },
  {
    id: "growth-engine",
    number: 5,
    name: "Growth Engine",
    shortName: "Engine",
    minScore: 80,
    headline: "Your growth engine is running. Keep raising the ceiling.",
    description: "You have a strong customer journey. The next move is continuous optimization: better channels, sharper conversion and clearer performance.",
    nextLevel: "Scale & Optimize",
    package: {
      name: "Scale Pack",
      price: 1297,
      description: "Keep improving the complete growth system with campaigns, conversion experiments and decision-ready reporting.",
      features: ["Growth campaign optimization", "Conversion improvements", "Performance reporting"],
    },
  },
];

const insightCopy: Record<GrowthCategory, { win: GrowthInsight; opportunity: GrowthInsight }> = {
  foundation: {
    win: { category: "foundation", title: "A credible online home base", description: "Your website gives customers a clear place to understand and trust the business." },
    opportunity: { category: "foundation", title: "Build a stronger home base", description: "Create a clear, modern website that turns local interest into calls and quote requests." },
  },
  visibility: {
    win: { category: "visibility", title: "Local customers can discover you", description: "Your Google presence is already helping nearby customers find the business." },
    opportunity: { category: "visibility", title: "Become easier to find locally", description: "Improve your Google presence, local relevance and review activity to win more searches." },
  },
  demand: {
    win: { category: "demand", title: "You create steady opportunities", description: "Your online channels are already bringing new people into the customer journey." },
    opportunity: { category: "demand", title: "Create a reliable lead source", description: "Build a repeatable way to attract the right local customers instead of waiting for referrals." },
  },
  response: {
    win: { category: "response", title: "You respond while interest is high", description: "Customers get a quick next step, even when the team is busy or unavailable." },
    opportunity: { category: "response", title: "Win the first five minutes", description: "A fast, useful response can keep new inquiries from moving on to the next provider." },
  },
  followUp: {
    win: { category: "followUp", title: "Good leads stay in play", description: "Your follow-up gives interested customers more than one chance to take the next step." },
    opportunity: { category: "followUp", title: "Stop letting warm leads disappear", description: "Add a consistent follow-up sequence so opportunities do not depend on team memory." },
  },
  conversion: {
    win: { category: "conversion", title: "The next step is easy", description: "Customers can move from interest to a quote or booking without unnecessary friction." },
    opportunity: { category: "conversion", title: "Make it easier to say yes", description: "Give visitors a simple online path to request a quote, share details or choose a time." },
  },
  tracking: {
    win: { category: "tracking", title: "You know what creates customers", description: "Clear lead outcomes help you invest in the channels and actions that actually work." },
    opportunity: { category: "tracking", title: "See what turns into revenue", description: "Connect lead source and outcome so every growth decision is based on real results." },
  },
};

export function getGrowthScore(answers: Partial<GrowthAnswers>) {
  const earned = growthQuestions.reduce((total, question) => {
    const selected = question.options.find((option) => option.value === answers[question.key]);
    return total + (selected?.points ?? 0);
  }, 0);
  return Math.round((earned / (growthQuestions.length * 3)) * 100);
}

export function getGrowthLevel(score: number) {
  return [...growthLevels].reverse().find((level) => score >= level.minScore) ?? growthLevels[0];
}

export function calculateGrowthResult(answers: GrowthAnswers): GrowthResult {
  const categoryTotals = new Map<GrowthCategory, { earned: number; possible: number }>();

  for (const question of growthQuestions) {
    const selected = question.options.find((option) => option.value === answers[question.key]);
    const current = categoryTotals.get(question.category) ?? { earned: 0, possible: 0 };
    categoryTotals.set(question.category, {
      earned: current.earned + (selected?.points ?? 0),
      possible: current.possible + 3,
    });
  }

  const ranked = [...categoryTotals.entries()]
    .map(([category, values]) => ({ category, ratio: values.earned / values.possible }))
    .sort((a, b) => b.ratio - a.ratio);

  const wins = ranked.slice(0, 2).map(({ category }) => insightCopy[category].win);
  const opportunities = [...ranked].reverse().slice(0, 3).map(({ category }) => insightCopy[category].opportunity);
  const score = getGrowthScore(answers);

  return { score, level: getGrowthLevel(score), wins, opportunities };
}
