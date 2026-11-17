"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { DemoWidgetVariant } from "@/lib/demos";
import {
  ArrowUp,
  CalendarDays,
  Check,
  MessageCircleMore,
  Sparkles,
  X,
} from "lucide-react";
import styles from "./voxpage-popup-experience.module.css";

type VoxPagePopupExperienceProps = {
  inlineWidgetId?: string;
  variant?: DemoWidgetVariant;
};

const experienceContent = {
  botpager: {
    brandName: "VoxPage",
    status: "Online now",
    promptTitle: "Hi there! Have a question?",
    promptText: "Chat with VoxPage here.",
    eyebrow: "Your AI growth assistant",
    title: "Let’s grow your business.",
    description: "Ask a question, explore your opportunities, or get a personalized recommendation.",
    trustItems: ["Available 24/7", "Fast, helpful answers"],
    previewMessage: "Hi! I’m VoxPage. Tell me what you’d like to improve, and we’ll take it from there.",
  },
  exotics: {
    brandName: "Energetic Exotics",
    status: "Concierge online",
    promptTitle: "Planning something exceptional?",
    promptText: "Chat with our private concierge.",
    eyebrow: "Private luxury concierge",
    title: "Your next experience starts here.",
    description: "Tell us what you’re looking for—from exotic cars to yachts, jets, estates, and more.",
    trustItems: ["White-glove guidance", "Fast, personal response"],
    previewMessage: "Welcome to Energetic Exotics. How can our concierge help plan your next experience?",
  },
  drs: {
    brandName: "DRS Roofing",
    status: "AI roofing assistant",
    promptTitle: "How can we help with your roof?",
    promptText: "Chat with the DRS Roofing assistant.",
    eyebrow: "Your AI roofing assistant",
    title: "Let’s talk roofing.",
    description: "Ask about repairs, roof replacement, or inspections. We’ll help you take the next step toward a free estimate.",
    trustItems: ["Serving Central Florida", "Roofing expertise since 1995"],
    previewMessage: "Welcome to DRS Roofing. How can we help with your roofing project today?",
  },
} as const;

const experienceAvatars = {
  botpager: { src: "/images/botpager-isotype.png", width: 604, height: 603 },
  exotics: { src: "/images/energetic-exotics-chat-avatar.png", width: 256, height: 256 },
  drs: { src: "/images/drs-roofing-logo.png", width: 287, height: 167 },
} as const;

function VoxPageAvatar({
  small = false,
  variant = "botpager",
}: {
  small?: boolean;
  variant?: DemoWidgetVariant;
}) {
  return (
    <span
      className={`${small ? styles.avatarSmall : styles.avatar} ${variant === "exotics" ? styles.avatarExotics : variant === "drs" ? styles.avatarDrs : ""}`}
      aria-hidden="true"
    >
      <Image
        {...experienceAvatars[variant]}
        alt=""
        priority
      />
    </span>
  );
}

function InlineWidgetPreview({ variant }: { variant: DemoWidgetVariant }) {
  const content = experienceContent[variant];

  return (
    <div className={styles.preview} data-testid="inline-widget-preview">
      <div className={styles.previewScroll}>
        <div className={styles.dayMarker}><span>Today</span></div>
        <div className={styles.messageRow}>
          <VoxPageAvatar small variant={variant} />
          <div>
            <p className={styles.agentName}>{content.brandName}</p>
            <div className={styles.agentMessage}>
              {content.previewMessage}
            </div>
            <time>Just now</time>
          </div>
        </div>

        <div className={styles.starters} aria-label="Conversation starters">
          <button type="button"><MessageCircleMore /> I want more leads</button>
          <button type="button"><CalendarDays /> I want more bookings</button>
          <button type="button"><Sparkles /> Show me what BotPager can do</button>
        </div>
      </div>

      <div className={styles.composerWrap}>
        <div className={styles.previewLabel}>Inline embed preview</div>
        <div className={styles.composer}>
          <span>Write a message...</span>
          <button type="button" aria-label="Send preview message"><ArrowUp /></button>
        </div>
        <p>Powered by <strong>BotPager</strong></p>
      </div>
    </div>
  );
}

