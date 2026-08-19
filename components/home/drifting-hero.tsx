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
 *
 * Grab-and-throw: any object can be picked up with the mouse (pointerType
 * === "mouse" only — touch is left alone entirely, so nothing here fights
 * page-scroll on mobile) and dragged around the frame. Each object carries a
 * `mode` — "orbit" (its normal path), "dragging" (tracks the pointer 1:1),
 * "released" (free physics after letting go), or "landing" (a brief final
 * blend, see below). On release it inherits the velocity of the last
 * ~120ms of pointer motion and just moves — momentum, bounces off the
 * frame's edges — with two gentle additions the whole time. Friction decays
 * velocity toward this object's own *local cruising velocity* (the
 * tangential speed it would naturally be moving at, at the nearest point on
 * its own ellipse) rather than toward zero — every object cruises at a
 * different speed (rx * spin), and decaying all the way to a standstill
 * meant a fast-cruising object would grind almost to a stop right before
 * rejoining, then have to speed back up, reading as a spring rather than a
 * natural settle. And a constant pull nudges *position* toward that same
 * nearest point, not toward any specific advancing phase. Since the ellipse
 * spans most of the frame already, that's usually a small correction, it
 * never fights the throw's tangential motion (only the radial distance
 * from the curve), and because the target is derived from the object's own
 * current position every frame rather than an independently moving clock,
 * there's nothing for it to chase — no steady-state lag, no scheduled
 * hand-off. Once captured (close to the line, close to that local cruising
 * speed), it's very likely near the right position but not necessarily
 * moving in *exactly* the ellipse's tangent direction yet
 * — "landing" is a short, fixed blend (LANDING_MS) that irons out just
 * that last bit before resuming full-rate orbital motion. It's a cubic
 * Hermite blend, not a plain lerp, because it has to match real velocity
 * at both ends: the incoming throw velocity at the start, and this
 * object's own cruising speed (rx * spin, which varies quite a bit object
 * to object) at the end — a simpler blend implicitly assumes zero velocity
 * at both ends, which is only true by coincidence for a slow-cruising
 * object and is a real, visible snap for a fast one. It rejoins the orbit
 * at whatever phase the throw happened to leave it near, not at a fixed
 * start point. The play area is this frame, the same box the orbit
 * already respects — not the full page.
 *
 * The wordmark renders above every object in every mode, no exceptions —
 * simpler and steadier than trying to track which state should sit above
 * it and which shouldn't, and it means a thrown object settling back into
 * orbit can never flicker as it crosses behind the text.
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
    /* 0.185 -> 0.17 -> 0.135 per Josh -- the blue head, smaller again. */
    width: 0.135,
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
    /* 0.3 -> 0.24 per Josh -- the blue Honda, smaller. */
    width: 0.24,
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
    /* No-key crop per Josh -- the keys/"Last Call" tag stay on the
       Contact page version (/illustrations/last-call.png), just the
       hat here. */
    src: "/illustrations/objects/cowboy-hat.png",
    alt: "",
    width: 0.18,
    aspect: 1.331,
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
const REPEL_RADIUS = 0.18;
/** Maximum lean, as a fraction of container width. */
const REPEL_STRENGTH = 0.02;

/** How far back we look, in ms, to estimate throw velocity on release.
 * Sized to comfortably hold a whole real flick gesture -- accelerate, peak,
 * ease off before the fingers actually leave the button -- not just its
 * final moment. That easing-off alone can take 150-200ms, so a window much
 * shorter than this would have the buffer trimmed down to nothing but the
 * tail before release ever happens, discarding the peak before onDragEnd
 * gets a chance to look for it. */
const DRAG_HISTORY_MS = 320;
/** Hard cap on inherited throw speed, container-fractions per second. */
const MAX_FLING_SPEED = 2.5;
/** Exponential velocity decay while a thrown object is in flight, per
 * second -- this alone is what damps everything below, both the throw's
 * own momentum and whatever the magnet adds. */
const FRICTION_RATE = 0.6;
/** Velocity kept after bouncing off a frame edge (rest lost as "energy"). */
const BOUNCE_RESTITUTION = 0.5;
/** Constant, gentle pull toward the *nearest point on the object's own
 * ellipse* -- not toward any specific advancing phase, so it's usually
 * only a small correction (the ellipse spans most of the frame already)
 * and never fights the throw's tangential motion, only the radial
 * distance from the curve. No scheduled ramp, no fixed duration -- it's
 * just always gently on, proportional to actual distance from the line. */
