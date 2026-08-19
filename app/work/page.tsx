import type { Metadata } from "next";

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
    <div className="mx-auto max-w-frame px-6 pb-20 pt-16 md:px-gutter">
      {/* No visible title — Josh wants the gallery to be the page, not a
          labelled section. A screen-reader-only h1 keeps the page's
          heading structure intact; the browser tab title still says
          "Work" via metadata above. */}
      <h1 className="sr-only">Work</h1>

      {/* pt-16, up from pt-8 -- the Twingo/hand illustration row used to
          start close enough beneath the header that its saturated colours
          bled through the header's frosted-glass blur as a smudge instead
          of a clean glass effect. This padding only has to clear the
          header once, at the very top of the page (unscrolled, header at
          its full 88px) -- it's not a persistent margin like the header
          itself, so it doesn't need to track scroll/compact state: the
          moment you scroll at all, this gap moves out of view along with
          everything above it, same as any other spacing on the page. */}

      {/* Top illustration row now lives inside WorkGallery -- it needs to
          react to the active filter (swaps to a Pride piece when that
          pill's selected), so it moved to the client component that
          already owns that state. See components/work/work-gallery.tsx. */}
      <WorkGallery projects={projects} categories={[...PROJECT_CATEGORIES]} />

      <BackToTop />
    </div>
  );
}
