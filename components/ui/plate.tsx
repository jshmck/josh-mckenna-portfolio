import Image from "next/image";

import type { ImageRatio, ProjectImage } from "@/lib/projects";

const RATIO_CLASS: Record<ImageRatio, string> = {
  "1/1": "aspect-square",
  "2/3": "aspect-[2/3]",
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "4/3": "aspect-[4/3]",
  "5/4": "aspect-[5/4]",
  "3/2": "aspect-[3/2]",
  "16/10": "aspect-[16/10]",
  "12/17": "aspect-[12/17]",
  "15/22": "aspect-[15/22]",
};

type PlateProps = {
  image: ProjectImage;
  /** `strong` is the warmer taupe used for interactive objects. */
  tone?: "ambient" | "strong";
  /** Corner radius utility. Defaults to the sitewide rounded-3xl, matching
   *  the Work gallery cards — every framed image sitewide uses this radius. */
  radius?: string;
  /** Hide the placeholder's own centred alt-text caption — for callers that
   *  render their own caption over the same spot (e.g. the Work gallery's
   *  hover title), where showing both collides. */
  showPlaceholderCaption?: boolean;
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
  radius = "rounded-3xl",
  showPlaceholderCaption = true,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: PlateProps) {
  const fit = image.fit ?? "cover";
  // `contain` frames real artwork, not a missing-image state — the
  // placeholder tones exist to signal "nothing here yet," so a contain
  // letterbox uses the canvas colour instead of leaking placeholder-blue
  // behind a piece that already exists.
  const surface =
    fit === "contain"
      ? "bg-canvas"
      : tone === "strong"
        ? "bg-placeholder-strong"
        : "bg-placeholder";

  return (
    <div
      className={`relative overflow-hidden ${radius} ${RATIO_CLASS[image.ratio]} ${surface} ${className}`}
    >
      {image.src ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={fit === "contain" ? "object-contain" : "object-cover"}
        />
      ) : showPlaceholderCaption ? (
        <span
          aria-hidden="true"
          className="type-label absolute inset-0 flex items-center justify-center p-6 text-center text-ink-muted"
        >
          {image.alt}
        </span>
      ) : null}
    </div>
  );
}
