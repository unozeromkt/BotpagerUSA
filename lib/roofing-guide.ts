import { ROOFING_AUDIT_HREF } from "./audit/roofing-questions";

export const roofingGuideMoments = {
  hero: { label: "Your always-on teammate", text: "You handle the roof. I’ll handle the next inquiry, 24/7.", link: null, href: null },
  services: { label: "A little extra help", text: "I answer homeowners’ questions while your crew is on the job.", link: null, href: null },
  booking: { label: "No extra booking fee", text: "I can book visits automatically. It’s included in your BotPager plan.", link: "See how I book visits", href: "#booking-title" },
  answers: { label: "Your knowledge. My replies.", text: "Repairs, materials, service areas… I learn your business to help your customers.", link: "Questions I can answer", href: "#answers-title" },
  faq: { label: "You’re still in control", text: "Need an on-site expert? I collect the details and hand them to your team.", link: "See how it works", href: "#roofing-faq-title" },
  audit: { label: "Let’s put me to work", text: "Let’s find the inquiries you could turn into your next booked job.", link: "Get my free audit", href: ROOFING_AUDIT_HREF },
} as const;

export type RoofingGuideMoment = keyof typeof roofingGuideMoments;
