"use client";

import { Plate } from "@/components/ui/plate";
import { useProjectLightbox } from "@/components/work/project-lightbox-context";
import type { ProjectImage } from "@/lib/projects";

type HeroMosaicLightboxProps = {
  /** [top-left, top-right, wide, tall] — the lightbox cycle runs in that
   *  order (reading order). */
  images: [ProjectImage, ProjectImage, ProjectImage, ProjectImage];
  /** How many lightbox frames precede these four in the shared cycle —
   *  0 on a project page (they lead it), set when the mosaic sits partway
   *  down a private page's longer lightbox. */
  indexOffset?: number;
  /** A line under the wide image — the photo credit. */
  wideCaption?: string;
};

/**
 * Two images side by side over one wide image, the pair and the wide image
 * sharing one width, with a square-ish tall image beside them as high as
 * the two rows together. Porsche 911 Dakar, Iltis: the two renders over the
 * Iltis photo, and the flattened-panel layout down the right.
 *
 * The right column is sized (1.138fr : 1fr) so a square image there
 * comes out the height of the left stack: with 16/9 pair images and a 16/9
 * wide image, the stack is ~0.84x its width plus a gap, and the column
 * share solves to that at the page's real widths (within a few px from xl
 * up). A taller wide image (3/2 was tried) makes the stack taller and the
 * renders smaller; keep the ratios and the column share in step.
 *
 * From xl the mosaic sits as one block; below it, narrower than a laptop,
 * the left block would shrink the renders to thumbnails, so it stacks (the
 * pair side by side from md, the tall image capped and centred) instead.
 */
export function HeroMosaicLightbox({
  images,
  indexOffset = 0,
  wideCaption,
}: HeroMosaicLightboxProps) {
  const { openAt } = useProjectLightbox();
  const [a, b, wide, tall] = images;

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
    <div className="grid gap-6 xl:grid-cols-[1.138fr_1fr] xl:gap-8">
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {cell(a, 0, "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw")}
        {cell(b, 1, "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw")}
        <div className="md:col-span-2">
          {cell(wide, 2, "(max-width: 1280px) 100vw, 50vw")}
          {wideCaption && (
            <p className="type-label mt-3 text-ink-muted">{wideCaption}</p>
          )}
        </div>
      </div>
      <div className="mx-auto w-full max-w-xl xl:max-w-none">
        {cell(tall, 3, "(max-width: 1280px) 100vw, 48vw")}
      </div>
    </div>
  );
}
