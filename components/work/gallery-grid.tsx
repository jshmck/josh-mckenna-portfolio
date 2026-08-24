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
 *  centre instead of drifting off the font's own metrics. */
const LIGHTBOX_BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-full text-canvas transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:bg-canvas/15 hover:text-accent";

/**
 * Trial (la-pride only for now, via `Project.galleryLayout === "grid"`): a
 * uniform two-column grid for the whole gallery, closer to how James Junk's
 * own project page presents the same shoot than this site's usual
 * two-up-then-single-column stack. No captions — the point is the photos.
 * Each frame opens full-size in a lightbox, since two columns still crops
 * every shot down from its real size.
 */
export function GalleryGrid({ leadImages = [], images }: GalleryGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const allImages = [...leadImages, ...images];

  useEffect(() => {
    if (openIndex === null) return;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenIndex(null);
      if (event.key === "ArrowRight")
        setOpenIndex((i) => (i === null ? i : (i + 1) % allImages.length));
      if (event.key === "ArrowLeft")
        setOpenIndex((i) => (i === null ? i : (i - 1 + allImages.length) % allImages.length));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex, allImages.length]);

  const openImage = openIndex === null ? null : allImages[openIndex];
  const [ratioW, ratioH] = (openImage?.ratio ?? "1/1").split("/").map(Number);
  const openRatio = ratioW / ratioH;

  return (
    <>
      {leadImages.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {leadImages.map((image, index) => (
            <Reveal key={image.alt}>
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
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
        {images.map((image, index) => (
          <Reveal key={image.alt} delay={index * 60}>
            <button
              type="button"
              onClick={() => setOpenIndex(leadImages.length + index)}
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

      {openImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={openImage.alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-6"
          onClick={() => setOpenIndex(null)}
        >
          {/* One grouped toolbar instead of three floating circles — same
              frosted-glass pill recipe as BackToTop (bg-canvas/15 +
              backdrop-blur-md), adapted for this dark backdrop with a light
              rim instead of BackToTop's black-on-canvas border. Anchored to
              the dialog itself, not the image, so it never overlaps or
              floats at an image edge regardless of that image's own width. */}
          <div
            className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-canvas/25 bg-canvas/15 p-1.5 backdrop-blur-md sm:bottom-8"
            onClick={(event) => event.stopPropagation()}
          >
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setOpenIndex((i) => (i === null ? i : (i - 1 + allImages.length) % allImages.length))
                }
                aria-label="Previous image"
                className={LIGHTBOX_BUTTON_CLASS}
              >
                <span className="font-body text-lg font-bold leading-none">←</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              aria-label="Close"
              className={LIGHTBOX_BUTTON_CLASS}
            >
              <span className="text-lg leading-none">✕</span>
            </button>
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={() => setOpenIndex((i) => (i === null ? i : (i + 1) % allImages.length))}
                aria-label="Next image"
                className={LIGHTBOX_BUTTON_CLASS}
              >
                <span className="font-body text-lg font-bold leading-none">→</span>
              </button>
            )}
          </div>

          <div
            className="relative rounded-2xl"
            style={{
              width: `min(95vw, 92vh * ${openRatio})`,
              aspectRatio: String(openRatio),
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {openImage.src && (
              <Image
                src={openImage.src}
                alt={openImage.alt}
                fill
                sizes="95vw"
                className="rounded-2xl object-contain"
                priority
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
