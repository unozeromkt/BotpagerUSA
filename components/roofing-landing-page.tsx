import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BellRing,
  CalendarCheck2,
  Check,
  ChevronDown,
  Globe2,
  LayoutDashboard,
  Link2,
  MapPin,
  Search,
  Clock3,
  MessageCircleMore,
  MessagesSquare,
} from "lucide-react";
import { Header, SiteFooter } from "@/components/landing-page";
import type { ArchitectureItem } from "@/lib/seo/site-architecture";
import styles from "./roofing-landing-page.module.css";

const supportingServices = [
  {
    icon: Globe2,
    step: "03 / Convert",
    title: "Smart Roofing Websites",
    text: "Turn visitors into inquiries with clear service pages, project information, and easy ways to request an inspection.",
    features: ["Repair & replacement service pages", "Connected chat and lead forms"],
    href: "/services/smart-websites",
    link: "Explore Smart Websites",
  },
  {
    icon: LayoutDashboard,
    step: "04 / Follow up",
    title: "CRM & Automated Follow-Up",
    text: "Keep customer details, conversations, and open estimates together, with a clear next step for every opportunity.",
    features: ["Lead and estimate tracking", "Automated messages & reminders"],
    href: "/services/crm-automations",
    link: "Explore CRM & Automations",
  },
  {
    icon: Search,
    step: "05 / Get found",
    title: "Local SEO & Google Ads",
    text: "Reach homeowners searching for roof repairs, replacements, and inspections in the areas you actually serve.",
    features: ["Google Search & Maps visibility", "Search campaigns for roofing leads"],
    href: "/local-seo-ai-search-optimization",
    link: "Explore Local SEO",
  },
];

const bookingSteps = [
  { title: "Understand the request", text: "Ask about the roofing concern, property location, and preferred timing." },
  { title: "Find the right time", text: "Offer available inspection slots based on your calendar and booking rules." },
  { title: "Confirm the visit", text: "Save the appointment and send the homeowner the visit details and reminders." },
  { title: "Prepare your team", text: "Keep the customer details and conversation together for the person making the visit." },
];

const customerQuestions = [
  "Do you repair leaks or only replace roofs?",
  "Do you work in my neighborhood?",
  "What happens during a roof inspection?",
  "Which roofing materials do you offer?",
  "Do you offer financing or warranties?",
  "When can someone come take a look?",
];

const faqs = [
  {
    question: "Can BotPager actually schedule roofing visits?",
    answer: "Yes. With a supported calendar connected and your booking rules configured, BotPager can offer available times and schedule inspections or estimate visits. You define the service area, appointment types, and availability. If a request needs your team's approval, it can collect the details for confirmation instead.",
  },
  {
    question: "What customer questions can the AI answer?",
    answer: "BotPager uses the business information you provide to answer questions about repairs, replacements, roofing materials, service areas, inspection steps, scheduling, and any financing or warranty options you offer. When a question needs an on-site assessment or an answer outside that information, it gathers the context and routes it to your team.",
  },
  {
    question: "Can it respond after hours or when we miss a call?",
    answer: "Yes. The AI can answer inquiries around the clock through your configured channels. Missed-call and follow-up workflows can help reconnect with homeowners while your crew is busy. Your setup determines which calls and messages the AI handles and which are passed to a person.",
  },
  {
    question: "Will it quote a roof replacement without an inspection?",
    answer: "Your business controls what pricing information is shared. BotPager can explain your estimate process and any approved pricing guidance, but it does not invent a final quote or diagnose a roof. Questions that require an inspection or a specialist are sent to your team.",
  },
  {
    question: "Can it remind customers and follow up on open estimates?",
    answer: "Yes. Connected CRM workflows can send visit confirmations, appointment reminders, and follow-up messages for open estimates. Your team sets the timing, messaging, and handoff rules, with messages sent according to the customer's communication preferences and consent.",
  },
  {
    question: "Can BotPager work with our current website and tools?",
    answer: "BotPager can add AI conversations and lead capture to an existing website, with calendar and CRM connections reviewed during setup. Your growth audit helps identify which tools can connect, what needs to be configured, and where a new website or workflow would help.",
  },
];

function AuditLink({ children = "Get My Free Growth Audit" }: { children?: React.ReactNode }) {
  return <Link className={styles.primaryButton} href="/free-growth-audit">{children}<ArrowRight size={18} aria-hidden="true" /></Link>;
}

