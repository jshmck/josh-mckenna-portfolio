import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import sharp from "sharp";
import type { CSSProperties, ReactNode } from "react";

import { LbTile } from "@/components/carwow/lightbox-tile";
import { LikeSpot, type LikeBox } from "@/components/carwow/like-spot";
import { ReelPhone } from "@/components/carwow/phone-mockups";
import { Reveal } from "@/components/ui/reveal";
import { ProjectLightboxProvider } from "@/components/work/project-lightbox-context";
import { ProjectVideo } from "@/components/work/project-video";
import { getProject, type ImageRatio, type ProjectImage } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

/**
 * Private page for a job application (Carwow). Not linked from anywhere, not
 * in the sitemap, noindex + nofollow (page metadata and an X-Robots-Tag
 * header in next.config.ts). A static site has no auth, so this is
 * "unlisted", not "secret": anyone who types /carwow can open it.
 *
 * No section titles: sections are separated by rules, and the only text is
 * small labels. Every still and silent clip opens one shared lightbox.
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

const NEAREST: [ImageRatio, number][] = [
  ["1/1", 1],
  ["2/3", 2 / 3],
  ["4/5", 0.8],
  ["3/4", 0.75],
  ["4/3", 4 / 3],
  ["5/4", 1.25],
  ["3/2", 1.5],
  ["16/10", 1.6],
  ["9/16", 9 / 16],
  ["16/9", 16 / 9],
];
const nearestRatio = (r: number): ImageRatio =>
  NEAREST.reduce((best, c) =>
    Math.abs(c[1] - r) < Math.abs(best[1] - r) ? c : best,
  )[0];

/** A still with its real pixel ratio (read from the file, so nothing is
 *  cropped) and its place in the lightbox. */
type Still = { src: string; alt: string; r: number; lb: number };

const RAW_ROW =
  "height-row -mx-6 flex snap-x snap-mandatory scroll-px-6 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden";

const FIT_ROW = "fit-row flex";

/** A row whose items all share one height (see .fit-row in globals.css): side by
 *  side at every width, no swiping. `tight` strips (Hello Twingo) stay a swipe
 *  carousel on phones. */
function Row({
  tight = false,
  children,
}: {
  tight?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`${tight ? RAW_ROW : FIT_ROW} ${tight ? "gap-1" : "gap-3 md:gap-5"}`}>
      {children}
    </div>
  );
}

function StillTile({
  still,
  sizes,
  tight = false,
}: {
  still: Still;
  sizes: string;
  tight?: boolean;
}) {
  return (
    <LbTile
      index={still.lb}
      label={still.alt}
      r={still.r}
      className={`relative snap-center overflow-hidden bg-placeholder ${tight ? "rounded-[3px]" : "rounded-frame"}`}
    >
      <Image
        src={still.src}
        alt={still.alt}
        fill
        sizes={sizes}
        className="object-cover"
      />
    </LbTile>
  );
}

function StillRow({
  stills,
  sizes = "(max-width: 768px) 60vw, 30vw",
  tight = false,
}: {
  stills: Still[];
  sizes?: string;
  tight?: boolean;
}) {
  return (
    <Row tight={tight}>
      {stills.map((still) => (
        <StillTile key={still.src} still={still} sizes={sizes} tight={tight} />
      ))}
    </Row>
  );
}

