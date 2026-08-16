"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * The homepage hero: six illustration cut-outs clustered over the "jOSH
 * McKenna" wordmark, each drifting on its own slow elliptical path so the
 * composition never goes fully still. At rest they loosely cover the name —
 * some peek-through is fine, it's not meant to tile perfectly. Nearby
 * objects lean away from the cursor, same as before.
 *
 * All six are purely decorative now — none of them double as navigation.
 * The site nav already covers Work/Info/Shop/Contact, so there's no reason
 * for the hero to repeat it; every object renders `aria-hidden`.
 *
 * As the page scrolls, each object additionally scatters outward along its
 * own resting angle and fades out — revealing the wordmark — in step with
 * how far the hero's own box has scrolled past the top of the viewport.
 * There's no pin and no added scroll length: this reads straight off the
 * hero's natural `getBoundingClientRect()`, so scatter progress reaches 1
 * well before the hero scrolls out from under the fixed nav, and the rest
 * of the homepage's scroll length and pacing are completely untouched.
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
  /** Starting angle on the orbit, radians — also the scatter direction. */
  angle: number;
  /** Orbit radii as a fraction of container width / height. */
  rx: number;
  ry: number;
  /** Angular velocity, radians per second (sign sets direction). */
  spin: number;
  /** How far the object travels outward along its own resting `angle`, as
   *  a fraction of the frame, by scroll progress = 1. */
  scatterDistance: number;
  /** Target rotation in degrees at scroll progress = 1. */
  scatterRotate: number;
};

const OBJECTS: DriftObject[] = [
  {
    id: "obj-1",
    src: "/illustrations/objects/face.png",
    alt: "",
    width: 0.185,
    aspect: 0.795,
    angle: rad(235),
    rx: 0.16,
    ry: 0.17,
    spin: rad(5),
    scatterDistance: 0.85,
    scatterRotate: 18,
  },
  {
    id: "obj-2",
    src: "/illustrations/objects/car.png",
    alt: "",
    width: 0.3,
    aspect: 1.991,
    angle: rad(320),
    rx: 0.15,
    ry: 0.155,
    spin: rad(-4.5),
    scatterDistance: 0.9,
    scatterRotate: -16,
  },
  {
    id: "obj-3",
    src: "/illustrations/objects/bearded.png",
    alt: "",
    width: 0.19,
    aspect: 1.052,
    angle: rad(150),
    rx: 0.175,
    ry: 0.165,
    spin: rad(5.5),
    scatterDistance: 0.8,
    scatterRotate: 20,
  },
  {
    id: "obj-4",
    src: "/illustrations/objects/hand.png",
    alt: "",
    width: 0.145,
    aspect: 0.734,
    angle: rad(40),
    rx: 0.17,
    ry: 0.17,
    spin: rad(-6.5),
    scatterDistance: 0.95,
    scatterRotate: -14,
  },
  {
    id: "obj-5",
    src: "/illustrations/objects/flowers.png",
    alt: "",
    width: 0.175,
    aspect: 1.112,
    angle: rad(285),
    rx: 0.16,
    ry: 0.175,
    spin: rad(6),
    scatterDistance: 0.85,
    scatterRotate: 22,
  },
  {
    id: "obj-6",
    src: "/illustrations/objects/car-pink.png",
    alt: "",
    width: 0.36,
    aspect: 2.317,
    angle: rad(100),
    rx: 0.155,
    ry: 0.16,
    spin: rad(-5),
    scatterDistance: 0.9,
    scatterRotate: -18,
  },
];

/** Orbit centre — the middle of the frame, under the wordmark. */
const CENTRE = 0.5;
/** Keep objects this far inside each edge at rest (progress = 0). */
const BOUNDS_INSET = 0.02;
/** How close the pointer must get before an object leans away. */
const REPEL_RADIUS = 0.26;
/** Maximum lean, as a fraction of container width. */
const REPEL_STRENGTH = 0.05;
/** Scroll progress (0–1) past which objects start fading out. */
const SCATTER_FADE_START = 0.32;
/** How fast the fade-out ramps once past SCATTER_FADE_START. Tuned so
 *  fully-scattered objects are invisible by ~0.65 progress, well before
 *  the hero has scrolled far enough for them to visually reach the
 *  section below it. */
