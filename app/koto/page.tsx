import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";

import {
  Block,
  ClipTile,
  Row,
  Section,
  StillRow,
  StillTile,
} from "@/components/koto/page-parts";
import { ReelPhone } from "@/components/koto/phone-mockups";
import { Reveal } from "@/components/ui/reveal";
import { ProjectLightboxProvider } from "@/components/work/project-lightbox-context";
import { ProjectVideo } from "@/components/work/project-video";
import { LbTile } from "@/components/koto/lightbox-tile";
import { createLightbox, img } from "@/lib/koto-lightbox";
import { getProject } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

/**
 * Private page for a job application (Koto, Senior Designer, Special
 * Projects). Unlisted, noindex + nofollow (page metadata
 * and an X-Robots-Tag header in next.config.ts), not in the sitemap. A static
 * site has no auth, so this is "unlisted", not "secret".
 *
 * Special Projects is ideas that travel across events, merch, social and
 * film, so it leads with the work that does, not with logos.
 */
export const metadata: Metadata = {
  title: "Josh McKenna — for Koto",
  robots: { index: false, follow: false, nocache: true },
};

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

const BOMBAY = [
  img(
    "bombay-sapphire",
    "01-storefront",
    "3/2",
    "The mural in Bombay Sapphire's Shoreditch pop-up",
  ),
  img(
    "bombay-sapphire",
    "03-jacket-flatlay",
    "4/3",
    "The embroidered jacket back",
  ),
];

const REELS = [
  { n: 1, handle: "racelinewheels", avatar: "raceline" },
  { n: 3, handle: "nomadwheel", avatar: "nomad" },
  { n: 4, handle: "nomadwheel", avatar: "nomad" },
  { n: 5, handle: "mobelwagen", avatar: "mobelwagen" },
];

const EDITORIAL = [
  "vogue-sun-tan",
  "monocle-spot-illo",
  "monocle-downward-trend",
];

/** Talks already on the About page, linked out rather than re-hosted. */
const TALKS: { src: string; alt: string; label: string; href?: string }[] = [
  {
    src: "/about/config-2026-poster.jpg",
    alt: "Josh on stage at Config 2026",
    label: "Config 2026 · Sculpting in Figma Draw",
    href: "https://www.youtube.com/watch?v=0ZoW_ym83JQ",
  },
  {
    src: "/about/apple-today/01.jpg",
    alt: "Josh on stage under the Art Lab session card at Apple",
    label: "Today at Apple · Art Lab",
  },
  {
    src: "/about/nicer-tuesdays-poster.jpg",
    alt: "Josh at Nicer Tuesdays",
    label: "Nicer Tuesdays · It's Nice That",
    href: "https://www.youtube.com/watch?v=b7zTmfXE8ic",
  },
];

const cardOf = (slug: string) => {
  const p = getProject(slug);
  return p ? (p.cardImageByCategory?.Cars ?? p.cardImage ?? p.hero) : undefined;
};

