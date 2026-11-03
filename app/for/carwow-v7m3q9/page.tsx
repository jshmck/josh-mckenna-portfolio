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
}: {
  images: Still[];
  sizes?: string;
}) {
  return (
    <div className="height-row -mx-6 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:gap-5 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
      {images.map((image) => (
        <div
          key={image.src}
          className="relative snap-center overflow-hidden rounded-frame bg-placeholder"
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
    "04-key-art-lockup",
    "2/3",
    "The LA Pride 2024 key art lockup",
  ),
  img("la-pride", "17-vip-entrance", "16/10", "VIP entrance"),
  img("la-pride", "06-merch-rail", "16/10", "Merch — hoodie, tee and cap"),
  img("la-pride", "16-main-stage-screen", "16/10", "The main stage"),
];

const STICKER = [
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
  img(
    "instagram-sticker",
    "05-sticker-set-hr",
    "16/9",
    "The sticker in the Pride set, on a phone",
  ),
];

const LEVIS = [
  img("levis-rainbow-rodeo", "01-poster-v2", "4/5", "The invite"),
  img("levis-rainbow-rodeo", "02-pins-trio", "2/3", "Enamel pins"),
  img("levis-rainbow-rodeo", "07-tee-front", "2/3", "The tee, worn"),
  img("levis-rainbow-rodeo", "06-cups", "2/3", "Cups at the bar"),
];

/** Nomad's 503 Sahara launch in the three formats it ran in. */
const NOMAD_FORMATS = [
  { src: "/carwow/phone-nomad-4x5.webp", label: "Feed 4:5" },
  { src: "/carwow/phone-nomad-1x1.webp", label: "Feed 1:1" },
  { src: "/carwow/phone-nomad.webp", label: "Story 9:16" },
];

const REELS = [
  { n: 1, handle: "racelinewheels", avatar: "raceline" },
  { n: 2, handle: "nomadwheel", avatar: "nomad" },
  { n: 3, handle: "nomadwheel", avatar: "nomad" },
  { n: 4, handle: "nomadwheel", avatar: "nomad" },
  { n: 5, handle: "mobelwagen", avatar: "mobelwagen" },
];

const CAR_ILLUSTRATION = [
  "ford-bronco",
  "sound-of-driving",
  "nomad-wheels-505-livery",
];
const EDITORIAL = [
  "monocle-spot-illo",
  "atlanta-magazine",
  "wsj-airpods-rich",
  "california-magazine",
];

const cardOf = (slug: string) => {
  const p = getProject(slug);
  return p ? (p.cardImage ?? p.hero) : undefined;
};

export default async function CarwowPage() {
  const honda = getProject("honda-super-n");
  const cv = getProject("citroen-2cv-concept");
  const z1 = getProject("figma-bmw-z1");
  const beefbar = getProject("beefbar-posters");
  const twingo = getProject("hello-twingo");
  const kiehls = getProject("kiehls-trevor-project");
  const all = (images: (ProjectImage | undefined)[]) =>
    Promise.all(
      images
        .filter((i): i is ProjectImage & { src: string } => !!i?.src)
        .map(still),
    );
  const [
    laPride,
    sticker,
    levis,
    kiehlsImages,
    twingoImages,
    carStills,
    editorial,
  ] = await Promise.all([
    all(LA_PRIDE),
    all(STICKER),
    all(LEVIS),
    all(kiehls ? [kiehls.hero, ...kiehls.gallery].slice(0, 4) : []),
    all(twingo ? twingo.gallery.slice(0, 6) : []),
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
        <div className="height-row -mx-6 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:w-2/3 md:gap-5 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
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
        </div>
        <p className="type-label text-ink-muted">
          Honda Super N · Citroën 2CV · BMW Z1 · Beefbar Monte Carlo
        </p>
        <Block label="Hello Twingo" href="/work/hello-twingo">
          <HeightRow
            images={twingoImages}
            sizes="(max-width: 768px) 60vw, 18vw"
          />
        </Block>
      </div>

      <Section>
        <Block label="LA Pride · 360 campaign" href="/work/la-pride">
          <HeightRow images={laPride} />
        </Block>
        <Block label="Instagram Pride Sticker" href="/work/instagram-sticker">
          <HeightRow images={sticker} />
        </Block>
        <Block label="Levi's Rainbow Rodeo" href="/work/levis-rainbow-rodeo">
          <HeightRow images={levis} />
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
      </Section>

      <Section>
        <p className="type-label text-ink-muted">
          Reels · Allied Wheel Co. · Paid social · Graphics only
        </p>
        <div className="-mx-6 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto px-6 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
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
        <Block label="Illustration · Cars">
          <HeightRow images={carStills} />
        </Block>
        <Block label="Illustration · Editorial">
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
