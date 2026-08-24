"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import type { ProjectImage } from "@/lib/projects";

type SmallerGalleryProps = {
  images: ProjectImage[];
};

/**
 * Trial (la-pride only for now): the smaller-framed grid below the main
 * image stack. Each frame opens the same image full-size in a lightbox —
 * the grid's whole point is fitting more shots in without blowing each one
 * up, so there has to be a way to actually see one at full size.
 */
export function SmallerGallery({ images }: SmallerGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image, index) => (
          <Reveal key={image.alt} delay={index * 60}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Open larger view of ${image.alt}`}
              className="group block w-full cursor-zoom-in text-left"
            >
              <div className="overflow-hidden rounded-3xl">
                <div className="transition-transform duration-300 ease-drift group-hover:scale-[1.03]">
                  <Plate image={image} sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
              </div>
              <p className="type-label mt-2 text-ink-muted">{image.alt}</p>
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

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
                }}
                aria-label="Previous image"
                className="absolute left-4 font-body text-3xl font-bold text-canvas transition-transform hover:-translate-x-1 sm:left-8"
              >
                ←
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
                }}
                aria-label="Next image"
                className="absolute right-4 font-body text-3xl font-bold text-canvas transition-transform hover:translate-x-1 sm:right-8"
              >
                →
              </button>
            </>
          )}

          <div
            className="relative max-h-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            {openImage.src && (
              <Image
                src={openImage.src}
                alt={openImage.alt}
                width={1600}
                height={1067}
                sizes="90vw"
                className="max-h-[85vh] w-auto rounded-2xl object-contain"
              />
            )}
            <p className="type-label mt-3 text-center text-canvas/80">{openImage.alt}</p>
          </div>
        </div>
      )}
    </>
  );
}
