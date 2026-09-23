import Link from "next/link";

import { ClientLogos } from "@/components/site/client-logos";
import { InlineIcon } from "@/components/ui/inline-icon";
import { Parallax } from "@/components/ui/parallax";
import { Reveal } from "@/components/ui/reveal";
import { ProjectVideo } from "@/components/work/project-video";
import { WorkGallery, type Filter } from "@/components/work/work-gallery";
import type { Project, ProjectCategory } from "@/lib/projects";

type HomeBelowHeroProps = {
  projects: Project[];
  categories: ProjectCategory[];
  /**
   * Renders a frozen, non-interactive copy for the pull-down-to-go-back
   * peek (project-stack-swipe.tsx) instead of the live page — same
   * content, same layout, but the embedded gallery is locked to whatever
   * filter/search was active when the visitor left, rather than reading
   * the live URL and local state a project page doesn't share. See
   * lib/back-peek.ts for why this state can't just be re-derived later.
   */
  peek?: { category: string; query: string };
};

/**
 * Everything on Home below DriftingHero — the Who section, Selected
 * Clients, and the embedded Work gallery. Pulled out of app/page.tsx so
 * the exact same markup can be reused, read-only, by the pull-down back
 * peek: "the page underneath needs to mirror exactly what will appear,"
 * per Josh, the same requirement that already governs the project-to-
 * project peeks (see ProjectStackSwipe's StackPeek). DriftingHero itself
 * is deliberately excluded — its rAF drift loop is expensive to run
 * twice at once, and the peek only ever needs to reproduce scroll
 * positions at or past #home-who in practice (that's the earliest a
 * project card exists to click in the first place).
 */
export function HomeBelowHero({ projects, categories, peek }: HomeBelowHeroProps) {
  return (
    <>
      {/* Who Josh is. The id is the target of the hero's mobile scroll cue
          (see drifting-hero.tsx); scroll-mt keeps the heading clear of the
          sticky pill nav when that cue (or any future anchor) lands here.
          Also the peek's own anchor — see measureGalleryAnchorTop. */}
      <section id="home-who" className="scroll-mt-20">
        <div className="mx-auto grid max-w-frame gap-16 px-6 pb-24 pt-16 md:grid-cols-2 md:items-center md:px-gutter md:pb-16">
          <Reveal>
            {/* Josh's inline icons sit inside the sentence like glyphs
                (see components/ui/inline-icon.tsx). The spaces either
                side of each icon are real text so it gets normal word
                spacing -- keep each icon on the same source line as its
                neighbouring words, or JSX drops the whitespace. The list
                ends "brand campaigns, automotive" with no final "and":
                the heading column caps at 596px on every desktop width,
                and "and automotive [car] art" is ~40px too wide for it,
                which left "art" alone on a last line. The comma version
                breaks as "automotive [car] art" at every width, the same
                last line as mobile and the Figma reference. Moving the
                car before "automotive" was measured and doesn't help --
                same four things on the line either way. */}
            <h2 className="type-heading text-ink">
              British <InlineIcon name="cloud" /> illustrator working across
              character design, LGBTQ+ <InlineIcon name="heart" /> themes,
              social media icons, brand campaigns, automotive{" "}
              <InlineIcon name="car" /> art
            </h2>
            <p className="type-lede mt-6 max-w-lg text-ink-muted">
              Loud, proud, diverse characters. 2D mostly, a bit of 3D lately.
              Restaurant posters are his bread and butter. Cars are the thing
              he draws for free.
            </p>
            <Link
              href="/info"
              className="type-label mt-8 inline-flex items-center gap-2 whitespace-nowrap text-ink transition-[color,transform] duration-200 ease-in-out hover:scale-105 hover:text-accent hover:duration-300 hover:ease-drift"
            >
              <span>More about Josh</span>
              <span aria-hidden="true" className="font-body text-base font-normal md:text-lg">
                →
              </span>
            </Link>
          </Reveal>

          {/* maxOffset caps how far the parallax drift can carry the poster
              from its layout position -- unbounded (the default) let it
              drift far enough on mobile, where this stacks directly above
              Selected Clients with less surrounding whitespace than the
              two-column desktop layout, to cover that section's heading
              mid-scroll -- "i like the dynamic scroll but it covers this
              up," per Josh. See Parallax's own doc comment: exactly the
              "tight gaps... detach and overlap a neighbour" case it warns
              about. */}
          <Parallax speed={0.85} maxOffset={48}>
            {/* Monte Carlo animation — the animated cut of the same 4/5
                Miura-outside-the-Casino crop that sat here as a still
                ("replace the new who image with this animation and have
                it autoplay on loop," per Josh). Silent, so ProjectVideo
                autoplays it muted on loop with the reduced-motion guard,
                same mechanism as the /work card clips; the retired still
                stays on as the poster frame. True 1080x1350 (4/5), so
                the frame geometry is unchanged from the still it
                replaces. */}
            {/* ml-auto, not justify-self-end — the grid child is the
                Parallax wrapper, not this video, so justify-self would
                no-op; auto-margin does the same tuck inside it. */}
            <ProjectVideo
              className="w-full md:max-w-md md:ml-auto"
              video={{
                src: "/work/beefbar-posters/14-monte-carlo-lambo-animation.mp4",
                alt: "Monte Carlo poster animated — a Lamborghini Miura outside the Casino de Monte-Carlo",
                poster: "/work/beefbar-posters/13-monte-carlo-lambo-ig.webp",
              }}
              ratio="4/5"
            />
          </Parallax>
        </div>
      </section>

      {/* Clients — moved here from the Info page per Josh, directly below
          Who. Dropped the loud type-title/text-accent treatment those other
          section titles (Talks & Features, Say Hello) use — Home has no
          other Waldeck title on the page (Who and Work both go title-less),
          so the big purple version read as too bold and colourful sitting
          on its own here. type-label instead, matching the site's quiet
          eyebrow role. Only the heading stays inside the frame — the logo
          ticker runs full-bleed, per Josh ("an animated bar, so the logos
          are just going along from right to left"), so ClientLogos sits
          outside the padded container. No bottom padding of its own —
          the gap down to the embedded gallery's filter pills is owned
          entirely by #home-work's top padding. Josh-tuned by live
          nudges from the original 128px (pb-16 + pt-16): desktop tried
          40 → 24 → 32 → 36 and settled right back on 40px; mobile
          settled at 28px, one notch up from the 24px first signed off
          ("increase the gap a tiny bit, on mobile too"). Desktop's
          value is the literal default with a max-md override, per the
          mobile-scoping rule. */}
      <section>
        <div className="mx-auto max-w-frame px-6 md:px-gutter">
          <h2 className="type-label text-ink-muted">Selected Clients</h2>
        </div>
        <div className="mt-8">
          <ClientLogos />
        </div>
      </section>

      {/* Work — the same gallery as /work, embedded so the page just keeps
          scrolling into it rather than navigating there. No title — Josh
          wants the gallery itself to be the section, not a labelled one.
          The id is the landmark Nav's scroll-spy reads to hand the active
          highlight from Home to Work — see components/site/nav.tsx. */}
      <section id="home-work">
        <div className="mx-auto max-w-frame px-6 pb-32 pt-10 max-md:pt-7 md:px-gutter">
          <WorkGallery
            projects={projects}
            categories={categories}
            interactive={!peek}
            initialFilter={peek?.category as Filter | undefined}
            initialQuery={peek?.query}
            recordContext={peek ? undefined : "home"}
          />
        </div>
      </section>
    </>
  );
}
