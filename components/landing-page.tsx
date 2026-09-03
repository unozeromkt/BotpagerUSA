"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Gauge,
  Globe2,
  House,
  LayoutDashboard,
  Mail,
  MapPin,
  Menu,
  MessageCircleMore,
  MousePointerClick,
  Phone,
  PieChart,
  Play,
  Search,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
  WashingMachine,
  X,
  Zap,
} from "lucide-react";

type FAQ = [string, string];
type LandingVariant = "default" | "conversion";

const painSolutions = [
  { icon: Zap, title: "Faster Response Times", text: "Respond in seconds, not hours." },
  { icon: ClipboardList, title: "More Quote Requests", text: "Make it easy for leads to reach out." },
  { icon: Send, title: "Automated Follow-Up", text: "Nurture leads until they’re ready." },
  { icon: CalendarCheck2, title: "Better Booking Flow", text: "Smooth process from lead to job." },
  { icon: PieChart, title: "Clear Lead Tracking", text: "Know where every lead stands." },
  { icon: TrendingUp, title: "Higher Conversion Rate", text: "Turn more leads into booked jobs." },
];

const conversionPainSolutions = [
  { icon: Zap, title: "Respond Faster", text: "Interested people get a response without having to wait." },
  { icon: ClipboardList, title: "Make It Easy to Get in Touch", text: "Make it easy for people to contact your business." },
  { icon: Send, title: "Keep the Conversation Going", text: "We follow up automatically so no potential customer goes cold or gets lost." },
  { icon: CalendarCheck2, title: "Make Booking Easier", text: "We help turn more inquiries into appointments or booked jobs." },
  { icon: PieChart, title: "Know What’s Going On", text: "See who contacted you, what they need, and what to do next." },
  { icon: TrendingUp, title: "Turn More Interest Into Customers", text: "Get more value from the website visits and inquiries your business already receives." },
];

const portfolioProjects = [
  {
    name: "Reyka Drywall",
    category: "Website + Google Ads + Local SEO",
    description: "A conversion-focused digital presence built to connect a trusted drywall contractor with homeowners across Utah.",
    language: "English",
    image: "/images/portfolio/reyka-drywall.png",
    width: 1672,
    height: 941,
  },
  {
    name: "Financial Connection",
    category: "Legal Services Website",
    description: "A polished, reassuring experience that turns a complex legal service into a clear and approachable customer journey.",
    language: "English",
    image: "/images/portfolio/financial-connection.png",
    width: 1448,
    height: 1086,
  },
  {
    name: "Intelligent Operations",
    category: "Automation & Technology Website",
    description: "A bold digital showcase for intelligent operations, business automation, and technology-led transformation.",
    language: "English",
    image: "/images/portfolio/intelligent-operations.png",
    width: 1536,
    height: 1024,
  },
  {
    name: "UniZero",
    category: "AI Marketing Platform",
    description: "A high-impact platform experience that communicates speed, scale, and an AI-powered approach to digital growth.",
    language: "English",
    image: "/images/portfolio/unizero.png",
    width: 1448,
    height: 1086,
  },
  {
    name: "ServiMedical",
    category: "Medical Technology Website",
    description: "A clear, credible product experience for medical imaging technology, designed for healthcare decision-makers.",
    language: "English",
    image: "/images/portfolio/servimedical.png",
    width: 1536,
    height: 1024,
  },
  {
    name: "Turtle Bus",
    category: "Tourism & Experiences Website",
    description: "Una experiencia visual inmersiva que presenta recorridos, aventura y cultura local con una identidad memorable.",
    language: "Español",
    image: "/images/portfolio/turtle-bus.png",
    width: 1448,
    height: 1086,
  },
  {
    name: "TripPlanner",
    category: "Travel Marketplace",
    description: "Una plataforma de experiencias turísticas pensada para facilitar la exploración, búsqueda y reserva de destinos.",
    language: "Español",
    image: "/images/portfolio/trip-planner.png",
    width: 1448,
    height: 1086,
  },
  {
    name: "Grupo Mega",
    category: "Financial & Logistics Services",
    description: "Una experiencia unificada para servicios de cambio de divisas, envíos y atención personalizada entre países.",
    language: "Español",
    image: "/images/portfolio/grupo-mega.png",
    width: 1536,
    height: 1024,
  },
];

const systemFeatures = [
  { icon: Globe2, title: "High-Converting Website", text: "Modern, mobile-friendly sites built to win trust and leads." },
  { icon: LayoutDashboard, title: "Real-Time Dashboard", text: "Track leads, jobs, and revenue in one simple dashboard." },
  { icon: MessageCircleMore, title: "AI Chatbot for Quote Capture", text: "Engages visitors 24/7 and captures leads automatically." },
  { icon: MousePointerClick, title: "Optional Ads Execution", text: "Meta and Google Ads managed for more qualified leads." },
  { icon: Send, title: "SMS/Email Follow-Up Automation", text: "Smart sequences that nurture and re-engage leads." },
];

const conversionProcess = [
  { icon: Globe2, title: "More People Find You", text: "Your website is built to turn more visitors into people interested in your business." },
  { icon: MousePointerClick, title: "More People Contact You", text: "Make it easy for interested people to ask a question or request a quote." },
  { icon: MessageCircleMore, title: "AI Assistant", text: "Your AI assistant responds anytime, so no potential customer gets ignored." },
  { icon: Send, title: "Follow Up Automatically", text: "Keep the conversation going without doing it yourself." },
  { icon: UsersRound, title: "Turn More Leads Into Customers", text: "Convert more inquiries into real customers." },
];

const benefits = [
  { icon: Target, title: "More Qualified Leads", text: "Attract people who are ready to buy." },
  { icon: MessageCircleMore, title: "Instant Responses 24/7", text: "Never miss a lead, day or night." },
  { icon: Gauge, title: "Fewer Lost Opportunities", text: "Automations keep leads engaged." },
  { icon: UsersRound, title: "Better Organization", text: "Everything in one central system." },
  { icon: CalendarCheck2, title: "More Booked Jobs", text: "Fill your schedule consistently." },
  { icon: PieChart, title: "Clear Business Visibility", text: "Know your numbers at a glance." },
];

