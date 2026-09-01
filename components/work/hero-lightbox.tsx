"use client";

import type { CSSProperties } from "react";

import { Plate, RATIO_CLASS } from "@/components/ui/plate";
import { useProjectLightbox } from "@/components/work/project-lightbox-context";
import type { ProjectImage } from "@/lib/projects";

type HeroLightboxProps = {
  /** One image renders full-width; two render as the existing side-by-side
   *  two-up, each opening the same lightbox cycle as the other. Always the
   *  first images in the ProjectLightboxProvider's combined list, so the
   *  index clicked here doubles as the global lightbox index. */
  images: ProjectImage[];
  /** Caption text per image, same length/order as `images` — the first
   *  slot's caption is `project.heroCaption`, not `hero.alt` (they read
   *  differently on projects like Sound of Driving), so this can't just
   *  fall back to each image's own alt. */
  captions: string[];
  hideCaptions?: boolean;
  sizes?: string;
};

/** Click-to-enlarge for the project hero / heroPair images — opens the same
 *  shared lightbox cycle as the gallery below it, via ProjectLightboxProvider,
 *  so paging from a hero image carries straight on into the gallery. */
export function HeroLightbox({ images, captions, hideCaptions = false, sizes }: HeroLightboxProps) {
  const { openAt } = useProjectLightbox();

  // Images of different ratios (e.g. a 4/5 flat set beside a 250/291
  // mockup, or Costa Smeralda's three posters) can't all hit the same
  // height through a shared max-width or column width — those only match
  // height when the ratios already do. This sizes the whole row by a
  // shared height instead, letting each Plate's own aspect-ratio derive
  // its width. Runs for any mismatched-ratio set, not just `small` ones —
  // matching ratios already get equal heights for free from the ordinary
  // grid, so this only changes anything when it needs to. Generalized to
  // any image count (not just pairs) for Costa Smeralda's three posters.
  const allSmall = images.length > 1 && images.every((image) => image.small);
  const ratiosMismatched =
    images.length > 1 && images.some((image) => image.ratio !== images[0].ratio);
  const heightMatchedRow = images.length > 1 && (allSmall || ratiosMismatched);

  // A fixed height (the original approach) only works across a narrow band
  // of ratio combinations — Away's 4/5-beside-250/291 pair fit fine at a
  // tall fixed height, but a landscape 3/2 hero beside a portrait 172/273
  // article screenshot (WSJ) wanted so much combined width at that same
  // height that the second image wrapped onto its own line, defeating the
  // "side by side" point entirely. Deriving height from the row's combined
  // width instead — GAP_PX * (n-1) + h*sum(ratios) = TARGET_WIDTH, solved
  // for h — keeps any ratio combination fitting one row at a consistent
  // total width, rather than a consistent height that only sometimes fits.
  const GAP_PX = 16;
  const parseRatio = (ratio: string) => {
    const [w, h] = ratio.split("/").map(Number);
    return w / h;
  };
  const rowRatioSum =
    images.length > 1 ? images.reduce((sum, image) => sum + parseRatio(image.ratio), 0) : 0;
  const rowGap = GAP_PX * Math.max(0, images.length - 1);
  const rowStyle: CSSProperties | undefined =
    heightMatchedRow && !allSmall && rowRatioSum > 0
      ? {
          height: `clamp(${Math.round((320 - rowGap) / rowRatioSum)}px, 50vw, ${Math.round(
            (1200 - rowGap) / rowRatioSum,
          )}px)`,
        }
      : undefined;
  const rowHeight = allSmall ? "h-64 sm:h-96" : undefined;

  return (
    <div
      className={
        images.length > 1
          ? heightMatchedRow
            ? "flex flex-wrap justify-center gap-4"
            : images.length === 3
              ? "grid gap-8 md:grid-cols-3"
              : "grid gap-8 md:grid-cols-2"
          : undefined
      }
    >
      {images.map((image, index) => (
        <div
          key={image.alt}
          // The aspect-ratio class here (matching the image's own) is
          // what keeps the caption below from forcing this wrapper wider
          // than the image — without it, a flex item shrink-wraps to fit
          // its widest child, and a long caption line is often wider
          // than the image itself.
          className={
            heightMatchedRow
              ? `${rowHeight ?? ""} ${RATIO_CLASS[image.ratio]}`
              : image.small
                ? "mx-auto w-full max-w-lg"
                : undefined
          }
          style={heightMatchedRow ? rowStyle : undefined}
        >
          <button
            type="button"
            onClick={() => openAt(index)}
            aria-label={`Open larger view of ${image.alt}`}
            className={`group block cursor-zoom-in text-left ${heightMatchedRow ? "h-full" : "w-full"}`}
          >
            <div
              className={`overflow-hidden ${heightMatchedRow ? "h-full" : ""} ${image.square ? "" : "rounded-[40px]"}`}
            >
              <div
                className={`transition-transform duration-300 ease-drift group-hover:scale-[1.02] ${heightMatchedRow ? "h-full" : ""}`}
              >
                <Plate
                  image={image}
                  sizes={
                    sizes ??
                    (images.length === 3
                      ? "(max-width: 768px) 100vw, 33vw"
                      : images.length > 1
                        ? "(max-width: 768px) 100vw, 50vw"
                        : "(max-width: 1344px) 100vw, 1344px")
                  }
                  priority={index === 0}
                  radius={image.square ? "" : undefined}
                  className={heightMatchedRow ? "h-full" : undefined}
                />
              </div>
            </div>
          </button>
          {!hideCaptions && captions[index] && (
            <p className="type-label mt-3 text-ink-muted">{captions[index]}</p>
          )}
        </div>
      ))}
    </div>
  );
}
