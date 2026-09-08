export type ArchitectureItem = {
  slug: string;
  href: string;
  name: string;
  title: string;
  description: string;
  eyebrow: string;
  challenges: string[];
  capabilities: string[];
  outcome: string;
  relatedLinks: { href: string; label: string }[];
};

export type ServicePageContent = ArchitectureItem & {
  seoTitle: string;
  overview: string[];
  details: { title: string; text: string }[];
  process: { title: string; text: string }[];
  faqs: { question: string; answer: string }[];
};

export type IndustryPageContent = ArchitectureItem & {
  seoTitle: string;
  introduction: string[];
  acquisitionProblems: { title: string; text: string }[];
  system: { title: string; text: string }[];
  smartWebsiteFeatures: string[];
  aiUseCases: string[];
  followUpUseCases: string[];
  localSeoStrategy: string[];
  paidSearchUseCases: string[];
  faqs: { question: string; answer: string }[];
};

export const servicePages: ServicePageContent[] = [
  {
    slug: "smart-websites",
    href: "/services/smart-websites",
    name: "Smart Websites",
    seoTitle: "Websites for Local Service Businesses",
    title: "Smart Websites Built to Turn Local Visitors Into Customers",
    description:
      "Conversion-focused websites for local service businesses, built to explain your services clearly, capture qualified leads, and support follow-up.",
    eyebrow: "Conversion-focused websites",
    overview: [
      "A local service business website should do more than introduce the company. It should help the right visitor recognize that you solve their problem, understand where you work, trust the next step, and contact you without friction.",
      "BotPager plans Smart Websites around that customer journey. Service pages, calls, forms, quote requests, and booking paths connect to the response and follow-up systems behind the site, giving each inquiry a clearer route forward.",
    ],
    details: [
      { title: "Clear service journeys", text: "Organize the site around the services customers actually need, with useful context for local visitors and a logical path from research to action." },
      { title: "Conversion paths that fit the job", text: "Use calls, forms, quote requests, or booking flows according to the way customers buy the service instead of forcing every visitor through the same generic form." },
      { title: "Connected lead capture", text: "Route customer details into the systems used for response, tracking, and follow-up so the website becomes part of the sales process." },
    ],
    process: [
      { title: "Map the customer journey", text: "Identify priority services, customer questions, service areas, trust signals, and the most useful conversion action for each page." },
      { title: "Build the conversion structure", text: "Create a mobile-first experience with focused page sections, descriptive navigation, accessible calls to action, and clear lead-capture paths." },
      { title: "Connect and measure", text: "Align forms, calls, booking actions, CRM routing, and analytics so the business can see and improve what happens after a visit." },
    ],
    challenges: [
      "Visitors cannot quickly understand the service, service area, or next step.",
      "Forms and calls are disconnected from customer tracking and follow-up.",
      "A brochure-style site gets traffic but does not create enough qualified conversations.",
    ],
    capabilities: [
      "Mobile-first service and conversion paths",
      "Calls, forms, quote requests, and booking flows",
      "Connections to AI response, CRM, analytics, and follow-up",
    ],
    outcome:
      "A clearer customer journey that turns more local visits into trackable inquiries and booked opportunities.",
    relatedLinks: [
      { href: "/services/ai-agent", label: "Add an AI receptionist" },
      { href: "/industries/home-services", label: "Explore the home services approach" },
      { href: "/services/local-seo-geo", label: "Build local search visibility" },
    ],
    faqs: [
      { question: "What makes a Smart Website different from a standard business website?", answer: "A Smart Website is planned around customer actions and connected workflows. It combines clear service information with lead capture, tracking, AI response, CRM routing, and follow-up where those capabilities fit the business." },
      { question: "Can the website match my existing brand?", answer: "Yes. The structure and conversion paths can be adapted to your logo, colors, services, service area, voice, and customer journey." },
      { question: "Can you build service and industry-specific landing pages?", answer: "Yes. The architecture can support focused service, industry, and campaign pages when each page has distinct customer intent and useful original content." },
      { question: "Will calls and forms connect to the CRM?", answer: "They can. BotPager can connect supported calls, forms, booking paths, and customer details to the CRM and follow-up workflow selected for the project." },
    ],
  },
  {
    slug: "ai-agent",
    href: "/services/ai-agent",
    name: "AI Agent",
    seoTitle: "AI Receptionist for Local Businesses",
    title: "AI Receptionist That Responds to Leads 24/7",
    description:
      "An AI receptionist for local businesses that answers common questions, captures and qualifies leads, and supports 24/7 customer response.",
    eyebrow: "24/7 lead response",
    overview: [
      "Local customers often contact several businesses while their need is still urgent. An AI receptionist gives new website and messaging inquiries a helpful first response even when the owner or field team cannot answer immediately.",
      "BotPager configures the AI agent around approved business information and a defined conversation flow. It can answer common questions, collect contact and service details, qualify the opportunity, and move the customer toward a quote, booking, or human conversation.",
    ],
    details: [
      { title: "Helpful first response", text: "Give prospects a useful answer when they reach out instead of leaving them at an empty form or waiting for business hours." },
      { title: "Lead capture and qualification", text: "Collect the contact details, requested service, timing, and other approved qualification information your team needs for the next step." },
      { title: "Clear human handoff", text: "Define when the AI should continue, when it should route the conversation, and which situations require direct help from a person." },
    ],
    process: [
      { title: "Define approved knowledge", text: "Document services, service areas, business hours, common questions, booking rules, and topics that require human assistance." },
      { title: "Design the conversation", text: "Set the tone, qualification questions, contact capture, next actions, and handoff conditions for each connected channel." },
      { title: "Connect the follow-up", text: "Send qualified inquiry details to the CRM or team workflow so the conversation has an owner and a visible next step." },
    ],
    challenges: [
      "New inquiries arrive while the team is working, driving, or off the clock.",
      "Slow first responses give high-intent prospects time to contact another provider.",
      "Repeated questions and early qualification consume valuable team time.",
    ],
    capabilities: [
      "Approved answers to common customer questions",
      "Lead capture and qualification across connected channels",
      "Defined escalation and human handoff workflows",
    ],
    outcome:
      "Every new inquiry can receive a prompt, consistent response while customer interest is still high.",
    relatedLinks: [
      { href: "/services/crm-automations", label: "Connect automated follow-up" },
      { href: "/industries/plumbing", label: "See the plumbing use case" },
      { href: "/industries/hvac", label: "See the HVAC use case" },
    ],
    faqs: [
      { question: "What can the AI receptionist do?", answer: "It can answer approved common questions, collect contact and service details, qualify an inquiry, and guide the customer toward a quote request, booking step, or human handoff." },
      { question: "Can it respond outside business hours?", answer: "Yes. The AI receptionist is designed to provide a first response at any time, subject to the channels and workflows configured for the business." },
      { question: "Does the AI replace my staff?", answer: "No. It supports the first-response and information-gathering workflow. The business defines when a conversation should be handed to a person and which decisions remain with the team." },
      { question: "Can it work across more than one channel?", answer: "BotPager can configure supported web chat, SMS, and connected messaging channels so the response experience follows consistent business information and handoff rules." },
    ],
  },
  {
    slug: "crm-automations",
    href: "/services/crm-automations",
    name: "CRM & Automations",
    seoTitle: "CRM & Lead Follow-Up Automation for Local Businesses",
    title: "Turn More Leads Into Customers With Automated Follow-Up",
    description:
      "CRM and lead follow-up automation for local businesses, with organized conversations, pipeline stages, reminders, SMS, and email workflows.",
    eyebrow: "Organized lead follow-up",
    overview: [
      "A lead is difficult to convert when the conversation is spread across phones, inboxes, notes, and individual team members. A connected CRM gives the business one place to understand who contacted them, what the customer needs, and what should happen next.",
      "BotPager combines customer records with practical automation. Follow-up messages, reminders, missed-call responses, and pipeline tasks can support the team without hiding the conversation or removing human control.",
    ],
    details: [
      { title: "One customer record", text: "Bring available contact details, conversations, notes, and opportunity status into a shared view instead of relying on scattered inboxes." },
      { title: "Consistent follow-up", text: "Use approved SMS and email sequences to acknowledge, remind, nurture, or re-engage leads according to their stage and consent." },
      { title: "A visible sales pipeline", text: "Give each opportunity a stage, owner, and next action so the team can find stalled conversations before they are forgotten." },
    ],
    process: [
      { title: "Map the current workflow", text: "Identify lead sources, response gaps, pipeline stages, team ownership, required consent, and the moments where opportunities commonly stall." },
      { title: "Configure the CRM", text: "Set up customer fields, stages, routing, tasks, and conversation views around the way the business actually handles leads." },
      { title: "Add useful automations", text: "Build focused follow-up and reminder workflows, test their triggers, and keep human intervention available where judgment is needed." },
    ],
    challenges: [
      "Customer conversations are scattered across inboxes, phones, and team members.",
      "Qualified leads go cold when follow-up depends on memory or spare time.",
      "The team cannot easily see an opportunity's owner, status, or next step.",
    ],
    capabilities: [
      "A visual lead pipeline and unified customer record",
      "SMS and email follow-up sequences",
      "Team routing, task reminders, and missed-opportunity workflows",
    ],
    outcome:
      "A more reliable process where every lead has context, a clear status, and a next action.",
    relatedLinks: [
      { href: "/services/ai-agent", label: "Capture and qualify leads with AI" },
      { href: "/industries/cleaning-services", label: "See the cleaning services use case" },
      { href: "/services/smart-websites", label: "Connect website lead capture" },
    ],
    faqs: [
      { question: "What is lead follow-up automation?", answer: "Lead follow-up automation uses predefined triggers and approved messages to acknowledge inquiries, send reminders, maintain contact, or assign a next step without requiring every action to be performed manually." },
      { question: "Can BotPager send missed-call text messages?", answer: "A missed-call text-back workflow can be configured when the connected phone, messaging, consent, and business rules support it." },
      { question: "Will my team still be able to reply personally?", answer: "Yes. Automation is designed to support the team. Conversations can be routed or paused for a personal reply when a customer question or opportunity needs human judgment." },
      { question: "Can the CRM connect website and AI leads?", answer: "Supported website forms, AI conversations, calls, and booking actions can be connected to the CRM so the lead source and next step are easier to track." },
    ],
  },
  {
    slug: "local-seo-geo",
    href: "/services/local-seo-geo",
    name: "Local SEO & GEO",
    seoTitle: "Local SEO & AI Search Optimization for Local Businesses",
    title: "Get Found on Google, Maps and AI Search",
    description:
      "Local SEO, Google Business Profile, Maps, and AI search optimization that helps local businesses communicate their services and relevance clearly.",
    eyebrow: "Local search visibility",
    overview: [
      "Local visibility depends on helping search engines and customers understand what the business does, who it serves, and where the service is available. That clarity has to remain consistent across the website, Google Business Profile, Maps presence, and other public business information.",
      "BotPager approaches Local SEO and GEO as one connected information system. The work prioritizes useful service pages, technically accessible content, accurate business entities, Google Business Profile improvements, and answer-first information that can also be understood by AI-powered search experiences.",
    ],
    details: [
      { title: "Local website relevance", text: "Create a clear service and industry architecture with helpful content, descriptive internal links, and technical signals that support local discovery." },
      { title: "Google Business Profile clarity", text: "Align public business information, service categories, profile content, and website destinations using accurate details supplied or verified by the business." },
      { title: "AI-search-ready information", text: "Explain services, audiences, processes, and outcomes in concise human language that is also easier for generative search systems to interpret." },
    ],
    process: [
      { title: "Audit the search foundation", text: "Review indexation, page intent, technical signals, business information, internal links, and the current Google Business Profile setup." },
      { title: "Strengthen priority entities", text: "Improve the pages and profile elements that explain the business, its services, its audience, and its legitimate service coverage." },
      { title: "Build useful topical depth", text: "Develop service, industry, and resource content around real customer questions while monitoring technical quality and avoiding thin location pages." },
    ],
    challenges: [
      "Search engines do not have clear pages for important services and customer questions.",
      "Google Business Profile and website signals are incomplete or inconsistent.",
      "The business is difficult to understand across search, maps, and AI-assisted discovery.",
    ],
    capabilities: [
      "Local service and information architecture priorities",
      "Google Business Profile and Maps optimization guidance",
      "Clear, answer-first content for search engines and people",
    ],
    outcome:
      "A stronger, clearer local presence wherever high-intent customers look for a service provider.",
    relatedLinks: [
      { href: "/services/smart-websites", label: "Build the supporting website" },
      { href: "/industries/landscaping", label: "See the landscaping approach" },
      { href: "/industries/home-services", label: "Explore home service visibility" },
    ],
    faqs: [
      { question: "What is included in Local SEO for a service business?", answer: "The scope can include technical and on-page review, service-page architecture, internal linking, local content priorities, Google Business Profile recommendations, and measurement based on the agreed engagement." },
      { question: "Do you optimize Google Business Profiles?", answer: "Yes. BotPager can review and improve supported profile elements using accurate business information, relevant services, appropriate destinations, and a plan for ongoing profile activity." },
      { question: "What does GEO mean for a local business?", answer: "Generative engine optimization focuses on making business and service information clear, consistent, useful, and machine-readable for AI-assisted discovery. It supplements—not replaces—technical SEO, helpful content, and established local signals." },
      { question: "Do you create city pages?", answer: "Only when a business intentionally serves the geography and can support the page with accurate, genuinely useful local information. BotPager does not recommend mass-producing near-duplicate city pages." },
    ],
  },
  {
    slug: "google-ads",
    href: "/services/google-ads",
    name: "Google Ads",
    seoTitle: "Google Ads for Local Service Businesses",
    title: "Capture High-Intent Local Customers With Google Ads",
    description:
      "Google Ads for local service businesses, connected to focused landing pages, call and form tracking, fast lead response, and CRM follow-up.",
    eyebrow: "Paid local demand",
    overview: [
      "Google Ads can put a local service business in front of people who are actively searching for help. The click is only the beginning: the search term, ad message, landing page, call or form, response time, and follow-up all influence whether that paid visit becomes a real opportunity.",
      "BotPager connects campaign planning with the rest of the customer journey. The goal is to align high-intent local demand with clear service pages, useful conversion tracking, responsive lead handling, and an organized pipeline—not to treat clicks as the final result.",
    ],
    details: [
      { title: "High-intent campaign structure", text: "Organize search campaigns around priority services, realistic service areas, useful keyword themes, negative keywords, and focused ad messages." },
      { title: "Focused landing experiences", text: "Send customers to a page that matches the service they searched for and gives them a clear call, quote, or booking path." },
      { title: "Lead and conversion alignment", text: "Connect available call and form tracking with CRM stages and follow-up so campaign decisions can consider lead quality and customer progress." },
    ],
    process: [
      { title: "Define the offer and market", text: "Confirm priority services, service area, customer intent, available budget, conversion actions, and the landing-page experience." },
      { title: "Build or improve campaigns", text: "Structure keywords, negatives, ads, targeting, and conversion measurement around the agreed commercial priorities." },
      { title: "Review the full lead path", text: "Monitor campaign signals while also checking whether inquiries are answered, tracked, qualified, and followed up consistently." },
    ],
    challenges: [
      "Ad clicks land on generic pages without a clear service-specific conversion path.",
      "Calls and forms are not connected to lead status or customer outcomes.",
      "Campaign decisions are made without a complete view of response and follow-up.",
    ],
    capabilities: [
      "High-intent search campaign and offer planning",
      "Service-area targeting, conversion paths, and tracking alignment",
      "CRM connection and lead follow-up coordination where available",
    ],
    outcome:
      "A paid acquisition system designed around qualified local inquiries, not clicks alone.",
    relatedLinks: [
      { href: "/services/smart-websites", label: "Improve the landing experience" },
      { href: "/industries/roofing", label: "See the roofing use case" },
      { href: "/services/crm-automations", label: "Connect ad leads to follow-up" },
    ],
    faqs: [
      { question: "Does BotPager manage Google Ads for local businesses?", answer: "Yes. Google Ads management can include campaign strategy, setup or optimization, service-area targeting, keyword and negative-keyword work, ad copy, conversion tracking review, monitoring, and reporting based on scope." },
      { question: "Is ad spend included in the management fee?", answer: "No. Advertising spend is paid separately to the ad platform. The current BotPager pricing section identifies management and ad spend as separate costs." },
      { question: "Do I need a dedicated landing page?", answer: "A focused landing page is often useful when the existing website does not closely match the service, location, offer, and next step promised by the ad. BotPager reviews that path before recommending the page structure." },
      { question: "Can Google Ads leads connect to the CRM?", answer: "Supported calls, forms, and campaign landing pages can be aligned with CRM tracking and follow-up so the team has more context after the initial inquiry." },
    ],
  },
];

