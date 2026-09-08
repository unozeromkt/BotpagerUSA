"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft, ArrowRight, BadgeCheck, BarChart3, Bot, BrainCircuit, Check,
  CheckCircle2, CircleAlert, Clock3, Globe2, Lightbulb, LoaderCircle,
  LockKeyhole, Mail, MapPin, Phone, Search, ShieldCheck, Sparkles, Star,
  Target, TrendingUp,
} from "lucide-react";
import type {
  VisibilityAuditInput, VisibilityAuditReport, VisibilityAuditResponse,
  VisibilityCategoryKey, VisibilityLead, VisibilityLeadResponse,
} from "@/lib/visibility-audit/types";
import styles from "./visibility-audit.module.css";

type Stage = "input" | "scanning" | "preview" | "contact" | "report";

const emptyInput: VisibilityAuditInput = { websiteUrl: "", businessType: "", city: "" };
const emptyLead: VisibilityLead = { name: "", email: "", phone: "", businessName: "", consent: false, websiteTrap: "" };
const businessTypes = [
  "Home Services", "Plumbing", "HVAC", "Electrical Services", "Roofing",
  "Cleaning Services", "Lawn Care & Landscaping", "Painting & Remodeling",
  "Pest Control", "Pool Services", "Moving Services", "Auto Services",
  "Pet Services", "Professional Services", "Other Local Service",
];
const scanSteps = [
  { icon: Globe2, label: "Opening your website" },
  { icon: Search, label: "Reviewing search visibility" },
  { icon: MapPin, label: "Checking local signals" },
  { icon: BrainCircuit, label: "Evaluating AI readiness" },
  { icon: TrendingUp, label: "Building your score" },
];
const scoreIcons: Record<VisibilityCategoryKey, typeof Search> = {
  search: Search, local: MapPin, reputation: Star, ai: BrainCircuit, conversion: TrendingUp,
};
const strategyCallUrl = process.env.NEXT_PUBLIC_STRATEGY_CALL_URL || "mailto:info@botpager.com?subject=Book%20a%20Free%20Visibility%20Strategy%20Call";

function Brand() {
  return (
    <Link className={styles.brand} href="/" aria-label="BotPager home">
      <Image src="/images/botpager-isotype.png" width={604} height={603} alt="" aria-hidden="true" priority />
      <span>Bot<span>Pager</span></span>
    </Link>
  );
}

function ScoreRing({ score, label, small = false }: { score: number; label: string; small?: boolean }) {
  return (
    <div className={`${styles.scoreRing} ${small ? styles.scoreRingSmall : ""}`} style={{ "--score": score } as React.CSSProperties} aria-label={`${label}: ${score} out of 100`}>
      <div><b>{score}</b><span>/100</span></div>
    </div>
  );
}

function Topbar({ stage }: { stage: Stage }) {
  return (
    <header className={styles.header}>
      <Brand />
      <div className={styles.topbarMeta}>
        {stage !== "input" && stage !== "scanning" && <span className={styles.reportReady}><CheckCircle2 /> Audit complete</span>}
        <div className={styles.secureLabel}><ShieldCheck /> Free &amp; confidential</div>
      </div>
    </header>
  );
}

function ScoreGrid({ report, compact = false }: { report: VisibilityAuditReport; compact?: boolean }) {
  return (
    <div className={`${styles.scoreGrid} ${compact ? styles.scoreGridCompact : ""}`}>
      {report.scores.map((item) => {
        const Icon = scoreIcons[item.key];
        return (
          <article className={styles.scoreCard} key={item.key}>
            <div className={styles.scoreCardTop}><span><Icon /></span><b>{item.score}</b></div>
            <h3>{item.label}</h3>
            <div className={styles.scoreTrack}><i style={{ width: `${item.score}%` }} /></div>
            {!compact && <p>{item.summary}</p>}
          </article>
        );
      })}
    </div>
  );
}

