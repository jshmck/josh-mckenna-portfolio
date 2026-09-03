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
 * This is a `background` gradient, not a `box-shadow`. Two earlier attempts
 * used box-shadow on the content box itself and both leaked a visible band
 * above the box's top edge, flush under the header ("the header seems to be
 * a different colour than the page") -- clip-path doesn't reliably clip
 * box-shadow in WebKit, and an overflow-hidden ancestor sized flush to the
 * box's own edge still showed a hairline, because a shadow's blur can't
 * actually reach zero alpha AT the edge that casts it (there's always some
 * value right at the source, however small the offset). A third attempt
 * moved the shadow onto a separate invisible strip near the bottom instead
 * of the header -- that stopped the header leak, but on any page whose real
 * content doesn't run flush to the very bottom (e.g. Shop's ghosted grid,
 * padded well above the footer), the strip's own flat top edge sat in
 * plain canvas space with nothing visibly attached to it, and its
 * never-quite-zero shadow value read as a stray horizontal line — reported
 * live as "the shadow is working well at the bottom but now there is a
 * line." A `linear-gradient` doesn't have that failure mode: it's zero by
 * definition at the stop you give it, not asymptotically approaching zero.
 * So the fade lives directly on the content box, clipped by the same
 * overflow-hidden + rounded-b-frame that already clips the content --
 * no separate strip, nothing that can ever land outside the box it's
 * describing. */
export function PageEndCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-md:relative max-md:overflow-hidden max-md:rounded-b-frame max-md:bg-canvas">
      {children}
      <div
        aria-hidden="true"
        className="max-md:pointer-events-none max-md:absolute max-md:inset-x-0 max-md:bottom-0 max-md:h-10 max-md:bg-[linear-gradient(to_top,rgba(0,0,0,0.10),rgba(0,0,0,0))]"
      />
    </div>
  );
}
