"use client";

import { useMemo, useState } from "react";

import { ProjectCard } from "@/components/work/project-card";
import type { ImageRatio, Project, ProjectCategory } from "@/lib/projects";

type WorkGalleryProps = {
  projects: Project[];
  categories: ProjectCategory[];
};

type Filter = ProjectCategory | "All";

/**
 * Ratio rhythm for the masonry columns. Cycling a fixed sequence rather than
 * randomising keeps the grid's staggered look identical between server and
 * client renders — random heights would hydrate mismatched.
 */
const RATIO_CYCLE: ImageRatio[] = ["4/5", "3/4", "1/1", "5/4", "3/4", "4/5"];

/** Rainbow fill, top to bottom — bright/saturated to match Josh's mockup
 *  rather than the deeper "official" flag hex values. */
const PRIDE_STRIPES = [
  "#F04C3B",
  "#F7941D",
  "#FDE94B",
  "#6DDB4E",
  "#57B8F2",
  "#A98FE5",
];

/** Concentric rings around the pill, outermost first — pink, then light
 *  blue, then white, echoing the trans flag before the rainbow fill
 *  starts. Each is a full rounded-pill layer inset a bit further than
 *  the last, so the layer beneath shows through as a ring. */
const PRIDE_RINGS = ["#F7A0C4", "#7DD3F0", "#FFFFFF"];

const prideStripeGradient = `linear-gradient(to bottom, ${PRIDE_STRIPES.map(
  (color, i) =>
    `${color} ${(i / PRIDE_STRIPES.length) * 100}% ${((i + 1) / PRIDE_STRIPES.length) * 100}%`,
).join(", ")})`;

/**
 * The "Pride" filter pill only — everywhere else in the row is the plain
 * bordered/filled button below. On hover it reveals a pride-flag treatment
 * underneath the label (pink/light-blue/white rings around a rainbow
 * fill), pure CSS, no image asset. Idle and active states otherwise match
 * every other pill so it doesn't stand out until you touch it. Hover
 * bounce (scale-105, duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)])
 * matches BackToTop's exact recipe, not the simpler asymmetric-easing
 * scale used on plain text links — this is a filled/outlined pill like
 * that button, not a bare link.
 *
 * Plain CSS `uppercase`, not toWaldeckCase() — tried the lowercase quirk
 * here too, but at chip scale it read as a mistake rather than a
 * deliberate brand detail. Same exemption as the project prev/next nav.
 *
 * Border stays border-ink on hover rather than going transparent (only
 * active drops it, matching the other chips). It used to disappear on
 * hover to let the ring reveal show through, but that meant the pill's
 * silhouette had nothing crisp to visibly scale during the hover bounce
 * — measured it, the box and text were both scaling by the correct
 * 1.05x, but with no stable edge the growth just wasn't legible, so it
 * read as "only the text moves." The rings sit at inset 0/2/4/6px inside
 * the border, so a visible outline doesn't clash with them.
 */
function PrideFilterButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`font-display group relative overflow-hidden rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.02em] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 ${
        active
          ? "border-transparent bg-brand text-canvas"
          : "border-ink text-ink-muted hover:text-ink"
      }`}
    >
      {PRIDE_RINGS.map((color, i) => (
        <span
          key={color}
          aria-hidden="true"
          className="absolute rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ inset: `${i * 2}px`, backgroundColor: color }}
        />
      ))}
      <span
        aria-hidden="true"
        className="absolute rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ inset: `${PRIDE_RINGS.length * 2}px`, background: prideStripeGradient }}
      />
      <span className="relative z-10 transition-colors duration-300 group-hover:text-black">
        Pride
      </span>
    </button>
  );
}

export function WorkGallery({ projects, categories }: WorkGalleryProps) {
  const [filter, setFilter] = useState<Filter>("All");

  const visible = useMemo(
    () =>
      filter === "All"
        ? projects
        : projects.filter((project) => project.category === filter),
    [filter, projects],
  );

  const filters: Filter[] = ["All", ...categories];

  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter work by discipline">
        {filters.map((option) => {
          const active = filter === option;

          if (option === "Pride") {
            return (
              <PrideFilterButton
                key={option}
                active={active}
                onClick={() => setFilter(option)}
              />
            );
          }

          return (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              aria-pressed={active}
              className={`font-display rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.02em] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 ${
                active
                  ? "bg-brand text-canvas"
                  : "border border-ink text-ink-muted hover:border-brand hover:text-brand"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* CSS multi-column gives true masonry flow and reflows cleanly when the
          filter changes — no measuring, no layout JS. */}
      <div className="mt-12 gap-8 [column-fill:balance] columns-1 md:columns-2 lg:columns-3">
        {visible.map((project, index) => (
          <div key={project.slug} className="mb-8 break-inside-avoid">
            <ProjectCard
              project={project}
              ratio={RATIO_CYCLE[index % RATIO_CYCLE.length]}
              caption="hover"
              motion="quiet"
              parallax
              // Trial: swap to the project's second image on hover instead
              // of just fading the hero — LA Pride only for now, see if
              // Josh wants it everywhere before wiring up every card.
              hoverImage={project.slug === "la-pride" ? project.gallery[0] : undefined}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={index < 3}
            />
          </div>
        ))}
      </div>

      {/* Not visible — announces the filtered count to screen readers only.
          Sighted users see the grid change; there's no visual equivalent of
          that for a screen reader, so this fills the gap without cluttering
          the page. */}
      <p aria-live="polite" className="sr-only">
        {visible.length} {visible.length === 1 ? "piece" : "pieces"}
        {filter !== "All" ? ` in ${filter}` : ""}
      </p>
    </>
  );
}
