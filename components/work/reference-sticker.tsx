"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type ReferenceStickerProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/** Release speed (px per ms) above which a drag counts as a flick. */
const FLICK_SPEED = 0.55;
/** Or dragged this far (px) from where it was picked up, however slowly. */
const FLICK_DISTANCE = 160;
/** Time constant (ms) of the glide back onto its path after being let go. */
const GLIDE_MS = 700;

/**
 * A reference photo that hovers around the screen on its own slow path,
 * above the page, while the page scrolls underneath. Pick it up and the
 * drift pauses; let go and it glides back onto its path. A quick flick
 * sends it off the screen for good (until the page reloads) — the same
 * gesture as flicking a repost bubble off an Instagram story.
 *
 * The path is two sine waves of different lengths (~38s and ~47s), so it
 * wanders across the lower-right two thirds of the screen without ever
 * repeating an obvious loop, and never reaches the nav.
 *
 * Motion contract: one rAF loop writes the transform straight to the DOM;
 * React state flips once, when the sticker has left. With reduced motion
 * there is no loop at all — it rests in the bottom-right corner, a flick
 * dismisses it on release, and the ✕ button covers keyboard and
 * screen-reader visitors either way.
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
  const s = useRef({
    // Drift clock (ms of drifting done); paused while held.
    clock: 0,
    // Distance (px) the sticker sits away from its path.
    ox: 0,
    oy: 0,
    // Where it was when picked up, and where the pointer started.
    ox0: 0,
    oy0: 0,
    px0: 0,
    py0: 0,
    holding: false,
    flinging: false,
    vx: 0,
    vy: 0,
    pointerId: 0,
    samples: [] as { t: number; x: number; y: number }[],
    last: 0,
    raf: 0,
    reduced: false,
  });

  const orbit = (clock: number) => {
    // Range of the path, in px up and left of the corner rest spot.
    const rx = Math.min(window.innerWidth * 0.6, 900);
    const ry = Math.min(window.innerHeight * 0.55, 480);
    const a = (Math.sin(clock / 6000 + 0.6) + 1) / 2;
    const b = (Math.sin(clock / 7500 + 2.1) + 1) / 2;
    return {
      x: -rx * a,
      y: -ry * b,
      // A slow lean, so it never looks pinned flat.
      rot: -3 + Math.sin(clock / 4200) * 4,
    };
  };

  const apply = () => {
    const el = stickerRef.current;
    if (!el) return;
    const d = s.current;
    const p = d.reduced ? { x: 0, y: 0, rot: -3 } : orbit(d.clock);
    el.style.transform = `translate3d(${p.x + d.ox}px, ${p.y + d.oy}px, 0) rotate(${p.rot + d.ox * 0.02}deg)`;
  };

  useEffect(() => {
    if (!mounted || gone) return;
    const d = s.current;
    d.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    apply();
    if (d.reduced) return;
    d.last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - d.last, 32);
      d.last = now;
      if (d.flinging) {
        d.ox += d.vx * dt;
        d.oy += d.vy * dt;
        apply();
        const r = stickerRef.current?.getBoundingClientRect();
        if (
          r &&
          (r.right < 0 || r.left > window.innerWidth || r.bottom < 0 || r.top > window.innerHeight)
        ) {
          setGone(true);
          return;
        }
      } else if (!d.holding) {
        d.clock += dt;
        // Glide back onto the path after being let go.
        const k = Math.exp(-dt / GLIDE_MS);
        d.ox *= k;
        d.oy *= k;
        apply();
      }
      d.raf = requestAnimationFrame(tick);
    };
    d.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(d.raf);
    // apply/orbit only read refs and window.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, gone]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = s.current;
    if (d.flinging) return;
    d.holding = true;
    d.pointerId = event.pointerId;
    d.px0 = event.clientX;
    d.py0 = event.clientY;
    d.ox0 = d.ox;
    d.oy0 = d.oy;
    d.samples = [{ t: event.timeStamp, x: event.clientX, y: event.clientY }];
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = s.current;
    if (!d.holding || event.pointerId !== d.pointerId) return;
    d.ox = d.ox0 + (event.clientX - d.px0);
    d.oy = d.oy0 + (event.clientY - d.py0);
    d.samples.push({ t: event.timeStamp, x: event.clientX, y: event.clientY });
    // Only the last ~100ms matters for the release speed.
    while (d.samples.length > 2 && event.timeStamp - d.samples[0].t > 100) d.samples.shift();
    apply();
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = s.current;
    if (!d.holding || event.pointerId !== d.pointerId) return;
    d.holding = false;
    const first = d.samples[0];
    const end = d.samples[d.samples.length - 1];
    const span = Math.max(end.t - first.t, 1);
    const vx = (end.x - first.x) / span;
    const vy = (end.y - first.y) / span;
    const speed = Math.hypot(vx, vy);
    const pushX = event.clientX - d.px0;
    const pushY = event.clientY - d.py0;
    const moved = Math.hypot(pushX, pushY);
    if (speed > FLICK_SPEED || moved > FLICK_DISTANCE) {
      if (d.reduced) {
        setGone(true);
        return;
      }
      // A slow far drag has no useful velocity; push it further out instead.
      const norm = Math.max(moved, 1);
      d.vx = speed > FLICK_SPEED ? vx : (pushX / norm) * 0.9;
      d.vy = speed > FLICK_SPEED ? vy : (pushY / norm) * 0.9;
      d.flinging = true;
    } else if (d.reduced) {
      d.ox = 0;
      d.oy = 0;
      apply();
    }
    // Otherwise the loop's glide carries it back onto its path.
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
      className="group fixed bottom-5 right-4 z-30 w-32 cursor-grab touch-none select-none active:cursor-grabbing md:bottom-8 md:right-8 md:w-60"
      style={{ transform: "rotate(-3deg)" }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 768px) 128px, 240px"
        draggable={false}
        className="pointer-events-none h-auto w-full rounded-frame shadow-[0_8px_24px_rgba(0,0,0,0.25)] max-md:rounded-[20px]"
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
