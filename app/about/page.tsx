import type { Metadata } from "next";

import { FeatureGallery } from "@/components/about/feature-gallery";
import { FloatingStickers } from "@/components/about/floating-stickers";
import { YouTubeEmbed } from "@/components/about/youtube-embed";
import { PageEndCard } from "@/components/ui/page-end-card";
import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { features, pressQuotes } from "@/lib/about";

export const metadata: Metadata = {
  title: "Info",
  description:
    "Ten years of drawing for magazines, record sleeves, cereal boxes and one negotiable tattoo.",
};

/**
 * No visible page title — Josh wants the content to open the page, not a
 * labelled header. A screen-reader-only h1 keeps the page's heading
 * structure intact; the browser tab title still says "Info" via metadata
 * above. Only Talks & Features gets a visible title — Press doesn't, its
 * quote-plus-attribution format already reads as press on its own.
 * Selected Clients lives on the homepage now, not here (see app/page.tsx).
 * Titles use type-heading + text-ink — the sitewide universal title role
 * ("black, bold, no capitals (only first letters)," per Josh).
 */
export default function AboutPage() {
  return (
    <PageEndCard>
      <h1 className="sr-only">Info</h1>

      {/* The person — one short paragraph, plus a placeholder portrait
          on the right per Josh. */}
      <section>
        <div className="mx-auto max-w-frame px-6 pb-28 pt-8 md:px-gutter">
          {/* Text + portrait, same two-column shape as Home's "Who"
              section (app/page.tsx) — paragraph left, framed image
              right. Plate shows the taupe placeholder until Josh sends
              a real photo. */}
          <div className="grid gap-16 md:grid-cols-2 md:items-center">
            <div>
              <Reveal>
                <p className="type-lede text-ink-muted">
                  Josh McKenna is an illustrator with over a decade of
                  experience moving between digital products and
                  physical spaces. He studied illustration at Falmouth
                  University before going freelance in 2014, working with
                  brands from Apple to the Wall Street Journal. From the
                  iconic Instagram Pride sticker to murals for Facebook, his
                  work uses simple vector shapes to evolve 2D characters
                  into 3D forms.
                </p>
              </Reveal>

              {/* Same treatment as the Contact page illustration and
                  Work's Twingo/iPad: next/image direct, object-contain,
                  no Plate frame or background surface, plus the same
                  cursor-follow tilt as Work
                  (components/ui/tilt-illustration.tsx). Both are homepage
                  hero objects, copied to their own paths so the
                  standalone pages stay independent of the hero's orbit.
                  Height matches Work's illustrations (115px) for
                  consistency across all three pages. Below the paragraph
                  per Josh, not above it. */}
              <div className="mt-10 flex flex-wrap items-end gap-6">
                <TiltIllustration
                  src="/illustrations/hand.png"
                  aspect="641/873"
                  height={115}
                />
                <TiltIllustration
                  src="/illustrations/bearded.png"
                  aspect="977/929"
                  height={115}
                />
              </div>
            </div>

            {/* portrait-studio.jpg is pre-cropped to 4/3 from the
                near-square master (Desktop/Website Projects Folder/
                JoshStudio.png) — object-cover's centre crop would clip
                the cap. The cowboy-hat portrait (Josh.JPG) was tried
                here first; Josh called the crop weird in the 4/3 frame
                and picked this studio shot instead. The filename names
                the shot, not just "portrait": Next's image cache keys
                on the URL, so swapping a different photo in under the
                same name serves the stale one. */}
            <Plate
              image={{
                ratio: "4/3",
                alt: "Josh McKenna at his desk, working on an illustration",
                src: "/about/portrait-studio.jpg",
              }}
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        </div>
      </section>

      {/* Press — short third-party credibility, right after the intro
          paragraph rather than after the heavier Talks & Features grid;
          eases from personal copy into a bigger visual section instead of
          jumping straight there. Small Pride sticker cut-outs drift around
          the quotes -- see components/about/floating-stickers.tsx. */}
      <section className="relative">
        <FloatingStickers />
        <div className="relative mx-auto max-w-frame px-6 pb-28 md:px-gutter">
          {/* items-stretch (grid's default) makes each <li> match the row's
              tallest quote; the Reveal wrapper below fills that height as a
              flex column so the attribution lands on a shared baseline
              across the row instead of trailing right under its own quote. */}
          <ul className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
            {pressQuotes.map((press, index) => (
              <li
                key={press.source}
                // Mobile drops every quote but Gestalten's, keeping the
                // floating Pride stickers above (untouched — this only
                // hides the <li>, not FloatingStickers itself) — "on
                // mobile drop all quotes except gestalten," per Josh.
                className={
                  press.source.startsWith("Gestalten") ? undefined : "max-md:hidden"
                }
              >
                <Reveal
                  delay={index * 60}
                  className="flex h-full flex-col justify-between"
                >
                  <blockquote className="font-body text-[15px] text-ink">
                    &ldquo;{press.quote}&rdquo;
                  </blockquote>
                  <p className="type-label mt-4 text-ink-muted">
                    {press.source}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Talks & features — one merged list now, not a compact text list
          plus a separate rich-card version of the same events. Real
          captions and media where the asset exists (public/about/);
          the rest keep Plate's labelled placeholder until Josh sends
          the file over.
          pb-32, not this page's usual pb-28 — matches /work and the
          home-embedded gallery's own bottom padding. (Originally sized
          for the since-removed BackToTop pill's docked position; kept
          as-is since the deeper padding still reads right without it.) */}
      <section>
        <div className="mx-auto max-w-frame px-6 pb-32 md:px-gutter">
          <h2 className="type-heading text-ink">Talks and features</h2>
          <ul className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
            {features.map((feature, index) => (
              <li key={feature.alt}>
                <Reveal delay={index * 80}>
                  {feature.video ? (
                    /* Every Talks & Features card is 16/9 — films fill
                       the frame exactly, and image cards match ("make
                       sure all frames are 16/9," per Josh). No autoplay
                       — playback is user-initiated via the native
                       controls, so no reduced-motion guard is needed
                       here. preload="metadata" keeps the page from
                       pulling multi-MB files anyone may never play. */
                    <div className="relative aspect-[16/9] overflow-hidden rounded-frame bg-ink">
                      <video
                        className="absolute inset-0 h-full w-full object-cover"
                        src={feature.video.src}
                        poster={feature.video.poster}
                        controls
                        preload="metadata"
                        playsInline
                        aria-label={feature.alt}
                      />
                    </div>
                  ) : feature.youtube ? (
                    /* Talks whose recordings live on someone else's
                       YouTube channel — click-to-load, see the
                       component for the rationale. */
                    <YouTubeEmbed
                      videoId={feature.youtube.id}
                      poster={feature.youtube.poster}
                      alt={feature.alt}
                    />
                  ) : feature.images ? (
                    /* Several photos in one slot — swipe on touch,
                       prev/next on desktop, no lightbox. */
                    <FeatureGallery images={feature.images} />
                  ) : (
                    <Plate
                      image={{
                        ratio: "16/9",
                        alt: feature.alt,
                        src: feature.image?.src,
                        fit: feature.image?.fit,
                      }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                  <h3 className="font-body mt-4 text-[15px] font-bold text-ink">
                    {feature.title}
                  </h3>
                  <p className="type-lede mt-1 text-ink-muted">
                    {feature.description}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* DecomposeSequence (components/about/decompose-sequence.tsx) and
          Marquee (components/site/marquee.tsx) are deliberately not
          rendered here — Josh wants both off this page for now but plans
          to reuse them elsewhere, so neither component was deleted, just
          unhooked from this page. */}

    </PageEndCard>
  );
}