const SCATTER_FADE_RATE = 3;
/** How far the bounds clamp relaxes at full scatter — must clear the
 *  largest scatterDistance with margin, so nothing clips before it fades. */
const SCATTER_BOUNDS_RELAX = 1.4;

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
      // Reduced motion: hold the static composition (each object at its
      // seed angle, covering the wordmark, no scroll-driven scatter).
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

      // No pin, no added scroll length: progress is purely "how far the
      // hero's own box has scrolled past the top of the viewport." One
      // read for the whole frame, not per-object.
      const heroRect = frame.getBoundingClientRect();
      const scrollProgress = Math.min(
        Math.max(-heroRect.top / (heroRect.height || 1), 0),
        1,
      );
      const eased = scrollProgress * scrollProgress;
      const scatterFade = Math.max(
        0,
        1 - Math.max(0, scrollProgress - SCATTER_FADE_START) * SCATTER_FADE_RATE,
      );
      const boundsRelax = eased * SCATTER_BOUNDS_RELAX;

      for (let i = 0; i < state.length; i += 1) {
        const object = state[i];
        const meta = OBJECTS[i];
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

        // Scroll-driven scatter, additive on top of orbit + repel — fixed
        // to the object's original seed angle (not the live orbiting
        // angle) so the exit direction stays put instead of wobbling as
        // the idle orbit keeps spinning underneath it.
        x += Math.cos(meta.angle) * meta.scatterDistance * eased;
        y += Math.sin(meta.angle) * meta.scatterDistance * eased;

        // The bounds clamp relaxes as scatter progresses, so objects can
        // actually fly clear of the frame instead of hitting an invisible
        // wall — by the time they'd visibly clip, they've faded out.
        x = Math.max(
          BOUNDS_INSET - boundsRelax,
          Math.min(x, 1 - BOUNDS_INSET - object.width + boundsRelax),
        );
        y = Math.max(
          BOUNDS_INSET - boundsRelax,
          Math.min(y, 1 - BOUNDS_INSET - object.height + boundsRelax),
        );

        node.style.transform = `translate3d(${x * 100}cqw, ${y * 100}cqh, 0)`;
        node.style.rotate = `${meta.scatterRotate * eased}deg`;
        node.style.opacity = String(scatterFade);
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
    <section className="relative">
      <div
        ref={frameRef}
        // `container-type: size` gives the objects cqw/cqh units, so their
        // JS-driven transforms are expressed relative to this frame rather
        // than the viewport.
        className="relative mx-auto h-[min(88vh,880px)] max-w-frame [container-type:size]"
      >
        {/* Name lockup. Sits BEHIND the objects now — they cluster over it
            at rest and scatter clear as the page scrolls. Ignores the
            pointer so it never blocks anything. */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-full -translate-x-1/2 -translate-y-1/2 px-6 text-center">
          <h1 className="type-display leading-[0.95] text-brand">
            <span className="block">jOSH</span>
            <span className="block">MCkeNNA</span>
          </h1>
        </div>

        {OBJECTS.map((object, index) => {
          const height = object.width / object.aspect;
          const seed = orbitPosition({ ...object, height });

          // A clean cut-out at rest; on hover/focus a soft frosted-glass
          // card fades in around it (generous padding, no border — Josh
          // wants a blur, not a boxed outline), and the object lifts above
          // its neighbours via the z-index bump on the wrapper.
          const plate = (
            <div
              ref={(node) => {
                plateRefs.current[index] = node;
              }}
              className="relative transition-[scale_500ms_var(--ease-drift),rotate_150ms_ease-out] group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-[15%] -right-[15%] -top-[15%] -bottom-[15%] rounded-[1.75rem] transition-[background-color] duration-300 group-hover:bg-canvas/15 group-hover:backdrop-blur-md group-focus-within:bg-canvas/15 group-focus-within:backdrop-blur-md"
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
                  priority
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
              onPointerMove={handlePointerMove(index)}
              onPointerLeave={handlePointerLeave(index)}
              aria-hidden="true"
              className="group absolute left-0 top-0 z-10 will-change-transform hover:z-20 focus-within:z-20"
              style={{
                width: `${object.width * 100}cqw`,
                transform: `translate3d(${seed.x * 100}cqw, ${seed.y * 100}cqh, 0)`,
              }}
            >
              {plate}
            </div>
          );
        })}
      </div>
    </section>
  );
}
