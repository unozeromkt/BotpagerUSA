"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  FileSearch,
  Globe2,
  Link2,
  Map,
  MapPin,
  Menu,
  MessageCircleMore,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react";
import styles from "./seo-geo-landing.module.css";

type FAQ = { question: string; answer: string };

const visibilityAuditUrl = "/visibility-audit";

const visibilityServices = [
  {
    number: "01",
    icon: Search,
    title: "Search Visibility",
    summary:
      "Help Google understand your website and connect your pages with the services customers are actively searching for.",
    includes: [
      "Technical SEO",
      "On-page SEO",
      "Service page optimization",
      "Keyword and search intent strategy",
      "Internal linking",
      "Indexation and crawlability",
    ],
  },
  {
    number: "02",
    icon: MapPin,
    title: "Local Visibility",
    summary:
      "Strengthen the signals that help your business appear for relevant searches in your service area.",
    includes: [
      "Google Business Profile optimization",
      "Google Maps visibility",
      "Service + location relevance",
      "Local landing pages",
      "Business information consistency",
      "Review and reputation strategy",
    ],
  },
  {
    number: "03",
    icon: BadgeCheck,
    title: "Content Authority",
    summary:
      "Build useful content around the real questions and problems your customers search for.",
    includes: [
      "Topic and content gaps",
      "Service-specific content",
      "Location-specific content",
      "FAQs and customer questions",
      "Expert-led content",
      "Content updates and optimization",
    ],
  },
  {
    number: "04",
    icon: BrainCircuit,
    title: "AI Search Readiness / GEO",
    summary:
      "Improve how clearly AI-powered search systems can identify, interpret and reference your business.",
    includes: [
      "Business entity clarity",
      "Service and location clarity",
      "AI crawler accessibility",
      "Structured business information",
      "Schema implementation",
      "Citation-friendly pages",
      "Search + AI visibility monitoring",
    ],
  },
];

const auditSignals = [
  { label: "Search Visibility", value: 72, icon: Search },
  { label: "Local Visibility", value: 64, icon: MapPin },
  { label: "Online Reputation", value: 86, icon: Star },
  { label: "AI Readiness", value: 41, icon: Sparkles },
  { label: "Conversion Readiness", value: 78, icon: TrendingUp },
];

const process = [
  {
    number: "01",
    title: "Discover",
    text: "We identify where your search and AI visibility is weak.",
    icon: FileSearch,
  },
  {
    number: "02",
    title: "Prioritize",
    text: "We focus first on the improvements with the highest potential impact.",
    icon: Target,
  },
  {
    number: "03",
    title: "Optimize",
    text: "We improve your website, local presence, content and technical signals.",
    icon: Wrench,
  },
  {
    number: "04",
    title: "Measure",
    text: "We track search visibility, local performance and emerging AI-search signals over time.",
    icon: BarChart3,
  },
];

const improvements = [
  "Technical website SEO",
  "Page titles and search intent",
  "Service page creation",
  "Local landing pages",
  "Google Business Profile optimization",
  "Google Maps visibility",
  "Structured data / Schema",
  "Content authority",
  "Internal linking",
  "Business entity consistency",
  "Review strategy",
  "AI crawler accessibility",
  "AI-search-ready content",
  "Search Console monitoring",
  "Bing Webmaster Tools monitoring",
  "Conversion improvements",
  "AI lead capture and follow-up",
];

const connectedServices = [
  { label: "Smart Website", href: "/services/smart-websites" },
  { label: "AI Agent", href: "/services/ai-agent" },
  { label: "CRM", href: "/services/crm-automations" },
  { label: "Automations", href: "/services/crm-automations" },
  { label: "Lead tracking", href: "/services/crm-automations" },
  { label: "Paid Ads", href: "/services/google-ads" },
];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      className={`${styles.logo} ${light ? styles.logoLight : ""}`}
      href="/"
      aria-label="BotPager home"
    >
      <Image
        src="/images/botpager-isotype.png"
        width={604}
        height={603}
        alt=""
        aria-hidden="true"
        priority
      />
      <span>
        Bot<span>Pager</span>
      </span>
    </Link>
  );
}

function AuditButton({
  children,
  secondary = false,
}: {
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      className={`${styles.button} ${secondary ? styles.buttonSecondary : ""}`}
      href={visibilityAuditUrl}
    >
      {children}
      <ArrowRight aria-hidden="true" />
    </Link>
  );
}

