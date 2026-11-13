import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

import { LbTile } from "@/components/koto/lightbox-tile";
import {
  Block,
  Row,
  Section,
  StillRow,
  StillTile,
} from "@/components/koto/page-parts";
import { ProjectLightboxProvider } from "@/components/work/project-lightbox-context";
import { ProjectVideo } from "@/components/work/project-video";
import { createLightbox, img } from "@/lib/koto-lightbox";
import { getProject, type ProjectImage } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

/**
 * Private page for a job application (Meta, Senior Brand Designer, Ads
 * design system). Unlisted, noindex + nofollow (page metadata and an
 * X-Robots-Tag header in next.config.ts), not in the sitemap. A static
 * site has no auth, so this is "unlisted", not "secret".
 *
 * Same building blocks and layout as /lego. Order is Josh's: the
 * Instagram Pride sticker (the Meta connection), the Google sticker set
 * (one visual language across many assets), the LA Pride identity
 * system, then Kiehl's and Levi's (extending an established brand), then
 * motion (the JD lists After Effects/Lottie as a plus). The Google set is
 * archived from the public site, so its card here has no Project link.
 */
export const metadata: Metadata = {
  title: "Josh McKenna — for Meta",
  description: "Selected work by Josh McKenna.",
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    title: "Josh McKenna — for Meta",
    description: "Selected work by Josh McKenna.",
  },
  twitter: {
    title: "Josh McKenna — for Meta",
    description: "Selected work by Josh McKenna.",
  },
};

const BLURB = "type-lede mt-6 max-w-[60ch] text-ink";
const TAGS = "type-label mb-4 text-ink-muted";

/* Instagram: product first (the set in Stories, the 2020 remake), then
   what it turned into outside the app. */
const IG_PRODUCT = [
  img(
    "instagram-sticker",
    "05-sticker-set-hr",
    "16/9",
    "The sticker inside Instagram Stories' Pride set, 2017",
  ),
  img(
    "instagram-sticker",
    "12-sticker-2020-remake",
    "1/1",
    "The 2020 remake, commissioned for another Pride season",
  ),
];

const IG_IMPACT = [
  img(
    "instagram-sticker",
    "06-sydney-mardi-gras-1",
    "3/4",
    "The character as a four-metre float at Sydney Mardi Gras",
  ),
  img(
    "instagram-sticker",
    "02-facebook-mural-cropped",
    "4/5",
    "The same three figures, painted inside Meta's head offices",
  ),
  img(
    "instagram-sticker",
    "04-mr-hudson-explores",
    "4/5",
    "The project and interview in Mr Hudson Explores, published by Gestalten",
  ),
];

const GOOGLE = [
  img(
    "its-all-love",
    "01-overview-01",
    "1/1",
    "The full 24-sticker Pride set for Google Allo, 2017",
  ),
  img("its-all-love", "04-hero-light", "1/1", "Four stickers from the set"),
];

const LA_PRIDE = [
  img(
    "la-pride",
    "01-la-pride-4x5-centred",
    "4/5",
    "The L.A. Pride 2024 logomark: an L and an A built out of illustrated characters",
  ),
  img("la-pride", "07-flyposted-lineup", "2/3", "Flyposted lineup poster with the site map"),
  img(
    "la-pride",
    "05-wayfinding-totem",
    "16/10",
    "Wayfinding totem, main stage and food village",
  ),
  img("la-pride", "09-lamp-post-banner", "2/3", "Lamp-post banner"),
  img("la-pride", "16-main-stage-screen", "3/2", "Assets on the main stage screen"),
  img("la-pride", "08-truck-wrap", "3/2", "Vehicle graphics on the festival truck"),
  img("la-pride", "10-wristbands", "16/10", "Wristbands, VIP and general admission"),
  img("la-pride", "06-merch-rail", "16/10", "Merch: hoodie, tee and cap"),
];

/** Per-tile crop focus for the 4/5 grid, keyed by a fragment of the file
 *  name (same values as /lego). */
const LA_PRIDE_FOCUS: Record<string, string> = {
  "05-wayfinding-totem": "85% center",
};

const KIEHLS = [
  img(
    "kiehls-trevor-project",
    "01-kiehls-trevor-project-face-cream-ultra-facial-cream",
    "1/1",
    "Limited-edition Ultra Facial Cream in the Pride packaging",
  ),
  img("kiehls-trevor-project", "02-characters-1", "1/1", "The cast of characters"),
  img("kiehls-trevor-project", "03-characters-2", "1/1", "More of the cast"),
];

const LEVIS = [
  img("levis-rainbow-rodeo", "01-poster-v2", "4/5", "The Rainbow Rodeo invite"),
  img("levis-rainbow-rodeo", "02-pins-trio", "2/3", "The three enamel pins"),
  img("levis-rainbow-rodeo", "06-cups", "2/3", "Cups at the bar"),
  img("levis-rainbow-rodeo", "07-tee-front", "2/3", "The tee, worn"),
];