export default async function KotoPage() {
  const honda = getProject("honda-super-n");
  const cv = getProject("citroen-2cv-concept");
  const z1 = getProject("figma-bmw-z1");
  const kiehls = getProject("kiehls-trevor-project");
  const sticker = getProject("instagram-sticker");
  const mrPorter = getProject("mr-porter-miami-invites");
  const hp = getProject("hp-print-over-hate");

  const { lightbox, stills, clip } = createLightbox();

  // Registered in visual order.
  const laPride = await stills(LA_PRIDE);
  const [stickerPrimary] = await stills([STICKER_PRIMARY]);
  const stickerInSitu = await stills(STICKER_IN_SITU);
  const stickerGif = clip(sticker?.galleryGif, "1/1");
  const bombay = await stills([
    ...BOMBAY,
    img(
      "bombay-sapphire",
      "07-bottles-wide",
      "4/3",
      "Fifty hand-finished bottles",
    ),
  ]);
  const invites = await stills([mrPorter?.cardImage, mrPorter?.cardHoverImage]);
  const kiehlsImages = await stills(
    kiehls ? [kiehls.hero, kiehls.gallery[0]] : [],
  );
  const editorial = await stills(EDITORIAL.map(cardOf));
  const z1Clip = clip(z1?.heroVideo, "4/5");
  const cvClip = clip(cv?.heroVideo, "4/5");
  const hondaClip = clip(honda?.heroVideo, "16/9");

  return (
    <ProjectLightboxProvider images={lightbox}>
      <main className="mx-auto max-w-frame px-6 pb-32 pt-8 md:px-gutter">
        <h1 className="type-label text-ink-muted">Josh McKenna · For Koto</h1>

        <Section first>
          <Block label="Motion">
            <Row>
              {z1Clip && <ClipTile {...z1Clip} />}
              {cvClip && <ClipTile {...cvClip} />}
              {hondaClip && <ClipTile {...hondaClip} />}
            </Row>
          </Block>
        </Section>

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
        </Section>

        <Section>
          <Block
            label="505 Touring launch · Nomad Wheels"
            href="/work/nomad-wheels-505-livery"
          >
            <ProjectVideo
              video={{
                src: "/koto/505-touring.mp4",
                alt: "The 505 Touring launch film",
                poster: "/koto/505-touring-frame.webp",
              }}
              sound
              ratio="16/9"
            />
            <p className="type-lede mt-4 max-w-[60ch] text-ink">
              A full graphic package for the launch of the 505 Touring wheel,
              built from a vintage Dakar rally look. The Land Cruiser is mine
              and that&apos;s me driving. I designed the livery, the logos in
              the film and the posters.
            </p>
          </Block>
          <div>
            <p className="type-label text-ink">Social video</p>
            <p className="type-label mb-4 mt-1 text-ink-muted">
              Graphic elements · Hand drawn elements · Poster design · Merch
              design · Logos
            </p>
            <div className="-mx-6 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto px-6 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
              {REELS.map((r) => (
                <Reveal
                  key={r.n}
                  className="w-[62%] flex-none snap-center md:w-auto"
                >
                  <ReelPhone
                    src={`/koto/reel-${r.n}.mp4`}
                    poster={`/koto/reel-${r.n}-poster.webp`}
                    handle={r.handle}
                    avatar={`/koto/avatar-${r.avatar}.webp`}
                    alt={`Reel ${r.n}`}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </Section>

        <Section>
          <Block label="Bombay Sapphire · Stir Creativity">
            <div className="space-y-3 md:space-y-5">
              <Row>
                <div
                  className="snap-center"
                  style={{ "--r": 16 / 9 } as CSSProperties}
                >
                  <ProjectVideo
                    video={{
                      src: "/about/bombay-sapphire.mp4",
                      alt: "Hypebeast's film on the Bombay Sapphire Stir Creativity campaign",
                      poster: "/about/bombay-sapphire-poster-5s.jpg",
                    }}
                    sound
                    ratio="16/9"
                    className="h-full"
                  />
                </div>
                <StillTile
                  still={bombay[0]}
                  sizes="(max-width: 768px) 80vw, 50vw"
                />
              </Row>
              <Row>
                {bombay.slice(1).map((still) => (
                  <StillTile
                    key={still.src}
                    still={still}
                    sizes="(max-width: 768px) 80vw, 50vw"
                  />
                ))}
              </Row>
            </div>
          </Block>
          {hp?.heroVideo && (
            <Block label="HP · Print Over Hate" href="/work/hp-print-over-hate">
              <ProjectVideo
                video={{
                  src: "/about/hp-latex.mp4",
                  alt: hp.heroVideo.alt,
                  poster: "/about/hp-latex-poster-50s.jpg",
                }}
                sound
                ratio="16/9"
              />
              <p className="type-lede mt-4 max-w-[60ch] text-ink">
                {hp.summary}
              </p>
            </Block>
          )}
          <div className="grid gap-16 md:grid-cols-2 md:gap-5">
            <Block
              label="Mr Porter · Miami invites"
              href="/work/mr-porter-miami-invites"
            >
              <StillRow
                stills={invites.map((still) => ({ ...still, r: 0.8 }))}
                sizes="(max-width: 768px) 60vw, 25vw"
              />
            </Block>
            <Block label="Kiehl's Pride" href="/work/kiehls-trevor-project">
              <StillRow
                stills={kiehlsImages.map((still) => ({ ...still, r: 0.8 }))}
                sizes="(max-width: 768px) 60vw, 25vw"
              />
            </Block>
          </div>
        </Section>

        <Section>
          <Block label="Editorial · Vogue and Monocle">
            <StillRow
              stills={editorial}
              sizes="(max-width: 768px) 60vw, 30vw"
            />
          </Block>
        </Section>

        <Section>
          <Block label="Talks">
            <div className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
              {TALKS.map((t) => {
                const tile = (
                  <>
                    <span className="relative block aspect-video overflow-hidden rounded-frame bg-placeholder">
                      <Image
                        src={t.src}
                        alt={t.alt}
                        fill
                        sizes="(max-width: 768px) 80vw, 33vw"
                        className="object-cover"
                      />
                    </span>
                    <span className="type-label mt-2 block text-ink">
                      {t.label}
                    </span>
                  </>
                );
                return (
                  <div
                    key={t.src}
                    className="w-[80%] flex-none snap-center md:w-auto"
                  >
                    {t.href ? (
                      <a href={t.href} className="block">
                        {tile}
                      </a>
                    ) : (
                      tile
                    )}
                  </div>
                );
              })}
            </div>
          </Block>
          <a
            href="https://joshmckenna.com"
            className="type-label inline-block rounded-full bg-brand px-8 py-4 text-ink"
          >
            Full portfolio
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
