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

/** Same recipe across every lightbox on the site — kept in one place so
 *  hover/press states, spacing and the frosted pill can't drift between
 *  HeroLightbox, ImageStack, GalleryGrid and PosterGrid. A byte-for-byte
 *  clone of nav.tsx's word class — same 15/22px font-body at regular
 *  weight ("same thickness as the text in the nav bars," per Josh), same
 *  bold-on-hover, same nav-pill-hover squash-and-stretch, same enlarged
 *  hit box via padding + matching negative margins — with the colours
 *  adapted: text-canvas at rest, not text-ink-muted, since these sit on
 *  the lightbox's dark ink/90 backdrop, and brand blue on hover/tap
 *  ("lets have the hover colour blue," per Josh), a deliberate departure
 *  from the nav words' accent purple. The old circle-button chrome
 *  (h-9 w-9, hover bg wash, directional translate/rotate accents) is
 *  gone with the rest of the bespoke styling — "make it all match," per
 *  Josh, and the nav words have none of it. */
const LIGHTBOX_BUTTON_CLASS =
  "-mx-1 -my-1 inline-block px-1 py-1 font-body text-[15px] text-canvas transition-[color,font-weight] duration-200 ease-in-out hover:animate-[nav-pill-hover_650ms_ease-in-out] hover:font-bold hover:text-brand active:animate-[nav-pill-hover_650ms_ease-in-out] active:font-bold active:text-brand md:-mx-2 md:-my-1.5 md:px-2 md:py-1.5 md:text-[22px]";

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
  // Same release-only decision as ProjectSwipeNav (no drag-follow inside
  // the lightbox; goPrev/goNext already have their own slide-in
  // animation via `direction`, so a swipe just needs to trigger that,
  // not draw its own). A ref, not state — this is gesture bookkeeping
  // between two touch events, never rendered, so it doesn't need to be
  // state React tracks.
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (event: React.TouchEvent) => {
    // Starting on the toolbar itself is excluded — a tap-and-slight-drag
    // on a button shouldn't also register as a page-swipe underneath it.
    const target = event.target as Element;
    touchRef.current = target.closest("[data-lightbox-toolbar]")
      ? null
      : { x: event.touches[0].clientX, y: event.touches[0].clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start || images.length < 2) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < SWIPE_DISTANCE) return;
    if (Math.abs(deltaX) < Math.abs(deltaY) * SWIPE_DOMINANCE) return;
    if (deltaX < 0) goNext();
    else goPrev();
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
  // The reserve covers everything under the image: the toolbar (now the
  // nav pill's own md:h-20 = 80px, up from the old 48px circle row —
  // "better match the lightbox nav to the centre nav bar," per Josh),
  // the gap-4 and the dialog's p-4, plus the same 4px slack the old
  // 100px figure carried. Two values because the toolbar itself is two
  // heights: ~47px below md (15px text + py-3), 80px from md up — one
  // flat 132px would shrink every phone-sized image for a toolbar
  // height that only exists on desktop. 768 is Tailwind's md, the same
  // breakpoint the toolbar's own md: classes switch at.
  const stageReserve = viewport && viewport.width >= 768 ? 132 : 100;
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
      // other frosted surface sitewide (nav.tsx's frostClass, BackToTop's
      // PILL_BASE) so the backdrop reads as the same glass treatment
      // rather than a one-off. bg-ink/90 is already translucent, so the
      // blur has real page content behind it to soften -- a plain solid
      // fill would make backdrop-blur a no-op.
      className="fixed inset-0 z-50 flex animate-[lightbox-backdrop_320ms_ease-out] flex-col items-center justify-center gap-4 bg-ink/90 p-4 max-md:backdrop-blur-md max-md:backdrop-saturate-150"
      onClick={close}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => {
        touchRef.current = null;
      }}
    >
      <div className="relative flex h-[calc(100vh-100px)] w-[min(97vw,2000px)] items-center justify-center md:h-[calc(100vh-132px)]">
        {openImage.src && (
          <div
            key={openIndex}
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

      {/* One grouped toolbar instead of three floating circles — a clone
          of nav.tsx's centre pill, not just a cousin of it: same frost
          (the asymmetric inset rim, brand-blue wash, blur + saturate —
          kept byte-identical with frostClass / BackToTop's PILL_BASE so
          the three never drift), same container metrics (gap-3 px-3.5
          py-3, md:h-20 md:gap-10 md:px-12 — the literal shared height
          nav.tsx uses so rounded-full's corner radius comes out the
          same), and the same bounce split: nav-pill-pop as its resting
          class (plays once per lightbox open — the toolbar mounts with
          the dialog, so mount *is* its appearing moment),
          nav-pill-hover-soft when hovered/tapped anywhere in the pill,
          full nav-pill-hover on the glyphs themselves, mirroring pill vs
          words in the nav. The md:h-20 upsizing is what the stage's
          132px md reserve above pays for. Sits in normal flow below the
          image rather than overlaid on it. */}
      <div
        data-lightbox-toolbar
        // Mobile gap/padding widened (gap-3→gap-8, px-3.5→px-8) — "the nav
        // bar for mobile on lightbox needs to be wider and more spacing
        // between buttons," per Josh; the tight 12px gap read as cramped
        // next to the header/BackToTop pills' own more generous mobile
        // sizing. Desktop's md:gap-10/md:px-12 untouched.
        className="flex flex-shrink-0 animate-[nav-pill-pop_650ms_ease-in-out] items-center gap-8 rounded-full border border-transparent bg-canvas/15 px-8 py-3 shadow-[inset_0_1px_8px_rgba(255,255,255,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3),inset_0_0_22px_color-mix(in_srgb,var(--color-brand)_32%,transparent)] backdrop-blur-md backdrop-saturate-150 hover:animate-[nav-pill-hover-soft_650ms_ease-in-out] active:animate-[nav-pill-hover-soft_650ms_ease-in-out] md:h-20 md:gap-10 md:px-12 md:py-0"
        onClick={(event) => event.stopPropagation()}
      >
        {/* "<" / ">" glyphs, not "←"/"→" — "change the arrows from arrows
            to < and >," per Josh — rendered exactly like a nav word:
            regular weight at rest, bold + accent on hover/tap, colour and
            weight inherited by the inner span so there's only one source
            of truth for the state. The span still exists purely to carry
            the one-shot arrow-hint nudge on its own transform, off the
            button's, which the hover keyframe animates. The spans size up
            past the inherited word scale (20/30px vs 15/22px) because
            Helvetica's </> glyphs only occupy about half their em box —
            at the word size they rendered visibly smaller than the ✕
            ("a little too small," per Josh). Interim treatment: Josh may
            draw custom chevrons like the cart/social icon set, which
            would swap in via the MaskIcon pipeline (social-icons.tsx). */}
        {images.length > 1 && (
          <button
            type="button"
            data-lightbox-dir="prev"
            onClick={goPrev}
            aria-label="Previous image"
            className={LIGHTBOX_BUTTON_CLASS}
          >
            <span className="inline-block text-[20px] animate-[arrow-hint-left_1.1s_ease-in-out_600ms] md:text-[30px]">
              {"<"}
            </span>
          </button>
        )}
        {/* × (U+00D7), not ✕ (U+2715) — Helvetica has no U+2715, so it
            rendered from a fallback face whose stroke didn't match the
            chevrons' ("the weight of the chevrons is different to the
            x," per Josh). The multiplication sign is a real glyph in the
            same face as </> and, at the same 20/30px, math operators
            share the face's stroke weight by design — matched for free,
            no per-glyph size tuning to maintain. */}
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className={LIGHTBOX_BUTTON_CLASS}
        >
          <span className="inline-block text-[20px] md:text-[30px]">×</span>
        </button>
        {images.length > 1 && (
          <button
            type="button"
            data-lightbox-dir="next"
            onClick={goNext}
            aria-label="Next image"
            className={LIGHTBOX_BUTTON_CLASS}
          >
            <span className="inline-block text-[20px] animate-[arrow-hint-right_1.1s_ease-in-out_600ms] md:text-[30px]">
              {">"}
            </span>
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
