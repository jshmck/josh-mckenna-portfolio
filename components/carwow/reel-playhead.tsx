"use client";

import { useEffect, useRef, type PointerEvent } from "react";

/**
 * The controls for a Reel: a thin progress line you can drag to scrub, and a
 * tap anywhere on the clip to pause or play, like the real thing. The line is
 * written straight to the DOM in a rAF loop (never through state), and the
 * loop is skipped under reduced motion, where the clip doesn't autoplay but
 * can still be started with a tap.
 */
export function ReelPlayhead() {
  const track = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const scrubbing = useRef(false);
  const wasPlaying = useRef(false);

  const video = () =>
    track.current?.closest("[data-reel]")?.querySelector("video") ?? null;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const tick = () => {
      const v = video();
      if (v && bar.current && v.duration && !scrubbing.current) {
        bar.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const seek = (event: PointerEvent) => {
    const v = video();
    const t = track.current;
    if (!v || !t || !v.duration) return;
    const rect = t.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / rect.width),
    );
    v.currentTime = ratio * v.duration;
    if (bar.current) bar.current.style.transform = `scaleX(${ratio})`;
  };

  return (
    <>
      <button
        type="button"
        aria-label="Pause or play the Reel"
        className="absolute inset-0 cursor-pointer"
        onClick={() => {
          const v = video();
          if (!v) return;
          if (v.paused) void v.play();
          else v.pause();
        }}
      />
      {/* Generous hit area around the thin line, for a thumb. */}
      <span
        ref={track}
        aria-hidden="true"
        className="group absolute inset-x-[2.6cqw] bottom-[10.5%] flex h-[6cqw] -translate-y-[2.8cqw] cursor-pointer touch-none items-center"
        onPointerDown={(event) => {
          const v = video();
          scrubbing.current = true;
          wasPlaying.current = !!v && !v.paused;
          v?.pause();
          event.currentTarget.setPointerCapture(event.pointerId);
          seek(event);
        }}
        onPointerMove={(event) => scrubbing.current && seek(event)}
        onPointerUp={() => {
          scrubbing.current = false;
          if (wasPlaying.current) void video()?.play();
        }}
        onPointerCancel={() => {
          scrubbing.current = false;
          if (wasPlaying.current) void video()?.play();
        }}
      >
        <span className="block h-[0.45cqw] w-full rounded-full bg-white/30 transition-[height] duration-150 group-hover:h-[1cqw]">
          <span
            ref={bar}
            className="block h-full origin-left scale-x-0 rounded-full bg-white"
          />
        </span>
      </span>
    </>
  );
}
