"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * The homepage hero: six illustration cut-outs drifting on independent vectors,
 * bouncing off the frame like a DVD screensaver, leaning away from the cursor.
 *
 * Three of the six are real navigation (Work · About · Shop) and render as
 * links with visible focus and a destination label. The other three are
 * decoration and are hidden from assistive tech entirely.
 *
 * Geometry is ported from Josh's v2 frame (Figma node 85:429). Positions and
 * sizes are stored as fractions of the container rather than pixels, so the
 * whole composition scales with the viewport and the physics stays
 * resolution-independent. The nav objects' blue card + border is part of the
 * exported artwork, so every object renders the same way — a transparent PNG.
 */

type DriftObject = {
  id: string;
  kind: "nav" | "ambient";
  /** Nav only — the destination label and route. */
  label?: string;
  href?: string;
  src: string;
  /** Empty for decoration (aria-hidden) and nav (the link is labelled). */
  alt: string;
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
};

// Sources are tightly-cropped transparent cut-outs under /illustrations/objects
// (the fresh path also sidesteps a stale next/image optimizer cache). Aspects
// are measured from each cut-out's visible bounds so the hover card hugs it.
const OBJECTS: DriftObject[] = [
  {
    id: "ambient-1",
    kind: "ambient",
    src: "/illustrations/objects/face.png",
    alt: "",
    width: 0.185,
    aspect: 0.795,
    x: 0.14,
    y: 0.06,
    vx: 0.013,
    vy: 0.009,
  },
  {
    id: "work",
    kind: "nav",
    label: "Work",
    href: "/work",
    src: "/illustrations/objects/car.png",
    alt: "",
    width: 0.3,
    aspect: 1.991,
    x: 0.58,
    y: 0.12,
    vx: -0.011,
    vy: 0.014,
  },
  {
    id: "about",
    kind: "nav",
    label: "About",
    href: "/about",
    src: "/illustrations/objects/bearded.png",
    alt: "",
    width: 0.19,
    aspect: 1.052,
    x: 0.07,
    y: 0.56,
    vx: 0.016,
    vy: -0.012,
  },
  {
    id: "shop",
    kind: "nav",
    label: "Shop",
    href: "/shop",
    src: "/illustrations/objects/hand.png",
    alt: "",
    width: 0.145,
    aspect: 0.734,
    x: 0.74,
    y: 0.52,
    vx: -0.014,
    vy: -0.01,
  },
  {
    id: "ambient-5",
    kind: "ambient",
    src: "/illustrations/objects/flowers.png",
    alt: "",
    width: 0.175,
    aspect: 1.112,
    x: 0.37,
    y: 0.1,
    vx: 0.009,
    vy: 0.016,
  },
  {
    id: "ambient-6",
    kind: "ambient",
    src: "/illustrations/objects/bmw.png",
    alt: "",
    width: 0.235,
    aspect: 1.553,
    x: 0.38,
    y: 0.58,
    vx: -0.017,
    vy: -0.008,
  },
];

/** Collision inset — objects reverse this far from each edge. */
const BOUNDS_INSET = 0.03;
/** How close the pointer must get before an object leans away. */
const REPEL_RADIUS = 0.26;
/** Maximum lean, as a fraction of container width. */
const REPEL_STRENGTH = 0.05;

/** Responsive candidate widths — objects span ~18–32% of the frame. */
const OBJECT_SIZES = "(max-width: 768px) 48vw, 30vw";

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
        {/* Name lockup. Objects drift BEHIND it by default and only pull in
            front on hover. Ignores the pointer so it never blocks a link. */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-full -translate-x-1/2 -translate-y-1/2 px-6 text-center">
          <h1 className="type-display text-brand">
            <span className="block">Josh</span>
            <span className="block">McKenna</span>
          </h1>
        </div>

        {OBJECTS.map((object, index) => {
          const isNav = object.kind === "nav";

          // Every object is a clean cut-out drifting behind the wordmark. The
          // nav objects add a hover/focus affordance: a frosted-blue glass card
          // + outline fades in, the destination label appears, and the object
          // lifts in front of the text (the z-index bump on the wrapper). Ambient
          // objects have no destination, so they stay inert decoration — no glass,
          // no lift — and never look falsely clickable.
          const plate = (
            <div className="relative transition-transform duration-500 ease-drift group-hover:scale-[1.04] group-focus-within:scale-[1.04]">
              <div
                aria-hidden="true"
                // backdrop-blur is only applied on hover: at opacity-0 a resting
                // backdrop-filter still composites in Chrome and leaks a ghost
                // outline, so it must not exist until the card is shown.
                className="pointer-events-none absolute -inset-[8%] rounded-[1.6rem] border-[1.5px] border-brand bg-brand/15 opacity-0 shadow-2xl transition-opacity duration-300 group-hover:opacity-100 group-hover:backdrop-blur-md group-focus-within:opacity-100 group-focus-within:backdrop-blur-md"
              />
              <div
                className="relative z-10"
                style={{ aspectRatio: String(object.aspect) }}
              >
                <Image
                  src={object.src}
                  alt={object.alt}
                  fill
                  sizes={OBJECT_SIZES}
                  priority={isNav}
                  draggable={false}
                  className="object-contain"
                />
              </div>
              {isNav ? (
                <span className="type-label absolute inset-x-0 -bottom-7 z-10 text-center text-brand opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                  → {object.label}
                </span>
              ) : null}
            </div>
          );

          return (
            <div
              key={object.id}
              ref={(node) => {
                nodeRefs.current[index] = node;
              }}
              aria-hidden={isNav ? undefined : "true"}
              // Every object lifts in front of the wordmark and shows the glass
              // card on hover/focus; only nav objects add the label + link.
              className="group absolute left-0 top-0 z-0 will-change-transform hover:z-20 focus-within:z-20"
              style={{
                width: `${object.width * 100}cqw`,
                transform: `translate3d(${object.x * 100}cqw, ${object.y * 100}cqh, 0)`,
              }}
            >
              {isNav ? (
                <Link
                  href={object.href!}
                  className="block"
                  aria-label={`${object.label} — view Josh's ${object.label!.toLowerCase()}`}
                >
                  {plate}
                </Link>
              ) : (
                plate
              )}
            </div>
          );
        })}
      </div>

      {/* Scroll cue — a hairline tick and a label, per node 85:456. */}
      <div className="flex flex-col items-center gap-3 pb-10">
        <span className="block h-8 w-px bg-brand" aria-hidden="true" />
        <span className="type-label text-brand">Keep going</span>
      </div>
    </section>
  );
}