/** A silent looping clip that opens the lightbox. */
function ClipTile({
  src,
  poster,
  alt,
  ratio,
  lb,
}: {
  src: string;
  poster: string;
  alt: string;
  ratio: ImageRatio;
  lb: number;
}) {
  const [a, b] = ratio.split("/").map(Number);
  return (
    <LbTile
      index={lb}
      label={alt}
      r={a / b}
      className="relative snap-center overflow-hidden rounded-frame"
    >
      <ProjectVideo
        video={{ src, alt, poster }}
        ratio={ratio}
        radius=""
        className="h-full"
      />
    </LbTile>
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

/** A row of iPhone mockups: two across on a phone, four from md. Look-only, like the Reels. */
function PhoneRow({
  phones,
  brand,
}: {
  phones: { src: string; label: string; like: LikeBox }[];
  brand: string;
}) {
  return (
    <div className="grid grid-cols-2 items-start gap-4 md:grid-cols-4 md:gap-6">
      {phones.map((f) => (
        <Reveal key={f.src}>
          <div className="relative [container-type:inline-size]">
            <Image
              src={f.src}
              alt={`${brand}, ${f.label}, on an iPhone`}
              width={700}
              height={1299}
              sizes="(max-width: 768px) 62vw, 25vw"
              className="h-auto w-full"
            />
            <LikeSpot box={f.like} />
          </div>
          <p className="type-label mt-1 text-ink-muted">{f.label}</p>
        </Reveal>
      ))}
    </div>
  );
}

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

/** Nomad's Tax Return Sale in the four formats it ran in. */
const NOMAD_FORMATS: { src: string; label: string; like: LikeBox }[] = [
  {
    src: "/carwow/phone-nomad-b-ad.webp",
    label: "Facebook ad · 1:1",
    like: { kind: "like", x: 83, y: 1217, w: 96, h: 40 },
  },
  {
    src: "/carwow/phone-nomad-b-post.webp",
    label: "Instagram post · 4:5",
    like: { kind: "heart", x: 24, y: 1219, w: 46, h: 46 },
  },
  {
    src: "/carwow/phone-nomad-b-story.webp",
    label: "Instagram Story · 9:16",
    like: { kind: "heart", x: 623, y: 1552, w: 44, h: 44 },
  },
  {
    src: "/carwow/phone-nomad-b-banner.webp",
    label: "Video banner ad · 16:9",
    like: { kind: "count", x: 24, y: 769, w: 129, h: 66 },
  },
];

const MOBELWAGEN_FORMATS: { src: string; label: string; like: LikeBox }[] = [
  {
    src: "/carwow/phone-mw-c-ad.webp",
    label: "Facebook ad · 1:1",
    like: { kind: "like", x: 83, y: 1217, w: 96, h: 40 },
  },
  {
    src: "/carwow/phone-mw-c-post.webp",
    label: "Instagram post · 4:5",
    like: { kind: "heart", x: 24, y: 1219, w: 46, h: 46 },
  },
  {
    src: "/carwow/phone-mw-c-story.webp",
    label: "Instagram Story · 9:16",
    like: { kind: "heart", x: 623, y: 1552, w: 44, h: 44 },
  },
  {
    src: "/carwow/phone-mw-banner.webp",
    label: "Video banner ad · 16:9",
    like: { kind: "count", x: 24, y: 807, w: 129, h: 66 },
  },
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

  // The shared lightbox, in page order. Each tile registers itself and keeps
  // the index; the array is complete before the provider renders.
  const lightbox: ProjectImage[] = [];
  const reg = (image: ProjectImage) => lightbox.push(image) - 1;

  const measure = async (image: ProjectImage & { src: string }) => {
    const { width, height } = await sharp(
      await readFile(join(process.cwd(), "public", image.src)),
    ).metadata();
    return (width ?? 1) / (height ?? 1);
  };
  const stills = async (
    images: (ProjectImage | undefined)[],
  ): Promise<Still[]> => {
    const ok = images.filter(
      (i): i is ProjectImage & { src: string } => !!i?.src,
    );
    const ratios = await Promise.all(ok.map(measure));
    return ok.map((image, i) => ({
      src: image.src,
      alt: image.alt,
      r: ratios[i],
      lb: reg({ ...image, ratio: nearestRatio(ratios[i]) }),
    }));
  };
  // Clips register a poster + video pair.
  const clip = (
    video: { src: string; poster?: string; alt: string } | undefined,
    ratio: ImageRatio,
  ) =>
    video?.poster
      ? {
          ...video,
          poster: video.poster,
          ratio,
          lb: reg({
            src: video.poster,
            ratio,
            alt: video.alt,
            video: { src: video.src },
          }),
        }
      : undefined;

  // Registered in visual order.
  const cvClip = clip(cv?.heroVideo, "4/5");
  const z1Clip = clip(z1?.heroVideo, "4/5");
  const lamboClip = clip(beefbar?.posterGridVideo, "4/5");
  const [bronco, palm, nomad505, romazzino] = await stills(
    CAR_ILLUSTRATION.map(cardOf),
  );
  const twingoSlides = await stills(getProject("hello-twingo")?.gallery ?? []);
  const laPride = await stills(LA_PRIDE);
  const [stickerPrimary] = await stills([STICKER_PRIMARY]);
  const stickerInSitu = await stills(STICKER_IN_SITU);
  const stickerGif = clip(sticker?.galleryGif, "1/1");
  const kiehlsImages = await stills(
    kiehls ? [kiehls.hero, ...kiehls.gallery].slice(0, 4) : [],
  );
  const phones = NOMAD_FORMATS;
  const mwPhones = MOBELWAGEN_FORMATS;
  const editorial = await stills(EDITORIAL.map(cardOf));

  return (
    <ProjectLightboxProvider images={lightbox}>
      <main className="mx-auto max-w-frame px-6 pb-32 pt-8 md:px-gutter">
        <h1 className="type-label text-ink-muted">Josh McKenna · For Carwow</h1>

        <div className="mt-8 space-y-10">
          {/* Honda and the 2CV, then two rows of three. */}
          {honda?.heroVideo && (
            <Row>
              <div
                className="snap-center"
                style={{ "--r": 16 / 9 } as CSSProperties}
              >
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
              </div>
              {cvClip && <ClipTile {...cvClip} />}
            </Row>
          )}
          <Row>
            {z1Clip && <ClipTile {...z1Clip} />}
            {lamboClip && <ClipTile {...lamboClip} />}
            {bronco && (
              <StillTile still={bronco} sizes="(max-width: 768px) 60vw, 30vw" />
            )}
          </Row>
          <Row>
            {palm && (
              <StillTile still={palm} sizes="(max-width: 768px) 60vw, 30vw" />
            )}
            {nomad505 && (
              <StillTile
                still={nomad505}
                sizes="(max-width: 768px) 60vw, 30vw"
              />
            )}
            {romazzino && (
              <StillTile
                still={romazzino}
                sizes="(max-width: 768px) 60vw, 30vw"
              />
            )}
          </Row>
          {/* Hello Twingo: separate slides in a strip, each its own lightbox page. */}
          <StillRow
            stills={twingoSlides}
            sizes="(max-width: 768px) 60vw, 18vw"
            tight
          />
        </div>

        <Section>
          <Block label="LA Pride · 360 campaign" href="/work/la-pride">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {laPride.map((still) => (
                <LbTile
                  key={still.src}
                  index={still.lb}
                  label={still.alt}
                  className="relative aspect-[3/2] overflow-hidden rounded-frame bg-placeholder"
                >
                  <Image
                    src={still.src}
                    alt={still.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                </LbTile>
              ))}
            </div>
          </Block>
          <Block label="Instagram Pride Sticker" href="/work/instagram-sticker">
            <div className="space-y-3 md:space-y-5">
              {stickerPrimary && (
                <LbTile
                  index={stickerPrimary.lb}
                  label={stickerPrimary.alt}
                  className="relative aspect-video w-full overflow-hidden rounded-frame bg-placeholder"
                >
                  <Image
                    src={stickerPrimary.src}
                    alt={stickerPrimary.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 1190px"
                    className="object-cover"
                  />
                </LbTile>
              )}
              <Row>
                {stickerInSitu.map((still) => (
                  <StillTile
                    key={still.src}
                    still={still}
                    sizes="(max-width: 768px) 60vw, 25vw"
                  />
                ))}
                {stickerGif && <ClipTile {...stickerGif} />}
              </Row>
            </div>
          </Block>
          <Block label="Kiehl's Pride" href="/work/kiehls-trevor-project">
            <StillRow stills={kiehlsImages} />
          </Block>
        </Section>

        <Section>
          <div>
            <h2 className="type-heading text-ink">Graphic design</h2>
            <p className="type-label mt-2 text-ink-muted">
              Allied Wheel Components · Static ads · Graphic elements · Logos
            </p>
          </div>
          <p className="type-label text-ink">Nomad</p>
          <PhoneRow phones={phones} brand="Nomad Tax Return Sale" />
          <p className="type-label text-ink">Möbelwagen</p>
          <PhoneRow phones={mwPhones} brand="Möbelwagen Tax Return Sale" />
          {/* Three phone columns wide, so the film and its caption end where the third phone does. */}
          <div className="md:mx-auto md:w-[calc(75%-6px)]">
            <ProjectVideo
              video={{
                src: "/carwow/505-touring-v2.mp4",
                alt: "The 505 Touring launch film",
                poster: "/carwow/505-touring-frame-v5.webp",
              }}
              sound
              ratio="16/9"
            />
            <div className="mt-4">
              <p className="type-label text-ink">
                505 Touring launch · Nomad Wheels{" "}
                <Link
                  href="/work/nomad-wheels-505-livery"
                  className="text-ink-muted underline"
                >
                  Project
                </Link>
              </p>
              <p className="type-lede mt-2 text-ink">
                A full graphic package for the launch of the 505 Touring wheel,
                built from a vintage Dakar rally look. The Land Cruiser is mine
                and that&apos;s me driving. I designed the livery, the logos in
                the film and the posters.
              </p>
            </div>
          </div>
        </Section>

        <Section>
          <div>
            <p className="type-label text-ink">Social video</p>
            <p className="type-label mt-1 text-ink-muted">
              Graphic elements · Hand drawn elements · Poster design · Merch
              design · Logos
            </p>
          </div>
          <div className="-mx-6 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto px-6 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
            {REELS.map((r) => (
              <div
                key={r.n}
                className="w-[62%] flex-none snap-center md:w-auto"
              >
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
            <div className="space-y-3 md:space-y-5">
              <StillRow
                stills={editorial.slice(0, 2)}
                sizes="(max-width: 768px) 60vw, 45vw"
              />
              <StillRow
                stills={editorial.slice(2)}
                sizes="(max-width: 768px) 60vw, 45vw"
              />
            </div>
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
    </ProjectLightboxProvider>
  );
}
