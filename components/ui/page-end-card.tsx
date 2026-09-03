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
 * The shadow lives back on the real content box (outer div), not a
 * separate strip or an inner gradient -- two things that both got tried
 * and both read wrong. A background gradient clipped inside the box (an
 * earlier attempt) darkened the card's own bottom padding instead of
 * casting a shadow past its edge -- reported live as "the shadow is
 * inside the card instead of outside." A separate invisible strip's flat
 * top edge, on pages whose content doesn't run flush to the bottom (e.g.
 * Shop), sat in plain canvas space and read as a stray line.
 *
 * The actual fix is the shadow's own numbers: `18px` blur on an `8px`
 * offset (the original values) meant blur > offset, and CSS box-shadow
 * blurs symmetrically around the offset edge -- with blur wider than the
 * offset, the blur necessarily reaches *back past the box's own top edge*
 * and bleeds upward, flush under the header, however tightly you clip it
 * (clipping just slices through a still-nonzero part of the gradient,
 * confirmed live even after clip-path and overflow-hidden attempts).
 * Keeping blur ≤ offset (`14px` blur on a `16px` offset here) means the
 * blur's reach never crosses back above the box's top edge in the first
 * place -- not clipped away, mathematically absent. So it can go straight
 * back on the real box: a proper shadow cast outside and below the
 * rounded corners, nothing bleeding under the header, nothing floating
 * disconnected in blank space either, since it's tied to the real edge
 * of real content again. */
export function PageEndCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-md:rounded-b-frame max-md:shadow-[0_16px_14px_rgba(0,0,0,0.12)]">
      <div className="max-md:overflow-hidden max-md:rounded-b-frame max-md:bg-canvas">
        {children}
      </div>
    </div>
  );
}
