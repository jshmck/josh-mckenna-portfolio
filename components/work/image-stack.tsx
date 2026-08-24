"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import type { ProjectImage } from "@/lib/projects";

type ImageStackProps = {
  /** First two render as a two-up row; everything after runs full width. */
  images: ProjectImage[];
};

/** One icon slot inside the toolbar pill — no border of its own (the pill
 *  carries that), just a hover fill so each control still reads as
 *  pressable. Flex-centred with leading-none on the glyph so ✕ sits dead
 *  centre instead of drifting off the font's own metrics. */
const LIGHTBOX_BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-full text-canvas transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:bg-canvas/15 hover:text-accent";

/**
 * The gallery below a project's write-up — first two as a two-up row, the
 * rest full width, each with its own caption underneath. Every frame opens
 * full-size in a shared lightbox with prev/next cycling across the whole
 * gallery, since the grid crops every shot down from its real size.
 */
export function ImageStack({ images }: ImageStackProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [firstImage, secondImage, ...restImages] = images;

  useEffect(() => {
    if (openIndex === null) return;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenIndex(null);
      if (event.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
      if (event.key === "ArrowLeft")
        setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex, images.length]);

  const openImage = openIndex === null ? null : images[openIndex];
  const [ratioW, ratioH] = (openImage?.ratio ?? "1/1").split("/").map(Number);
  const openRatio = ratioW / ratioH;

  return (
    <>
      <div className="mx-auto max-w-frame space-y-8 px-6 pb-20 md:px-gutter">
        {(firstImage || secondImage) && (
          <div className="grid gap-8 md:grid-cols-2">
            {[firstImage, secondImage].filter(Boolean).map((image, index) => (
              <Reveal key={image.alt} delay={index * 110}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  aria-label={`Open larger view of ${image.alt}`}
                  className="block w-full cursor-zoom-in text-left"
                >
                  <Plate image={image} sizes="(max-width: 768px) 100vw, 50vw" />
                </button>
                <p className="type-label mt-3 text-ink-muted">{image.alt}</p>
              </Reveal>
            ))}
          </div>
        )}

        {restImages.map((image, index) => (
          <Reveal key={image.alt}>
            <button
              type="button"
              onClick={() => setOpenIndex(index + 2)}
              aria-label={`Open larger view of ${image.alt}`}
              className="block w-full cursor-zoom-in text-left"
            >
              <Plate image={image} sizes="(max-width: 1344px) 100vw, 1344px" />
            </button>
            <p className="type-label mt-3 text-ink-muted">{image.alt}</p>
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
              backdrop-blur-md) and the same solid, fully-opaque outline
              weight as BackToTop/the filter pills (border-ink there; a
              solid border-canvas here, since ink-on-ink would vanish
              against this dark backdrop). Anchored to the dialog itself,
              not the image, so it never overlaps or floats at an image
              edge regardless of that image's own width. */}
          <div
            className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-canvas bg-canvas/15 p-1.5 backdrop-blur-md sm:bottom-8"
            onClick={(event) => event.stopPropagation()}
          >
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length))}
                aria-label="Previous image"
                className={LIGHTBOX_BUTTON_CLASS}
              >
                <span className="font-body text-lg font-bold leading-none text-accent">←</span>
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
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setOpenIndex((i) => (i === null ? i : (i + 1) % images.length))}
                aria-label="Next image"
                className={LIGHTBOX_BUTTON_CLASS}
              >
                <span className="font-body text-lg font-bold leading-none text-accent">→</span>
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
