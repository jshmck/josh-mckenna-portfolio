---
description: Commit the current work as one or more atomic, conventionally-formatted commits
allowed-tools: Bash, Read
---

# /commit — atomic commits, not one bundled dump

## Context

- Status: !`git status --short`
- Staged and unstaged diff: !`git diff HEAD`
- Branch: !`git branch --show-current`
- Recent commits (match their voice): !`git log --oneline -8`

## Your task

Commit the work above. The rule that matters: **one commit per logical unit.**
If the diff contains more than one logical change, make more than one commit —
stage selectively with `git add <paths>` rather than `git add -A`.

### Decide the split first

Read the diff and name the logical units before staging anything. Split when
you see:

- A feature plus a refactor that enabled it → refactor first, then feature.
- Two unrelated features → one commit each.
- A fix plus the test that proves it → acceptable together; the test is part of
  the fix.
- Formatting or generated-file churn mixed into a feature → separate `style:`
  or `chore:` commit.

Every commit must leave the tree building. If unit A depends on unit B, commit
B first.

### Format

```
<type>(<scope>): <imperative summary under 72 chars>

<body — why this change, not what the diff already shows. Wrap at 78.>

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`, `perf`.
Scopes in this repo: `design-system`, `layout`, `home`, `work`, `about`,
`contact`, `shop`, `content`, `claude`.

The body earns its place by explaining a decision the diff can't: why this
approach over the obvious one, what constraint forced it, what a reviewer would
otherwise flag. Skip the body only for genuinely trivial commits.

### Before committing

1. Check for secrets: scan the diff for keys, tokens, `.env` contents. If
   anything looks sensitive, stop and ask.
2. Run `npm run build` if the change touches `app/`, `components/` or `lib/`.
   A commit that doesn't build is not atomic, it's a landmine.
3. Never `git add -A` without first reading `git status` — untracked files you
   didn't mean to include are the usual way secrets leak.

### Then

Make the commits. Do not push unless asked. Report the result as a list:

```
- `abc1234` feat(work): add category filters to the gallery
- `def5678` refactor(work): extract ProjectCard from the grid
```

If you decided the work was a single logical unit, say so and why — one commit
is a valid answer, silence about the decision is not.
