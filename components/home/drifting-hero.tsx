"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * The homepage hero: nine illustration cut-outs orbiting the JOSH McKenna
 * wordmark, each on its own slow elliptical path so the composition keeps a
 * gravity around the centre and never crowds the text.
 *
 * All of them are purely decorative (`aria-hidden`) — none double as
 * navigation; the site nav already covers Work/Info/Shop/Contact. On
 * hover/focus each object just lifts (scale + cursor-tilt) — a trace of
 * movement inviting the grab below, without physically shoving the object
 * away from the cursor — no frosted card, no boxed outline, nothing but
 * the cut-out itself moving.
 *
 * Geometry is expressed as fractions of the container, so the whole thing
 * scales with the viewport and stays resolution-independent.
 *
 * Grab-and-throw: any object can be picked up with the mouse (pointerType
 * === "mouse" only — touch is left alone entirely, so nothing here fights
 * page-scroll on mobile) and dragged around the frame. Each object carries a
 * `mode` — "orbit" (its normal path), "dragging" (tracks the pointer 1:1),
 * or "released" (free physics after letting go). On release it inherits the
 * velocity of the last ~120ms of pointer motion and just coasts: friction
 * decays that velocity, it bounces off the frame's edges losing energy each
 * bounce, and nothing pulls it toward anywhere while any of that is playing
 * out — the thrown trajectory is honest, not fighting a homing force the
 * whole time (that read as an elastic band snapping it back, no matter how
 * it was tuned). Only once the throw is genuinely spent (near-zero
 * velocity) does it hand off to a short, fixed-feel CSS ease back into
 * wherever its orbit has gotten to by then, scaled by distance so a long
 * way back doesn't warp. The play area is this frame, the same box the
 * orbit already respects — not the full page.
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

/** How far back we look, in ms, to estimate throw velocity on release. */
const DRAG_HISTORY_MS = 120;
/** Hard cap on inherited throw speed, container-fractions per second. */
const MAX_FLING_SPEED = 2.5;
/** Exponential velocity decay while coasting after a throw, per second --
 * pure friction, no pull toward anywhere, so the thrown trajectory plays
 * out honestly instead of fighting a homing force the whole time. */
const FRICTION_RATE = 0.6;
/** Velocity kept after bouncing off a frame edge (rest lost as "energy"). */
const BOUNCE_RESTITUTION = 0.5;
/** Below this speed a released object is considered spent and hands off to
 * a short, fixed-feel ease back into orbit (see the settle branch below) —
 * not a force, so it can never read as elastic. */
const SETTLE_SPEED = 0.03;
/** How long that hand-off ease takes, scaled by how far it has to travel. */
const RETURN_MS_BASE = 350;
const RETURN_MS_PER_UNIT = 1400;
const RETURN_MS_MAX = 1600;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

