"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type ReferenceStickerProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/** Release speed (px per ms) above which a drag counts as a flick. */
const FLICK_SPEED = 0.55;
/** Or dragged this far (px) from its resting spot, however slowly. */
const FLICK_DISTANCE = 160;

/**
 * A reference photo stuck to the corner of the screen that stays put while
 * the page scrolls. Pick it up and drag it; a quick flick sends it off the
 * screen for good (until the page reloads), a gentle drag lets go and it
 * springs back — the same gesture as flicking a repost bubble off an
 * Instagram story.
 *
 * Motion contract: the transform is written straight to the DOM inside a
 * rAF, never through React state — `gone` flips once, when the sticker has
 * left. With reduced motion there is no fling or spring: a flick dismisses
 * it on release and a short drag snaps back, and the ✕ button dismisses it
 * for keyboard and screen-reader visitors either way.
 */
const subscribeNever = () => () => {};

export function ReferenceSticker({ src, alt, width, height }: ReferenceStickerProps) {
  const [gone, setGone] = useState(false);
  // False on the server and the first client render, true after hydration:
  // the portal target (document.body) only exists in the browser.
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const stickerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({
    active: false,
    pointerId: 0,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    samples: [] as { t: number; x: number; y: number }[],
    raf: 0,
  });

  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const apply = (x: number, y: number) => {
    const el = stickerRef.current;
    if (!el) return;
    // Tilts a little further the harder it's pulled sideways.
    el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${-3 + x * 0.04}deg)`;
  };

  const stopLoop = () => {
    cancelAnimationFrame(drag.current.raf);
    drag.current.raf = 0;
  };

  const springBack = () => {
    stopLoop();
    if (reduceMotion()) {
      drag.current.x = 0;
      drag.current.y = 0;
      apply(0, 0);
      return;
    }
    const step = () => {
      const d = drag.current;
      d.x += (0 - d.x) * 0.18;
      d.y += (0 - d.y) * 0.18;
      if (Math.abs(d.x) < 0.4 && Math.abs(d.y) < 0.4) {
        d.x = 0;
        d.y = 0;
        apply(0, 0);
        d.raf = 0;
        return;
      }
      apply(d.x, d.y);
      d.raf = requestAnimationFrame(step);
    };
    drag.current.raf = requestAnimationFrame(step);
  };

  const fling = (vx: number, vy: number) => {
    stopLoop();
    if (reduceMotion()) {
      setGone(true);
      return;
    }
    const el = stickerRef.current;
    let last = performance.now();
    const step = (now: number) => {
      const d = drag.current;
      const dt = Math.min(now - last, 32);
      last = now;
      d.x += vx * dt;
      d.y += vy * dt;
      apply(d.x, d.y);
      if (el) {
        const r = el.getBoundingClientRect();
        const off =
          r.right < 0 || r.left > window.innerWidth || r.bottom < 0 || r.top > window.innerHeight;
        if (off) {
          d.raf = 0;
          setGone(true);
          return;
        }
      }
      d.raf = requestAnimationFrame(step);
    };
    drag.current.raf = requestAnimationFrame(step);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    stopLoop();
    d.active = true;
    d.pointerId = event.pointerId;
    d.startX = event.clientX - d.x;
    d.startY = event.clientY - d.y;
    d.samples = [{ t: event.timeStamp, x: event.clientX, y: event.clientY }];
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active || event.pointerId !== d.pointerId) return;
    d.x = event.clientX - d.startX;
    d.y = event.clientY - d.startY;
    d.samples.push({ t: event.timeStamp, x: event.clientX, y: event.clientY });
    // Only the last ~100ms matters for the release speed.
    while (d.samples.length > 2 && event.timeStamp - d.samples[0].t > 100) d.samples.shift();
    apply(d.x, d.y);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active || event.pointerId !== d.pointerId) return;
    d.active = false;
    const first = d.samples[0];
    const lastSample = d.samples[d.samples.length - 1];
    const span = Math.max(lastSample.t - first.t, 1);
    const vx = (lastSample.x - first.x) / span;
    const vy = (lastSample.y - first.y) / span;
    const speed = Math.hypot(vx, vy);
    const distance = Math.hypot(d.x, d.y);
    if (speed > FLICK_SPEED || distance > FLICK_DISTANCE) {
      // A slow far drag has no useful velocity; push it outward instead.
      const scale = speed > FLICK_SPEED ? 1 : 0.9 / Math.max(distance, 1);
      fling(speed > FLICK_SPEED ? vx : d.x * scale, speed > FLICK_SPEED ? vy : d.y * scale);
    } else {
      springBack();
    }
  };

  if (gone || !mounted) return null;

  // Portalled to <body>: the project page sits inside a transformed
  // wrapper (the pull-down swipe), and `position: fixed` inside a
  // transformed ancestor is fixed to that ancestor, not the screen.
  return createPortal(
    <div
      ref={stickerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      title="Flick me away"
      // touch-action: none on the sticker alone, so a finger on it drags
      // the sticker instead of scrolling the page; the rest of the page
      // scrolls as normal.
      className="group fixed bottom-5 right-4 z-30 w-24 cursor-grab touch-none select-none active:cursor-grabbing md:bottom-8 md:right-8 md:w-44"
      style={{ transform: "rotate(-3deg)" }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 768px) 96px, 176px"
        draggable={false}
        className="pointer-events-none h-auto w-full rounded-frame shadow-[0_8px_24px_rgba(0,0,0,0.25)] max-md:rounded-[18px]"
      />
      <button
        type="button"
        onClick={() => setGone(true)}
        aria-label="Dismiss the reference photo"
        // Hidden until hovered or focused so the sticker stays a sticker;
        // always one tab-stop away for keyboard visitors.
        className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs leading-none text-canvas opacity-0 transition-opacity duration-200 focus-visible:opacity-100 group-hover:opacity-100"
        onPointerDown={(event) => event.stopPropagation()}
      >
        ✕
      </button>
    </div>,
    document.body,
  );
}
