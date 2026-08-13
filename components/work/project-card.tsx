import Link from "next/link";

import { Plate } from "@/components/ui/plate";
import type { Project } from "@/lib/projects";

type ProjectCardProps = {
  project: Project;
  /** Grids override this so the masonry columns keep their varied heights. */
  ratio?: Project["hero"]["ratio"];
  /** `full` shows client and year; `minimal` shows year only (Work grid). */
  meta?: "full" | "minimal";
  sizes?: string;
  priority?: boolean;
};

/**
 * The one card used in both the homepage "Selected work" band and the Work
 * gallery. Hover lifts it 6px per the wireframe annotation.
 */
export function ProjectCard({
  project,
  ratio,
  meta = "full",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: ProjectCardProps) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block transition-transform duration-300 ease-drift hover:-translate-y-1.5 focus-visible:-translate-y-1.5"
    >
      <Plate
        image={ratio ? { ...project.hero, ratio } : project.hero}
        sizes={sizes}
        priority={priority}
      />
      <div className="mt-3">
        <h3 className="font-body text-[15px] font-medium text-ink transition-colors group-hover:text-accent">
          {project.title}
        </h3>
        <p className="type-label mt-1 text-ink-muted">
          {meta === "full" ? `${project.client} · ${project.year}` : project.year}
        </p>
      </div>
    </Link>
  );
}
