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
 * Split across two elements for the same reason as project-content.tsx's
 * card: box-shadow and overflow-hidden on the exact same rounded element is
 * a known Safari compositing trap under a transformed/animating ancestor.
 * Nothing here sits under one, but splitting costs nothing and keeps the
 * pattern identical everywhere it's used.
 *
 * Outermost wrapper exists purely to clip the shadow layer's own upward
 * bleed. A plain box-shadow paints on all four sides of the box it's
 * declared on, not just "underneath" it — with this shadow's 8px
 * y-offset and 18px blur, that means ~10px of soft shadow bleeding
 * *above* the box's top edge too. Every page's content starts flush
 * under the header (no top margin, see above), so that upward bleed
 * rendered as a faint dark band right at the very top of the page,
 * immediately under the nav — reported live as "the header seems to be
 * a different colour than the page," confirmed on an actual phone.
 * `clip-path: inset()` on the shadow layer was tried first and clips
 * correctly in Chrome, but iOS Safari doesn't reliably clip a
 * box-shadow via clip-path -- the band was still there live. A plain
 * `overflow: hidden` ancestor clips reliably everywhere, so that's the
 * real fix: zero padding-top means this wrapper's own top edge sits
 * exactly flush with the shadow box's top edge, so nothing (including
 * its shadow) can render above that line. pb-[26px] (8px offset + 18px
 * blur = the shadow's exact maximum downward reach) gives the wrapper
 * enough room below that edge for the *intended* bottom shadow to still
 * render in full -- overflow-hidden would otherwise clip that too. The
 * matching -mb-[26px] cancels the padding's own layout effect so it
 * doesn't push the footer down by 26px. */
export function PageEndCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-md:-mb-[26px] max-md:overflow-hidden max-md:pb-[26px]">
      <div className="max-md:rounded-b-frame max-md:shadow-[0_8px_18px_rgba(0,0,0,0.10)]">
        <div className="max-md:overflow-hidden max-md:rounded-b-frame max-md:bg-canvas">
          {children}
        </div>
      </div>
    </div>
  );
}
