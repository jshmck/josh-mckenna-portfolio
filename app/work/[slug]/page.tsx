import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackToTop } from "@/components/ui/back-to-top";
import { ProjectContent } from "@/components/work/project-content";
import { ProjectStackSwipe } from "@/components/work/project-stack-swipe";
import { getProject, getProjectNeighbours, projects } from "@/lib/projects";

/** Every project is known at build time, so all detail pages prerender. */
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) return {};

  return {
    title: project.title,
    description: `${project.summary} ${project.discipline} for ${project.client}, ${project.yearLabel ?? project.year}.`,
    openGraph: {
      title: `${project.title} — Josh McKenna`,
      description: project.summary,
    },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  const { previous, next } = getProjectNeighbours(slug);

  return (
    <article>
      <ProjectStackSwipe previous={previous} next={next}>
        <ProjectContent project={project} />
      </ProjectStackSwipe>

      {/* The old Previous/All Work/Next footer nav is gone -- Back to Top
          now covers Previous/Next (reachable without scrolling past the
          whole gallery first, unlike this nav ever was), and "ALL WORK"
          was a second copy of the header's own "Work" link that ended up
          sitting in the exact same docked spot as the pill below, getting
          covered by it. "The new back to top covers the all work text
          anyway," per Josh -- rather than move it, it came out entirely.
          See BackToTop's own doc comment for the rest of this history.
          Outside ProjectStackSwipe deliberately -- these are `position:
          fixed`, and a `transform` on an ancestor (the swipe slab) would
          turn that into "fixed relative to the transformed ancestor"
          instead of the viewport, breaking their own dock/undock math. */}
      <BackToTop previous={previous} next={next} />
    </article>
  );
}
