type ArrowIconProps = {
  direction?: "left" | "right";
};

/** A fletched arrow — shaft, triangular head, feather tail — for the
 *  project prev/next nav, in the same spirit as its bow-and-arrow
 *  reference (not traced from it). Single-colour, sized to inherit
 *  currentColor like the social icons in social-icons.tsx, so the
 *  parent link's colour/hover state applies here too. */
export function ArrowIcon({ direction = "right" }: ArrowIconProps) {
  return (
    <svg
      viewBox="0 0 32 16"
      width="28"
      height="14"
      aria-hidden="true"
      style={direction === "left" ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M1 4 L7 8 L1 12"
      />
      <line x1="6" y1="8" x2="23" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path fill="currentColor" d="M18 4 L31 8 L18 12 Z" />
    </svg>
  );
}
