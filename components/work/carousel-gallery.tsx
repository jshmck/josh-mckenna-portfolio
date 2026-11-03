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
 * A series made to be swiped (Hello Twingo: an Instagram carousel). One
 * snap-scrolling strip at every size: slides sit edge to edge with a hair of
 * gap and a 3px corner, so they read as one carousel; on desktop all six sit in one
 * row, so nothing is hidden; on phones one slide and a bit of the next, with a
 * counter showing where you are. Every slide
 * opens the project's shared lightbox, in order, as its own page.
 *
 * `data-swipe-ignore` keeps ProjectStackSwipe's swipe-to-next-project from
 * claiming a horizontal drag that starts on the strip.
 */
export function CarouselGallery({
  images,
  indexOffset = 0,
  eager = false,
}: CarouselGalleryProps) {
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
    const next = Math.max(
      0,
      Math.min(images.length - 1, Math.round(track.scrollLeft / step)),
    );
    if (next !== current) setCurrent(next);
  };

  return (
    <Reveal>
      <ul
        ref={trackRef}
        onScroll={handleScroll}
        data-swipe-ignore
        aria-label="Slides"
        className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-1 overflow-x-auto overscroll-x-contain px-6 pb-2 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, index) => (
          <li
            key={image.alt}
            className="w-[82%] flex-none snap-start md:w-[calc((100%-1.25rem)/6)]"
          >
            <button
              type="button"
              onClick={() => openAt(indexOffset + index)}
              aria-label={`Open larger view of ${image.alt}`}
              className="block w-full cursor-zoom-in text-left"
            >
              <Plate
                image={image}
                sizes="(max-width: 768px) 82vw, 17vw"
                loading={eager ? "eager" : undefined}
                radius="rounded-[3px]"
              />
            </button>
          </li>
        ))}
      </ul>
      <p aria-hidden="true" className="type-label mt-3 text-ink-muted md:hidden">
        {current + 1} / {images.length}
      </p>
    </Reveal>
  );
}
