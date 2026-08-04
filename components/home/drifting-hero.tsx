"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * The homepage hero: six objects drifting on independent vectors, bouncing off
 * the frame like a DVD screensaver, leaning away from the cursor.
 *
 * Three of the six are real navigation (Work · About · Shop) and render as
 * links with visible focus and destination labels. The other three are
 * decoration and are hidden from assistive tech entirely.
 *
 * Geometry is ported from Figma node 17:180. Positions and sizes are stored as
 * fractions of the container rather than pixels, so the whole composition
 * scales with the viewport and the physics stays resolution-independent.
 */

type DriftObject = {
  id: string;
  label: string;
  href?: string;
  /** Fraction of container width. */
  width: number;
  /** width / height. */
  aspect: number;
  /** Start position as a fraction of container, top-left origin. */
  x: number;
  y: number;
  /** Drift velocity in fractions-of-container per second. */
  vx: number;
  vy: number;
  rotation: number;
};

const OBJECTS: DriftObject[] = [
  {
    id: "ambient-1",
    label: "illo — ambient",
    width: 0.146,
    aspect: 1.289,
    x: 0.04,
    y: 0.127,
    vx: 0.013,
    vy: 0.009,
    rotation: 8,
  },
  {
    id: "work",
    label: "Work",
    href: "/work",
    width: 0.131,
    aspect: 0.822,
    x: 0.775,
    y: 0.079,
    vx: -0.011,
    vy: 0.014,
    rotation: -6,
  },
  {
    id: "about",
    label: "About",
    href: "/about",
    width: 0.159,
    aspect: 1.321,
    x: 0.094,
    y: 0.622,
    vx: 0.016,
    vy: -0.012,
    rotation: -5,
  },
  {
    id: "shop",
    label: "Shop",
    href: "/shop",
    width: 0.141,
    aspect: 1,
    x: 0.772,
    y: 0.627,
    vx: -0.014,
    vy: -0.01,
    rotation: 7,
  },
  {
    id: "ambient-5",
    label: "sticker",
    width: 0.095,
    aspect: 1,
    x: 0.411,
    y: 0.051,
    vx: 0.009,
    vy: 0.016,
    rotation: -13,
  },
  {
    id: "ambient-6",
    label: "sticker",
    width: 0.118,
    aspect: 1.411,
    x: 0.272,
    y: 0.716,
    vx: -0.017,
    vy: -0.008,
    rotation: 11,
  },
];

/** Collision inset — the dashed "screensaver collision bounds" annotation. */
const BOUNDS_INSET = 0.03;
/** How close the pointer must get before an object leans away. */
const REPEL_RADIUS = 0.26;
/** Maximum lean, as a fraction of container width. */
const REPEL_STRENGTH = 0.05;

