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
      viewBox="0 0 26 16"
      width="24"
      height="14"
      aria-hidden="true"
      style={direction === "left" ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 5 L6 8 L2 11"
      />
      <line x1="5" y1="8" x2="19" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 3 L23 8 L16 13"
      />
    </svg>
  );
}
