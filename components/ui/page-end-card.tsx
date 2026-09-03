/**
 * Mobile-only page-end treatment — the bottom of every non-project page
 * (Home, Work, Shop, Info, Contact, 404) finishes like the project card
 * does, without becoming a card itself: "only projects should have
 * cards... the bottom of each page should finish like the card, but
 * they should be full width. no shadow on top or sides, only on the
 * bottom," per Josh, correcting a first cut that copied the project
 * card's whole treatment (side margins + all-round shadow) onto every
 * page. So: no margins, square top, full-bleed sides — just the two
 * bottom corners curved and a downward-only shadow, so the page ends on
 * the same curtain edge over the footer reveal as a project card does.
 *
 * Shadow-only-below is geometry, not clever masking: both layers keep
 * blur ≤ y-offset, so their upward reach (blur − offset) is zero — the
 * same reach math the project card used to stay out of the header's
 * band, pushed all the way. Sideways reach doesn't matter here because
 * the box is full-bleed: anything cast sideways lands outside the
 * viewport. Bottom reach (offset + blur) stays ~8px/24px, matching the
 * project card's weight.
 *
 * Same shadow/overflow-hidden split across two elements as
 * project-content.tsx — box-shadow and overflow-hidden on the same
 * rounded element is the Safari compositing trap that painted the
 * project card's shadow as an opaque block (see the long comment
 * there). No bottom margin, deliberately, same reasoning too: main's
 * opaque background paints under a child's margin, so a gap here would
 * ride along as a canvas-coloured apron covering the footer's icons
 * mid-curtain-reveal. md+ renders an invisible, unstyled wrapper, same
 * as project-content.tsx.
 */
export function PageEndCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-md:rounded-b-frame max-md:shadow-[0_4px_4px_rgba(0,0,0,0.08),0_12px_12px_rgba(0,0,0,0.10)]">
      <div className="max-md:overflow-hidden max-md:rounded-b-frame max-md:bg-canvas">
        {children}
      </div>
    </div>
  );
}
