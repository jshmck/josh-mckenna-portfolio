import type { Metadata } from "next";

import { PageEndCard } from "@/components/ui/page-end-card";
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
    <PageEndCard>
      <div className="mx-auto max-w-frame px-6 pb-32 pt-8 md:px-gutter">
        {/* No visible title — Josh wants the gallery to be the page, not a
            labelled section. A screen-reader-only h1 keeps the page's
            heading structure intact; the browser tab title still says
            "Work" via metadata above. */}
        <h1 className="sr-only">Work</h1>

        {/* Top illustration row now lives inside WorkGallery -- it needs to
            react to the active filter (swaps to a Pride piece when that
            pill's selected), so it moved to the client component that
            already owns that state. See components/work/work-gallery.tsx. */}
        <WorkGallery projects={projects} categories={[...PROJECT_CATEGORIES]} />
      </div>
    </PageEndCard>
  );
}
