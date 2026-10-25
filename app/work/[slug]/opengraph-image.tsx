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

/** Heroes at least this wide (width / height) are close enough to the 1.9:1
 *  card that a cover crop only trims a sliver. Anything squarer or taller
 *  loses a third to a half of the piece to that crop — Monocle's square
 *  spot illustration showed as a zoomed, soft fragment of its own belt —
 *  so those are shown whole instead. */
const COVER_MIN_RATIO = 1.5;

async function renderHero(absolutePath: string, contain: boolean) {
  const buffer = await readFile(absolutePath);

  if (contain) {
    return sharp(buffer)
      .resize(size.width, size.height, {
        fit: "contain",
        background: CANVAS_BACKGROUND,
      })
      .png()
      .toBuffer();
  }

  const { width = 1, height = 1 } = await sharp(buffer).metadata();
  if (width / height >= COVER_MIN_RATIO) {
    return sharp(buffer)
      .resize(size.width, size.height, {
        fit: "cover",
        position: sharp.strategy.attention,
      })
      .png()
      .toBuffer();
  }

  // Squarer/taller art: the whole piece, centred, over a blurred copy of
  // itself so the side bands match the artwork (on a solid-colour
  // background like the Monocle teal, the blur is just that colour and
  // the join is invisible). Never enlarged — upscaling a small source is
  // what made these cards look soft.
  const backdrop = await sharp(buffer)
    .flatten({ background: CANVAS_BACKGROUND })
    .resize(size.width, size.height, { fit: "cover" })
    .blur(40)
    .png()
    .toBuffer();
  const foreground = await sharp(buffer)
    .resize(size.width, size.height, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
  return sharp(backdrop)
    .composite([{ input: foreground, gravity: "center" }])
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