function AuditEvidence({ report, showUrls = false }: { report: VisibilityAuditReport; showUrls?: boolean }) {
  return (
    <section className={styles.evidenceSection} aria-labelledby={showUrls ? "evidence-title-full" : "evidence-title"}>
      <div className={styles.evidenceHeading}>
        <div><p className={styles.eyebrow}><Globe2 /> What we evaluated</p><h2 id={showUrls ? "evidence-title-full" : "evidence-title"}>A clear look at the signals we found</h2></div>
        <span>{report.scannedPages} public page{report.scannedPages === 1 ? "" : "s"} reviewed</span>
      </div>
      <div className={styles.evidenceGrid}>
        <div className={styles.siteSnapshot}>
          <div className={styles.snapshotImage}>
            {report.sitePreview.imageUrl ? (
              // The image comes from the audited site's public metadata or Google's mobile capture.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={report.sitePreview.imageUrl} alt={`Public preview of ${new URL(report.websiteUrl).hostname}`} referrerPolicy="no-referrer" />
            ) : <span><Globe2 /><small>Preview unavailable</small></span>}
            <b>{report.sitePreview.imageKind}</b>
          </div>
          <div className={styles.snapshotMeta}>
            <small>Homepage detected</small>
            <strong>{report.sitePreview.pageTitle}</strong>
            <p><span>Main message</span>{report.sitePreview.mainHeading}</p>
            <a href={report.websiteUrl} target="_blank" rel="noreferrer">Open audited website <ArrowRight /></a>
          </div>
        </div>
        <div className={styles.checkGrid}>
          {report.checks.map((check) => {
            const positive = check.status === "Found" || check.status === "Allowed";
            const neutral = check.status === "Not measured";
            return (
              <article className={styles.checkCard} key={check.label}>
                <span className={positive ? styles.checkPositive : neutral ? styles.checkNeutral : styles.checkAttention}>
                  {positive ? <Check /> : neutral ? <CircleAlert /> : <CircleAlert />}
                </span>
                <div><h3>{check.label}</h3><b>{check.status}</b><p>{check.detail}</p></div>
              </article>
            );
          })}
        </div>
      </div>
      {showUrls && (
        <details className={styles.scannedUrls}>
          <summary>See the {report.scannedPages} pages included in this audit <ArrowRight /></summary>
          <ol>{report.scannedUrls.map((url) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{new URL(url).pathname || "/"}</a></li>)}</ol>
        </details>
      )}
      <p className={styles.profileClarification}><ShieldCheck /> Google Business Profile status is confirmed only when a direct Google Maps or profile link appears on the reviewed website. “Not found” means it was not linked—not necessarily that no profile exists.</p>
    </section>
  );
}

