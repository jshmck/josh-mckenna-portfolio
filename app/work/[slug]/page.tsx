import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { getProject, getProjectNeighbours, projects } from "@/lib/projects";

/**
 * All-caps display title, except 'e', 'j', 'k', 'g', 'i' and 't' stay
 * real lowercase — the same brand quirk as the homepage wordmark (jOSH /
 * MCkeNNA). Waldeck (trial) turned out to have no true descender on any
 * lowercase letter (checked the glyph outlines directly: 'g' bottoms out
 * at y=0, same as the capital 'H' — not a CSS clipping issue, the
 * letterform itself doesn't extend below the baseline), so a lone
 * lowercase 'g' just reads as an odd short letter, not a drop. Adding
 * 'i' and 't' gives it company — a run of lowercase letters together
 * (e.g. "NIgHt") reads as deliberate rather than a single outlier. Every
 * project title gets this; project.title itself keeps normal casing for
 * the breadcrumb, gallery cards and metadata.
 *
 * Waldeck (trial) also has no '&' glyph at all — confirmed against the
 * font's cmap, not just a rendering guess — so "Gus & Mabel" would fall
 * back to a different font mid-word for just that character. Spelled out
 * as "AND" instead, same as the "TALKS AND FEATURES" section title.
 */
function toDisplayTitle(title: string) {
  return title
    .replace(/&/g, "AND")
    .split("")
    .map((char) =>
      ["e", "j", "k", "g", "i", "t"].includes(char.toLowerCase())
        ? char.toLowerCase()
        : char.toUpperCase(),
    )
    .join("");
}

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

  const displayTitle = toDisplayTitle(project.title);

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

          <h1 className="type-display mt-6 max-w-4xl leading-[1.1] text-accent">
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

      {/* Previous / all / next — Waldeck + purple like the Info page's
          section titles (type-title font-medium text-accent), but at
          type-link's smaller scale: three of these sit in one row, and
          full type-title size (clamps up to 3.5rem) would dominate the
          footer and wrap badly on mobile. Generic labels instead of the
          neighbour's actual title -- the arrows plus "All Work" in the
          middle already establish these are project-to-project links, so
          "Project" on each side was redundant. type-link was already in
          globals.css for exactly this "smaller Waldeck link" role and
          had no callers yet. */}
      <nav aria-label="Project navigation">
        {/* Grid, not flex-wrap justify-between -- with three items of
            uneven width, flex-wrap can drop just the last one onto its
            own line at narrow widths instead of wrapping the whole row.
            A fixed 3-column grid guarantees each link its own slot. */}
        <div className="mx-auto grid max-w-frame grid-cols-3 items-center gap-4 px-6 py-10 md:px-gutter">
          {/* Bold-on-hover matches the primary nav's own hover treatment
              (font-medium -> font-bold); the arrow nudge is the one thing
              specific to a directional link, so it only exists here, not
              on "All Work". Plain unicode arrows, not Waldeck -- the font
              has no ← / → glyph at all (confirmed against its cmap, same
              gap as the missing '&'), so they'd silently fall back to a
              different font if left inside the type-link span; font-body
              here keeps them consistent regardless of what surrounds
              them. Went back to these after trying a custom fletched-
              arrow SVG (reverted) per Josh: preferred the plain arrows. */}
          {previous ? (
            <Link
              href={`/work/${previous.slug}`}
              className="type-link group inline-flex items-center gap-2 font-medium text-accent hover:font-bold"
            >
              <span className="font-body transition-transform group-hover:-translate-x-1">
                ←
              </span>
              PREVIOUS
            </Link>
          ) : (
            <span />
          )}

          <Link
            href="/work"
            className="type-link text-center font-medium text-accent hover:font-bold"
          >
            ALL WORK
          </Link>

          {next ? (
            <Link
              href={`/work/${next.slug}`}
              className="type-link group inline-flex items-center justify-end gap-2 font-medium text-accent hover:font-bold"
            >
              NEXT
              <span className="font-body transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </nav>
    </article>
  );
}