const MORE: { slug: string; image?: ProjectImage; label?: string }[] = [
  { slug: "wagamama-pride" },
  { slug: "voxi-pride" },
  { slug: "hsbc-pride-logo" },
  { slug: "piper-heidsieck" },
  { slug: "bombay-sapphire" },
  { slug: "nomad-wheels-505-livery" },
];

export default async function MetaPage() {
  const ig = getProject("instagram-sticker");
  const laPride = getProject("la-pride");
  const kiehls = getProject("kiehls-trevor-project");
  const levis = getProject("levis-rainbow-rodeo");
  const z1 = getProject("figma-bmw-z1");
  const citroen = getProject("citroen-2cv-concept");

  const { lightbox, stills } = createLightbox();

  // Registered in visual order.
  const igProduct = await stills(IG_PRODUCT);
  const igImpact = await stills(IG_IMPACT);
  const google = await stills(GOOGLE);
  const laPrideStills = await stills(LA_PRIDE);
  const kiehlsStills = await stills(KIEHLS);
  const levisStills = await stills(LEVIS);

  const more = MORE.flatMap((item) => {
    const project = getProject(item.slug);
    return project ? [{ ...item, project }] : [];
  });

  return (
    <ProjectLightboxProvider images={lightbox}>
      <main className="mx-auto max-w-frame px-6 pb-32 pt-8 md:px-gutter">
        <h1 className="type-label text-ink-muted">Josh McKenna · For Meta</h1>
        <p className={BLURB}>
          Hi, I&apos;m Josh. In 2017 I drew a Pride sticker for Instagram
          Stories. It was meant to last a month and stayed in the app for
          years. Most of my work since has been the same problem at different
          sizes: drawing rules that hold from a couple of centimetres on a
          phone up to a stage header. Sticker sets, a festival identity,
          packaging across a whole product line. Since 2024 I&apos;ve also been
          the graphic designer at Allied Wheel Components, running the visual
          output for three brands, and this year I spoke at Config about
          sculpting in Figma Draw.
        </p>

        <Section first>
          <Block bold label="Instagram · Pride sticker" href="/work/instagram-sticker">
            <p className={TAGS}>
              <span className="text-ink">Iconography · Illustration · Motion</span>{" "}
              · In-product sticker · 2020 remake · Murals · Parade float
            </p>
            <div className="space-y-3 md:space-y-5">
              <Row>
                <StillTile
                  still={igProduct[0]}
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
                {ig?.heroVideo && (
                  <div className="snap-center" style={{ "--r": 1 } as CSSProperties}>
                    <ProjectVideo
                      video={{
                        src: ig.heroVideo.src,
                        alt: ig.heroVideo.alt,
                        poster: "/work/instagram-sticker/11-sticker-animation-poster.webp",
                      }}
                      autoplay
                      ratio="1/1"
                      className="h-full"
                    />
                  </div>
                )}
              </Row>
              <StillRow
                stills={igImpact}
                sizes="(max-width: 768px) 60vw, 30vw"
              />
            </div>
            <p className={BLURB}>
              Instagram&apos;s product marketing team found my work in Hello Mr
              and asked for a Pride sticker for a new Stories set, alongside
              four other LGBTQ+ artists. The character had to read at sticker
              size, a couple of centimetres on a phone, so it&apos;s bold shapes
              and a tight palette. It was meant to run for Pride month. It
              stayed embedded in the app for years, with a remake commissioned
              in 2020, and millions of people used it (Michelle Obama
              included).
            </p>
            <p className={BLURB}>
              Then it left the app: a four-metre float at Sydney Mardi Gras,
              murals at Trafalgar Square and in Meta&apos;s head offices, an
              Instagram takeover of British Vogue&apos;s account, a feature in a
              Gestalten book, and talks I&apos;m still giving.
            </p>
          </Block>
          {ig?.galleryVideo && (
            <ProjectVideo
              video={{
                src: ig.galleryVideo.src,
                alt: ig.galleryVideo.alt,
                poster: ig.galleryVideo.poster,
              }}
              sound
              ratio="16/9"
            />
          )}
        </Section>

        <Section>
          <Block bold label="Google · Pride sticker set">
            <p className={TAGS}>
              <span className="text-ink">Iconography · Illustration</span> · 24
              stickers · Google Allo · 2017
            </p>
            <Row>
              {/* The overview sheet is a transparent cut-out: contain it on
                  the canvas, like the Piper tin on /lego. */}
              <LbTile
                index={google[0].lb}
                label={google[0].alt}
                r={google[0].r}
                className="relative snap-center overflow-hidden rounded-frame bg-canvas"
              >
                <Image
                  src={google[0].src}
                  alt={google[0].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              </LbTile>
              <StillTile
                still={google[1]}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </Row>
            <p className={BLURB}>
              Twenty-four Pride stickers for Google Allo, commissioned through
              Anyways, from a finger snap to a full lesbian wedding. The job was
              keeping two dozen different characters and moments feeling like
              one set: same drawing rules, same palette, same weight at the
              same tiny size. It won an Applied Arts Photography &amp;
              Illustration Award (Conceptual Illustration, 2018).
            </p>
          </Block>
        </Section>

        <Section>
          <Block bold label="LA Pride · Identity system" href="/work/la-pride">
            {laPride && (
              <p className={TAGS}>
                <span className="text-ink">Creative lead · Brand identity</span> ·{" "}
                {laPride.deliverables}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {laPrideStills.map((still) => (
                <LbTile
                  key={still.src}
                  index={still.lb}
                  label={still.alt}
                  className="relative aspect-[4/5] overflow-hidden rounded-frame bg-placeholder"
                >
                  <Image
                    src={still.src}
                    alt={still.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                    style={{
                      objectPosition: Object.entries(LA_PRIDE_FOCUS).find(([key]) =>
                        still.src.includes(key),
                      )?.[1],
                    }}
                  />
                </LbTile>
              ))}
            </div>
            <p className={BLURB}>
              I was creative lead on the whole identity for the City of Los
              Angeles&apos; Pride festival, art-directing designer James Junk and
              working with the client team and production partners. I drew the
              characters that became the logo, we made a custom typeface
              together, and I drew the wayfinding icons and maps.
            </p>
            <p className={BLURB}>
              From there it was a system, not a set of one-offs: the same
              drawing, type and colour rules applied by different suppliers
              across posters, signage, banners, stage livery, vehicle graphics,
              venue screens, wristbands and merch. The hard part was making it
              hold from a stage header down to a cap badge.
            </p>
          </Block>
        </Section>

        <Section>
          <Block bold label="Kiehl's · Global Pride campaign" href="/work/kiehls-trevor-project">
            {kiehls && (
              <p className={TAGS}>
                <span className="text-ink">Illustration</span> ·{" "}
                {kiehls.deliverables}
              </p>
            )}
            <StillRow
              stills={kiehlsStills}
              sizes="(max-width: 768px) 60vw, 30vw"
            />
            <p className={BLURB}>
              Kiehl&apos;s 2023 global Pride campaign, in support of The Trevor
              Project, through Havas. A parade scene built to sit inside
              Kiehl&apos;s existing packaging across the product line, then
              carried into the campaign advertising and onto a float in the NYC
              Pride parade. My characters, their brand.
            </p>
          </Block>
        </Section>

        <Section>
          <Block bold label="Levi's · Rainbow Rodeo" href="/work/levis-rainbow-rodeo">
            {levis && (
              <p className={TAGS}>
                <span className="text-ink">Illustration · Creative direction</span> ·{" "}
                {levis.deliverables}
              </p>
            )}
            <StillRow
              stills={levisStills}
              sizes="(max-width: 768px) 60vw, 25vw"
            />
            <p className={BLURB}>
              Levi&apos;s Pride 2024 event at Levi&apos;s Haus, LA. Invite, enamel
              pins, bar accessories and a tee, riffing on Levi&apos;s western
              Americana with the cowboys made explicitly queer. Everything had
              to stay clear at the size of an enamel pin. Used at the event and
              across Levi&apos;s social channels.
            </p>
          </Block>
        </Section>

        {(z1?.heroVideo || citroen?.heroVideo) && (
          <Section>
            <Block bold label="Motion">
              <p className={TAGS}>
                <span className="text-ink">Animation</span> · Cavalry · Figma
              </p>
              <Row>
                {[z1, citroen].map((project) =>
                  project?.heroVideo ? (
                    <div
                      key={project.slug}
                      className="snap-center"
                      style={{ "--r": 4 / 5 } as CSSProperties}
                    >
                      <ProjectVideo
                        video={{
                          src: project.heroVideo.src,
                          alt: project.heroVideo.alt,
                          poster: project.heroVideo.poster,
                        }}
                        sound
                        autoplay
                        ratio="4/5"
                        className="h-full"
                      />
                    </div>
                  ) : null,
                )}
              </Row>
              <p className={BLURB}>
                I animate my own illustration now, built in Figma and moved in
                Cavalry: the BMW Z1 and the Citroën 2CV.
              </p>
            </Block>
          </Section>
        )}

        <Section>
          <Block bold label="More">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {more.map(({ project, image, label }) => {
                const card = image ?? project.cardImage ?? project.hero;
                return (
                  <Link
                    key={project.slug}
                    href={`/work/${project.slug}`}
                    className="group block"
                  >
                    {/* Transparent cut-outs (fit: contain, e.g. the Piper
                        tin) sit whole on the canvas, not cropped over the
                        brand-blue placeholder surface. */}
                    <div
                      className={`relative aspect-[4/5] overflow-hidden rounded-frame ${card.fit === "contain" ? "bg-canvas" : "bg-placeholder"}`}
                    >
                      {card.src && (
                        <Image
                          src={card.src}
                          alt={card.alt}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className={`${card.fit === "contain" ? "object-contain" : "object-cover"} transition-transform duration-300 ease-drift group-hover:scale-[1.02]`}
                        />
                      )}
                    </div>
                    <p className="type-label mt-3 text-ink underline underline-offset-4">
                      {label ?? `${project.client} · ${project.cardTitle ?? project.title}`}
                    </p>
                  </Link>
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
