---
description: Pull in a specialist agency pack (a11y, perf, security, ux, database) for focused review or implementation
argument-hint: "<pack> [what you want it to look at]"
allowed-tools: Read, Bash, Grep, Glob, Task
---

# /use-pack — bring in a specialist

Load a specialist persona from `.claude/agency-packs/` and point it at the work.
Each pack is a self-contained agent definition plus a manifest.

## Available packs

| Pack       | Agent                     | Use it for                                                           |
| ---------- | ------------------------- | -------------------------------------------------------------------- |
| `a11y`     | accessibility-auditor     | Keyboard traps, focus order, contrast, screen-reader semantics        |
| `perf`     | performance-benchmarker   | Bundle size, LCP/CLS, animation frame cost, image weight             |
| `ux`       | ux-researcher             | Flow friction, copy clarity, whether a pattern earns its complexity   |
| `security` | security-engineer         | Form handling, dependency risk, headers, data exposure                |
| `database` | database-optimizer        | Only once a CMS or backend replaces `lib/projects.ts`                 |

## What to do

1. Resolve `$ARGUMENTS` to a pack. If it's empty or ambiguous, list the packs
   above and ask which one — don't guess.
2. Read `.claude/agency-packs/<pack>/manifest.yaml` and the agent markdown
   beside it. Follow that agent's instructions as written.
3. Scope the work. If the user named a target, use it. Otherwise default to the
   working diff (`git diff HEAD --name-only`), not the whole repo — a
   whole-codebase audit unasked is noise.
4. Dispatch it as a subagent so its findings come back as a report rather than
   filling this session's context.
5. Relay the findings with `file:line` citations, ranked by severity. Do not
   apply fixes unless the user asks.

## Highest-value packs for this project

`a11y` and `perf`, and for a specific reason: this is an animation-heavy
portfolio built on three hand-rolled rAF/scroll loops and a fully
placeholder-driven image layer. Those are exactly the two things that a type
check and a build cannot catch — a drift loop that leaks a listener, a hero
object that's unreachable by keyboard, or a `<Plate>` shipping a 4K candidate to
a phone will all pass CI and fail a real visitor.

Run `a11y` before any handoff to Josh, and `perf` once real artwork replaces the
placeholders.
