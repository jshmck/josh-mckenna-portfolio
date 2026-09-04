"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { recordBackTarget } from "@/lib/back-peek";

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
 * "Previous/Next project" pair) can record what's behind the destination
 * before navigating — see lib/back-peek.ts. ProjectContent itself stays a
 * plain server component (no directive), same as every other interactive
 * bit inside it (ProjectTitle, HeroLightbox, BackToTopLink); this is just
 * another one of those islands, not a reason to convert the whole file.
 *
 * Swiping between projects (project-stack-swipe.tsx) records the same
 * shape itself, at the point its own touch handler commits a navigation
 * — these two are the only ways to move project-to-project, so between
 * them every path into a project page's "back" gesture has a record
 * waiting for it.
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
      onClick={() =>
        recordBackTarget(toSlug, { kind: "project", slug: fromSlug, scrollY: window.scrollY })
      }
      {...rest}
    >
      {children}
    </Link>
  );
}
