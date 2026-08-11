---
description: Add a new portfolio project — ingest artwork, interview, preview, open the PR
argument-hint: "[folder path, Figma URL, or nothing if you're dropping images into the chat]"
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, SendUserFile
---

# /new-project

Activate the `project-intake` skill and run it end to end.

## What Josh handed over

$ARGUMENTS

If that is empty, he is either about to drop images into the chat or expects
you to find them. Do not ask "where are the files?" until
`scripts/find-drop.mjs` has come back empty.

## Context

- Branch: !`git branch --show-current`
- Working tree: !`git status --short`
- Existing slugs (a collision is a broken route): !`grep -n '^    slug:' lib/projects.ts`
- Featured count (the homepage shows exactly 3): !`grep -c 'featured: true' lib/projects.ts`
- Categories in the union: !`sed -n '/^export const PROJECT_CATEGORIES/,/as const/p' lib/projects.ts`
- Already ingested: !`ls public/work 2>/dev/null || echo '(no public/work yet)'`

## Reminders that the skill will hold you to

- Read every image before asking a single question. Arrive with drafts.
- `alt` is printed as a visible caption under each gallery image — write
  captions, not descriptions.
- A fourth `featured: true` silently displaces the oldest one.
- Facts are Josh's. Never invent a client, a year, or a credit.
- Preview in a real browser and send screenshots. Never ask him to check.
