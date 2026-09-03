import Image from "next/image";

import type { ImageRatio, ProjectImage } from "@/lib/projects";

export const RATIO_CLASS: Record<ImageRatio, string> = {
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
  "2400/713": "aspect-[2400/713]",
  "8/9": "aspect-[8/9]",
  "9/16": "aspect-[9/16]",
  "16/9": "aspect-[16/9]",
  "9/8": "aspect-[9/8]",
  "707/1000": "aspect-[707/1000]",
  "250/291": "aspect-[250/291]",
  "172/273": "aspect-[172/273]",
};

type PlateProps = {
  image: ProjectImage;
  /** `strong` is the warmer taupe used for interactive objects. */
  tone?: "ambient" | "strong";
  /** Corner radius utility. Defaults to the sitewide frame radius (see the
   *  default value below) — every framed image sitewide uses this. */
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
  // rounded-3xl (24px) -> the sitewide frame radius token -- "the radius
  // of the frames on the site to match the circles," per Josh. Not a
  // literal rounded-full match: on a small square (the nav circles)
  // rounded-full's radius caps at exactly half the box's height either
  // way, but on a wide rectangular frame it caps at half the *shorter*
  // side, turning the frame into a stadium/pill shape rather than a
  // rounded rectangle. rounded-frame is instead the circles' own real
  // radius at rest -- half their diameter at each breakpoint (26.5px
  // below md, 40px from md up; see --radius-frame in globals.css) -- so
  // frames share the literal corner curvature without going fully
  // circular themselves.
  radius = "rounded-frame",
  showPlaceholderCaption = true,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: PlateProps) {
  const fit = image.fit ?? "cover";
  // The placeholder tones exist to signal "nothing here yet," so they
  // only back an empty slot. Any real image sits on bg-canvas instead:
  // a contain letterbox would otherwise leak placeholder-blue around
  // the artwork, and even a cover image lets a sub-pixel rim of the
  // surface through where the rounded corners antialias — Josh spotted
  // the blue fringing the Gestalten card's edge.
  const surface = image.src
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
