import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

/**
 * Metadata for a top-level page, with its own Open Graph title and
 * description. The root layout's openGraph block is inherited verbatim by
 * any page that doesn't set one, so /work, /info, /contact, /shop and the
 * policy pages were all sharing a link card headed "Josh McKenna —
 * Illustrator" with the homepage blurb under it, whatever page was posted.
 * Twitter's title/description fall back to these, so one object covers
 * both. Project pages build their own (app/work/[slug]/page.tsx).
 */
export function pageMeta({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  return {
    alternates: { canonical: path },
    title,
    description,
    openGraph: {
      title: `${title} — ${siteConfig.name}`,
      description,
      url: path,
    },
  };
}
