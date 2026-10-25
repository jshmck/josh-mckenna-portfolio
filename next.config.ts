import type { NextConfig } from "next";

import { legacyRedirects } from "./lib/legacy-redirects";

const nextConfig: NextConfig = {
  /* /about -> /info (2026-09-07): the route slug was renamed to match
     the nav's visible "Info" label before the joshmckenna.com cutover,
     while zero external links/SEO equity point at /about — see the
     commit. Permanent (308) so any stray bookmark or shared preview
     link keeps working forever; remove only if the route is ever
     genuinely repurposed. */
  async redirects() {
    return [
      { source: "/about", destination: "/info", permanent: true },
      // Old-site URLs Google still has indexed — see lib/legacy-redirects.ts.
      ...legacyRedirects(),
    ];
  },
  // Everything under public/ was served `max-age=0, must-revalidate`, so
  // every video and raw image cost a conditional round trip on each view
  // — the main reason media felt slow on a phone connection. Artwork is
  // renamed on content swaps (see the media-pipeline note: Next's image
  // cache keys on the URL too), so a week of freshness plus a month of
  // stale-while-revalidate is safe. Scoped to media extensions so the
  // /work/[slug] HTML routes under the same prefixes keep revalidating.
  async headers() {
    return [
      {
        source:
          "/:dir(work|about|illustrations|logos)/:path*.:ext(mp4|webp|jpg|jpeg|png|svg|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=2592000",
          },
        ],
      },
    ];
  },
  // Shop product photos are fetched live from Big Cartel (lib/shop.ts) and
  // served from their asset host, not public/ — next/image needs the
  // domain allowlisted to optimise them.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.bigcartel.com" },
    ],
  },
  // Belt-and-braces behind app/work/[slug]/page.tsx's dynamicParams=false
  // (see its comment): the per-project OG route readFile()s hero art from
  // public/, and if a fallback lambda for it ever comes back, file tracing
  // would again bundle all ~212MB of public/ into every deployment — the
  // exact overflow behind Vercel's 10GB Function Storage alert. All OG
  // images prerender, so no lambda ever needs these files at runtime.
  // Both keys, not just the OG route: the sibling page lambda inherits the
  // segment's trace and was carrying the same 212MB even though the page
  // itself never touches the filesystem.
  outputFileTracingExcludes: {
    "app/work/\\[slug\\]/opengraph-image": ["./public/**"],
    "app/work/\\[slug\\]/page": ["./public/**"],
  },
};

export default nextConfig;
