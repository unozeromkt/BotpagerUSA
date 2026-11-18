"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowUpRight, Pause, Play, Sparkles, X } from "lucide-react";
import styles from "./roofing-ghost-guide.module.css";

const moments = {
  hero: { label: "Your always-on teammate", text: "You handle the roof. I’ll handle the next inquiry, 24/7.", link: "See me at work", href: "#roofing-video" },
  services: { label: "A little extra help", text: "I answer homeowners’ questions while your crew is on the job.", link: "Explore your AI agent", href: "/services/ai-agent" },
  booking: { label: "No extra booking fee", text: "I can book visits automatically. It’s included in your BotPager plan.", link: "See how I book visits", href: "#booking-title" },
  answers: { label: "Your knowledge. My replies.", text: "Repairs, materials, service areas… I learn your business to help your customers.", link: "Questions I can answer", href: "#answers-title" },
  faq: { label: "You’re still in control", text: "Need an on-site expert? I collect the details and hand them to your team.", link: "See how it works", href: "#roofing-faq-title" },
  audit: { label: "Let’s put me to work", text: "Let’s find the inquiries you could turn into your next booked job.", link: "Get my free growth audit", href: "/free-growth-audit" },
} as const;
type Moment = keyof typeof moments;

export function RoofingGhostGuide({ launcherRef, isOpen, onOpen }: {
  launcherRef: RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onOpen: () => void;
}) {
  const [moment, setMoment] = useState<Moment>("hero");
  const [tips, setTips] = useState(true);
  const [paused, setPaused] = useState(false);
  const [watching, setWatching] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const guideRef = useRef<HTMLElement>(null);
  const pendingMoment = useRef<Moment>("hero");
  const content = moments[moment];

  useEffect(() => {
    try {
      setTips(sessionStorage.getItem("roofing-guide-tips") !== "hidden");
      setPaused(sessionStorage.getItem("roofing-guide-motion") === "paused");
    } catch { /* The guide also works when browser storage is unavailable. */ }
    setReady(true);

    let settleTimer: ReturnType<typeof setTimeout>;
    // IntersectionObserver changes the message, not the animation's scroll position.
    const observer = new IntersectionObserver((entries) => {
      const entering = entries.find((entry) => entry.isIntersecting);
      const key = entering?.target.getAttribute("data-roofing-guide") as Moment | undefined;
      if (!key || !(key in moments)) return;
      pendingMoment.current = key;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        if (!guideRef.current?.matches(":hover, :has(:focus-visible)")) setMoment(key);
      }, 180);
    }, { rootMargin: "-20% 0px -55% 0px", threshold: 0 });
    document.querySelectorAll("[data-roofing-guide]").forEach((section) => observer.observe(section));

    const video = document.querySelector<HTMLVideoElement>("#roofing-video video");
    const onPlay = () => setWatching(true);
    const onPause = () => setWatching(false);
    video?.addEventListener("play", onPlay);
    video?.addEventListener("pause", onPause);
    video?.addEventListener("ended", onPause);
    // Pause a playing hero when it leaves the screen, including its audio.
    const videoObserver = new IntersectionObserver(([entry]) => {
      setVideoVisible(entry.intersectionRatio >= .35);
      if (!entry.isIntersecting) video?.pause();
    }, { threshold: [0, .35] });
    if (video) videoObserver.observe(video);

    return () => {
      clearTimeout(settleTimer);
      observer.disconnect();
      videoObserver.disconnect();
      video?.removeEventListener("play", onPlay);
      video?.removeEventListener("pause", onPause);
      video?.removeEventListener("ended", onPause);
    };
  }, []);

  const toggleTips = () => {
    if (tips) launcherRef.current?.focus({ preventScroll: true });
    setTips(!tips);
    try { sessionStorage.setItem("roofing-guide-tips", tips ? "hidden" : "shown"); } catch {}
  };
  const toggleMotion = () => {
    setPaused(!paused);
    try { sessionStorage.setItem("roofing-guide-motion", paused ? "playing" : "paused"); } catch {}
  };
  const releaseMessage = () => {
    if (!guideRef.current?.matches(":hover, :has(:focus-visible)")) setMoment(pendingMoment.current);
  };

  return (
    <aside ref={guideRef} className={styles.guide} aria-label="Your BotPager guide"
      data-paused={paused || !tips} data-video-visible={videoVisible} hidden={!ready || isOpen || watching}
      onPointerLeave={releaseMessage}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setMoment(pendingMoment.current); }}
      onKeyDown={(event) => { if (event.key === "Escape" && tips) { event.stopPropagation(); toggleTips(); } }}>
      {tips && <div className={styles.thought} id="roofing-guide-thought">
        <div className={styles.thoughtTop}>
          <span><i aria-hidden="true" />BotPager · 24/7</span>
          <div className={styles.controls}>
            <button type="button" onClick={toggleMotion} aria-label={paused ? "Resume guide movement" : "Pause guide movement"} aria-pressed={paused}>
              {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
            </button>
            <button type="button" onClick={toggleTips} aria-label="Hide guide tips"><X size={15} aria-hidden="true" /></button>
          </div>
        </div>
        <div key={moment} className={styles.message}>
          <span className={styles.label}>{content.label}</span>
          <p>{content.text}</p>
          <a href={content.href}>{content.link}<ArrowUpRight size={15} aria-hidden="true" /></a>
        </div>
      </div>}
      <div className={styles.companion}>
        {!tips && <button className={styles.restore} type="button" onClick={toggleTips} aria-label="Show guide tips"><Sparkles size={16} aria-hidden="true" /></button>}
        <button ref={launcherRef} type="button" className={styles.ghost} onClick={onOpen}
          aria-label="Chat with BotPager" aria-expanded={isOpen} aria-controls="voxpage-conversation-dialog">
          <svg viewBox="0 0 96 100" fill="none" aria-hidden="true">
            <ellipse className={styles.shadow} cx="48" cy="92" rx="25" ry="4" fill="#4926A9" opacity=".15" />
            <g className={styles.body}>
              <path d="M18 55C13 21 28 8 48 8C69 8 81 25 78 53C77 67 84 70 83 78C75 79 71 73 67 74C62 75 62 82 55 81C48 80 48 74 43 75C38 76 36 82 30 80C24 78 25 72 20 73L10 77C11 69 19 65 18 55Z" fill="white" stroke="#C9BDF1" strokeWidth="2" />
              <path d="M29 20C35 15 44 13 51 14" stroke="white" strokeWidth="4" strokeLinecap="round" />
              <rect x="28" y="30" width="40" height="30" rx="15" fill="#152347" />
              <ellipse cx="40" cy="44" rx="4" ry="7" fill="white" />
              <ellipse cx="57" cy="44" rx="4" ry="7" fill="white" />
              <path d="M44 65Q49 69 54 64" stroke="#6741D9" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M76 49Q88 43 87 54Q86 59 79 60" fill="white" stroke="#C9BDF1" strokeWidth="2" strokeLinecap="round" />
              <circle cx="72" cy="21" r="6" fill="#D1FBB9" stroke="white" strokeWidth="2" />
            </g>
          </svg>
          <span className={styles.chatLabel}>Let’s chat <span aria-hidden="true">↗</span></span>
        </button>
      </div>
    </aside>
  );
}