function SectionIntro({
  eyebrow,
  title,
  text,
  light = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  text?: string;
  light?: boolean;
}) {
  return (
    <div className={`${styles.sectionIntro} ${light ? styles.sectionIntroLight : ""}`}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      {text && <p className={styles.sectionLead}>{text}</p>}
    </div>
  );
}

export function SeoGeoLanding({ faqs }: { faqs: FAQ[] }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.pageShell}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>

      <header className={styles.header}>
        <div className={styles.navbar}>
          <Logo />
          <nav className={styles.desktopNav} aria-label="Main navigation">
            <a href="#why-now">Why now</a>
            <a href="#visibility-strategy">What we improve</a>
            <a href="#how-it-works">How it works</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className={styles.navCta}>
            <AuditButton>Check my score</AuditButton>
          </div>
          <button
            className={styles.menuButton}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav className={styles.mobileNav} aria-label="Mobile navigation">
            <a href="#why-now" onClick={() => setMenuOpen(false)}>
              Why now
            </a>
            <a href="#visibility-strategy" onClick={() => setMenuOpen(false)}>
              What we improve
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How it works
            </a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>
              FAQ
            </a>
            <AuditButton>Check my visibility score</AuditButton>
          </nav>
        )}
      </header>

      <main id="main-content">
        <section className={styles.hero} id="top" aria-labelledby="hero-title">
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>
                <Sparkles aria-hidden="true" /> Local SEO + AI search visibility
              </p>
              <h1 id="hero-title">
                Get found on <span>Google, Maps</span> &amp; AI Search
              </h1>
              <p className={styles.heroLead}>
                Customers are no longer discovering businesses in just one place.
                BotPager improves the signals that make your business easier to find,
                understand and trust across traditional search, local search and
                AI-powered discovery.
              </p>
              <div className={styles.heroActions}>
                <AuditButton>Check my visibility score</AuditButton>
                <div className={styles.heroProof}>
                  <CircleCheck aria-hidden="true" />
                  <span>
                    <b>Free visibility audit</b>
                    See where you stand before you spend anything.
                  </span>
                </div>
              </div>
              <div className={styles.trustRow} aria-label="Visibility channels">
                <span>Google Search</span>
                <span>Google Maps</span>
                <span>AI Answers</span>
              </div>
            </div>

            <div className={styles.heroVisual} aria-label="Search journey from discovery to your business">
              <div className={styles.visualGlow} aria-hidden="true" />
              <div className={styles.searchCard}>
                <div className={styles.visualTopbar}>
                  <span>
                    <i /> Live visibility map
                  </span>
                  <span className={styles.visualStatus}>Signals connected</span>
                </div>
                <div className={styles.searchQuery}>
                  <Search aria-hidden="true" />
                  <span>best local service near me</span>
                  <kbd>↵</kbd>
                </div>
                <div className={styles.journey}>
                  <div className={styles.journeyNode}>
                    <span className={styles.googleIcon}>G</span>
                    <small>Google</small>
                    <b>Search</b>
                  </div>
                  <ChevronRight aria-hidden="true" />
                  <div className={styles.journeyNode}>
                    <span className={styles.mapIcon}>
                      <MapPin />
                    </span>
                    <small>Google</small>
                    <b>Maps</b>
                  </div>
                  <ChevronRight aria-hidden="true" />
                  <div className={styles.journeyNode}>
                    <span className={styles.aiIcon}>
                      <Sparkles />
                    </span>
                    <small>Generative</small>
                    <b>AI Search</b>
                  </div>
                </div>
                <div className={styles.businessResult}>
                  <div className={styles.businessIcon}>
                    <BriefcaseBusiness aria-hidden="true" />
                  </div>
                  <div>
                    <small>Recommended local result</small>
                    <b>Your Business</b>
                    <span>
                      <Star fill="currentColor" /> 4.9 · Trusted local provider
                    </span>
                  </div>
                  <BadgeCheck aria-hidden="true" />
                </div>
              </div>
              <div className={styles.scorePill}>
                <span>Visibility score</span>
                <b>82</b>
                <small>/100</small>
              </div>
              <div className={styles.citationPill}>
                <Bot aria-hidden="true" />
                <span>
                  <small>AI readiness</small>
                  <b>Business understood</b>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.landscape} id="why-now" aria-labelledby="landscape-title">
          <div className={styles.landscapeGrid}>
            <div>
              <p className={styles.eyebrow}>The search landscape has changed</p>
              <h2 id="landscape-title">
                Being on Google is <span>no longer enough</span>
              </h2>
              <p>
                Your business needs clear, consistent and authoritative information
                across the web so search engines and AI systems can understand:
              </p>
              <div className={styles.statement}>
                Who you are. What you do. Where you work. Why customers should trust you.
              </div>
              <AuditButton secondary>See how visible my business is</AuditButton>
            </div>
            <div className={styles.discoveryPanel}>
              <p>Where customers discover local businesses now</p>
              {[
                [Search, "Google Search", "Traditional intent"],
                [Map, "Google Maps", "Local proximity"],
                [Sparkles, "AI Overviews", "Generated answers"],
                [MessageCircleMore, "AI assistants", "Conversational discovery"],
                [Star, "Reviews", "Local recommendations"],
              ].map(([Icon, label, detail]) => {
                const DiscoveryIcon = Icon as typeof Search;
                return (
                  <div className={styles.discoveryRow} key={label as string}>
                    <span><DiscoveryIcon aria-hidden="true" /></span>
                    <b>{label as string}</b>
                    <small>{detail as string}</small>
                    <Check aria-hidden="true" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.strategy} id="visibility-strategy" aria-labelledby="strategy-title">
          <div className={styles.contentWrap}>
            <SectionIntro
              eyebrow="What we improve"
              title={<>One visibility strategy for <span>Search + AI</span></>}
              text="Four connected areas strengthen how customers, search engines and AI systems discover and understand your business."
            />
            <div className={styles.serviceGrid}>
              {visibilityServices.map((service) => {
                const Icon = service.icon;
                return (
                  <article className={styles.serviceCard} key={service.number}>
                    <div className={styles.serviceCardTop}>
                      <span className={styles.serviceIcon}><Icon aria-hidden="true" /></span>
                      <span className={styles.serviceNumber}>{service.number}</span>
                    </div>
                    <h3>{service.title}</h3>
                    <p>{service.summary}</p>
                    <div className={styles.includesLabel}>What&apos;s included</div>
                    <ul>
                      {service.includes.map((item) => (
                        <li key={item}><Check aria-hidden="true" /> {item}</li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.explainer} aria-labelledby="explainer-title">
          <div className={styles.explainerGrid}>
            <div className={styles.explainerVisual} aria-hidden="true">
              <div className={styles.vennSeo}>
                <Search />
                <b>SEO</b>
                <small>Get found</small>
              </div>
              <div className={styles.vennGeo}>
                <BrainCircuit />
                <b>GEO</b>
                <small>Get understood</small>
              </div>
              <span className={styles.vennCenter}>Visibility</span>
            </div>
            <div className={styles.explainerCopy}>
              <p className={styles.eyebrow}>SEO + GEO, explained simply</p>
              <h2 id="explainer-title">
                SEO gets you found. <span>AI visibility helps you get understood.</span>
              </h2>
              <p>
                Traditional SEO helps search engines discover and rank your website.
                <strong> Generative Engine Optimization (GEO)</strong> extends that work by
                improving the clarity, authority and structure of your online presence for
                AI-powered search experiences.
              </p>
              <div className={styles.truthCard}>
                <ShieldCheck aria-hidden="true" />
                <p>
                  <b>There is no secret “AI ranking trick.”</b>
                  The foundation remains strong SEO, useful content, accurate business
                  information and clear, trustworthy signals.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.audit} aria-labelledby="audit-title">
          <div className={styles.auditGrid}>
            <div className={styles.auditCopy}>
              <p className={styles.eyebrow}>Free Search + AI visibility audit</p>
              <h2 id="audit-title">How visible is your business right now?</h2>
              <p>
                Receive a simple score across five critical areas, plus the highest-priority
                opportunities holding your business back.
              </p>
              <AuditButton>Get my free visibility score</AuditButton>
              <span className={styles.noTech}><CircleCheck /> No technical knowledge required.</span>
            </div>
            <div className={styles.auditCard}>
              <div className={styles.auditCardHead}>
                <div>
                  <small>Sample visibility report</small>
                  <b>Local Business</b>
                </div>
                <div className={styles.auditScore}><b>68</b><span>/100</span></div>
              </div>
              <div className={styles.signalList}>
                {auditSignals.map(({ label, value, icon: Icon }) => (
                  <div className={styles.signalRow} key={label}>
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                    <div className={styles.signalTrack}><i style={{ width: `${value}%` }} /></div>
                    <b>{value}</b>
                  </div>
                ))}
              </div>
              <div className={styles.priorityFlag}>
                <Target aria-hidden="true" />
                <span><small>Highest-priority opportunity</small><b>Improve AI business clarity</b></span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.processSection} id="how-it-works" aria-labelledby="process-title">
          <div className={styles.contentWrap}>
            <SectionIntro
              eyebrow="How BotPager works"
              title={<>From audit to <span>stronger visibility</span></>}
              text="A focused process that turns visibility gaps into a clear, measurable plan."
            />
            <div className={styles.processGrid}>
              {process.map(({ number, title, text, icon: Icon }, index) => (
                <article className={styles.processCard} key={number}>
                  <span className={styles.processNumber}>{number}</span>
                  <span className={styles.processIcon}><Icon aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  {index < process.length - 1 && <ArrowRight className={styles.processArrow} aria-hidden="true" />}
                </article>
              ))}
            </div>
            <div className={styles.centerCta}><AuditButton>Start with my free audit</AuditButton></div>
          </div>
        </section>

        <section className={styles.improvements} aria-labelledby="improvements-title">
          <div className={styles.improvementsGrid}>
            <div className={styles.improvementsHeading}>
              <p className={styles.eyebrow}>What BotPager can fix</p>
              <h2 id="improvements-title">Your visibility improvement plan may include</h2>
              <p>
                We prioritize the work your business actually needs—across the website,
                local presence, search systems and conversion path.
              </p>
            </div>
            <div className={styles.improvementList}>
              {improvements.map((item, index) => (
                <div key={item} className={index < 4 ? styles.highlightedImprovement : ""}>
                  <CircleCheck aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.difference} aria-labelledby="difference-title">
          <div className={styles.differenceInner}>
            <SectionIntro
              eyebrow="The BotPager difference"
              title={<>We don&apos;t optimize for <span>rankings alone</span></>}
              text="Traffic is useful only when it creates opportunities. BotPager connects visibility with the rest of your customer acquisition system."
              light
            />
            <div className={styles.growthFlow} aria-label="BotPager customer acquisition flow">
              {[
                [Search, "Get found"],
                [Globe2, "Get clicked"],
                [MessageCircleMore, "Get a response"],
                [Network, "Get followed up"],
                [ClipboardCheck, "Get booked"],
              ].map(([Icon, label], index) => {
                const FlowIcon = Icon as typeof Search;
                return (
                  <div className={styles.flowStep} key={label as string}>
                    <span><FlowIcon aria-hidden="true" /></span>
                    <b>{label as string}</b>
                    {index < 4 && <ChevronRight aria-hidden="true" />}
                  </div>
                );
              })}
            </div>
            <div className={styles.connectedServices}>
              <p>Your visibility strategy can work together with:</p>
              <div>
                {connectedServices.map((service) => (
                  <Link href={service.href} key={service.label}>
                    {service.label}<ArrowRight aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.faq} id="faq" aria-labelledby="faq-title">
          <div className={styles.faqGrid}>
            <div className={styles.faqIntro}>
              <p className={styles.eyebrow}>Frequently asked questions</p>
              <h2 id="faq-title">Straight answers about SEO &amp; GEO</h2>
              <p>
                Understand what changes, what stays foundational and what a credible
                visibility strategy can—and cannot—promise.
              </p>
              <AuditButton>Run my free visibility audit</AuditButton>
            </div>
            <div className={styles.faqList}>
              {faqs.map(({ question, answer }, index) => (
                <details key={question} open={index === 0}>
                  <summary>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {question}
                    <i aria-hidden="true" />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="final-cta-title">
          <div className={styles.finalCtaGlow} aria-hidden="true" />
          <div className={styles.finalCtaInner}>
            <span className={styles.finalIcon}><Search aria-hidden="true" /></span>
            <p className={styles.eyebrow}>Your next customer is already searching</p>
            <h2 id="final-cta-title">Find out how easy it is to find your business</h2>
            <p>
              See how your business performs across search, local discovery and
              AI-powered search—and what should be improved first.
            </p>
            <AuditButton>Check my visibility score</AuditButton>
            <small>Free audit. Simple score. Clear opportunities.</small>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div>
            <Logo light />
            <p>
              Connected visibility and customer acquisition systems for local service businesses.
            </p>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/services">Services</Link>
            <Link href="/industries">Industries</Link>
            <Link href="/about">About</Link>
            <Link href="/resources">Resources</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 BotPager. Operated by Uno Zero Marketing LLC.</span>
          <span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></span>
        </div>
      </footer>
    </div>
  );
}
