import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

// Flat snapshot of the hero's drift objects around the "JOSH McKENNA"
// wordmark — same art as the animated home hero, composited once for a
// static share card. 2000x1050 source, same 1.905 ratio as the OG frame.
// PNG, not WebP — Satori (next/og's renderer) can't decode WebP.
export const alt = "Josh McKenna — Illustrator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const heroData = await readFile(
  join(process.cwd(), "public/illustrations/og-hero.png"),
  "base64",
);
const heroSrc = `data:image/png;base64,${heroData}`;

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#faf9f6", // --color-canvas (app/globals.css); ImageResponse can't read CSS vars
        }}
      >
        <img
          src={heroSrc}
          width={size.width}
          height={size.height}
          alt=""
        />
      </div>
    ),
    { ...size },
  );
}