const conversionBenefits = [
  { icon: Target, title: "More People Find You", text: "Help the right customers discover your business." },
  { icon: MessageCircleMore, title: "Fast Responses 24/7", text: "Answer interest while it is still fresh." },
  { icon: Gauge, title: "Fewer Missed Customers", text: "Keep conversations moving automatically." },
  { icon: UsersRound, title: "Simple Customer Tracking", text: "Know who contacted you and what happens next." },
  { icon: CalendarCheck2, title: "More Booked Work", text: "Make it easier to move from inquiry to appointment." },
  { icon: PieChart, title: "Clear Results", text: "See the activity that is helping your business grow." },
];

const industries = [
  { icon: Send, title: "Pressure Washing", text: "Get more quote requests and fill your schedule.", color: "blue" },
  { icon: WashingMachine, title: "Cleaning Services", text: "Automate follow-ups and book more cleanings.", color: "purple" },
  { icon: Sparkles, title: "Lawn Care", text: "Grow your route and keep it full.", color: "green" },
  { icon: House, title: "Home Services", text: "More leads, better jobs, happier customers.", color: "orange" },
];

const serviceIndustries = [
  {
    title: "Home Services",
    text: "Get more customers for your home services business with a website and follow-up system built to convert.",
    image: "/images/services/home-services.jpg",
  },
  {
    title: "Pressure Washing",
    text: "Lead generation for pressure washing services that turns local searches into quote requests.",
    image: "/images/services/exterior-cleaning.jpg",
  },
  {
    title: "Cleaning Services",
    text: "Get more cleaning service leads and keep every customer inquiry moving toward a booking.",
    image: "/images/services/cleaning-services.jpg",
  },
  {
    title: "Lawn Care",
    text: "Grow your lawn care route with better local visibility, faster replies, and automatic follow-up.",
    image: "/images/services/lawn-landscape.jpg",
  },
  {
    title: "Landscaping",
    text: "Generate more landscaping leads and turn project inquiries into scheduled estimates.",
    image: "/images/services/landscaping.jpg",
  },
  {
    title: "Plumbing",
    text: "Help local homeowners find your plumbing business and request service without waiting.",
    image: "/images/services/plumbing.jpg",
  },
  {
    title: "HVAC Services",
    text: "Get more HVAC service calls with stronger local visibility and 24/7 customer response.",
    image: "/images/services/home-trades.jpg",
  },
  {
    title: "Electrical Services",
    text: "Generate qualified electrical service leads and make it easy to request an estimate.",
    image: "/images/services/electrical-services.jpg",
  },
  {
    title: "Roofing",
    text: "Turn roofing searches into inspection requests, estimates, and booked projects.",
    image: "/images/services/roofing-garage.jpg",
  },
  {
    title: "Painting Services",
    text: "Attract more painting customers and follow up automatically on every estimate request.",
    image: "/images/services/painting-services.jpg",
  },
  {
    title: "Home Remodeling",
    text: "Generate remodeling leads and keep high-value project conversations organized.",
    image: "/images/services/home-remodeling.jpg",
  },
  {
    title: "Handyman Services",
    text: "Get more handyman jobs with a clear website, instant replies, and simple booking.",
    image: "/images/services/handyman-services.jpg",
  },
  {
    title: "Appliance Repair",
    text: "Capture appliance repair leads when customers need fast local help.",
    image: "/images/services/appliance-pool.jpg",
  },
  {
    title: "Garage Door Services",
    text: "Generate more garage door repair and installation inquiries in your service area.",
    image: "/images/services/garage-door-services.jpg",
  },
  {
    title: "Pest Control",
    text: "Turn local pest control searches into recurring customers and booked treatments.",
    image: "/images/services/pest-control.jpg",
  },
  {
    title: "Pool Services",
    text: "Grow your pool service route with more local inquiries and automatic follow-up.",
    image: "/images/services/pool-services.jpg",
  },
  {
    title: "Moving Services",
    text: "Generate moving leads and help more customers request quotes and reserve dates.",
    image: "/images/services/moving-auto.jpg",
  },
  {
    title: "Auto Detailing",
    text: "Get more auto detailing bookings with local lead generation and fast follow-up.",
    image: "/images/services/auto-detailing.jpg",
  },
  {
    title: "Auto Repair",
    text: "Attract more auto repair customers and make service requests easier to manage.",
    image: "/images/services/auto-repair.jpg",
  },
  {
    title: "Home Health Care",
    text: "Connect with more families searching for trusted local home health care services.",
    image: "/images/services/care-pets.jpg",
  },
  {
    title: "Pet Grooming",
    text: "Get more pet grooming appointments with a conversion-focused local booking experience.",
    image: "/images/services/pet-grooming.jpg",
  },
];

