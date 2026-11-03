import type { Metadata } from "next";
import Image from "next/image";

import { DriftingHero } from "@/components/home/drifting-hero";
import { LbTile } from "@/components/monzo/lightbox-tile";
import {
  Block,
  CaptionedRow,
  ClipTile,
  Row,
  RoleNote,
  Section,
  StillRow,
  StillTile,
} from "@/components/monzo/page-parts";
import { ReelPhone } from "@/components/monzo/phone-mockups";
import { Reveal } from "@/components/ui/reveal";
import { ProjectLightboxProvider } from "@/components/work/project-lightbox-context";
import { createLightbox, img } from "@/lib/monzo-lightbox";
import { getProject } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

/**
 * Private page for a job application (Monzo, brand design). Unlisted,
 * noindex + nofollow (page metadata and an X-Robots-Tag header in
 * next.config.ts), not in the sitemap. A static site has no auth, so this is
 * "unlisted", not "secret".
 *
 * Leads with the one project that shows leading a system start to finish
 * (LA Pride, with its custom type), then identity, type, in-product and
 * motion. Own components, helpers and assets: nothing is shared with /koto
 * or /carwow, so editing one page cannot move another.
 */
export const metadata: Metadata = {
  title: "Josh McKenna — for Monzo",
  robots: { index: false, follow: false, nocache: true },
};

const LA_TYPE = [
  img(
    "la-pride",
    "01-la-pride-4x5",
    "4/5",
    "The lockup on lime, with the custom PRIDE 2024 letters",
  ),
  img(
    "la-pride",
    "23-key-art-stage-banner",
    "3/2",
    "The key art across the main stage",
  ),
];

const LA_IN_USE = [
  img("la-pride", "16-main-stage-screen", "16/10", "The main stage"),
  img(
    "la-pride",
    "05-wayfinding-totem",
    "16/10",
    "Wayfinding totem, main stage and food village",
  ),
  img("la-pride", "17-vip-entrance", "16/10", "VIP entrance"),
  img("la-pride", "13-trans-lounge", "16/10", "The Trans Lounge"),
  img("la-pride", "06-merch-rail", "16/10", "Merch — hoodie, tee and cap"),
  img(
    "la-pride",
    "10-wristbands",
    "16/10",
    "Wristbands, VIP and general admission",
  ),
];

const LEVIS = [
  img("levis-rainbow-rodeo", "01-poster-v2", "4/5", "The Rainbow Rodeo invite"),
  img(
    "levis-rainbow-rodeo",
    "02-pins-trio",
    "2/3",
    "Rainbow Rodeo enamel pins, all three designs",
  ),
  img("levis-rainbow-rodeo", "06-cups", "2/3", "Rainbow Rodeo bar cups"),
  img("levis-rainbow-rodeo", "07-tee-front", "2/3", "The Rainbow Rodeo tee"),
];

const IDENTITY = {
  hsbc: img(
    "hsbc-pride-logo",
    "01-hsbc-pride-logo-hero",
    "1/1",
    "The HSBC hex, reimagined as a Pride canvas",
  ),
  kiehls: img(
    "kiehls-trevor-project",
    "01-kiehls-trevor-project-face-cream-ultra-facial-cream",
    "1/1",
    "Kiehl's Pride limited-edition packaging",
  ),
};

const TYPE = [
  img(
    "atlanta-magazine",
    "01-lgbtqiqa",
    "16/9",
    "LGBTQIA2+ as a wordmark, with figures posed in and around the letters",
  ),
  img(
    "beefbar-posters",
    "01-monte-carlo-no-border",
    "4/5",
    "Beefbar poster, Born in Monte-Carlo",
  ),
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
];

const GOOGLE_SET = img(
  "its-all-love",
  "01-overview-01",
  "1/1",
  "It's All Love, the 24-sticker set for Google",
);

const REELS = [
  { n: 1, handle: "racelinewheels", avatar: "raceline" },
  { n: 3, handle: "nomadwheel", avatar: "nomad" },
  { n: 4, handle: "nomadwheel", avatar: "nomad" },
  { n: 5, handle: "mobelwagen", avatar: "mobelwagen" },
];

