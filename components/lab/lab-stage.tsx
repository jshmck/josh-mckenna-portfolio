"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { scatter, type Box, type Placement } from "@/lib/lab";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

/** A press that travels further than this (px) is a drag or a scroll, not a click. */
const CLICK_SLOP = 8;
/** A press held longer than this (ms) isn't a click either. */
const CLICK_MAX_MS = 600;
/** Gap between neighbours in the shuffle glide and the entrance (ms). */
const SHUFFLE_STAGGER_MS = 22;
/** Mirrors the glide's duration in `.lab-stage[data-glide]` (globals.css). */
const GLIDE_MS = 700;
/** Give up waiting for artwork to decode after this long, rather than leave
 *  the stage empty on a slow connection (ms). */
const READY_TIMEOUT_MS = 1500;

/** 0..n-1 in random order. */
function shuffled(n: number) {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * The /lab stage: owns every interaction, writes everything straight to the
 * DOM, and renders nothing of its own but the frame. Its children (the items
 * and the labels) are server-rendered; this finds the items by
 * `data-lab-item` and the shuffle control by `data-lab-shuffle`, so none of
 * them needs a React handler and nothing here ever re-renders.
 *
 * - Drag: pick a piece up and put it down, and it stays. It jumps to the
 *   front on pickup. There is no momentum on purpose; the homepage hero
 *   is the throwable one, this page is the one where things stay put.
 * - Shuffle: the `shuffle` button, or a click on empty stage. Every piece
 *   glides to a new spot, tilt and stacking order.
 * - First paint is the server's fixed, seeded layout with every piece hidden;
 *   on mount the browser scatters for real (the only Math.random on the
 *   page, in an effect, so nothing can mismatch hydration), waits for the
 *   artwork, then lets the pieces rise in.
 *
 * Reduced motion: dragging stays (a direct drag isn't autoplay motion, same
 * call as the hero). The glide and the entrance are CSS and the global rule
 * flattens them; the one thing that rule can't touch is a transition-delay,
 * so the stagger is skipped here when the preference is set.
 */
export function LabStage({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reduced = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-lab-item]"),
    );
    // Stacking order counts up from here; the field it lives in is its own
    // stacking context (see page.tsx), so it can climb without ever
    // overtaking the labels.
    let topZ = items.length;

    const place = (el: HTMLElement, p: Placement) => {
      el.style.setProperty("--fx", String(p.fx));
      el.style.setProperty("--fy", String(p.fy));
      el.style.setProperty("--rot", `${p.rot}deg`);
      el.style.zIndex = String(p.z);
    };

    // The glide is only switched on for the length of a shuffle (see the
    // `.lab-stage[data-glide]` comment in globals.css for why not always).
    let glideTimer = 0;

    /** Scatter every piece to fresh random spots. `glide` false snaps them
     *  there (the first scatter, before anything is visible). */
    const scatterAll = (glide: boolean) => {
      const boxes: Box[] = items.map((el) => ({
        w: el.offsetWidth,
        h: el.offsetHeight,
        tilt: Number(el.dataset.labTilt) || 0,
      }));
      // The labels' real rectangles, so the scatter steers around them at
      // any size (a phone's "mckenna" is three quarters of the width).
      const stageRect = stage.getBoundingClientRect();
      const zones = Array.from(
        stage.querySelectorAll<HTMLElement>("[data-lab-zone]"),
      ).map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - stageRect.left, y: r.top - stageRect.top, w: r.width, h: r.height };
      });
      const layout = scatter(
        boxes,
        { w: stage.clientWidth, h: stage.clientHeight },
        Math.random,
        zones,
      );
      const order = shuffled(items.length);
      const stagger = glide && !reduced();
      if (glide) {
        stage.dataset.glide = "";
        window.clearTimeout(glideTimer);
        glideTimer = window.setTimeout(() => {
          delete stage.dataset.glide;
          // The stagger delays go too: a zero-duration transition with a
          // non-zero delay still *starts*, so a leftover `--td` would make a
          // later window resize snap the pieces late, one by one.
          items.forEach((el) => el.style.removeProperty("--td"));
        }, GLIDE_MS + items.length * SHUFFLE_STAGGER_MS + 100);
      }
      items.forEach((el, i) => {
        if (stagger) el.style.setProperty("--td", `${order[i] * SHUFFLE_STAGGER_MS}ms`);
        else el.style.removeProperty("--td");
        place(el, layout[i]);
      });
      topZ = items.length;
    };

    // --- Drag -------------------------------------------------------------
    let drag: { el: HTMLElement; id: number; offX: number; offY: number } | null =
      null;
    // A press on empty stage: becomes a shuffle if it comes up still and quick.
    let press: { id: number; x: number; y: number; t: number } | null = null;

    const endDrag = () => {
      if (!drag) return;
      const { el, id } = drag;
      drag = null;
      delete el.dataset.held;
      // Hands the glide back to the stylesheet. The position vars haven't
      // changed, so nothing animates: it simply stays where it was dropped.
      el.style.transition = "";
      try {
        el.releasePointerCapture(id);
      } catch {
        // Already released, e.g. the window lost it.
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (drag) return;
      const target = event.target as Element;
      const el = target.closest<HTMLElement>("[data-lab-item]");

      if (el && stage.contains(el)) {
        event.preventDefault();
        el.setPointerCapture(event.pointerId);
        const rect = el.getBoundingClientRect();
        drag = {
          el,
          id: event.pointerId,
          offX: event.clientX - rect.left,
          offY: event.clientY - rect.top,
        };
        el.dataset.held = "";
        // Instant while held; a leftover shuffle stagger would lag the lift.
        el.style.transition = "none";
        el.style.removeProperty("--td");
        topZ += 1;
        el.style.zIndex = String(topZ);
        return;
      }

      // Links and the shuffle button handle themselves.
      if (target.closest("a, button")) return;
      press = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        t: performance.now(),
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      if (
        press &&
        event.pointerId === press.id &&
        Math.hypot(event.clientX - press.x, event.clientY - press.y) > CLICK_SLOP
      ) {
        press = null;
      }

      if (!drag || event.pointerId !== drag.id) return;
      // The button came up somewhere no pointerup reaches (outside the
      // window); this move only arrived because the cursor wandered back.
      if (event.pointerType === "mouse" && (event.buttons & 1) === 0) {
        endDrag();
        return;
      }

      const { el } = drag;
      const rect = stage.getBoundingClientRect();
      const freeW = rect.width - el.offsetWidth;
      const freeH = rect.height - el.offsetHeight;
      const x = event.clientX - rect.left - drag.offX;
      const y = event.clientY - rect.top - drag.offY;
      el.style.setProperty("--fx", String(freeW > 0 ? clamp(x / freeW, 0, 1) : 0));
      el.style.setProperty("--fy", String(freeH > 0 ? clamp(y / freeH, 0, 1) : 0));
    };

    const onPointerUp = (event: PointerEvent) => {
      if (drag && event.pointerId === drag.id) endDrag();
      if (press && event.pointerId === press.id) {
        const quick = performance.now() - press.t < CLICK_MAX_MS;
        press = null;
        if (quick) scatterAll(true);
      }
    };

    const onPointerCancel = (event: PointerEvent) => {
      if (drag && event.pointerId === drag.id) endDrag();
      if (press && event.pointerId === press.id) press = null;
    };

    const onLostCapture = (event: PointerEvent) => {
      if (drag && event.pointerId === drag.id) endDrag();
    };

    const onClick = (event: MouseEvent) => {
      if (drag) return;
      if ((event.target as Element).closest("[data-lab-shuffle]")) scatterAll(true);
    };

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerCancel);
    stage.addEventListener("lostpointercapture", onLostCapture);
    stage.addEventListener("click", onClick);

    // --- First paint ------------------------------------------------------
    let cancelled = false;
    let readyTimer = 0;

    // No glide here: it's off by default, so the pieces snap straight from
    // the server's layout to the random one while still invisible.
    scatterAll(false);
    const entrance = shuffled(items.length);
    items.forEach((el, i) => {
      if (reduced()) el.style.removeProperty("--i");
      else el.style.setProperty("--i", String(entrance[i]));
    });

    // Rise in once the artwork has decoded, not while it is still arriving
    // (pieces would pop in half-drawn). Only what is actually on screen is
    // waited for, and never for longer than READY_TIMEOUT_MS.
    const visible = Array.from(stage.querySelectorAll<HTMLImageElement>("img")).filter(
      (img) => img.offsetParent !== null,
    );
    const decoded = Promise.all(
      visible.map((img) => img.decode().catch(() => undefined)),
    );
    const timeout = new Promise<void>((resolve) => {
      readyTimer = window.setTimeout(resolve, READY_TIMEOUT_MS);
    });
    void Promise.race([decoded, timeout]).then(() => {
      if (!cancelled) stage.dataset.ready = "";
    });

    return () => {
      cancelled = true;
      window.clearTimeout(readyTimer);
      window.clearTimeout(glideTimer);
      endDrag();
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerCancel);
      stage.removeEventListener("lostpointercapture", onLostCapture);
      stage.removeEventListener("click", onClick);
    };
  }, []);

  return (
    // A size container (cqw/cqh/cqmin for the items), exactly one viewport
    // tall under the sticky nav, whose in-flow height is 88px on phones and
    // 100px from md (measured, nav.tsx's own comments still say 88 for both).
    // overflow-hidden so a tilted or gliding piece can never cause a sideways
    // scrollbar. No padding or border: container units measure the content
    // box, and the drag maths assumes the stage is exactly that box.
    <div
      ref={stageRef}
      className="lab-stage group/stage relative isolate h-[calc(100svh-5.5rem)] min-h-[34rem] w-full select-none overflow-hidden bg-canvas [container-type:size] md:h-[calc(100svh-6.25rem)]"
    >
      {children}
    </div>
  );
}
