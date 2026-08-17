"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * A handful of small Pride sticker cut-outs drifting around the Press
 * section, echoing the homepage hero's orbit mechanic at icon scale.
 * Purely decorative (`aria-hidden`, `pointer-events-none`) — sits behind
 * the quotes, never blocks them, which is also why proximity below tracks
 * `pointermove` on `window` rather than on this component's own frame: a
 * pointer-events-none element never receives its own pointer events, so
 * listening here would never fire. Distance is computed against the
 * frame's real position regardless of what DOM element the browser thinks
 * the cursor is actually over.
 *
 * Deliberately not a repel like the hero's — that read as too close a copy
 * of the homepage at a smaller scale. Instead each sticker does a quick
 * spin-and-scale "pop" the moment the cursor arrives nearby, then eases
 * back to normal — a one-shot burst, not a continuous push, so it reads as
 * its own gesture. The pop is a CSS transition on scale/rotate (an inner
 * "plate" node, split from the outer position node the same way the hero
 * and TiltIllustration both do it, since scale/rotate/translate are
 * independent properties in Tailwind v4, not bundled into one `transform`)
 * — the orbit position itself is never touched, so the drift keeps going
 * underneath the pop untouched. Same reasons for the same rAF-loop shape
 * as drifting-hero.tsx: deterministic seeded positions so there's no
 * hydration mismatch, and transforms written straight to the DOM instead
 * of through React state.
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

/** How close the pointer must get to trigger a pop. */
const POP_RADIUS = 0.35;
/** Degrees of spin the pop applies, alternating sign per sticker so a
 *  cluster of them doesn't all spin the same way. */
const POP_SPIN = 24;
/** Once popped, ignored until the pointer leaves this radius and comes
 *  back — otherwise it'd retrigger every frame while the cursor lingers. */
const POP_RESET_RADIUS = 0.45;

function orbitPosition(s: { angle: number; rx: number; ry: number; width: number; height: number }) {
  return {
    x: CENTRE_X + s.rx * Math.cos(s.angle) - s.width / 2,
    y: CENTRE_Y + s.ry * Math.sin(s.angle) - s.height / 2,
  };
}

export function FloatingStickers() {
  const frameRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);

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
      armed: true, // ready to pop again once the pointer has left POP_RESET_RADIUS
    }));

    // Pointer in container-fraction space. -1 parks it outside the frame so
    // nothing pops until the pointer actually arrives. Tracked on `window`,
    // not `frame` — see the doc comment above.
    const pointer = { x: -1, y: -1, active: false };

    const onPointerMove = (event: PointerEvent) => {
      const rect = frame.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (event.clientY - rect.top) / rect.height;
      pointer.active = true;
    };

    window.addEventListener("pointermove", onPointerMove);

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      for (let i = 0; i < state.length; i += 1) {
        const s = state[i];
        const node = nodeRefs.current[i];
        const plate = plateRefs.current[i];
        if (!node) continue;

        s.angle += s.spin * dt;
        const { x, y } = orbitPosition(s);
        node.style.transform = `translate3d(${x * 100}cqw, ${y * 100}cqh, 0)`;

        if (!pointer.active || !plate) continue;

        const centreX = x + s.width / 2;
        const centreY = y + s.height / 2;
        const distance = Math.hypot(centreX - pointer.x, centreY - pointer.y);

        if (s.armed && distance < POP_RADIUS) {
          s.armed = false;
          const sign = i % 2 === 0 ? 1 : -1;
          plate.style.scale = "1.35";
          plate.style.rotate = `${sign * POP_SPIN}deg`;
          window.setTimeout(() => {
            if (!plate) return;
            plate.style.scale = "1";
            plate.style.rotate = "0deg";
          }, 200);
        } else if (!s.armed && distance > POP_RESET_RADIUS) {
          s.armed = true;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
    };
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
            <div
              ref={(node) => {
                plateRefs.current[index] = node;
              }}
              className="relative h-full w-full transition-[scale,rotate] duration-200 ease-drift"
            >
              <Image
                src="/illustrations/objects/pride-sticker.png"
                alt=""
                fill
                sizes={STICKER_SIZES}
                className="object-contain"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
