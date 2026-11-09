"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
 * A reference photo that hovers in a box under the write-up text, drifting
 * slowly around it — the box scrolls with the page, so you come across the
 * sticker as you read down past the brief. Pick it up and the drift pauses; let go and
 * it glides back onto its path. A quick flick sends it off the screen for
 * good (until the page reloads) — the same gesture as flicking a repost
 * bubble off an Instagram story.
 *
 * Mount it inside a `relative` parent of a fixed size: that box is its
 * whole world. It roams the box edge to edge and never leaves it (until
 * flicked), so the box decides where on the page it's met.
 *
 * Motion contract: one rAF loop writes the transform straight to the DOM,
 * and only while the sticker is on screen; React state flips once, when it
 * has left. With reduced motion there is no loop at all — it rests in the
 * middle of its box, a flick dismisses it on release, and the ✕ button covers keyboard
 * and screen-reader visitors either way.
 */
export function ReferenceSticker({ src, alt, width, height }: ReferenceStickerProps) {
  const [gone, setGone] = useState(false);
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
    inView: false,
    vx: 0,
    vy: 0,
    pointerId: 0,
    samples: [] as { t: number; x: number; y: number }[],
    last: 0,
    raf: 0,
    reduced: false,
  });

  const orbit = (clock: number, still = false) => {
    // The sticker roams the whole of its parent box and never leaves it:
    // each axis swings between the box edge and the opposite edge, on two
    // waves of different lengths so the path never visibly repeats.
    const el = stickerRef.current;
    const box = el?.parentElement;
    const ax = el && box ? Math.max(0, box.clientWidth - el.offsetWidth) / 2 : 0;
    const ay = el && box ? Math.max(0, box.clientHeight - el.offsetHeight) / 2 : 0;
    return {
      x: ax + (still ? 0 : Math.sin(clock / 5200 + 0.6) * ax),
      y: ay + (still ? 0 : Math.sin(clock / 6700 + 2.1) * ay),
      // A slow lean, so it never looks pinned flat.
      rot: -3 + (still ? 0 : Math.sin(clock / 4200) * 4),
    };
  };

  const apply = () => {
    const el = stickerRef.current;
    if (!el) return;
    const d = s.current;
    // Reduced motion rests it in the middle of its box.
    const p = orbit(d.clock, d.reduced);
    el.style.transform = `translate3d(${p.x + d.ox}px, ${p.y + d.oy}px, 0) rotate(${p.rot + d.ox * 0.02}deg)`;
  };

  useEffect(() => {
    if (gone) return;
    const el = stickerRef.current;
    const d = s.current;
    if (!el) return;
    d.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    apply();
    if (d.reduced) return;
    // Only drift while it's actually on screen.
    const observer = new IntersectionObserver(([entry]) => {
      d.inView = entry.isIntersecting;
    });
    observer.observe(el);
    d.last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - d.last, 32);
      d.last = now;
      if (d.flinging) {
        d.ox += d.vx * dt;
        d.oy += d.vy * dt;
        apply();
        const r = el.getBoundingClientRect();
        if (r.right < 0 || r.left > window.innerWidth || r.bottom < 0 || r.top > window.innerHeight) {
          setGone(true);
          return;
        }
      } else if (!d.holding && d.inView) {
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
    return () => {
      cancelAnimationFrame(d.raf);
      observer.disconnect();
    };
    // apply/orbit only read refs and window.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gone]);

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

  if (gone) return null;

  return (
    <div
      ref={stickerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      title="Flick me away"
      // Sits at its box's top-left; the loop's inline transform carries
      // it everywhere else.
      // touch-action: none on the sticker alone, so a finger on it drags
      // the sticker instead of scrolling the page; the rest of the page
      // scrolls as normal.
      className="group absolute left-0 top-0 z-10 w-28 cursor-grab touch-none select-none active:cursor-grabbing md:w-60"
      style={{ transform: "rotate(-3deg)" }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 768px) 112px, 240px"
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
    </div>
  );
}
