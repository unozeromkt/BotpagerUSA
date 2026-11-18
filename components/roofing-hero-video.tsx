"use client";

import { getImageProps } from "next/image";
import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./roofing-hero-video.module.css";

const { props: cover } = getImageProps({
  src: "/images/roofing-video-cover.png",
  alt: "",
  width: 1280,
  height: 720,
});

export function RoofingHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => setEnhanced(true), []);

  const play = async () => {
    const video = videoRef.current;
    if (!video) return;
    setError(false);
    setStarted(true);
    video.controls = true;
    try {
      await video.play();
      video.focus({ preventScroll: true });
    } catch {
      setStarted(false);
      setError(true);
    }
  };

  return (
    <div className={styles.player} id="roofing-video">
      <link rel="preload" as="image" href={cover.src} />
      <video ref={videoRef} controls={!enhanced || started} playsInline preload="metadata"
        poster={cover.src} width="1920" height="1080" tabIndex={0}
        aria-label="How BotPager helps roofing businesses"
        onEnded={() => { setStarted(false); videoRef.current?.load(); }}>
        <source src="/videos/roofing-orlando.mp4" type="video/mp4" />
        <track kind="captions" src="/videos/roofing-orlando.en.vtt" srcLang="en" label="English" />
        <a href="/videos/roofing-orlando.mp4">Watch the BotPager roofing video</a>
      </video>
      {enhanced && !started && <button type="button" className={styles.playButton} onClick={play} aria-label="Play BotPager roofing video">
        <Play aria-hidden="true" fill="currentColor" />
      </button>}
      {error && <p className={styles.error} role="status">The video couldn’t start. Press play to try again.</p>}
    </div>
  );
}
