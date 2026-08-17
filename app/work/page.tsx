import type { Metadata } from "next";
import Image from "next/image";

import { BackToTop } from "@/components/ui/back-to-top";
import { WorkGallery } from "@/components/work/work-gallery";
import { PROJECT_CATEGORIES, getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Editorial illustration, character design, packaging and murals by Josh McKenna. Everything worth showing, newest first.",
};

/** Same transparent-PNG treatment as the Contact/Info page illustrations --
 *  next/image direct, object-contain, no Plate frame or background
 *  surface. Order is the order they land in the row, left to right. */
const ILLUSTRATIONS = [
  { src: "/illustrations/twingo-silver-final.png", aspect: "1350/656", height: 115 },
  { src: "/illustrations/ipad.png", aspect: "981/655", height: 115 },
];

export default function WorkPage() {
  const projects = getAllProjects();

  return (
    <div className="mx-auto max-w-frame px-6 pb-20 pt-8 md:px-gutter">
      {/* No visible title — Josh wants the gallery to be the page, not a
          labelled section. A screen-reader-only h1 keeps the page's
          heading structure intact; the browser tab title still says
          "Work" via metadata above. */}
      <h1 className="sr-only">Work</h1>

      <div className="flex flex-wrap items-end gap-6">
        {ILLUSTRATIONS.map(({ src, aspect, height }) => (
          <div
            key={src}
            className="relative"
            style={{ aspectRatio: aspect, height }}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="190px"
              className="object-contain"
            />
          </div>
        ))}
      </div>

      {/* Every category shows as a chip, even ones with no work yet
          (3D) — Josh wants the full set visible, not just active ones. */}
      <div className="mt-10">
        <WorkGallery projects={projects} categories={[...PROJECT_CATEGORIES]} />
      </div>

      <BackToTop />
    </div>
  );
}
