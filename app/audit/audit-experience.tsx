"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  Clock3,
  Globe2,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { auditQuestions } from "@/lib/audit/questions";
import { getPreliminaryOpportunities } from "@/lib/audit/recommendations";
import type {
  AuditAnswers,
  AuditApiResponse,
  AuditReport,
  BusinessContext,
  ContactDetails,
  TrackingContext,
} from "@/lib/audit/types";

type Stage = "context" | "questions" | "preview" | "contact" | "submitting" | "report";

const emptyBusiness: BusinessContext = { industry: "", city: "", state: "", website: "" };
const emptyContact: ContactDetails = {
  firstName: "",
  email: "",
  phone: "",
  businessName: "",
  consent: false,
  websiteTrap: "",
};

const industries = [
  "Home Services",
  "Plumbing",
  "HVAC",
  "Electrical Services",
  "Roofing",
  "Cleaning Services",
  "Lawn Care & Landscaping",
  "Painting & Remodeling",
  "Pest Control",
  "Pool Services",
  "Moving Services",
  "Auto Services",
  "Pet Services",
  "Professional Services",
  "Other Local Service",
];

function Brand() {
  return (
    <Link className="auditBrand" href="/" aria-label="BotPager home">
      <Image src="/images/botpager-isotype.png" width={604} height={603} alt="" aria-hidden="true" />
      <span>Bot<span>Pager</span></span>
    </Link>
  );
}

function Progress({ stage, questionIndex }: { stage: Stage; questionIndex: number }) {
  const completed = stage === "report";
  const current = stage === "context" ? 0 : stage === "questions" ? questionIndex + 1 : 6;
  const percent = completed ? 100 : Math.round((current / 6) * 100);

  return (
    <div className="auditProgress" aria-label={`Audit progress: ${percent}%`}>
      <div className="auditProgressCopy">
        <span>{completed ? "Audit complete" : stage === "context" ? "Business profile" : stage === "questions" ? `Question ${questionIndex + 1} of 5` : "Your opportunities"}</span>
        <b>{percent}%</b>
      </div>
      <div className="auditProgressTrack"><span style={{ width: `${percent}%` }} /></div>
    </div>
  );
}