export function DriftingHero() {
  const frameRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Reduced motion: settle into the static scattered composition.
      return;
    }

    // Live simulation state, seeded from the Figma layout. Kept outside React
    // so the loop never triggers a re-render.
    const state = OBJECTS.map((object) => ({
      x: object.x,
      y: object.y,
      vx: object.vx,
      vy: object.vy,
      width: object.width,
      height: object.width / object.aspect,
    }));

    // Pointer in container-fraction space. -1 parks it outside the frame so
    // nothing is repelled until the pointer actually arrives.
    const pointer = { x: -1, y: -1, active: false };

    const onPointerMove = (event: PointerEvent) => {
      const rect = frame.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (event.clientY - rect.top) / rect.height;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    frame.addEventListener("pointermove", onPointerMove);
    frame.addEventListener("pointerleave", onPointerLeave);

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      // Clamp dt so a backgrounded tab doesn't teleport everything on return.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // The frame is wider than it is tall, so a shared velocity in fractional
      // space would look faster vertically. Correcting by aspect keeps the
      // apparent speed even in both axes.
      const rect = frame.getBoundingClientRect();
      const aspectCorrection = rect.height > 0 ? rect.width / rect.height : 1;

      for (let i = 0; i < state.length; i += 1) {
        const object = state[i];
        const node = nodeRefs.current[i];
        if (!node) continue;

        object.x += object.vx * dt;
        object.y += object.vy * dt * aspectCorrection;

        // Reverse on contact with the bounds — never stop, never pause.
        const maxX = 1 - BOUNDS_INSET - object.width;
        const maxY = 1 - BOUNDS_INSET - object.height;

        if (object.x <= BOUNDS_INSET) {
          object.x = BOUNDS_INSET;
          object.vx = Math.abs(object.vx);
        } else if (object.x >= maxX) {
          object.x = maxX;
          object.vx = -Math.abs(object.vx);
        }

        if (object.y <= BOUNDS_INSET) {
          object.y = BOUNDS_INSET;
          object.vy = Math.abs(object.vy);
        } else if (object.y >= maxY) {
          object.y = maxY;
          object.vy = -Math.abs(object.vy);
        }

        // Soft repel: falls off linearly to zero at REPEL_RADIUS so objects
        // ease away instead of snapping.
        let pushX = 0;
        let pushY = 0;

        if (pointer.active) {
          const centreX = object.x + object.width / 2;
          const centreY = object.y + object.height / 2;
          const dx = centreX - pointer.x;
          const dy = centreY - pointer.y;
          const distance = Math.hypot(dx, dy);

          if (distance > 0.0001 && distance < REPEL_RADIUS) {
            const falloff = 1 - distance / REPEL_RADIUS;
            const scale = (falloff * REPEL_STRENGTH) / distance;
            pushX = dx * scale;
            pushY = dy * scale;
          }
        }

        node.style.transform = `translate3d(${(object.x + pushX) * 100}cqw, ${
          (object.y + pushY) * 100
        }cqh, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      frame.removeEventListener("pointermove", onPointerMove);
      frame.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <section className="relative border-b border-hairline">
      <div
        ref={frameRef}
        // `container-type: size` gives the objects cqw/cqh units, so their
        // JS-driven transforms are expressed relative to this frame rather
        // than the viewport.
        className="relative mx-auto h-[min(88vh,880px)] max-w-frame [container-type:size]"
      >
        {OBJECTS.map((object, index) => {
          const isNav = Boolean(object.href);

          const plate = (
            <div
              className="transition-transform duration-300 ease-drift group-hover:scale-[1.06] group-focus-visible:scale-[1.06]"
              style={{ transform: `rotate(${object.rotation}deg)` }}
            >
              <div
                className={`w-full rounded-lg ${
                  isNav
                    ? "border-[1.5px] border-accent bg-placeholder-strong"
                    : "bg-placeholder"
                }`}
                style={{ aspectRatio: String(object.aspect) }}
              />
              <span
                className={`type-label mt-2 block text-center transition-opacity duration-300 ${
                  isNav
                    ? "text-accent opacity-70 group-hover:opacity-100 group-focus-visible:opacity-100"
                    : "text-ink-muted opacity-60"
                }`}
              >
                {isNav ? `→ ${object.label}` : object.label}
              </span>
            </div>
          );

          return (
            <div
              key={object.id}
              ref={(node) => {
                nodeRefs.current[index] = node;
              }}
              aria-hidden={isNav ? undefined : "true"}
              className="absolute left-0 top-0 will-change-transform"
              style={{
                width: `${object.width * 100}cqw`,
                transform: `translate3d(${object.x * 100}cqw, ${object.y * 100}cqh, 0)`,
              }}
            >
              {isNav ? (
                <Link
                  href={object.href!}
                  className="group block rounded-lg"
                  aria-label={`${object.label} — view Josh's ${object.label.toLowerCase()}`}
                >
                  {plate}
                </Link>
              ) : (
                <div className="group">{plate}</div>
              )}
            </div>
          );
        })}

        {/* Name lockup sits above the objects and ignores the pointer so it
            never blocks a repel or a link. */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-full -translate-x-1/2 -translate-y-1/2 px-6 text-center">
          <h1 className="type-display text-ink">Josh McKenna</h1>
          <p className="type-label mt-4 text-ink-muted">
            Illustrator · Based in London · Available for commissions
          </p>
          <p className="type-lede mt-4 text-ink-muted">
            Drawings that misbehave.
          </p>
        </div>
      </div>

      <p className="type-label pb-10 text-center text-ink-muted">Keep going ↓</p>
    </section>
  );
}
