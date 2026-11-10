import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

import { ReelsRow } from "@/components/carwow/ad-phones";
import { LbTile } from "@/components/koto/lightbox-tile";
import {
  Block,
  Row,
  Section,
  StillRow,
  StillTile,
} from "@/components/koto/page-parts";
import { HeroStackLightbox } from "@/components/work/hero-stack-lightbox";
import { ProjectLightboxProvider } from "@/components/work/project-lightbox-context";
import { ProjectVideo } from "@/components/work/project-video";
import { createLightbox, img } from "@/lib/koto-lightbox";
import { getProject, type ProjectImage } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

/**
 * Private page for a job application (LEGO). Unlisted, noindex + nofollow
 * (page metadata and an X-Robots-Tag header in next.config.ts), not in the
 * sitemap. A static site has no auth, so this is "unlisted", not "secret".
 *
 * Leads with three pieces, in this order: the 505 Touring launch, the Team
 * Yamato livery on the Honda Super-N, and the LA Pride campaign, then the
 * Piper-Heidsieck tin as the packaging piece (the brief names packaging).
 * The social video sits last, just above More: the weakest fit for a
 * vehicles role. The static-ad "Graphic design" section was dropped.
 * Everything
 * on it is already on the public site (no assets of its own); the building
 * blocks are the ones the Koto page uses.
 */
export const metadata: Metadata = {
  title: "Josh McKenna — for LEGO",
  description: "Selected work by Josh McKenna.",
  robots: { index: false, follow: false, nocache: true },
  // Own link preview (see opengraph-image.tsx next to this file); without
  // these the site's generic title and description would sit under it.
  openGraph: {
    title: "Josh McKenna — for LEGO",
    description: "Selected work by Josh McKenna.",
  },
  twitter: {
    title: "Josh McKenna — for LEGO",
    description: "Selected work by Josh McKenna.",
  },
};

const FIVE_OH_FIVE = [
  img(
    "nomad-wheels-505-livery",
    "07-livery-sheet-v6",
    "4/5",
    "Livery technical drawings: front, rear and both sides",
  ),
  img(
    "nomad-wheels-505-livery",
    "03-desert-side-profile",
    "3/2",
    "The Land Cruiser in profile at speed, livery side-on",
  ),
  img(
    "nomad-wheels-505-livery",
    "05-helmet-door",
    "3/2",
    "Right side, matching livery: Josh wearing a custom race suit with the logos applied",
  ),
  img(
    "nomad-wheels-505-livery",
    "06-apparel",
    "3/2",
    "Apparel with the livery graphics, front and back",
  ),
  img(
    "nomad-wheels-505-livery",
    "01-nomad-505",
    "4/5",
    "The full print-ready livery artwork",
  ),
  img(
    "nomad-wheels-505-livery",
    "01-socials-02",
    "1/1",
    "505 Touring release event flyer",
  ),
];

const LA_PRIDE = [
  img(
    "la-pride",
    "01-la-pride-4x5-centred",
    "4/5",
    "The L.A. Pride 2024 logomark: an L and an A built out of illustrated characters",
  ),
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
  img(
    "la-pride",
    "25-entrance-bronco-totem",
    "3/2",
    "The orange entrance totem, with the green Bronco and the rainbow",
  ),
  img("la-pride", "06-merch-rail", "16/10", "Merch — hoodie, tee and cap"),
  img(
    "la-pride",
    "10-wristbands",
    "16/10",
    "Wristbands, VIP and general admission",
  ),
];

const PIPER = [
  img(
    "piper-heidsieck",
    "02-flat-wrap-v2",
    "183/200",
    "The flat wrap artwork, before it went round the tin",
  ),
  img(
    "piper-heidsieck",
    "01-tin",
    "9/16",
    "The finished tin, beside the bottle",
  ),
];

/** Per-tile crop focus for the portrait tiles, keyed by a fragment of the
 *  file name. The wayfinding photo has its blue map at ~66% across, so 85%
 *  centres a 4/5 crop on it (the default 50% showed mostly grass). */
