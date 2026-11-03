import type { Metadata } from "next";
import Link from "next/link";

import {
  FeedPhone,
  RecordingPhone,
  ReelPhone,
  StoryPhone,
} from "@/components/carwow/phone-mockups";
import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { ProjectVideo } from "@/components/work/project-video";
import { getProject, type ImageRatio, type ProjectImage } from "@/lib/projects";
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

const piece = (
  src: string,
  ratio: ImageRatio,
  alt: string,
  fit?: "contain",
): ProjectImage => ({
  src: `/carwow/${src}.webp`,
  ratio,
  alt,
  fit,
});

/** The design retainer. Lines are drafts for Josh to confirm. */
const RETAINER = [
  {
    brand: "Raceline",
    line: "Launch banners and statics for the 961 to 964 wheel series, the Go Everywhere stories and a Black Friday dealer flyer.",
    pieces: [
      piece("raceline-962-maverick", "16/9", "962 Maverick launch banner"),
      piece("raceline-963-omega", "4/5", "963 Omega launch static"),
      piece("raceline-go-everywhere", "25/11", "Go Everywhere stories"),
      piece(
        "raceline-black-friday-flyer",
        "3/2",
        "Black Friday dealer flyer",
        "contain",
      ),
    ],
  },
  {
    brand: "Nomad",
    line: "Hand-lettered, torn-paper sale statics, the 503 Sahara launch and an event poster.",
    pieces: [
      piece("nomad-tax-return", "1/1", "Tax Return Sale static"),
      piece("nomad-503-sahara", "4/5", "503 Sahara launch static"),
      piece("nomad-after-party", "4/5", "After Party poster"),
      piece("nomad-sahara-stories", "16/9", "503 Sahara stories"),
    ],
  },
  {
    brand: "Möbelwagen",
    line: "Arched hand-lettering over desert photography for the Black Friday, Tax Return and King of the Hammers sales.",
    pieces: [
      piece("mobelwagen-black-friday", "1/1", "Black Friday static"),
      piece("mobelwagen-tax-return", "1/1", "Tax Return Sale static"),
      piece("mobelwagen-koh", "16/9", "King of the Hammers banner"),
      piece("mobelwagen-holiday", "1/1", "Holiday Sale static"),
    ],
  },
];

/** Brands shown as phone mockups (story, reel, feed post) plus a flat banner. */
const PHONE_SETS: Record<
  string,
  {
    label: string;
    avatar: string;
    story: { src: string; alt: string };
    reel: { src: string; alt: string; caption: string };
    feed: { src: string; alt: string; caption: string };
    banner: ProjectImage;
  }
> = {
  Nomad: {
    label: "Nomad Wheels",
    avatar: "/carwow/avatar-nomad.webp",
    story: {
      src: "/carwow/nomad-story-sahara.webp",
      alt: "503 Sahara launch story",
    },
    reel: {
      src: "/carwow/nomad-reel-tax.webp",
      alt: "Tax Return Sale reel",
      caption: "Tax Return Sale. Up to 40% off, all month long.",
    },
    feed: {
      src: "/carwow/nomad-feed-sahara.webp",
      alt: "503 Sahara launch post",
      caption: "503 Sahara forged beadlock. Now available.",
    },
    banner: piece("nomad-banner-sahara", "16/9", "503 Sahara banner"),
  },
  Möbelwagen: {
    label: "Möbelwagen",
    avatar: "/carwow/avatar-mobelwagen.webp",
    story: { src: "/carwow/mw-story-tax.webp", alt: "Tax Return Sale story" },
    reel: {
      src: "/carwow/mw-reel-tax.webp",
      alt: "Tax Return Sale reel",
      caption: "Tax Return Sale. 25% off Möbelwagen.",
    },
    feed: {
      src: "/carwow/mw-feed-tax.webp",
      alt: "Tax Return Sale post",
      caption: "Tax Return Sale. 25% off Möbelwagen.",
    },
    banner: piece("mw-banner-tax", "16/9", "Tax Return Sale banner"),
  },
};

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
          Statics, stories, banners and flyers across three wheel brands.
        </p>
        <div className="mt-12 space-y-24">
          {RETAINER.map((brand) => (
            <Reveal key={brand.brand}>
              <div className="grid gap-8 md:grid-cols-12">
                <div className="md:col-span-4">
                  <div className="md:sticky md:top-28">
                    <h3 className="type-heading text-ink">{brand.brand}</h3>
                    <p className="type-lede mt-3 text-ink">{brand.line}</p>
                  </div>
                </div>
                {PHONE_SETS[brand.brand] ? (
                  <div className="md:col-span-8">
                    <div className="-mx-6 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
                      <div className="w-[62%] flex-none snap-center md:w-auto">
                        <StoryPhone
                          brand={PHONE_SETS[brand.brand].label}
                          avatar={PHONE_SETS[brand.brand].avatar}
                          {...PHONE_SETS[brand.brand].story}
                        />
                      </div>
                      <div className="w-[62%] flex-none snap-center md:w-auto">
                        <ReelPhone
                          brand={PHONE_SETS[brand.brand].label}
                          avatar={PHONE_SETS[brand.brand].avatar}
                          {...PHONE_SETS[brand.brand].reel}
                        />
                      </div>
                      <div className="w-[62%] flex-none snap-center md:w-auto">
                        <FeedPhone
                          brand={PHONE_SETS[brand.brand].label}
                          avatar={PHONE_SETS[brand.brand].avatar}
                          {...PHONE_SETS[brand.brand].feed}
                        />
                      </div>
                    </div>
                    <div className="mt-8">
                      <Plate
                        image={PHONE_SETS[brand.brand].banner}
                        sizes="(max-width: 768px) 100vw, 66vw"
                      />
                      <p className="type-label mt-2 text-ink-muted">
                        {PHONE_SETS[brand.brand].banner.alt}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="columns-2 gap-4 md:col-span-8 md:gap-6 [&>*]:mb-4 [&>*]:break-inside-avoid md:[&>*]:mb-6">
                    {brand.pieces.map((image) => (
                      <div key={image.src}>
                        <Plate
                          image={image}
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                        <p className="type-label mt-2 text-ink-muted">
                          {image.alt}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
