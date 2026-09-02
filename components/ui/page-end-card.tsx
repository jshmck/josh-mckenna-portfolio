/**
 * Mobile-only page-end treatment — "I like the project cards, could all
 * the other pages end like that... only end with the curved corners and
 * shadow," per Josh, after seeing the /work/[slug] card (project-content.tsx).
 * Bottom corners only, no side/top margin — unlike the project card, which
 * floats as a full card inset on every edge, this rounds off just where the
 * page meets the footer's curtain reveal (see footer.tsx), leaving the top
 * of the page flush under the nav. md+ renders an invisible, unstyled
 * wrapper, same as project-content.tsx.
 *
 * The shadow does NOT live on the same box as the page content. A plain
 * box-shadow paints on all four sides of the box it's declared on, not
 * just "underneath" it, so putting it on the full-height content box (top
 * edge sitting flush under the header) bled a faint band all the way up
 * there — reported live as "the header seems to be a different colour
 * than the page." Two clip-based attempts (`clip-path: inset()`, then an
 * `overflow: hidden` ancestor sized flush to the box's own top edge)
 * both still leaked a hairline: the shadow's gaussian gradient hasn't
 * actually decayed to zero at the box's own edge (its 8px y-offset means
 * the blur *peaks* 8px inside the box), so clipping exactly at that edge
 * cuts through a still-visible part of the gradient rather than its
 * faded-out tail -- confirmed faintly visible live even after both
 * clips. The only structural fix is to never let a shadow-casting box
 * get anywhere near the header: `shadowStrip` below is a short (24px),
 * separately positioned layer pinned to the bottom corners only, with
 * its shadow declared on IT, not on the tall content box. Its own top
 * edge sits 24px above the very bottom of the page, nowhere near the
 * header, so no amount of upward bleed from its shadow can ever reach
 * there -- not "clipped well enough to not show," genuinely nowhere
 * near close enough to show. aria-hidden + pointer-events-none: purely
 * decorative, and it visually overlaps the last 24px of real content. */
export function PageEndCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-md:relative">
      <div className="max-md:overflow-hidden max-md:rounded-b-frame max-md:bg-canvas">
        {children}
      </div>
      <div
        aria-hidden="true"
        className="max-md:pointer-events-none max-md:absolute max-md:inset-x-0 max-md:bottom-0 max-md:h-6 max-md:rounded-b-frame max-md:shadow-[0_8px_18px_rgba(0,0,0,0.10)]"
      />
    </div>
  );
}
