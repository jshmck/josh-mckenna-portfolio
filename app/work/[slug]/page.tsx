import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectContent } from "@/components/work/project-content";
import { ProjectStackSwipe } from "@/components/work/project-stack-swipe";
import { getProject, getProjectNeighbours, projects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

/** Every project is known at build time, so all detail pages prerender. */
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

/**
 * No runtime fallback for unknown slugs — they 404 at the edge instead of
 * invoking a lambda. This isn't just semantics: without it, Vercel keeps a
 * fallback function for this segment whose OG-image sibling readFile()s
 * hero art out of public/, and file tracing (unable to know which file)
 * bundled the ENTIRE public/ folder — 212MB of artwork, plus sharp's 19MB
 * of native binaries — into every deployment. Six retained deployments of
 * that filled the free tier's 10GB Function Storage cap (Vercel's alert,
 * 2026-09-29). Fully static output ships the prerendered PNGs alone.
 */
export const dynamicParams = false;

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

  // Assembled from the entry's structured facts only — deliberately NOT
  // the flavour `summary` ("it needs to be matter of fact especially for
  // SEO, and not ai written," per Josh). The voiced copy stays on the
  // page itself; search engines and link previews get the plain record.
  const factualDescription = `${displayTitle} — ${project.deliverables.toLowerCase()} by illustrator Josh McKenna${
    project.client === "Personal" ? ", a personal project" : ` for ${project.client}`
  }, ${project.yearLabel ?? project.year}.`;

  return {
    title: displayTitle,
    description: factualDescription,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: `${displayTitle} — Josh McKenna`,
      description: factualDescription,
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

  // VisualArtwork structured data (SEO pass, 2026-09) — connects this
  // piece to Josh's Person entity (see app/layout.tsx) and gives search
  // engines the artwork's real facts. Built entirely from the trusted
  // lib/projects.ts entry.
  const artworkJsonLd = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: project.pageTitle ?? project.cardTitle ?? project.title,
    // Factual, matching the meta description's register — not the
    // voiced summary (see generateMetadata's comment).
    description: `${project.deliverables}${project.client === "Personal" ? ", a personal project" : ` for ${project.client}`}, ${project.yearLabel ?? project.year}.`,
    url: `${siteConfig.url}/work/${project.slug}`,
    // hero.src is optional (Plate's placeholder state) — omit `image`
    // rather than emit a broken URL for a not-yet-final entry.
    ...(project.hero.src && { image: `${siteConfig.url}${project.hero.src}` }),
    creator: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
    dateCreated: String(project.year),
    artform: project.discipline,
    ...(project.client !== "Personal" && {
      sourceOrganization: { "@type": "Organization", name: project.client },
    }),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(artworkJsonLd) }}
      />
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
