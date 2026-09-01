"use client";

import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { useProjectLightbox } from "@/components/work/project-lightbox-context";
import type { ProjectImage } from "@/lib/projects";

type GalleryGridProps = {
  /** Rendered above the grid as their own tall two-up row (la-pride's key
   *  art + flyposted lineup) — same click-to-enlarge, same lightbox cycle
   *  as everything in `images`, just a different lead-in size. */
  leadImages?: ProjectImage[];
  images: ProjectImage[];
  /** How many images precede this grid in the shared
   *  ProjectLightboxProvider's combined list (the hero above the
   *  write-up) — added to every local index so clicking a grid image opens
   *  the right frame in the shared cycle. */
  indexOffset?: number;
};

/** A panorama crop (Voxi Pride's "Endless Love" banner) reads as a strip,
 *  not a tile, next to a square — span both columns instead of sitting
 *  half-width. Ratio-driven rather than a per-image flag so any future
 *  banner-shaped grid image gets the same treatment for free. */
function isPanorama(ratio: string) {
  const [w, h] = ratio.split("/").map(Number);
  return w / h >= 2;
}

/**
 * Trial (la-pride only for now, via `Project.galleryLayout === "grid"`): a
 * uniform two-column grid for the whole gallery, closer to how James Junk's
 * own project page presents the same shoot than this site's usual
 * two-up-then-single-column stack. No captions — the point is the photos.
 * Each frame opens in the shared ProjectLightboxProvider lightbox, since two
 * columns still crops every shot down from its real size.
 */
export function GalleryGrid({ leadImages = [], images, indexOffset = 0 }: GalleryGridProps) {
  const { openAt } = useProjectLightbox();

  return (
    <>
      {leadImages.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {leadImages.map((image, index) => (
            <Reveal key={image.alt}>
              <button
                type="button"
                onClick={() => openAt(indexOffset + index)}
                aria-label={`Open larger view of ${image.alt}`}
                className="group block w-full cursor-zoom-in text-left"
              >
                <div className="overflow-hidden rounded-frame">
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
        {images.map((image, index) => {
          const wide = isPanorama(image.ratio);
          return (
            // `Reveal` renders the actual grid item (a plain wrapping div) —
            // `grid-column`/col-span only affects a grid's direct children,
            // so the span has to land here, not on the button one level in.
            <Reveal key={image.alt} delay={index * 60} className={wide ? "sm:col-span-2" : ""}>
              <button
                type="button"
                onClick={() => openAt(indexOffset + leadImages.length + index)}
                aria-label={`Open larger view of ${image.alt}`}
                className="group block w-full cursor-zoom-in text-left"
              >
                <div className="overflow-hidden rounded-frame">
                  <div className="transition-transform duration-300 ease-drift group-hover:scale-[1.03]">
                    <Plate image={image} sizes={wide ? "100vw" : "(max-width: 768px) 100vw, 50vw"} />
                  </div>
                </div>
              </button>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
