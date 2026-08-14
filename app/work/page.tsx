import type { Metadata } from "next";

import { WorkGallery } from "@/components/work/work-gallery";
import { getActiveCategories, getAllProjects } from "@/lib/projects";

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
        <p className="type-lede mt-5 max-w-2xl text-ink-muted">
          Everything worth showing, newest first. Filter if you know what you
          came for.
        </p>
      </header>

      <div className="mt-12">
        <WorkGallery projects={projects} categories={getActiveCategories()} />
      </div>
    </div>
  );
}
