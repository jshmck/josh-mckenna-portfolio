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
      type: "website",
      siteName: siteConfig.name,
      title: `${title} — ${siteConfig.name}`,
      description,
      url: path,
      // A page that defines its own openGraph does NOT inherit the root
      // opengraph-image file convention's image, nor the layout's type and
      // siteName — the first version of this helper dropped all three, so
      // shared /work, /info, /contact, /shop, /privacy and /terms links
      // went out with no image. Restated here, pointing at the sitewide
      // card (app/opengraph-image.tsx).
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — ${siteConfig.role}`,
        },
      ],
    },
    twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
  };
}
