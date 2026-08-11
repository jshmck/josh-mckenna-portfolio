import Image from "next/image";

import type { ImageRatio, ProjectImage } from "@/lib/projects";

const RATIO_CLASS: Record<ImageRatio, string> = {
  "1/1": "aspect-square",
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "4/3": "aspect-[4/3]",
  "5/4": "aspect-[5/4]",
  "16/10": "aspect-[16/10]",
};

type PlateProps = {
  image: ProjectImage;
  /** `strong` is the warmer taupe used for interactive objects. */
  tone?: "ambient" | "strong";
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * An artwork slot.
 *
 * Every image on this site flows through here so the site is fully usable
 * before a single final file exists: with `image.src` set it renders an
 * optimised `next/image`; without one it renders the taupe placeholder from
 * the wireframes, labelled with its own alt text. That means the placeholder
 * state is self-documenting — you can see exactly which piece is missing.
 */
export function Plate({
  image,
  tone = "ambient",
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: PlateProps) {
  const surface = tone === "strong" ? "bg-placeholder-strong" : "bg-placeholder";

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${RATIO_CLASS[image.ratio]} ${surface} ${className}`}
    >
      {image.src ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="type-label absolute inset-0 flex items-center justify-center p-6 text-center text-ink-muted"
        >
          {image.alt}
        </span>
      )}
    </div>
  );
}
