"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { ArrowUpRight, Sparkles, X } from "lucide-react";
import { roofingGuideMoments as moments, type RoofingGuideMoment as Moment } from "@/lib/roofing-guide";
import styles from "./roofing-ghost-guide.module.css";

export function RoofingGhostGuide({ launcherRef, isOpen, onOpen }: {
  launcherRef: RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onOpen: () => void;
}) {
  const [moment, setMoment] = useState<Moment>("hero");
  const [tips, setTips] = useState(true);
  const [watching, setWatching] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [side, setSide] = useState<"left" | "right">("right");
  const [travelling, setTravelling] = useState(false);
  const sideRef = useRef<"left" | "right">("right");
  const travelTimer = useRef<number | undefined>(undefined);
  const guideRef = useRef<HTMLElement>(null);
  const pendingMoment = useRef<Moment>("hero");
  const content = moments[moment];
  const showThought = tips && moment !== "hero";

  useEffect(() => {
    const nextSide = moment === "booking" || moment === "faq" ? "left" : "right";
    if (!tips || sideRef.current === nextSide) return;
    sideRef.current = nextSide;
    window.clearTimeout(travelTimer.current);
    const canTravel = window.matchMedia("(min-width: 105rem) and (min-height: 42rem) and (prefers-reduced-motion: no-preference)").matches;
    setTravelling(canTravel);
    setSide(nextSide);
    // Covers cancelled transitions and a viewport or motion-preference change mid-flight.
    travelTimer.current = window.setTimeout(() => setTravelling(false), canTravel ? 2600 : 0);
  }, [moment, tips]);

  useEffect(() => {
    try {
      setTips(sessionStorage.getItem("roofing-guide-tips") !== "hidden");
    } catch { /* The guide also works when browser storage is unavailable. */ }
    setReady(true);

    let settleTimer: ReturnType<typeof setTimeout>;
    // Wait for a section to settle before changing the message or choosing a side.
    const observer = new IntersectionObserver((entries) => {
      const entering = entries.find((entry) => entry.isIntersecting);
      const key = entering?.target.getAttribute("data-roofing-guide") as Moment | undefined;
      if (!key || !(key in moments)) return;
      pendingMoment.current = key;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        if (!guideRef.current?.matches(":hover, :has(:focus-visible)")) setMoment(key);
      }, 350);
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
      window.clearTimeout(travelTimer.current);
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
  const releaseMessage = () => {
    if (!guideRef.current?.matches(":hover, :has(:focus-visible)")) setMoment(pendingMoment.current);
  };

  return (
    <aside ref={guideRef} className={styles.guide} aria-label="Your BotPager guide"
      data-side={side} data-travelling={travelling} data-video-visible={videoVisible} hidden={!ready || isOpen || watching}
      onTransitionEnd={(event) => { if (event.target === event.currentTarget && event.propertyName === "translate") setTravelling(false); }}
      onPointerLeave={releaseMessage}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setMoment(pendingMoment.current); }}
      onKeyDown={(event) => { if (event.key === "Escape" && showThought) { event.stopPropagation(); toggleTips(); } }}>
      {showThought && <div className={styles.thought} id="roofing-guide-thought" inert={travelling}>
        <button className={styles.closeTip} type="button" onClick={toggleTips} aria-label="Hide guide tips"><X size={15} aria-hidden="true" /></button>
        <div key={moment} className={styles.message}>
          <span className={styles.label}>{content.label}</span>
          <p>{content.text}</p>
          {content.href && <a href={content.href}>{content.link}<ArrowUpRight size={15} aria-hidden="true" /></a>}
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
