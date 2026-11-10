import { SwipeRow } from "@/components/ui/swipe-row";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { LbTile } from "@/components/monzo/lightbox-tile";
import { Reveal } from "@/components/ui/reveal";
import { ProjectVideo } from "@/components/work/project-video";
import type { ImageRatio } from "@/lib/projects";
import type { Still } from "@/lib/monzo-lightbox";

/*
 * The building blocks of the private application pages (/monzo):
 * rule-separated sections, small labels, and rows whose items share one
 * height. Every still and silent clip opens the page's shared lightbox.
 */

const FIT_ROW = "fit-row swipe-phone flex max-md:items-start md:flex-row";

/** A row whose items all share one height from md (see .fit-row in
 *  globals.css); on a phone each image gets its own line, no swiping. `tight`
 *  strips (Hello Twingo) stay a swipe carousel on phones. */
export function Row({
  tight = false,
  children,
}: {
  tight?: boolean;
  children: ReactNode;
}) {
  return (
    <SwipeRow className={`${FIT_ROW} ${tight ? "gap-3 md:gap-1" : "gap-3 md:gap-5"}`}>
      {children}
    </SwipeRow>
  );
}

export function StillTile({
  still,
  sizes,
  tight = false,
  surface = "bg-placeholder",
  className = "",
}: {
  still: Still;
  sizes: string;
  tight?: boolean;
  /** Surface behind transparent art; the default is the brand-blue placeholder. */
  surface?: string;
  className?: string;
}) {
  return (
    <LbTile
      index={still.lb}
      label={still.alt}
      r={still.r}
      className={`relative snap-center overflow-hidden ${surface} ${tight ? "rounded-[3px]" : "rounded-frame"} ${className}`}
    >
      <Image
        src={still.src}
        alt={still.alt}
        fill
        sizes={sizes}
        className="object-cover"
      />
    </LbTile>
  );
}

export function StillRow({
  stills,
  sizes = "(max-width: 768px) 60vw, 30vw",
  tight = false,
}: {
  stills: Still[];
  sizes?: string;
  tight?: boolean;
}) {
  return (
    <Row tight={tight}>
      {stills.map((still) => (
        <StillTile key={still.src} still={still} sizes={sizes} tight={tight} />
      ))}
    </Row>
  );
}

/** A silent looping clip that opens the lightbox. */
export function ClipTile({
  src,
  poster,
  alt,
  ratio,
  lb,
}: {
  src: string;
  poster: string;
  alt: string;
  ratio: ImageRatio;
  lb: number;
}) {
  const [a, b] = ratio.split("/").map(Number);
  return (
    <LbTile
      index={lb}
      label={alt}
      r={a / b}
      className="relative snap-center overflow-hidden rounded-frame"
    >
      <ProjectVideo
        video={{ src, alt, poster }}
        ratio={ratio}
        radius=""
        className="h-full"
      />
    </LbTile>
  );
}

export function Block({
  label,
  href,
  children,
}: {
  label?: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <Reveal>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6">
        {label && <p className="type-label text-ink">{label}</p>}
        {href && (
          <Link href={href} className="type-label text-ink-muted underline">
            Project
          </Link>
        )}
      </div>
      {children}
    </Reveal>
  );
}

export const Section = ({
  first = false,
  children,
}: {
  first?: boolean;
  children: ReactNode;
}) => (
  <section
    className={`space-y-16 ${first ? "mt-16 md:mt-40" : "mt-16 border-t border-ink pt-8"}`}
  >
    {children}
  </section>
);

/** The role line under a led project's images, with its project link. */
export function RoleNote({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6">
      <p className="type-lede max-w-[60ch] text-ink">{children}</p>
      <Link
        href={href}
        className="type-label mt-3 inline-block text-ink-muted underline"
      >
        Project
      </Link>
    </div>
  );
}

/**
 * A row of captioned stills: items share one height like Row from md (one per
 * line on a phone, no swiping), but each caption sits under its own picture
 * instead of one line for the row.
 */
export function CaptionedRow({
  items,
  sizes,
}: {
  items: { still: Still; caption: string; surface?: string }[];
  sizes: string;
}) {
  return (
    <SwipeRow className="swipe-phone flex gap-3 max-md:items-start md:items-start md:gap-5">
      {items.map(({ still, caption, surface }) => (
        <figure
          key={still.src}
          style={{ "--r": still.r } as React.CSSProperties}
          className="w-full min-w-0 md:[flex:var(--r)_1_0%]"
        >
          <StillTile
            still={still}
            sizes={sizes}
            surface={surface}
            className="w-full [aspect-ratio:var(--r)]"
          />
          <figcaption className="type-label mt-3 text-ink-muted">
            {caption}
          </figcaption>
        </figure>
      ))}
    </SwipeRow>
  );
}