const MAGNET_K = 1.1;
/** Distance/speed thresholds below which a released object is considered
 * captured onto its orbit line and starts landing (see LANDING_MS) -- not
 * yet the same instant as resuming full orbital motion. */
const SETTLE_DISTANCE = 0.006;
const SETTLE_SPEED = 0.03;
/** The settle check only bounds speed, not direction -- a slow object can
 * still be angled slightly off the ellipse's tangent right at capture, and
 * handing that straight to fixed-rate orbital motion reads as a small
 * directional snap. This is a short final blend from the captured position
 * to where the orbit will be once landing finishes, matching real velocity
 * at both ends (see the Hermite blend in tick()) rather than assuming it's
 * zero at either end -- every object's own cruising speed (rx * spin)
 * differs, and several run faster than SETTLE_SPEED itself, so pretending
 * velocity is zero at the hand-off was a real discontinuity for those,
 * even though it was invisible on a slow one. Short on purpose: capture
 * only happens once already very close, so even a brief blend covers very
 * little ground. */
const LANDING_MS = 400;
/** Minimum angular gap enforced when an object captures back onto orbit,
 * checked against every other currently-orbiting object -- matches the
 * tightest gap already present in the hand-placed OBJECTS seed angles
 * (25° apart), so this doesn't introduce spacing tighter than the design
 * already uses. All nine ellipses are similar in size and share the same
 * centre, so when two objects get thrown into the same area, each one's
 * *own*, independently-computed "nearest point on my own ellipse" can
 * land very close to the other's -- nothing wrong with either
 * calculation individually, but with reported spin rates only ~10-20%
 * apart, two objects captured that close linger stacked for many seconds
 * before drifting apart, reading as stuck rather than settled. This is a
 * one-time nudge applied only at the instant of capture, not a
 * continuous force -- it doesn't touch dragging or mid-flight physics,
 * so it can't reintroduce objects dodging each other while being carried
 * (the whole reason continuous inter-object repulsion was removed). */
const MIN_ORBIT_SEPARATION = rad(40);

/** Cubic Hermite interpolation matching both position and velocity at
 * t=0 and t=1 -- unlike a plain lerp/smoothstep blend (which implicitly
 * assumes zero velocity at both ends), this can start and end at whatever
 * the real, non-zero velocities actually are, so there's no hidden
 * "velocity must be near zero here" assumption baked into the curve. */
