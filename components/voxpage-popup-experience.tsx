"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
};

function VoxPageAvatar({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? styles.avatarSmall : styles.avatar} aria-hidden="true">
      <Image
        src="/images/botpager-isotype.png"
        width={604}
        height={603}
        alt=""
        priority
      />
    </span>
  );
}

function InlineWidgetPreview() {
  return (
    <div className={styles.preview} data-testid="inline-widget-preview">
      <div className={styles.previewScroll}>
        <div className={styles.dayMarker}><span>Today</span></div>
        <div className={styles.messageRow}>
          <VoxPageAvatar small />
          <div>
            <p className={styles.agentName}>VoxPage</p>
            <div className={styles.agentMessage}>
              Hi! I’m VoxPage. Tell me what you’d like to improve, and we’ll take it from there.
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

  useEffect(() => {
    if (!hostRef.current) return;

    const script = document.createElement("script");
    script.id = `leadconnector-inline-widget-${widgetId}`;
    script.src = "https://widgets.leadconnectorhq.com/loader.js";
    script.async = true;
    script.dataset.resourcesUrl = "https://widgets.leadconnectorhq.com/chat-widget/loader.js";
    script.dataset.widgetId = widgetId;
    script.dataset.source = "WEB_USER";
    hostRef.current.appendChild(script);

    return () => script.remove();
  }, [widgetId]);

  return (
    <div
      ref={hostRef}
      className={styles.inlineWidget}
      data-testid="leadconnector-inline-widget"
    />
  );
}

export function VoxPagePopupExperience({ inlineWidgetId }: VoxPagePopupExperienceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDialog();
        return;
      }

      // HighLevel renders its controls inside a shadow root. Native tab order must
      // remain untouched there so keyboard users can reach the embedded chat.
      if (inlineWidgetId || event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      launcherRef.current?.focus();
    };
  }, [inlineWidgetId, isOpen]);

  const spring = shouldReduceMotion
    ? { duration: 0.01 }
    : { type: "spring" as const, stiffness: 360, damping: 31, mass: 0.88 };

  return (
    <>
      <div className={`${styles.launcherDock} ${isOpen ? styles.launcherDockOpen : ""}`}>
        <AnimatePresence>
          {showPrompt && !isOpen ? (
            <motion.div
              className={styles.prompt}
              initial={shouldReduceMotion ? false : { opacity: 0, x: 16, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.96 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <VoxPageAvatar small />
              <button
                className={styles.promptMain}
                type="button"
                onClick={openDialog}
                aria-label="Open VoxPage conversation"
              >
                <strong>Hi there! Have a question?</strong>
                <span>Chat with VoxPage here.</span>
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
          aria-label={isOpen ? "Close VoxPage conversation" : "Open VoxPage conversation"}
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
                <Image src="/images/botpager-isotype.png" width={604} height={603} alt="" loading="eager" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {hasOpened ? (
          <motion.div
            className={styles.backdrop}
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
                    <VoxPageAvatar small />
                    <div><strong>VoxPage</strong><span><i /> Online now</span></div>
                  </div>
                  <button ref={closeRef} type="button" aria-label="Close VoxPage conversation" onClick={closeDialog}>
                    <X />
                  </button>
                </div>

                <div className={styles.bannerCopy}>
                  <span className={styles.eyebrow}><Sparkles /> Your AI growth assistant</span>
                  <h2 id="voxpage-dialog-title">Let’s grow your business.</h2>
                  <p>Ask a question, explore your opportunities, or get a personalized recommendation.</p>
                </div>

                <div className={styles.trustPill}>
                  <span><Check /> Available 24/7</span>
                  <span><Check /> Fast, helpful answers</span>
                </div>
              </div>

              <div className={styles.widgetStage}>
                {inlineWidgetId ? (
                  <LeadConnectorInlineWidget widgetId={inlineWidgetId} />
                ) : (
                  <InlineWidgetPreview />
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
    </>
  );
}
