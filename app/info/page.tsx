import type { Metadata } from "next";

import { FeatureGallery } from "@/components/about/feature-gallery";
import { FloatingStickers } from "@/components/about/floating-stickers";
import { YouTubeEmbed } from "@/components/about/youtube-embed";
import { InlineIcon } from "@/components/ui/inline-icon";
import { PageEndCard } from "@/components/ui/page-end-card";
import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
import { features, pressQuotes } from "@/lib/about";

export const metadata: Metadata = {
  title: "Info",
  description:
    "Josh McKenna is an illustrator with over a decade's experience, from the Instagram Pride sticker to murals for Facebook.",
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

      {/* The person — one merged section now: title, bio, two press
          quotes under the bio, portrait alongside ("i wonder if it all
          needs a reshape. the quotes drop to two and have them live
          under the bio but next to the photo," per Josh). Replaces the
          old standalone Press section; FloatingStickers moved here with
          the quotes. Crack Magazine + Gestalten are the two kept —
          It's Nice That's sits out (still in lib/about.ts, one line to
          restore). Text takes 3/5 of the row, photo 2/5, so the bio's
          measure fills out ("the text looks a bit sparse"). */}
      <section className="relative">
        <FloatingStickers />
        <div className="relative mx-auto max-w-frame px-6 pb-28 pt-8 md:px-gutter">
          <h2 className="type-heading text-ink">About Josh</h2>
          <div className="mt-12 grid gap-x-10 gap-y-16 md:grid-cols-5 md:items-center">
            <div className="md:col-span-3">
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

              {/* Same quote markup the old Press section used, sliced to
                  the first two entries. The Gestalten-only mobile rule
                  carries over — "on mobile drop all quotes except
                  gestalten," per Josh. */}
              <ul className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
                {pressQuotes.slice(0, 2).map((press, index) => (
                  <li
                    key={press.source}
                    className={
                      press.source.startsWith("Gestalten")
                        ? undefined
                        : "max-md:hidden"
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

            {/* 4/5 per Josh — "same rule as gallery", the portrait ratio
                the /work grid uses. Pre-cropped from the 3:4 master
                (Desktop/Website Projects Folder/Side-2 copy.jpg) with the
                whole trim taken off the top: the tee's printed graphics
                run to the literal bottom edge of the shot, so any bottom
                crop slices the text mid-line, and the headroom above the
                cap had room to spare. The filename names the shot, not
                just "portrait": Next's image cache keys on the URL, so
                swapping a different photo in under the same name serves
                the stale one. The grid's md:items-center keeps the bio
                paragraph vertically centred beside this taller frame.
                Capped at max-w-sm and tucked to the right edge on desktop
                ("it feels quite big on the page," per Josh — full column
                width read as a hero image, not a headshot); mobile keeps
                the standard full-width stack. */}
            <Plate
              className="w-full md:col-span-2 md:max-w-sm md:justify-self-end"
              image={{
                ratio: "4/5",
                alt: "Josh McKenna in profile, wearing a cap, against a blue studio backdrop",
                src: "/about/portrait-blue-profile.jpg",
              }}
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
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
          <h2 className="type-heading text-ink">
            Talks and features <InlineIcon name="heart" />
          </h2>
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
