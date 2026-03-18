# Autonomous Session Handoff

**For:** Next Claude Code session (with "dangerously skip permissions")
**Date:** 2026-02-28
**Status:** Sprint 1 complete. Sprint 2 ready to start.

---

## What to Do First

1. Read `docs/BTR_PROGRESS.md` — check current sprint and dashboard
2. Read `docs/feature_list.json` — get feature details and test steps
3. Read `CLAUDE.md` — review conventions and BTR workflow
4. Clean up old branches: delete `feature/F061-analytics-fix`, `feature/F071-pdf-export`, and any `worktree-*` branches

---

## Sprint 2: Incomplete Core Features

These are the next features to build. Work them in priority order. F048, F049, F050, and F035+F100 can run in parallel (different files). F072 is now unblocked.

### F048 — Dense Paragraph AI Rewrite
- **Problem:** Dense paragraphs are flagged but no AI suggestion is wired up
- **Files to check:** `src/components/IssueDetailModal.tsx` (look for `dense-content` or `chunking` category), `src/utils/aiFixerService.ts`
- **What to build:** When a dense paragraph issue is opened in the modal, call the AI to generate a rewritten version that breaks up the text. Show the suggestion in the same card style as other AI suggestions.
- **Branch:** `feature/F048-dense-rewrite`

### F049 — Layout Table Semantic Conversion
- **Problem:** Layout tables are flagged but there's no purpose-selection step
- **Files to check:** `src/components/IssueDetailModal.tsx` (look for `layout-table` category), `src/utils/canvasFixer.ts`
- **What to build:** When a layout table is detected, the modal should ask the user what the table's purpose is (data table vs layout). If layout, offer to convert it to semantic HTML (divs/CSS). If data, add proper headers.
- **Branch:** `feature/F049-table-conversion`

### F050 — AI Broken Link Replacement
- **Problem:** Broken links are detected but no AI replacement is suggested
- **Files to check:** `src/components/IssueDetailModal.tsx` (look for `broken-link` category), `src/utils/aiFixerService.ts`, `src/utils/scanners/linkDetector.ts`
- **What to build:** When a broken link is detected, call the AI to suggest a replacement URL based on the link text and surrounding context. Show the suggestion in the modal.
- **Branch:** `feature/F050-broken-link-ai`

### F035 + F100 — Batch Publish Progress Feedback
- **Problem:** Batch publish works but shows no per-item progress
- **Files to check:** `src/components/IssueDetailModal.tsx` or wherever batch publish is triggered, `src/utils/canvasFixer.ts`
- **What to build:** When publishing multiple staged fixes at once, show a progress indicator with per-item status (pending → publishing → done/failed). This is F035 (batch publish) + F100 (progress UI) combined.
- **Branch:** `feature/F035-batch-progress`

### F072 — Leadership Brief Export
- **Problem:** Text content works but PDF export is broken
- **Files to check:** `src/components/ComplianceReports.tsx` (leadership brief section), already uses jsPDF from F071 fix
- **What to build:** Wire the leadership brief export to use the same jsPDF approach as the main PDF export. The brief is a shorter, executive-summary format.
- **Branch:** `feature/F072-leadership-brief`
- **Note:** F072 was blocked by F071 — now unblocked since F071 is merged.

---

## Workflow for Each Feature

```
git checkout main
git pull origin main
git checkout -b feature/F0XX-name

# ... make changes ...

npm run build                    # Must pass with zero errors
git add <specific-files>
git commit -m "Description of changes"

# Update docs/feature_list.json — set "passes": true
# Update docs/BTR_PROGRESS.md — move to passing, update counts, add changelog
# Commit the doc updates too

# DO NOT merge to main — leave for user review
git checkout main
# Move to next feature
```

---

## Important Reminders

- **Every new ScanIssue must have `standardsTags`** — use `getStandardsTagsForIssue('<category>')`
- **No auto-publish** — fixes always go through staging first
- **Build must pass** — `npm run build` is the only automated check, run it before every commit
- **Don't merge to main** — leave feature branches for user review
- **IssueDetailModal is huge** (~186KB) — search for category-specific booleans near the top to find the right rendering branch
- **AI calls go through Supabase proxy** — see `aiFixerService.ts` for the pattern
- **Read the feature's `steps` array** in feature_list.json to know exactly what to verify

---

## After Sprint 2

Move to Sprint 3 (Missing Scanner Coverage): F017, F018, F019, F023
Then Sprint 4 (Polish & UX): F063, F101, F102
Skip F007 and F081 (blocked — need architectural decisions).
