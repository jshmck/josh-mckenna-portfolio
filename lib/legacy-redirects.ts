/**
 * The previous joshmckenna.com (a hosted portfolio builder) published
 * project pages at /portfolio/<slug> and a /graphicdesign?itemId=… index.
 * Google still has ~130 of those URLs and they all 404 on this site —
 * Search Console's "Not found" report was 131 of the 169 un-indexed
 * pages (2026-10-25). Redirecting them hands whatever ranking and any
 * inbound links they hold to the matching current page.
 *
 * Only slugs that clearly name a current project are mapped. The rest
 * (the old 3d0x / a-z-x series, feev, vodafone, xt6, ysl, carnaby-street,
 * and projects since archived) fall through to /work rather than being
 * guessed at.
 */
export const LEGACY_PROJECT_SLUGS: Record<string, string> = {
  atlmag: "atlanta-magazine",
  bombaysapphire: "bombay-sapphire",
  bronco: "ford-bronco",
  "bum-selfie": "womp-bum-selfie",
  "c-magazine": "california-magazine",
  honda: "honda-super-n",
  "instagram-sticker": "instagram-sticker",
  kiehls: "kiehls-trevor-project",
  lapride2024: "la-pride",
  levis: "levis-rainbow-rodeo",
  mrporter: "mr-porter-miami-invites",
  nomad: "nomad-wheels-505-livery",
  opto: "opto-markets-2019",
  "palm-springs": "palm-springs",
  "piper-heidsieck": "piper-heidsieck",
  servebots: "figma-servebots",
  smeralda: "costa-smeralda",
  "step-journal": "step-journal",
  underground: "figma-underground",
  virgil: "figma-vitra-virgil",
  "vogue-mag": "vogue-sun-tan",
  wagamamabrighton: "wagamama-pride",
  wagamamapride: "wagamama-pride",
  "weapons-of-reason": "weapons-of-reason-gay-divide",
  yeti: "figma-yeti",
};

type Redirect = { source: string; destination: string; permanent: true };

export function legacyRedirects(): Redirect[] {
  return [
    ...Object.entries(LEGACY_PROJECT_SLUGS).map(([from, to]) => ({
      source: `/portfolio/${from}`,
      destination: `/work/${to}`,
      permanent: true as const,
    })),
    // Every other old project page: the gallery, not a 404.
    { source: "/portfolio/:slug*", destination: "/work", permanent: true },
    { source: "/portfolio", destination: "/work", permanent: true },
    { source: "/graphicdesign", destination: "/work", permanent: true },
    { source: "/selectedprojects", destination: "/work", permanent: true },
    { source: "/press", destination: "/info", permanent: true },
    // A project that was renamed when it moved under the womp- series.
    { source: "/work/bum-selfie", destination: "/work/womp-bum-selfie", permanent: true },
  ];
}