const plans = [
  {
    name: "Starter",
    number: "01",
    tagline: "Capture Leads Fast",
    price: "$497",
    setup: "$997 one-time setup",
    bestFor: "Local service businesses that need a better website, faster lead capture, basic CRM organization, and automated follow-up without adding a full growth stack yet.",
    highlights: ["Conversion-focused website", "AI chatbot", "CRM & lead pipeline", "Automated follow-up"],
    strategyCallout: null,
    recommendedAddOn: "Paid Ads Management — starting at $350/mo",
    detailGroups: [
      {
        title: "Everything included",
        items: ["Conversion-focused website or landing page", "AI chatbot for lead capture", "Missed-call text-back workflow", "Basic CRM and lead pipeline", "Email and SMS follow-up sequences", "Lead notification setup", "Basic tracking setup", "Live dashboard and reporting", "Priority support"],
      },
      {
        title: "Not included",
        muted: true,
        items: ["Ad spend", "Full AI voice agent", "Ongoing SEO strategy", "Monthly content production", "Advanced integrations", "Multi-location setup"],
      },
    ],
    note: "Setup fee applies. SMS, phone, email, and AI usage may be billed separately.",
  },
  {
    name: "Growth",
    number: "02",
    tagline: "Scale With Automation, SEO & Marketing Strategy",
    price: "$1,497",
    setup: "$1,997–$2,997 one-time setup",
    bestFor: "Local service businesses ready to partner with a digital growth team that captures more demand, responds faster, and turns more inquiries into booked jobs.",
    highlights: ["Digital growth team", "Ads management", "Local SEO strategy", "AI voice agent"],
    strategyCallout: {
      label: "Your digital growth team",
      text: "Strategy, optimization, and accountability across your marketing system.",
    },
    popular: true,
    detailGroups: [
      {
        title: "Everything in Starter, plus",
        items: ["Meta and Google Ads management", "Digital marketing strategy and monthly growth priorities", "Local SEO strategy and monthly visibility priorities", "AI voice agent for inbound lead handling", "Advanced CRM workflows and automations", "Call tracking and form tracking", "Advanced dashboard and insights", "Appointment / quote follow-up automation", "Monthly performance review", "Dedicated success manager"],
      },
      {
        title: "AI Voice fair-use scope",
        items: ["One business location", "One main inbound call flow", "Approved FAQ and lead intake script", "Human handoff rules", "Basic appointment or quote-request routing"],
      },
      {
        title: "SEO strategy scope",
        items: ["Google Business Profile priorities", "Local service page recommendations", "Basic on-page SEO recommendations", "Local visibility tracking priorities", "Monthly SEO action plan"],
      },
      {
        title: "Not included",
        muted: true,
        items: ["Ad spend", "Full SEO campaign with blog/content production", "Link building", "Full reputation management", "Multi-location SEO", "Outbound voice campaigns", "Complex custom integrations", "Production of video/photo creatives"],
      },
    ],
    note: "Setup fee, ad spend, and usage limits apply. Phone, SMS, email, and AI usage may be billed separately.",
  },
];

const optionalAddOns = [
  {
    name: "AI Voice Agent",
    tagline: "For missed calls and after-hours lead handling.",
    price: "$297–$497/mo + usage",
    icon: Phone,
    includes: ["Inbound call answering flow", "Lead qualification questions", "FAQ-based responses", "Human handoff", "Call summary / CRM notes", "Basic routing rules"],
  },
  {
    name: "Local SEO Growth",
    tagline: "Ongoing local SEO execution beyond strategy.",
    price: "$750–$1,500/mo",
    icon: Search,
    includes: ["Monthly SEO execution plan", "Service page optimization", "Local content recommendations or production scope", "Google Business Profile optimization", "Local ranking visibility review", "Technical/on-page SEO fixes based on scope"],
    exclusions: ["Aggressive link building", "Multi-location SEO", "Large content production"],
  },
  {
    name: "Paid Ads Management",
    tagline: "Qualified local demand through Google Ads and Meta Ads.",
    price: "$350/mo",
    icon: MousePointerClick,
    meta: ["Ad spend paid separately", "Recommended starting ad spend: $500–$2,500/mo"],
    includes: ["Campaign strategy for Google Ads and Meta Ads", "Initial offer and funnel recommendation", "Campaign setup or optimization", "Google Search campaigns for high-intent local searches", "Meta lead generation or retargeting campaigns", "Location and service-area targeting", "Keyword research for Google Ads", "Negative keyword setup and cleanup", "Basic ad copywriting", "Conversion tracking setup/review", "Call tracking and form tracking alignment", "CRM/pipeline connection when available", "Weekly campaign monitoring", "Monthly performance summary", "Budget allocation recommendations", "Basic landing page recommendations"],
  },
];

const nav = [
  ["Solutions", "/#solutions"],
  ["How It Works", "/#how-it-works"],
  ["Pricing", "/#pricing"],
  ["About", "/#about"],
  ["Resources", "/#faq"],
];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a className={`logo ${light ? "logoLight" : ""}`} href="/#top" aria-label="BotPager home">
      <Image className="logoMark" src="/images/botpager-isotype.png" width={604} height={603} alt="" aria-hidden="true" />
      <span>Bot<span>Pager</span></span>
    </a>
  );
}