export function AuditExperience() {
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>("context");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [business, setBusiness] = useState<BusinessContext>(emptyBusiness);
  const [answers, setAnswers] = useState<Partial<AuditAnswers>>({});
  const [contact, setContact] = useState<ContactDetails>(emptyContact);
  const [tracking, setTracking] = useState<TrackingContext>({});
  const [report, setReport] = useState<AuditReport | null>(null);
  const [delivery, setDelivery] = useState<AuditApiResponse["delivery"]>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTracking({
      source: document.referrer || "direct",
      utmSource: params.get("utm_source") ?? "",
      utmMedium: params.get("utm_medium") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
    });
  }, []);

  const completedAnswers = answers as AuditAnswers;
  const previewOpportunities = useMemo(() => {
    if (Object.keys(answers).length !== auditQuestions.length) return [];
    return getPreliminaryOpportunities(completedAnswers);
  }, [answers, completedAnswers]);

  const currentQuestion = auditQuestions[questionIndex];

  function updateBusiness(field: keyof BusinessContext, value: string) {
    setBusiness((current) => ({ ...current, [field]: value }));
  }

  function startQuestions(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!business.industry || !business.city.trim() || !business.state.trim()) {
      setError("Tell us your business type and location to begin.");
      return;
    }
    setStage("questions");
  }

  function selectAnswer(value: string) {
    const nextAnswers = { ...answers, [currentQuestion.key]: value };
    setAnswers(nextAnswers);
    setError("");

    window.setTimeout(() => {
      if (questionIndex < auditQuestions.length - 1) {
        setQuestionIndex((current) => current + 1);
      } else {
        setStage("preview");
      }
    }, reduceMotion ? 0 : 180);
  }

  function goBack() {
    setError("");
    if (stage === "questions") {
      if (questionIndex === 0) setStage("context");
      else setQuestionIndex((current) => current - 1);
    } else if (stage === "preview") {
      setQuestionIndex(auditQuestions.length - 1);
      setStage("questions");
    } else if (stage === "contact") {
      setStage("preview");
    }
  }

  async function submitAudit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!contact.firstName.trim() || !contact.businessName.trim() || !contact.email.trim()) {
      setError("Enter your name, business name and email to receive the report.");
      return;
    }
    if (!contact.consent) {
      setError("Please confirm that we can prepare and email your audit.");
      return;
    }

    setStage("submitting");
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business, answers: completedAnswers, contact, tracking }),
      });
      const payload = (await response.json()) as AuditApiResponse;
      if (!response.ok || !payload.ok || !payload.report) {
        throw new Error(payload.message || "We could not finish your audit.");
      }

      setReport(payload.report);
      setDelivery(payload.delivery);
      setMessage(payload.message ?? "Your personalized audit is ready.");
      setStage("report");
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not finish your audit. Please try again.");
      setStage("contact");
    }
  }

  return (
    <main className="auditPage">
      <header className="auditTopbar">
        <Brand />
        <div className="auditTrust"><ShieldCheck /><span><b>Free & confidential</b><small>No obligation</small></span></div>
      </header>

      <div className="auditAmbient auditAmbientOne" aria-hidden="true" />
      <div className="auditAmbient auditAmbientTwo" aria-hidden="true" />

      <section className={`auditShell ${stage === "report" ? "auditShellReport" : ""}`}>
        {stage !== "report" && <Progress stage={stage} questionIndex={questionIndex} />}

        <AnimatePresence mode="wait">
          {stage === "context" && (
            <motion.div className="auditPanel auditIntroPanel" key="context" {...panelMotion(reduceMotion)}>
              <div className="auditPanelCopy">
                <p className="auditEyebrow"><Sparkles /> Free Local Growth Audit</p>
                <h1>Discover where your business can <span>grow next</span></h1>
                <p className="auditLead">Answer five quick questions and receive three practical opportunities tailored to how your business attracts, responds to and follows up with customers.</p>
                <div className="auditBenefits">
                  <span><Clock3 /> About 2 minutes</span>
                  <span><Target /> 3 focused opportunities</span>
                  <span><BadgeCheck /> Built for local services</span>
                </div>
              </div>

              <form className="auditContextForm" onSubmit={startQuestions}>
                <div className="auditFormHeading">
                  <span><Globe2 /></span>
                  <div><h2>First, tell us about the business</h2><p>No contact information yet.</p></div>
                </div>
                <label>
                  <span>Business type</span>
                  <select value={business.industry} onChange={(event) => updateBusiness("industry", event.target.value)} required>
                    <option value="">Select your industry</option>
                    {industries.map((industry) => <option key={industry}>{industry}</option>)}
                  </select>
                </label>
                <div className="auditFieldRow">
                  <label><span>City</span><input value={business.city} onChange={(event) => updateBusiness("city", event.target.value)} placeholder="Austin" required /></label>
                  <label><span>State</span><input value={business.state} onChange={(event) => updateBusiness("state", event.target.value)} placeholder="TX" required /></label>
                </div>
                <label><span>Website <small>Optional</small></span><input type="text" inputMode="url" value={business.website} onChange={(event) => updateBusiness("website", event.target.value)} placeholder="yourbusiness.com" /></label>
                {error && <p className="auditError" role="alert">{error}</p>}
                <button className="auditPrimaryButton" type="submit">Start my free audit <ArrowRight /></button>
                <p className="auditMicrocopy"><LockKeyhole /> Your answers are used only to prepare this audit.</p>
              </form>
            </motion.div>
          )}

          {stage === "questions" && currentQuestion && (
            <motion.div className="auditPanel auditQuestionPanel" key={currentQuestion.key} {...panelMotion(reduceMotion)}>
              <button className="auditBackButton" type="button" onClick={goBack}><ArrowLeft /> Back</button>
              <div className="auditQuestionHead">
                <p className="auditEyebrow"><MessageCircleMore /> {currentQuestion.eyebrow}</p>
                <h1>{currentQuestion.question}</h1>
                <p>{currentQuestion.helper}</p>
              </div>
              <div className="auditOptions" role="radiogroup" aria-label={currentQuestion.question}>
                {currentQuestion.options.map((option, index) => {
                  const selected = answers[currentQuestion.key] === option.value;
                  return (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={selected ? "auditOption auditOptionSelected" : "auditOption"}
                      key={option.value}
                      onClick={() => selectAnswer(option.value)}
                    >
                      <span className="auditOptionIndex">{String.fromCharCode(65 + index)}</span>
                      <span><b>{option.label}</b><small>{option.description}</small></span>
                      <span className="auditOptionCheck">{selected ? <Check /> : <ArrowRight />}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {stage === "preview" && (
            <motion.div className="auditPanel auditPreviewPanel" key="preview" {...panelMotion(reduceMotion)}>
              <button className="auditBackButton" type="button" onClick={goBack}><ArrowLeft /> Review answers</button>
              <div className="auditPreviewHeading">
                <span className="auditSuccessIcon"><CheckCircle2 /></span>
                <p className="auditEyebrow"><Sparkles /> Initial analysis complete</p>
                <h1>We found <span>3 growth opportunities</span></h1>
                <p>Based on how your business currently attracts and handles new customer inquiries.</p>
              </div>
              <div className="auditPreviewGrid">
                {previewOpportunities.map((opportunity, index) => (
                  <article key={opportunity.id} className="auditPreviewCard">
                    <div><span>0{index + 1}</span><Lightbulb /></div>
                    <h2>{opportunity.title}</h2>
                    <p>{opportunity.whyItMatters}</p>
                    <small><Check /> {opportunity.relatedBotpagerCapability}</small>
                  </article>
                ))}
              </div>
              <div className="auditUnlockBand">
                <div><Mail /><span><b>Get your personalized action plan</b><small>See the complete explanation and receive a copy by email.</small></span></div>
                <button className="auditPrimaryButton" type="button" onClick={() => setStage("contact")}>Show my full report <ArrowRight /></button>
              </div>
            </motion.div>
          )}

          {stage === "contact" && (
            <motion.div className="auditPanel auditContactPanel" key="contact" {...panelMotion(reduceMotion)}>
              <button className="auditBackButton" type="button" onClick={goBack}><ArrowLeft /> Back to opportunities</button>
              <div className="auditContactGrid">
                <div className="auditContactCopy">
                  <p className="auditEyebrow"><Mail /> Your personalized report</p>
                  <h1>Where should we send your <span>action plan?</span></h1>
                  <p>We’ll personalize the recommendations, show the complete report here and email you a copy for later.</p>
                  <div className="auditContactProof">
                    <span><CheckCircle2 /><b>Three focused opportunities</b></span>
                    <span><CheckCircle2 /><b>Recommended next actions</b></span>
                    <span><CheckCircle2 /><b>No sales call required</b></span>
                  </div>
                </div>
                <form className="auditLeadForm" onSubmit={submitAudit}>
                  <div className="auditFieldRow">
                    <label><span>First name</span><input autoComplete="given-name" value={contact.firstName} onChange={(event) => setContact({ ...contact, firstName: event.target.value })} placeholder="John" required /></label>
                    <label><span>Business name</span><input autoComplete="organization" value={contact.businessName} onChange={(event) => setContact({ ...contact, businessName: event.target.value })} placeholder="John's Plumbing" required /></label>
                  </div>
                  <label><span>Email</span><input type="email" autoComplete="email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} placeholder="john@yourbusiness.com" required /></label>
                  <label><span>Phone <small>Optional</small></span><input type="tel" autoComplete="tel" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} placeholder="(555) 123-4567" /></label>
                  <label className="auditHoneypot" aria-hidden="true"><span>Leave this field empty</span><input tabIndex={-1} autoComplete="off" value={contact.websiteTrap} onChange={(event) => setContact({ ...contact, websiteTrap: event.target.value })} /></label>
                  <label className="auditConsent">
                    <input type="checkbox" checked={contact.consent} onChange={(event) => setContact({ ...contact, consent: event.target.checked })} />
                    <span>I agree that BotPager may use this information to prepare and email my audit. I can unsubscribe at any time.</span>
                  </label>
                  {error && <p className="auditError" role="alert">{error}</p>}
                  <button className="auditPrimaryButton" type="submit">Prepare my report <ArrowRight /></button>
                  <p className="auditMicrocopy"><ShieldCheck /> Your information is kept private and never sold.</p>
                </form>
              </div>
            </motion.div>
          )}

          {stage === "submitting" && (
            <motion.div className="auditPanel auditLoadingPanel" key="submitting" {...panelMotion(reduceMotion)}>
              <div className="auditLoader"><LoaderCircle /></div>
              <p className="auditEyebrow"><Bot /> BotPager Growth Advisor</p>
              <h1>Preparing your personalized audit</h1>
              <p>Connecting your answers, prioritizing the strongest opportunities and building your action plan.</p>
              <div className="auditLoadingSteps">
                <span><Check /> Understanding your lead flow</span>
                <span><Check /> Reviewing response and follow-up</span>
                <span className="auditLoadingActive"><LoaderCircle /> Building your recommendations</span>
              </div>
            </motion.div>
          )}

          {stage === "report" && report && (
            <motion.div className="auditReport" key="report" {...panelMotion(reduceMotion)}>
              <div className="auditReportHero">
                <div>
                  <p className="auditEyebrow"><BadgeCheck /> Personalized Local Growth Audit</p>
                  <h1>{contact.businessName}</h1>
                  <p>{report.businessSummary}</p>
                  <div className={`auditDelivery auditDelivery${delivery === "queued" ? "Success" : "Notice"}`}>
                    {delivery === "queued" ? <Mail /> : <ShieldCheck />}
                    <span><b>{message}</b><small>{delivery === "queued" ? `Sent to ${contact.email}` : "Your report is available below."}</small></span>
                  </div>
                </div>
                <div className="auditReportSignal">
                  <Target />
                  <strong>3</strong>
                  <span>priority growth opportunities</span>
                </div>
              </div>

              <section className="auditReportSection">
                <div className="auditReportHeading">
                  <p className="auditEyebrow"><TrendingUp /> Where to focus first</p>
                  <h2>Your top opportunities</h2>
                  <p>Focused on practical improvements BotPager can help you implement.</p>
                </div>
                <div className="auditOpportunityList">
                  {report.opportunities.map((opportunity, index) => (
                    <article className="auditOpportunityCard" key={`${opportunity.id}-${index}`}>
                      <div className="auditOpportunityNumber">0{index + 1}</div>
                      <div className="auditOpportunityBody">
                        <div className="auditOpportunityTitle"><h3>{opportunity.title}</h3><span className={`auditSeverity auditSeverity${opportunity.severity}`}>{opportunity.severity} priority</span></div>
                        <div className="auditOpportunityColumns">
                          <div><small>What we identified</small><p>{opportunity.problem}</p></div>
                          <div><small>Why it matters</small><p>{opportunity.whyItMatters}</p></div>
                        </div>
                        <div className="auditAction"><Lightbulb /><span><small>Recommended action</small><p>{opportunity.recommendedAction}</p></span></div>
                        <p className="auditCapability"><Check /> BotPager capability: <b>{opportunity.relatedBotpagerCapability}</b></p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="auditRecommendation">
                <div className="auditRecommendationIcon"><BarChart3 /></div>
                <div>
                  <p className="auditEyebrow"><Sparkles /> Recommended for your business</p>
                  <h2>{report.recommendedSystem}</h2>
                  <p>{report.recommendationReason}</p>
                  <div className="auditRecommendationFeatures">
                    <span><Check /> Faster lead response</span>
                    <span><Check /> Simple lead management</span>
                    <span><Check /> Automated follow-up</span>
                  </div>
                </div>
                <a className="auditPrimaryButton" href={`mailto:info@botpager.com?subject=${encodeURIComponent(`Questions about ${contact.businessName}'s audit`)}`}>Ask BotPager a question <ArrowRight /></a>
              </section>

              <div className="auditReportFooter"><Brand /><span>Built to help local service businesses grow with confidence.</span></div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {stage !== "report" && (
        <footer className="auditFooter">
          <span><ShieldCheck /> Secure experience</span>
          <span><MapPin /> Built for US local service businesses</span>
        </footer>
      )}
    </main>
  );
}

function panelMotion(reduceMotion: boolean | null) {
  return {
    initial: reduceMotion ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: reduceMotion ? undefined : { opacity: 0, y: -10 },
    transition: { duration: reduceMotion ? 0 : 0.28, ease: "easeOut" as const },
  };
}
