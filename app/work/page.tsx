import type { Metadata } from "next";

import { PageEndCard } from "@/components/ui/page-end-card";
import { WorkGallery } from "@/components/work/work-gallery";
import { PROJECT_CATEGORIES, getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Josh McKenna's work spans LGBTQ+ campaigns, editorial illustration, murals, cars, icons, motion and 3D.",
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

        <WorkGallery
          projects={projects}
          categories={[...PROJECT_CATEGORIES]}
          recordContext="work"
        />
      </div>
    </PageEndCard>
  );
}
