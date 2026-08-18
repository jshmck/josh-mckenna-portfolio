import type { MetadataRoute } from "next";

import { getAllProjects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

/** Static routes plus every project detail page — pages/about/contact.tsx
 *  etc. don't set their own lastModified, so this only claims a build-time
 *  timestamp for the routes that actually change with content: the work
 *  index and each project page. */
const STATIC_ROUTES = ["", "/work", "/about", "/contact", "/shop"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
  }));

  const projectEntries: MetadataRoute.Sitemap = getAllProjects().map(
    (project) => ({
      url: `${siteConfig.url}/work/${project.slug}`,
      lastModified: now,
    }),
  );

  return [...staticEntries, ...projectEntries];
}
