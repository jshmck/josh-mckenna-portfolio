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

export default function WorkPage() {
  const projects = getAllProjects();

  return (
    <div className="mx-auto max-w-frame px-6 pb-20 pt-8 md:px-gutter">
      {/* No visible title — Josh wants the gallery to be the page, not a
          labelled section. A screen-reader-only h1 keeps the page's
          heading structure intact; the browser tab title still says
          "Work" via metadata above. */}
      <h1 className="sr-only">Work</h1>

      {/* A transparent PNG, not a framed photo -- same treatment as the
          Contact/Info page illustrations: next/image directly,
          object-contain, no Plate frame or background surface. */}
      <div className="relative aspect-[932/617] w-full max-w-[210px]">
        <Image
          src="/illustrations/ipad.png"
          alt=""
          fill
          sizes="210px"
          className="object-contain"
        />
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
