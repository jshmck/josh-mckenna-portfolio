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
    <div className="mx-auto max-w-frame px-6 pb-20 pt-32 md:px-gutter">
      {/* No visible title — Josh wants the gallery to be the page, not a
          labelled section. A screen-reader-only h1 keeps the page's
          heading structure intact; the browser tab title still says
          "Work" via metadata above. */}
      <h1 className="sr-only">Work</h1>

      {/* pt-32 -- pt-8 originally, then pt-16, still not enough clearance
          per Josh. The Twingo/hand illustration row needs to sit clearly
          below the standard (expanded, 88px) header, not just past its
          exact edge, so the header's frosted-glass blur has no saturated
          colour close enough beneath it to smudge. This only has to clear
          the header once, at the very top of the page (unscrolled) -- it's
          not a persistent margin like the header itself, so it doesn't
          need to track scroll/compact state: the moment you scroll at
          all, this gap moves out of view along with everything above it,
          same as any other spacing on the page. */}

      {/* Top illustration row now lives inside WorkGallery -- it needs to
          react to the active filter (swaps to a Pride piece when that
          pill's selected), so it moved to the client component that
          already owns that state. See components/work/work-gallery.tsx. */}
      <WorkGallery projects={projects} categories={[...PROJECT_CATEGORIES]} />

      <BackToTop />
    </div>
  );
}