function LeadConnectorInlineWidget({ widgetId }: { widgetId: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // The embed resolves its height inside nested shadow DOM wrappers. Give it
    // the stage's actual pixel height rather than an unresolved percentage.
    const syncHeight = () => {
      host.style.setProperty("--voxpage-inline-height", `${host.clientHeight}px`);
    };
    syncHeight();
    const resizeObserver = new ResizeObserver(syncHeight);
    resizeObserver.observe(host);

    const script = document.createElement("script");
    script.id = `leadconnector-inline-widget-${widgetId}`;
    script.src = "https://widgets.leadconnectorhq.com/loader.js";
    script.async = true;
    script.dataset.resourcesUrl = "https://widgets.leadconnectorhq.com/chat-widget/loader.js";
    script.dataset.widgetId = widgetId;
    script.dataset.source = "WEB_USER";
    script.onerror = () => setLoadFailed(true);
    // Defer the third-party loader until React's Strict Mode replay has ended.
    // Removing an in-flight loader can make GHL attach a second widget to body.
    const loadTimer = window.setTimeout(() => host.appendChild(script), 0);
    const failureTimer = window.setTimeout(() => {
      if (!host.querySelector("chat-widget.hydrated")) setLoadFailed(true);
    }, 20000);

    return () => {
      window.clearTimeout(loadTimer);
      window.clearTimeout(failureTimer);
      script.onerror = null;
      resizeObserver.disconnect();
      // Keep the loader inside its detached host until any in-flight work ends.
      // React removes the whole host on unmount, including its chat instance.
    };
  }, [widgetId]);

  return (
    <div
      ref={hostRef}
      className={styles.inlineWidget}
      data-testid="leadconnector-inline-widget"
    >
      <p className={styles.widgetLoading} role="status">
        {loadFailed
          ? "The assistant couldn’t load. Please refresh the page to try again."
          : "Loading your assistant…"}
      </p>
    </div>
  );
}

