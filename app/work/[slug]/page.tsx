import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
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
    description: `${project.summary} ${project.discipline} for ${project.client}, ${project.year}.`,
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
  const [firstImage, secondImage, ...restImages] = project.gallery;

  const meta = [
    { label: "Client", value: project.client },
    { label: "Year", value: String(project.year) },
    { label: "Discipline", value: project.discipline },
    { label: "Deliverables", value: project.deliverables },
  ];

  /* Same brand quirk as WORk/INfO — one lowercase letter, same cap-height
     in Waldeck, everything else caps. Display-only, and only this project:
     project.title itself stays "L.A. Pride" for the breadcrumb, gallery
     card and metadata. */
  const displayTitle =
    project.slug === "la-pride" ? "L.A. PRIDe" : project.title;

  return (
    <article>
      <header className="px-6 py-16 md:px-gutter md:py-[60px]">
        <div className="mx-auto max-w-frame">
          <p className="type-label text-ink/60">
            <Link href="/work" className="transition-opacity hover:opacity-70">
              Work
            </Link>
            {"  /  "}
            {project.title}
          </p>

          <h1 className="type-display mt-6 max-w-4xl text-accent">
            {displayTitle}
          </h1>

          <dl className="mt-8 flex flex-wrap gap-x-16 gap-y-6">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="type-label text-ink/60">{item.label}</dt>
                <dd className="mt-1.5 font-body text-[15px] font-medium text-ink">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Hero */}
      <div className="mx-auto max-w-frame px-6 pt-12 md:px-gutter">
        <Plate
          image={project.hero}
          sizes="(max-width: 1344px) 100vw, 1344px"
          priority
        />
        <p className="type-label mt-3 text-ink-muted">{project.heroCaption}</p>
      </div>

      {/* Write-up + sticky credits */}
      <div className="mx-auto grid max-w-frame gap-14 px-6 py-20 md:grid-cols-[1fr_260px] md:px-gutter">
        <div className="max-w-2xl">
          <h2 className="type-heading text-ink">
            The brief, in Josh&apos;s words.
          </h2>
          {project.brief.map((paragraph, index) => (
            <p key={index} className="type-lede mt-6 text-ink-muted">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Pins while the write-up scrolls past, per the wireframe. */}
        <aside className="h-fit md:sticky md:top-[112px]">
          <h3 className="type-label text-ink">Credits</h3>
          <dl className="mt-5 space-y-4">
            {project.credits.map((credit) => (
              <div key={credit.role}>
                <dt className="type-label text-ink-muted">{credit.role}</dt>
                <dd className="mt-1 font-body text-[15px] font-medium text-ink">
                  {credit.name}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      {/* Image stack — first two as a two-up, the rest full width. */}
      <div className="mx-auto max-w-frame space-y-8 px-6 pb-20 md:px-gutter">
        {(firstImage || secondImage) && (
          <div className="grid gap-8 md:grid-cols-2">
            {[firstImage, secondImage].filter(Boolean).map((image, index) => (
              <Reveal key={image.alt} delay={index * 110}>
                <Plate image={image} sizes="(max-width: 768px) 100vw, 50vw" />
                <p className="type-label mt-3 text-ink-muted">{image.alt}</p>
              </Reveal>
            ))}
          </div>
        )}

        {restImages.map((image) => (
          <Reveal key={image.alt}>
            <Plate image={image} sizes="(max-width: 1344px) 100vw, 1344px" />
            <p className="type-label mt-3 text-ink-muted">{image.alt}</p>
          </Reveal>
        ))}
      </div>

      {/* Previous / all / next */}
      <nav aria-label="Project navigation">
        <div className="mx-auto flex max-w-frame flex-wrap items-center justify-between gap-4 px-6 py-10 md:px-gutter">
          {previous ? (
            <Link
              href={`/work/${previous.slug}`}
              className="type-label text-ink-muted transition-colors hover:text-accent"
            >
              ← {previous.title}
            </Link>
          ) : (
            <span />
          )}

          <Link
            href="/work"
            className="type-label text-ink transition-colors hover:text-accent"
          >
            All work
          </Link>

          {next ? (
            <Link
              href={`/work/${next.slug}`}
              className="type-label text-ink-muted transition-colors hover:text-accent"
            >
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </nav>
    </article>
  );
}
