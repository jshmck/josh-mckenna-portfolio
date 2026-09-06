"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

import type { LightboxState } from "@/components/work/lightbox-core";
import type { ProjectImage } from "@/lib/projects";

/** Same thresholds as ProjectSwipeNav (components/work/project-swipe-nav.tsx)
 *  — kept as separate constants rather than a shared import since the two
 *  gestures live on genuinely different surfaces (this one paging through
 *  a single project's own images; that one moving between projects) and
 *  have no reason to be forced to the same numbers if either needs tuning
 *  later. */
const SWIPE_DISTANCE = 64;
const SWIPE_DOMINANCE = 1.5;

function ratioToNumber(ratio: string) {
  const [w, h] = ratio.split("/").map(Number);
  return w / h;
}

/** Shared by every lightbox control (close, prev, next) so hover/press
 *  states can't drift between HeroLightbox, ImageStack, GalleryGrid and
 *  PosterGrid. Bare glyphs now, no container and no frost -- "lightbox
 *  nav bar needs rethinking too - no frost bubble... I dont want the
 *  bubbly frost nav bars to live anywhere but the header," per Josh,
 *  retiring the toolbar pill (a byte-for-byte clone of the header's
 *  centre pill, nav-pill bounces and all) this class used to style.
 *  Mono, matching the breadcrumb line's own < > arrows so every bare
 *  chevron on the site speaks one caption voice; ink at rest on the
 *  canvas backdrop; brand blue + a small scale on hover/tap ("lets have
 *  the hover colour blue," per Josh -- kept from the pill era, it's a
 *  colour choice, not pill chrome). p-3 grows each tap target well past
 *  the glyph; the absolute positions below place the padded box, so no
 *  negative margins are needed to compensate. z-20 -- these sit as
 *  siblings of the open image's own z-10 stage (added for the
 *  drag-follow peeks to tuck behind, see the stage div below), and a
 *  positioned sibling with no z-index of its own paints BEHIND an
 *  explicit z-10 regardless of DOM order. Without this every control
 *  went invisible under any image that reached its corner: the counter
 *  and the × both reported cut off by the picture. */
const LIGHTBOX_BUTTON_CLASS =
  "z-20 p-3 font-mono text-ink transition-[color,transform] duration-200 ease-in-out hover:scale-110 hover:text-brand hover:duration-300 hover:ease-drift active:scale-110 active:text-brand";

/** Tracks the viewport size live (mount + resize) so the stage can size
 *  itself in real pixels rather than through nested CSS var()/calc()/min()
 *  — that combination turned out unreliable in the field (consistent in
 *  every automated test at every viewport size, but not in at least one
 *  real browser session), so the shared-height math now happens in JS
 *  where it's directly inspectable, instead of trusting the CSS engine to
 *  resolve a custom property through several layers of nested functions.
 *
 * Prefers `window.visualViewport` over `window.innerWidth`/`innerHeight`
 * when it exists, and listens to its own `resize` event rather than
 * `window`'s -- iOS Safari's address bar/toolbar collapsing or expanding
 * (which a scroll gesture can trigger) changes the *visual* viewport
 * without reliably firing a plain `window resize`, so the stage's height
 * math could go stale mid-session against a `window.innerHeight` that
 * hadn't caught up. Real body-scroll locking (see lightbox-core.tsx)
 * stops that scroll from starting in the first place now, but tracking
 * visualViewport directly is the more robust fix either way -- it's the
 * API iOS Safari actually updates for exactly this case. */
