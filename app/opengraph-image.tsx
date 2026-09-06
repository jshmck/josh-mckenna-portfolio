import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

// The Instagram Pride Sticker character, Josh's most Meta-relevant credit
// (commissioned by Instagram, five years live in the app, murals painted in
// Meta's own offices) — see lib/projects.ts's "instagram-sticker" entry.
// Pre-cropped to its alpha bounding box; #FE939E is the coral sampled from
// its existing /work card background (01-instagram-sticker-bg2-hr.webp), so
// this reads as the same piece of art rather than a new crop of it.
export const alt = "Josh McKenna — Illustrator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const characterData = await readFile(
  join(process.cwd(), "public/illustrations/instagram-sticker-og.png"),
  "base64",
);
const characterSrc = `data:image/png;base64,${characterData}`;

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FE939E",
        }}
      >
        <img src={characterSrc} height={560} alt="" />
      </div>
    ),
    { ...size },
  );
}
