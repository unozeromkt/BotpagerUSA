"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Flag,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Play,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { growthQuestions } from "@/lib/growth-game/config";
import { calculateGrowthResult, getGrowthLevel, getGrowthScore, growthLevels } from "@/lib/growth-game/score";
import type {
  GrowthAnswers,
  GrowthApiResponse,
  GrowthContact,
  GrowthResult,
  GrowthTracking,
} from "@/lib/growth-game/types";

type GameStage = "welcome" | "questions" | "result" | "contact" | "submitting" | "plan";

const emptyContact: GrowthContact = {
  name: "",
  email: "",
  businessName: "",
  phone: "",
  consent: false,
  websiteTrap: "",
};

function Brand() {
  return (
    <Link className="growthBrand" href="/" aria-label="BotPager home">
      <Image src="/images/botpager-isotype.png" width={604} height={603} alt="" aria-hidden="true" priority />
      <span>Bot<span>Pager</span></span>
    </Link>
  );
}

function JourneyMap({ score, started = true, compact = false, bounceKey = 0 }: { score: number; started?: boolean; compact?: boolean; bounceKey?: number }) {
  const reduceMotion = useReducedMotion();
  const activeLevel = getGrowthLevel(score);
  const markerPosition = Math.min(95, Math.max(5, 5 + score * 0.9));
  const progressPosition = started ? markerPosition : 5;

  return (
    <div className={`growthMap ${compact ? "growthMapCompact" : ""}`} aria-label={`Growth journey. Current position: ${started ? activeLevel.name : "starting line"}.`}>
      <div className="growthMapRoad" aria-hidden="true">
        <span style={{ width: `${progressPosition}%` }} />
      </div>
      <div className="growthMapStations">
        {growthLevels.map((level) => {
          const reached = started && level.number <= activeLevel.number;
          const active = started && level.number === activeLevel.number;
          return (
            <div className={`growthStation ${reached ? "growthStationReached" : ""} ${active ? "growthStationActive" : ""}`} key={level.id}>
              <span className="growthStationNode">{reached ? <Check /> : level.number}</span>
              <b>{level.shortName}</b>
              {!compact && <small>Level {level.number}</small>}
            </div>
          );
        })}
      </div>
      <motion.div
        className="growthPlayer"
        initial={false}
        animate={{ left: `${started ? markerPosition : 5}%` }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 105, damping: 18 }}
        aria-hidden="true"
      >
        <motion.span
          key={`growth-player-bounce-${bounceKey}`}
          initial={reduceMotion ? false : { y: 0, rotate: 0 }}
          animate={reduceMotion ? undefined : { y: [0, -11, 0], rotate: [0, -4, 4, 0] }}
          transition={reduceMotion ? { duration: 0 } : { duration: .42, ease: "easeOut" }}
        ><Store /></motion.span>
        {!compact && <small>{started ? "You are here" : "Your business"}</small>}
      </motion.div>
    </div>
  );
}

