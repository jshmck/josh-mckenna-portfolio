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
          return (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              aria-pressed={active}
              className={`font-display rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.02em] transition-colors ${
                active
                  ? "bg-ink text-canvas"
                  : "border border-hairline text-ink-muted hover:border-ink hover:text-ink"
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
              meta="minimal"
              motion="quiet"
              parallax
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={index < 3}
            />
          </div>
        ))}
      </div>

      <p aria-live="polite" className="type-label mt-4 text-ink-muted">
        {visible.length} {visible.length === 1 ? "piece" : "pieces"}
        {filter !== "All" ? ` in ${filter}` : ""}
      </p>
    </>
  );
}
