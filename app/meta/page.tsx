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
 * system, the Nomad 505 Touring launch (a brand toolkit, same section as
 * /lego's lead), then Kiehl's and Levi's (extending an established brand), then
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

/* The 505 Touring launch, same stills as /lego's lead section: the
   livery sheet and the side profile lead, the film follows, then the
   suit, apparel, print-ready artwork and the event flyer. */
const FIVE_OH_FIVE = [
  img("nomad-wheels-505-livery", "07-livery-sheet-v6", "4/5", "Livery sheet: front, rear and both sides"),
  img("nomad-wheels-505-livery", "03-desert-side-profile", "3/2", "The Land Cruiser in profile at speed, livery side-on"),
  img("nomad-wheels-505-livery", "05-helmet-door", "3/2", "Right side, matching livery: Josh wearing a custom race suit with the logos applied"),
  img("nomad-wheels-505-livery", "06-apparel", "3/2", "Apparel with the livery graphics, front and back"),
  img("nomad-wheels-505-livery", "01-nomad-505", "4/5", "The full print-ready livery artwork"),
  img("nomad-wheels-505-livery", "01-socials-02", "1/1", "505 Touring release event flyer"),
];

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
];

export default async function MetaPage() {
  const ig = getProject("instagram-sticker");
  const nomad = getProject("nomad-wheels-505-livery");
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
  const nomadStills = await stills(FIVE_OH_FIVE);
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
          I’m Josh, a brand designer and illustrator working across visual
          identity, digital products and graphic systems. I’m interested in how
          a strong visual idea can become a flexible system, working just as
          well as a small in-product icon as it does across a campaign or
          physical space.
        </p>
        <p className={BLURB}>
          In 2017, I created the Pride sticker for Instagram Stories. It was
          designed to be temporary, but stayed in the product for five years.
          Since then, I’ve continued working across brand systems, iconography
          and digital experiences, most recently developing visual identities
          and campaign systems for three automotive brands. I’m interested in
          the space where brand and product meet, and how design systems can
          make that experience feel consistent without losing character.
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
              Instagram&apos;s product marketing team discovered
              my work in Hello Mr and commissioned a Pride sticker
              for a new Instagram Stories set, alongside four
              other LGBTQ+ artists.
            </p>
            <p className={BLURB}>
              The character needed to read at just a couple of
              centimetres on a phone screen, so I focused on bold
              shapes, a limited palette and a clear silhouette.
              Originally intended for Pride month, the sticker
              remained in the app for years. A second version was
              commissioned in 2020, and it went on to be used by
              millions of people.
            </p>
            <p className={BLURB}>
              Its life extended well beyond the product: from a
              four-metre float at Sydney Mardi Gras to murals in
              Trafalgar Square and Meta&apos;s offices, an
              Instagram takeover of British Vogue, and inclusion
              in a Gestalten book. It&apos;s still a project
              I&apos;m asked to speak about today.
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
          <Block bold label="Google · Pride stickers">
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
              Twenty-four Pride stickers for Google Allo,
              commissioned through Anyways. The set ranged from a
              finger snap to a full lesbian wedding.
            </p>
            <p className={BLURB}>
              The challenge was making two dozen different
              characters and moments feel like one coherent
              family. I developed a consistent set of drawing
              rules, proportions, palette and visual weight so
              every sticker felt part of the same system, even at
              a very small size.
            </p>
            <p className={BLURB}>
              The project received an Applied Arts Photography
              &amp; Illustration Award in 2018.
            </p>
          </Block>
        </Section>

        <Section>
          <Block bold label="LA Pride · Visual identity" href="/work/la-pride">
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
              Creative lead on the visual identity for the City of
              Los Angeles&apos; Pride festival. I art-directed
              designer James Junk, worked with the client team and
              production partners, and developed the visual
              direction across the project.
            </p>
            <p className={BLURB}>
              I drew the characters that became the logo and the
              wayfinding icons and maps, and worked with James on
              a custom typeface. Together, we built a visual
              system that could be applied consistently across
              posters, signage, banners, stage graphics, vehicle
              graphics, venue screens, wristbands and merchandise.
            </p>
            <p className={BLURB}>
              The challenge was making one identity work across a
              huge range of formats, scales and production
              methods, from a stage header to a small cap badge.
            </p>
          </Block>
        </Section>

        <Section>
          <Block bold label="Nomad Wheels · 505 Touring launch" href="/work/nomad-wheels-505-livery">
            {nomad && (
              <p className={TAGS}>
                <span className="text-ink">Brand toolkit · Graphic design</span> ·{" "}
                {nomad.deliverables}
              </p>
            )}
            <div className="space-y-3 md:space-y-5">
              <StillRow
                stills={nomadStills.slice(0, 2)}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {nomad?.heroVideo && (
                <ProjectVideo
                  video={{
                    src: nomad.heroVideo.src,
                    alt: nomad.heroVideo.alt,
                    poster: nomad.heroVideo.poster,
                  }}
                  sound
                  ratio="16/9"
                />
              )}
            </div>
            <p className={BLURB}>
              A launch toolkit for Nomad Wheels&apos; 505 Touring wheel, built
              from a vintage Dakar rally look: the identity, livery and wrap
              graphics, posters, apparel and a race suit, all prepared as
              production-ready artwork. It sits inside my role at Allied Wheel
              Components, where I keep three brands (Nomad, Raceline and
              Möbelwagen) consistent across social ads in every format, print,
              video and merch.
            </p>
          </Block>
          <div className="space-y-3 md:space-y-5">
            <StillRow
              stills={nomadStills.slice(2, 4)}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <StillRow
              stills={nomadStills.slice(4)}
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        </Section>

        <Section>
          <Block bold label="Kiehl's · Pride campaign" href="/work/kiehls-trevor-project">
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
              Illustration for Kiehl&apos;s 2023 global Pride
              campaign, supporting The Trevor Project, through
              Havas.
            </p>
            <p className={BLURB}>
              I created a parade scene that was designed to sit
              within Kiehl&apos;s existing packaging system, on
              the limited-edition Ultra Facial Cream. The
              illustrations were then carried through into
              campaign advertising and a float at the New York
              City Pride parade.
            </p>
          </Block>
        </Section>

        <Section>
          <Block bold label="Levi's · Pride 2024" href="/work/levis-rainbow-rodeo">
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
              Illustration and graphics for Levi&apos;s Pride
              event at Levi&apos;s Haus in Los Angeles. The work
              included invitations, enamel pins, bar accessories
              and a T-shirt, drawing on Levi&apos;s western
              Americana and giving it a distinctly queer
              perspective.
            </p>
            <p className={BLURB}>
              The illustrations had to remain clear and
              recognisable at very different sizes, particularly
              on small enamel pins. The work appeared at the event
              and across Levi&apos;s social channels.
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
                {[
                  z1?.heroVideo && { key: "z1", ...z1.heroVideo, sound: true },
                  citroen?.heroVideo && { key: "2cv", ...citroen.heroVideo, sound: true },
                  // The Monte Carlo Miura from the home page: its silent card
                  // clip, so no sound control.
                  {
                    key: "miura",
                    src: "/work/beefbar-posters/15-monte-carlo-lambo-card.mp4",
                    alt: "Monte Carlo poster animated, a Lamborghini Miura outside the Casino de Monte-Carlo",
                    poster: "/work/beefbar-posters/15-monte-carlo-lambo-poster.webp",
                    sound: false,
                  },
                ].map((clip) =>
                  clip ? (
                    <div
                      key={clip.key}
                      className="snap-center"
                      style={{ "--r": 4 / 5 } as CSSProperties}
                    >
                      <ProjectVideo
                        video={{ src: clip.src, alt: clip.alt, poster: clip.poster }}
                        sound={clip.sound}
                        autoplay
                        ratio="4/5"
                        className="h-full"
                      />
                    </div>
                  ) : null,
                )}
              </Row>
              <p className={BLURB}>
                I animate my own illustration now, built in Figma and keyframed
                in Cavalry: the BMW Z1, Citroën 2CV and Lambo Miura.
              </p>
            </Block>
          </Section>
        )}

        <Section>
          <Block bold label="More">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {more.map(({ project, image, label }) => {
                const card = image ?? project.cardImage ?? project.hero;
                const contain = card.fit === "contain";
                // The same hover preview as /lego and the /work cards: the
                // project's curated hover image, else its next picture (the
                // hero last, for cards like Piper whose card image is the
                // pair), never the one already showing.
                const hover = [project.cardHoverImage, project.heroPair, ...project.gallery, project.hero].find(
                  (candidate) => candidate?.src && candidate.src !== card.src,
                );
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
                      className={`relative aspect-[4/5] overflow-hidden rounded-frame ${contain ? "bg-canvas" : "bg-placeholder"}`}
                    >
                      {card.src && (
                        <Image
                          src={card.src}
                          alt={card.alt}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className={`${contain ? "object-contain" : "object-cover"} transition-transform duration-300 ease-drift group-hover:scale-[1.02]`}
                        />
                      )}
                      {hover?.src && (
                        // display:none until the device can hover, so touch
                        // screens never fetch it (same as /lego and /work).
                        <div
                          aria-hidden="true"
                          className={`pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:hover)]:block ${hover.fit === "contain" ? "bg-canvas" : ""}`}
                        >
                          <Image
                            src={hover.src}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className={hover.fit === "contain" ? "object-contain" : "object-cover"}
                          />
                        </div>
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
