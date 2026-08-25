"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import type { ProjectImage } from "@/lib/projects";

type GalleryGridProps = {
  /** Rendered above the grid as their own tall two-up row (la-pride's key
   *  art + flyposted lineup) — same click-to-enlarge, same lightbox cycle
   *  as everything in `images`, just a different lead-in size. */
  leadImages?: ProjectImage[];
  images: ProjectImage[];
};

/** One icon slot inside the toolbar pill — no border of its own (the pill
 *  carries that), just a hover fill so each control still reads as
 *  pressable. Flex-centred with leading-none on the glyph so ✕ sits dead
 *  centre instead of drifting off the font's own metrics. Same recipe as
 *  ImageStack/PosterGrid's toolbar — kept identical across all three so the
 *  lightbox reads as one shared piece of UI, not three different ones. */
const LIGHTBOX_BUTTON_CLASS =
  "group flex h-9 w-9 items-center justify-center rounded-full text-canvas transition-all duration-300 ease-bounce hover:scale-110 active:scale-90 hover:bg-canvas/15 hover:text-brand active:text-brand";

/**
 * Trial (la-pride only for now, via `Project.galleryLayout === "grid"`): a
 * uniform two-column grid for the whole gallery, closer to how James Junk's
 * own project page presents the same shoot than this site's usual
 * two-up-then-single-column stack. No captions — the point is the photos.
 * Each frame opens full-size in a lightbox, since two columns still crops
 * every shot down from its real size.
 */
/** A panorama crop (Voxi Pride's "Endless Love" banner) reads as a strip,
 *  not a tile, next to a square — span both columns instead of sitting
 *  half-width. Ratio-driven rather than a per-image flag so any future
 *  banner-shaped grid image gets the same treatment for free. */
function isPanorama(ratio: string) {
  const [w, h] = ratio.split("/").map(Number);
  return w / h >= 2;
}

export function GalleryGrid({ leadImages = [], images }: GalleryGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // null = fresh open (bouncy pop-in); set on every arrow/keyboard nav so the
  // next frame slides in from the direction of travel instead of hard-cutting.
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const allImages = [...leadImages, ...images];

  const goNext = () => {
    setDirection("next");
    setOpenIndex((i) => (i === null ? i : (i + 1) % allImages.length));
  };
  const goPrev = () => {
    setDirection("prev");
    setOpenIndex((i) => (i === null ? i : (i - 1 + allImages.length) % allImages.length));
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
        setOpenIndex((i) => (i === null ? i : (i + 1) % allImages.length));
      }
      if (event.key === "ArrowLeft") {
        setDirection("prev");
        setOpenIndex((i) => (i === null ? i : (i - 1 + allImages.length) % allImages.length));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex, allImages.length]);

  const openImage = openIndex === null ? null : allImages[openIndex];
  // The lightbox stage is a fixed size (see the JSX below) so paging never
  // resizes the frame — only the intrinsic width/height passed to next/image
  // still needs the real ratio, so it requests a correctly-shaped source and
  // the browser can shrink it to fit without distorting it.
  const [ratioW, ratioH] = (openImage?.ratio ?? "1/1").split("/").map(Number);
  const openRatio = ratioW / ratioH;
  const STAGE_LONG_EDGE = 1600;
  const imgWidth = openRatio >= 1 ? STAGE_LONG_EDGE : Math.round(STAGE_LONG_EDGE * openRatio);
  const imgHeight = openRatio >= 1 ? Math.round(STAGE_LONG_EDGE / openRatio) : STAGE_LONG_EDGE;

  return (
    <>
      {leadImages.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {leadImages.map((image, index) => (
            <Reveal key={image.alt}>
              <button
                type="button"
                onClick={() => openAt(index)}
                aria-label={`Open larger view of ${image.alt}`}
                className="group block w-full cursor-zoom-in text-left"
              >
                <div className="overflow-hidden rounded-3xl">
                  <div className="transition-transform duration-300 ease-drift group-hover:scale-[1.03]">
                    <Plate image={image} sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {images.map((image, index) => {
          const wide = isPanorama(image.ratio);
          return (
            // `Reveal` renders the actual grid item (a plain wrapping div) —
            // `grid-column`/col-span only affects a grid's direct children,
            // so the span has to land here, not on the button one level in.
            <Reveal key={image.alt} delay={index * 60} className={wide ? "sm:col-span-2" : ""}>
              <button
                type="button"
                onClick={() => openAt(leadImages.length + index)}
                aria-label={`Open larger view of ${image.alt}`}
                className="group block w-full cursor-zoom-in text-left"
              >
                <div className="overflow-hidden rounded-3xl">
                  <div className="transition-transform duration-300 ease-drift group-hover:scale-[1.03]">
                    <Plate image={image} sizes={wide ? "100vw" : "(max-width: 768px) 100vw, 50vw"} />
                  </div>
                </div>
              </button>
            </Reveal>
          );
        })}
      </div>

      {openImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={openImage.alt}
          className="fixed inset-0 z-50 flex animate-[lightbox-backdrop_320ms_ease-out] flex-col items-center justify-center gap-6 bg-ink/90 p-6"
          onClick={() => setOpenIndex(null)}
        >
          {/* Fixed stage — same footprint for every image in the gallery, so
              paging never resizes the frame. Each photo keeps its own
              aspect ratio and shrinks to fit inside via width:auto/height:
              auto, rather than the stage reshaping to match it. Only this
              inner wrapper remounts per navigation (key={openIndex}); the
              stage itself never does. */}
          <div className="relative flex h-[78vh] w-[min(95vw,1600px)] items-center justify-center">
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
                  sizes="95vw"
                  className="max-h-[78vh] max-w-[min(95vw,1600px)] rounded-2xl"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>
            )}
          </div>

          {/* One grouped toolbar instead of three floating circles — same
              frosted-glass pill recipe as BackToTop (bg-canvas/15 +
              backdrop-blur-md) and the same solid, fully-opaque outline
              weight as BackToTop/the filter pills. Sits in normal flow
              below the image rather than overlaid on it. */}
          <div
            data-lightbox-toolbar
            className="flex flex-shrink-0 items-center gap-1 rounded-full border border-canvas bg-canvas/15 p-1.5 backdrop-blur-md"
            onClick={(event) => event.stopPropagation()}
          >
            {allImages.length > 1 && (
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
            {allImages.length > 1 && (
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
