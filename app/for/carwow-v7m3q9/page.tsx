import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { RecordingPhone } from "@/components/carwow/phone-mockups";
import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { ProjectVideo } from "@/components/work/project-video";
import { getProject } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

/**
 * Private page for a job application (Carwow). Not linked from anywhere, not
 * in the sitemap, noindex + nofollow (page metadata and an X-Robots-Tag
 * header in next.config.ts), and at an unguessable path. A static site has
 * no auth, so this is "unlisted", not "secret": anyone holding the URL can
 * open it.
 */
export const metadata: Metadata = {
  title: "Josh McKenna — for Carwow",
  robots: { index: false, follow: false, nocache: true },
};

/** The design retainer: one Story per brand on an iPhone mockup. Lines are drafts for Josh to confirm. */
const RETAINER = [
  {
    brand: "Nomad",
    line: "Hand-lettered, torn-paper launch and sale graphics. This is the 503 Sahara forged beadlock launch.",
    src: "/carwow/phone-nomad.webp",
    alt: "Nomad 503 Sahara launch Story on an iPhone",
  },
  {
    brand: "Möbelwagen",
    line: "Arched hand-lettering over desert photography. This is the Tax Return Sale.",
    src: "/carwow/phone-mw.webp",
    alt: "Möbelwagen Tax Return Sale Story on an iPhone",
  },
  {
    brand: "Raceline",
    line: "Bold red-and-black sale graphics. This is the Tax Return Sale.",
    src: "/carwow/phone-raceline.webp",
    alt: "Raceline Tax Return Sale Story on an iPhone",
  },
];

const CAMPAIGNS = ["la-pride", "kiehls-trevor-project", "levis-rainbow-rodeo"];
// Picked for square/portrait frames so the strip stays even.
const CHARACTERS = [
  "instagram-sticker",
  "voxi-pride",
  "womp-pato",
  "womp-first-3d-character",
  "sound-of-driving",
  "monocle-spot-illo",
];

/** Campaign heading, where the client name isn't how the work is known. */
const CAMPAIGN_NAME: Record<string, string> = { "la-pride": "LA Pride" };

function SectionHead({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4 border-t border-ink pt-4">
      <span className="type-label text-ink-muted">{n}</span>
      <h2 className="type-heading text-ink">{title}</h2>
    </div>
  );
}

export default function CarwowPage() {
  const honda = getProject("honda-super-n");
  const campaigns = CAMPAIGNS.map((slug) => getProject(slug)).filter(
    (p) => p !== undefined,
  );
  const characters = CHARACTERS.map((slug) => getProject(slug)).filter(
    (p) => p !== undefined,
  );

  return (
    <main className="mx-auto max-w-frame px-6 pb-32 pt-8 md:px-gutter">
      {/* Hero — Honda Super N: cars, motion and illustration in one clip. */}
      <p className="type-label text-ink-muted">
        Josh McKenna · Illustrator and designer · For Carwow
      </p>
      <h1 className="type-heading mt-4 max-w-3xl text-ink">
        Illustration, design and motion for cars.
      </h1>
      {honda?.heroVideo && (
        <div className="mt-8">
          <ProjectVideo
            video={{
              src: honda.heroVideo.src,
              alt: honda.heroVideo.alt,
              poster: honda.heroVideo.poster,
            }}
            sound
            autoplay
            ratio="16/9"
          />
          <p className="type-label mt-3 text-ink-muted">
            Honda Super N. Illustrated in Figma, animated in Cavalry.{" "}
            <Link href="/work/honda-super-n" className="underline">
              The project
            </Link>
          </p>
        </div>
      )}

      {/* 01 Campaigns */}
      <section className="mt-28">
        <SectionHead n="01" title="Campaigns" />
        <div className="mt-10 space-y-20">
          {campaigns.map((project) => {
            const images = [project.hero, ...project.gallery].slice(0, 3);
            return (
              <Reveal key={project.slug}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
                  <h3 className="type-heading text-ink">
                    {CAMPAIGN_NAME[project.slug] ?? project.client}
                  </h3>
                  <p className="type-label text-ink-muted">
                    {project.deliverables}
                  </p>
                </div>
                <p className="type-lede mt-2 max-w-2xl text-ink">
                  {project.summary}
                </p>
                <div className="-mx-6 mt-6 flex snap-x snap-mandatory scroll-px-6 items-start gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
                  {images.map((image) => (
                    <div
                      key={image.src}
                      className="w-[78%] flex-none snap-center sm:w-auto"
                    >
                      <Plate
                        image={image}
                        sizes="(max-width: 640px) 78vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
                <p className="type-label mt-4">
                  <Link href={`/work/${project.slug}`} className="underline">
                    See the project
                  </Link>
                </p>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 02 Design retainer */}
      <section className="mt-28">
        <SectionHead n="02" title="Design retainer" />
        <p className="type-lede mt-4 max-w-2xl text-ink">
          Stories for three wheel brands, as they appear in the app.
        </p>
        <div className="-mx-6 mt-12 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 md:pb-0">
          {RETAINER.map((brand) => (
            <Reveal
              key={brand.brand}
              className="w-[72%] flex-none snap-center md:w-auto"
            >
              <Image
                src={brand.src}
                alt={brand.alt}
                width={760}
                height={1034}
                sizes="(max-width: 768px) 72vw, 33vw"
                className="h-auto w-full"
              />
              <h3 className="type-heading mt-4 text-ink">{brand.brand}</h3>
              <p className="type-lede mt-2 text-ink">{brand.line}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Reels: screen recordings. Josh made the graphics, not the concept or the edit. */}
      <section className="mt-28">
        <SectionHead n="03" title="Reels" />
        <p className="type-lede mt-4 max-w-2xl text-ink">
          Graphics I made for these Reels. The ideas and direction weren&apos;t
          mine.
        </p>
        <div className="-mx-6 mt-10 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-5 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="w-[62%] flex-none snap-center md:w-auto">
              <RecordingPhone
                src={`/carwow/reel-${n}.mp4`}
                poster={`/carwow/reel-${n}-poster.webp`}
                alt={`Reel ${n}`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 04 Illustration */}
      <section className="mt-28">
        <SectionHead n="04" title="Illustration" />
        <div className="mt-8 grid grid-cols-2 items-start gap-4 md:grid-cols-6 md:gap-6">
          {characters.map((project) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="block"
            >
              <Plate
                image={project.cardImage ?? project.hero}
                sizes="(max-width: 768px) 50vw, 16vw"
              />
              <p className="type-label mt-2 text-ink-muted">
                {project.cardTitle ?? project.title}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-12">
          <a
            href="https://joshmckenna.com"
            className="type-label inline-block rounded-full bg-brand px-8 py-4 text-ink"
          >
            Full illustration portfolio
          </a>
        </div>
      </section>

      <p className="type-label mt-28 text-ink-muted">
        Josh McKenna ·{" "}
        <a href={`mailto:${siteConfig.email}`} className="underline">
          {siteConfig.email}
        </a>
      </p>
    </main>
  );
}
