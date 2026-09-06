import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";
import sharp from "sharp";

import { getProject, projects } from "@/lib/projects";

// Per-project OG image, generated from that project's own hero art so a
// shared /work/<slug> link previews the actual piece rather than the
// sitewide identity image (see app/opengraph-image.tsx). Source art is
// .webp; next/og's renderer (satori/resvg) can't decode WebP at all, so
// sharp does the real decoding + crop here and hands ImageResponse an
// already-finished PNG to embed full-bleed.
export const alt = "Josh McKenna — Illustrator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

// Matches --color-canvas (globals.css) — the letterbox colour behind a
// "contain" hero's transparent margins, same treatment Plate gives it live.
const CANVAS_BACKGROUND = { r: 250, g: 249, b: 246, alpha: 1 };

async function renderHero(absolutePath: string, contain: boolean) {
  const buffer = await readFile(absolutePath);
  return sharp(buffer)
    .resize(
      size.width,
      size.height,
      contain
        ? { fit: "contain", background: CANVAS_BACKGROUND }
        : { fit: "cover", position: sharp.strategy.attention },
    )
    .png()
    .toBuffer();
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  const heroSrc = project?.hero.src;

  // Every project ships with real hero.src art (see lib/projects.ts's Plate
  // fallback for anything mid-ingest) — the identity image only covers a
  // slug generateStaticParams didn't know about. Always "contain" for the
  // fallback itself: it's a tall portrait character, not something a
  // "cover" crop should touch.
  const png = await renderHero(
    join(process.cwd(), "public", heroSrc ?? "/illustrations/instagram-sticker-og.png"),
    heroSrc ? project!.hero.fit === "contain" : true,
  );

  return new ImageResponse(
    (
      <img
        src={`data:image/png;base64,${png.toString("base64")}`}
        width={size.width}
        height={size.height}
        alt=""
      />
    ),
    { ...size },
  );
}
