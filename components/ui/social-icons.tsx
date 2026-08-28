type IconProps = {
  /** Height and width in px — every one of these icons is a square
   *  72x72 export, unlike the old hand-coded SVG set (which had each
   *  icon's own real proportions). Defaults to the 20px these were
   *  originally built at (Contact page). The footer uses a smaller size
   *  without needing its own icon set. */
  size?: number;
};

const MASK_BASE = {
  maskSize: "contain",
  maskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
} as const;

/** Shared by every icon below except Figma (still hand-coded, see its
 *  own comment) and Cart (its own component, nav.tsx-specific, needs a
 *  hover crossfade these don't). Rendered as a CSS mask
 *  (background-color: currentColor, masked to the PNG's shape) rather
 *  than a plain <img> so it keeps responding to the parent link's
 *  colour classes (hover:text-accent etc.) -- a raster image has no
 *  `currentColor` to inherit the way the old inline SVGs' `fill` did.
 *  `-webkit-` prefixed mask properties alongside the unprefixed ones
 *  since Safari still requires them. `mask-size: contain` means a
 *  non-square source would letterbox rather than distort here, though
 *  all of these are square 72x72 exports anyway. */
function MaskIcon({ src, size = 20 }: { src: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block bg-current"
      style={{
        width: size,
        height: size,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        ...MASK_BASE,
      }}
    />
  );
}

export function EmailIcon({ size = 20 }: IconProps = {}) {
  return <MaskIcon src="/icons/email.png" size={size} />;
}

export function InstagramIcon({ size = 20 }: IconProps = {}) {
  return <MaskIcon src="/icons/instagram.png" size={size} />;
}

export function ThreadsIcon({ size = 20 }: IconProps = {}) {
  return <MaskIcon src="/icons/threads.png" size={size} />;
}

/** Classic Twitter bird, not the platform's own "X" mark -- Josh's
 *  deliberate choice (carried over from the old hand-coded version of
 *  this icon; still exported as XIcon since siteConfig.x and every call
 *  site point at the same link either way, just the glyph changed). */
export function XIcon({ size = 20 }: IconProps = {}) {
  return <MaskIcon src="/icons/x.png" size={size} />;
}

export function LinkedInIcon({ size = 20 }: IconProps = {}) {
  return <MaskIcon src="/icons/linkedin.png" size={size} />;
}

export function BehanceIcon({ size = 20 }: IconProps = {}) {
  return <MaskIcon src="/icons/behance.png" size={size} />;
}

/** Links to Josh's Figma profile/community page. Still the original
 *  hand-coded SVG (traced from Josh's Figma icon set, Website Ref node
 *  193:325) -- no replacement PNG was provided alongside the rest of
 *  this batch, so this one's untouched. */