function RoofingWorkflowPreview() {
  return (
    <figure className={styles.workflowVisual} aria-labelledby="workflow-caption">
      <div className={styles.workflowBadge}><Image src="/images/botpager-isotype.png" width={36} height={36} alt="" /><div><strong>24/7</strong><span>AI response</span></div></div>
      <div className={styles.calendarPreview}>
        <div className={styles.calendarHeading}><span className={styles.calendarIcon}><CalendarCheck2 size={21} aria-hidden="true" /></span><div><strong>Inspection calendar</strong><span>Your availability. Automatically booked.</span></div></div>
        <div className={styles.calendarWeekLabel}><span>Example week</span><span>November</span></div>
        <ul className={styles.calendarDays} aria-label="Example week in November">
          {[["Mon", "16"], ["Tue", "17"], ["Wed", "18"], ["Thu", "19"], ["Fri", "20"]].map(([day, date]) => <li className={day === "Thu" ? styles.bookedDay : undefined} key={day}><span>{day}</span><strong>{date}</strong></li>)}
        </ul>
        <div className={styles.calendarAppointment}><span>10:00<span>AM</span></span><div><strong>Roof inspection</strong><span>Thursday, Nov. 19 · Leak assessment</span></div><Check size={18} aria-label="Booked" /></div>
        <p className={styles.calendarConnection}><Link2 size={14} aria-hidden="true" />Connected to your booking rules</p>
      </div>
      <div className={styles.chatPreview}>
        <div className={styles.chatPreviewHeader}><Image src="/images/botpager-isotype.png" width={34} height={34} alt="" /><div><strong>Your roofing AI agent</strong><span><i aria-hidden="true" />Online · day &amp; night</span></div><MessagesSquare size={20} aria-hidden="true" /></div>
        <div className={styles.chatPreviewMessages}>
          <div className={styles.customerBubble}><span>Homeowner</span><p>Do you repair roof leaks? I need an inspection.</p></div>
          <div className={styles.aiBubble}><span>BotPager AI</span><p>Yes, we do. I have Thursday at 10 AM available. Does that work for you?</p></div>
          <div className={styles.customerBubble}><span>Homeowner</span><p>Thursday at 10 works. Thank you!</p></div>
        </div>
        <p className={styles.chatContext}><Check size={13} aria-hidden="true" />Address &amp; contact details collected</p>
        <div className={styles.bookingNotice}><CalendarCheck2 size={22} aria-hidden="true" /><div><strong>Inspection booked</strong><span>Thursday · 10 AM</span></div><Check size={18} aria-hidden="true" /></div>
      </div>
      <figcaption id="workflow-caption">Illustrative workflow · answers and bookings follow your business rules.</figcaption>
    </figure>
  );
}

