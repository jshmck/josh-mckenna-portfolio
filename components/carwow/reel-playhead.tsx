"use client";

import { useCallback, useEffect, useRef, type PointerEvent } from "react";

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
  const thumb = useRef<HTMLSpanElement>(null);
  const place = useCallback((ratio: number) => {
    if (bar.current) bar.current.style.transform = `scaleX(${ratio})`;
    if (thumb.current) thumb.current.style.left = `${ratio * 100}%`;
  }, []);
  const scrubbing = useRef(false);
  const wasPlaying = useRef(false);

  const video = () =>
    track.current?.closest("[data-reel]")?.querySelector("video") ?? null;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const v0 = video();
    const flag = () => {
      if (!track.current) return;
      if (v0?.paused) track.current.dataset.paused = "";
      else delete track.current.dataset.paused;
    };
    v0?.addEventListener("pause", flag);
    v0?.addEventListener("play", flag);
    const tick = () => {
      const v = video();
      if (v && v.duration && !scrubbing.current)
        place(v.currentTime / v.duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      v0?.removeEventListener("pause", flag);
      v0?.removeEventListener("play", flag);
    };
  }, [place]);

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
    place(ratio);
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
          event.currentTarget.dataset.scrubbing = "";
          wasPlaying.current = !!v && !v.paused;
          v?.pause();
          event.currentTarget.setPointerCapture(event.pointerId);
          seek(event);
        }}
        onPointerMove={(event) => scrubbing.current && seek(event)}
        onPointerUp={(event) => {
          scrubbing.current = false;
          delete event.currentTarget.dataset.scrubbing;
          if (wasPlaying.current) void video()?.play();
        }}
        onPointerCancel={(event) => {
          scrubbing.current = false;
          delete event.currentTarget.dataset.scrubbing;
          if (wasPlaying.current) void video()?.play();
        }}
      >
        <span
          ref={thumb}
          className="absolute left-0 top-1/2 h-[2.4cqw] w-[2.4cqw] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-white shadow-[0_0_0_0.3cqw_rgb(0_0_0/0.35)] transition-transform duration-150 group-hover/reel:scale-100 group-data-[paused]:scale-100 group-data-[scrubbing]:scale-[1.6]"
        />
        <span className="block h-[0.45cqw] w-full rounded-full bg-white/30 transition-[height] duration-150 group-hover/reel:h-[0.8cqw]">
          <span
            ref={bar}
            className="block h-full origin-left scale-x-0 rounded-full bg-white"
          />
        </span>
      </span>
    </>
  );
}
