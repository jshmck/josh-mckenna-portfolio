"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * The homepage hero: nine illustration cut-outs orbiting the JOSH McKenna
 * wordmark, each on its own slow elliptical path so the composition keeps a
 * gravity around the centre and never crowds the text. Nearby objects still
 * lean away from the cursor.
 *
 * All of them are purely decorative (`aria-hidden`) — none double as
 * navigation; the site nav already covers Work/Info/Shop/Contact. On
 * hover/focus each object just lifts (scale + cursor-tilt) — no frosted
 * card, no boxed outline, nothing but the cut-out itself moving.
 *
 * Geometry is expressed as fractions of the container, so the whole thing
 * scales with the viewport and stays resolution-independent.
 */

const rad = (deg: number) => (deg * Math.PI) / 180;

type DriftObject = {
  id: string;
  src: string;
  /** Empty — every object is decorative (aria-hidden). */
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
    src: "/illustrations/objects/face.png",
    alt: "",
    /* 0.185 -> 0.17 per Josh -- "slightly smaller, not a lot." */
    width: 0.17,
    aspect: 0.795,
    angle: rad(235),
    rx: 0.33,
    ry: 0.34,
    spin: rad(5),
  },
  {
    id: "work",
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
    id: "info",
    src: "/illustrations/objects/bearded.png",
    alt: "",
    /* 0.19 -> 0.15 -> 0.12 per Josh, in two passes -- this is "his
       head," reading too large next to the rest of the set. */
    width: 0.12,
    aspect: 1.052,
    angle: rad(150),
    rx: 0.35,
    ry: 0.33,
    spin: rad(5.5),
  },
  {
    id: "shop",
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
    id: "contact",
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
    id: "ambient-7",
    src: "/illustrations/objects/last-call.png",
    alt: "",
    width: 0.18,
    aspect: 0.938,
    angle: rad(190),
    rx: 0.33,
    ry: 0.335,
    spin: rad(-5.2),
  },
  {
    id: "ambient-8",
    src: "/illustrations/objects/pato.png",
    alt: "",
    width: 0.16,
    aspect: 0.8,
    angle: rad(0),
    rx: 0.32,
    ry: 0.33,
    spin: rad(4.8),
  },
  {
    id: "ambient-9",
    src: "/illustrations/objects/twingo-silver-final.png",
    alt: "",
    width: 0.28,
    aspect: 2.058,
    angle: rad(70),
    rx: 0.3,
    ry: 0.31,
    spin: rad(-4.2),
  },
  {
    id: "ambient-10",
    src: "/illustrations/objects/pride-sticker.png",
    alt: "",
    width: 0.095,
    aspect: 0.774,
    angle: rad(260),
    rx: 0.34,
    ry: 0.33,
    spin: rad(5.6),
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

/** Maximum tilt at the object's own edge, degrees. Scales down toward 0 at centre. */
const MAX_TILT = 8;

export function DriftingHero() {
  const frameRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Directional tilt: while the pointer is over an object, it leans away
  // from wherever the cursor sits relative to its own centre — more tilt
  // near the edge, near-flat at the centre — and eases back to flat on
  // pointer-leave. Writes straight to the DOM (not React state) on every
  // pointermove, same as the orbit loop below; the CSS transition on
  // `rotate` (see the plate's className) is what makes it feel like a
  // smooth follow rather than a snap.
  const handlePointerMove = (index: number) => (event: React.PointerEvent) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const plate = plateRefs.current[index];
    if (!plate) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const relX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const clamped = Math.max(-1, Math.min(1, relX));
    plate.style.rotate = `${-clamped * MAX_TILT}deg`;
  };

  const handlePointerLeave = (index: number) => () => {
    const plate = plateRefs.current[index];
    if (!plate) return;
    plate.style.rotate = "0deg";
  };

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
    // pb-24 on mobile stacked on top of an already-vh-dominated h-[88vh]
    // frame read as a huge gap before Who -- desktop has room to spare at
    // that width, mobile doesn't. Smaller below md, unchanged from md up.
    <section className="relative pb-10 md:pb-24">
      <div
        ref={frameRef}
        // `container-type: size` gives the objects cqw/cqh units, so their
        // JS-driven transforms are expressed relative to this frame rather
        // than the viewport.
        className="relative mx-auto h-[min(88vh,880px)] max-w-frame [container-type:size]"
      >
        {/* Name lockup. Objects orbit BEHIND it and only pull in front on
            hover. Ignores the pointer so it never blocks anything. */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-full -translate-x-1/2 -translate-y-1/2 px-6 text-center">
          <h1 className="type-display leading-[0.95] text-brand">
            <span className="block">jOSH</span>
            <span className="block">MCkeNNA</span>
          </h1>
        </div>

        {OBJECTS.map((object, index) => {
          const height = object.width / object.aspect;
          const seed = orbitPosition({ ...object, height });

          return (
            <div
              key={object.id}
              ref={(node) => {
                nodeRefs.current[index] = node;
              }}
              onPointerMove={handlePointerMove(index)}
              onPointerLeave={handlePointerLeave(index)}
              aria-hidden="true"
              className="group absolute left-0 top-0 z-0 will-change-transform hover:z-20 focus-within:z-20"
              style={{
                width: `${object.width * 100}cqw`,
                transform: `translate3d(${seed.x * 100}cqw, ${seed.y * 100}cqh, 0)`,
              }}
            >
              {/* A clean cut-out, no frosted card — on hover/focus it just
                  lifts (scale + tilt), and lifts above its neighbours via
                  the z-index bump on the wrapper. max-md:scale-[1.25] is a
                  flat mobile-only size bump per Josh — a CSS transform, not
                  a change to object.width, so it never touches the
                  orbit/bounds math above (all keyed off the untouched
                  width fraction) and desktop is unaffected from md up. The
                  hover/focus target bumps proportionally with it
                  (1.25 * 1.03) so hovering still reads as the same ~3%
                  lift on top of rest, not a snap back down to 1.03. */}
              <div
                ref={(node) => {
                  plateRefs.current[index] = node;
                }}
                className="relative scale-100 transition-[scale_500ms_var(--ease-drift),rotate_150ms_ease-out] group-hover:scale-[1.03] group-focus-within:scale-[1.03] max-md:scale-[1.25] max-md:group-hover:scale-[1.29] max-md:group-focus-within:scale-[1.29]"
                style={{ aspectRatio: String(object.aspect) }}
              >
                <Image
                  src={object.src}
                  alt={object.alt}
                  fill
                  sizes={OBJECT_SIZES}
                  priority
                  draggable={false}
                  className="object-contain"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
