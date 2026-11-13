import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";
import sharp from "sharp";

// The link preview for the private /meta page: the Instagram Pride
// sticker character on its lavender. Source is .webp, which next/og can't
// decode, so sharp builds a finished PNG. The square art is fitted whole
// inside the 1.9:1 card, and the card is filled with the artwork's own
// lavender, sampled from its corner so there's no colour to keep in sync.
export const alt = "Josh McKenna — selected work";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MARGIN = { x: 40, y: 30 };

export default async function Image() {
  const source = await readFile(
    join(process.cwd(), "public/work/instagram-sticker/01-instagram-sticker-bg2-hr.webp"),
  );

  const { data: corner } = await sharp(source)
    .extract({ left: 5, top: 5, width: 1, height: 1 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const background = { r: corner[0], g: corner[1], b: corner[2] };

  const art = await sharp(source)
    .resize(size.width - MARGIN.x * 2, size.height - MARGIN.y * 2, {
      fit: "contain",
      background,
    })
    .extend({
      top: MARGIN.y,
      bottom: MARGIN.y,
      left: MARGIN.x,
      right: MARGIN.x,
      background,
    })
    .png()
    .toBuffer();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <img
          src={`data:image/png;base64,${art.toString("base64")}`}
          width={size.width}
          height={size.height}
          alt=""
        />
      </div>
    ),
    { ...size },
  );
}
