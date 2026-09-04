import { HomeBelowHero } from "@/components/home/below-hero";
import { DriftingHero } from "@/components/home/drifting-hero";
import { PageEndCard } from "@/components/ui/page-end-card";
import { PROJECT_CATEGORIES, getAllProjects } from "@/lib/projects";

export default function HomePage() {
  const projects = getAllProjects();

  return (
    <PageEndCard>
      <DriftingHero />
      <HomeBelowHero projects={projects} categories={[...PROJECT_CATEGORIES]} />
    </PageEndCard>
  );
}
