import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* /about -> /info (2026-09-07): the route slug was renamed to match
     the nav's visible "Info" label before the joshmckenna.com cutover,
     while zero external links/SEO equity point at /about — see the
     commit. Permanent (308) so any stray bookmark or shared preview
     link keeps working forever; remove only if the route is ever
     genuinely repurposed. */
  async redirects() {
    return [{ source: "/about", destination: "/info", permanent: true }];
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
