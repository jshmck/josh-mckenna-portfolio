"use client";

import { useEffect, useRef } from "react";

/**
 * A thin progress line for a Reel, like the one under a real Reel. Written
 * straight to the DOM in a rAF loop (never through state) and skipped under
 * reduced motion, where the clip doesn't autoplay anyway.
 */
export function ReelPlayhead() {
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = bar.current;
    const video = el?.closest("[data-reel]")?.querySelector("video");
    if (!el || !video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const tick = () => {
      if (video.duration && !video.paused) {
        el.style.transform = `scaleX(${video.currentTime / video.duration})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-[2.6cqw] bottom-[10.5%] h-[0.45cqw] rounded-full bg-white/30"
    >
      <span
        ref={bar}
        className="block h-full origin-left scale-x-0 rounded-full bg-white"
      />
    </span>
  );
}
