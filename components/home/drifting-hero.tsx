"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * The homepage hero: six illustration cut-outs orbiting the JOSH McKenna
 * wordmark, each on its own slow elliptical path so the composition keeps a
 * gravity around the centre and never crowds the text. Nearby objects still
 * lean away from the cursor.
 *
 * Three of the six are real navigation (Work · About · Shop) and render as
 * links with visible focus and a destination label. The other three are
 * decoration and are hidden from assistive tech entirely — but every object
 * gets the same hover treatment: it lifts in front of the wordmark and a
 * frosted-blue glass card fades in around it.
 *
 * Geometry is expressed as fractions of the container, so the whole thing
 * scales with the viewport and stays resolution-independent.
 */

const rad = (deg: number) => (deg * Math.PI) / 180;

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
  /** Starting angle on the orbit, radians. */
  angle: number;
  /** Orbit radii as a fraction of container width / height. */
  rx: number;
  ry: number;
  /** Angular velocity, radians per second (sign sets direction). */
  spin: number;
};

const OBJECTS: DriftObject[] = [
  {
    id: "ambient-1",
    kind: "ambient",
    src: "/illustrations/objects/face.png",
    alt: "",
    width: 0.185,
    aspect: 0.795,
    angle: rad(235),
    rx: 0.33,
    ry: 0.34,
    spin: rad(5),
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
    angle: rad(320),
    rx: 0.3,
    ry: 0.31,
    spin: rad(-4.5),
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
    angle: rad(150),
    rx: 0.35,
    ry: 0.33,
    spin: rad(5.5),
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
    angle: rad(40),
    rx: 0.34,
    ry: 0.34,
    spin: rad(-6.5),
  },
  {
    id: "ambient-5",
    kind: "ambient",
    src: "/illustrations/objects/flowers.png",
    alt: "",
    width: 0.175,
    aspect: 1.112,
    angle: rad(285),
    rx: 0.32,
    ry: 0.35,
    spin: rad(6),
  },
  {
    id: "ambient-6",
    kind: "ambient",
    src: "/illustrations/objects/car-pink.png",
    alt: "",
    width: 0.36,
    aspect: 2.317,
    angle: rad(100),
    rx: 0.31,
    ry: 0.32,
    spin: rad(-5),
  },
];

/** Orbit centre — the middle of the frame, under the wordmark. */
const CENTRE = 0.5;
/** Keep objects this far inside each edge. */
const BOUNDS_INSET = 0.02;
/** How close the pointer must get before an object leans away. */
const REPEL_RADIUS = 0.26;
/** Maximum lean, as a fraction of container width. */
const REPEL_STRENGTH = 0.05;

/** Responsive candidate widths — objects span ~15–30% of the frame. */
const OBJECT_SIZES = "(max-width: 768px) 48vw, 30vw";

/** Position of an object's top-left corner on its orbit at a given angle. */
function orbitPosition(o: {
  angle: number;
  rx: number;
  ry: number;
  width: number;
  height: number;
}) {
  return {
    x: CENTRE + o.rx * Math.cos(o.angle) - o.width / 2,
    y: CENTRE + o.ry * Math.sin(o.angle) - o.height / 2,
  };
}

export function DriftingHero() {
  const frameRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Reduced motion: hold the static orbit (each object at its seed angle).
      return;
    }

    // Live simulation state, seeded from the orbit params. Kept outside React
    // so the loop never triggers a re-render.
    const state = OBJECTS.map((object) => ({
      angle: object.angle,
      rx: object.rx,
      ry: object.ry,
      spin: object.spin,
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
      // Clamp dt so a backgrounded tab doesn't jump everything on return.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      for (let i = 0; i < state.length; i += 1) {
        const object = state[i];
        const node = nodeRefs.current[i];
        if (!node) continue;

        // Advance the orbit.
        object.angle += object.spin * dt;
        let { x, y } = orbitPosition(object);

        // Soft repel: falls off linearly to zero at REPEL_RADIUS so objects
        // ease away from the cursor instead of snapping.
        if (pointer.active) {
          const centreX = x + object.width / 2;
          const centreY = y + object.height / 2;
          const dx = centreX - pointer.x;
          const dy = centreY - pointer.y;
          const distance = Math.hypot(dx, dy);

          if (distance > 0.0001 && distance < REPEL_RADIUS) {
            const falloff = 1 - distance / REPEL_RADIUS;
            const scale = (falloff * REPEL_STRENGTH) / distance;
            x += dx * scale;
            y += dy * scale;
          }
        }

        // Never let an orbit (or a repel push) run an object off the frame.
        x = Math.max(BOUNDS_INSET, Math.min(x, 1 - BOUNDS_INSET - object.width));
        y = Math.max(
          BOUNDS_INSET,
          Math.min(y, 1 - BOUNDS_INSET - object.height),
        );

        node.style.transform = `translate3d(${x * 100}cqw, ${y * 100}cqh, 0)`;
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
        {/* Name lockup. Objects orbit BEHIND it and only pull in front on
            hover. Ignores the pointer so it never blocks a link. */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-full -translate-x-1/2 -translate-y-1/2 px-6 text-center">
          <h1 className="type-display text-brand">
            <span className="block">jOSH</span>
            <span className="block">MCkeNNA</span>
          </h1>
        </div>

        {OBJECTS.map((object, index) => {
          const isNav = object.kind === "nav";
          const height = object.width / object.aspect;
          const seed = orbitPosition({ ...object, height });

          // A clean cut-out at rest; on hover/focus a frosted-blue glass card
          // fades in around it (with generous padding), the destination label
          // appears below with room from the border, and the object lifts in
          // front of the wordmark via the z-index bump on the wrapper.
          const plate = (
            <div className="relative transition-transform duration-500 ease-drift group-hover:scale-[1.03] group-focus-within:scale-[1.03]">
              <div
                aria-hidden="true"
                // border/bg/blur stay off until hover: a resting transparent
                // backdrop-filter leaks a ghost outline in Chrome, and a
                // transparent border keeps the layout from shifting.
                // Nav objects get extra room below for the destination
                // label; ambient objects have no label, so their card stays
                // centred on the illustration instead of bottom-heavy.
                className={`pointer-events-none absolute -left-[15%] -right-[15%] -top-[15%] flex flex-col items-center justify-end rounded-[1.75rem] border-[1.5px] border-transparent shadow-2xl shadow-transparent transition-[background-color,border-color,box-shadow] duration-300 group-hover:border-brand group-hover:bg-brand/15 group-hover:shadow-brand/25 group-hover:backdrop-blur-md group-focus-within:border-brand group-focus-within:bg-brand/15 group-focus-within:shadow-brand/25 group-focus-within:backdrop-blur-md ${isNav ? "-bottom-[calc(20%+1.75rem)] pb-4" : "-bottom-[15%]"}`}
              >
                {isNav ? (
                  <span className="type-label text-[1rem] leading-none text-brand opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                    → {object.label}
                  </span>
                ) : null}
              </div>
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
            </div>
          );

          return (
            <div
              key={object.id}
              ref={(node) => {
                nodeRefs.current[index] = node;
              }}
              aria-hidden={isNav ? undefined : "true"}
              className="group absolute left-0 top-0 z-0 will-change-transform hover:z-20 focus-within:z-20"
              style={{
                width: `${object.width * 100}cqw`,
                transform: `translate3d(${seed.x * 100}cqw, ${seed.y * 100}cqh, 0)`,
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
