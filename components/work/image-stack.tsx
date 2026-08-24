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

/**
 * One shared circular control for the lightbox (close, prev, next) — the
 * frosted-glass recipe from BackToTop (bg-canvas/15 + backdrop-blur-md),
 * adapted for this dark backdrop with a light rim instead of BackToTop's
 * black-on-canvas border, and the same hover bounce curve. Every caller
 * appends its own position classes.
 */
const LIGHTBOX_CONTROL_CLASS =
  "absolute z-10 flex h-11 w-11 items-center justify-center rounded-full border border-canvas/25 bg-canvas/15 text-accent backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:border-accent";

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
          {/* One shared control language: a circular frosted-glass button —
              bg-canvas/15 + backdrop-blur-md, same recipe as BackToTop's
              pill — adapted for this dark backdrop with a light rim instead
              of BackToTop's black-on-canvas border. z-10 on all three: the
              image div below is also position:relative with no z-index of
              its own, so as the later sibling it would otherwise paint over
              these at the edges once it gets wide (min(95vw, ...) can run
              right up to the arrows' left-4/right-4 position). */}
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label="Close"
            className={LIGHTBOX_CONTROL_CLASS + " right-6 top-6"}
          >
            <span className="text-lg leading-none">✕</span>
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
                }}
                aria-label="Previous image"
                className={LIGHTBOX_CONTROL_CLASS + " left-4 top-1/2 -translate-y-1/2 sm:left-8"}
              >
                <span className="font-body text-lg font-bold leading-none">←</span>
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
                }}
                aria-label="Next image"
                className={LIGHTBOX_CONTROL_CLASS + " right-4 top-1/2 -translate-y-1/2 sm:right-8"}
              >
                <span className="font-body text-lg font-bold leading-none">→</span>
              </button>
            </>
          )}

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
