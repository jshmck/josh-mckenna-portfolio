type ArrowIconProps = {
  direction?: "left" | "right";
};

/** A fletched arrow — shaft, open chevron head, chevron feather tail —
 *  for the project prev/next nav, in the same spirit as its
 *  bow-and-arrow reference (not traced from it). Open strokes on both
 *  ends rather than a filled head, per feedback on the first pass, and
 *  a tighter viewBox so it doesn't read as an elongated shaft. Single-
 *  colour, sized to inherit currentColor like the social icons in
 *  social-icons.tsx, so the parent link's colour/hover state applies
 *  here too. */
export function ArrowIcon({ direction = "right" }: ArrowIconProps) {
  return (
    <svg
      viewBox="0 0 36 16"
      width="32"
      height="14"
      aria-hidden="true"
      style={direction === "left" ? { transform: "scaleX(-1)" } : undefined}
    >
      {/* Two filled feather vanes fanning off the shaft, per Josh's
          reference -- a single thin chevron read as too sparse next to
          the reference's fuller fletching. */}
      <path fill="currentColor" d="M9 8 L1 2 L6 8 Z" />
      <path fill="currentColor" d="M9 8 L1 14 L6 8 Z" />
      {/* Shaft runs all the way to the head's tip (33,8), not just to
          where its arms start (26) -- otherwise the line stops short in
          the open space between the two arms and reads as disconnected
          from the arrowhead. */}
      <line x1="8" y1="8" x2="33" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M26 3 L33 8 L26 13"
      />
    </svg>
  );
}
