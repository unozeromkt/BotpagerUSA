"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { ArrowUpRight, Pause, Play, Sparkles, X } from "lucide-react";
import styles from "./roofing-ghost-guide.module.css";

const moments = {
  hero: { label: "Your always-on teammate", text: "You handle the roof. I’ll handle the next inquiry, 24/7.", link: "See me at work", href: "#roofing-video" },
  services: { label: "A little extra help", text: "I answer homeowners’ questions while your crew is on the job.", link: "Explore your AI agent", href: "/services/ai-agent" },
  booking: { label: "No extra booking fee", text: "I can book visits automatically. It’s included in your BotPager plan.", link: "See how I book visits", href: "#booking-title" },
  answers: { label: "Your knowledge. My replies.", text: "Repairs, materials, service areas… I learn your business to help your customers.", link: "Questions I can answer", href: "#answers-title" },
  faq: { label: "You’re still in control", text: "Need an on-site expert? I collect the details and hand them to your team.", link: "See how it works", href: "#roofing-faq-title" },
  audit: { label: "Let’s put me to work", text: "Let’s find the inquiries you could turn into your next booked job.", link: "Get my free audit", href: "/free-growth-audit" },
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
  const [side, setSide] = useState<"left" | "right">("right");
  const guideRef = useRef<HTMLElement>(null);
  const pendingMoment = useRef<Moment>("hero");
  const content = moments[moment];
  const showThought = tips && moment !== "hero";

  useEffect(() => {
    if (moment === "hero") setSide("right");
    else if (!paused && tips) setSide(moment === "booking" || moment === "faq" ? "left" : "right");
  }, [moment, paused, tips]);

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
      data-paused={paused || !tips || moment === "hero"} data-side={side} data-video-visible={videoVisible} hidden={!ready || isOpen || watching}
      onPointerLeave={releaseMessage}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setMoment(pendingMoment.current); }}
      onKeyDown={(event) => { if (event.key === "Escape" && showThought) { event.stopPropagation(); toggleTips(); } }}>
      {showThought && <div className={styles.thought} id="roofing-guide-thought">
        <div className={styles.thoughtTop}>
          <span><i aria-hidden="true" />BotPager · 24/7</span>
          <div className={styles.controls}>
            <button type="button" onClick={toggleMotion} aria-label={paused ? "Resume guide movement" : "Pause guide movement"}>
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
        {!tips && moment !== "hero" && <button className={styles.restore} type="button" onClick={toggleTips} aria-label="Show guide tips"><Sparkles size={16} aria-hidden="true" /></button>}
        <button ref={launcherRef} type="button" className={styles.ghost} onClick={onOpen}
          aria-label="Chat with BotPager" aria-expanded={isOpen} aria-controls="voxpage-conversation-dialog">
          <Image className={styles.mascot} src="/images/botpager-mascot-transparent.png" width={96} height={96} alt="" />
          <span className={styles.chatLabel}>Let’s chat <span aria-hidden="true">↗</span></span>
        </button>
      </div>
    </aside>
  );
}
