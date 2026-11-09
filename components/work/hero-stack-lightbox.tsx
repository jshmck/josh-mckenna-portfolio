"use client";

import { Plate } from "@/components/ui/plate";
import { useProjectLightbox } from "@/components/work/project-lightbox-context";
import type { ProjectImage } from "@/lib/projects";

type HeroStackLightboxProps = {
  /** [top-left, under-left, right] — the lightbox cycle runs in that order. */
  images: [ProjectImage, ProjectImage, ProjectImage];
  /** How many lightbox frames precede these three in the shared cycle —
   *  0 on a project page (they lead it), set when the stack sits partway
   *  down a private page's longer lightbox. */
  indexOffset?: number;
};

/**
 * Two equal columns: two images stacked on the left, one tall image on the
 * right. The tall image sets the row height (a 9/16 sheet is always taller
 * than a 4/5 plus a panorama at the same width), and the left column
 * spreads to match it, so both columns share a top and a bottom edge —
 * Team Yamato's reference layout. Stacks to one column below md.
 */
export function HeroStackLightbox({ images, indexOffset = 0 }: HeroStackLightboxProps) {
  const { openAt } = useProjectLightbox();
  const [top, under, side] = images;

  const cell = (image: ProjectImage, index: number, sizes: string) => (
    <button
      type="button"
      onClick={() => openAt(indexOffset + index)}
      aria-label={`Open larger view of ${image.alt}`}
      className="group block w-full cursor-zoom-in text-left"
    >
      <div className="overflow-hidden rounded-frame">
        <div className="transition-transform duration-300 ease-drift group-hover:scale-[1.02]">
          <Plate image={image} sizes={sizes} priority={indexOffset === 0 && index === 0} />
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
