export type GrowthQuestionKey =
  | "website"
  | "google_visibility"
  | "lead_generation"
  | "response_speed"
  | "after_hours"
  | "follow_up"
  | "online_conversion"
  | "lead_tracking";

export type GrowthAnswers = Record<GrowthQuestionKey, string>;

export type GrowthCategory =
  | "foundation"
  | "visibility"
  | "demand"
  | "response"
  | "followUp"
  | "conversion"
  | "tracking";

export type GrowthLevelId = "getting-started" | "online" | "getting-found" | "converting" | "growth-engine";

export type GrowthLevel = {
  id: GrowthLevelId;
  number: number;
  name: string;
  shortName: string;
  minScore: number;
  headline: string;
  description: string;
  nextLevel: string;
  package: {
    name: string;
    price: number;
    description: string;
    features: string[];
  };
};

export type GrowthInsight = {
  category: GrowthCategory;
  title: string;
  description: string;
};

export type GrowthResult = {
  score: number;
  level: GrowthLevel;
  wins: GrowthInsight[];
  opportunities: GrowthInsight[];
};

export type GrowthContact = {
  name: string;
  email: string;
  businessName: string;
  phone: string;
  consent: boolean;
  websiteTrap?: string;
};

export type GrowthTracking = {
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export type GrowthSubmission = {
  answers: GrowthAnswers;
  contact: GrowthContact;
  tracking?: GrowthTracking;
};

export type GrowthApiResponse = {
  ok: boolean;
  result?: GrowthResult;
  delivery?: "crm_saved" | "preview" | "failed";
  message?: string;
};
