"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * A handful of small Pride sticker cut-outs drifting around the Press
 * section, echoing the homepage hero's orbit mechanic at icon scale.
 * Purely decorative (`aria-hidden`, `pointer-events-none`) — sits behind
 * the quotes, never blocks them.
 *
 * Deliberately simpler than the hero: no cursor-repel, no hover-tilt, just
 * a slow ambient drift. Same reasons for the same shape as drifting-hero.tsx
 * (see its own doc comment): deterministic seeded positions so there's no
 * hydration mismatch, and a rAF loop that writes transforms straight to the
 * DOM instead of through React state.
 */

const rad = (deg: number) => (deg * Math.PI) / 180;

type Sticker = {
  id: string;
  /** Fraction of container width. */
  width: number;
  angle: number;
  rx: number;
  ry: number;
  spin: number;
};

/** width/height of the cropped source art. */
const ASPECT = 809 / 1045;

const STICKERS: Sticker[] = [
  { id: "s1", width: 0.034, angle: rad(20), rx: 0.46, ry: 0.24, spin: rad(6) },
  { id: "s2", width: 0.029, angle: rad(100), rx: 0.42, ry: 0.22, spin: rad(-5.5) },
  { id: "s3", width: 0.038, angle: rad(160), rx: 0.47, ry: 0.26, spin: rad(5) },
  { id: "s4", width: 0.031, angle: rad(230), rx: 0.44, ry: 0.22, spin: rad(-6) },
  { id: "s5", width: 0.036, angle: rad(290), rx: 0.46, ry: 0.24, spin: rad(4.5) },
  { id: "s6", width: 0.027, angle: rad(340), rx: 0.42, ry: 0.2, spin: rad(-4.8) },
];

const CENTRE_X = 0.5;
/** Still too low at 0.26 in practice -- pulled up further. */
const CENTRE_Y = 0.19;
const STICKER_SIZES = "48px";

function orbitPosition(s: { angle: number; rx: number; ry: number; width: number; height: number }) {
  return {
    x: CENTRE_X + s.rx * Math.cos(s.angle) - s.width / 2,
    y: CENTRE_Y + s.ry * Math.sin(s.angle) - s.height / 2,
  };
}

export function FloatingStickers() {
  const frameRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Reduced motion: hold the static seeded orbit, same as drifting-hero.
      return;
    }

    const state = STICKERS.map((s) => ({
      angle: s.angle,
      rx: s.rx,
      ry: s.ry,
      spin: s.spin,
      width: s.width,
      height: s.width / ASPECT,
    }));

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      for (let i = 0; i < state.length; i += 1) {
        const s = state[i];
        const node = nodeRefs.current[i];
        if (!node) continue;

        s.angle += s.spin * dt;
        const { x, y } = orbitPosition(s);
        node.style.transform = `translate3d(${x * 100}cqw, ${y * 100}cqh, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={frameRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 [container-type:size]"
    >
      {STICKERS.map((s, index) => {
        const height = s.width / ASPECT;
        const seed = orbitPosition({ ...s, height });

        return (
          <div
            key={s.id}
            ref={(node) => {
              nodeRefs.current[index] = node;
            }}
            className="absolute left-0 top-0 will-change-transform"
            style={{
              width: `${s.width * 100}cqw`,
              aspectRatio: String(ASPECT),
              transform: `translate3d(${seed.x * 100}cqw, ${seed.y * 100}cqh, 0)`,
            }}
          >
            <Image
              src="/illustrations/objects/pride-sticker.png"
              alt=""
              fill
              sizes={STICKER_SIZES}
              className="object-contain"
            />
          </div>
        );
      })}
    </div>
  );
}
