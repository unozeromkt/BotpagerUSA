import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarCheck2,
  Check,
  ChevronDown,
  ClipboardList,
  Clock3,
  House,
  MessageCircleMore,
  MessagesSquare,
  PhoneIncoming,
} from "lucide-react";
import { Header, SiteFooter } from "@/components/landing-page";
import type { ArchitectureItem } from "@/lib/seo/site-architecture";
import styles from "./roofing-landing-page.module.css";

const capabilities = [
  {
    icon: CalendarCheck2,
    label: "A fuller calendar",
    title: "Book inspections and estimate visits",
    text: "Move interested homeowners straight to the next step. BotPager schedules visits using your connected calendar, service area, and availability rules.",
  },
  {
    icon: MessagesSquare,
    label: "Answers that build confidence",
    title: "Help customers get their questions answered",
    text: "Explain your roofing services, materials, coverage area, warranties, and what to expect at an inspection using the information your business provides.",
  },
  {
    icon: PhoneIncoming,
    label: "Support beyond office hours",
    title: "Respond while your crew is on the roof",
    text: "Keep conversations moving through web chat, SMS, and configured phone workflows. Give new leads a useful first response, even after your office closes.",
  },
  {
    icon: ClipboardList,
    label: "Better prepared visits",
    title: "Capture the details before you arrive",
    text: "Collect the customer's contact information, property address, roofing concern, and preferred timing. Your team starts with context instead of a cold callback.",
  },
  {
    icon: BellRing,
    label: "Less back-and-forth",
    title: "Send confirmations and reminders",
    text: "Help homeowners know when to expect you. Connected workflows send appointment details and reminders, with a clear way to request a change.",
  },
  {
    icon: MessageCircleMore,
    label: "Keep opportunities moving",
    title: "Follow up after the estimate",
    text: "Stay in touch with homeowners who are still deciding. Organize conversations, estimate status, and next steps in your CRM so your team knows who needs attention.",
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
                <p className={styles.eyebrow}>Your roofing business. Always responsive.</p>
                <h1 id="roofing-title">You handle the roof.<br /><span>We help book<br className={styles.desktopBreak} /> the next visit.</span></h1>
                <p className={styles.lead}>BotPager answers your customers’ questions, schedules inspections, and follows up on estimates—while your team gets the work done.</p>
                <div className={styles.heroActions}>
                  <AuditLink />
                  <Link className={styles.textLink} href="#roofing-system">See what BotPager can do<ArrowRight size={17} aria-hidden="true" /></Link>
                </div>
                <ul className={styles.heroBenefits}>
                  <li><Check size={16} aria-hidden="true" />24/7 customer response</li>
                  <li><Check size={16} aria-hidden="true" />Your calendar. Your rules.</li>
                </ul>
              </div>
              <figure className={styles.conversation} aria-labelledby="conversation-caption">
                <div className={styles.conversationHeader}>
                  <span className={styles.botIcon}><House size={22} aria-hidden="true" /></span>
                  <div><strong>Your roofing assistant</strong><span>Powered by BotPager</span></div>
                  <span className={styles.online}><span />24/7</span>
                </div>
                <div className={styles.messages}>
                  <div className={styles.customerMessage}><span>Homeowner</span><p>Do you repair roof leaks? I’d like someone to take a look.</p></div>
                  <div className={styles.assistantMessage}><span>BotPager</span><p>Yes, our team handles leak repairs. I can help schedule an inspection. What’s the property address?</p></div>
                  <p className={styles.conversationBridge}>After checking the address and available times</p>
                  <div className={styles.customerMessage}><span>Homeowner</span><p>Thursday at 10 AM works for me.</p></div>
                  <div className={styles.bookingConfirmation}><CalendarCheck2 size={22} aria-hidden="true" /><div><strong>Roof inspection booked</strong><span>Thursday · 10:00 AM</span><p>Confirmation sent. Your team has the details.</p></div></div>
                </div>
                <figcaption id="conversation-caption">Example conversation · tailored to your services and availability</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className={styles.valueStrip} aria-label="Built for roofing inquiries">
          <div className={styles.shell}><p>From the first question to the next visit.</p><ul><li>Roof repairs</li><li>Replacements</li><li>Inspections</li><li>Storm damage inquiries</li></ul></div>
        </section>

        <section className={styles.section} id="roofing-system" aria-labelledby="capabilities-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>More support for your business</p>
              <h2 id="capabilities-title">An extra set of hands.<br /><span>Before your crew ever arrives.</span></h2>
              <p>A homeowner shouldn’t have to wait for you to get off a roof to get an answer. Give every inquiry a clear path to a conversation, an inspection, or an estimate.</p>
            </div>
            <div className={styles.capabilityGrid}>
              {capabilities.map(({ icon: Icon, label, title, text }) => (
                <article className={styles.capability} key={title}>
                  <Icon size={25} aria-hidden="true" />
                  <p className={styles.capabilityLabel}>{label}</p>
                  <h3>{title}</h3><p>{text}</p>
                </article>
              ))}
            </div>
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
