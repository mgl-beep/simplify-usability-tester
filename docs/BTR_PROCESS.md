# BTR Process — Build, Test, Review

**The "Butter" Process for SIMPLIFY LTI**

This document describes how features are developed, tested, and merged into the main codebase. The goal is to keep `main` stable and deployable at all times while making steady progress on new features.

---

## Overview

BTR stands for **Build, Test, Review** — three steps every feature goes through before it reaches `main`:

1. **Build** — Write the code on a dedicated feature branch
2. **Test** — Verify the feature works by running through its test steps from `feature_list.json`
3. **Review** — You (the project owner) review the changes and approve the merge

No code goes directly to `main`. Every change flows through a feature branch first.

---

## How It Works (Step by Step)

### Step 1: Pick a Feature

Look at `docs/BTR_PROGRESS.md` to see what's next in the work queue. Features are organized by priority:

- **Priority 1** — Critical bugs (fix first)
- **Priority 2** — Incomplete core features
- **Priority 3** — Missing scanner coverage
- **Priority 4** — Polish and UX improvements

Within the same priority, multiple features can be worked on at the same time if they're marked `"parallelizable": true` in `feature_list.json`.

### Step 2: Create a Feature Branch

Every feature gets its own branch. The naming convention is:

```
feature/<feature-id>-<short-description>
```

Examples:
- `feature/F061-analytics-fix`
- `feature/F071-pdf-export`
- `feature/F048-dense-rewrite`

To create a branch:
```bash
git checkout main
git pull origin main
git checkout -b feature/F061-analytics-fix
```

This creates a new branch based on the latest `main` and keeps `main` untouched.

### Step 3: Build the Feature

Write the code to make the feature work. Follow these rules:

- **Read the feature entry** in `feature_list.json` for the full description and test steps
- **Check dependencies** — make sure all features in the `dependencies` array are already passing
- **Follow the invariants** in `SIMPLIFY_APP_SPEC.txt` (stage→publish workflow, AI confirmation, etc.)
- **Run `npm run build`** to catch TypeScript errors (there's no test runner, so the build is our safety check)

### Step 4: Test the Feature

Run through every step listed in the feature's `steps` array from `feature_list.json`. For example, if the feature is F061 (Analytics 0% Fix), you'd:

1. Scan a course with issues tagged to multiple standards
2. Navigate to Analytics tab
3. Check that CVC-OEI percentage is > 0% (not stuck at 0)
4. Check that QM percentage is > 0%
5. Check that Peralta percentage is > 0%
6. Toggle standards filters and verify percentages change
7. Verify percentages match the actual ratio

If all steps pass, update `feature_list.json` by changing `"passes": false` to `"passes": true`.

If any step fails, fix the code and re-test.

### Step 5: Commit and Push

```bash
git add <specific-files-you-changed>
git commit -m "Fix analytics 0% bug — normalize standardsTags format"
git push -u origin feature/F061-analytics-fix
```

### Step 6: Review

This is where you (the project owner) come in:

1. Look at the changes on the feature branch
2. Test the feature on localhost (`npm run dev`)
3. If it looks good, approve the merge
4. If something needs adjustment, provide feedback

### Step 7: Merge to Main

After approval:
```bash
git checkout main
git merge feature/F061-analytics-fix
git push origin main
```

This triggers an automatic Vercel deploy (frontend). If the feature also changed the Supabase Edge Function, a manual backend deploy is needed.

### Step 8: Update Tracking

After merging, update `docs/BTR_PROGRESS.md`:
- Move the feature from "Failing" to "Passing"
- Update the dashboard counts
- Add an entry to the Changelog
- Check if the merge unblocks any other features

---

## Parallel Work with Subagents

When multiple features are parallelizable (no dependency conflicts), the agent can work on several at once using subagents — each on its own feature branch. The key rules:

- **Same file = not parallel.** If two features modify the same file, work them sequentially.
- **Different files = parallel.** Scanner checks in different scanner files can be built simultaneously.
- **Check the dependency graph.** A feature's `dependencies` array in `feature_list.json` lists what must pass first.

Example of safe parallel work:
- F017 (list detection) → modifies `accessibilityScanner.ts`
- F019 (autoplay detection) → modifies `accessibilityScanner.ts`
- These modify the SAME file — work sequentially, not in parallel

- F061 (analytics fix) → modifies `Analytics.tsx`, `standardsMapping.ts`
- F071 (PDF export) → modifies `ComplianceReports.tsx`
- These modify DIFFERENT files — safe to work in parallel

---

## feature_list.json Schema

Each feature entry has these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., "F061") |
| `category` | string | Grouping (core-scanning, fix-types, analytics, etc.) |
| `feature` | string | Short feature name |
| `description` | string | What it does and why |
| `priority` | number | 0=done/foundation, 1=critical bug, 2=incomplete core, 3=missing scanner, 4=polish |
| `dependencies` | string[] | Feature IDs that must pass before this one can be built |
| `parallelizable` | boolean | Whether this can be worked alongside other features at same priority |
| `steps` | string[] | Manual test steps to verify the feature works |
| `passes` | boolean | **THE ONLY FIELD THE AGENT SHOULD CHANGE** — set to true when all steps pass |

---

## Branch Lifecycle

```
main (stable, deployed)
  │
  ├── feature/F061-analytics-fix     ← created from main
  │     │  (build + test)
  │     └── merged back to main      ← after review approval
  │
  ├── feature/F071-pdf-export        ← created from main (can run parallel with F061)
  │     │  (build + test)
  │     └── merged back to main      ← after review approval
  │
  └── main (updated with both features)
```

---

## When Things Go Wrong

**Build fails (`npm run build` errors):**
- Fix the TypeScript errors before committing. The build is our only automated check.

**Feature breaks another feature:**
- Check `feature_list.json` — re-run the test steps for any feature that shares the same files.
- If a passing feature starts failing, that's a regression. Fix it before merging.

**Merge conflicts:**
- If your feature branch conflicts with main, rebase:
  ```bash
  git checkout feature/your-branch
  git rebase main
  ```
- Resolve conflicts, then continue with the merge.

**Need to abandon a feature branch:**
- Just switch back to main. The branch can be deleted later:
  ```bash
  git checkout main
  git branch -d feature/abandoned-branch
  ```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start a feature | `git checkout -b feature/F0XX-name` |
| Check your branch | `git branch` (star marks current) |
| Build check | `npm run build` |
| Dev server | `npm run dev` (opens localhost:3000) |
| Push branch | `git push -u origin feature/F0XX-name` |
| Switch to main | `git checkout main` |
| Merge after approval | `git checkout main && git merge feature/F0XX-name` |
| Deploy backend | See MEMORY.md for Supabase CLI command |
