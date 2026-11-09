"use client";

import { Plate } from "@/components/ui/plate";
import { useProjectLightbox } from "@/components/work/project-lightbox-context";
import type { ProjectImage } from "@/lib/projects";

type HeroStackLightboxProps = {
  /** [top-left, under-left, right] — the lightbox cycle runs in that order. */
  images: [ProjectImage, ProjectImage, ProjectImage];
};

/**
 * Two equal columns: two images stacked on the left, one tall image on the
 * right. The tall image sets the row height (a 9/16 sheet is always taller
 * than a 4/5 plus a panorama at the same width), and the left column
 * spreads to match it, so both columns share a top and a bottom edge —
 * Team Yamato's reference layout. Stacks to one column below md.
 */
export function HeroStackLightbox({ images }: HeroStackLightboxProps) {
  const { openAt } = useProjectLightbox();
  const [top, under, side] = images;

  const cell = (image: ProjectImage, index: number, sizes: string) => (
    <button
      type="button"
      onClick={() => openAt(index)}
      aria-label={`Open larger view of ${image.alt}`}
      className="group block w-full cursor-zoom-in text-left"
    >
      <div className="overflow-hidden rounded-frame">
        <div className="transition-transform duration-300 ease-drift group-hover:scale-[1.02]">
          <Plate image={image} sizes={sizes} priority={index === 0} />
        </div>
      </div>
    </button>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      <div className="flex flex-col gap-6 md:justify-between md:gap-0">
        {cell(top, 0, "(max-width: 768px) 100vw, 50vw")}
        {cell(under, 1, "(max-width: 768px) 100vw, 50vw")}
      </div>
      {cell(side, 2, "(max-width: 768px) 100vw, 50vw")}
    </div>
  );
}
