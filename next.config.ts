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
};

export default nextConfig;
