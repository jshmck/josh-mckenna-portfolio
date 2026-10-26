# Archived assets

Videos used only by archived projects (`lib/archived-projects.ts`,
`lib/archived-features.ts`), moved out of `public/` so they are not copied
into every Vercel deployment (Deployment Storage was at 75% of the 10 GB free
tier, shared with another project on the same team).

The folder mirrors `public/`. To bring a project back, move its files back to
the same path under `public/` (for example
`archived-assets/work/tilda-rice/masala.mp4` -> `public/work/tilda-rice/masala.mp4`)
and move the entry from `lib/archived-projects.ts` into `lib/projects.ts`.

Until then the hidden `/archive` page shows these projects' stills but the video
clips don't play.
