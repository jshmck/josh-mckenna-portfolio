"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Plate } from "@/components/ui/plate";
import type { ProjectImage } from "@/lib/projects";

type HeroLightboxProps = {
  /** One image renders full-width; two render as the existing side-by-side
   *  two-up, each opening the same lightbox cycle as the other. */
  images: ProjectImage[];
  /** Caption text per image, same length/order as `images` — the first
   *  slot's caption is `project.heroCaption`, not `hero.alt` (they read
   *  differently on projects like Sound of Driving), so this can't just
   *  fall back to each image's own alt. */
  captions: string[];
  hideCaptions?: boolean;
  sizes?: string;
};

/** Same recipe as GalleryGrid/ImageStack/PosterGrid's toolbar — kept
 *  identical across all four so the lightbox reads as one shared piece of
 *  UI, not four different ones. */
const LIGHTBOX_BUTTON_CLASS =
  "group flex h-9 w-9 items-center justify-center rounded-full text-canvas transition-all duration-300 ease-bounce hover:scale-110 active:scale-90 hover:bg-canvas/15 hover:text-brand active:text-brand";

/** Click-to-enlarge for the project hero / heroPair images — the one image
 *  slot on a project page that didn't already open in a lightbox, unlike
 *  the gallery, poster grid and image stack below it. */
export function HeroLightbox({ images, captions, hideCaptions = false, sizes }: HeroLightboxProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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
      if (event.key === "ArrowRight" && images.length > 1) {
        setDirection("next");
        setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
      }
      if (event.key === "ArrowLeft" && images.length > 1) {
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
  const [ratioW, ratioH] = (openImage?.ratio ?? "1/1").split("/").map(Number);
  const openRatio = ratioW / ratioH;
  const STAGE_LONG_EDGE = 2000;
  const imgWidth = openRatio >= 1 ? STAGE_LONG_EDGE : Math.round(STAGE_LONG_EDGE * openRatio);
  const imgHeight = openRatio >= 1 ? Math.round(STAGE_LONG_EDGE / openRatio) : STAGE_LONG_EDGE;

  return (
    <>
      <div className={images.length > 1 ? "grid gap-8 md:grid-cols-2" : undefined}>
        {images.map((image, index) => (
          <div key={image.alt}>
            <button
              type="button"
              onClick={() => openAt(index)}
              aria-label={`Open larger view of ${image.alt}`}
              className="group block w-full cursor-zoom-in text-left"
            >
              <div className="overflow-hidden rounded-[40px]">
                <div className="transition-transform duration-300 ease-drift group-hover:scale-[1.02]">
                  <Plate
                    image={image}
                    sizes={sizes ?? (images.length > 1 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 1344px) 100vw, 1344px")}
                    priority={index === 0}
                  />
                </div>
              </div>
            </button>
            {!hideCaptions && (
              <p className="type-label mt-3 text-ink-muted">{captions[index]}</p>
            )}
          </div>
        ))}
      </div>

      {openImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={openImage.alt}
          className="fixed inset-0 z-50 flex animate-[lightbox-backdrop_320ms_ease-out] flex-col items-center justify-center gap-4 bg-ink/90 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <div className="relative flex h-[calc(100vh-100px)] w-[min(97vw,2000px)] items-center justify-center">
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
                  className="max-h-[calc(100vh-100px)] max-w-[min(97vw,2000px)] rounded-2xl"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>
            )}
          </div>

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
