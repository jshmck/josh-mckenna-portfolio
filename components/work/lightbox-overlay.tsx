"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

import type { LightboxState } from "@/components/work/lightbox-core";

function ratioToNumber(ratio: string) {
  const [w, h] = ratio.split("/").map(Number);
  return w / h;
}

/** Same recipe across every lightbox on the site — kept in one place so
 *  hover/press states, spacing and the frosted pill can't drift between
 *  HeroLightbox, ImageStack, GalleryGrid and PosterGrid. */
const LIGHTBOX_BUTTON_CLASS =
  "group flex h-9 w-9 items-center justify-center rounded-full text-canvas transition-all duration-300 ease-bounce hover:scale-110 active:scale-90 hover:bg-canvas/15 hover:text-brand active:text-brand";

type LightboxOverlayProps = {
  state: LightboxState;
  /** rounded-[40px] everywhere on the site, matching every other frame —
   *  PosterGrid passes "" instead: its posters carry their own printed
   *  border baked into the artwork, and rounding would clip across that
   *  border's hard corners at an angle. */
  radius?: string;
};

/** The click-to-enlarge dialog shared by every image lightbox on the site.
 *  Fixed stage — same footprint for every image, so paging never resizes
 *  the frame. Every photo in the cycle also renders at the same HEIGHT as
 *  every other, not just the same stage — capped to whatever height still
 *  lets the widest-ratio image in this cycle fit the width budget
 *  (`--stage-max-ratio`, computed once from the whole `images` set below),
 *  so a landscape frame doesn't look shrunken next to a square or portrait
 *  one. Only the inner wrapper remounts per navigation (key={openIndex});
 *  the stage itself never does. */
export function LightboxOverlay({ state, radius = "rounded-[40px]" }: LightboxOverlayProps) {
  const { openImage, openIndex, direction, images, close, goPrev, goNext } = state;

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
  const stageStyle = { "--stage-max-ratio": stageMaxRatio } as CSSProperties;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={openImage.alt}
      className="fixed inset-0 z-50 flex animate-[lightbox-backdrop_320ms_ease-out] flex-col items-center justify-center gap-4 bg-ink/90 p-4"
      onClick={close}
    >
      <div
        className="relative flex h-[calc(100vh-100px)] w-[min(97vw,2000px)] items-center justify-center"
        style={stageStyle}
      >
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
              className={`max-h-[min(calc(100vh-100px),calc(min(97vw,2000px)/var(--stage-max-ratio)))] max-w-[min(97vw,2000px)] ${radius}`}
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </div>
        )}
      </div>

      {/* One grouped toolbar instead of three floating circles — same
          frosted-glass pill recipe as BackToTop (bg-canvas/15 +
          backdrop-blur-md) and the same solid, fully-opaque outline weight
          as BackToTop/the filter pills. Sits in normal flow below the
          image rather than overlaid on it. */}
      <div
        data-lightbox-toolbar
        className="flex flex-shrink-0 items-center gap-1 rounded-full border border-canvas bg-canvas/15 p-1.5 backdrop-blur-md"
        onClick={(event) => event.stopPropagation()}
      >
        {images.length > 1 && (
          <button
            type="button"
            data-lightbox-dir="prev"
            onClick={goPrev}
            aria-label="Previous image"
            className={`${LIGHTBOX_BUTTON_CLASS} hover:-translate-x-1.5`}
          >
            <span className="inline-block animate-[arrow-hint-left_1.1s_ease-in-out_600ms] font-body text-lg font-bold leading-none text-canvas transition-colors duration-300 group-hover:text-brand group-active:text-brand">
              ←
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className={`${LIGHTBOX_BUTTON_CLASS} hover:rotate-90`}
        >
          <span className="inline-block text-lg leading-none">✕</span>
        </button>
        {images.length > 1 && (
          <button
            type="button"
            data-lightbox-dir="next"
            onClick={goNext}
            aria-label="Next image"
            className={`${LIGHTBOX_BUTTON_CLASS} hover:translate-x-1.5`}
          >
            <span className="inline-block animate-[arrow-hint-right_1.1s_ease-in-out_600ms] font-body text-lg font-bold leading-none text-canvas transition-colors duration-300 group-hover:text-brand group-active:text-brand">
              →
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
