"use client";

import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { useLightboxState } from "@/components/work/lightbox-core";
import { LightboxOverlay } from "@/components/work/lightbox-overlay";
import type { ProjectImage } from "@/lib/projects";

type PosterGridProps = {
  images: ProjectImage[];
  /** Column count at the widest breakpoint — Beefbar's posters (4, the
   *  default) vs. Rooted Journal's ten same-size spot icons, which read
   *  better as two clean rows of five than as 4+4+2. */
  columns?: 4 | 5;
};

/**
 * Opens a project page straight into a grid instead of the usual full-bleed
 * hero — for a series where every piece shares a similar (usually portrait)
 * ratio, so a single full-width hero would run far taller than the
 * viewport. Four columns, square corners rather than the sitewide
 * rounded-[40px] — every poster in this series has its own printed border
 * baked into the artwork, and rounding would clip across that border's
 * hard corners at an angle. Every tile opens the same shared lightbox
 * chrome as the rest of the site (LightboxOverlay), just square-cornered;
 * self-contained rather than routed through ProjectLightboxProvider since
 * this layout already combines hero + gallery into one array with no
 * write-up split in between.
 */
export function PosterGrid({ images, columns = 4 }: PosterGridProps) {
  const lightbox = useLightboxState(images);

  return (
    <>
      {/* pb-28 -> pb-40, matching ImageStack/GalleryGrid -- see their own
          comment on this same change. */}
      <div className="mx-auto max-w-frame px-6 pt-12 pb-40 md:px-gutter">
        <div
          className={
            columns === 5
              ? "grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 md:gap-8 lg:grid-cols-5"
              : "grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 md:gap-8"
          }
        >
          {images.map((image, index) => (
            <Reveal key={image.alt} delay={(index % columns) * 90}>
              <button
                type="button"
                onClick={() => lightbox.openAt(index)}
                aria-label={`Open larger view of ${image.alt}`}
                className="block w-full cursor-zoom-in text-left"
              >
                <Plate
                  image={image}
                  radius=""
                  sizes={
                    columns === 5
                      ? "(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 18vw"
                      : "(max-width: 640px) 45vw, (max-width: 768px) 30vw, 22vw"
                  }
                />
              </button>
              <p className="type-label mt-3 text-center text-ink-muted">
                {image.alt}
              </p>
            </Reveal>
          ))}
        </div>
      </div>

      <LightboxOverlay state={lightbox} radius="" />
    </>
  );
}
