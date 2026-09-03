/**
 * Mobile-only page-end treatment — "I like the project cards, could all
 * the other pages end like that... only end with the curved corners and
 * shadow," per Josh, after seeing the /work/[slug] card (project-content.tsx).
 * Three earlier attempts (a separate shadow strip, an inner gradient, a
 * shadow tuned back onto the flush edge-to-edge box) all read as either a
 * stray line or a shadow "inside the card instead of outside" — because
 * with no visible margin around it, there was nothing to show where the
 * invisible (bg-canvas-on-bg-canvas) card actually ended and the shadow
 * began; any gradient just looked smudged onto the page itself. This now
 * copies project-content.tsx's card treatment directly, the one place on
 * the site this genuinely already reads as a floating card: `mx-3 mt-3`
 * margin makes the gap itself visible (the header/page shows through
 * around the card), so the shadow renders in a space distinct from the
 * card rather than flush against it. Same two-layer shadow tuned to that
 * exact 12px margin (see project-content.tsx's own comment for the
 * offset/blur reach math) and the same shadow/overflow-hidden split
 * across two elements (a known Safari compositing trap when they're on
 * the same node). No bottom margin, deliberately, same reasoning as
 * project-content.tsx: main's opaque background paints under a child's
 * margin too, so a bottom gap here would ride along as a canvas-coloured
 * apron covering the footer's icons mid-curtain-reveal. The card's own
 * shadowed edge is the curtain's edge; air between the corner and the
 * footer's content comes from the footer's own top padding. md+ renders
 * an invisible, unstyled wrapper, same as project-content.tsx. */
export function PageEndCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-md:mx-3 max-md:mt-3 max-md:rounded-frame max-md:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_8px_18px_rgba(0,0,0,0.10)]">
      <div className="max-md:overflow-hidden max-md:rounded-frame max-md:bg-canvas">
        {children}
      </div>
    </div>
  );
}