export function VisibilityAuditExperience() {
  const [stage, setStage] = useState<Stage>("input");
  const [input, setInput] = useState<VisibilityAuditInput>(emptyInput);
  const [lead, setLead] = useState<VisibilityLead>(emptyLead);
  const [report, setReport] = useState<VisibilityAuditReport | null>(null);
  const [scanStep, setScanStep] = useState(0);
  const [error, setError] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");

  useEffect(() => {
    if (stage !== "scanning") return;
    const timer = window.setInterval(() => setScanStep((current) => Math.min(current + 1, scanSteps.length - 1)), 1150);
    return () => window.clearInterval(timer);
  }, [stage]);

  function updateInput(field: keyof VisibilityAuditInput, value: string) {
    setInput((current) => ({ ...current, [field]: value }));
  }

  async function startAudit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setReport(null); setScanStep(0); setStage("scanning");
    try {
      const response = await fetch("/api/visibility-audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const payload = await response.json() as VisibilityAuditResponse;
      if (!response.ok || !payload.ok || !payload.report) throw new Error(payload.message || "We could not finish the audit.");
      setReport(payload.report); setScanStep(scanSteps.length - 1);
      window.setTimeout(() => { setStage("preview"); window.scrollTo({ top: 0, behavior: "smooth" }); }, 350);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not finish the audit. Check the URL and try again.");
      setStage("input");
    }
  }

  async function unlockReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!report) return;
    setError("");
    if (!lead.consent) { setError("Please confirm that we can prepare and email your report."); return; }
    try {
      const reportForDelivery = { ...report, sitePreview: { ...report.sitePreview, imageUrl: "" } };
      const response = await fetch("/api/visibility-audit/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lead, report: reportForDelivery }) });
      const payload = await response.json() as VisibilityLeadResponse;
      if (!response.ok || !payload.ok) throw new Error(payload.message || "We could not save your details.");
      setDeliveryMessage(payload.message ?? "Your full report is ready."); setStage("report"); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "We could not save your details. Please try again."); }
  }

  function restart() {
    setStage("input"); setReport(null); setError(""); setDeliveryMessage(""); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <Topbar stage={stage} />

      {stage === "input" && (
        <section className={styles.hero} aria-labelledby="audit-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><Sparkles /> Free Search + AI Visibility Audit</p>
            <h1 id="audit-title">How visible is your business on <span>Google &amp; AI?</span></h1>
            <p className={styles.lead}>See how easy it is for customers—and AI—to find, understand and trust your business. Get a clear score and practical next steps in about two minutes.</p>
            <div className={styles.benefits}><span><Clock3 /> About 2 minutes</span><span><BadgeCheck /> Five visibility scores</span><span><Search /> Clear priorities</span></div>
            <div className={styles.previewScores} aria-hidden="true">{["Search", "Local", "Reputation", "AI", "Conversion"].map((label, index) => <span key={label}><i style={{ height: `${34 + index * 9}%` }} /><small>{label}</small></span>)}</div>
          </div>
          <form className={styles.auditForm} onSubmit={startAudit}>
            <div className={styles.formHeading}><span><Globe2 /></span><div><small>Step 1 of 2</small><h2>Scan your business website</h2></div></div>
            <label><span>Website URL</span><div className={styles.inputWrap}><Globe2 /><input value={input.websiteUrl} onChange={(event) => updateInput("websiteUrl", event.target.value)} inputMode="url" placeholder="yourbusiness.com" required /></div></label>
            <label><span>Business type</span><select value={input.businessType} onChange={(event) => updateInput("businessType", event.target.value)} required><option value="" disabled>Select your industry</option>{businessTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label><span>City or service area</span><div className={styles.inputWrap}><MapPin /><input value={input.city} onChange={(event) => updateInput("city", event.target.value)} placeholder="Austin, TX" required /></div></label>
            {error && <p className={styles.formError} role="alert"><CircleAlert /> {error}</p>}
            <button className={styles.primaryButton} type="submit">Check my visibility <ArrowRight /></button>
            <p className={styles.microcopy}><ShieldCheck /> No technical knowledge required. No obligation.</p>
          </form>
        </section>
      )}

      {stage === "scanning" && (
        <section className={styles.scanning} aria-live="polite" aria-labelledby="scanning-title">
          <div className={styles.scanVisual}><div className={styles.scanOrbit}><Globe2 /><span /></div><LoaderCircle className={styles.scanLoader} /></div>
          <p className={styles.eyebrow}><Sparkles /> Live website analysis</p><h1 id="scanning-title">Building your visibility score</h1><p>We&apos;re reviewing the public signals customers and AI systems use to understand your business.</p>
          <div className={styles.scanStepList}>{scanSteps.map(({ icon: Icon, label }, index) => <div className={index < scanStep ? styles.scanStepDone : index === scanStep ? styles.scanStepActive : ""} key={label}><span>{index < scanStep ? <Check /> : <Icon />}</span><b>{label}</b><small>{index < scanStep ? "Complete" : index === scanStep ? "In progress" : "Waiting"}</small></div>)}</div>
          <small className={styles.scanNote}><LockKeyhole /> We only review publicly available website information.</small>
        </section>
      )}

      {stage === "preview" && report && (
        <section className={styles.resultsShell} aria-labelledby="preview-title">
          <button className={styles.textButton} type="button" onClick={restart}><ArrowLeft /> Run another audit</button>
          <div className={styles.resultHero}><ScoreRing score={report.overallScore} label="Visibility score" /><div><p className={styles.eyebrow}><CheckCircle2 /> Analysis complete · {report.scannedPages} page{report.scannedPages === 1 ? "" : "s"} reviewed</p><h1 id="preview-title">Your Visibility Score</h1><div className={styles.ratingLine}><b>{report.overallScore} / 100</b><span className={`${styles.ratingBadge} ${styles[`rating${report.rating.replaceAll(" ", "")}`]}`}>{report.rating}</span></div><p>Here is how clearly your business communicates with search engines, local customers and AI-powered discovery.</p></div></div>
          <AuditEvidence report={report} />
          <ScoreGrid report={report} compact />
          <div className={styles.unlockPanel}><div className={styles.unlockCopy}><span><LockKeyhole /></span><div><p className={styles.eyebrow}>Your personalized action plan</p><h2>We found {report.issues.length} visibility opportunities</h2><p>Unlock the full report to see what is working, what is holding the business back and what BotPager would improve first.</p></div></div><div className={styles.lockedPreview} aria-hidden="true"><div><span>High Priority</span><b>Your personalized visibility finding</b><p>Business impact and recommended next step…</p></div><div><span>Medium Priority</span><b>Your personalized visibility finding</b><p>Business impact and recommended next step…</p></div></div><button className={styles.primaryButton} type="button" onClick={() => setStage("contact")}>Unlock my full report <ArrowRight /></button><small>Free report. No sales call required.</small></div>
        </section>
      )}

      {stage === "contact" && report && (
        <section className={styles.contactShell} aria-labelledby="contact-title">
          <button className={styles.textButton} type="button" onClick={() => { setError(""); setStage("preview"); }}><ArrowLeft /> Back to score</button>
          <div className={styles.contactGrid}><div className={styles.contactCopy}><ScoreRing score={report.overallScore} label="Visibility score" small /><p className={styles.eyebrow}><Mail /> Your personalized report</p><h1 id="contact-title">Where should we send your <span>visibility plan?</span></h1><p>Get the complete report on screen, plus a copy saved with your business details for follow-up.</p><div className={styles.contactProof}><span><CheckCircle2 /> Your five category scores</span><span><CheckCircle2 /> Up to five priority issues</span><span><CheckCircle2 /> A clear improvement plan</span></div></div>
            <form className={styles.auditForm} onSubmit={unlockReport}><div className={styles.formHeading}><span><BadgeCheck /></span><div><small>Step 2 of 2</small><h2>Unlock the full report</h2></div></div><div className={styles.fieldRow}><label><span>Your name</span><input autoComplete="name" value={lead.name} onChange={(event) => setLead({ ...lead, name: event.target.value })} placeholder="John Smith" required /></label><label><span>Business name</span><input autoComplete="organization" value={lead.businessName} onChange={(event) => setLead({ ...lead, businessName: event.target.value })} placeholder="Smith Services" required /></label></div><label><span>Email</span><div className={styles.inputWrap}><Mail /><input type="email" autoComplete="email" value={lead.email} onChange={(event) => setLead({ ...lead, email: event.target.value })} placeholder="john@business.com" required /></div></label><label><span>Phone <small>Optional</small></span><div className={styles.inputWrap}><Phone /><input type="tel" autoComplete="tel" value={lead.phone} onChange={(event) => setLead({ ...lead, phone: event.target.value })} placeholder="(555) 555-0123" /></div></label><label className={styles.honeypot} aria-hidden="true">Website confirmation<input tabIndex={-1} autoComplete="off" value={lead.websiteTrap} onChange={(event) => setLead({ ...lead, websiteTrap: event.target.value })} /></label><label className={styles.consent}><input type="checkbox" checked={lead.consent} onChange={(event) => setLead({ ...lead, consent: event.target.checked })} /><span>I agree that BotPager may prepare and email this requested audit. See the <Link href="/privacy" target="_blank">Privacy Policy</Link>.</span></label>{error && <p className={styles.formError} role="alert"><CircleAlert /> {error}</p>}<button className={styles.primaryButton} type="submit">Show my full report <ArrowRight /></button><p className={styles.microcopy}><LockKeyhole /> Your information is protected and never sold.</p></form>
          </div>
        </section>
      )}

      {stage === "report" && report && (
        <section className={styles.fullReport} aria-labelledby="report-title">
          <div className={styles.reportTopline}><button className={styles.textButton} type="button" onClick={restart}><ArrowLeft /> Run another audit</button>{deliveryMessage && <span><CheckCircle2 /> {deliveryMessage}</span>}</div>
          <div className={styles.resultHero}><ScoreRing score={report.overallScore} label="Visibility score" /><div><p className={styles.eyebrow}><BadgeCheck /> BotPager Search + AI Visibility Audit</p><h1 id="report-title">Your Visibility Report</h1><div className={styles.ratingLine}><b>{report.overallScore} / 100</b><span className={`${styles.ratingBadge} ${styles[`rating${report.rating.replaceAll(" ", "")}`]}`}>{report.rating}</span></div><p>Based on {report.scannedPages} public page{report.scannedPages === 1 ? "" : "s"} from <strong>{new URL(report.websiteUrl).hostname}</strong>.</p></div></div>
          <AuditEvidence report={report} showUrls />
          <section className={styles.reportSection} aria-labelledby="scores-title"><div className={styles.reportSectionHead}><span><BarChart3 /></span><div><p className={styles.eyebrow}>Your scores</p><h2 id="scores-title">Five parts of your visibility</h2></div></div><ScoreGrid report={report} /></section>
          <div className={styles.reportColumns}><section className={`${styles.reportSection} ${styles.strengthSection}`} aria-labelledby="strengths-title"><div className={styles.reportSectionHead}><span><BadgeCheck /></span><div><p className={styles.eyebrow}>What you&apos;re doing well</p><h2 id="strengths-title">A solid foundation</h2></div></div><div className={styles.strengthList}>{report.strengths.map((strength) => <div key={strength}><CheckCircle2 /><p>{strength}</p></div>)}</div></section><section className={`${styles.reportSection} ${styles.nextStepSection}`} aria-labelledby="next-step-title"><div className={styles.reportSectionHead}><span><Lightbulb /></span><div><p className={styles.eyebrow}>The opportunity</p><h2 id="next-step-title">Clarity creates growth</h2></div></div><p>Improving the weakest signals makes it easier for customers, search engines and AI systems to understand why your business is relevant.</p></section></div>
          <section className={styles.reportSection} aria-labelledby="issues-title"><div className={styles.reportSectionHead}><span><Target /></span><div><p className={styles.eyebrow}>What&apos;s holding you back</p><h2 id="issues-title">Your priority visibility issues</h2></div></div><div className={styles.issueList}>{report.issues.map((issue, index) => <article className={styles.issueCard} key={issue.id}><span className={styles.issueIndex}>{String(index + 1).padStart(2, "0")}</span><div><span className={`${styles.priority} ${issue.priority === "High Priority" ? styles.priorityHigh : issue.priority === "Medium Priority" ? styles.priorityMedium : styles.priorityOpportunity}`}>{issue.priority}</span><h3>{issue.title}</h3><p>{issue.impact}</p><div className={styles.recommendation}><Lightbulb /><span><small>Recommended next step</small><b>{issue.recommendation}</b></span></div></div></article>)}</div></section>
          <section className={`${styles.reportSection} ${styles.botpagerPlan}`} aria-labelledby="plan-title"><div><p className={styles.eyebrow}><Sparkles /> What BotPager would improve</p><h2 id="plan-title">A clearer path to stronger visibility</h2><p>We connect the website, local presence, business information and conversion tools into one improvement plan.</p></div><div className={styles.planList}>{report.recommendations.map((item) => <span key={item}><Check /> {item}</span>)}</div></section>
          <section className={styles.reportCta} aria-labelledby="cta-title"><div className={styles.reportCtaIcon}><Bot /></div><div><p className={styles.eyebrow}>Turn this score into a plan</p><h2 id="cta-title">Get found on Google. Get discovered by AI.</h2><p>BotPager helps local businesses improve visibility across Search, Maps and AI-powered discovery.</p></div><div className={styles.reportCtaActions}><a className={styles.primaryButton} href="mailto:info@botpager.com?subject=Improve%20My%20Search%20and%20AI%20Visibility">Improve my visibility <ArrowRight /></a><a href={strategyCallUrl} className={styles.secondaryButton}>Book a free strategy call <Phone /></a></div></section>
          <p className={styles.disclaimer}>This report is a directional review of publicly available website signals. Search rankings, AI citations and recommendations cannot be guaranteed.</p>
        </section>
      )}

      <footer className={styles.footer}><Brand /><p>© 2026 BotPager · Search, local and AI visibility for service businesses.</p><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></footer>
    </>
  );
}
