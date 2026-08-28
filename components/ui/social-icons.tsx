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

/** Shared by every icon below except Cart (its own component,
 *  nav.tsx-specific, needs a hover crossfade these don't). Rendered as a
 *  CSS mask
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

/** Links to Josh's Figma profile/community page. Was the last hand-coded
 *  SVG left in this file (no PNG for it in the first icon-replacement
 *  batch); Josh added figma.png in a follow-up drop, so it's on the same
 *  MaskIcon treatment as everything else here now. */
export function FigmaIcon({ size = 20 }: IconProps = {}) {
  return <MaskIcon src="/icons/figma.png" size={size} />;
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