const LA_PRIDE_FOCUS: Record<string, string> = {
  "05-wayfinding-totem": "85% center",
  // Centres the green Bronco (~48% across) in the portrait crop.
  "25-entrance-bronco-totem": "48% center",
};

const BOMBAY_BOTTLES = [
  img(
    "bombay-sapphire",
    "07-bottles-wide",
    "4/3",
    "Fifty hand-finished bottles, ready to go",
  ),
  img(
    "bombay-sapphire",
    "08-bottles-macro",
    "4/3",
    "Bottle detail, botanicals from the Grains of Paradise",
  ),
];

const Z1_COLOURS = [
  img("figma-bmw-z1", "04-z1-red-4x5", "4/5", "The Z1 in red"),
  img("figma-bmw-z1", "06-z1-blue-4x5", "4/5", "The Z1 in blue"),
];

/* Each section's small deliverables line opens with its discipline
   ("Graphic design", "Illustration", ...) in text-ink, so a reviewer hiring
   a graphic designer can see at a glance which pieces are which. Tags are
   Josh's own calls, set inline on each section below. */

/** More work, linked out to its own page rather than re-shown here. */
/** The paragraph under each section's frames: one measure (about 60
 *  characters, left on the frame's edge) and one gap, the same in every
 *  section. */
const BLURB = "type-lede mt-6 max-w-[60ch] text-ink";

const MORE: {
  slug: string;
  /** Overrides the project's own card image. */
  image?: ProjectImage;
  /** CSS object-position for the 4/5 crop. */
  position?: string;
  /** The hover preview, when it should differ from the project's own next
   *  picture. */
  hover?: ProjectImage;
  /** CSS object-position for the hover image's 4/5 crop. */
  hoverPosition?: string;
  /** A clip that fades in on hover, in place of a still. */
  hoverVideo?: { src: string; poster: string; alt: string };
  /** A silent looping clip in place of the still (the image is its poster). */
  video?: string;
  /** Caption, when "client · title" isn't right (personal pieces name the
   *  brand they're drawn for). */
  label?: string;
}[] = [
  {
    slug: "citroen-2cv-concept",
    label: "Citroën · 2CV Concept",
    // The 720px silent card cut the /work grid plays, over the frame where
    // the whole car is in shot.
    video: "/work/citroen-2cv-concept/04-2cv-animation-card.mp4",
    image: {
      src: "/work/citroen-2cv-concept/05-2cv-animation-sound-poster.webp",
      ratio: "4/5",
      alt: "The 2CV animation, from a wheel out to the whole car",
    },
  },
  {
    slug: "voxi-pride",
    image: {
      src: "/work/voxi-pride/07-phone.webp",
      ratio: "1/1",
      alt: "The Voxi Pride phone case",
    },
  },
  { slug: "kiehls-trevor-project" },
  {
    slug: "instagram-sticker",
    // The sticker set on a phone, not the sticker character: it's the
    // clearest "what was this" shot. 16/9 source; 55% centres the phone in
    // the 4/5 crop.
    image: {
      src: "/work/instagram-sticker/05-sticker-set-hr.webp",
      ratio: "16/9",
      alt: "The Instagram Pride sticker set open on a phone",
    },
    position: "55% center",
    // The sticker animation on the light pink background, as on the /work
    // card, instead of a second still.
    hoverVideo: {
      src: "/work/instagram-sticker/11-sticker-animation.mp4",
      poster: "/work/instagram-sticker/11-sticker-animation-poster.webp",
      alt: "The Instagram Pride sticker moving on a light pink background",
    },
  },
  {
    slug: "wagamama-pride",
    // The corner window with its decals, at Marble Arch: the photo runs
    // curved around the building's corner. 3/2 source, centred in the 4/5
    // crop so the middle figure and "Proud beyond Pride" stay in.
    image: {
      src: "/work/wagamama-pride/04-marble-arch.webp",
      ratio: "3/2",
      alt: "The Pride window wrapped around the corner of Wagamama Marble Arch",
    },
    position: "50% center",
    // The finished window at Wagamama Brighton on hover, per Josh (the
    // photo, not the flat artwork). 100% keeps the black strip down the
    // photo's left edge out of the 4/5 crop.
    hover: {
      src: "/work/wagamama-pride/06-window-install.webp",
      ratio: "1/1",
      alt: "The finished window, installed at Wagamama Brighton",
    },
    hoverPosition: "100% center",
  },
  {
    slug: "levis-rainbow-rodeo",
    image: {
      src: "/work/levis-rainbow-rodeo/02-pins-trio.webp",
      ratio: "2/3",
      alt: "The three Rainbow Rodeo enamel pins",
    },
  },
  {
    slug: "ford-bronco",
    label: "Ford · Bronco",
  },
  {
    slug: "figma-vitra-virgil",
    label: "Vitra · Virgil Abloh",
  },
  {
    slug: "beefbar-posters",
    label: "Beefbar · Monte Carlo",
    // The Monte Carlo Lambo from the home page, as its silent card clip.
    video: "/work/beefbar-posters/15-monte-carlo-lambo-card.mp4",
    image: {
      src: "/work/beefbar-posters/15-monte-carlo-lambo-poster.webp",
      ratio: "4/5",
      alt: "The Monte Carlo poster animated, a Lamborghini Miura outside the Casino",
    },
  },
];

