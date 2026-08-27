"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";

import { Plate, RATIO_CLASS } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { ProjectVideo } from "@/components/work/project-video";
import type { ImageRatio, ProjectImage } from "@/lib/projects";

type ImageStackProps = {
  /** First two render as a two-up row; everything after runs full width. */
  images: ProjectImage[];
  /** Trial (Instagram Sticker only): a silent video inserted mid-gallery,
   *  outside the lightbox's photo-cycle. See Project.galleryVideo. */
  galleryVideo?: { src: string; alt: string; sound?: boolean; afterIndex: number };
  /** Trial (Instagram Sticker only): an animated GIF inserted mid-gallery,
   *  bypassing Plate via next/image's `unoptimized` mode so the animation
   *  survives. See Project.galleryGif. */
  galleryGif?: { src: string; alt: string; ratio: ImageRatio; afterIndex: number };
  /** Trial (Instagram Sticker only): groups consecutive images into one
   *  row instead of stacking them. See Project.gallerySpans. */
  gallerySpans?: { startIndex: number; count: number }[];
};

/** One icon slot inside the toolbar pill — no border of its own (the pill
 *  carries that), just a hover fill so each control still reads as
 *  pressable. Flex-centred with leading-none on the glyph so ✕ sits dead
 *  centre instead of drifting off the font's own metrics. */
const LIGHTBOX_BUTTON_CLASS =
  "group flex h-9 w-9 items-center justify-center rounded-full text-canvas transition-all duration-300 ease-bounce hover:scale-110 active:scale-90 hover:bg-canvas/15 hover:text-brand active:text-brand";

/** Josh's vertical pieces are drawn to run small — full-bleed at the frame's
 *  1344px width blows a portrait illustration up far past its designed
 *  scale. Same cap `heroSize: "spot"` uses for a portrait hero. */
function isPortrait(ratio: string) {
  const [w, h] = ratio.split("/").map(Number);
  return h > w;
}

/**
 * The gallery below a project's write-up — first two as a two-up row, the
 * rest full width, each with its own caption underneath. Every frame opens
 * full-size in a shared lightbox with prev/next cycling across the whole
 * gallery, since the grid crops every shot down from its real size.
 */