export const industryPages: ArchitectureItem[] = [
  {
    slug: "home-services",
    href: "/industries/home-services",
    name: "Home Services",
    title: "Marketing Systems for Home Service Businesses",
    description:
      "Connect local visibility, quote requests, fast responses, and lead follow-up for appointment- and project-driven home service companies.",
    eyebrow: "Home services",
    challenges: [
      "Homeowners compare several providers when a project or repair becomes urgent.",
      "Calls and quote requests arrive while technicians and owners are in the field.",
      "Longer-consideration projects need consistent follow-up after the first estimate.",
    ],
    capabilities: ["Service-focused website journeys", "After-hours inquiry response", "Quote and estimate follow-up"],
    outcome: "More local inquiries progress from the first search to a scheduled visit, estimate, or booked job.",
    relatedLinks: [
      { href: "/services/smart-websites", label: "Websites for home service companies" },
      { href: "/services/local-seo-geo", label: "Build local search visibility" },
    ],
  },
  {
    slug: "pressure-washing",
    href: "/industries/pressure-washing",
    name: "Pressure Washing",
    title: "Customer Growth Systems for Pressure Washing Companies",
    description:
      "Help homeowners understand exterior cleaning services, request a quote quickly, and receive follow-up before seasonal demand moves on.",
    eyebrow: "Pressure washing",
    challenges: ["Seasonal demand creates short response windows.", "Visual services need clear proof and scope explanations.", "Quote requests often need photos, property details, and timely follow-up."],
    capabilities: ["Service and project-focused website paths", "Fast quote-request response", "Estimate and seasonal re-engagement workflows"],
    outcome: "A smoother path from local discovery to a qualified exterior-cleaning quote request.",
    relatedLinks: [
      { href: "/services/ai-agent", label: "Respond to quote requests 24/7" },
      { href: "/services/google-ads", label: "Capture high-intent local searches" },
    ],
  },
  {
    slug: "cleaning-services",
    href: "/industries/cleaning-services",
    name: "Cleaning Services",
    title: "Marketing Systems for Cleaning Service Businesses",
    description:
      "Turn local searches and referrals into residential or commercial cleaning inquiries, recurring bookings, and organized follow-up.",
    eyebrow: "Cleaning services",
    challenges: ["Prospects need to understand service types and booking expectations quickly.", "Recurring and one-time inquiries require different follow-up paths.", "Teams need an organized view of estimates, bookings, and unanswered leads."],
    capabilities: ["Residential and commercial service paths", "Booking-question response", "Recurring-service and estimate follow-up"],
    outcome: "More cleaning inquiries move toward the right estimate or booking workflow without getting lost.",
    relatedLinks: [
      { href: "/services/crm-automations", label: "Automate cleaning lead follow-up" },
      { href: "/services/local-seo-geo", label: "Improve local visibility" },
    ],
  },
  {
    slug: "landscaping",
    href: "/industries/landscaping",
    name: "Landscaping",
    title: "Customer Acquisition for Landscaping Companies",
    description:
      "Present landscaping capabilities clearly, capture project details, and keep estimate conversations moving across seasonal demand cycles.",
    eyebrow: "Landscaping",
    challenges: ["Project scope and customer intent vary widely.", "Visual credibility and service-area relevance influence the shortlist.", "Estimate follow-up can stall during busy field schedules."],
    capabilities: ["Project and service-specific landing paths", "Photo and estimate inquiry capture", "Seasonal and estimate follow-up"],
    outcome: "A clearer route from local landscaping research to a qualified project conversation.",
    relatedLinks: [
      { href: "/services/smart-websites", label: "Build a landscaping lead-generation website" },
      { href: "/services/local-seo-geo", label: "Strengthen local search signals" },
    ],
  },
  {
    slug: "plumbing",
    href: "/industries/plumbing",
    name: "Plumbing",
    title: "Marketing Systems for Plumbing Companies",
    description:
      "Help homeowners find the right plumbing service, get a fast response, and move urgent and planned work toward a booked visit.",
    eyebrow: "Plumbing",
    challenges: ["Urgent customers contact multiple plumbers quickly.", "After-hours calls and messages can become missed jobs.", "Different repair and installation intents need clear service paths."],
    capabilities: ["Emergency and planned-service journeys", "After-hours response and qualification", "Call, booking, and follow-up tracking"],
    outcome: "More high-intent plumbing inquiries receive a useful response and a clear next step.",
    relatedLinks: [
      { href: "/services/ai-agent", label: "Add an AI receptionist for plumbing calls" },
      { href: "/services/google-ads", label: "Reach high-intent plumbing searches" },
    ],
  },
  {
    slug: "hvac",
    href: "/industries/hvac",
    name: "HVAC",
    title: "Customer Growth Systems for HVAC Companies",
    description:
      "Connect seasonal search demand, service-call response, estimate follow-up, and customer tracking for HVAC repair and installation work.",
    eyebrow: "HVAC",
    challenges: ["Weather-driven demand creates sudden lead spikes.", "Repair and replacement prospects have different urgency and information needs.", "Installation estimates require patient, consistent follow-up."],
    capabilities: ["Repair and replacement conversion paths", "Peak-demand inquiry response", "Estimate and maintenance follow-up workflows"],
    outcome: "A coordinated path for turning HVAC searches and inquiries into scheduled service and estimate conversations.",
    relatedLinks: [
      { href: "/services/crm-automations", label: "Organize HVAC lead follow-up" },
      { href: "/services/local-seo-geo", label: "Improve HVAC local visibility" },
    ],
  },
  {
    slug: "roofing",
    href: "/industries/roofing",
    name: "Roofing",
    title: "Lead Generation Systems for Roofing Companies",
    description:
      "Build trust, capture inspection and estimate requests, and follow up consistently across repair, replacement, and storm-related roofing demand.",
    eyebrow: "Roofing",
    challenges: ["Roofing prospects evaluate credibility carefully before requesting an inspection.", "Storm demand can overwhelm manual response.", "High-value estimates often need several thoughtful follow-ups."],
    capabilities: ["Repair, replacement, and inspection journeys", "Fast inquiry qualification", "Estimate pipeline and follow-up visibility"],
    outcome: "More qualified roofing opportunities move from local research to inspections and estimate decisions.",
    relatedLinks: [
      { href: "/services/smart-websites", label: "Build a conversion-focused roofing website" },
      { href: "/services/google-ads", label: "Plan roofing search campaigns" },
    ],
  },
  {
    slug: "electricians",
    href: "/industries/electricians",
    name: "Electricians",
    title: "Marketing Systems for Electrical Contractors",
    description:
      "Help residential and commercial customers identify the right electrical service, request help, and receive a timely next step.",
    eyebrow: "Electrical services",
    challenges: ["Customers need fast clarity about service fit and availability.", "Field work makes immediate phone and form response difficult.", "Residential, commercial, repair, and project leads require different context."],
    capabilities: ["Electrical service-specific website paths", "Inquiry response and early qualification", "Estimate and project follow-up organization"],
    outcome: "A clearer, faster customer journey from electrical service need to a qualified conversation.",
    relatedLinks: [
      { href: "/services/ai-agent", label: "Respond while electricians are in the field" },
      { href: "/services/local-seo-geo", label: "Build electrical service visibility" },
    ],
  },
];