export default async function LegoPage() {
  const nomad = getProject("nomad-wheels-505-livery");
  const yamato = getProject("team-yamato-super-n");
  const laPrideProject = getProject("la-pride");
  const piper = getProject("piper-heidsieck");
  const bombay = getProject("bombay-sapphire");
  const z1 = getProject("figma-bmw-z1");
  const honda = getProject("honda-super-n");
  const twingo = getProject("hello-twingo");

  const { lightbox, stills } = createLightbox();

  // Registered in visual order.
  const nomadStills = await stills(FIVE_OH_FIVE);
  const yamatoStack =
    yamato?.heroUnder && yamato.heroPair
      ? ([yamato.hero, yamato.heroUnder, yamato.heroPair] as const)
      : undefined;
  const yamatoStills = yamatoStack ? await stills([...yamatoStack]) : [];
  const laPrideStills = await stills(LA_PRIDE);
  const bombayStills = await stills(BOMBAY_BOTTLES);
  const twingoSlides = await stills(twingo?.gallery ?? []);
  const z1Stills = await stills(Z1_COLOURS);
  const piperStills = await stills(PIPER);

  const more = MORE.flatMap((item) => {
    const project = getProject(item.slug);
    return project ? [{ ...item, project }] : [];
  });

  return (
    <ProjectLightboxProvider images={lightbox}>
      <main className="mx-auto max-w-frame px-6 pb-32 pt-8 md:px-gutter">
        <h1 className="type-label text-ink-muted">Josh McKenna · For LEGO</h1>
        <p className={BLURB}>
          Cars are my life. I grew up on Colin McRae Rally and LEGO, studied a
          bit of automotive design at Coventry, and have spent the last few
          years designing graphics for an aftermarket wheel company, including
          a livery for my own Land Cruiser.
        </p>

        <Section first>
          <Block bold
            label="505 Touring launch · Nomad Wheels"
            href="/work/nomad-wheels-505-livery"
          >
            {nomad && (
              <p className="type-label mb-4 text-ink-muted">
                <span className="text-ink">Graphic design</span> · {nomad.deliverables}
              </p>
            )}
            {/* Drawing and side photo lead, level with each other; the film
                is the second row. */}
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
              A full graphic package for the launch of the 505 Touring wheel,
              built from a vintage Dakar rally look. The Land Cruiser is mine
              and that&apos;s me driving. I designed the livery, the logos in
              the film and the posters.
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
          <Block bold
            label="Team Yamato · Personal"
            href="/work/team-yamato-super-n"
          >
            {yamato && (
              <p className="type-label mb-4 text-ink-muted">
                <span className="text-ink">Graphic design</span> · {yamato.deliverables}
              </p>
            )}
            {yamatoStack && yamatoStills[0] && (
              <HeroStackLightbox
                images={[yamatoStack[0], yamatoStack[1], yamatoStack[2]]}
                indexOffset={yamatoStills[0].lb}
              />
            )}
            {yamato?.brief[0] && (
              <p className={BLURB}>
                {yamato.brief[0]}
              </p>
            )}
          </Block>
        </Section>

        <Section>
          <Block bold label="LA Pride · 360 campaign" href="/work/la-pride">
            {laPrideProject && (
              <p className="type-label mb-4 text-ink-muted">
                <span className="text-ink">Graphic design · Illustration</span> · {laPrideProject.deliverables}
              </p>
            )}
            {/* The logomark introduces the section as the first tile of the
                row; every tile is a tall 4/5 portrait. */}
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
            {laPrideProject?.brief[1] && (
              <p className={BLURB}>
                {laPrideProject.brief[1]}
              </p>
            )}
          </Block>
        </Section>

        <Section>
          <Block bold
            label="Limited edition tin · Piper-Heidsieck"
            href="/work/piper-heidsieck"
          >
            {piper && (
              <p className="type-label mb-4 text-ink-muted">
                <span className="text-ink">Illustration · Packaging</span> · {piper.deliverables}
              </p>
            )}
            <Row>
              <StillTile
                still={piperStills[0]}
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              {/* The tin shot is a transparent cut-out: contain it on the
                  canvas, not the brand-blue tile surface the stills use. */}
              <LbTile
                index={piperStills[1].lb}
                label={piperStills[1].alt}
                r={piperStills[1].r}
                className="relative snap-center overflow-hidden rounded-frame bg-canvas"
              >
                <Image
                  src={piperStills[1].src}
                  alt={piperStills[1].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-contain"
                />
              </LbTile>
            </Row>
            <p className={BLURB}>
              A limited-edition Pride tin for Piper-Heidsieck&apos;s Cuvée Brut,
              2024. The artwork is drawn flat and wraps round the tin; the
              finished tin is on the right.
            </p>
          </Block>
        </Section>

        <Section>
          <Block bold
            label="Bombay Sapphire · Stir Creativity"
            href="/work/bombay-sapphire"
          >
            {bombay && (
              <p className="type-label mb-4 text-ink-muted">
                <span className="text-ink">Illustration · Packaging</span> · {bombay.deliverables}
              </p>
            )}
            {/* Just the bottles, big: the two shots side by side at the full
                frame width. */}
            <div className="grid gap-3 md:grid-cols-2 md:gap-5">
              {bombayStills.map((still) => (
                <LbTile
                  key={still.src}
                  index={still.lb}
                  label={still.alt}
                  className="relative aspect-[4/3] overflow-hidden rounded-frame bg-placeholder"
                >
                  <Image
                    src={still.src}
                    alt={still.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </LbTile>
              ))}
            </div>
            {bombay?.brief[0] && (
              <p className={BLURB}>
                {bombay.brief[0]}
              </p>
            )}
          </Block>
        </Section>

        {twingo && twingoSlides.length > 0 && (
          <Section>
            <Block bold label="Hello Twingo · Personal" href="/work/hello-twingo">
              <p className="type-label mb-4 text-ink-muted">
                <span className="text-ink">Illustration</span> · {twingo.deliverables}
              </p>
              {/* The six Twingo slides as a tight strip, the same as on the
                  Carwow page; each opens its own lightbox frame. */}
              <StillRow
                stills={twingoSlides}
                sizes="(max-width: 768px) 60vw, 18vw"
                tight
              />
            </Block>
          </Section>
        )}

        {z1?.heroVideo && (
          <Section>
            <Block bold label="BMW Z1 · Personal" href="/work/figma-bmw-z1">
              <p className="type-label mb-4 text-ink-muted">
                <span className="text-ink">Illustration</span> · {z1.deliverables}
              </p>
              {/* The animation first, then the all-red and the all-blue Z1,
                  all three 4/5. The film has the same ambient setup as the
                  project page: muted autoplay loop, sound one tap away. The
                  two stills open the page lightbox; the film doesn't. */}
              <Row>
                <div className="snap-center" style={{ "--r": 4 / 5 } as CSSProperties}>
                  <ProjectVideo
                    video={{
                      src: z1.heroVideo.src,
                      alt: z1.heroVideo.alt,
                      poster: z1.heroVideo.poster,
                    }}
                    sound
                    autoplay
                    ratio="4/5"
                    className="h-full"
                  />
                </div>
                <StillTile
                  still={z1Stills[0]}
                  sizes="(max-width: 768px) 60vw, 30vw"
                />
                <StillTile
                  still={z1Stills[1]}
                  sizes="(max-width: 768px) 60vw, 30vw"
                />
              </Row>
            </Block>
          </Section>
        )}

        <Section>
          <Block bold label="Social video">
            <p className="type-label mb-6 text-ink-muted">
              <span className="text-ink">Graphic design</span> · Graphic
              elements · Hand drawn elements · Poster design · Merch design ·
              Logos
            </p>
            {/* The Reels from the Carwow page, each in an iPhone: look-only
                video, so they stay out of the lightbox. */}
            <ReelsRow />
          </Block>
        </Section>

        <Section>
          <Block bold label="More">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {more.map(({ project, image, position, video, label, hover: hoverOverride, hoverPosition, hoverVideo }) => {
                const card = image ?? project.cardImage ?? project.hero;
                // The same hover preview as the /work cards: the project's
                // curated hover image, else its next picture, never the one
                // already showing. No preview on the clip cards, where a
                // still would cover the motion.
                const hover = video || hoverVideo
                  ? undefined
                  : (hoverOverride ??
                    [project.cardHoverImage, project.heroPair, ...project.gallery].find(
                      (candidate) => candidate?.src && candidate.src !== card.src,
                    ));
                return (
                  <Link
                    key={project.slug}
                    href={`/work/${project.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-frame bg-placeholder">
                      {video && card.src ? (
                        <ProjectVideo
                          video={{ src: video, alt: card.alt, poster: card.src }}
                          ratio="4/5"
                          radius=""
                          className="h-full"
                        />
                      ) : (
                        card.src && (
                          <Image
                            src={card.src}
                            alt={card.alt}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover transition-transform duration-300 ease-drift group-hover:scale-[1.02]"
                            style={{ objectPosition: position }}
                          />
                        )
                      )}
                      {hoverVideo && (
                        // The clip sits under the still at opacity 0 and
                        // fades in on hover; display:none until the device
                        // can hover, so a phone never loads it.
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:hover)]:block"
                        >
                          <ProjectVideo
                            video={{
                              src: hoverVideo.src,
                              alt: hoverVideo.alt,
                              poster: hoverVideo.poster,
                            }}
                            ratio="4/5"
                            radius=""
                            className="h-full"
                          />
                        </div>
                      )}
                      {hover?.src && (
                        // display:none until the device can hover, so touch
                        // screens never fetch it (same as /work's cards).
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:hover)]:block"
                        >
                          <Image
                            src={hover.src}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover"
                            style={{ objectPosition: hoverPosition }}
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
            {honda?.heroVideo && (
              <div className="mt-8 md:mt-12">
                {/* The Honda Super N turntable at the full width of the page,
                    under the grid. Autoplays muted on a loop (browsers don't
                    allow autoplay with sound), keeping the native controls so
                    the soundtrack is one tap away: same setup as the Z1. */}
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
                <Link
                  href="/work/honda-super-n"
                  className="type-label mt-3 inline-block text-ink underline underline-offset-4"
                >
                  Honda · Super N
                </Link>
              </div>
            )}
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
