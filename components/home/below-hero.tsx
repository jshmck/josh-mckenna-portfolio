import Link from "next/link";

import { ClientLogos } from "@/components/site/client-logos";
import { Parallax } from "@/components/ui/parallax";
import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/ui/reveal";
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
            <h2 className="type-heading text-ink">
              British illustrator working across character design, LGBTQ+
              themes, icons, social media brand campaigns and automotive art
            </h2>
            <p className="type-lede mt-6 max-w-lg text-ink-muted">
              He&apos;s drawn for the likes of Apple — loud, friendly, queer
              characters, always diverse. 2D mostly, 3D lately. Restaurant
              posters are his bread and butter. Cars are the thing he draws
              for free.
            </p>
            <Link
              href="/about"
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
            {/* Monte Carlo poster — a car and cityscape in one image,
                matching the copy beside it. Unbranded version (no "beefbar"
                script, no "Born In") — this one's for Home, not the Beefbar
                project itself, so its own project page still leads with the
                branded two-car poster. True poster ratio (12/17), not the
                ingester's auto-picked 3/4 — same reasoning as the file it
                replaces: 1920×2716 snaps closer to 12/17 (0.7059) than 3/4
                (0.75, a 6% crop). */}
            <Plate
              image={{
                ratio: "12/17",
                alt: "Monte Carlo poster — a Lamborghini Miura outside the Casino de Monte-Carlo",
                src: "/work/beefbar-posters/01-monte-carlo-lamb.webp",
              }}
              sizes="(max-width: 768px) 100vw, 45vw"
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
          eyebrow role. */}
      <section>
        <div className="mx-auto max-w-frame px-6 pb-16 md:px-gutter">
          <h2 className="type-label text-ink-muted">Selected Clients</h2>
          <div className="mt-8">
            <ClientLogos />
          </div>
        </div>
      </section>

      {/* Work — the same gallery as /work, embedded so the page just keeps
          scrolling into it rather than navigating there. No title — Josh
          wants the gallery itself to be the section, not a labelled one.
          The id is the landmark Nav's scroll-spy reads to hand the active
          highlight from Home to Work — see components/site/nav.tsx. */}
      <section id="home-work">
        <div className="mx-auto max-w-frame px-6 pb-32 pt-16 md:px-gutter">
          {/* showIllustrations=false -- the Twingo/iPad row is /work's
              own top-of-page illustration, not something that should
              duplicate into Home's embedded gallery. */}
          <WorkGallery
            projects={projects}
            categories={categories}
            showIllustrations={false}
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