// Industry pages move into this collection only after they have enough original,
// industry-specific content to be indexed. The shorter architecture entries above
// remain useful as previews while their detail routes stay noindex.
export const publishedIndustryPages: IndustryPageContent[] = [
  {
    slug: "plumbing",
    href: "/industries/plumbing",
    name: "Plumbing",
    seoTitle: "Digital Marketing for Plumbers | Websites, SEO & AI",
    title: "Get More Plumbing Leads and Booked Jobs",
    description:
      "Digital marketing for plumbing companies that connects a conversion-focused website, AI lead response, automated follow-up, local SEO, and Google Ads.",
    eyebrow: "Digital marketing for plumbers",
    introduction: [
      "Plumbing customers rarely follow one predictable path. A homeowner with an active leak may call the first credible company that responds, while someone planning a water heater replacement may compare options, reviews, financing questions, and appointment availability over several days.",
      "BotPager builds the customer-acquisition system around those different moments. The website helps each visitor find the right service and next step, AI supports the first response, the CRM keeps the opportunity visible, and search campaigns bring the business in front of people already looking for plumbing help.",
    ],
    acquisitionProblems: [
      {
        title: "Urgent leads move fast",
        text: "Customers with leaks, backups, or no hot water may contact several companies within minutes. An unanswered call or slow form response can mean the opportunity goes elsewhere.",
      },
      {
        title: "One page cannot explain every service",
        text: "Emergency repairs, drain cleaning, fixture work, repiping, and water heater projects have different questions and search intent. Generic website copy makes it harder for customers to recognize the right fit.",
      },
      {
        title: "Estimates need consistent follow-up",
        text: "Higher-consideration work may not close during the first conversation. Without a visible pipeline and a useful next step, qualified estimates can quietly go cold.",
      },
      {
        title: "Marketing data stops at the lead",
        text: "Calls and forms may be counted without showing whether the inquiry was qualified, scheduled, quoted, or won. That makes it difficult to improve the sources that create real jobs.",
      },
    ],
    system: [
      {
        title: "Attract the right searches",
        text: "Build useful service pages, strengthen local search signals, and run focused paid search campaigns around the plumbing work the business wants to grow.",
      },
      {
        title: "Make the next step obvious",
        text: "Match urgent and planned-service visitors with clear calls, quote requests, appointment paths, and information that helps them act with confidence.",
      },
      {
        title: "Respond and qualify",
        text: "Use approved AI conversations and connected workflows to collect the service need, timing, location, and contact details before a human handoff.",
      },
      {
        title: "Track the opportunity",
        text: "Keep conversations, pipeline stages, reminders, estimates, and follow-up actions connected so the team can see what should happen next.",
      },
    ],
    smartWebsiteFeatures: [
      "Dedicated paths for emergency repairs, drain services, water heaters, installations, and other priority plumbing work",
      "Mobile-first call, request-service, and estimate actions placed where customers need them",
      "Service-area and availability information based on facts supplied by the plumbing company",
      "Connected forms that capture the service need and route the inquiry into the follow-up workflow",
    ],
    aiUseCases: [
      "Answer approved questions about services, scheduling, service areas, and the next step at any hour",
      "Collect contact details, plumbing issue, urgency, property context, and preferred response method",
      "Separate routine inquiries from conversations that require an immediate human review",
      "Guide qualified visitors toward a service request, estimate, or direct team handoff",
    ],
    followUpUseCases: [
      "Acknowledge new website inquiries and missed calls with an approved response",
      "Assign each opportunity a stage, owner, and next action inside the CRM",
      "Send appointment or estimate reminders according to the business workflow and customer consent",
      "Re-engage open estimates or unbooked inquiries without relying on staff memory",
    ],
    localSeoStrategy: [
      "Create distinct, useful pages for priority plumbing services instead of repeating generic keyword copy",
      "Align the website and Google Business Profile with accurate services, categories, and business information",
      "Strengthen internal links between plumbing services, customer questions, and relevant conversion paths",
      "Measure visibility and customer actions while avoiding fabricated locations or near-duplicate city pages",
    ],
    paidSearchUseCases: [
      "Separate urgent repair intent from planned installation and replacement searches",
      "Focus location targeting on the plumbing company's real service coverage",
      "Send each ad group to a landing experience that matches the service and next step",
      "Connect call and form tracking with lead status so optimization can consider quality, not clicks alone",
    ],
    challenges: [
      "Urgent customers contact multiple plumbers quickly.",
      "After-hours calls and messages can become missed jobs.",
      "Different repair and installation intents need clear service paths.",
    ],
    capabilities: [
      "Emergency and planned-service website journeys",
      "AI-assisted response and early qualification",
      "CRM, local SEO, paid search, and follow-up coordination",
    ],
    outcome:
      "A connected plumbing marketing system designed to turn more high-intent searches and inquiries into qualified conversations, scheduled visits, and booked jobs.",
    relatedLinks: [
      { href: "/services/smart-websites", label: "Build a plumbing lead-generation website" },
      { href: "/services/ai-agent", label: "Add an AI receptionist" },
      { href: "/services/crm-automations", label: "Automate plumbing lead follow-up" },
      { href: "/services/local-seo-geo", label: "Improve local plumbing visibility" },
      { href: "/services/google-ads", label: "Reach high-intent plumbing searches" },
    ],
    faqs: [
      {
        question: "What does digital marketing for plumbers include?",
        answer: "The right mix depends on the company, but it can include a service-focused website, local SEO, Google Business Profile improvements, Google Ads, call and form tracking, AI-assisted response, CRM organization, and lead follow-up automation.",
      },
      {
        question: "Can an AI receptionist handle plumbing inquiries after hours?",
        answer: "Yes. It can provide an approved first response, gather contact and service details, answer configured questions, and route the inquiry toward the next step. The plumbing company defines which situations require immediate human attention.",
      },
      {
        question: "How can a plumbing website generate better leads?",
        answer: "A stronger plumbing website separates important services, explains who and where the company serves, makes calls and service requests easy on mobile, and captures enough context for the team to respond effectively.",
      },
      {
        question: "Do plumbers need separate pages for each service?",
        answer: "Priority services often deserve separate pages when customers have distinct needs and questions. Each page should provide genuinely useful information rather than repeating the same copy with a different keyword.",
      },
      {
        question: "Can Google Ads leads be tracked through the booking process?",
        answer: "Supported call and form activity can be connected with CRM stages and follow-up workflows. This gives the team more context about which inquiries become qualified opportunities and booked work.",
      },
    ],
  },
];

export const resourceTopics = [
  "Local search and Google Business Profile",
  "Faster lead response and missed-call recovery",
  "Website conversion for home service businesses",
  "AI receptionists and customer communication",
  "Automated lead follow-up and CRM workflows",
  "Google Ads landing pages and lead tracking",
];

export function getServicePage(slug: string) {
  return servicePages.find((service) => service.slug === slug);
}

export function getIndustryPage(slug: string) {
  return industryPages.find((industry) => industry.slug === slug);
}

export function getPublishedIndustryPage(slug: string) {
  return publishedIndustryPages.find((industry) => industry.slug === slug);
}
