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
 */
export function PageEndCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-md:rounded-b-frame max-md:shadow-[0_8px_18px_rgba(0,0,0,0.10)]">
      <div className="max-md:overflow-hidden max-md:rounded-b-frame max-md:bg-canvas">
        {children}
      </div>
    </div>
  );
}