function PrimaryButton({ children, href = "/audit", light = false }: { children: React.ReactNode; href?: string; light?: boolean }) {
  return <a className={`button buttonPrimary ${light ? "buttonLime" : ""}`} href={href}>{children}<ArrowRight size={17} /></a>;
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.58, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title, text, light = false, headingId }: { eyebrow?: string; title: React.ReactNode; text?: string; light?: boolean; headingId?: string }) {
  return (
    <div className={`sectionHeading ${light ? "sectionHeadingLight" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={headingId}>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function SectionCTA({ children, light = false, className = "" }: { children: React.ReactNode; light?: boolean; className?: string }) {
  return <Reveal className={`sectionCta ${className}`}><PrimaryButton light={light}>{children}</PrimaryButton></Reveal>;
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="siteHeader">
      <div className="container navInner">
        <Logo />
        <nav className="desktopNav" aria-label="Main navigation">
          {nav.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
        </nav>
        <div className="navCta"><PrimaryButton>Get Free Growth Audit</PrimaryButton></div>
        <button className="menuButton" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav className="mobileNav" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} aria-label="Mobile navigation">
            {nav.map(([label, href]) => <a key={label} href={href} onClick={() => setOpen(false)}>{label}</a>)}
            <PrimaryButton>Get Free Growth Audit</PrimaryButton>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function ProductMockup() {
  return (
    <motion.div
      className="productScene"
      aria-label="BotPager customer booking and sales dashboard illustration"
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      <Image
        className="heroProductImage"
        src="/images/hero-botpager-image.png"
        width={1672}
        height={941}
        alt="BotPager booking calendar with customer conversations, new bookings, revenue, and sales results"
        sizes="(max-width: 820px) 100vw, 57vw"
        preload
      />
      <video
        className="heroMobileVideo"
        controls
        preload="none"
        poster="/images/hero-botpager-image.png"
        aria-label="BotPager overview video placeholder"
      >
        Your browser does not support HTML video.
      </video>
    </motion.div>
  );
}

function Hero({ variant = "default" }: { variant?: LandingVariant }) {
  const isConversion = variant === "conversion";
  const railItems = isConversion ? conversionProcess : systemFeatures;

  return (
    <>
      <section className={`hero ${isConversion ? "heroConversion" : ""}`} id="top" aria-labelledby="hero-title">
        <div className="heroScribble heroScribbleOne" aria-hidden="true" />
        <div className="dots dotsOne" aria-hidden="true" />
        <div className="container heroGrid">
          <motion.div className="heroCopy" initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <p className="eyebrow"><Sparkles size={14} /> Built for local service businesses</p>
            {isConversion ? (
              <>
                <h1 id="hero-title">We help you get <span>more customers</span> for your business</h1>
                <p className="heroLead"><strong>How do we do it?</strong> We attract new customers to your business, engage with them 24/7, follow up automatically, and turn more inquiries into real customers.</p>
              </>
            ) : (
              <>
                <h1 id="hero-title">Turn more leads into <span>booked jobs</span></h1>
                <p className="heroLead">BotPager installs AI-powered websites, chatbots, automated follow-up systems, dashboards, and digital growth strategies to help local service businesses capture, respond to, and convert more customers.</p>
              </>
            )}
            <div className="heroActions">
              <PrimaryButton>Get Your Free Growth Audit</PrimaryButton>
              <a className="button buttonSecondary heroSecondaryAction" href="#how-it-works">See How It Works <Play size={15} fill="currentColor" /></a>
            </div>
          </motion.div>
          <ProductMockup />
        </div>
      </section>

      <section className={`featureRail container ${isConversion ? "processRail" : ""}`} aria-label={isConversion ? "How BotPager helps you get more customers" : "What is included in the BotPager system"} role={isConversion ? "list" : undefined}>
        {railItems.map(({ icon: Icon, title, text }, index) => (
          <motion.div
            className="featureRailItem"
            key={title}
            role={isConversion ? "listitem" : undefined}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.45 + index * 0.07 }}
          >
            {isConversion && <span className="processStep" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>}
            <Icon />
            <span className="featureRailCopy"><b>{title}</b><p>{text}</p></span>
          </motion.div>
        ))}
      </section>
    </>
  );
}

function ResultsSection({ variant = "default" }: { variant?: LandingVariant }) {
  const isConversion = variant === "conversion";
  const solutions = isConversion ? conversionPainSolutions : painSolutions;

  return (
    <section className="section results" id="solutions" aria-labelledby="solutions-title">
      <div className="container">
        <Reveal><SectionHeading headingId="solutions-title" eyebrow={isConversion ? "Stop letting opportunities slip away" : "Stop losing good leads"} title={isConversion ? <>More customers + sales<br /><span>Fewer missed opportunities.</span></> : "No more lost leads"} text={isConversion ? "BotPager helps you respond faster, keep conversations going, and turn more interested people into real customers." : "Missed calls, slow responses, and poor follow-up are costing you jobs."} /></Reveal>
        <div className="cardGrid sixCards">
          {solutions.map(({ icon: Icon, title, text }, index) => (
            <Reveal className="solutionCard" delay={index * 0.05} key={title}>
              <Icon /><h3>{title}</h3><p>{text}</p>
            </Reveal>
          ))}
        </div>
        <SectionCTA>{isConversion ? "See How BotPager Can Help" : "Stop Losing Leads"}</SectionCTA>
      </div>
    </section>
  );
}

function AuditCTA({ variant = "default" }: { variant?: LandingVariant }) {
  const isConversion = variant === "conversion";

  return (
    <section className="auditCtaBand" aria-labelledby="audit-cta-title">
      <div className="container auditCtaInner">
        <Reveal className="auditCtaCopy">
          <h2 id="audit-cta-title">See where your business can <span>grow next</span></h2>
          <p>{isConversion ? "Get a free 10-minute audit and see where your website, response time, and follow-up can create more opportunities." : "Get a free 10-minute audit and see how BotPager can help turn more leads into booked work."}</p>
          <div className="auditCtaActions">
            <PrimaryButton light>Get Your Free Growth Audit</PrimaryButton>
            <a className="button auditCtaSecondary" href="#how-it-works">See How It Works <ArrowRight size={16} /></a>
          </div>
        </Reveal>
        <Reveal className="auditCtaPanel" delay={0.08}>
          <div className="auditCtaPanelHead"><span className="auditCtaPanelIcon"><Target /></span><span><b>Free 10-minute audit</b><small>A practical look at your next growth opportunities.</small></span></div>
          <div className="auditCtaChecklist">
            <span><Check /> Website and lead flow</span>
            <span><Check /> Response and follow-up gaps</span>
            <span><Check /> Clear next actions</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function GoogleVisibilitySection() {
  return (
    <section className="section googleVisibilitySection" id="google-visibility" aria-labelledby="google-visibility-title">
      <div className="googleVisibilityGlow googleVisibilityGlowOne" aria-hidden="true" />
      <div className="googleVisibilityGlow googleVisibilityGlowTwo" aria-hidden="true" />
      <div className="container googleVisibilityGrid">
        <Reveal className="googleVisibilityCopy">
          <p className="eyebrow"><MapPin size={14} /> Google Business Profile + Local SEO</p>
          <h2 id="google-visibility-title">Be the business local customers <span>find on Google</span></h2>
          <p className="googleVisibilityLead">We optimize your Google Business Profile (formerly Google My Business) and local search presence so your business can show up for the services people are actively searching for in your area.</p>

          <div className="googleValueList">
            <div className="googleValueItem">
              <span><Search /></span>
              <div><b>Stand out in local search</b><p>Build a stronger presence across Google Search and Maps.</p></div>
            </div>
            <div className="googleValueItem">
              <span><MapPin /></span>
              <div><b>Connect with nearby customers</b><p>Target the services, locations, and “near me” searches that matter.</p></div>
            </div>
            <div className="googleValueItem">
              <span><TrendingUp /></span>
              <div><b>Grow visibility in your niche</b><p>Improve the signals that help Google understand and trust your business.</p></div>
            </div>
          </div>

          <PrimaryButton>Improve My Google Visibility</PrimaryButton>
        </Reveal>

        <Reveal className="googleVisibilityVisual" delay={0.08}>
          <div className="googleFloatingCard googleFloatingCardProfile">
            <BadgeCheck />
            <span><small>Google Business Profile</small><b>Complete & optimized</b></span>
          </div>

          <div className="googleSearchPhone" aria-label="Illustrative Google local search result mockup">
            <span className="googleMockupLabel">Example search</span>
            <div className="googleWordmark" aria-label="Google">
              <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>
            </div>
            <div className="googleSearchBar"><Search /><span>plumber near me</span></div>

            <div className="googleLocalPackHead">
              <span><MapPin /> Businesses near you</span>
              <small>Open now</small>
            </div>

            <div className="googleLocalListing googleLocalListingFeatured">
              <div className="googleListingTop">
                <span className="googleListingRank">1</span>
                <div><b>Your Local Service Co.</b><small><BadgeCheck /> Profile optimized</small></div>
              </div>
              <div className="googleListingRating"><span>★★★★★</span><small>Strong local presence</small></div>
              <p>Service-area business · Open now</p>
              <div className="googleListingActions"><span>Website</span><span>Directions</span><span>Call</span></div>
            </div>

            <div className="googleLocalListing googleLocalListingMuted" aria-hidden="true">
              <i /><div><b /><span /></div><small />
            </div>

            <div className="googleRankingLift">
              <TrendingUp />
              <span><small>Local visibility</small><b>Built around your niche</b></span>
            </div>
          </div>

          <div className="googleFloatingCard googleFloatingCardSeo">
            <Search />
            <span><small>High-intent searches</small><b>Service + city + “near me”</b></span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PortfolioShowcaseSection() {
  const [activeProject, setActiveProject] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const project = portfolioProjects[activeProject];

  useEffect(() => {
    if (reduceMotion || isPaused) return;

    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveProject((current) => (current + 1) % portfolioProjects.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [isPaused, reduceMotion]);

  const showProject = (index: number) => {
    setDirection(index >= activeProject ? 1 : -1);
    setActiveProject(index);
  };

  const showPrevious = () => {
    setDirection(-1);
    setActiveProject((current) => (current - 1 + portfolioProjects.length) % portfolioProjects.length);
  };

  const showNext = () => {
    setDirection(1);
    setActiveProject((current) => (current + 1) % portfolioProjects.length);
  };

  return (
    <section className="section portfolioSection" id="about" aria-labelledby="portfolio-title">
      <div className="container">
        <Reveal>
          <div className="sectionHeading portfolioHeading">
            <p className="eyebrow">Recent work</p>
            <h2 id="portfolio-title">Smart websites built to <span>win more customers</span></h2>
            <p>Every BotPager Smart Website connects design, lead generation, AI, automation, follow-up, and booking into one system built to grow your business.</p>
          </div>
        </Reveal>

        <Reveal className="portfolioShowcase">
          <div
            className="portfolioStage"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
          >
            <div className="portfolioMedia">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  className="portfolioSlide"
                  key={project.image}
                  custom={direction}
                  initial={reduceMotion ? false : { opacity: 0, x: direction * 70, scale: 0.985 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: direction * -70, scale: 0.985 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={project.image}
                    width={project.width}
                    height={project.height}
                    alt={`${project.name} website project mockup`}
                    sizes="(max-width: 820px) 100vw, 1180px"
                  />
                </motion.div>
              </AnimatePresence>
              <span className="portfolioNumber">{String(activeProject + 1).padStart(2, "0")} / {String(portfolioProjects.length).padStart(2, "0")}</span>
            </div>

            <div className="portfolioDetails" aria-live="polite">
              <div className="portfolioCopy">
                <div className="portfolioTags"><span>{project.language}</span><span>{project.category}</span></div>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </div>
              <div className="portfolioControls" role="group" aria-label="Navigate projects">
                <button type="button" onClick={showPrevious} aria-label="Show previous project"><ChevronLeft /><span>Previous project</span></button>
                <button type="button" onClick={showNext} aria-label="Show next project"><span>Next project</span><ChevronRight /></button>
              </div>
            </div>
          </div>

          <div className="portfolioThumbnails" aria-label="Select a project">
            {portfolioProjects.map((item, index) => (
              <button
                type="button"
                className={index === activeProject ? "active" : ""}
                key={item.name}
                onClick={() => showProject(index)}
                aria-label={`Show ${item.name}`}
                aria-current={index === activeProject ? "true" : undefined}
              >
                <Image src={item.image} width={item.width} height={item.height} alt="" aria-hidden="true" sizes="150px" />
                <span><b>{item.name}</b><small>{item.language}</small></span>
              </button>
            ))}
          </div>
        </Reveal>
        <SectionCTA>Build My Smart Website</SectionCTA>
      </div>
    </section>
  );
}

function HowItWorks({ variant = "default" }: { variant?: LandingVariant }) {
  const isConversion = variant === "conversion";
  const steps = isConversion ? [
    {
      title: "Attract Interested People",
      text: "We help you get found by the right people across the platforms they already use.",
      benefit: "More visibility. More visitors. More opportunities.",
      benefitIcon: UsersRound,
      visual: <Image className="conversionStepImage" src="/images/steps/step-1.png" width={1086} height={1448} alt="Meta and Google channels attracting interested people to a business website" sizes="(max-width: 580px) 82vw, (max-width: 1080px) 42vw, 260px" />,
    },
    {
      title: "Respond 24/7",
      text: "Your AI assistant instantly answers questions and engages visitors anytime, day or night.",
      benefit: "Instant replies. Happy customers. No opportunity missed.",
      benefitIcon: MessageCircleMore,
      visual: <Image className="conversionStepImage" src="/images/steps/step-2-light.jpg" width={1536} height={1024} alt="BotPager AI responding instantly to a visitor and capturing a quote request" sizes="(max-width: 580px) 82vw, (max-width: 1080px) 42vw, 260px" />,
    },
    {
      title: "Keep Following Up",
      text: "Smart follow-ups and reminders keep the conversation going and move people closer to booking.",
      benefit: "Automatic follow-ups. Stronger relationships. More bookings.",
      benefitIcon: CalendarCheck2,
      visual: <Image className="conversionStepImage" src="/images/steps/step-3-light.jpg" width={1536} height={1024} alt="Automated follow-up sequence moving a new inquiry toward a booking" sizes="(max-width: 580px) 82vw, (max-width: 1080px) 42vw, 260px" />,
    },
    {
      title: "Win More Customers",
      text: "See every conversation turn into real customers and measurable business growth.",
      benefit: "More customers. More revenue. Real business growth.",
      benefitIcon: TrendingUp,
      visual: <Image className="conversionStepImage" src="/images/steps/step-4.png" width={1086} height={1448} alt="Results dashboard showing new inquiries, customers, and revenue growth" sizes="(max-width: 580px) 82vw, (max-width: 1080px) 42vw, 260px" />,
    },
  ] : [
    { title: "Generate & Capture More Leads", text: "We run ads and build pages that attract the right people.", benefit: "", benefitIcon: UsersRound, visual: <div className="channelIcons"><span>Meta</span><b>G</b><span>Google</span></div> },
    { title: "Respond Instantly", text: "Our chatbot replies in seconds and qualifies every lead.", benefit: "", benefitIcon: MessageCircleMore, visual: <div className="messageDemo"><p>Hi! How can we help you today?</p><b>I need a quote.</b><i>•••</i></div> },
    { title: "Follow Up Automatically", text: "We nurture leads with smart SMS & email follow-ups.", benefit: "", benefitIcon: CalendarCheck2, visual: <div className="flowDemo"><b>New Lead Captured</b><ArrowRight /><span>Send Welcome SMS</span><ArrowRight /><span>Follow-Up Email</span></div> },
    { title: "Track Everything", text: "See leads, jobs, and revenue in your live dashboard.", benefit: "", benefitIcon: TrendingUp, visual: <div className="metricsDemo"><span>New Leads <b>128</b></span><span>Booked Jobs <b>36</b></span><strong>$24,780</strong><TrendingUp /></div> },
  ];
  return (
    <section className={`section howSection ${isConversion ? "conversionHowSection" : ""}`} id="how-it-works" aria-labelledby="how-it-works-title">
      <div className="container">
        <Reveal><SectionHeading headingId="how-it-works-title" title={isConversion ? <>From first visit to new customer in <span>4 simple steps</span></> : <>Done for your business in <span>4 simple steps</span></>} text={isConversion ? "BotPager works 24/7 to attract, engage, follow up, and turn more interest into paying customers." : undefined} /></Reveal>
        <div className={`stepsGrid ${isConversion ? "conversionStepsGrid" : ""}`}>
          {steps.map((step, index) => {
            const BenefitIcon = step.benefitIcon;
            return (
              <Reveal className={`stepCard ${isConversion ? "conversionStepCard" : ""}`} delay={index * 0.08} key={step.title}>
                <div className="stepTop"><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></div>
                <div className="stepVisual">{step.visual}</div>
                {isConversion && <div className="stepBenefit"><BenefitIcon /><span>{step.benefit}</span></div>}
              </Reveal>
            );
          })}
        </div>
        {isConversion && (
          <Reveal className="ecosystemSummary">
            <span><Gauge />Works 24/7</span>
            <span><Sparkles />AI-Powered</span>
            <span><Check />Never Miss an Opportunity</span>
            <span><TrendingUp />Data-Driven Growth</span>
          </Reveal>
        )}
        <SectionCTA>{isConversion ? "Build This System for My Business" : "Automate My Lead Follow-Up"}</SectionCTA>
      </div>
    </section>
  );
}

function BenefitBand({ variant = "default" }: { variant?: LandingVariant }) {
  const isConversion = variant === "conversion";
  const benefitItems = isConversion ? conversionBenefits : benefits;

  return (
    <section className="benefitBand" aria-labelledby="benefits-title">
      <div className="container">
        <Reveal><SectionHeading headingId="benefits-title" light title={isConversion ? "A simpler way to get and keep more customers" : "Why local service businesses choose BotPager"} /></Reveal>
        <div className="benefitGrid">
          {benefitItems.map(({ icon: Icon, title, text }) => <div key={title}><Icon /><h3>{title}</h3><p>{text}</p></div>)}
        </div>
        <SectionCTA light>See What BotPager Can Do</SectionCTA>
      </div>
    </section>
  );
}

function ServiceIndustriesCarousel() {
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const totalIndustries = serviceIndustries.length;

  useEffect(() => {
    if (reduceMotion || isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndustry((current) => (current + 1) % totalIndustries);
    }, 4800);

    return () => window.clearInterval(timer);
  }, [isPaused, reduceMotion, totalIndustries]);

  const showPrevious = () => {
    setActiveIndustry((current) => (current - 1 + totalIndustries) % totalIndustries);
  };

  const showNext = () => {
    setActiveIndustry((current) => (current + 1) % totalIndustries);
  };

  const getPosition = (index: number) => {
    const forwardOffset = (index - activeIndustry + totalIndustries) % totalIndustries;
    const offset = forwardOffset > totalIndustries / 2 ? forwardOffset - totalIndustries : forwardOffset;

    if (offset < -3 || offset > 3) return "hidden";
    if (offset === 0) return "center";
    return `${offset < 0 ? "left" : "right"}${Math.abs(offset)}`;
  };

  return (
    <section className="serviceIndustriesSection" id="industries" aria-labelledby="service-industries-title">
      <div className="container">
        <Reveal>
          <div className="sectionHeading serviceIndustriesHeading">
            <p className="eyebrow">Built for local service businesses</p>
            <h2 id="service-industries-title">Growth systems for the services <span>America books most</span></h2>
            <p>Explore how BotPager helps local service businesses get found, respond faster, and book more customers.</p>
          </div>
        </Reveal>
      </div>

      <Reveal className="serviceCarouselShell">
        <div
          className="serviceCarousel"
          role="region"
          aria-roledescription="carousel"
          aria-label="Local service industries BotPager supports"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
        >
          <div className="serviceCarouselStage">
            {serviceIndustries.map((industry, index) => {
              const position = getPosition(index);
              const isActive = index === activeIndustry;

              return (
                <article
                  className="serviceIndustryCard"
                  data-position={position}
                  key={industry.title}
                  aria-hidden={position === "hidden" ? "true" : undefined}
                >
                  <button
                    className="serviceIndustrySelect"
                    type="button"
                    onClick={() => setActiveIndustry(index)}
                    aria-label={`Show ${industry.title}`}
                    tabIndex={position === "hidden" ? -1 : 0}
                  />
                  <Image
                    src={industry.image}
                    alt={`${industry.title} professional serving a local customer`}
                    fill
                    sizes="(max-width: 580px) 74vw, (max-width: 1080px) 34vw, 310px"
                  />
                  <div className="serviceIndustryCopy">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{industry.title}</h3>
                    <p>{industry.text}</p>
                  </div>
                  {isActive && <span className="serviceActiveLabel">Featured service</span>}
                </article>
              );
            })}
          </div>

          <div className="serviceCarouselControls">
            <button type="button" onClick={showPrevious} aria-label="Show previous service"><ChevronLeft /></button>
            <div className="serviceCarouselStatus" aria-live="polite" aria-atomic="true">
              <span>{String(activeIndustry + 1).padStart(2, "0")}</span>
              <i aria-hidden="true"><b style={{ width: `${((activeIndustry + 1) / totalIndustries) * 100}%` }} /></i>
              <span>{String(totalIndustries).padStart(2, "0")}</span>
              <strong>{serviceIndustries[activeIndustry].title}</strong>
            </div>
            <button type="button" onClick={showNext} aria-label="Show next service"><ChevronRight /></button>
          </div>
        </div>
      </Reveal>
      <SectionCTA className="serviceIndustriesCta">Grow My Local Service Business</SectionCTA>
    </section>
  );
}

function Industries({ variant = "default" }: { variant?: LandingVariant }) {
  if (variant === "conversion") return <ServiceIndustriesCarousel />;

  return (
    <section className="section industrySection" aria-labelledby="industries-title">
      <div className="container">
        <Reveal><SectionHeading headingId="industries-title" title="Who it’s for" /></Reveal>
        <div className="industryGrid">
          {industries.map(({ icon: Icon, title, text, color }) => <Reveal key={title} className={`industryCard ${color}`}><Icon /><h3>{title}</h3><p>{text}</p></Reveal>)}
        </div>
        <SectionCTA>See If BotPager Fits My Business</SectionCTA>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="section pricingSection" id="pricing" aria-labelledby="pricing-title">
      <div className="container pricingContainer">
        <Reveal><SectionHeading headingId="pricing-title" eyebrow="Simple, scalable plans" title="Choose the growth system that fits today" text="Start with the essentials or add the automation, visibility, and AI your business needs to scale." /></Reveal>
        <div className="pricingGrid">
          {plans.map((plan) => (
            <Reveal className={`priceCard ${plan.popular ? "popular" : ""}`} key={plan.name}>
              {plan.popular && <span className="popularLabel">Recommended</span>}
              <div className="priceHead">
                <div className="priceIdentity"><span>Plan {plan.number}</span><h3>{plan.name}</h3><p>{plan.tagline}</p></div>
                <div className="price"><small>Starting at</small><strong>{plan.price}<span>/mo</span></strong></div>
              </div>
              <p className="priceSetup"><b>Setup</b>{plan.setup}</p>
              <div className="priceFit"><span>Best for</span><p>{plan.bestFor}</p></div>
              {plan.strategyCallout && <div className="priceStrategyCallout"><span><Sparkles /></span><p><b>{plan.strategyCallout.label}</b><small>{plan.strategyCallout.text}</small></p></div>}
              <ul className="priceHighlights">{plan.highlights.map((feature) => <li key={feature}><Check />{feature}</li>)}</ul>
              {plan.recommendedAddOn && <p className="priceUpsell"><Sparkles /> <span><b>Recommended add-on</b>{plan.recommendedAddOn}</span></p>}
              <details className="priceDisclosure">
                <summary><span>View full plan details</span><ChevronDown /></summary>
                <div className="priceDisclosureContent">
                  {plan.detailGroups.map((group) => (
                    <div className={group.muted ? "priceDetailGroup priceDetailMuted" : "priceDetailGroup"} key={group.title}>
                      <h4>{group.title}</h4>
                      <ul>{group.items.map((item) => <li key={item}>{group.muted ? <span aria-hidden="true">—</span> : <Check />}{item}</li>)}</ul>
                    </div>
                  ))}
                </div>
              </details>
              <a className="button priceButton" href="/audit">Book a Strategy Call <ArrowRight size={16} /></a>
              <p className="priceFinePrint">{plan.note}</p>
            </Reveal>
          ))}
        </div>

        <div className="addOnsSection" aria-labelledby="add-ons-title">
          <Reveal className="addOnsHeading">
            <div><p className="eyebrow">Build your own stack</p><h3 id="add-ons-title">Optional add-ons</h3></div>
            <p>Add focused capabilities when the timing is right—without moving to a larger plan too early.</p>
          </Reveal>
          <div className="addOnsGrid">
            {optionalAddOns.map((addOn, index) => {
              const AddOnIcon = addOn.icon;
              return (
                <Reveal className="addOnCard" delay={index * 0.05} key={addOn.name}>
                  <div className="addOnTop"><span><AddOnIcon /></span><small>Add-on</small></div>
                  <h4>{addOn.name}</h4>
                  <p className="addOnTagline">{addOn.tagline}</p>
                  <p className="addOnPrice"><small>Starting at</small>{addOn.price}</p>
                  {addOn.meta && <div className="addOnMeta">{addOn.meta.map((item) => <span key={item}>{item}</span>)}</div>}
                  <details className="addOnDisclosure">
                    <summary><span>See what’s included</span><ChevronDown /></summary>
                    <div>
                      <ul>{addOn.includes.map((item) => <li key={item}><Check />{item}</li>)}</ul>
                      {addOn.exclusions && <><h5>Not included by default</h5><ul className="addOnExclusions">{addOn.exclusions.map((item) => <li key={item}><span aria-hidden="true">—</span>{item}</li>)}</ul></>}
                    </div>
                  </details>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection({ faqData }: { faqData: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="section faqSection" id="faq" aria-labelledby="faq-title">
      <div className="container narrow">
        <Reveal><SectionHeading headingId="faq-title" title="Frequently asked questions" /></Reveal>
        <div className="faqGrid">
          {faqData.map(([question, answer], index) => (
            <div className={`faqItem ${open === index ? "faqOpen" : ""}`} key={question}>
              <button onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index}>
                <span>{question}</span><ChevronDown />
              </button>
              <AnimatePresence initial={false}>
                {open === index && <motion.div className="faqAnswer" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}><p>{answer}</p></motion.div>}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <SectionCTA>See Your Growth Opportunities</SectionCTA>
      </div>
    </section>
  );
}

function FinalCTA({ variant = "default" }: { variant?: LandingVariant }) {
  const isConversion = variant === "conversion";

  return (
    <>
      <section className="finalCta" id="audit" aria-labelledby="final-cta-title">
        <div className="container finalCtaInner">
          <div className="ctaBot"><Image src="/images/botpager-isotype.png" width={604} height={603} alt="" aria-hidden="true" /></div>
          <div><h2 id="final-cta-title">{isConversion ? <>Ready to get<br />more customers?</> : <>Ready to grow<br />without losing leads?</>}</h2><p>{isConversion ? "Get a free 10-minute audit and see where your business can attract, respond to, and convert more customers." : "Get a free 10-minute audit and see how BotPager can help your business get more booked jobs."}</p></div>
          <div className="ctaAction"><PrimaryButton light>Get Your Free Growth Audit</PrimaryButton><span><Globe2 /> botpager.com &nbsp;&nbsp; <Phone /> 239-251-0184</span></div>
        </div>
      </section>
    </>
  );
}

function InstagramMark() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.7" r=".8" fill="currentColor" stroke="none" /></svg>;
}

function TikTokMark() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.4 3h3.1c.3 1.8 1.3 3 3.5 3.3v3.1a8.4 8.4 0 0 1-3.5-1v6.8a5.8 5.8 0 1 1-5.8-5.8c.4 0 .8 0 1.2.1v3.2a2.8 2.8 0 1 0 1.5 2.5V3Z" /></svg>;
}

function LinkedInMark() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.1 8.3H2.4V21h2.7V8.3ZM3.8 3A1.6 1.6 0 1 0 3.8 6.2 1.6 1.6 0 0 0 3.8 3ZM21.6 13.7c0-3.8-2-5.6-4.7-5.6-2.2 0-3.1 1.2-3.7 2v-1.8h-2.7V21h2.7v-6.3c0-1.7.3-3.3 2.4-3.3 2.1 0 2.1 1.9 2.1 3.4V21h2.8v-7.3Z" /></svg>;
}

export function SiteFooter({ variant = "default" }: { variant?: LandingVariant }) {
  const isConversion = variant === "conversion";

  return (
    <footer className="footer">
      <div className="container footerGrid">
        <div><Logo light /><p>{isConversion ? "Websites and automated follow-up that help local service businesses get more customers." : "AI-powered websites, chatbots, and automations that turn more leads into booked jobs."}</p><p className="footerLegalIdentity">BotPager is operated by Uno Zero Marketing LLC.<br />23945 SAN GIOVANNI DR<br />LAND O LAKES FL 34639</p><div className="socials"><a href="#" aria-label="Instagram"><InstagramMark /></a><a href="#" aria-label="TikTok"><TikTokMark /></a><a href="#" aria-label="LinkedIn"><LinkedInMark /></a></div></div>
        <div><h3>Solutions</h3><a href="/#solutions">AI Website</a><a href="/#solutions">Chatbot</a><a href="/#how-it-works">Automations</a><a href="/#pricing">Pricing</a></div>
        <div><h3>Company</h3><a href="/#about">About Us</a><a href="/#how-it-works">How It Works</a><a href="/#faq">Resources</a><a href="mailto:info@botpager.com">Contact</a></div>
        <div><h3>Get in touch</h3><a href="https://botpager.com"><Globe2 /> botpager.com</a><a href="tel:+12392510184"><Phone /> 239-251-0184</a><a href="mailto:info@botpager.com"><Mail /> info@botpager.com</a><a href="mailto:legal@botpager.com"><Mail /> legal@botpager.com</a></div>
      </div>
      <div className="container footerBottom"><span>© 2026 BotPager. All rights reserved.</span><span><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a></span></div>
    </footer>
  );
}

export function LandingPage({ faqData, variant = "default" }: { faqData: FAQ[]; variant?: LandingVariant }) {
  return (
    <>
      <a className="skipLink" href="#main-content">Skip to main content</a>
      <Header />
      <main id="main-content">
        <Hero variant={variant} />
        <ResultsSection variant={variant} />
        <Industries variant={variant} />
        <GoogleVisibilitySection />
        <PortfolioShowcaseSection />
        <HowItWorks variant={variant} />
        <AuditCTA variant={variant} />
        {variant !== "conversion" && <BenefitBand variant={variant} />}
        <Pricing />
        <FAQSection faqData={faqData} />
        <FinalCTA variant={variant} />
      </main>
      <SiteFooter variant={variant} />
    </>
  );
}