function useViewportSize() {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () =>
      setSize(
        viewport
          ? { width: viewport.width, height: viewport.height }
          : { width: window.innerWidth, height: window.innerHeight },
      );
    update();
    if (viewport) {
      viewport.addEventListener("resize", update);
      return () => viewport.removeEventListener("resize", update);
    }
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

type LightboxOverlayProps = {
  state: LightboxState;
  /** rounded-frame everywhere on the site, matching every other frame —
   *  PosterGrid passes "" instead: its posters carry their own printed
   *  border baked into the artwork, and rounding would clip across that
   *  border's hard corners at an angle. */
  radius?: string;
  /** "uniform" (default) forces every frame in the cycle to the exact
   *  shared height, even if that upscales a lower-res source. "natural"
   *  never enlarges past the file's own pixels — PosterGrid's mode,
   *  preserving Josh's earlier call for Beefbar's low-res New York
   *  poster (see PosterGrid's own comment). */
  fit?: "uniform" | "natural";
};

/** The click-to-enlarge dialog shared by every image lightbox on the site.
 *  Fixed stage — same footprint for every image, so paging never resizes
 *  the frame. Every photo in the cycle also renders at the same HEIGHT as
 *  every other, not just the same stage — capped to whatever height still
 *  lets the widest-ratio image in this cycle fit the width budget (see
 *  `stageMaxRatio` below), so a landscape frame doesn't look shrunken next
 *  to a square or portrait one. Only the inner wrapper remounts per
 *  navigation (key={openIndex}); the stage itself never does. */
export function LightboxOverlay({ state, radius = "rounded-frame", fit = "uniform" }: LightboxOverlayProps) {
  const { openImage, openIndex, direction, images, close, goPrev, goNext } = state;
  const viewport = useViewportSize();

  // Touch paging — "Lightbox has to be swipable on mobile," per Josh. A
  // ref, not state — this is gesture bookkeeping between touch events,
  // never rendered on its own, so it doesn't need to be state React
  // tracks.
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  // Which axis this drag committed to, decided once the touch has moved
  // far enough to tell — swipe-down-to-close needs a live drag-follow
  // (pull the frame with your thumb, fade it out, release to dismiss —
  // "allow a pull to close... swipe the image down and it closes the
  // window," per Josh, reported after the dialog got stuck on mobile with
  // no way to dismiss it) but horizontal paging doesn't, so the two can't
  // share one branch. Locked on first significant move so a diagonal
  // finger drift mid-gesture can't flip from one to the other.
  const dragAxisRef = useRef<"vertical" | "horizontal" | null>(null);
  const dragImageRef = useRef<HTMLDivElement>(null);
  // Live-follow peeks for the neighbouring images, revealed from the
  // trailing edge as the current frame drags away — same front/back
  // relationship ProjectStackSwipe uses for project-to-project swipes
  // ("similar feel to project swipe," per Josh), just scoped to one image
  // inside the modal instead of a whole page, and tuned to settle much
  // faster (PAGE_SETTLE_MS vs. that component's 420-500ms) since there's
  // far less happening on screen to justify the same lingering animation.
  const prevPeekRef = useRef<HTMLDivElement>(null);
  const nextPeekRef = useRef<HTMLDivElement>(null);
  const horizontalCapturedRef = useRef(false);
  const horizontalDirectionRef = useRef<"prev" | "next" | null>(null);
  const PULL_TO_CLOSE_DISTANCE = 120;
  const PAGE_SETTLE_MS = 200;

  // Focus management for the dialog (a11y audit 2026-09-06, WCAG 2.4.3 /
  // dialog pattern). aria-modal="true" promises AT that everything
  // outside the dialog is out of play — a promise only kept if focus
  // actually MOVES into the dialog on open, stays inside while it's up,
  // and returns to the trigger on close. None of that is automatic for a
  // hand-rolled dialog: without this, focus stayed on the page trigger
  // behind the backdrop and Tab walked the covered page's controls while
  // the "modal" was showing.
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const isOpen = openImage !== null;

  useEffect(() => {
    if (!isOpen) return;
    // The element that opened the dialog (an "Open larger view" button),
    // captured before focus moves so close can hand focus straight back.
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Focus the dialog root itself (tabIndex={-1} below): screen readers
    // announce its aria-label (the open image's alt) on arrival, and the
    // first Tab lands on the first control. Focusing a specific button
    // instead would skip that announcement.
    dialogRef.current?.focus();
    return () => {
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
    };
  }, [isOpen]);

  /** Wrap Tab/Shift+Tab inside the dialog — the portal renders as a body
   *  child, so without this Tab walks straight out into the page behind
   *  the backdrop. */
  const trapTab = (event: React.KeyboardEvent) => {
    if (event.key !== "Tab") return;
    const root = dialogRef.current;
    if (!root) return;
    // Filter to VISIBLE controls — a hidden element can't take focus,
    // so wrapping onto one would silently drop the trap. (Nothing in
    // the dialog is currently ever hidden, but this guard is what made
    // the interim two-breakpoint arrow sets safe and it stays as cheap
    // insurance for the next responsive control.)
    const focusables = [
      ...root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((el) => el.getClientRects().length > 0);
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey) {
      if (active === first || active === root) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || active === root) {
      event.preventDefault();
      first.focus();
    }
  };

  // A drag-committed page already animates the incoming peek all the way
  // into its resting position during the 200ms settle below — by the time
  // goNext/goPrev swaps openIndex, the peek IS the new open image, just
  // one layer underneath (z-0) where the stage (z-10) is about to take
  // over, so the peek stays put as the stand-in until the stage's own img
  // has decoded (see the layout effect below). While the hold is on, the
  // stage's entrance keyframe is also cancelled — replaying the slide the
  // peek just finished is what originally read as "the next image slides
  // under the current".
  //
  // State, not a ref, and specifically the OLD openIndex rather than a
  // boolean: the peeks' own content (prevImage/nextImage below) has to
  // keep deriving from the pre-swap index for as long as the hold lasts.
  // A first cut kept the peek element visible but let its props recompute
  // from the new index in the same render as the swap — so the visibly
  // held peek's src flipped to the NEXT neighbour along while it was
  // still centred on screen, showing the following image early or a
  // blank while that wrong file fetched ("some blank some repeated," per
  // Josh). Deriving the peeks from heldIndex ?? openIndex keeps the held
  // peek painting exactly the frame it settled on until the stage
  // underneath is ready to take over.
  const [heldIndex, setHeldIndex] = useState<number | null>(null);

  // Same two-segment "stuck, then free" resistance as ProjectStackSwipe's
  // own resist() (project-stack-swipe.tsx) — kept as a separate, smaller-
  // stick copy rather than a shared import: this drag only ever travels a
  // fraction of the project swipe's distance before it settles, so a
  // shorter stick phase reads as responsive here where the project swipe's
  // own would read as sluggish.
  const resistX = (delta: number) => {
    const STICK = 24;
    const STICK_RATE = 0.3;
    const FREE_RATE = 0.95;
    const sign = Math.sign(delta);
    const magnitude = Math.abs(delta);
    if (magnitude <= STICK) return sign * magnitude * STICK_RATE;
    return sign * (STICK * STICK_RATE + (magnitude - STICK) * FREE_RATE);
  };

  // var(--ease-bounce), not ease-drift — "there needs to be some
  // elasticity or something like on Apple's Photo app," per Josh: a
  // springy overshoot on the way back reads as the frame settling into
  // place rather than just stopping, both for a cancelled pull-to-close
  // and for a horizontal page-drag that didn't clear the swipe threshold.
  const resetDragTransform = (animate: boolean) => {
    const el = dragImageRef.current;
    if (!el) return;
    el.style.transition = animate
      ? "transform 380ms var(--ease-bounce), opacity 250ms ease-out"
      : "none";
    el.style.transform = "";
    el.style.opacity = "";
  };

  const resetPeek = (el: HTMLDivElement | null, side: "prev" | "next", animate: boolean) => {
    if (!el) return;
    const restSign = side === "next" ? 1 : -1;
    el.style.transition = animate
      ? `transform ${PAGE_SETTLE_MS}ms var(--ease-bounce), opacity ${PAGE_SETTLE_MS}ms ease-out`
      : "none";
    el.style.transform = `translate3d(${restSign * 100}%, 0, 0)`;
    el.style.opacity = "0";
  };

  // Runs after React has committed a navigation but before the browser
  // paints it. For click/keyboard navigation (no hold) this just resets
  // the peeks/slab from any leftover drag styles — a near-no-op. For a
  // drag-committed page (heldIndex set) it cancels the stage's entrance
  // keyframe pre-paint (inline animation:none — it persists on the
  // element across the release re-render, so the animation class coming
  // back can't restart the slide) and then waits for the stage's new
  // <img> to report decoded before hiding the held peek and releasing
  // the hold. The stage's key={openIndex} remount mounts a brand-new
  // <img>, and even with the file already in cache from the peek, its
  // first paint waits on a fresh decode — a frame or two of transparent
  // stage that read as "a light flash of white" whenever the peek was
  // hidden any earlier than this. decode() resolves in a micro-beat for
  // a cached file; the timeout is a belt-and-braces cap so a decode that
  // never settles (or an <img> that never appears) can't strand the peek
  // over the stage forever. Cleanup only cancels — it never settles —
  // so a rapid follow-up swipe can't null out the hold it just started.
  useLayoutEffect(() => {
    const slab = dragImageRef.current;
    if (slab) {
      slab.style.transition = "none";
      slab.style.transform = "";
    }
    const resetPeeks = () => {
      resetPeek(prevPeekRef.current, "prev", false);
      resetPeek(nextPeekRef.current, "next", false);
    };
    if (heldIndex === null) {
      resetPeeks();
      return;
    }
    if (slab) slab.style.animation = "none";
    let done = false;
    const settle = () => {
      if (done) return;
      done = true;
      resetPeeks();
      setHeldIndex(null);
    };
    const img = slab?.querySelector("img");
    if (img) img.decode().then(settle, settle);
    const cap = window.setTimeout(settle, img ? 600 : 0);
    return () => {
      done = true;
      window.clearTimeout(cap);
    };
  }, [openIndex, heldIndex]);

  // 1:1 with the finger (no separate parallax discount) — direct tracking
  // reads as quicker/snappier than a catch-up-style reveal, which is the
  // whole point of this pass over the old release-only paging.
  const setPeekTransform = (el: HTMLDivElement | null, resisted: number, side: "prev" | "next", vw: number) => {
    if (!el) return;
    const restSign = side === "next" ? 1 : -1;
    el.style.transition = "none";
    el.style.transform = `translate3d(${restSign * vw + resisted}px, 0, 0)`;
    el.style.opacity = "1";
  };

  // Pinch/double-tap zoom — "zooming does some crazy stuff, would be cool
  // to be able to zoom within reason," per Josh: there was no custom zoom
  // handling at all before this, so a pinch fell through to the browser's
  // own page-zoom, which fights a `position: fixed` dialog (the stage
  // resizes off `visualViewport`, so a native zoom mid-gesture warps the
  // stage's own layout under it). `touch-none` on the dialog (below) turns
  // that native behaviour off entirely so this is the only zoom in play.
  // Refs, not state — same rule as every other motion primitive here, a
  // pinch has to track fingers 1:1, which a React re-render per touchmove
  // can't guarantee.
  const ZOOM_MIN = 1;
  const ZOOM_MAX = 4;
  const DOUBLE_TAP_SCALE = 2;
  const DOUBLE_TAP_MS = 300;
  // A pinch-out that ends the gesture near, but not exactly at, 1x reads
  // as "back to normal" to whoever did it — the very last touchmove
  // before a lifted finger rarely lands on the true endpoint, so a strict
  // `=== 1` (or `<= 1.01`) check left the image sitting at e.g. 1.02x
  // indefinitely, which is enough to make onTouchStart's "already zoomed"
  // branch keep routing every later single-finger swipe to panning instead
  // of closing/paging — a stuck gesture with no obvious way out short of
  // a deliberate double-tap. Anything at or below this threshold snaps
  // fully to identity instead of lingering.
  const ZOOM_SNAP_THRESHOLD = 1.08;
  const zoomRef = useRef({ scale: 1, x: 0, y: 0 });
  const pinchRef = useRef<{ startDistance: number; startScale: number } | null>(null);
  const panRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const lastTapRef = useRef(0);

  const applyZoomTransform = (animate: boolean) => {
    const el = dragImageRef.current;
    if (!el) return;
    const { scale, x, y } = zoomRef.current;
    el.style.transition = animate ? "transform 250ms var(--ease-bounce)" : "none";
    el.style.transform = scale === 1 && x === 0 && y === 0 ? "" : `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  };

  const resetZoom = (animate: boolean) => {
    zoomRef.current = { scale: 1, x: 0, y: 0 };
    applyZoomTransform(animate);
  };

  // Every navigation (including back to a previously-zoomed frame) opens
  // at 1x — matches Apple Photos' own paging behaviour, and means the
  // drag-follow/pull-to-close gestures above never have to account for a
  // stale zoom level left over from a different image.
  useEffect(() => {
    resetZoom(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex]);

  const onTouchStart = (event: React.TouchEvent) => {
    // A new touch landing while a decode-hold is still live (rapid
    // chained swipes) releases it immediately — otherwise the coming
    // drag would move peeks still derived from the pre-swap index. The
    // stage has had a settle animation's worth of time to decode by now,
    // so hiding the stand-in early is at worst a one-frame seam, where
    // dragging stale peeks would show entirely wrong neighbours.
    if (heldIndex !== null) {
      resetPeek(prevPeekRef.current, "prev", false);
      resetPeek(nextPeekRef.current, "next", false);
      setHeldIndex(null);
    }

    const target = event.target as Element;
    const excluded = !!target.closest("[data-lightbox-control]");

    if (event.touches.length === 2) {
      // Pinch start/continue — always wins over any single-finger swipe
      // bookkeeping in progress, so two fingers landing mid-drag cleanly
      // hands off to zooming instead of fighting it.
      const [t1, t2] = [event.touches[0], event.touches[1]];
      pinchRef.current = {
        startDistance: Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY),
        startScale: zoomRef.current.scale,
      };
      panRef.current = null;
      // A second finger landing mid-close/mid-page-drag pre-empts it —
      // clear any leftover opacity fade from that aborted gesture so
      // pinching doesn't inherit a half-transparent image.
      if (dragImageRef.current) dragImageRef.current.style.opacity = "";
      touchRef.current = null;
      dragAxisRef.current = null;
      horizontalCapturedRef.current = false;
      horizontalDirectionRef.current = null;
      return;
    }

    pinchRef.current = null;

    // Double-tap toggles between 1x and DOUBLE_TAP_SCALE — the other half
    // of "zoom within reason," for anyone whose thumb doesn't pinch.
    // Checked before the "already zoomed" pan branch below, deliberately
    // — otherwise a double-tap while zoomed in could never fire at all,
    // since every single-finger touchstart at scale > 1 would already
    // have been claimed as the start of a pan.
    const now = Date.now();
    if (!excluded && now - lastTapRef.current < DOUBLE_TAP_MS) {
      lastTapRef.current = 0;
      zoomRef.current =
        zoomRef.current.scale > ZOOM_SNAP_THRESHOLD
          ? { scale: 1, x: 0, y: 0 }
          : { scale: DOUBLE_TAP_SCALE, x: 0, y: 0 };
      applyZoomTransform(true);
      touchRef.current = null;
      dragAxisRef.current = null;
      panRef.current = null;
      return;
    }
    lastTapRef.current = now;

    if (zoomRef.current.scale > ZOOM_SNAP_THRESHOLD && !excluded) {
      // Already zoomed — a single finger pans the image instead of
      // closing/paging (those gestures only make sense at 1x).
      panRef.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
        originX: zoomRef.current.x,
        originY: zoomRef.current.y,
      };
      touchRef.current = null;
      dragAxisRef.current = null;
      return;
    }
    panRef.current = null;

    // Starting on a control is excluded — a tap-and-slight-drag on a
    // button shouldn't also register as a page-swipe/pull underneath it.
    touchRef.current = excluded ? null : { x: event.touches[0].clientX, y: event.touches[0].clientY };
    dragAxisRef.current = null;
    horizontalCapturedRef.current = false;
    horizontalDirectionRef.current = null;
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length === 2 && pinchRef.current) {
      const [t1, t2] = [event.touches[0], event.touches[1]];
      const distance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const scale = Math.min(
        ZOOM_MAX,
        Math.max(ZOOM_MIN, pinchRef.current.startScale * (distance / pinchRef.current.startDistance)),
      );
      zoomRef.current.scale = scale;
      if (scale === ZOOM_MIN) {
        zoomRef.current.x = 0;
        zoomRef.current.y = 0;
      }
      applyZoomTransform(false);
      return;
    }

    if (panRef.current) {
      const touch = event.touches[0];
      const vw = viewport?.width ?? window.innerWidth;
      const vh = viewport?.height ?? window.innerHeight;
      const scale = zoomRef.current.scale;
      // Clamped so the image can't pan past its own edge into empty space
      // — half the extra width/height the current scale adds beyond the
      // stage in each direction.
      const maxX = Math.max(0, (vw * (scale - 1)) / 2);
      const maxY = Math.max(0, (vh * (scale - 1)) / 2);
      zoomRef.current.x = Math.min(maxX, Math.max(-maxX, panRef.current.originX + (touch.clientX - panRef.current.x)));
      zoomRef.current.y = Math.min(maxY, Math.max(-maxY, panRef.current.originY + (touch.clientY - panRef.current.y)));
      applyZoomTransform(false);
      return;
    }

    const start = touchRef.current;
    if (!start) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (dragAxisRef.current === null) {
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) return;
      // Only a downward drag claims the vertical axis — an upward flick
      // (or any horizontal-dominant move) falls through to page-swiping.
      dragAxisRef.current =
        deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX) * SWIPE_DOMINANCE
          ? "vertical"
          : "horizontal";
    }

    if (dragAxisRef.current === "vertical") {
      const el = dragImageRef.current;
      if (!el) return;
      const drag = Math.max(0, deltaY);
      // Scales down as it's pulled away, on top of the existing fade —
      // the Apple Photos "falling away" read, not just a flat fade.
      const progress = Math.min(1, drag / 400);
      el.style.transition = "none";
      el.style.transform = `translateY(${drag}px) scale(${1 - progress * 0.12})`;
      el.style.opacity = `${Math.max(0.35, 1 - progress)}`;
      return;
    }

    // Horizontal — live drag-follow between images, the same finger-
    // tracked feel as the project-to-project swipe. The dominance test
    // (must beat vertical drift by SWIPE_DOMINANCE) runs once, right here
    // at capture, rather than being re-checked at release.
    if (images.length < 2 || openIndex === null) return;
    if (!horizontalCapturedRef.current) {
      if (Math.abs(deltaX) < Math.abs(deltaY) * SWIPE_DOMINANCE) return;
      horizontalCapturedRef.current = true;
      horizontalDirectionRef.current = deltaX < 0 ? "next" : "prev";
    }
    const hDirection = horizontalDirectionRef.current;
    if (!hDirection) return;
    const resisted = resistX(deltaX);
    const slab = dragImageRef.current;
    if (slab) {
      slab.style.transition = "none";
      slab.style.transform = `translateX(${resisted}px)`;
    }
    const vw = viewport?.width ?? window.innerWidth;
    setPeekTransform(hDirection === "next" ? nextPeekRef.current : prevPeekRef.current, resisted, hDirection, vw);
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (pinchRef.current || panRef.current) {
      if (event.touches.length >= 1 && zoomRef.current.scale > ZOOM_SNAP_THRESHOLD) {
        // A finger lifted but at least one remains (the common end of a
        // two-finger pinch) — hand off to single-finger panning instead of
        // ending the gesture, so the zoom doesn't visibly "let go".
        pinchRef.current = null;
        const touch = event.touches[0];
        panRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          originX: zoomRef.current.x,
          originY: zoomRef.current.y,
        };
        return;
      }
      pinchRef.current = null;
      panRef.current = null;
      if (zoomRef.current.scale <= ZOOM_SNAP_THRESHOLD) resetZoom(true);
      return;
    }

    const start = touchRef.current;
    const axis = dragAxisRef.current;
    touchRef.current = null;
    dragAxisRef.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (axis === "vertical") {
      if (deltaY > PULL_TO_CLOSE_DISTANCE) {
        const el = dragImageRef.current;
        if (el) {
          el.style.transition = "transform 220ms ease-in, opacity 220ms ease-in";
          el.style.transform = `translateY(${deltaY + 160}px) scale(0.78)`;
          el.style.opacity = "0";
        }
        window.setTimeout(close, 220);
      } else {
        resetDragTransform(true);
      }
      return;
    }

    const wasCaptured = horizontalCapturedRef.current;
    const hDirection = horizontalDirectionRef.current;
    horizontalCapturedRef.current = false;
    horizontalDirectionRef.current = null;
    if (!wasCaptured || !hDirection) return;

    const slab = dragImageRef.current;
    const peekEl = hDirection === "next" ? nextPeekRef.current : prevPeekRef.current;

    if (Math.abs(deltaX) >= SWIPE_DISTANCE) {
      // Committed — finish the drag the rest of the way off/on-screen
      // quickly, then swap the index once that's landed. Deliberately NOT
      // resetting the peek/slab transforms here in the same tick as the
      // index swap — that used to beat React's own re-render to the
      // screen, snapping the peek invisible before the new stage had
      // painted anything to replace it (see the effect above this
      // function for where that reset actually happens now, and why).
      const vw = viewport?.width ?? window.innerWidth;
      const sign = hDirection === "next" ? -1 : 1;
      if (slab) {
        slab.style.transition = `transform ${PAGE_SETTLE_MS}ms ease-out`;
        slab.style.transform = `translateX(${sign * vw}px)`;
      }
      if (peekEl) {
        peekEl.style.transition = `transform ${PAGE_SETTLE_MS}ms ease-out`;
        peekEl.style.transform = "translate3d(0, 0, 0)";
      }
      window.setTimeout(() => {
        // Same tick as the index swap so React batches them into one
        // render — the hold and the new openIndex must land together, or
        // the peeks would re-derive from the new index for a frame
        // before the hold takes effect (the exact bug heldIndex exists
        // to prevent, see its declaration).
        setHeldIndex(openIndex);
        if (hDirection === "next") goNext();
        else goPrev();
      }, PAGE_SETTLE_MS);
    } else {
      resetDragTransform(true);
      resetPeek(peekEl, hDirection, true);
    }
  };

  const onTouchCancel = () => {
    if (pinchRef.current || panRef.current) {
      pinchRef.current = null;
      panRef.current = null;
      if (zoomRef.current.scale <= ZOOM_SNAP_THRESHOLD) resetZoom(true);
      return;
    }
    touchRef.current = null;
    const axis = dragAxisRef.current;
    const hDirection = horizontalDirectionRef.current;
    dragAxisRef.current = null;
    horizontalCapturedRef.current = false;
    horizontalDirectionRef.current = null;
    resetDragTransform(true);
    if (axis === "horizontal" && hDirection) {
      resetPeek(hDirection === "next" ? nextPeekRef.current : prevPeekRef.current, hDirection, true);
    }
  };

  if (!openImage) return null;

  const STAGE_LONG_EDGE = 2000;
  const PORTRAIT_CLEARANCE = 108;

  // The widest ratio in this cycle sets the shared height ceiling — every
  // narrower/taller image in the same cycle has room to spare at that
  // height, so it renders at the same height too, rather than each frame
  // independently maximising into the stage and landing at whatever height
  // its own ratio happens to produce.
  const stageMaxRatio = Math.max(1, ...images.map((image) => ratioToNumber(image.ratio)));

  // Real pixel values, computed from a live-measured viewport — same
  // 97vw/2000px width cap and height reserve as the stage below, just
  // resolved in JS so every frame in the cycle is capped by the exact
  // same numbers instead of each one re-deriving them independently.
  // The reserve shrank when the bottom toolbar pill was retired (the
  // controls are bare glyphs overlaid at the corners/edges now, taking
  // no vertical band of their own): mobile keeps room for the dialog's
  // p-4 plus the small counter under the image, desktop just the p-4
  // and breathing room so a tall image doesn't crowd the top-right ×.
  // 768 is Tailwind's md, the same breakpoint the controls' own md:
  // classes switch at.
  const stageReserve = viewport && viewport.width >= 768 ? 96 : 72;
  const widthCapPx = viewport ? Math.min(viewport.width * 0.97, 2000) : 2000;
  const isMobileViewport = !!viewport && viewport.width < 768;

  // Inline pixel height for every stage-shaped box below (both peeks and
  // the real stage), falling back to their own CSS h-[calc(100vh-72px)]
  // class only for the first paint before useViewportSize's effect has
  // measured anything. From then on this is the single source of truth,
  // so the stage can never drift from the visualViewport math heightCapPx
  // above already uses for the image inside it. That drift was real: CSS
  // 100vh doesn't shrink the way visualViewport does when a mobile
  // browser's own toolbar is on screen, so the stage could render taller
  // than what's actually visible, pushing a tall image further down than
  // its own (correctly visualViewport-based) height math intended --
  // exactly the mismatch that let a tall image's frame crowd the
  // counter/close button despite their z-20 fix. "still doing it on the
  // taller images," per Josh.
  const stageStyle: React.CSSProperties | undefined = viewport
    ? { height: viewport.height - stageReserve }
    : undefined;

  // Every frame in the cycle (the open image, and the live drag-follow
  // peeks either side of it) runs through this same sizing math, factored
  // out so the peeks can never drift from what the "real" open image would
  // render at once paging lands on them.
  const computeFrame = (image: ProjectImage) => {
    const ratio = ratioToNumber(image.ratio);
    const imgWidth = ratio >= 1 ? STAGE_LONG_EDGE : Math.round(STAGE_LONG_EDGE * ratio);
    const imgHeight = ratio >= 1 ? Math.round(STAGE_LONG_EDGE / ratio) : STAGE_LONG_EDGE;
    // Below md, the shared-cycle ratio above stops being a helpful ceiling
    // and starts being a bug: a single wide outlier elsewhere in the same
    // project (Pride Sticker's 16/9 sticker-set shot, say) forces every
    // *portrait* image in that cycle down to whatever height the outlier
    // implies at mobile's own narrow width budget — divide a ~380px width
    // by a 1.78 ratio and the shared ceiling is ~212px, so a 9/16 photo
    // renders barely bigger than a thumbnail. "make sure lightbox opens
    // fully on mobile," per Josh. Desktop's widthCapPx is generous enough
    // (up to 2000px) that the same math never crushes an image this badly,
    // so the cycle-wide ceiling stays there, keeping the "frame doesn't
    // resize between images" behaviour the comment above describes intact
    // where it actually works. Below md, size from each image's own ratio
    // instead — the frame can resize between images now, but an image
    // that fills the screen beats one that reads as broken. No
    // Math.max(1, …) floor on the mobile branch, unlike stageMaxRatio
    // above — a portrait ratio *below* 1 is exactly what should widen the
    // resulting box (dividing by a smaller ratio yields a taller
    // heightCapPx), which is the whole point for a 9/16 photo; flooring it
    // to 1 here would just reproduce a smaller version of the same bug.
    const heightRatio = isMobileViewport ? ratio : stageMaxRatio;
    // Extra clearance beyond stageReserve, mobile only -- "the lifeguard
    // images are still cutting into the nav, maybe reduce just those
    // images," per Josh (twice -- the first cut of this constant, 72,
    // still read as touching, see below). stageReserve already carves out
    // the band the counter/close live in, but an extreme portrait ratio
    // (9/16) can size to fill that ceiling exactly -- and because both
    // the stage and the image inside it are centred (not bottom/
    // top-aligned), the reserved room splits evenly above and below the
    // image: total clearance (stageReserve + PORTRAIT_CLEARANCE) yields
    // only HALF that on each side. The top-right × is the binding
    // constraint -- its padded tap target reaches ~69px down from the
    // viewport top (12px offset + ~57px box), so a half-clearance of 72
    // (the first cut) left a 3px sliver between button and image, which
    // is what still read as "cutting into the nav". 108 puts the half at
    // (72+108)/2 = 90px -- a real ~21px visible gap below the ×, and the
    // split maths keeps it constant regardless of viewport height, so it
    // holds even when a mobile browser's toolbar eats into what's
    // actually visible. Landscape/square images never hit this branch in
    // practice -- they're constrained by widthCapPx below instead, which
    // already leaves natural breathing room -- so this only ever shrinks
    // the images that were touching the ceiling to begin with.
    const heightCeiling = viewport
      ? viewport.height - stageReserve - (isMobileViewport ? PORTRAIT_CLEARANCE : 0)
      : undefined;
    const heightCapPx = heightCeiling !== undefined
      ? Math.min(heightCeiling, widthCapPx / heightRatio)
      : undefined;
    // Computed from the DECLARED ratio, not left for the browser to derive
    // from the file's own decoded pixels — "ratio is a curatorial crop,
    // not the source's native aspect" (GalleryGrid's own comment) means a
    // file can genuinely be wider than the square/portrait/etc. crop its
    // thumbnail promises. Leaving width "auto" let a curatorially-cropped
    // file's TRUE shape leak through once this stage's own object-fit
    // stopped cropping it, so a thumbnail that reads as a 1:1 square
    // opened as a wide rectangle instead — "the small frames [Honda Super
    // N's four square shots]... should be curved 1:1," per Josh. Deriving
    // width from ratio × the already-capped height instead means the
    // FRAME always matches what the thumbnail showed; any extra file
    // content past that crop is what object-fit:cover (below) then crops
    // away, rather than the frame reshaping around it.
    const widthFromRatio =
      heightCapPx !== undefined ? Math.round(heightCapPx * ratio) : undefined;
    // Mirrors the inline frame's own square-corner treatment (see
    // ProjectImage.square in lib/projects.ts, and HeroLightbox's
    // `image.square ? "" : "rounded-frame"`) — without this the enlarged
    // view still rounded a frame that reads square everywhere else on the
    // page. "mr porter mobile no rounded corners on lightbox," per Josh,
    // mobile only for now — max-md: rather than dropping rounded-frame
    // outright, so desktop's lightbox is untouched until he says otherwise.
    const effectiveRadius = image.square ? `max-md:rounded-none ${radius}` : radius;
    // "uniform" pins BOTH rendered dimensions outright instead of capping
    // one and leaving the other to `auto`. Capping alone (max-height +
    // width/height:auto) lets the browser fall back to each file's
    // srcset-derived intrinsic size whenever the cap doesn't bind — and
    // that intrinsic size varies per file and per device pixel ratio
    // (next/image's srcset keeps its width descriptors even when a source
    // file is smaller than the candidate it's serving), which is exactly
    // the "every image is a different size" bug on Retina screens. An
    // explicit height fixes that: same height for every frame. Width used
    // to stay "auto" (following the image's own ratio) on the theory that
    // the declared and true ratios only ever drift by a sub-percent
    // rounding amount — true for the overwhelming majority of images, but
    // not for a genuine curatorial crop, where the file is deliberately
    // WIDER than what its thumbnail shows (see the objectFit paragraph
    // below). For those, `auto` derived width from the file's real decoded
    // aspect once it loaded, not the declared one — a 1:1-cropped thumbnail
    // opening as a wide, stretched-looking rectangle in the lightbox
    // instead of the square it promised. Width is now computed explicitly
    // from the same declared ratio (`widthFromRatio`, above) instead, so
    // the frame always matches the thumbnail regardless of the file's real
    // shape. maxWidth stays on as a guard for the widest frame, where
    // sub-percent drift between declared and true ratio could otherwise
    // poke past the stage.
    // objectFit follows the SAME per-image `fit` field Plate already
    // reads everywhere else on the site (`image.fit ?? "cover"`, Plate's
    // own default) — this component didn't render through Plate, so it
    // had its own hardcoded "contain" instead, unconditionally. That
    // fixed the original bug (a still-square photo declared at a 2/3
    // ratio for its Plate card used to render visibly STRETCHED into
    // that ratio here — "LA Pride logomark is stretched to fit — make
    // sure this doesn't happen anywhere site wide," per Josh) but
    // over-corrected: "contain" doesn't just stop stretching, it also
    // stops CROPPING — so a genuine curatorial crop (Honda Super N's
    // four square shots, files that are natively wider than their
    // declared 1:1) now sized its frame correctly (widthFromRatio,
    // above) but still showed the file's full, uncropped, letterboxed
    // width inside it — the actual visible photo pixels stayed a wide
    // rectangle, just with invisible transparent padding above/below to
    // pad it into a technically-square, technically-rounded box. "the
    // small frames... still not rounded corners on lightbox," per Josh,
    // confirmed live: the corners WERE rounded, just on padding with
    // nothing visible for the rounding to cut into. `cover` crops to the
    // declared ratio instead of letterboxing past it — matching what the
    // thumbnail already shows (Plate renders that exact crop) — while
    // still never stretching, since cover preserves aspect ratio same as
    // contain does; only `fit: "contain"` opt-ins (flat lockups/logos
    // whose own edges are the content) keep letterboxing here, same
    // opt-in Plate already uses this field for.
    const style =
      fit === "uniform" && heightCapPx
        ? {
            width: widthFromRatio,
            height: Math.round(heightCapPx),
            maxWidth: widthCapPx,
            objectFit: (image.fit === "contain" ? "contain" : "cover") as "contain" | "cover",
          }
        : {
            width: "auto" as const,
            height: "auto" as const,
            maxWidth: widthCapPx,
            maxHeight: heightCapPx,
            objectFit: "contain" as const,
          };
    return { imgWidth, imgHeight, effectiveRadius, style };
  };

  const { imgWidth, imgHeight, effectiveRadius, style: imageStyle } = computeFrame(openImage);
  // heldIndex ?? openIndex, NOT openIndex — while a drag-committed swap
  // is holding a peek on screen as the stand-in for the still-decoding
  // stage, the peeks keep deriving from the pre-swap index, so the held
  // one keeps painting exactly the frame it settled on. See heldIndex's
  // declaration for the visible bug this prevents.
  const peekBaseIndex = heldIndex ?? openIndex;
  const prevImage =
    images.length > 1 && peekBaseIndex !== null
      ? images[(peekBaseIndex - 1 + images.length) % images.length]
      : null;
  const nextImage =
    images.length > 1 && peekBaseIndex !== null ? images[(peekBaseIndex + 1) % images.length] : null;
  const prevFrame = prevImage ? computeFrame(prevImage) : null;
  const nextFrame = nextImage ? computeFrame(nextImage) : null;

  // Portaled straight to document.body -- every call site (ProjectLightboxProvider,
  // PosterGrid) mounts this deep inside a project page's own tree, which as
  // of the mobile card redesign (project-content.tsx) sits inside
  // ProjectStackSwipe's slab: `relative z-10 bg-canvas`. Any `position`
  // other than static paired with a real z-index value creates a new
  // stacking context, so that slab is one -- meaning this dialog's own
  // z-50 only ever won comparisons *within* the slab's local context.
  // Compared against anything outside it, the whole slab stood in for the
  // dialog at its own z-10, which loses to BackToTop's fixed z-30
  // Previous/Next chevrons (components/ui/back-to-top.tsx, a sibling of
  // the slab, not a descendant of it) -- "the buttons are interfering at
  // the bottom," per Josh, seeing BackToTop's circles rendering on top of
  // an open lightbox instead of hidden behind it, which also broke the
  // "full screen" read entirely (the backdrop was already genuinely
  // fixed inset-0 edge-to-edge; the chevrons floating over it were what
  // made it read as not-full-screen). A portal sidesteps the whole
  // stacking-context question rather than patching z-index values against
  // each other -- this dialog now paints as a direct child of body,
  // comparing its z-50 directly against nav's z-40 and BackToTop's z-30
  // in the root stacking context, same as any other top-level overlay.
  return createPortal(
    <div
      ref={dialogRef}
      tabIndex={-1}
      onKeyDown={trapTab}
      role="dialog"
      aria-modal="true"
      aria-label={openImage.alt}
      // max-md:backdrop-blur -- "frost dark background when in lightbox,"
      // per Josh, mobile only for now. Same blur/saturate recipe as every
      // other frosted surface sitewide (nav.tsx's frostClass) so the
      // backdrop reads as the same glass treatment rather than a one-off.
      // bg-canvas/95, not bg-ink/90 -- "i think the black or grey
      // background is a bit off brand - should we do the same (almost)
      // white as site wide?" per Josh, after seeing a dark backdrop read
      // as a jarring departure from the rest of the site's one consistent
      // "Sugar White" surface. Still translucent (/95, not opaque), so
      // backdrop-blur still has real page content behind it to soften
      // rather than becoming a no-op -- a plain solid fill would make it
      // one. The stage heights match stageReserve above (72 below md,
      // 96 from md up) -- see its comment for what each reserve covers.
      // touch-none — hands every gesture on the dialog to the handlers
      // above and switches off the browser's own pinch/double-tap zoom
      // entirely, which otherwise fights this fixed-position dialog (its
      // stage sizes itself off visualViewport, so a native zoom mid-
      // gesture warped the stage's own layout under it — "zooming does
      // some crazy stuff," per Josh).
      className="fixed inset-0 z-50 flex touch-none animate-[lightbox-backdrop_320ms_ease-out] items-center justify-center bg-canvas/95 p-4 max-md:backdrop-blur-md max-md:backdrop-saturate-150"
      onClick={close}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      {/* Live drag-follow peeks — hidden off-screen at rest (opacity 0,
          translated a full viewport width either side), revealed only by
          the touchmove handler above as the current image drags away.
          pointer-events-none + aria-hidden: feedback during a gesture,
          never a target themselves. */}
      {prevImage && prevFrame && (
        <div
          ref={prevPeekRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 flex will-change-transform items-center justify-center p-4"
          style={{ transform: "translate3d(-100%, 0, 0)", opacity: 0 }}
        >
          <div
            className="relative flex h-[calc(100vh-72px)] w-[min(97vw,2000px)] items-center justify-center md:h-[calc(100vh-96px)]"
            style={stageStyle}
          >
            {prevImage.src && (
              <Image
                src={prevImage.src}
                alt=""
                width={prevFrame.imgWidth}
                height={prevFrame.imgHeight}
                sizes="97vw"
                className={prevFrame.effectiveRadius}
                style={prevFrame.style}
                // Eagerly loaded, not the default lazy — this sits
                // translated fully off-screen at rest, so next/image's
                // own IntersectionObserver never considers it "near
                // viewport" until a drag is already underway. Without
                // this the peek only started fetching/decoding once the
                // finger moved, popping in mid-swipe instead of
                // following it live -- worse the bigger the file, which
                // is exactly what made it read as janky on taller images.
                priority
              />
            )}
          </div>
        </div>
      )}
      {nextImage && nextFrame && (
        <div
          ref={nextPeekRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 flex will-change-transform items-center justify-center p-4"
          style={{ transform: "translate3d(100%, 0, 0)", opacity: 0 }}
        >
          <div
            className="relative flex h-[calc(100vh-72px)] w-[min(97vw,2000px)] items-center justify-center md:h-[calc(100vh-96px)]"
            style={stageStyle}
          >
            {nextImage.src && (
              <Image
                src={nextImage.src}
                alt=""
                width={nextFrame.imgWidth}
                height={nextFrame.imgHeight}
                sizes="97vw"
                className={nextFrame.effectiveRadius}
                style={nextFrame.style}
                // Same eager-load reasoning as prevImage above.
                priority
              />
            )}
          </div>
        </div>
      )}
      <div
        className="relative z-10 flex h-[calc(100vh-72px)] w-[min(97vw,2000px)] items-center justify-center md:h-[calc(100vh-96px)]"
        style={stageStyle}
      >
        {openImage.src && (
          <div
            key={openIndex}
            ref={dragImageRef}
            className={`will-change-transform ${
              direction === "next"
                ? "animate-[lightbox-slide-right_420ms_var(--ease-bounce)]"
                : direction === "prev"
                  ? "animate-[lightbox-slide-left_420ms_var(--ease-bounce)]"
                  : "animate-[lightbox-pop_420ms_var(--ease-bounce)]"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={openImage.src}
              alt={openImage.alt}
              width={imgWidth}
              height={imgHeight}
              sizes="97vw"
              className={effectiveRadius}
              style={imageStyle}
              priority
            />
          </div>
        )}
      </div>

      {/* Bare controls, no frosted toolbar pill -- "lightbox nav bar
          needs rethinking too - no frost bubble," per Josh: × top-right
          (where every lightbox puts it), and the < 1/7 > paging row
          under the image (below). All plain ink glyphs on the light
          backdrop, no containers, no nav-pill bounces (that motion
          belongs to the header's frost language).

          Glyph notes carried over from the pill era: "<" / ">" not
          arrows ("change the arrows from arrows to < and >," per Josh);
          × is U+00D7, not U+2715 -- the mono face has the former, and
          math operators share the face's stroke weight by design so the
          glyphs match for free. Every control stopPropagation()s so the
          dialog's own click-anywhere close doesn't also fire;
          data-lightbox-control keeps a touch that starts on a control
          from doubling as a page-swipe (see onTouchStart above). */}
      {/* Paging row at EVERY width now: < 1/7 > grouped under the image,
          all in the counter's own type-label voice. Mobile got this
          treatment first ("move next/prev lightbox nav to the lower
          section where it says number count and make it match the same
          font"), then desktop unified onto it ("add the same arrows and
          1/10 type of counter on desktop under the images," per Josh) —
          retiring the 30px screen-edge glyphs the desktop lightbox had
          carried since the toolbar-pill era (and the arrow-hint nudge
          keyframes with them; the visible counter is the paging cue
          now). The single-tap paging WCAG 2.5.7 needs everywhere, too.
          p-3 keeps each glyph's tap/click target ≥24px despite the
          small type; bottom-3 seats the padded buttons' glyphs on the
          baseline the bare counter used to sit at with bottom-6, inside
          the stage's own reserved band (stageReserve) so the row never
          overlaps the artwork. Hover mirrors the close x's brand swap;
          active: covers touch, where hover never fires. */}
      {images.length > 1 && openIndex !== null && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1">
          <button
            type="button"
            data-lightbox-dir="prev"
            data-lightbox-control
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
            className="p-3 text-ink transition-colors hover:text-brand active:text-brand"
          >
            <span className="type-label">{"<"}</span>
          </button>
          <p className="type-label text-ink">
            {openIndex + 1} / {images.length}
          </p>
          <button
            type="button"
            data-lightbox-dir="next"
            data-lightbox-control
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
            className="p-3 text-ink transition-colors hover:text-brand active:text-brand"
          >
            <span className="type-label">{">"}</span>
          </button>
        </div>
      )}
      {/* Paging announcement for screen readers (WCAG 4.1.3) — arrow keys
          and swipes update the dialog's aria-label, but a label change on
          an already-focused ancestor announces nothing; this status
          region speaks each new image as it lands. */}
      {openIndex !== null && (
        <p className="sr-only" role="status">
          Image {openIndex + 1} of {images.length}: {openImage.alt}
        </p>
      )}
      <button
        type="button"
        data-lightbox-control
        onClick={close}
        aria-label="Close"
        className={`${LIGHTBOX_BUTTON_CLASS} absolute right-3 top-3`}
      >
        <span className="inline-block text-[22px] md:text-[30px]">×</span>
      </button>
    </div>,
    document.body,
  );
}
