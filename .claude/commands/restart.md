---
description: Clear caches and restart the dev server on :3000 for a fresh start
allowed-tools: Bash
---

Clear every cache and bring the Next.js dev server back up clean. Use this when
the build goes stale, Tailwind stops picking up token changes, or a font/route
change isn't showing.

## Steps

1. **Free port 3000 — port-scoped only.**

   ```bash
   lsof -ti tcp:3000 | xargs kill 2>/dev/null || true
   ```

   Never `pkill -f 'next dev'`. That matches by command string and would kill
   unrelated dev servers running from other projects on other ports.

2. **Report cache sizes before clearing**, so the user sees what was freed:

   ```bash
   du -sh .next node_modules/.cache 2>/dev/null
   ```

3. **Remove the caches:**

   ```bash
   rm -rf .next node_modules/.cache
   ```

4. **Reinstall only if `package.json` changed** since the last install (a
   full `npm install` on every restart is slow and rarely the fix):

   ```bash
   git diff --name-only HEAD~1 2>/dev/null | grep -q package.json && npm install || echo "deps unchanged — skipping install"
   ```

5. **Start the dev server in the background** (it's long-running):

   ```bash
   npm run dev
   ```

6. **Confirm it's actually up** before reporting success:

   ```bash
   curl --retry-connrefused --retry 20 --retry-delay 1 -sf -o /dev/null -w "dev server HTTP %{http_code}\n" http://localhost:3000
   ```

## Report

- Cache freed (`.next` + `node_modules/.cache` sizes).
- Dev server up on `:3000`, or the exact error if it isn't.
- Current branch and whether the working tree is dirty.

## Notes

- `.next` grows past 500 MB over a long session; clearing it resolves most
  stale-build symptoms.
- Tailwind v4 reads tokens from `app/globals.css` at build time. If a new token
  isn't producing a utility class, this restart is the fix.
- If a font change isn't applying, confirm the `next/font` variable name in
  `app/layout.tsx` matches the `--font-*` reference in `globals.css`.
