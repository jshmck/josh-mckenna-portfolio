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
    <div className="mx-auto max-w-frame px-6 py-20 md:px-gutter">
      <header>
        <h1 className="type-display text-accent">WORK</h1>
      </header>

      <div className="mt-12">
        {/* Every category shows as a chip, even ones with no work yet
            (3D) — Josh wants the full set visible, not just active ones. */}
        <WorkGallery projects={projects} categories={[...PROJECT_CATEGORIES]} />
      </div>

      <BackToTop />
    </div>
  );
}
