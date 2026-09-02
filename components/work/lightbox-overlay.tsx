"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

import type { LightboxState } from "@/components/work/lightbox-core";

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
 *  negative margins are needed to compensate. */
const LIGHTBOX_BUTTON_CLASS =
  "p-3 font-mono text-ink transition-[color,transform] duration-200 ease-in-out hover:scale-110 hover:text-brand hover:duration-300 hover:ease-drift active:scale-110 active:text-brand";

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

  // Touch paging — "Lightbox has to be swipable on mobile," per Josh.
  // Same release-only decision as ProjectSwipeNav for the horizontal case
  // (no drag-follow; goPrev/goNext already have their own slide-in
  // animation via `direction`, so a swipe just needs to trigger that, not
  // draw its own). A ref, not state — this is gesture bookkeeping between
  // touch events, never rendered on its own, so it doesn't need to be
  // state React tracks.
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
  const PULL_TO_CLOSE_DISTANCE = 120;

  const resetDragTransform = (animate: boolean) => {
    const el = dragImageRef.current;
    if (!el) return;
    el.style.transition = animate
      ? "transform 250ms var(--ease-drift, ease-out), opacity 250ms ease-out"
      : "none";
    el.style.transform = "";
    el.style.opacity = "";
  };

  const onTouchStart = (event: React.TouchEvent) => {
    // Starting on a control is excluded — a tap-and-slight-drag on a
    // button shouldn't also register as a page-swipe/pull underneath it.
    const target = event.target as Element;
    touchRef.current = target.closest("[data-lightbox-control]")
      ? null
      : { x: event.touches[0].clientX, y: event.touches[0].clientY };
    dragAxisRef.current = null;
  };

  const onTouchMove = (event: React.TouchEvent) => {
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

    if (dragAxisRef.current !== "vertical") return;

    const el = dragImageRef.current;
    if (!el) return;
    const drag = Math.max(0, deltaY);
    el.style.transition = "none";
    el.style.transform = `translateY(${drag}px)`;
    el.style.opacity = `${Math.max(0.35, 1 - drag / 400)}`;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
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
          el.style.transition = "transform 200ms ease-in, opacity 200ms ease-in";
          el.style.transform = `translateY(${deltaY + 120}px)`;
          el.style.opacity = "0";
        }
        window.setTimeout(close, 200);
      } else {
        resetDragTransform(true);
      }
      return;
    }

    if (images.length < 2) return;
    if (Math.abs(deltaX) < SWIPE_DISTANCE) return;
    if (Math.abs(deltaX) < Math.abs(deltaY) * SWIPE_DOMINANCE) return;
    if (deltaX < 0) goNext();
    else goPrev();
  };

  const onTouchCancel = () => {
    touchRef.current = null;
    dragAxisRef.current = null;
    resetDragTransform(true);
  };

  if (!openImage) return null;

  const openRatio = ratioToNumber(openImage.ratio);
  const STAGE_LONG_EDGE = 2000;
  const imgWidth = openRatio >= 1 ? STAGE_LONG_EDGE : Math.round(STAGE_LONG_EDGE * openRatio);
  const imgHeight = openRatio >= 1 ? Math.round(STAGE_LONG_EDGE / openRatio) : STAGE_LONG_EDGE;

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
  // where it actually works. Below md, size from the image that's
  // actually open instead — the frame can resize between images now, but
  // an image that fills the screen beats one that reads as broken.
  // No Math.max(1, …) floor on the mobile branch, unlike stageMaxRatio
  // above — a portrait openRatio *below* 1 is exactly what should widen
  // the resulting box (dividing by a smaller ratio yields a taller
  // heightCapPx), which is the whole point for a 9/16 photo; flooring it
  // to 1 here would just reproduce a smaller version of the same bug.
  const heightRatio = viewport && viewport.width < 768 ? openRatio : stageMaxRatio;
  const heightCapPx = viewport
    ? Math.min(viewport.height - stageReserve, widthCapPx / heightRatio)
    : undefined;

  // Mirrors the inline frame's own square-corner treatment (see
  // ProjectImage.square in lib/projects.ts, and HeroLightbox's
  // `image.square ? "" : "rounded-frame"`) — without this the enlarged
  // view still rounded a frame that reads square everywhere else on the
  // page. "mr porter mobile no rounded corners on lightbox," per Josh,
  // mobile only for now — max-md: rather than dropping rounded-frame
  // outright, so desktop's lightbox is untouched until he says otherwise.
  const effectiveRadius = openImage.square ? `max-md:rounded-none ${radius}` : radius;

  // "uniform" pins the rendered height outright instead of capping it.
  // Capping alone (max-height + width/height:auto) lets the browser fall
  // back to each file's srcset-derived intrinsic size whenever the cap
  // doesn't bind — and that intrinsic size varies per file and per device
  // pixel ratio (next/image's srcset keeps its width descriptors even when
  // a source file is smaller than the candidate it's serving), which is
  // exactly the "every image is a different size" bug on Retina screens.
  // An explicit height leaves the browser nothing to derive: same height
  // for every frame, width following the image's own ratio via
  // width:auto. maxWidth stays on as a guard for the widest frame, where
  // sub-percent drift between declared and true ratio could otherwise
  // poke past the stage.
  const imageStyle =
    fit === "uniform" && heightCapPx
      ? { width: "auto" as const, height: Math.round(heightCapPx), maxWidth: widthCapPx }
      : {
          width: "auto" as const,
          height: "auto" as const,
          maxWidth: widthCapPx,
          maxHeight: heightCapPx,
        };

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
      className="fixed inset-0 z-50 flex animate-[lightbox-backdrop_320ms_ease-out] items-center justify-center bg-canvas/95 p-4 max-md:backdrop-blur-md max-md:backdrop-saturate-150"
      onClick={close}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      <div className="relative flex h-[calc(100vh-72px)] w-[min(97vw,2000px)] items-center justify-center md:h-[calc(100vh-96px)]">
        {openImage.src && (
          <div
            key={openIndex}
            ref={dragImageRef}
            className={
              direction === "next"
                ? "animate-[lightbox-slide-right_420ms_var(--ease-bounce)]"
                : direction === "prev"
                  ? "animate-[lightbox-slide-left_420ms_var(--ease-bounce)]"
                  : "animate-[lightbox-pop_420ms_var(--ease-bounce)]"
            }
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

      {/* Bare controls at the standard lightbox positions, replacing the
          frosted toolbar pill (a clone of the header's centre pill) --
          "lightbox nav bar needs rethinking too - no frost bubble," per
          Josh, with corners + edges as the chosen layout: × top-right
          (where every lightbox puts it), < > vertically centred at the
          screen edges from md up, and below md -- where paging is the
          swipe gesture this dialog already handles -- just a small mono
          counter under the image instead of arrows. All plain ink
          glyphs on the light backdrop, no containers, no nav-pill
          bounces (that motion belongs to the header's frost language).

          Glyph notes carried over from the pill era: "<" / ">" not
          arrows ("change the arrows from arrows to < and >," per Josh);
          × is U+00D7, not U+2715 -- the mono face has the former, and
          math operators share the face's stroke weight by design so the
          three glyphs match for free. The inner spans exist purely to
          carry the one-shot arrow-hint nudge on their own transform,
          off the button's, which the hover scale animates. Every
          control stopPropagation()s so the dialog's own click-anywhere
          close doesn't also fire; data-lightbox-control keeps a touch
          that starts on a control from doubling as a page-swipe (see
          onTouchStart above). */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            data-lightbox-dir="prev"
            data-lightbox-control
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
            className={`${LIGHTBOX_BUTTON_CLASS} absolute left-3 top-1/2 hidden -translate-y-1/2 md:block`}
          >
            <span className="inline-block text-[30px] animate-[arrow-hint-left_1.1s_ease-in-out_600ms]">
              {"<"}
            </span>
          </button>
          <button
            type="button"
            data-lightbox-dir="next"
            data-lightbox-control
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
            className={`${LIGHTBOX_BUTTON_CLASS} absolute right-3 top-1/2 hidden -translate-y-1/2 md:block`}
          >
            <span className="inline-block text-[30px] animate-[arrow-hint-right_1.1s_ease-in-out_600ms]">
              {">"}
            </span>
          </button>
          {/* Position counter, mobile only -- with the arrows gone below
              md there's otherwise no cue that the gallery pages at all;
              "1 / 12" is the caption-voice hint that a swipe has
              somewhere to go, cousin of the breadcrumb dot strip. */}
          {openIndex !== null && (
            <p className="type-label absolute bottom-6 left-1/2 -translate-x-1/2 text-ink md:hidden">
              {openIndex + 1} / {images.length}
            </p>
          )}
        </>
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
