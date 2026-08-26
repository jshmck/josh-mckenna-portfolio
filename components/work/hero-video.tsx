"use client";

import { useEffect, useRef } from "react";

type HeroVideoProps = {
  video: { src: string; alt: string };
};

/**
 * A silent turnaround/replay clip standing in for the usual image hero —
 * Jimny only for now. Autoplay is a real motion concern the sitewide
 * prefers-reduced-motion CSS rule can't touch (it neutralises `animation`
 * and `transition`, not native video playback), so this checks the media
 * query itself and leaves the video paused on its first frame instead of
 * autoplaying when the visitor has asked for reduced motion.
 */
export function HeroVideo({ video }: HeroVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!reduceMotion) {
      node.play().catch(() => {});
    }
  }, []);

  return (
    <video
      ref={ref}
      src={video.src}
      aria-label={video.alt}
      className="aspect-video w-full rounded-3xl object-cover"
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}
