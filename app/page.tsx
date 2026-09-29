import type { Metadata } from "next";

import { HomeBelowHero } from "@/components/home/below-hero";
import { DriftingHero } from "@/components/home/drifting-hero";
import { PageEndCard } from "@/components/ui/page-end-card";
import { PROJECT_CATEGORIES, getAllProjects } from "@/lib/projects";

/** Title/description inherit from the root layout — this exists only for
 *  the canonical (SEO pass, 2026-09), so ?category= deep links into the
 *  embedded gallery all resolve to the one homepage. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const projects = getAllProjects();

  return (
    <PageEndCard>
      <DriftingHero />
      <HomeBelowHero projects={projects} categories={[...PROJECT_CATEGORIES]} />
    </PageEndCard>
  );
}
