"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import type { ProjectImage } from "@/lib/projects";

type PosterGridProps = {
  images: ProjectImage[];
  /** Column count at the widest breakpoint — Beefbar's posters (4, the
   *  default) vs. Rooted Journal's ten same-size spot icons, which read
   *  better as two clean rows of five than as 4+4+2. */
  columns?: 4 | 5;
};

/** One icon slot inside the toolbar pill — no border of its own (the pill
 *  carries that), just a hover fill so each control still reads as
 *  pressable. Flex-centred with leading-none on the glyph so ✕ sits dead
 *  centre instead of drifting off the font's own metrics. */
const LIGHTBOX_BUTTON_CLASS =
  "group flex h-9 w-9 items-center justify-center rounded-full text-canvas transition-all duration-300 ease-bounce hover:scale-110 active:scale-90 hover:bg-canvas/15 hover:text-brand active:text-brand";

/**
 * Opens a project page straight into a grid instead of the usual full-bleed
 * hero — for a series where every piece shares a similar (usually portrait)
 * ratio, so a single full-width hero would run far taller than the
 * viewport. Four columns, square corners rather than the sitewide
 * rounded-3xl — every poster in this series has its own printed border
 * baked into the artwork, and rounding would clip across that border's
 * hard corners at an angle. Every tile opens the same shared lightbox as
 * the rest of the site, adapted from ImageStack.
 */
export function PosterGrid({ images, columns = 4 }: PosterGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // null = fresh open (bouncy pop-in); set on every arrow/keyboard nav so the
  // next frame slides in from the direction of travel instead of hard-cutting.
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);

  const goNext = () => {
    setDirection("next");
    setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
  };
  const goPrev = () => {
    setDirection("prev");
    setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
  };
  const openAt = (index: number) => {
    setDirection(null);
    setOpenIndex(index);
  };

  useEffect(() => {
    if (openIndex === null) return;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenIndex(null);
      if (event.key === "ArrowRight") {
        setDirection("next");
        setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
      }
      if (event.key === "ArrowLeft") {
        setDirection("prev");
        setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex, images.length]);

  const openImage = openIndex === null ? null : images[openIndex];
  // fill + object-contain (tried first) stretches every image up to fill
  // the stage regardless of its real resolution — fine for the big TIFF
  // exports, but it upscaled New York's much lower-res source into visible
  // pixelation. Sizing off the file's own natural dimensions instead (capped
  // by the stage, never enlarged past it) trades uniform stage-filling for
  // never blowing up a source past what it actually has — Josh's call.
  const [ratioW, ratioH] = (openImage?.ratio ?? "1/1").split("/").map(Number);
  const openRatio = ratioW / ratioH;
  const STAGE_LONG_EDGE = 1800;
  const imgWidth = openRatio >= 1 ? STAGE_LONG_EDGE : Math.round(STAGE_LONG_EDGE * openRatio);
  const imgHeight = openRatio >= 1 ? Math.round(STAGE_LONG_EDGE / openRatio) : STAGE_LONG_EDGE;

  return (
    <>
      <div className="mx-auto max-w-frame px-6 pt-12 pb-28 md:px-gutter">
        <div
          className={
            columns === 5
              ? "grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 md:gap-8 lg:grid-cols-5"
              : "grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 md:gap-8"
          }
        >
          {images.map((image, index) => (
            <Reveal key={image.alt} delay={(index % columns) * 90}>
              <button
                type="button"
                onClick={() => openAt(index)}
                aria-label={`Open larger view of ${image.alt}`}
                className="block w-full cursor-zoom-in text-left"
              >
                <Plate
                  image={image}
                  radius=""
                  sizes={
                    columns === 5
                      ? "(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 18vw"
                      : "(max-width: 640px) 45vw, (max-width: 768px) 30vw, 22vw"
                  }
                />
              </button>
              <p className="type-label mt-3 text-center text-ink-muted">
                {image.alt}
              </p>
            </Reveal>
          ))}
        </div>
      </div>

      {openImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={openImage.alt}
          className="fixed inset-0 z-50 flex animate-[lightbox-backdrop_320ms_ease-out] flex-col items-center justify-center gap-4 bg-ink/90 p-4"
          onClick={() => setOpenIndex(null)}
        >
          {/* Fixed stage — same footprint for every image, so paging never
              resizes the frame. Each photo keeps its own aspect ratio and
              shrinks (never enlarges) to fit inside via width:auto/height:
              auto, rather than the stage reshaping to match it. Only this
              inner wrapper remounts per navigation (key={openIndex}); the
              stage itself never does. Square corners here too, matching
              the grid — the poster's own printed border stays intact. */}
          <div className="relative flex h-[84vh] w-[min(96vw,1800px)] items-center justify-center">
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
                  sizes="96vw"
                  className="max-h-[84vh] max-w-[min(96vw,1800px)]"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>
            )}
          </div>

          {/* One grouped toolbar instead of three floating circles — same
              frosted-glass pill recipe as BackToTop (bg-canvas/15 +
              backdrop-blur-md). Sits in normal flow below the image rather
              than overlaid on it. */}
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
              onClick={() => setOpenIndex(null)}
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
      )}
    </>
  );
}
