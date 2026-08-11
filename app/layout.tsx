import type { Metadata } from "next";
import { Archivo, Archivo_Black, Space_Mono } from "next/font/google";
import localFont from "next/font/local";

import { Footer } from "@/components/site/footer";
import { Nav } from "@/components/site/nav";
import { siteConfig } from "@/lib/site";

import "./globals.css";

/* Body — variable weight, used at 15px and 22px in the wireframes. */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

/* Grotesque for the tight statement headings. */
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
});

/* Waldeck (trial) — Josh's display face for the wordmark, section titles and
   marquee. Self-hosted from public/fonts/waldeck. These are trial weights;
   swap in the licensed files at the same paths before launch (DESIGN.md). */
const waldeck = localFont({
  src: [
    { path: "../public/fonts/waldeck/Waldeck-trial-Medium.otf", weight: "500", style: "normal" },
    { path: "../public/fonts/waldeck/Waldeck-trial-Bold.otf", weight: "700", style: "normal" },
    { path: "../public/fonts/waldeck/Waldeck-trial-Black.otf", weight: "900", style: "normal" },
  ],
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${archivoBlack.variable} ${spaceMono.variable} ${waldeck.variable} h-full`}
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
