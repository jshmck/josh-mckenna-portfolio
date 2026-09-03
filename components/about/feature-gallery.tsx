"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type FeatureGalleryProps = {
  images: { src: string; alt: string }[];
};

/**
 * A small in-card gallery for a Talks & Features slot with several
 * photos (the Apple Today workshops ran twice, with one set of photos).
 * Native scroll-snap does the work: swipe on touch, prev/next buttons
 * on desktop — no lightbox, deliberately. The buttons scroll by one
 * card width; scrolling smooth only when the visitor hasn't asked for
 * reduced motion (the global CSS rule can't reach a JS scrollBy).
 * The dot/arrow state updates from the scroll position — discrete
 * index changes a human reads, not a per-frame animation through
 * React state.
 */
export function FeatureGallery({ images }: FeatureGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollToSlide = (target: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(images.length - 1, target));
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    track.scrollTo({
      left: clamped * track.clientWidth,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const current = Math.round(track.scrollLeft / track.clientWidth);
    if (current !== index) setIndex(current);
  };

  return (
    <div className="group relative aspect-[16/9] overflow-hidden rounded-frame bg-placeholder">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, i) => (
          <div
            key={image.src}
            className="relative h-full w-full flex-none snap-start"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              // Only the first slide is visible before any interaction;
              // the rest can lazy-load as they're swiped in.
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Desktop prev/next. Hidden at the ends rather than disabled —
          a greyed arrow inside a photo reads as a rendering glitch. */}
      {index > 0 && (
        <button
          type="button"
          onClick={() => scrollToSlide(index - 1)}
          aria-label="Previous image"
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/70"
        >
          <svg viewBox="0 0 24 24" className="mr-0.5 h-5 w-5 fill-canvas">
            <path d="M15 4.5 7.5 12l7.5 7.5V4.5Z" />
          </svg>
        </button>
      )}
      {index < images.length - 1 && (
        <button
          type="button"
          onClick={() => scrollToSlide(index + 1)}
          aria-label="Next image"
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/70"
        >
          <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-canvas">
            <path d="M9 4.5 16.5 12 9 19.5V4.5Z" />
          </svg>
        </button>
      )}

      <div
        aria-hidden="true"
        className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5"
      >
        {images.map((image, i) => (
          <span
            key={image.src}
            className={`h-1.5 w-1.5 rounded-full ${
              i === index ? "bg-canvas" : "bg-canvas/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