export function ImageStack({
  images,
  galleryVideo,
  galleryGif,
  gallerySpans = [],
}: ImageStackProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // null = fresh open (bouncy pop-in); set on every arrow/keyboard nav so the
  // next frame slides in from the direction of travel instead of hard-cutting.
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const [firstImage, secondImage, ...restImages] = images;

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
  // The lightbox stage is a fixed size (see the JSX below) so paging never
  // resizes the frame — only the intrinsic width/height passed to next/image
  // still needs the real ratio, so it requests a correctly-shaped source and
  // the browser can shrink it to fit without distorting it.
  const [ratioW, ratioH] = (openImage?.ratio ?? "1/1").split("/").map(Number);
  const openRatio = ratioW / ratioH;
  const STAGE_LONG_EDGE = 1800;
  const imgWidth = openRatio >= 1 ? STAGE_LONG_EDGE : Math.round(STAGE_LONG_EDGE * openRatio);
  const imgHeight = openRatio >= 1 ? Math.round(STAGE_LONG_EDGE / openRatio) : STAGE_LONG_EDGE;

  return (
    <>
      <div className="mx-auto max-w-frame space-y-8 px-6 pb-20 md:px-gutter">
        {galleryGif && galleryGif.afterIndex === 0 && (
          // Capped to max-w-lg (512px) — the source GIF is only 1080px
          // native, so stretching it to the frame's full 1344px width
          // would upscale it past its real resolution and blur.
          <Reveal className="mx-auto max-w-lg">
            <div
              className={`relative overflow-hidden rounded-3xl ${RATIO_CLASS[galleryGif.ratio]}`}
            >
              <Image
                src={galleryGif.src}
                alt={galleryGif.alt}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <p className="type-label mt-3 text-ink-muted">{galleryGif.alt}</p>
          </Reveal>
        )}

        {(firstImage || secondImage) && (
          <div className="grid gap-8 md:grid-cols-2">
            {[firstImage, secondImage].filter(Boolean).map((image, index) => (
              <Reveal key={image.alt} delay={index * 110}>
                <button
                  type="button"
                  onClick={() => openAt(index)}
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

        {galleryVideo && galleryVideo.afterIndex === 2 && (
          <Reveal>
            <ProjectVideo
              video={{ src: galleryVideo.src, alt: galleryVideo.alt }}
              sound={galleryVideo.sound}
            />
            <p className="type-label mt-3 text-ink-muted">{galleryVideo.alt}</p>
          </Reveal>
        )}

        {restImages.map((image, index) => {
          const fullIndex = index + 2;

          // Already rendered as part of an earlier row — skip.
          const inLaterSpan = gallerySpans.some(
            (span) => fullIndex > span.startIndex && fullIndex < span.startIndex + span.count,
          );
          if (inLaterSpan) return null;

          const span = gallerySpans.find((s) => s.startIndex === fullIndex);
          if (span) {
            const spanImages = restImages.slice(index, index + span.count);
            return (
              <Reveal key={image.alt}>
                <div className={`grid grid-cols-1 gap-8 ${span.count === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                  {spanImages.map((spanImage, i) => (
                    <div key={spanImage.alt}>
                      <button
                        type="button"
                        onClick={() => openAt(fullIndex + i)}
                        aria-label={`Open larger view of ${spanImage.alt}`}
                        className="block w-full cursor-zoom-in text-left"
                      >
                        <Plate
                          image={spanImage}
                          sizes={span.count === 3 ? "(max-width: 640px) 100vw, 33vw" : "(max-width: 640px) 100vw, 50vw"}
                        />
                      </button>
                      <p className="type-label mt-3 text-ink-muted">{spanImage.alt}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          }

          const portrait = isPortrait(image.ratio);
          return (
            <Fragment key={image.alt}>
              <Reveal className={portrait ? "mx-auto max-w-lg" : undefined}>
                <button
                  type="button"
                  onClick={() => openAt(index + 2)}
                  aria-label={`Open larger view of ${image.alt}`}
                  className="block w-full cursor-zoom-in text-left"
                >
                  <Plate
                    image={image}
                    sizes={
                      portrait
                        ? "(max-width: 768px) 100vw, 512px"
                        : "(max-width: 1344px) 100vw, 1344px"
                    }
                  />
                </button>
                <p className="type-label mt-3 text-ink-muted">{image.alt}</p>
              </Reveal>

              {galleryVideo && galleryVideo.afterIndex === index + 3 && (
                <Reveal>
                  <ProjectVideo
                    video={{ src: galleryVideo.src, alt: galleryVideo.alt }}
                    sound={galleryVideo.sound}
                  />
                  <p className="type-label mt-3 text-ink-muted">{galleryVideo.alt}</p>
                </Reveal>
              )}
            </Fragment>
          );
        })}
      </div>

      {openImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={openImage.alt}
          className="fixed inset-0 z-50 flex animate-[lightbox-backdrop_320ms_ease-out] flex-col items-center justify-center gap-4 bg-ink/90 p-4"
          onClick={() => setOpenIndex(null)}
        >
          {/* Fixed stage — same footprint for every image in the gallery, so
              paging never resizes the frame (that resize was the "jank").
              Each photo keeps its own aspect ratio and shrinks to fit inside
              via width:auto/height:auto, rather than the stage reshaping to
              match it. Only this inner wrapper remounts per navigation
              (key={openIndex}); the stage itself never does. */}
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
                  className="max-h-[84vh] max-w-[min(96vw,1800px)] rounded-2xl"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>
            )}
          </div>

          {/* One grouped toolbar instead of three floating circles — same
              frosted-glass pill recipe as BackToTop (bg-canvas/15 +
              backdrop-blur-md) and the same solid, fully-opaque outline
              weight as BackToTop/the filter pills (border-ink there; a
              solid border-canvas here, since ink-on-ink would vanish
              against this dark backdrop). Sits in normal flow below the
              image rather than overlaid on it — the image's own height
              budget (84vh) leaves room for this row underneath. */}
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