export function VoxPagePopupExperience({
  inlineWidgetId,
  variant = "botpager",
}: VoxPagePopupExperienceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const content = experienceContent[variant];
  const isExotics = variant === "exotics";
  const isDrs = variant === "drs";
  const themeClass = isExotics ? styles.themeExotics : isDrs ? styles.themeDrs : "";
  const openLabel = isExotics
    ? "Open Energetic Exotics concierge"
    : isDrs ? "Open DRS Roofing assistant" : "Open VoxPage conversation";
  const closeLabel = isExotics
    ? "Close Energetic Exotics concierge"
    : isDrs ? "Close DRS Roofing assistant" : "Close VoxPage conversation";

  const openDialog = () => {
    setHasOpened(true);
    setShowPrompt(false);
    setIsOpen(true);
  };

  const closeDialog = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 80);

    // Mobile keyboards can shrink the visual viewport without changing dvh.
    const viewport = window.visualViewport;
    const backdrop = dialogRef.current?.parentElement;
    // Keep the embedded client website out of the modal's keyboard order.
    const background = Array.from(backdrop?.parentElement?.children ?? [])
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== backdrop);
    const previousInert = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });
    const syncViewport = () => {
      const height = viewport?.height ?? window.innerHeight;
      backdrop?.style.setProperty("--voxpage-viewport-height", `${height}px`);
      backdrop?.style.setProperty("--voxpage-viewport-top", `${viewport?.offsetTop ?? 0}px`);
      if (backdrop) backdrop.dataset.compactViewport = String(height <= 700);
    };
    syncViewport();
    viewport?.addEventListener("resize", syncViewport);
    viewport?.addEventListener("scroll", syncViewport);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDialog();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      // Include HighLevel's shadow-root controls when wrapping keyboard focus.
      const focusable: HTMLElement[] = [];
      const collectFocusable = (root: HTMLElement | ShadowRoot) => {
        for (const element of root.querySelectorAll<HTMLElement>("*")) {
          if (element.tabIndex >= 0 && !element.matches(":disabled") &&
            !element.closest("[inert]") && element.getClientRects().length > 0 &&
            getComputedStyle(element).visibility !== "hidden") {
            focusable.push(element);
          }
          if (element.shadowRoot) collectFocusable(element.shadowRoot);
        }
      };
      collectFocusable(dialogRef.current);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = event.composedPath()[0];
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      background.forEach((element, index) => { element.inert = previousInert[index]; });
      viewport?.removeEventListener("resize", syncViewport);
      viewport?.removeEventListener("scroll", syncViewport);
      document.removeEventListener("keydown", handleKeyDown);
      launcherRef.current?.focus();
    };
  }, [inlineWidgetId, isOpen]);

  const spring = shouldReduceMotion
    ? { duration: 0.01 }
    : { type: "spring" as const, stiffness: 360, damping: 31, mass: 0.88 };

  return (
    <>
      <div className={`${styles.launcherDock} ${themeClass} ${isOpen ? styles.launcherDockOpen : ""}`}>
        <AnimatePresence>
          {showPrompt && !isOpen ? (
            <motion.div
              className={styles.prompt}
              initial={shouldReduceMotion ? false : { opacity: 0, x: 16, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.96 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <VoxPageAvatar small variant={variant} />
              <button
                className={styles.promptMain}
                type="button"
                onClick={openDialog}
                aria-label={openLabel}
              >
                <strong>{content.promptTitle}</strong>
                <span>{content.promptText}</span>
              </button>
              <button
                className={styles.promptClose}
                type="button"
                aria-label="Dismiss chat prompt"
                onClick={() => setShowPrompt(false)}
              >
                <X />
              </button>
              <i aria-hidden="true" />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          ref={launcherRef}
          className={`${styles.launcher} ${isOpen ? styles.launcherOpen : ""}`}
          type="button"
          aria-label={isOpen ? closeLabel : openLabel}
          aria-expanded={isOpen}
          aria-controls="voxpage-conversation-dialog"
          onClick={() => (isOpen ? closeDialog() : openDialog())}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
        >
          <span className={styles.launcherPulse} aria-hidden="true" />
          <AnimatePresence initial={false} mode="wait">
            {isOpen ? (
              <motion.span key="close" initial={{ opacity: 0, rotate: -30 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }}>
                <X />
              </motion.span>
            ) : (
              <motion.span key="avatar" initial={{ opacity: 0, rotate: 20 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }}>
                <Image
                  {...experienceAvatars[variant]}
                  alt=""
                  loading="eager"
                />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {hasOpened ? (
          <motion.div
            className={`${styles.backdrop} ${themeClass}`}
            initial={{ opacity: 0, visibility: "hidden" }}
            animate={isOpen
              ? { opacity: 1, visibility: "visible" }
              : { opacity: 0, transitionEnd: { visibility: "hidden" } }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.22 }}
            aria-hidden={!isOpen}
            inert={!isOpen}
            style={{ pointerEvents: isOpen ? "auto" : "none" }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeDialog();
            }}
          >
            <motion.div
              ref={dialogRef}
              id="voxpage-conversation-dialog"
              className={styles.dialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="voxpage-dialog-title"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 46, scale: 0.92 }}
              animate={isOpen
                ? { opacity: 1, y: 0, scale: 1 }
                : shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 34, scale: 0.95 }}
              transition={spring}
            >
              <div className={styles.banner}>
                <div className={styles.bannerGlowOne} aria-hidden="true" />
                <div className={styles.bannerGlowTwo} aria-hidden="true" />
                <div className={styles.orbit} aria-hidden="true"><span /><span /><span /></div>

                <div className={styles.bannerTop}>
                  <div className={styles.brand}>
                    <VoxPageAvatar small variant={variant} />
                    <div><strong>{content.brandName}</strong><span><i /> {content.status}</span></div>
                  </div>
                  <button ref={closeRef} type="button" aria-label={closeLabel} onClick={closeDialog}>
                    <X />
                  </button>
                </div>

                <div className={styles.bannerCopy}>
                  <span className={styles.eyebrow}><Sparkles /> {content.eyebrow}</span>
                  <h2 id="voxpage-dialog-title">{content.title}</h2>
                  <p>{content.description}</p>
                </div>

                <div className={styles.trustPill}>
                  {content.trustItems.map((item) => <span key={item}><Check /> {item}</span>)}
                </div>
              </div>

              <div className={styles.widgetStage}>
                {inlineWidgetId ? (
                  <LeadConnectorInlineWidget widgetId={inlineWidgetId} />
                ) : (
                  <InlineWidgetPreview variant={variant} />
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
    </>
  );
}