export function RoofingLandingPage({ industry }: { industry: ArchitectureItem }) {
  const url = `https://botpager.com${industry.href}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://botpager.com" },
          { "@type": "ListItem", position: 2, name: "Industries", item: "https://botpager.com/industries" },
          { "@type": "ListItem", position: 3, name: industry.name, item: url },
        ],
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: industry.title,
        url,
        description: industry.description,
        serviceType: "AI receptionist, appointment booking, and lead follow-up for roofing companies",
        provider: { "@type": "Organization", "@id": "https://botpager.com/#organization", name: "BotPager", url: "https://botpager.com" },
        areaServed: { "@type": "Country", name: "United States" },
        audience: { "@type": "BusinessAudience", audienceType: "Roofing companies" },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: faqs.map(({ question, answer }) => ({
          "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <a className="skipLink" href="#main-content">Skip to main content</a>
      <Header />
      <main className={styles.page} id="main-content">
        <section className={styles.hero} aria-labelledby="roofing-title">
          <div className={styles.shell}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <Link href="/industries">Industries</Link><span aria-hidden="true">/</span>
              <span aria-current="page">Roofing</span>
            </nav>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <p className={styles.agentEyebrow}><span aria-hidden="true" />Built for roofing companies</p>
                <h1 id="roofing-title">AI that answers customers &amp; <span>books roof inspections.</span></h1>
                <p className={styles.lead}>Your BotPager agent responds <strong>24/7</strong>, answers roofing questions, and schedules visits in your calendar. Every inquiry has a next step—even after hours.</p>
                <ul className={styles.heroOutcomes}>
                  <li><MessagesSquare size={18} aria-hidden="true" /><span>Answer customer questions instantly</span></li>
                  <li><CalendarCheck2 size={18} aria-hidden="true" /><span>Book inspections using your availability</span></li>
                  <li><BellRing size={18} aria-hidden="true" /><span>Automate reminders and estimate follow-up</span></li>
                </ul>
                <div className={styles.heroActions}>
                  <AuditLink />
                  <Link className={styles.textLink} href="#roofing-system">Explore our services<ArrowRight size={17} aria-hidden="true" /></Link>
                </div>
              </div>
              <RoofingWorkflowPreview />
            </div>
          </div>
        </section>

        <section className={styles.valueStrip} aria-label="Built for roofing inquiries">
          <div className={styles.shell}><p>From the first question to the next visit.</p><ul><li>Roof repairs</li><li>Replacements</li><li>Inspections</li><li>Storm damage inquiries</li></ul></div>
        </section>

        <section className={styles.fieldSection} aria-labelledby="field-title">
          <div className={`${styles.shell} ${styles.fieldGrid}`}>
            <div className={styles.fieldCopy}>
              <p className={styles.eyebrow}>Made for life on the job</p>
              <h2 id="field-title">You’re on the roof.<br /><span>Your AI agent is on the job.</span></h2>
              <p>Keep your crew focused on the work. BotPager keeps the conversation going with homeowners who need an answer, an estimate, or a visit.</p>
              <ul><li><Check size={16} aria-hidden="true" />While you’re on-site</li><li><Check size={16} aria-hidden="true" />After office hours</li></ul>
            </div>
            <div className={styles.fieldPhoto}><Image src="/images/roofing-hero-agent.webp" alt="A roofing professional wearing a safety harness works on residential asphalt shingles." fill sizes="(max-width: 760px) 100vw, 500px" /><span>On the job. Off the clock. Still connected.</span></div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.servicesSection}`} id="roofing-system" aria-labelledby="capabilities-title">
          <div className={styles.shell}>
            <div className={styles.servicesHeading}>
              <div><p className={styles.eyebrow}>More support for your business</p><h2 id="capabilities-title">The services behind<br /><span>your next booked job.</span></h2></div>
              <p>Connect the way homeowners find you, get answers, and book a visit. Build the right combination for your roofing business.</p>
            </div>
            <div className={styles.featuredServices}>
              <article className={`${styles.featuredService} ${styles.aiService}`}>
                <div className={styles.serviceTopline}><span>01 / Respond</span><MessagesSquare size={25} aria-hidden="true" /></div>
                <h3>24/7 AI Receptionist</h3>
                <p>Give homeowners helpful answers about your services, materials, service area, and next steps—without waiting for your office to open.</p>
                <div className={styles.aiServiceVisual}><Image src="/images/botpager-isotype.png" width={52} height={52} alt="" /><div><strong>Always ready to respond</strong><span>Web chat · SMS · configured phone workflows</span></div><span className={styles.serviceLiveDot} aria-hidden="true" /></div>
                <ul className={styles.featureList}><li><Check size={16} aria-hidden="true" />Answers based on your business information</li><li><Check size={16} aria-hidden="true" />Lead qualification and human handoff</li></ul>
                <Link className={styles.serviceLink} href="/services/ai-agent">Explore the AI Agent<ArrowRight size={17} aria-hidden="true" /></Link>
              </article>
              <article className={`${styles.featuredService} ${styles.schedulingService}`}>
                <div className={styles.serviceTopline}><span>02 / Schedule</span><CalendarCheck2 size={25} aria-hidden="true" /></div>
                <h3>Appointment Booking</h3>
                <p>Turn a conversation into an inspection or estimate visit, with the right details in your calendar and your team ready for the job.</p>
                <div className={styles.schedulingVisual}><div><span>THU</span><strong>19</strong></div><div><strong>Roof inspection</strong><span>10:00 AM · Appointment confirmed</span></div><Check size={19} aria-hidden="true" /></div>
                <ul className={styles.featureList}><li><Check size={16} aria-hidden="true" />Your availability, service area, and booking rules</li><li><Check size={16} aria-hidden="true" />Visit confirmations and reminders</li></ul>
                <Link className={styles.serviceLink} href="#booking-title">See how booking works<ArrowRight size={17} aria-hidden="true" /></Link>
              </article>
            </div>
            <div className={styles.supportingServices}>
              {supportingServices.map(({ icon: Icon, step, title, text, features, href, link }) => (
                <article className={styles.supportingService} key={title}>
                  <div className={styles.serviceTopline}><span>{step}</span><Icon size={24} aria-hidden="true" /></div>
                  <h3>{title}</h3><p>{text}</p>
                  <ul className={styles.featureList}>{features.map(feature => <li key={feature}><Check size={15} aria-hidden="true" />{feature}</li>)}</ul>
                  <div className={styles.supportingLinks}><Link className={styles.serviceLink} href={href}>{link}<ArrowRight size={16} aria-hidden="true" /></Link>{href === "/local-seo-ai-search-optimization" && <Link className={styles.serviceLink} href="/services/google-ads">Google Ads<ArrowRight size={16} aria-hidden="true" /></Link>}</div>
                </article>
              ))}
            </div>
            <p className={styles.servicesFootnote}><MapPin size={17} aria-hidden="true" />Configured for your roofing services, service area, and sales process.</p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.bookingSection}`} aria-labelledby="booking-title">
          <div className={`${styles.shell} ${styles.bookingGrid}`}>
            <div>
              <p className={styles.eyebrow}>From “Can you come out?” to “See you Thursday.”</p>
              <h2 id="booking-title">Turn a customer’s interest<br />into a scheduled visit.</h2>
              <p className={styles.sectionLead}>Less phone tag for your office. An easier next step for the homeowner.</p>
              <ol className={styles.steps}>
                {bookingSteps.map((step, index) => <li key={step.title}><span className={styles.stepNumber} aria-hidden="true">0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}
              </ol>
            </div>
            <div className={styles.visitCard}>
              <div className={styles.visitCardHeading}><CalendarCheck2 size={28} aria-hidden="true" /><span>Ready for your team</span></div>
              <p className={styles.exampleLabel}>Example appointment summary</p>
              <h3>Roof inspection</h3>
              <p className={styles.visitTime}><Clock3 size={17} aria-hidden="true" />Thursday, 10:00 AM</p>
              <dl>
                <div><dt>Customer &amp; property</dt><dd>Contact details and service address saved</dd></div>
                <div><dt>Reason for the visit</dt><dd>Homeowner reported a roof leak</dd></div>
                <div><dt>Before the visit</dt><dd>Confirmation sent · reminder scheduled</dd></div>
                <div><dt>For your estimator</dt><dd>Conversation and request details in one place</dd></div>
              </dl>
              <p className={styles.bookingNote}>Scheduling follows your connected calendar, service area, and availability. Requests that need approval go to your team.</p>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="answers-title">
          <div className={`${styles.shell} ${styles.answersGrid}`}>
            <div>
              <p className={styles.eyebrow}>Helpful answers, day and night</p>
              <h2 id="answers-title">Their questions.<br />Your expertise.<br /><span>Always available.</span></h2>
              <p className={styles.sectionLead}>Your AI assistant learns the information you share about your business, so homeowners can get answers while they’re ready to act.</p>
              <p className={styles.handoffNote}><MessagesSquare size={23} aria-hidden="true" /><span><strong>Your team stays in control.</strong> If a question needs an inspection, a custom quote, or a specialist, BotPager collects the details and hands it over.</span></p>
            </div>
            <div className={styles.questionPanel}>
              <h3>Questions your customers are already asking</h3>
              <ul>{customerQuestions.map((question) => <li key={question}><MessageCircleMore size={19} aria-hidden="true" /><span>{question}</span></li>)}</ul>
              <p>Answers reflect the services, policies, and options your company actually offers.</p>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.faqSection}`} aria-labelledby="roofing-faq-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}><p className={styles.eyebrow}>A few things you might be wondering</p><h2 id="roofing-faq-title">Built around the way you work.</h2></div>
            <div className={styles.faqList}>
              {faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<ChevronDown size={20} aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}
            </div>
            <nav className={styles.relatedLinks} aria-label="Explore BotPager services">{industry.relatedLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}<ArrowRight size={15} aria-hidden="true" /></Link>)}</nav>
          </div>
        </section>

        <section className={styles.cta} aria-labelledby="roofing-cta-title">
          <div className={styles.shell}>
            <p className={styles.eyebrow}>Put BotPager to work for your roofing business</p>
            <h2 id="roofing-cta-title">More answered questions.<br />More opportunities to book.</h2>
            <p>Find out where customer inquiries get stuck—and how your website, AI assistant, and follow-up can work together to move them forward.</p>
            <AuditLink />
          </div>
        </section>
      </main>
      <SiteFooter variant="conversion" />
    </>
  );
}
