import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { SwipeRow } from "@/components/ui/swipe-row";
import { LbTile } from "@/components/koto/lightbox-tile";
import { Reveal } from "@/components/ui/reveal";
import { ProjectVideo } from "@/components/work/project-video";
import type { ImageRatio } from "@/lib/projects";
import type { Still } from "@/lib/koto-lightbox";

/*
 * The building blocks of the private application pages (/koto):
 * rule-separated sections, small labels, and rows whose items share one
 * height. Every still and silent clip opens the page's shared lightbox.
 */

const FIT_ROW = "fit-row swipe-phone flex max-md:items-start md:flex-row";

/** A row whose items all share one height (see .height-row in globals.css).
 *  Side by side from md; on a phone a swipe carousel with full-width slides
 *  (see .fit-row in globals.css and SwipeRow). */
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
}: {
  still: Still;
  sizes: string;
  tight?: boolean;
}) {
  return (
    <LbTile
      index={still.lb}
      label={still.alt}
      r={still.r}
      className={`relative snap-center overflow-hidden bg-placeholder ${tight ? "rounded-[3px]" : "rounded-frame"}`}
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
  label: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <Reveal>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6">
        <p className="type-label text-ink">{label}</p>
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
    className={`${first ? "mt-8" : "mt-16"} space-y-16 border-t border-ink pt-8`}
  >
    {children}
  </section>
);
