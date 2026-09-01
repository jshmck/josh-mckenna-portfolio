import Image from "next/image";
import Link from "next/link";

import { Parallax } from "@/components/ui/parallax";
import { Plate } from "@/components/ui/plate";
import type { Project, ProjectImage } from "@/lib/projects";

/** Shared between the image and its hover overlay so they stay in sync.
 *  Matches Plate's own default frame radius (see plate.tsx) -- this
 *  outer clip wrapper exists only to keep the hover-scale animation from
 *  fighting Plate's own radius+overflow-hidden for the same element, so
 *  the two have to be kept in sync by hand rather than sharing one value
 *  automatically. */
const GALLERY_RADIUS = "rounded-frame";

type ProjectCardProps = {
  project: Project;
  /** Trial (LA Pride only for now, see WorkGallery): overrides the card's
   *  lead image when it should differ from `project.hero` — the image atop
   *  the project's own page. Falls back to `project.hero` when absent. */
  image?: ProjectImage;
  /** Grids override this so the masonry columns keep their varied heights. */
  ratio?: Project["hero"]["ratio"];
  /** `full` shows client and year; `minimal` shows year only. Ignored when
   *  `caption="hover"` — that mode shows the title only, and only on hover. */
  meta?: "full" | "minimal";
  /**
   * `below` is the standard caption strip under the image. `hover` shows no
   * caption at rest — the title appears in a frosted-glass overlay on the
   * image itself, on hover/focus, matching the hero's object cards. Used by
   * the Work gallery for a cleaner grid.
   */
  caption?: "below" | "hover";
  /**
   * `lift` moves the whole card up 6px — the expressive Home/About
   * treatment. `quiet` only scales the image 1.02× and leaves the card
   * still.
   */
  motion?: "lift" | "quiet";
  /** Wraps just the image in the same 0.85× scroll parallax as Home's
   *  signature illustration — each grid image drifts independently. */
  parallax?: boolean;
  /** A second image that crossfades in over the hero on hover/focus,
   *  underneath the existing title wash — swaps the artwork itself instead
   *  of just fading it, so scanning the grid on hover stays interesting.
   *  See getCardHoverImage in lib/projects.ts for how this is picked. Only
   *  wired up when `caption="hover"`. */
  hoverImage?: ProjectImage;
  sizes?: string;
  priority?: boolean;
};

/** The one card used in both the homepage "Selected work" band and the Work gallery. */
export function ProjectCard({
  project,
  image,
  ratio,
  meta = "full",
  caption = "below",
  motion = "lift",
  parallax = false,
  hoverImage,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: ProjectCardProps) {
  const hoverCaption = caption === "hover";
  const baseImage = image ?? project.hero;

  const plate = (
    // Clipping and transforming live on two separate nested elements, not
    // one. Animating a `scale()` transform on the same element that also
    // clips via border-radius + overflow-hidden makes the browser
    // recompute the rounded-corner clip mask while compositing the
    // transform, which left a faint seam right at the curve, worst while
    // the hover scale was actively animating. The outer div only clips and
    // never transforms; the inner one only transforms.
    <div className={`relative ${hoverCaption ? `overflow-hidden ${GALLERY_RADIUS}` : ""}`}>
      {/* Scale lives on this wrapper, not on Plate alone, so the image and
          its overlay scale as one unit. They used to scale separately —
          the overlay stayed at 100% while Plate grew 1.02%, leaving a
          sliver of unmasked image peeking past the overlay's edge on
          hover. */}
      <div
        className={`relative transition-transform duration-300 ease-drift ${
          motion === "quiet"
            ? "will-change-transform group-hover:scale-[1.02] group-focus-visible:scale-[1.02]"
            : ""
        }`}
      >
        <Plate
          image={ratio ? { ...baseImage, ratio } : baseImage}
          sizes={sizes}
          priority={priority}
          radius={hoverCaption ? "" : undefined}
          showPlaceholderCaption={!hoverCaption}
        />
        {hoverCaption && hoverImage && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            {hoverImage.src ? (
              <Image
                src={hoverImage.src}
                alt=""
                fill
                sizes={sizes}
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-placeholder" />
            )}
          </div>
        )}
        {/* Title reveal on hover/focus — a white wash, centred title in ink,
            no blur. */}
        {hoverCaption && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 text-center transition-[background-color] duration-300 group-hover:bg-canvas/85 group-focus-within:bg-canvas/85"
          >
            <span className="type-label leading-none text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
              {project.title}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Link
      href={`/work/${project.slug}`}
      aria-label={hoverCaption ? project.title : undefined}
      // Read by nav.tsx's scroll listener — swaps the active "Work" link to
      // white while this card sits under the fixed nav. See
      // Project.navContrastLight's doc comment.
      data-nav-contrast={project.navContrastLight ? "light" : undefined}
      className={`group block transition-transform duration-300 ease-drift ${
        motion === "lift" ? "hover:-translate-y-1.5 focus-visible:-translate-y-1.5" : ""
      }`}
    >
      {parallax ? (
        // Clamped well inside the grid's mb-8 (32px) gap between cards —
        // unbounded parallax let far-from-centre images drift 70px+ and
        // visually detach from their own layout position, overlapping
        // neighbours. Gentler speed too, since the clamp does most of the
        // limiting for anything more than a little off-centre.
        <Parallax speed={0.92} maxOffset={12}>
          {plate}
        </Parallax>
      ) : (
        plate
      )}
      {!hoverCaption && (
        <div className="mt-3">
          <h3 className="font-body text-[15px] font-medium text-ink transition-colors group-hover:text-accent">
            {project.title}
          </h3>
          <p className="type-label mt-1 text-ink-muted">
            {meta === "full"
              ? `${project.client} · ${project.yearLabel ?? project.year}`
              : (project.yearLabel ?? project.year)}
          </p>
        </div>
      )}
    </Link>
  );
}
