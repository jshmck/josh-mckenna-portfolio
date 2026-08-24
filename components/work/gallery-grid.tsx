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
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label="Close"
            className="absolute right-6 top-6 font-body text-2xl text-canvas transition-transform hover:scale-110"
          >
            ✕
          </button>

          {allImages.length > 1 && (
            <>
              {/* Same glyph/weight/hover recipe as the project prev/next
                  nav at the page footer — translate, scale up, and fake
                  extra boldness via text-stroke on hover. */}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenIndex((i) => (i === null ? i : (i - 1 + allImages.length) % allImages.length));
                }}
                aria-label="Previous image"
                className="absolute left-4 font-body text-lg font-bold text-canvas transition-transform [-webkit-text-stroke:0px] hover:-translate-x-2 hover:scale-125 hover:[-webkit-text-stroke:0.6px_currentColor] sm:left-8"
              >
                ←
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenIndex((i) => (i === null ? i : (i + 1) % allImages.length));
                }}
                aria-label="Next image"
                className="absolute right-4 font-body text-lg font-bold text-canvas transition-transform [-webkit-text-stroke:0px] hover:translate-x-2 hover:scale-125 hover:[-webkit-text-stroke:0.6px_currentColor] sm:right-8"
              >
                →
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