export function FigmaIcon({ size = 20 }: IconProps = {}) {
  const w = 9.58627;
  const h = 13.5791;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={(size * w) / h} height={size} aria-hidden="true">
      <path
        fill="currentColor"
        d="M5.59102 3.99455V9.58558H2.79551C1.25168 9.58558 5.34806e-05 8.33388 0 6.79007C0 5.2462 1.25165 3.99455 2.79551 3.99455H5.59102ZM1.59642 6.79007C1.59647 7.45221 2.13336 7.98916 2.79551 7.98916H3.99461V5.59097H2.79551C2.13332 5.59097 1.59642 6.12788 1.59642 6.79007Z"
      />
      <path
        fill="currentColor"
        d="M3.99461 9.5845H2.79551C2.13332 9.5845 1.59642 10.1214 1.59642 10.7836C1.59647 11.4457 2.13336 11.9827 2.79551 11.9827C3.45762 11.9826 3.99455 11.4457 3.99461 10.7836V9.5845ZM5.59102 10.7836C5.59097 12.3274 4.3393 13.579 2.79551 13.5791C1.25168 13.5791 5.34806e-05 12.3274 0 10.7836C0 9.23973 1.25165 7.98808 2.79551 7.98808H5.59102V10.7836Z"
      />
      <path
        fill="currentColor"
        d="M5.59102 0V5.59102H2.79551C1.25168 5.59102 5.34806e-05 4.33933 0 2.79551C0 1.25165 1.25165 0 2.79551 0H5.59102ZM1.59642 2.79551C1.59647 3.45765 2.13336 3.99461 2.79551 3.99461H3.99461V1.59642H2.79551C2.13332 1.59642 1.59642 2.13332 1.59642 2.79551Z"
      />
      <path
        fill="currentColor"
        d="M3.99508 0V5.59102H6.79059C8.33443 5.59102 9.58605 4.33933 9.58611 2.79551C9.58611 1.25165 8.33446 0 6.79059 0H3.99508ZM7.98969 2.79551C7.98963 3.45765 7.45275 3.99461 6.79059 3.99461H5.5915V1.59642H6.79059C7.45278 1.59642 7.98969 2.13332 7.98969 2.79551Z"
      />
      <path
        fill="currentColor"
        d="M5.5915 6.79007C5.5915 6.12791 6.12845 5.59102 6.79059 5.59097C7.45278 5.59097 7.98969 6.12788 7.98969 6.79007C7.98963 7.45221 7.45275 7.98916 6.79059 7.98916C6.12849 7.98911 5.59155 7.45217 5.5915 6.79007ZM3.99508 6.79007C3.99514 8.33385 5.24681 9.58552 6.79059 9.58558C8.33442 9.58558 9.58605 8.33388 9.58611 6.79007C9.58611 5.2462 8.33446 3.99455 6.79059 3.99455C5.24678 3.99461 3.99508 5.24623 3.99508 6.79007Z"
      />
    </svg>
  );
}

/** Nav's Cart circle (components/site/nav.tsx) -- Josh's own icons,
 *  public/icons/cart.png and cart-hover.png (the same glyph with an item
 *  sitting in the basket), replacing the placeholder bag outline this
 *  used to render inline. Each rendered as a CSS mask (background-color:
 *  currentColor, masked to the PNG's shape) rather than a plain <img>
 *  specifically so it keeps responding to the parent's colour classes --
 *  the nav swaps this between text-ink and text-accent on /shop's active
 *  state, which a flat <img> can't do; a raster image has no
 *  `currentColor` to inherit the way an inline SVG's `fill`/`stroke`
 *  does. `-webkit-` prefixed mask properties alongside the unprefixed
 *  ones since Safari still requires them.
 *
 *  The two states crossfade on hover (group-hover) -- but the `group`
 *  lives on the circle <Link> in nav.tsx, not on this component's own
 *  span. This icon is only 20/24px inside a much bigger 56/64px circle,
 *  so scoping `group` to the icon's own tiny box left most of the
 *  circle's area unable to trigger the hover at all; the circle is the
 *  group now, and both this crossfade and the icon's own hover:scale
 *  (set via `className`, see nav.tsx) key off it. Crossfading a second
 *  absolutely-positioned layer rather than swapping the mask URL
 *  outright is the same "swap the artwork itself on hover" technique
 *  already used for ProjectCard's hoverImage crossfade, kept consistent
 *  rather than inventing a second pattern. cart-hover.png is
 *  deliberately NOT wired to any real "items in cart" state -- this is a
 *  static site with no cart persistence to key that off, so it's a
 *  hover-only cue for now; revisit if real commerce state ever exists
 *  (see DESIGN.md's open commerce-channel decision).
 *
 *  Takes `className` rather than the `size` prop every other icon here
 *  uses -- the nav needs it to size up at the md: breakpoint along with
 *  the rest of the pill's type, which a fixed numeric size can't do. */
export function CartIcon({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`relative inline-block ${className ?? ""}`}>
      <span
        className="absolute inset-0 bg-current transition-opacity duration-200 ease-in-out group-hover:opacity-0"
        style={{ maskImage: "url(/icons/cart.png)", WebkitMaskImage: "url(/icons/cart.png)", ...MASK_BASE }}
      />
      <span
        className="absolute inset-0 bg-current opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100"
        style={{
          maskImage: "url(/icons/cart-hover.png)",
          WebkitMaskImage: "url(/icons/cart-hover.png)",
          ...MASK_BASE,
        }}
      />
    </span>
  );
}
