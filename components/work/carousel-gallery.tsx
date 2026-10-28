"use client";

import { useRef, useState } from "react";

import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { useProjectLightbox } from "@/components/work/project-lightbox-context";
import type { ProjectImage } from "@/lib/projects";

type CarouselGalleryProps = {
  images: ProjectImage[];
  /** How many lightbox items precede these in the project's shared cycle. */
  indexOffset?: number;
  /** Real page only (not a swipe peek): load every slide up front. Off-screen
   *  slides in a horizontal strip are exactly where lazy loading leaves a
   *  blank frame mid-swipe. */
  eager?: boolean;
};

/**
 * A series made to be swiped (Hello Twingo: an Instagram carousel). One list,
 * restyled by breakpoint rather than rendered twice, so nothing downloads
 * twice: from md up it is a three-across grid showing the whole set at once;
 * below md it is a snap-scrolling strip with the next slide peeking in, and a
 * counter. Every slide opens the project's shared lightbox, in order.
 *
 * `data-swipe-ignore` keeps ProjectStackSwipe's swipe-to-next-project from
 * claiming a horizontal drag that starts on the strip.
 */
export function CarouselGallery({ images, indexOffset = 0, eager = false }: CarouselGalleryProps) {
  const { openAt } = useProjectLightbox();
  const trackRef = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);

  // State only for the counter a person reads, updated when the nearest
  // slide actually changes — same shape as FeatureGallery's.
  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return;
    const first = track.children[0] as HTMLElement;
    const second = track.children[1] as HTMLElement;
    const step = second.offsetLeft - first.offsetLeft;
    const next = Math.max(0, Math.min(images.length - 1, Math.round(track.scrollLeft / step)));
    if (next !== current) setCurrent(next);
  };

  return (
    <Reveal>
      <ul
        ref={trackRef}
        onScroll={handleScroll}
        data-swipe-ignore
        aria-label="Slides"
        className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto overscroll-x-contain px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 md:pb-0"
      >
        {images.map((image, index) => (
          <li key={image.alt} className="w-[82%] flex-none snap-center md:w-auto">
            <button
              type="button"
              onClick={() => openAt(indexOffset + index)}
              aria-label={`Open larger view of ${image.alt}`}
              className="block w-full cursor-zoom-in text-left"
            >
              <Plate
                image={image}
                sizes="(max-width: 768px) 82vw, 33vw"
                loading={eager ? "eager" : undefined}
              />
            </button>
            {image.caption !== false && (
              <p className="type-label mt-3 text-ink-muted">{image.alt}</p>
            )}
          </li>
        ))}
      </ul>
      <p aria-hidden="true" className="type-label mt-4 text-ink-muted md:hidden">
        {current + 1} / {images.length}
      </p>
    </Reveal>
  );
}