export function GrowthGameExperience() {
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<GameStage>("welcome");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<GrowthAnswers>>({});
  const [result, setResult] = useState<GrowthResult | null>(null);
  const [contact, setContact] = useState<GrowthContact>(emptyContact);
  const [tracking, setTracking] = useState<GrowthTracking>({});
  const [delivery, setDelivery] = useState<GrowthApiResponse["delivery"]>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [movePulse, setMovePulse] = useState(0);
  const [xpBurst, setXpBurst] = useState<{ id: number; value: number } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTracking({
      source: document.referrer || "direct",
      utmSource: params.get("utm_source") ?? "",
      utmMedium: params.get("utm_medium") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
    });
  }, []);

  useEffect(() => {
    if (stage !== "welcome") window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }, [reduceMotion, stage]);

  const liveScore = useMemo(() => getGrowthScore(answers), [answers]);
  const currentQuestion = growthQuestions[questionIndex];

  function startGame() {
    setStage("questions");
    setError("");
  }

  function selectAnswer(value: string) {
    if (!currentQuestion) return;
    const burstId = Date.now();
    const earnedXp = Math.round(((questionIndex + 1) / growthQuestions.length) * 100)
      - Math.round((questionIndex / growthQuestions.length) * 100);
    const nextAnswers = { ...answers, [currentQuestion.key]: value };
    setAnswers(nextAnswers);
    setMovePulse((current) => current + 1);
    setXpBurst({ id: burstId, value: earnedXp });
    setError("");

    window.setTimeout(() => {
      setXpBurst((current) => current?.id === burstId ? null : current);
    }, reduceMotion ? 250 : 850);

    window.setTimeout(() => {
      if (questionIndex < growthQuestions.length - 1) {
        setQuestionIndex((current) => current + 1);
      } else {
        const finalResult = calculateGrowthResult(nextAnswers as GrowthAnswers);
        setResult(finalResult);
        setStage("result");
      }
    }, reduceMotion ? 0 : 220);
  }

  function goBack() {
    setError("");
    if (stage === "questions") {
      if (questionIndex === 0) setStage("welcome");
      else setQuestionIndex((current) => current - 1);
    } else if (stage === "result") {
      setQuestionIndex(growthQuestions.length - 1);
      setStage("questions");
    } else if (stage === "contact") {
      setStage("result");
    }
  }

  function updateContact(field: keyof GrowthContact, value: string | boolean) {
    setContact((current) => ({ ...current, [field]: value }));
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!contact.name.trim() || !contact.email.trim() || !contact.businessName.trim()) {
      setError("Enter your name, business name and email to unlock your plan.");
      return;
    }
    if (!contact.consent) {
      setError("Please confirm that BotPager can prepare and email your growth plan.");
      return;
    }

    setStage("submitting");
    try {
      const response = await fetch("/api/growth-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, contact, tracking }),
      });
      const payload = (await response.json()) as GrowthApiResponse;
      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.message || "We could not prepare your growth plan.");
      }
      setResult(payload.result);
      setDelivery(payload.delivery);
      setMessage(payload.message ?? "Your growth plan is ready.");
      setStage("plan");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not prepare your growth plan. Please try again.");
      setStage("contact");
    }
  }

  function restartGame() {
    setAnswers({});
    setResult(null);
    setContact(emptyContact);
    setQuestionIndex(0);
    setDelivery(undefined);
    setMessage("");
    setError("");
    setMovePulse(0);
    setXpBurst(null);
    setStage("welcome");
  }

  return (
    <main className="growthGamePage">
      <div className="growthOrb growthOrbOne" aria-hidden="true" />
      <div className="growthOrb growthOrbTwo" aria-hidden="true" />

      <header className="growthTopbar">
        <Brand />
        <div className="growthTopbarCampaign"><span>Campaign</span><b>Master the Growth Game</b></div>
      </header>

      <AnimatePresence mode="wait">
        {stage === "welcome" && (
          <motion.section className="growthWelcome" key="welcome" {...panelMotion(reduceMotion)}>
            <div className="growthWelcomeCopy">
              <p className="growthEyebrow"><Trophy /> Master the Local Business Growth Game</p>
              <h1>Find your level.<br /><span>Make your next move.</span></h1>
              <p className="growthHeroLead">Every strong local business follows the same path: get online, get found, convert attention, then build a growth engine. See where you are — and the clearest way forward.</p>
              <div className="growthHeroActions">
                <button className="growthPrimaryButton" type="button" onClick={startGame}>Find my growth level <ArrowRight /></button>
                <span><Clock3 /> 8 moves · about 2 minutes</span>
              </div>
              <div className="growthHeroProof">
                <span><CheckCircle2 /> Instant Growth Score</span>
                <span><Route /> Clear next level</span>
                <span><CircleDollarSign /> Right-fit starting price</span>
              </div>
            </div>

            <div className="growthWelcomeBoard growthWelcomeGameArt">
              <Image
                className="growthGameArtImage"
                src="/images/growth-game-hero-map-v2.png"
                width={1536}
                height={1024}
                alt="A game map where a local business advances through five growth worlds toward a trophy"
                priority
              />
              <div className="growthGameArtShade" aria-hidden="true" />
              <div className="growthBoardTop growthGameArtTop">
                <span><Sparkles /> Campaign map</span>
                <b><Star /> 5 worlds</b>
              </div>
              <div className="growthGameArtQuest">
                <span className="growthQuestTag"><Flag /> New quest</span>
                <strong>Build your local growth engine</strong>
                <small>Discover your starting world in 8 moves.</small>
              </div>
              <button className="growthPlayButton" type="button" onClick={startGame}>
                <span><Play fill="currentColor" /></span>
                <b>Play now</b>
                <small>Free · 2 min</small>
              </button>
              <div className="growthGameArtXp"><Zap /> <b>+100</b><span>growth XP</span></div>
            </div>
          </motion.section>
        )}

        {stage === "questions" && currentQuestion && (
          <motion.section className="growthGameShell" key={`question-${currentQuestion.key}`} {...panelMotion(reduceMotion)}>
            <div className="growthGameStatus">
              <AnimatePresence>
                {xpBurst && (
                  <motion.span
                    className="growthXpBurst"
                    key={xpBurst.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 7, scale: .82 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -18, scale: 1.08 }}
                    transition={{ duration: reduceMotion ? 0 : .28 }}
                  >
                    <Star fill="currentColor" /> +{xpBurst.value} XP
                  </motion.span>
                )}
              </AnimatePresence>
              <div className="growthStatusCopy">
                <span>Quest {questionIndex + 1} of {growthQuestions.length}</span>
                <b><Star fill="currentColor" /> {Math.round((questionIndex / growthQuestions.length) * 100)} / 100 growth XP</b>
              </div>
              <div className="growthProgress"><span style={{ width: `${((questionIndex + 1) / growthQuestions.length) * 100}%` }} /></div>
              <JourneyMap score={liveScore} compact bounceKey={movePulse} />
            </div>

            <div className="growthQuestionCard">
              <button className="growthBackButton" type="button" onClick={goBack}><ArrowLeft /> Back</button>
              <div className="growthQuestionHeader">
                <span className="growthMoveNumber">QUEST 0{questionIndex + 1}</span>
                <p className="growthEyebrow"><Target /> {currentQuestion.kicker}</p>
                <h1>{currentQuestion.question}</h1>
                <p>{currentQuestion.helper}</p>
              </div>
              <div className="growthAnswers" role="radiogroup" aria-label={currentQuestion.question}>
                {currentQuestion.options.map((option, index) => {
                  const selected = answers[currentQuestion.key] === option.value;
                  return (
                    <button
                      className={`growthAnswer ${selected ? "growthAnswerSelected" : ""}`}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => selectAnswer(option.value)}
                      key={option.value}
                    >
                      <span className="growthAnswerKey">{String.fromCharCode(65 + index)}</span>
                      <span><b>{option.label}</b><small>{option.description}</small></span>
                      <span className="growthAnswerAction">{selected ? <Check /> : <ArrowRight />}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}

        {stage === "result" && result && (
          <motion.section className="growthResultShell" key="result" {...panelMotion(reduceMotion)}>
            <button className="growthBackButton growthResultBack" type="button" onClick={goBack}><ArrowLeft /> Review my last answer</button>
            <GrowthStaircaseResult result={result} />

            <div className="growthInsightGrid">
              <section className="growthInsightPanel growthWinPanel">
                <div className="growthPanelHeading"><span><BadgeCheck /></span><div><small>Your advantages</small><h2>What is already working</h2></div></div>
                <div className="growthInsightList">
                  {result.wins.map((win) => <article key={win.category}><CheckCircle2 /><div><h3>{win.title}</h3><p>{win.description}</p></div></article>)}
                </div>
              </section>
              <section className="growthInsightPanel growthOpportunityPanel">
                <div className="growthPanelHeading"><span><Lightbulb /></span><div><small>Your biggest upside</small><h2>Moves that unlock growth</h2></div></div>
                <div className="growthInsightList">
                  {result.opportunities.map((opportunity, index) => <article key={opportunity.category}><b>0{index + 1}</b><div><h3>{opportunity.title}</h3><p>{opportunity.description}</p></div></article>)}
                </div>
              </section>
            </div>

            <section className="growthUnlockPanel">
              <div className="growthUnlockIcon"><LockKeyhole /></div>
              <div><p className="growthEyebrow"><Sparkles /> Your next-level plan is ready</p><h2>See the package, what is included and your starting price.</h2><p>We matched the next move to your current level — no technical jargon and no guesswork.</p></div>
              <button className="growthPrimaryButton growthLimeButton growthUnlockPulseButton" type="button" onClick={() => setStage("contact")}>Unlock my plan <ArrowRight /></button>
            </section>
          </motion.section>
        )}

        {stage === "contact" && result && (
          <motion.section className="growthContactShell" key="contact" {...panelMotion(reduceMotion)}>
            <button className="growthBackButton" type="button" onClick={goBack}><ArrowLeft /> Back to my score</button>
            <div className="growthContactGrid">
              <div className="growthContactCopy">
                <p className="growthEyebrow"><Zap /> One move left</p>
                <h1>Unlock your route to <span>{result.level.nextLevel}.</span></h1>
                <p>Get the recommended BotPager package, included services and the exact starting price for your level.</p>
                <div className="growthContactScore">
                  <span>{result.score}</span><div><small>Growth Score</small><b>Level {result.level.number} · {result.level.name}</b></div>
                </div>
                <div className="growthContactChecks">
                  <span><CheckCircle2 /> Your clearest next move</span>
                  <span><CheckCircle2 /> A right-fit starting package</span>
                  <span><CheckCircle2 /> No obligation to begin</span>
                </div>
              </div>
              <form className="growthLeadForm" onSubmit={submitLead}>
                <div className="growthFormHeading"><span><Store /></span><div><h2>Where should we send your plan?</h2><p>Your complete result will also appear here.</p></div></div>
                <div className="growthFieldRow">
                  <label><span>Your name</span><input autoComplete="name" value={contact.name} onChange={(event) => updateContact("name", event.target.value)} placeholder="Alex Morgan" required /></label>
                  <label><span>Business name</span><input autoComplete="organization" value={contact.businessName} onChange={(event) => updateContact("businessName", event.target.value)} placeholder="Morgan Home Services" required /></label>
                </div>
                <label><span>Email</span><input type="email" autoComplete="email" value={contact.email} onChange={(event) => updateContact("email", event.target.value)} placeholder="alex@yourbusiness.com" required /></label>
                <label><span>Phone <small>Optional</small></span><input type="tel" autoComplete="tel" value={contact.phone} onChange={(event) => updateContact("phone", event.target.value)} placeholder="(555) 123-4567" /></label>
                <label className="growthHoneypot" aria-hidden="true"><span>Leave this field empty</span><input tabIndex={-1} autoComplete="off" value={contact.websiteTrap} onChange={(event) => updateContact("websiteTrap", event.target.value)} /></label>
                <label className="growthConsent"><input type="checkbox" checked={contact.consent} onChange={(event) => updateContact("consent", event.target.checked)} /><span>I agree that BotPager may use this information to prepare and email my growth plan. I can unsubscribe at any time.</span></label>
                <p className="growthLegal">By continuing, you agree to our <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms &amp; Conditions</Link>.</p>
                {error && <p className="growthError" role="alert">{error}</p>}
                <button className="growthPrimaryButton" type="submit">Show my plan &amp; price <ArrowRight /></button>
                <p className="growthSecure"><ShieldCheck /> Your information is private and never sold.</p>
              </form>
            </div>
          </motion.section>
        )}

        {stage === "submitting" && result && (
          <motion.section className="growthLoadingShell" key="submitting" {...panelMotion(reduceMotion)}>
            <div className="growthLoader"><LoaderCircle /></div>
            <p className="growthEyebrow"><Route /> Mapping your next move</p>
            <h1>Building the shortest route to {result.level.nextLevel}</h1>
            <p>Matching your strongest opportunities with the right BotPager starting package.</p>
            <div className="growthLoadingSteps"><span><Check /> Level confirmed</span><span><Check /> Priorities ranked</span><span className="growthLoadingActive"><LoaderCircle /> Preparing your offer</span></div>
          </motion.section>
        )}

        {stage === "plan" && result && (
          <motion.section className="growthPlanShell" key="plan" {...panelMotion(reduceMotion)}>
            <div className="growthPlanTopline">
              <span className={`growthDelivery ${delivery === "crm_saved" ? "growthDeliverySaved" : ""}`}><CheckCircle2 /><b>{message}</b></span>
              <button type="button" onClick={restartGame}>Play again</button>
            </div>
            <GrowthStaircaseResult result={result} businessName={contact.businessName} />

            <section className="growthOffer">
              <div className="growthOfferCopy">
                <p className="growthEyebrow"><Sparkles /> Recommended for level {result.level.number}</p>
                <h2>{result.level.package.name}</h2>
                <p>{result.level.package.description}</p>
                <div className="growthOfferFeatures">
                  {result.level.package.features.map((feature) => <span key={feature}><Check /> {feature}</span>)}
                </div>
                <div className="growthOfferOutcome"><Target /><div><small>Target outcome</small><b>Advance from {result.level.name} to {result.level.nextLevel}</b></div></div>
              </div>
              <div className="growthPriceCard">
                <span className="growthPriceLabel">Your starting level</span>
                <div className="growthPrice"><sup>$</sup><strong>{result.level.package.price.toLocaleString("en-US")}</strong><span>/ month</span></div>
                <p>Starting price based on your current level. Final scope is confirmed with you before anything begins.</p>
                <a className="growthPrimaryButton growthLimeButton" href={`mailto:info@botpager.com?subject=${encodeURIComponent(`${contact.businessName} — ${result.level.package.name}`)}&body=${encodeURIComponent(`Hi BotPager, I completed the Growth Game with a score of ${result.score}/100. I'd like to discuss starting with the ${result.level.package.name}.`)}`}>Start this level <ArrowRight /></a>
                <Link className="growthOfferLink" href="/services">Explore the complete BotPager system <ChevronRight /></Link>
                <small><ShieldCheck /> Clear scope before you commit</small>
              </div>
            </section>

            <div className="growthPlanFooter"><Brand /><span>Master the Local Business Growth Game</span></div>
          </motion.section>
        )}
      </AnimatePresence>

      {stage !== "plan" && (
        <footer className="growthFooter"><span><ShieldCheck /> Private &amp; secure</span><span><MapPin /> Built for US local service businesses</span></footer>
      )}
    </main>
  );
}

function GrowthStaircaseResult({ result, businessName }: { result: GrowthResult; businessName?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <section className="growthStairResult">
      <div className="growthStairCopy">
        <p className="growthEyebrow"><Trophy /> {businessName ? `${businessName}'s results` : "Your results"}</p>
        <h1>You&apos;re at <span>Level {result.level.number}</span></h1>
        <h2>{result.level.name}</h2>
        <p>{result.level.headline}</p>
        <div className="growthStairScore">
          <div><strong>{result.score}</strong><span>/100</span></div>
          <div><small>Growth Score</small><span className="growthStairScoreTrack"><i style={{ width: `${result.score}%` }} /></span></div>
        </div>
      </div>

      <div className="growthStairVisual">
        <div className="growthStairVisualTop"><span><Flag /> Your climb</span><b>Next: {result.level.nextLevel}</b></div>
        <div className="growthStaircase" aria-label={`You are on level ${result.level.number} of 5: ${result.level.name}.`}>
          {growthLevels.map((level) => {
            const active = level.id === result.level.id;
            const complete = level.number < result.level.number;
            return (
              <div className={`growthStairStepWrap ${active ? "growthStairStepCurrent" : ""} ${complete ? "growthStairStepComplete" : ""}`} key={level.id}>
                {level.number === 5 && <Trophy className="growthStairTrophy" aria-hidden="true" />}
                {active && (
                  <motion.div
                    className="growthStairPlayer"
                    initial={reduceMotion ? false : { y: -4, scale: .9 }}
                    animate={reduceMotion ? undefined : { y: [0, -10, 0], scale: 1 }}
                    transition={{ duration: reduceMotion ? 0 : .55, ease: "easeOut" }}
                    aria-hidden="true"
                  >
                    <Store />
                    <span>You</span>
                  </motion.div>
                )}
                <div className="growthStairStep">
                  <small>{complete ? <Check /> : `Level ${level.number}`}</small>
                  <b>{level.name}</b>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function panelMotion(reduceMotion: boolean | null) {
  return {
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    exit: reduceMotion ? undefined : { opacity: 0, y: -12 },
    transition: { duration: reduceMotion ? 0 : 0.32, ease: "easeOut" as const },
  };
}
