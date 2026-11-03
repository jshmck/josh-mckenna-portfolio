import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";
import type { CSSProperties, ReactNode } from "react";

import { ReelPhone } from "@/components/carwow/phone-mockups";
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
 *
 * No section titles: sections are separated by rules, and the only text is
 * small labels.
 */
export const metadata: Metadata = {
  title: "Josh McKenna — for Carwow",
  robots: { index: false, follow: false, nocache: true },
};

const img = (
  folder: string,
  file: string,
  ratio: ImageRatio,
  alt: string,
): ProjectImage => ({ src: `/work/${folder}/${file}.webp`, ratio, alt });

const num = (ratio: string) => {
  const [a, b] = ratio.split("/").map(Number);
  return a / b;
};

/** A still with its real pixel ratio, read from the file so nothing is cropped. */
type Still = { src: string; alt: string; r: number };

async function still(image: ProjectImage & { src: string }): Promise<Still> {
  const { width, height } = await sharp(
    await readFile(join(process.cwd(), "public", image.src)),
  ).metadata();
  return { src: image.src, alt: image.alt, r: (width ?? 1) / (height ?? 1) };
}

/** Images that all share one height (see .height-row in globals.css). */
function HeightRow({
  images,
  sizes = "(max-width: 768px) 60vw, 30vw",
  flush = false,
}: {
  images: Still[];
  sizes?: string;
  /** Edge to edge with square corners, so the row reads as one carousel strip. */
  flush?: boolean;
}) {
  return (
    <div
      className={`height-row -mx-6 flex snap-x snap-mandatory scroll-px-6 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden ${flush ? "" : "gap-3 md:gap-5"}`}
    >
      {images.map((image) => (
        <div
          key={image.src}
          className={`relative snap-center overflow-hidden bg-placeholder ${flush ? "" : "rounded-frame"}`}
          style={{ "--r": image.r } as CSSProperties}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

/** Equal-sized tiles, three to a row. */
function Grid3({ images }: { images: Still[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
      {images.map((image) => (
        <div
          key={image.src}
          className="relative aspect-[3/2] overflow-hidden rounded-frame bg-placeholder"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

/** A clip in a row of same-height items. */
function ClipTile({
  ratio,
  children,
}: {
  ratio: ImageRatio;
  children: ReactNode;
}) {
  return (
    <div className="snap-center" style={{ "--r": num(ratio) } as CSSProperties}>
      {children}
    </div>
  );
}

function Block({
  label,
  href,
  children,
}: {
  label: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <Reveal>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6">
        <p className="type-label text-ink">{label}</p>
        {href && (
          <Link href={href} className="type-label text-ink-muted underline">
            Project
          </Link>
        )}
      </div>
      {children}
    </Reveal>
  );
}

const Section = ({ children }: { children: ReactNode }) => (
  <section className="mt-16 space-y-16 border-t border-ink pt-8">
    {children}
  </section>
);

const LA_PRIDE = [
  img(
    "la-pride",
    "23-key-art-stage-banner",
    "3/2",
    "The key art across the main stage",
  ),
  img(
    "la-pride",
    "05-wayfinding-totem",
    "16/10",
    "Wayfinding totem, main stage and food village",
  ),
  img("la-pride", "17-vip-entrance", "16/10", "VIP entrance"),
  img("la-pride", "06-merch-rail", "16/10", "Merch — hoodie, tee and cap"),
  img(
    "la-pride",
    "10-wristbands",
    "16/10",
    "Wristbands, VIP and general admission",
  ),
  img("la-pride", "16-main-stage-screen", "16/10", "The main stage"),
];

const STICKER_PRIMARY = img(
  "instagram-sticker",
  "05-sticker-set-hr",
  "16/9",
  "The sticker in the Pride set, on a phone",
);
const STICKER_IN_SITU = [
  img(
    "instagram-sticker",
    "06-sydney-mardi-gras-1",
    "3/4",
    "The sticker as a 10ft float at Sydney Mardi Gras",
  ),
  img(
    "instagram-sticker",
    "02-facebook-mural-cropped",
    "4/5",
    "The sticker as a mural in Meta's offices",
  ),
  img(
    "instagram-sticker",
    "01-06",
    "9/16",
    "The sticker on a lifeguard tower in LA",
  ),
];

/** Nomad's 503 Sahara launch in the three formats it ran in. */
const NOMAD_FORMATS = [
  { src: "/carwow/phone-nomad-ad.webp", label: "Facebook ad · 1:1" },
  { src: "/carwow/phone-nomad-post.webp", label: "Instagram post · 4:5" },
  { src: "/carwow/phone-nomad-story.webp", label: "Instagram Story · 9:16" },
];

const REELS = [
  { n: 1, handle: "racelinewheels", avatar: "raceline" },
  { n: 3, handle: "nomadwheel", avatar: "nomad" },
  { n: 4, handle: "nomadwheel", avatar: "nomad" },
  { n: 5, handle: "mobelwagen", avatar: "mobelwagen" },
];

const CAR_ILLUSTRATION = [
  "ford-bronco",
  "palm-springs",
  "nomad-wheels-505-livery",
  "costa-smeralda",
];
const TWINGO = [1, 2, 3, 4, 5, 6].map((n) => ({
  src: `/carwow/twingo-${n}.webp`,
  alt: `Hello Twingo, slide ${n}`,
}));
const EDITORIAL = [
  "monocle-spot-illo",
  "monocle-downward-trend",
  "wsj-airpods-rich",
  "california-magazine",
];

const cardOf = (slug: string) => {
  const p = getProject(slug);
  return p ? (p.cardImageByCategory?.Cars ?? p.cardImage ?? p.hero) : undefined;
};

export default async function CarwowPage() {
  const honda = getProject("honda-super-n");
  const cv = getProject("citroen-2cv-concept");
  const z1 = getProject("figma-bmw-z1");
  const beefbar = getProject("beefbar-posters");
  const kiehls = getProject("kiehls-trevor-project");
  const sticker = getProject("instagram-sticker");
  const all = (images: (ProjectImage | undefined)[]) =>
    Promise.all(
      images
        .filter((i): i is ProjectImage & { src: string } => !!i?.src)
        .map(still),
    );
  const [
    laPride,
    stickerPrimary,
    stickerInSitu,
    kiehlsImages,
    twingoImages,
    carStills,
    editorial,
  ] = await Promise.all([
    all(LA_PRIDE),
    all([STICKER_PRIMARY]),
    all(STICKER_IN_SITU),
    all(kiehls ? [kiehls.hero, ...kiehls.gallery].slice(0, 4) : []),
    Promise.all(TWINGO.map((t) => still({ ...t, ratio: "4/5" }))),
    all(CAR_ILLUSTRATION.map(cardOf)),
    all(EDITORIAL.map(cardOf)),
  ]);

  return (
    <main className="mx-auto max-w-frame px-6 pb-32 pt-8 md:px-gutter">
      <h1 className="type-label text-ink-muted">Josh McKenna · For Carwow</h1>

      {/* Cars: Honda and the 2CV side by side, then the Z1 and Beefbar's Lambo. */}
      <div className="mt-8 space-y-10">
        {honda?.heroVideo && cv?.heroVideo && (
          <div className="height-row -mx-6 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:gap-5 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
            <ClipTile ratio="16/9">
              <ProjectVideo
                video={{
                  src: honda.heroVideo.src,
                  alt: honda.heroVideo.alt,
                  poster: honda.heroVideo.poster,
                }}
                sound
                autoplay
                ratio="16/9"
                className="h-full"
              />
            </ClipTile>
            <ClipTile ratio="4/5">
              <ProjectVideo
                video={{
                  src: cv.heroVideo.src,
                  alt: cv.heroVideo.alt,
                  poster: cv.heroVideo.poster,
                }}
                ratio="4/5"
                className="h-full"
              />
            </ClipTile>
          </div>
        )}
        <div className="height-row -mx-6 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:gap-5 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          {z1?.heroVideo && (
            <ClipTile ratio="4/5">
              <ProjectVideo
                video={{
                  src: z1.heroVideo.src,
                  alt: z1.heroVideo.alt,
                  poster: z1.heroVideo.poster,
                }}
                ratio="4/5"
                className="h-full"
              />
            </ClipTile>
          )}
          {beefbar?.posterGridVideo && (
            <ClipTile ratio="4/5">
              <ProjectVideo
                video={{
                  src: beefbar.posterGridVideo.src,
                  alt: beefbar.posterGridVideo.alt,
                  poster: beefbar.posterGridVideo.poster,
                }}
                ratio="4/5"
                className="h-full"
              />
            </ClipTile>
          )}
          {carStills.map((image) => (
            <div
              key={image.src}
              className="relative snap-center overflow-hidden rounded-frame bg-placeholder"
              style={{ "--r": image.r } as CSSProperties}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 60vw, 18vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <HeightRow
          images={twingoImages}
          sizes="(max-width: 768px) 60vw, 18vw"
          flush
        />
      </div>

      <Section>
        <Block label="LA Pride · 360 campaign" href="/work/la-pride">
          <Grid3 images={laPride} />
        </Block>
        <Block label="Instagram Pride Sticker" href="/work/instagram-sticker">
          <div className="space-y-3 md:space-y-5">
            <div className="relative aspect-video overflow-hidden rounded-frame bg-placeholder">
              <Image
                src={stickerPrimary[0].src}
                alt={stickerPrimary[0].alt}
                fill
                sizes="(max-width: 768px) 100vw, 1190px"
                className="object-cover"
              />
            </div>
            <div className="height-row -mx-6 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:gap-5 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
              {stickerInSitu.map((image) => (
                <div
                  key={image.src}
                  className="relative snap-center overflow-hidden rounded-frame bg-placeholder"
                  style={{ "--r": image.r } as CSSProperties}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 60vw, 25vw"
                    className="object-cover"
                  />
                </div>
              ))}
              {sticker?.galleryGif && (
                <ClipTile ratio="1/1">
                  <ProjectVideo
                    video={{
                      src: sticker.galleryGif.src,
                      alt: sticker.galleryGif.alt,
                      poster: sticker.galleryGif.poster,
                    }}
                    ratio="1/1"
                    className="h-full"
                  />
                </ClipTile>
              )}
            </div>
          </div>
        </Block>
        <Block label="Kiehl's Pride" href="/work/kiehls-trevor-project">
          <HeightRow images={kiehlsImages} />
        </Block>
      </Section>

      <Section>
        <p className="type-label text-ink-muted">
          Nomad · Allied Wheel Co. · Ongoing retainer · Paid social · Graphics
          only
        </p>
        <div className="-mx-6 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-6 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          {NOMAD_FORMATS.map((f) => (
            <Reveal
              key={f.src}
              className="w-[72%] flex-none snap-center md:w-auto"
            >
              <Image
                src={f.src}
                alt={`Nomad 503 Sahara launch, ${f.label}, on an iPhone`}
                width={700}
                height={1299}
                sizes="(max-width: 768px) 72vw, 33vw"
                className="h-auto w-full"
              />
              <p className="type-label mt-1 text-ink-muted">{f.label}</p>
            </Reveal>
          ))}
        </div>
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <ProjectVideo
              video={{
                src: "/carwow/505-touring.mp4",
                alt: "The 505 Touring launch film",
                poster: "/carwow/505-touring-poster.webp",
              }}
              sound
              ratio="16/9"
            />
          </div>
          <div className="md:col-span-4">
            <p className="type-label text-ink">
              505 Touring launch · Nomad Wheel Co.
            </p>
            <p className="type-lede mt-3 text-ink">
              A full graphic package for the launch of the 505 Touring wheel,
              all built from a vintage Dakar rally look. The Land Cruiser is
              mine and that&apos;s me driving. I designed the livery, the logos
              in the film and the posters.
            </p>
            <p className="type-label mt-3">
              <Link
                href="/work/nomad-wheels-505-livery"
                className="text-ink-muted underline"
              >
                Project
              </Link>
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <p className="type-label text-ink-muted">
          Reels · Allied Wheel Co. · Paid social · Graphics only
        </p>
        <div className="-mx-6 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto px-6 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          {REELS.map((r) => (
            <div key={r.n} className="w-[62%] flex-none snap-center md:w-auto">
              <ReelPhone
                src={`/carwow/reel-${r.n}.mp4`}
                poster={`/carwow/reel-${r.n}-poster.webp`}
                handle={r.handle}
                avatar={`/carwow/avatar-${r.avatar}.webp`}
                alt={`Reel ${r.n}`}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <Block label="Editorial illustration">
          <HeightRow images={editorial} />
        </Block>
        <a
          href="https://joshmckenna.com"
          className="type-label inline-block rounded-full bg-brand px-8 py-4 text-ink"
        >
          Full illustration portfolio
        </a>
      </Section>

      <p className="type-label mt-16 border-t border-ink pt-8 text-ink-muted">
        Josh McKenna ·{" "}
        <a href={`mailto:${siteConfig.email}`} className="underline">
          {siteConfig.email}
        </a>
      </p>
    </main>
  );
}
