import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";
import sharp from "sharp";

// The link preview for the private /lego page: the 0:11 frame of the 505
// Touring launch film, the same still the film uses as its poster (the
// "505 Touring" title in the corner, the Land Cruiser kicking up dust).
// Source is .webp, which next/og can't decode, so sharp crops it to the
// card and hands over a finished PNG. The 16:9 still loses ~36px top and
// bottom to the 1.9:1 card; the title sits well clear of that.
export const alt = "Josh McKenna — selected work";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const still = await sharp(
    await readFile(
      join(
        process.cwd(),
        "public/work/nomad-wheels-505-livery/05-video-poster-v3.webp",
      ),
    ),
  )
    .resize(size.width, size.height, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <img
          src={`data:image/png;base64,${still.toString("base64")}`}
          width={size.width}
          height={size.height}
          alt=""
        />
      </div>
    ),
    { ...size },
  );
}
