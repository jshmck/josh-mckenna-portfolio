"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { propagateBackTarget } from "@/lib/back-peek";

type ProjectNavLinkProps = {
  /** The neighbour being navigated to. */
  toSlug: string;
  /** The project being left — what should peek behind `toSlug` on a
   *  later pull-down-to-go-back gesture there. */
  fromSlug: string;
  href: string;
  className?: string;
  "aria-label"?: string;
  children: ReactNode;
};

/**
 * A thin `use client` wrapper around next/link, only so the previous/next
 * project links here (the breadcrumb `<`/`>` arrows and the end-of-page
 * "Previous/Next project" pair) can forward what's behind `fromSlug`
 * (the gallery/Home it was ultimately reached from) on to `toSlug` before
 * navigating — see propagateBackTarget in lib/back-peek.ts for why this
 * forwards the ROOT rather than recording `fromSlug` itself as what's
 * behind `toSlug`. ProjectContent itself stays a plain server component
 * (no directive), same as every other interactive bit inside it
 * (ProjectTitle, HeroLightbox, BackToTopLink); this is just another one
 * of those islands, not a reason to convert the whole file.
 *
 * Swiping between projects (project-stack-swipe.tsx) propagates the same
 * way itself, at the point its own touch handler commits a navigation —
 * these two are the only ways to move project-to-project, so between
 * them every path into a project page's "back" gesture has a record
 * waiting for it (or correctly has none, if `fromSlug` never had one).
 */
export function ProjectNavLink({
  toSlug,
  fromSlug,
  href,
  className,
  children,
  ...rest
}: ProjectNavLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => propagateBackTarget(fromSlug, toSlug)}
      {...rest}
    >
      {children}
    </Link>
  );
}
