import type { Metadata } from "next";

import { Plate } from "@/components/ui/plate";
import { archivedProjects } from "@/lib/archived-projects";

/**
 * Josh's private shelf of retired work — "archive these projects into a
 * hidden place that i can bring back easily. maybe you can make a private
 * page only i can see?" Hidden, not authenticated: the site is fully
 * static (no backend, per CLAUDE.md), so real auth isn't on the table —
 * instead this route is linked from nowhere (nav, footer, sitemap all
 * omit it) and carries robots noindex/nofollow, so only someone typing
 * /archive finds it. Restoring a piece is moving its entry from
 * lib/archived-projects.ts back into lib/projects.ts at the spot it
 * should display — array order is the gallery order.
 */
export const metadata: Metadata = {
  title: "Archive",
  robots: { index: false, follow: false },
};

export default function ArchivePage() {
  return (
    <div className="mx-auto max-w-frame px-6 pb-32 pt-8 md:px-gutter">
      <h1 className="type-heading">Archive</h1>
      <p className="type-lede mt-4 max-w-xl text-ink-muted">
        Retired from the public gallery, kept ready to bring back. This page
        is unlisted — nothing links here and search engines are told to skip
        it.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-x-8">
        {archivedProjects.map((project) => (
          <div key={project.slug}>
            {/* Every archived hero keeps its own native ratio — this grid
                is a reference shelf, not the curated masonry, so simple
                uniform columns with ragged bottoms read fine. */}
            <Plate
              image={project.cardImage ?? project.hero}
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            <h2 className="mt-3 font-body text-[15px] font-medium text-ink">
              {project.title}
            </h2>
            <p className="type-label mt-1 text-ink-muted">
              {project.client} · {project.yearLabel ?? project.year}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