type DragMode = "orbit" | "dragging" | "released";

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
  // Points at the simulation effect's live per-object state so the
  // hover-tilt handler below (a component-level closure, outside that
  // effect) can tell whether an object is idly orbiting or mid-drag/throw.
  const modeRef = useRef<{ mode: DragMode }[]>([]);

  // Directional tilt: while the pointer is over an object, it leans away
  // from wherever the cursor sits relative to its own centre — more tilt
  // near the edge, near-flat at the centre — and eases back to flat on
  // pointer-leave. Writes straight to the DOM (not React state) on every
  // pointermove, same as the orbit loop below; the CSS transition on
  // `rotate` (see the plate's className) is what makes it feel like a
  // smooth follow rather than a snap.
  //
  // Gated to "orbit" mode only: :hover/pointermove fire off the object's
  // real, current bounding box regardless of *why* the pointer is there --
  // while an object is bouncing back from a throw it can pass right back
  // under a cursor that never moved, and without this check that reads as
  // the tilt (and the CSS group-hover scale bump, suppressed the same way
  // in the effect below) flickering on and off mid-flight, on top of
  // whatever the spring is doing. A visible jiggle riding on the throw.
  const handlePointerMove = (index: number) => (event: React.PointerEvent) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (modeRef.current[index]?.mode !== "orbit") return;

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

    const isReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Live simulation state, seeded from the orbit params. Kept outside React
    // so the loop never triggers a re-render. x/y/vx/vy and mode drive the
    // grab-and-throw interaction below; angle/rx/ry/spin still drive the
    // underlying orbit those live values chase back toward.
    const state = OBJECTS.map((object) => {
      const height = object.width / object.aspect;
      const seed = orbitPosition({ ...object, height });
      return {
        angle: object.angle,
        rx: object.rx,
        ry: object.ry,
        spin: object.spin,
        width: object.width,
        height,
        mode: "orbit" as DragMode,
        x: seed.x,
        y: seed.y,
        vx: 0,
        vy: 0,
        pointerId: null as number | null,
        grabOffsetX: 0,
        grabOffsetY: 0,
        dragHistory: [] as { t: number; x: number; y: number }[],
      };
    });
    modeRef.current = state;

    // --- Grab-and-throw wiring. Always live, independent of reduced motion,
    // since a single direct-manipulation drag isn't the kind of autoplay
    // motion that setting targets — only the momentum/bounce/spring-back
    // afterward is, and that's gated below. Mouse-only: touch is left
    // completely alone so nothing here fights page-scroll on mobile.
    const dragCleanup: Array<() => void> = [];

    // Abandon a drag in progress and ease straight back to the live orbit
    // position, no momentum. Used both for reduced motion's release (no
    // fling simulation there at all) and for a drag that never got a clean
    // pointerup -- the cursor left the browser window or the window lost
    // focus mid-drag, cases the browser doesn't reliably deliver a pointer
    // event for, which otherwise leaves the object stuck wherever it last
    // was. Safe to call on an object that isn't dragging (a no-op).
    const abandonDrag = (i: number) => {
      const object = state[i];
      const node = nodeRefs.current[i];
      if (!node || object.mode !== "dragging") return;

      if (object.pointerId !== null) {
        try {
          node.releasePointerCapture(object.pointerId);
        } catch {
          // Capture may already be gone (e.g. the window itself lost it).
        }
      }
      node.style.cursor = "";
      object.pointerId = null;

      const home = orbitPosition(object);
      object.mode = "orbit";
      object.x = home.x;
      object.y = home.y;
      object.vx = 0;
      object.vy = 0;
      node.style.transition = "transform 500ms var(--ease-drift)";
      node.style.transform = `translate3d(${home.x * 100}cqw, ${home.y * 100}cqh, 0)`;
      node.style.zIndex = "";
      const plate = plateRefs.current[i];
      if (plate) plate.style.scale = "";
      window.setTimeout(() => {
        node.style.transition = "";
      }, 550);
    };

    nodeRefs.current.forEach((node, i) => {
      if (!node) return;
      const object = state[i];

      const onDragStart = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        event.preventDefault();
        node.setPointerCapture(event.pointerId);
        object.mode = "dragging";
        object.pointerId = event.pointerId;
        object.vx = 0;
        object.vy = 0;
        const rect = frame.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        object.grabOffsetX = px - object.x;
        object.grabOffsetY = py - object.y;
        object.dragHistory = [{ t: performance.now(), x: object.x, y: object.y }];
        node.style.transition = "none";
        node.style.cursor = "grabbing";
        // :hover tracks real cursor position, not pointer capture, so once
        // the drag carries the pointer off the element it would drop back
        // to z-0 and could vanish behind the z-10 wordmark mid-throw. Force
        // it above everything until it's back in "orbit" mode (see tick()).
        node.style.zIndex = "30";
        // Same reasoning for the hover scale bump: while dragging or
        // bouncing back from a throw, the object can pass back under a
        // cursor that never moved and re-trigger :hover, which reads as a
        // jiggle riding on top of the throw. Hold it flat until orbit mode.
        const plate = plateRefs.current[i];
        if (plate) plate.style.scale = "1";
      };

      const onDragMove = (event: PointerEvent) => {
        if (object.mode !== "dragging" || event.pointerId !== object.pointerId) {
          return;
        }
        // The primary button reads as already released -- the mouse button
        // came up somewhere outside the browser window, where no pointerup
        // event reaches us, and this move only fired because the cursor
        // has since wandered back in. Treat it the same as a clean release.
        if ((event.buttons & 1) === 0) {
          abandonDrag(i);
          return;
        }
        const rect = frame.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        object.x = clamp(
          px - object.grabOffsetX,
          BOUNDS_INSET,
          1 - BOUNDS_INSET - object.width,
        );
        object.y = clamp(
          py - object.grabOffsetY,
          BOUNDS_INSET,
          1 - BOUNDS_INSET - object.height,
        );

        const now = performance.now();
        object.dragHistory.push({ t: now, x: object.x, y: object.y });
        while (
          object.dragHistory.length > 1 &&
          now - object.dragHistory[0].t > DRAG_HISTORY_MS
        ) {
          object.dragHistory.shift();
        }

        node.style.transform = `translate3d(${object.x * 100}cqw, ${object.y * 100}cqh, 0)`;
      };

      const onDragEnd = (event: PointerEvent) => {
        if (object.mode !== "dragging" || event.pointerId !== object.pointerId) {
          return;
        }

        if (isReduced) {
          // No momentum simulation under reduced motion — ease straight
          // back to the (static) orbit position. The sitewide
          // reduced-motion rule in globals.css flattens this transition to
          // instant, same as everywhere else on the site.
          abandonDrag(i);
          return;
        }

        node.releasePointerCapture(event.pointerId);
        node.style.cursor = "";
        object.pointerId = null;

        const history = object.dragHistory;
        const first = history[0];
        const last = history[history.length - 1];
        if (last && history.length >= 2) {
          const dt = Math.max((last.t - first.t) / 1000, 1 / 120);
          object.vx = clamp((last.x - first.x) / dt, -MAX_FLING_SPEED, MAX_FLING_SPEED);
          object.vy = clamp((last.y - first.y) / dt, -MAX_FLING_SPEED, MAX_FLING_SPEED);
        } else {
          object.vx = 0;
          object.vy = 0;
        }
        object.mode = "released";
      };

      node.addEventListener("pointerdown", onDragStart);
      node.addEventListener("pointermove", onDragMove);
      node.addEventListener("pointerup", onDragEnd);
      node.addEventListener("pointercancel", onDragEnd);

      dragCleanup.push(() => {
        node.removeEventListener("pointerdown", onDragStart);
        node.removeEventListener("pointermove", onDragMove);
        node.removeEventListener("pointerup", onDragEnd);
        node.removeEventListener("pointercancel", onDragEnd);
      });
    });

    // Once the cursor leaves the browser window (or the window loses focus
    // entirely -- alt-tab, clicking another app) while a button is held,
    // most browsers stop delivering pointer events to the page altogether,
    // so the node-level pointerup/pointercancel above never fires and an
    // object can be left stranded wherever it last was. These two catch
    // that: "pointerleave" on the document fires when the pointer exits the
    // viewport even with capture held elsewhere, and "blur" catches focus
    // loss that isn't necessarily a pointer leaving (e.g. alt-tab without
    // the cursor moving).
    const abandonAllDrags = () => {
      for (let i = 0; i < state.length; i += 1) abandonDrag(i);
    };
    window.addEventListener("blur", abandonAllDrags);
    document.addEventListener("pointerleave", abandonAllDrags);
    dragCleanup.push(() => {
      window.removeEventListener("blur", abandonAllDrags);
      document.removeEventListener("pointerleave", abandonAllDrags);
    });

    if (isReduced) {
      // Reduced motion: hold the static orbit otherwise — no drift, no
      // momentum loop. Only the drag-and-snap-back above runs.
      return () => {
        dragCleanup.forEach((cleanup) => cleanup());
      };
    }

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

        // The orbit clock always advances, even mid-drag or mid-throw, so
        // a released object is pulled back toward the *live* orbit rather
        // than a stale point from when it was grabbed.
        object.angle += object.spin * dt;

        if (object.mode === "dragging") {
          // onDragMove owns position and the transform while held.
          continue;
        }

        let x: number;
        let y: number;

        if (object.mode === "released") {
          // Pure momentum: velocity only ever decays (friction, bounces),
          // nothing pulls it anywhere. The thrown trajectory plays out
          // honestly instead of fighting a homing force the whole time --
          // that force, however it was tuned, is what kept reading as an
          // elastic band snapping it back.
          const frictionDecay = Math.exp(-FRICTION_RATE * dt);
          object.vx *= frictionDecay;
          object.vy *= frictionDecay;
          object.x += object.vx * dt;
          object.y += object.vy * dt;

          // Bounce off the frame edges, losing some speed each time.
          const minX = BOUNDS_INSET;
          const maxX = 1 - BOUNDS_INSET - object.width;
          const minY = BOUNDS_INSET;
          const maxY = 1 - BOUNDS_INSET - object.height;
          if (object.x < minX) {
            object.x = minX;
            object.vx = Math.abs(object.vx) * BOUNCE_RESTITUTION;
          } else if (object.x > maxX) {
            object.x = maxX;
            object.vx = -Math.abs(object.vx) * BOUNCE_RESTITUTION;
          }
          if (object.y < minY) {
            object.y = minY;
            object.vy = Math.abs(object.vy) * BOUNCE_RESTITUTION;
          } else if (object.y > maxY) {
            object.y = maxY;
            object.vy = -Math.abs(object.vy) * BOUNCE_RESTITUTION;
          }

          if (Math.hypot(object.vx, object.vy) < SETTLE_SPEED) {
            // Spent. However far the throw actually left it, hand off to a
            // short, fixed-feel ease back into the live orbit -- a CSS
            // transition, not a force, so it reads as one deliberate drift
            // home rather than a spring's recoil. Duration scales with the
            // distance left to cover so a long way back doesn't warp.
            const home = orbitPosition(object);
            const distance = Math.hypot(home.x - object.x, home.y - object.y);
            const durationMs = clamp(
              RETURN_MS_BASE + distance * RETURN_MS_PER_UNIT,
              RETURN_MS_BASE,
              RETURN_MS_MAX,
            );
            object.mode = "orbit";
            object.x = home.x;
            object.y = home.y;
            object.vx = 0;
            object.vy = 0;
            node.style.transition = `transform ${durationMs}ms var(--ease-drift)`;
            node.style.transform = `translate3d(${home.x * 100}cqw, ${home.y * 100}cqh, 0)`;
            node.style.zIndex = "";
            const plate = plateRefs.current[i];
            if (plate) plate.style.scale = "";
            window.setTimeout(() => {
              node.style.transition = "";
            }, durationMs + 50);
            continue;
          }

          x = object.x;
          y = object.y;
        } else {
          ({ x, y } = orbitPosition(object));
        }

        // Never let anything run an object off the frame.
        x = clamp(x, BOUNDS_INSET, 1 - BOUNDS_INSET - object.width);
        y = clamp(y, BOUNDS_INSET, 1 - BOUNDS_INSET - object.height);
        object.x = x;
        object.y = y;

        node.style.transform = `translate3d(${x * 100}cqw, ${y * 100}cqh, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      dragCleanup.forEach((cleanup) => cleanup());
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
              className="group absolute left-0 top-0 z-0 cursor-grab will-change-transform hover:z-20 focus-within:z-20"
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
