"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * The homepage hero: six illustration cut-outs roaming the frame around the
 * JOSH McKenna wordmark. Simple bounce physics — each object carries its
 * own position and velocity, bounces off the frame edges, and feels a
 * gentle pull back toward centre so it drifts home instead of pinballing
 * forever. Mutual repulsion keeps objects from piling on top of each other
 * as they all drift toward the same centre. Nearby objects also lean away
 * from the cursor, on top of all that.
 *
 * All six are purely decorative (`aria-hidden`) — none of them double as
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
  /** Seed angle, radians — sets the resting/initial position (via `rx`/`ry`)
   *  and the object's initial direction of travel once the bounce
   *  simulation starts. Not a live orbit any more; just a starting point. */
  angle: number;
  /** Resting-position radii as a fraction of container width / height —
   *  where the object sits before motion starts (and under reduced
   *  motion, where it stays). */
  rx: number;
  ry: number;
  /** Was angular velocity for the old orbit; now only its magnitude is
   *  used, to scale each object's initial roaming speed. */
  spin: number;
};

const OBJECTS: DriftObject[] = [
  {
    id: "ambient-1",
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
    width: 0.19,
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
    id: "ambient-6",
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
/** How hard objects are pulled back toward centre each second, as a
 *  fraction of the distance remaining. Small on purpose — objects should
 *  roam most of the frame and only gently drift home, not snap back. */
const GRAVITY_STRENGTH = 0.06;
/** Extra gap objects keep from each other, beyond their own combined
 *  radii, before repulsion kicks in. */
const OBJECT_REPEL_PADDING = 0.05;
/** How hard overlapping objects push each other apart. */
const OBJECT_REPEL_STRENGTH = 0.9;

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

    // Live simulation state — bounce physics, seeded from each object's
    // resting angle (starting position + initial travel direction) and
    // spin magnitude (initial speed), so objects that used to orbit fast
    // still roam fast. Kept outside React so the loop never triggers a
    // re-render.
    const state = OBJECTS.map((object) => {
      const height = object.width / object.aspect;
      const seed = orbitPosition({ ...object, height });
      const speed = 0.05 + Math.abs(object.spin) * 0.4;
      return {
        x: seed.x,
        y: seed.y,
        vx: Math.cos(object.angle) * speed,
        vy: Math.sin(object.angle) * speed,
        width: object.width,
        height,
      };
    });

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

      // Gravity, applied to every object's velocity from its current
      // (pre-move) position, before anything moves this frame.
      for (let i = 0; i < state.length; i += 1) {
        const object = state[i];
        const centreX = object.x + object.width / 2;
        const centreY = object.y + object.height / 2;
        object.vx += (CENTRE - centreX) * GRAVITY_STRENGTH * dt;
        object.vy += (CENTRE - centreY) * GRAVITY_STRENGTH * dt;
      }

      // Mutual repulsion — objects push each other apart when they get
      // close, so the gentle pull toward centre doesn't pile everything
      // into one overlapping cluster. Same linear falloff as the cursor
      // repel below, just object-to-object instead of pointer-to-object,
      // and it nudges velocity (so it integrates smoothly) rather than
      // snapping position.
      for (let i = 0; i < state.length; i += 1) {
        const a = state[i];
        const ax = a.x + a.width / 2;
        const ay = a.y + a.height / 2;
        const aRadius = (a.width + a.height) / 4;

        for (let j = i + 1; j < state.length; j += 1) {
          const b = state[j];
          const bx = b.x + b.width / 2;
          const by = b.y + b.height / 2;
          const bRadius = (b.width + b.height) / 4;

          const dx = ax - bx;
          const dy = ay - by;
          const distance = Math.hypot(dx, dy);
          const minDistance = aRadius + bRadius + OBJECT_REPEL_PADDING;

          if (distance > 0.0001 && distance < minDistance) {
            const falloff = 1 - distance / minDistance;
            const scale = (falloff * OBJECT_REPEL_STRENGTH) / distance;
            const fx = dx * scale * dt;
            const fy = dy * scale * dt;
            a.vx += fx;
            a.vy += fy;
            b.vx -= fx;
            b.vy -= fy;
          }
        }
      }

      for (let i = 0; i < state.length; i += 1) {
        const object = state[i];
        const node = nodeRefs.current[i];
        if (!node) continue;

        const centreX = object.x + object.width / 2;
        const centreY = object.y + object.height / 2;

        object.x += object.vx * dt;
        object.y += object.vy * dt;

        // Bounce off the frame edges — reflect the velocity component that
        // hit the wall instead of the object just stopping there.
        const maxX = 1 - BOUNDS_INSET - object.width;
        const maxY = 1 - BOUNDS_INSET - object.height;
        if (object.x < BOUNDS_INSET) {
          object.x = BOUNDS_INSET;
          object.vx = Math.abs(object.vx);
        } else if (object.x > maxX) {
          object.x = maxX;
          object.vx = -Math.abs(object.vx);
        }
        if (object.y < BOUNDS_INSET) {
          object.y = BOUNDS_INSET;
          object.vy = Math.abs(object.vy);
        } else if (object.y > maxY) {
          object.y = maxY;
          object.vy = -Math.abs(object.vy);
        }

        let x = object.x;
        let y = object.y;

        // Soft repel: falls off linearly to zero at REPEL_RADIUS so objects
        // ease away from the cursor instead of snapping.
        if (pointer.active) {
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
    <section className="relative">
      <div
        ref={frameRef}
        // `container-type: size` gives the objects cqw/cqh units, so their
        // JS-driven transforms are expressed relative to this frame rather
        // than the viewport.
        className="relative mx-auto h-[min(88vh,880px)] max-w-frame [container-type:size]"
      >
        {/* Name lockup. Objects roam BEHIND it and only pull in front on
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
                  the z-index bump on the wrapper. */}
              <div
                ref={(node) => {
                  plateRefs.current[index] = node;
                }}
                className="relative transition-[scale_500ms_var(--ease-drift),rotate_150ms_ease-out] group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
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