const hermite = (
  p0: number,
  v0: number,
  p1: number,
  v1: number,
  t: number,
) => {
  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  return h00 * p0 + h10 * v0 + h01 * p1 + h11 * v1;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

type DragMode = "orbit" | "dragging" | "released" | "landing";

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

/** The inverse of orbitPosition: given where an object currently is, which
 * angle on its own ellipse is it nearest to? Normalizes its offset from
 * centre into the ellipse's own circular coordinate space (divide by
 * rx/ry) and reads the angle off there. Used both as a released object's
 * own live magnet target and, for a neighbor, as a stand-in for "where is
 * it heading" even before that neighbor has actually captured onto its
 * curve -- an object mid-flight doesn't have a meaningful "settled angle"
 * yet, but it does always have a nearest point on its own ellipse. */
function nearestOrbitAngle(o: {
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  ry: number;
}) {
  const centreX = o.x + o.width / 2;
  const centreY = o.y + o.height / 2;
  const u = (centreX - CENTRE) / o.rx;
  const v = (centreY - CENTRE) / o.ry;
  return Math.atan2(v, u);
}

/** Maximum tilt at the object's own edge, degrees. Scales down toward 0 at centre. */
const MAX_TILT = 8;

/** Mirrors the plate's own `max-md:scale-[1.25]` Tailwind class -- same
 * breakpoint as OBJECT_SIZES above. Forcing the plate's scale during a
 * drag/throw (to hold off the hover-jiggle, see onDragStart) needs to
 * match whatever the CSS cascade would otherwise be giving it, or grabbing
 * an object below this breakpoint would visibly shrink it from 1.25x down
 * to 1x for the whole flight, then pop back up once it settles. */
const MOBILE_SCALE_QUERY = "(max-width: 768px)";
const MOBILE_SCALE = "1.25";
const DESKTOP_SCALE = "1";

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
    // so the loop never triggers a re-render. angle/rx/ry/spin drive the
    // underlying orbit; mode/x/y/vx/vy drive what's actually rendered --
    // including while "released", where x/y/vx/vy are a single continuous
    // physics sim (momentum + bounce + a gentle pull toward the nearest
    // point on this object's own ellipse), not two things blended together.
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
        landingMs: 0,
        landingFromX: 0,
        landingFromY: 0,
        landingFromVX: 0,
        landingFromVY: 0,
        landingToX: 0,
        landingToY: 0,
        landingToVX: 0,
        landingToVY: 0,
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
        // :hover tracks real cursor position, not pointer capture, so while
        // dragging or bouncing back from a throw the object can pass back
        // under a cursor that never moved and re-trigger :hover, which
        // reads as a jiggle riding on top of the throw. Hold it flat until
        // it's genuinely idle again -- flat meaning this breakpoint's own
        // base size, not always 1x (see MOBILE_SCALE above).
        const plate = plateRefs.current[i];
        if (plate) {
          plate.style.scale = window.matchMedia(MOBILE_SCALE_QUERY).matches
            ? MOBILE_SCALE
            : DESKTOP_SCALE;
        }
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
        const rawX = px - object.grabOffsetX;
        const rawY = py - object.grabOffsetY;
        object.x = clamp(rawX, BOUNDS_INSET, 1 - BOUNDS_INSET - object.width);
        object.y = clamp(rawY, BOUNDS_INSET, 1 - BOUNDS_INSET - object.height);

        const now = performance.now();
        // Record the *raw* pointer position, not the clamped one. If the
        // cursor drags past the frame edge, the rendered object pins at
        // the boundary while the raw cursor keeps moving -- recording the
        // clamped position would mean every sample near the edge reads as
        // "hasn't moved," zeroing out the computed throw velocity on
        // release even though the hand is still flicking. This is exactly
        // what made throws near an edge feel dead / elastic-band-like.
        object.dragHistory.push({ t: now, x: rawX, y: rawY });
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

        // Trimming during onDragMove only runs when a pointermove actually
        // fires -- if the cursor goes still for a while (no events) right
        // before release, old samples from earlier in the drag never get
        // aged out. Trim once more here, relative to the real release
        // instant, so a stale fast movement from well before a genuine
        // pause can't get mistaken for the throw.
        const releaseNow = performance.now();
        while (
          object.dragHistory.length > 1 &&
          releaseNow - object.dragHistory[0].t > DRAG_HISTORY_MS
        ) {
          object.dragHistory.shift();
        }

        // Peak speed across consecutive samples in the recent window, not
        // the net first-to-last displacement over it. A real flick has a
        // shape: accelerate, peak, then ease off before the fingers
        // actually let go of the button -- that easing-off is completely
        // normal and can easily take longer than DRAG_HISTORY_MS on its
        // own. First-to-last measures the *net* motion across the window,
        // so if the window happens to land entirely inside that easing-off
        // tail, it reads as barely having moved at all even though the
        // gesture a moment earlier was a real throw -- a dead-feeling
        // release exactly when the user was throwing hardest.
        const history = object.dragHistory;
        let peakVx = 0;
        let peakVy = 0;
        let peakSpeedSq = 0;
        for (let h = 1; h < history.length; h += 1) {
          const a = history[h - 1];
          const b = history[h];
          const stepDt = Math.max((b.t - a.t) / 1000, 1 / 240);
          const stepVx = (b.x - a.x) / stepDt;
          const stepVy = (b.y - a.y) / stepDt;
          const speedSq = stepVx * stepVx + stepVy * stepVy;
          if (speedSq > peakSpeedSq) {
            peakSpeedSq = speedSq;
            peakVx = stepVx;
            peakVy = stepVy;
          }
        }
        object.vx = clamp(peakVx, -MAX_FLING_SPEED, MAX_FLING_SPEED);
        object.vy = clamp(peakVy, -MAX_FLING_SPEED, MAX_FLING_SPEED);
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
      // repel, no momentum loop. Only the drag-and-snap-back above runs.
      return () => {
        dragCleanup.forEach((cleanup) => cleanup());
      };
    }

    // Pointer in container-fraction space, for the hover-repel below. -1
    // parks it outside the frame so nothing is repelled until the pointer
    // actually arrives.
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

      // There's no collision between objects -- the only thing that ever
      // reacts to anything is the cursor-repel below, and the cursor is
      // effectively wherever a dragged object is. Without this check,
      // carrying one object near an idle one would make the idle one dodge
      // the cursor sitting right on top of the object in your hand, which
      // reads as the two objects rejecting each other. Suppressed for the
      // whole frame while anything's being carried, so two objects can
      // actually be brought together.
      const anyDragging = state.some((object) => object.mode === "dragging");

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
          // Momentum: friction decay, integrate, bounce off the frame
          // edges. This alone is what makes the throw's own direction and
          // kinetics honest -- nothing above this point pulls it anywhere.
          // Where is "this object's own orbit" from right where it
          // currently is, and how fast would it naturally be moving there.
          // Computed once per frame, up front, and used by both friction
          // (below) and the magnet.
          //
          // Nudged away from a nearby neighbor's angle first, if one is too
          // close (see MIN_ORBIT_SEPARATION) -- applied continuously here,
          // not only at the final capture instant. All nine ellipses are
          // similar in size and share the same centre, so two objects
          // thrown into the same area can each independently compute a
          // "nearest point on my own ellipse" landing very close to the
          // other's; nudging only at capture would mean a correction
          // potentially many times larger than what the landing blend
          // (below) was sized for. Doing it here instead means the object
          // is already gravitating toward a clear stretch of its own curve
          // well before it arrives. Checked against every other object not
          // currently being dragged -- including ones still mid-flight
          // themselves, using nearestOrbitAngle as a stand-in for "where
          // it's heading" even before they've settled, since two objects
          // thrown close together in time are usually *both* still
          // in-flight when this matters and neither has a "real" angle yet.
          let nearestAngle = nearestOrbitAngle(object);
          let closestConflictAngle: number | null = null;
          let closestConflictDiff = Infinity;
          for (let j = 0; j < state.length; j += 1) {
            if (j === i || state[j].mode === "dragging") continue;
            const neighbor = state[j];
            // Two simultaneously in-flight objects checking against each
            // other's *current* (also still-moving) position is a mutual,
            // symmetric adjustment -- each one's target shifts in reaction
            // to the other's target shifting, which can chase into
            // convergence instead of apart rather than settling. Fixed by
            // a deterministic tiebreak: while both are mid-flight, only
            // the higher index yields, so information only ever flows one
            // way and there's nothing for either side to chase. An
            // already-orbiting neighbor is a fixed reference regardless of
            // index -- it isn't reacting to anything.
            if (neighbor.mode !== "orbit" && j > i) continue;
            const neighborAngle =
              neighbor.mode === "orbit"
                ? neighbor.angle
                : nearestOrbitAngle(neighbor);
            const rawDiff = nearestAngle - neighborAngle;
            const diff = Math.atan2(Math.sin(rawDiff), Math.cos(rawDiff));
            if (
              Math.abs(diff) < MIN_ORBIT_SEPARATION &&
              Math.abs(diff) < closestConflictDiff
            ) {
              closestConflictDiff = Math.abs(diff);
              closestConflictAngle =
                neighborAngle +
                (diff >= 0 ? MIN_ORBIT_SEPARATION : -MIN_ORBIT_SEPARATION);
            }
          }
          if (closestConflictAngle !== null) {
            nearestAngle = closestConflictAngle;
          }
          const nearest = orbitPosition({
            angle: nearestAngle,
            rx: object.rx,
            ry: object.ry,
            width: object.width,
            height: object.height,
          });
          const targetVx = -object.rx * Math.sin(nearestAngle) * object.spin;
          const targetVy = object.ry * Math.cos(nearestAngle) * object.spin;

          // Friction decays velocity toward that local cruising velocity,
          // not toward zero -- every object has its own cruising speed
          // (rx * spin), and decaying all the way to a standstill meant a
          // fast-cruising object would grind almost to a stop right before
          // landing, then have to speed back up to rejoin, reading as a
          // spring rather than a natural settle. This still bleeds off
          // the throw's excess energy exactly as before (the *difference*
          // from cruising velocity decays exponentially), it just settles
          // on "moving at its own pace" instead of "stopped."
          const frictionDecay = Math.exp(-FRICTION_RATE * dt);
          object.vx = targetVx + (object.vx - targetVx) * frictionDecay;
          object.vy = targetVy + (object.vy - targetVy) * frictionDecay;

          // The magnet: a pull toward the nearest point on the curve, not
          // toward any specific advancing phase. Since the ellipse spans
          // most of the frame already, this is usually a small correction,
          // and because the target is derived from the object's own
          // current position rather than an independently moving clock, it
          // has nothing to chase -- once close, it stays close, no
          // steady-state lag to fight. Only the radial distance from the
          // curve is corrected; tangential motion (drifting along it) is
          // completely untouched, which is what lets it rejoin at whatever
          // phase the throw happened to leave it near, rather than needing
          // to return to one fixed start point.
          const dx = nearest.x - object.x;
          const dy = nearest.y - object.y;
          object.vx += dx * MAGNET_K * dt;
          object.vy += dy * MAGNET_K * dt;

          object.x += object.vx * dt;
          object.y += object.vy * dt;

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

          x = object.x;
          y = object.y;

          // Close enough to the line and moving close enough to that
          // line's own local pace (not to a standstill) that finishing the
          // approach can be a brief blend instead of a hard cut -- pick up
          // the spin from the angle it actually arrived at, not any fixed
          // start. Being at the right *speed* doesn't guarantee *direction*
          // was already aligned with the ellipse's tangent there, so this
          // hands off to "landing" rather than jumping straight into
          // fixed-rate orbital motion.
          if (
            Math.hypot(dx, dy) < SETTLE_DISTANCE &&
            Math.hypot(object.vx - targetVx, object.vy - targetVy) < SETTLE_SPEED
          ) {
            // Capture both endpoints once, up front: where/how fast it
            // actually is right now (its real velocity, not zero), and
            // where/how fast the orbit will naturally be after LANDING_MS
            // more -- computed analytically from the angle it'll have
            // advanced to by then, at this object's own cruising speed
            // (which varies a lot: some objects run faster than
            // SETTLE_SPEED itself). nearestAngle already accounts for
            // nearby orbiting neighbors (see above), so there's no
            // separate spacing correction needed here. The Hermite blend
            // below then owns getting from one endpoint to the other
            // without inventing a zero-velocity moment at either end.
            const durationSec = LANDING_MS / 1000;
            const angleAtLandingEnd = nearestAngle + object.spin * durationSec;
            const landingEnd = orbitPosition({
              angle: angleAtLandingEnd,
              rx: object.rx,
              ry: object.ry,
              width: object.width,
              height: object.height,
            });
            object.landingFromX = object.x;
            object.landingFromY = object.y;
            object.landingFromVX = object.vx;
            object.landingFromVY = object.vy;
            object.landingToX = landingEnd.x;
            object.landingToY = landingEnd.y;
            object.landingToVX = -object.rx * Math.sin(angleAtLandingEnd) * object.spin;
            object.landingToVY = object.ry * Math.cos(angleAtLandingEnd) * object.spin;
            object.landingMs = 0;
            // The angle keeps advancing at the top of the loop every
            // frame regardless of mode, so setting it to nearestAngle now
            // means it'll have naturally reached angleAtLandingEnd by the
            // time landing's timer runs out -- landingToX/Y/VX/VY above
            // were computed assuming exactly that.
            object.angle = nearestAngle;
            object.mode = "landing";
          }
        } else if (object.mode === "landing") {
          // Both endpoints (position AND velocity) were captured once, at
          // the moment landing began -- this just reads the curve between
          // them. Real incoming velocity in, this object's own real
          // cruising velocity out, whatever that happens to be.
          object.landingMs += dt * 1000;
          const t = clamp(object.landingMs / LANDING_MS, 0, 1);
          const durationSec = LANDING_MS / 1000;
          x = hermite(
            object.landingFromX,
            object.landingFromVX * durationSec,
            object.landingToX,
            object.landingToVX * durationSec,
            t,
          );
          y = hermite(
            object.landingFromY,
            object.landingFromVY * durationSec,
            object.landingToY,
            object.landingToVY * durationSec,
            t,
          );

          if (t >= 1) {
            object.mode = "orbit";
            object.vx = 0;
            object.vy = 0;
            const plate = plateRefs.current[i];
            if (plate) plate.style.scale = "";
          }
        } else {
          ({ x, y } = orbitPosition(object));

          // Soft repel: falls off linearly to zero at REPEL_RADIUS so
          // objects ease away from the cursor instead of snapping.
          if (pointer.active && !anyDragging) {
            const centreX = x + object.width / 2;
            const centreY = y + object.height / 2;
            const rdx = centreX - pointer.x;
            const rdy = centreY - pointer.y;
            const distance = Math.hypot(rdx, rdy);

            if (distance > 0.0001 && distance < REPEL_RADIUS) {
              const falloff = 1 - distance / REPEL_RADIUS;
              const scale = (falloff * REPEL_STRENGTH) / distance;
              x += rdx * scale;
              y += rdy * scale;
            }
          }
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
      frame.removeEventListener("pointermove", onPointerMove);
      frame.removeEventListener("pointerleave", onPointerLeave);
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
        {/* Name lockup. Always on top of every hero object, in every mode
            (idle, hovered, dragged, thrown) -- objects used to only pull
            above it on hover, but a thrown object settling back into orbit
            while it happened to be over the text made it flicker behind
            mid-flight. One fixed rule with no exceptions reads as
            intentional instead. Ignores the pointer so it never blocks
            anything. */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 w-full -translate-x-1/2 -translate-y-1/2 px-6 text-center">
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