export default async function MonzoPage() {
  const honda = getProject("honda-super-n");
  const cv = getProject("citroen-2cv-concept");
  const sticker = getProject("instagram-sticker");

  const { lightbox, stills, clip } = createLightbox();

  // Registered in visual order.
  const laType = await stills(LA_TYPE);
  const laInUse = await stills(LA_IN_USE);
  const hsbc = await stills([IDENTITY.hsbc]);
  const kiehls = await stills([IDENTITY.kiehls]);
  const levis = await stills(LEVIS);
  const type = await stills(TYPE);
  const [stickerPrimary] = await stills([STICKER_PRIMARY]);
  const stickerInSitu = await stills(STICKER_IN_SITU);
  const stickerGif = clip(sticker?.galleryGif, "1/1");
  const [googleSet] = await stills([GOOGLE_SET]);
  const cvClip = clip(cv?.heroVideo, "4/5");
  const hondaClip = clip(honda?.heroVideo, "16/9");

  return (
    <ProjectLightboxProvider images={lightbox}>
      <DriftingHero
        compact
        ids={[
          "ambient-1",
          "work",
          "ambient-9",
          "ambient-10",
          "ambient-hand",
          "ambient-11",
          "contact",
        ]}
      />
      <main className="mx-auto max-w-frame px-6 pb-32 md:px-gutter">
        <Section first>
          <Block>
            <StillRow
              stills={laType}
              sizes="(max-width: 768px) 70vw, 40vw"
            />
          </Block>

          <div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {laInUse.map((still) => (
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

            <RoleNote href="/work/la-pride">
              I led the full LA Pride 2024 rebrand as creative director with
              co-designer James Junk, and designed the logo, typeface,
              characters, wayfinding, maps, stage and on-screen assets,
              banners, merch and wristbands.
            </RoleNote>
          </div>
        </Section>

        <Section>
          <Block>
            <StillRow
              stills={levis}
              sizes="(max-width: 768px) 60vw, 25vw"
            />
            <RoleNote href="/work/levis-rainbow-rodeo">
              Levi&apos;s Rainbow Rodeo, Los Angeles, June 2024: I was creative
              director and illustrator. I made the invite, enamel pins, bar cups
              and tee.
            </RoleNote>
          </Block>
        </Section>

        <Section>
          <Block label="Identity">
            <CaptionedRow
              sizes="(max-width: 768px) 70vw, 30vw"
              items={[
                { still: hsbc[0], caption: "HSBC Pride" },
                { still: kiehls[0], caption: "Kiehl's Pride" },
              ]}
            />
          </Block>
        </Section>

        <Section>
          <Block label="Type and lettering">
            <CaptionedRow
              sizes="(max-width: 768px) 70vw, 30vw"
              items={[
                { still: type[0], caption: "Alphabet Soup" },
                { still: type[1], caption: "Beefbar" },
              ]}
            />
          </Block>
        </Section>

        <Section>
          <Block label="Stickers">
            <div className="space-y-3 md:space-y-5">
              <CaptionedRow
                sizes="(max-width: 768px) 80vw, 45vw"
                items={[
                  ...(stickerPrimary
                    ? [{ still: stickerPrimary, caption: "Instagram Pride Sticker" }]
                    : []),
                  ...(googleSet
                    ? [
                        {
                          still: googleSet,
                          caption: "Google, It's All Love",
                          surface: "bg-canvas",
                        },
                      ]
                    : []),
                ]}
              />
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
            <p className="type-label mt-3 text-ink-muted md:mt-5">
              Instagram Pride Sticker · a float at Sydney Mardi Gras, a mural at
              Meta, animated
            </p>
          </Block>

          <Block label="Motion">
            <Row>
              {cvClip && <ClipTile {...cvClip} />}
              {hondaClip && <ClipTile {...hondaClip} />}
            </Row>
          </Block>

          <div>
            <p className="type-label mb-4 text-ink">Social video</p>
            <p className="type-label mb-4 text-ink-muted">
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
                    src={`/monzo/reel-${r.n}.mp4`}
                    poster={`/monzo/reel-${r.n}-poster.webp`}
                    handle={r.handle}
                    avatar={`/monzo/avatar-${r.avatar}.webp`}
                    alt={`Reel ${r.n}`}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </Section>

        <Section>
          <Reveal>
            <p className="type-label mb-4 text-ink">Tools</p>
            <div className="grid items-center gap-8 md:grid-cols-2 md:gap-5">
              <div>
                <p className="type-heading max-w-[24ch] text-ink">
                  This site I built with Claude Code. I spoke at Config 2026.
                </p>
                <a
                  href="https://joshmckenna.com"
                  className="type-label mt-8 inline-block rounded-full bg-brand px-8 py-4 text-ink"
                >
                  Full portfolio
                </a>
              </div>
              <a
                href="https://www.youtube.com/watch?v=0ZoW_ym83JQ"
                className="block"
              >
                <span className="relative block aspect-video overflow-hidden rounded-frame bg-placeholder">
                  <Image
                    src="/about/config-2026-poster.jpg"
                    alt="Josh on stage at Config 2026"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </span>
                <span className="type-label mt-2 block text-ink">
                  Config 2026 · Sculpting in Figma Draw
                </span>
              </a>
            </div>
          </Reveal>
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
