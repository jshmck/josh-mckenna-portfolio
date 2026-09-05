import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

  // Same fallback chain as ProjectContent's own displayTitle — the
  // browser tab/OG title should always match what the page's H1 actually
  // shows, pageTitle included (see its own doc comment in lib/projects.ts).
  const displayTitle = project.pageTitle ?? project.cardTitle ?? project.title;

  return {
    title: displayTitle,
    description: `${project.summary} ${project.discipline} for ${project.client}, ${project.yearLabel ?? project.year}.`,
    openGraph: {
      title: `${displayTitle} — Josh McKenna`,
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
      <ProjectStackSwipe slug={slug} previous={previous} next={next}>
        <ProjectContent project={project} />
      </ProjectStackSwipe>

      {/* No floating navigation any more -- BackToTop's frosted
          Previous/Next circles and centre pill (this page's third
          generation of project-to-project nav, after the footer nav
          and the merged pill) are gone entirely: "I dont want the
          bubbly frost nav bars to live anywhere but the header. that's
          the language," per Josh. Prev/next lives in the breadcrumb
          line inside ProjectContent now (with the mobile swipe dots),
          and the end-of-page NEXT PROJECT teaser + inline BACK TO TOP
          cover the bottom of the page -- all in normal flow, nothing
          fixed, nothing frosted. */}
    </article>
  );
}
