import type { Metadata, Viewport } from "next";
import { Archivo_Black, Space_Mono } from "next/font/google";
import localFont from "next/font/local";

import { Footer } from "@/components/site/footer";
import { Nav } from "@/components/site/nav";
import { siteConfig } from "@/lib/site";

import "./globals.css";

/* Body — licensed Helvetica Neue, self-hosted from public/fonts/helvetica-neue.
   Only the cuts the type system actually uses (Roman/Medium/Bold) are loaded.
   Used at 15px and 22px in the wireframes. */
const helveticaNeue = localFont({
  src: [
    { path: "../public/fonts/helvetica-neue/HelveticaNeueRoman.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/helvetica-neue/HelveticaNeueMedium.otf", weight: "500", style: "normal" },
    { path: "../public/fonts/helvetica-neue/HelveticaNeueBold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-helvetica-neue",
  display: "swap",
  fallback: ["Arial", "system-ui", "sans-serif"],
});

/* Grotesque for the tight statement headings. */
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
});

/* Waldeck — Josh's licensed display face for the wordmark, section titles
   and marquee. Self-hosted from public/fonts/waldeck as a single variable
   file. Its wght axis is NOT the standard CSS 100-900 scale: it only spans
   100-340 (Light 100 / Regular 130 / Medium 180 / Bold 250 / Black 340,
   confirmed via the font's fvar/STAT tables). Declaring that real range
   below means an out-of-range request (e.g. Tailwind's font-medium at 500,
   or font-black at 900) clamps to the nearest bound instead of erroring —
   but 500 and 900 both clamp to the SAME 340 and become indistinguishable.
   So nothing should reach for font-medium/font-bold/font-black on text set
   in font-display; use the --font-weight-waldeck-medium/-black tokens
   (globals.css) instead. */
const waldeck = localFont({
  src: [{ path: "../public/fonts/waldeck/Waldeck.ttf", weight: "100 340", style: "normal" }],
  variable: "--font-waldeck",
  display: "swap",
  fallback: ["Archivo Black", "system-ui", "sans-serif"],
});

/* Every uppercase label, eyebrow and meta key on the site. */
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.role}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.role}`,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
};

/** viewportFit: "cover" -- "is it possible to utilise apple's full
 *  screen on safari?? above the dynamic island and battery etc," per
 *  Josh. Without this, iOS Safari keeps the page's own viewport
 *  *excluded* from the safe area around the notch/Dynamic Island/status
 *  bar entirely -- the site's own background never reaches there at
 *  all, and the system shows its own chrome colour in that band
 *  instead, reading as a hard edge where the page "starts." "cover"
 *  extends the viewport (and so the canvas background, and anything
 *  else painted behind the nav) the full height of the screen; nav.tsx
 *  then pads its own content down by env(safe-area-inset-top) so the
 *  jM/pill/Cart shapes themselves stay clear of the actual notch,
 *  rather than rendering behind it. Doesn't touch Safari's own chrome
 *  (URL bar, tab switcher) -- no website can hide that from within a
 *  normal browser tab; that only disappears if someone adds the site to
 *  their Home Screen and launches the icon directly, a separate,
 *  opt-in experience this doesn't attempt. */
export const viewport: Viewport = {
  viewportFit: "cover",
  // "for some reason the dynamic island area is a different colour than
  // the website," per Josh -- without an explicit theme-color, iOS
  // Safari doesn't just trust the page's own background in the safe
  // area; it renders its own translucent scrim there for legibility
  // over whatever content is nearby, which read as a mismatched
  // gray-ish gradient behind the status bar instead of flat canvas.
  // Declaring the colour outright removes the need for that scrim.
  // #faf9f6 mirrors --color-canvas (globals.css) exactly -- this is a
  // browser-chrome API, not CSS, so it genuinely cannot consume the
  // token directly; keep it in sync by hand if canvas ever changes.
  themeColor: "#faf9f6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${helveticaNeue.variable} ${archivoBlack.variable} ${spaceMono.variable} ${waldeck.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="type-label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
