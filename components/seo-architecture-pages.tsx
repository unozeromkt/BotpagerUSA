import Link from "next/link";
import type { ArchitectureItem, IndustryPageContent, ServicePageContent } from "@/lib/seo/site-architecture";
import { Header, SiteFooter } from "@/components/landing-page";
import styles from "./seo-architecture-pages.module.css";

type HubPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  sectionTitle: string;
  sectionDescription: string;
  items: Pick<ArchitectureItem, "href" | "name" | "description" | "eyebrow">[];
};

function PageChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skipLink" href="#main-content">Skip to main content</a>
      <Header />
      {children}
      <SiteFooter variant="conversion" />
    </>
  );
}

export function ArchitectureHubPage({
  eyebrow,
  title,
  description,
  sectionTitle,
  sectionDescription,
  items,
}: HubPageProps) {
  return (
    <PageChrome>
      <main id="main-content" className={styles.page}>
        <section className={styles.hero} aria-labelledby="page-title">
          <div className={styles.shell}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><span>{title}</span>
            </nav>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1 id="page-title">{title}</h1>
            <p className={styles.lead}>{description}</p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="directory-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <h2 id="directory-title">{sectionTitle}</h2>
              <p>{sectionDescription}</p>
            </div>
            <div className={styles.grid}>
              {items.map((item) => (
                <Link className={styles.card} href={item.href} key={item.href}>
                  <small>{item.eyebrow}</small>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <strong>Explore this approach →</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <CallToAction />
      </main>
    </PageChrome>
  );
}

export function ArchitectureDetailPage({ item, parentLabel, parentHref }: { item: ArchitectureItem; parentLabel: string; parentHref: string }) {
  return (
    <PageChrome>
      <main id="main-content" className={styles.page}>
        <section className={styles.hero} aria-labelledby="page-title">
          <div className={styles.shell}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <Link href={parentHref}>{parentLabel}</Link><span aria-hidden="true">/</span>
              <span>{item.name}</span>
            </nav>
            <p className={styles.eyebrow}>{item.eyebrow}</p>
            <h1 id="page-title">{item.title}</h1>
            <p className={styles.lead}>{item.description}</p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionMuted}`} aria-label={`${item.name} overview`}>
          <div className={styles.shell}>
            <div className={styles.contentGrid}>
              <article className={styles.content}>
                <h2>Where opportunities get lost</h2>
                <ul>{item.challenges.map((challenge) => <li key={challenge}>{challenge}</li>)}</ul>
              </article>
              <article className={styles.content}>
                <h2>How the BotPager system helps</h2>
                <ul>{item.capabilities.map((capability) => <li key={capability}>{capability}</li>)}</ul>
              </article>
            </div>
            <div className={styles.outcome}>
              <small>Intended outcome</small>
              <p>{item.outcome}</p>
            </div>
            <nav className={styles.related} aria-label="Related services and industries">
              {item.relatedLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
            </nav>
          </div>
        </section>

        <CallToAction />
      </main>
    </PageChrome>
  );
}

export function IndustryDetailPage({ industry }: { industry: IndustryPageContent }) {
  return (
    <PageChrome>
      <main id="main-content" className={styles.page}>
        <section className={styles.hero} aria-labelledby="page-title">
          <div className={styles.shell}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <Link href="/industries">Industries</Link><span aria-hidden="true">/</span>
              <span>{industry.name}</span>
            </nav>
            <p className={styles.eyebrow}>{industry.eyebrow}</p>
            <h1 id="page-title">{industry.title}</h1>
            <p className={styles.lead}>{industry.description}</p>
            <div className={styles.heroActions}>
              <Link className={styles.button} href="/free-growth-audit">Get Your Free Growth Audit</Link>
              <Link className={styles.secondaryButton} href="#plumbing-system">Explore the system</Link>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="industry-overview-title">
          <div className={styles.shell}>
            <div className={styles.serviceIntro}>
              <div>
                <p className={styles.eyebrow}>Built around plumbing demand</p>
                <h2 id="industry-overview-title">Meet customers at the moment they need help</h2>
              </div>
              <div className={styles.serviceCopy}>
                {industry.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>
            <div className={styles.outcome}>
              <small>What the system is designed to create</small>
              <p>{industry.outcome}</p>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionMuted}`} aria-labelledby="acquisition-problems-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>Customer acquisition problems</p>
              <h2 id="acquisition-problems-title">Where plumbing opportunities get lost</h2>
              <p>Plumbing demand ranges from urgent service calls to carefully considered projects. Each path can break when information, response, or follow-up is disconnected.</p>
            </div>
            <div className={styles.challengeGrid}>
              {industry.acquisitionProblems.map((problem) => (
                <article className={styles.challengeCard} key={problem.title}>
                  <h3>{problem.title}</h3>
                  <p>{problem.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} id="plumbing-system" aria-labelledby="recommended-system-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>The recommended BotPager system</p>
              <h2 id="recommended-system-title">Connect the journey from search to scheduled work</h2>
              <p>The pieces work together around the way a plumbing customer discovers, evaluates, contacts, and chooses a provider.</p>
            </div>
            <div className={styles.detailGrid}>
              {industry.system.map((part, index) => (
                <article className={styles.detailCard} key={part.title}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{part.title}</h3>
                  <p>{part.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionMuted}`} aria-labelledby="website-ai-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>Website and AI</p>
              <h2 id="website-ai-title">Make it easier to ask for plumbing help</h2>
            </div>
            <div className={styles.contentGrid}>
              <article className={styles.content}>
                <h3>Smart Website functionality</h3>
                <p>Give urgent and planned-service customers a clear, mobile-friendly route to the right information and action.</p>
                <ul>{industry.smartWebsiteFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              </article>
              <article className={styles.content}>
                <h3>AI receptionist use cases</h3>
                <p>Provide a useful first response while preserving clear rules for safety, business judgment, and human handoff.</p>
                <ul>{industry.aiUseCases.map((useCase) => <li key={useCase}>{useCase}</li>)}</ul>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="growth-channels-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>Acquisition and conversion</p>
              <h2 id="growth-channels-title">Keep more qualified plumbing leads moving</h2>
              <p>Lead follow-up, organic visibility, and paid search each solve a different part of the customer journey.</p>
            </div>
            <div className={styles.detailGrid}>
              <article className={styles.detailCard}>
                <span>CRM &amp; automation</span>
                <h3>Lead follow-up</h3>
                <ul className={styles.detailList}>{industry.followUpUseCases.map((useCase) => <li key={useCase}>{useCase}</li>)}</ul>
              </article>
              <article className={styles.detailCard}>
                <span>Organic discovery</span>
                <h3>Local SEO strategy</h3>
                <ul className={styles.detailList}>{industry.localSeoStrategy.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
              <article className={styles.detailCard}>
                <span>High-intent demand</span>
                <h3>Paid search use cases</h3>
                <ul className={styles.detailList}>{industry.paidSearchUseCases.map((useCase) => <li key={useCase}>{useCase}</li>)}</ul>
              </article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionMuted}`} aria-labelledby="industry-faq-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>Digital marketing for plumbers FAQ</p>
              <h2 id="industry-faq-title">Common questions</h2>
            </div>
            <div className={styles.faqList}>
              {industry.faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary><span>{faq.question}</span><b aria-hidden="true">+</b></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
            <nav className={styles.related} aria-label="Related BotPager services">
              {industry.relatedLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
              <Link href="/industries">Explore all industries</Link>
            </nav>
          </div>
        </section>

        <CallToAction />
      </main>
    </PageChrome>
  );
}

export function ServiceDetailPage({ service }: { service: ServicePageContent }) {
  return (
    <PageChrome>
      <main id="main-content" className={styles.page}>
        <section className={styles.hero} aria-labelledby="page-title">
          <div className={styles.shell}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <Link href="/services">Services</Link><span aria-hidden="true">/</span>
              <span>{service.name}</span>
            </nav>
            <p className={styles.eyebrow}>{service.eyebrow}</p>
            <h1 id="page-title">{service.title}</h1>
            <p className={styles.lead}>{service.description}</p>
            <div className={styles.heroActions}>
              <Link className={styles.button} href="/free-growth-audit">Get Your Free Growth Audit</Link>
              <Link className={styles.secondaryButton} href="#how-it-works">See how it works</Link>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="service-overview-title">
          <div className={styles.shell}>
            <div className={styles.serviceIntro}>
              <div>
                <p className={styles.eyebrow}>Outcome-first service</p>
                <h2 id="service-overview-title">A clearer path from interest to customer</h2>
              </div>
              <div className={styles.serviceCopy}>
                {service.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>
            <div className={styles.detailGrid}>
              {service.details.map((detail, index) => (
                <article className={styles.detailCard} key={detail.title}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{detail.title}</h3>
                  <p>{detail.text}</p>
                </article>
              ))}
            </div>
            <div className={styles.outcome}>
              <small>What this service is designed to create</small>
              <p>{service.outcome}</p>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionMuted}`} aria-labelledby="service-challenges-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>The opportunity</p>
              <h2 id="service-challenges-title">Where local businesses lose momentum</h2>
              <p>BotPager focuses this service on practical gaps in the customer journey, not isolated tools or vanity activity.</p>
            </div>
            <div className={styles.challengeGrid}>
              {service.challenges.map((challenge) => <article className={styles.challengeCard} key={challenge}><p>{challenge}</p></article>)}
            </div>
          </div>
        </section>

        <section className={styles.section} id="how-it-works" aria-labelledby="service-process-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>How it works</p>
              <h2 id="service-process-title">Built around your customer journey</h2>
              <p>The exact scope depends on the business, but the work follows a clear progression from priorities to implementation and measurement.</p>
            </div>
            <ol className={styles.processGrid}>
              {service.process.map((step, index) => (
                <li className={styles.processCard} key={step.title}>
                  <span>Step {index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionMuted}`} aria-labelledby="service-faq-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>{service.name} FAQ</p>
              <h2 id="service-faq-title">Common questions</h2>
            </div>
            <div className={styles.faqList}>
              {service.faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary><span>{faq.question}</span><b aria-hidden="true">+</b></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
            <nav className={styles.related} aria-label="Related services and industries">
              {service.relatedLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
              <Link href="/services">Explore all BotPager services</Link>
            </nav>
          </div>
        </section>

        <CallToAction />
      </main>
    </PageChrome>
  );
}

export function ResourceHubPage({ topics }: { topics: string[] }) {
  return (
    <PageChrome>
      <main id="main-content" className={styles.page}>
        <section className={styles.hero} aria-labelledby="page-title">
          <div className={styles.shell}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><span>Resources</span>
            </nav>
            <p className={styles.eyebrow}>Practical growth guidance</p>
            <h1 id="page-title">Resources for Local Service Businesses</h1>
            <p className={styles.lead}>Clear guidance for getting found, responding faster, following up consistently, and turning more local inquiries into customers.</p>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="resource-topics-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <h2 id="resource-topics-title">Topics we are building around</h2>
              <p>Articles will be published only when they provide a useful, complete answer and connect naturally to the relevant BotPager service.</p>
            </div>
            <div className={styles.grid}>
              {topics.map((topic) => <article className={styles.card} key={topic}><small>Resource topic</small><h3>{topic}</h3><p>Actionable explanations, comparisons, and next steps for local service business owners.</p></article>)}
            </div>
          </div>
        </section>
        <CallToAction />
      </main>
    </PageChrome>
  );
}

export function AboutBotPagerPage() {
  const values = [
    ["Built for local services", "BotPager is designed for appointment-, quote-, and job-driven businesses that need a practical path from local discovery to customer follow-up."],
    ["One connected system", "Smart Websites, AI response, CRM automation, local visibility, and paid acquisition are planned as connected parts of the customer journey."],
    ["Outcome focused", "The work centers on clearer customer journeys, faster responses, organized opportunities, and more chances to earn the booking."],
  ];

  return (
    <PageChrome>
      <main id="main-content" className={styles.page}>
        <section className={styles.hero} aria-labelledby="page-title">
          <div className={styles.shell}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>About</span></nav>
            <p className={styles.eyebrow}>About BotPager</p>
            <h1 id="page-title">A Growth System for Local Service Businesses</h1>
            <p className={styles.lead}>BotPager helps local service businesses in the United States get found, capture inquiries, respond faster, follow up automatically, and turn more opportunities into customers.</p>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="about-system-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <h2 id="about-system-title">Practical tools that work together</h2>
              <p>BotPager brings the customer-facing website and the behind-the-scenes response, tracking, and follow-up workflow into one coordinated approach.</p>
            </div>
            <div className={styles.grid}>
              {values.map(([title, copy]) => <article className={styles.card} key={title}><small>BotPager principle</small><h3>{title}</h3><p>{copy}</p></article>)}
            </div>
            <div className={styles.outcome}>
              <small>Company identity</small>
              <p>BotPager is operated by Uno Zero Marketing LLC and serves local service businesses with websites, AI communication, automation, local visibility, and digital acquisition support.</p>
            </div>
          </div>
        </section>
        <CallToAction />
      </main>
    </PageChrome>
  );
}

function CallToAction() {
  return (
    <section className={styles.cta} aria-labelledby="architecture-cta-title">
      <div className={`${styles.shell} ${styles.ctaInner}`}>
        <div><h2 id="architecture-cta-title">See where your business can grow next</h2><p>Get a practical look at your website, response time, follow-up, and local visibility.</p></div>
        <Link className={styles.button} href="/free-growth-audit">Get Your Free Growth Audit</Link>
      </div>
    </section>
  );
}
