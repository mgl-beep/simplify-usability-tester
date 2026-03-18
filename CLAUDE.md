# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server on port 3000 (auto-opens browser)
npm run build     # Production build → build/ directory
```

No test runner is configured. Validate changes with `npm run build` to catch TypeScript/JSX errors.

## What This App Does

**SIMPLIFY** is a React SPA that scans Canvas LMS courses for accessibility and quality issues, suggests AI-generated fixes, and applies them back to Canvas via the API. It targets California Community College faculty preparing CVC-OEI compliant courses.

Core workflow: **Connect Canvas → Select Course → Scan → Review Issues → Stage Fix → Publish to Canvas**

## Architecture

### State & Data Flow

All global state lives in `src/App.tsx` (~1,800 lines). It holds:
- Canvas connection config
- `scanResults: ScanIssue[]` — the central data structure for all detected issues
- Fix staging state, modal open/close state, selected course

`App.tsx` passes `scanResults` down through `SimplifyDashboard` → `ScanPanel`, `Analytics`, `IssueDetailModal`, etc. There is no Redux or Zustand — pure prop drilling from the root.

### The `ScanIssue` Interface

Defined in `src/App.tsx`. Every issue has `standardsTags: string[]` (e.g., `["cvc-oei:D3", "qm:8.3"]`). The `category` field drives which UI branch renders in `IssueDetailModal`. Key fields:
- `elementHtml` — the raw HTML snippet from Canvas that triggered the issue
- `contentType` / `contentId` — what Canvas entity to update when fixing
- `whereToAddPageUrl` — for objectives issues, the specific Canvas page URL to update
- `stagedFix` — populated when a fix is staged but not yet published

### Scan Engine (`src/utils/`)

`courseScanner.ts` orchestrates these scanners sequentially:
1. `scanners/accessibilityScanner.ts` — WCAG: alt text, contrast, headings, tables, lists
2. `scanners/usabilityScanner.ts` — content structure: chunking, nav depth, captions
3. `scanners/cvcOeiRubricScanner.ts` — full CVC-OEI A–D rubric (biggest scanner, ~80KB)
4. `scanners/designScanner.ts` — visual consistency
5. `scanners/linkDetector.ts` — broken links, long URLs

`standardsMapping.ts` tags issues with rubric standard codes after scanning.

### Fix Engine

`canvasFixer.ts` — applies HTML fixes to Canvas via the Supabase proxy. Each issue `category` has a dedicated case. The fix is staged in `fixStaging.ts` (stores original + fixed content for undo) before being published.

Canvas API calls cannot go direct from the browser (CORS). All Canvas API requests are proxied through a **Supabase Edge Function** (`/canvas-proxy`). The Supabase project config is in `src/utils/supabase/info.tsx`.

### AI Integration

`aiFixerService.ts` calls GPT-4o via the Supabase Edge Function. Used for alt text generation, link text suggestions, learning objectives (Bloom's taxonomy), and content rewrites. Suggestions are cached by element hash to avoid duplicate API calls.

### Persistence

All scan results persist to `localStorage` — no cloud sync for scan data:
- `simplify_all_scan_results` — issues per course
- `simplify_all_scan_times` — last scan timestamps
- `simplify_enabled_standards` — active rubric filter state

### Key Large Files

- `src/components/IssueDetailModal.tsx` (~186KB) — handles every fix type in one component. Each issue category has its own rendering branch. `isContrastIssue`, `isAltTextIssue`, `isObjectivesIssue`, etc. are boolean flags derived from `issue.category` near the top of the component.
- `src/utils/scanners/cvcOeiRubricScanner.ts` (~80KB) — full rubric implementation
- `src/utils/canvasFixer.ts` (~63KB) — fix application logic

## BTR Process (Build, Test, Review)

All feature work follows the BTR process. See `docs/BTR_PROCESS.md` for the full workflow.

### Key Files

| File | Purpose |
|------|---------|
| `docs/feature_list.json` | Source of truth — 46 features with test steps, dependencies, `passes` boolean |
| `docs/BTR_PROGRESS.md` | Dashboard and work queue — what's passing, failing, and next up |
| `docs/BTR_PROCESS.md` | Step-by-step workflow documentation |
| `docs/SIMPLIFY_APP_SPEC.txt` | Full XML-format app specification |

### Branch Naming

```
feature/<feature-id>-<short-name>
```
Examples: `feature/F048-dense-rewrite`, `feature/F035-batch-progress`

### Autonomous Workflow

When working autonomously (with "dangerously skip permissions"):

1. **Read** `docs/BTR_PROGRESS.md` to find the current sprint and next features
2. **Read** the feature entry in `docs/feature_list.json` for description, test steps, and dependencies
3. **Check dependencies** — all features in the `dependencies` array must already have `"passes": true`
4. **Create a feature branch** from `main` — `git checkout -b feature/F0XX-name`
5. **Build the feature** — follow the app spec and conventions below
6. **Run `npm run build`** — must pass with zero errors before committing
7. **Test** — run through every step in the feature's `steps` array
8. **Commit** to the feature branch with a descriptive message
9. **DO NOT merge to main** — leave the feature branch for the user to review
10. **Update** `docs/feature_list.json` — set `"passes": true` if all steps pass
11. **Update** `docs/BTR_PROGRESS.md` — move feature to passing, update dashboard counts, add changelog entry
12. **Move to the next feature** in priority order

### Parallel Work Rules

- Features marked `"parallelizable": true` with no shared file dependencies can be worked simultaneously
- **Same file = sequential.** If two features modify the same file, work them one at a time
- **Different files = parallel.** Use subagents on separate branches
- Always check the `dependencies` array — a feature cannot start until all dependencies pass

### Sprint Order

Work features in this order (Sprint 1 is complete):
1. ~~Sprint 1: Critical Bugs (F061, F071)~~ — DONE
2. **Sprint 2: Incomplete Core Features** — F048, F049, F050, F035+F100, F072
3. Sprint 3: Missing Scanner Coverage — F017, F018, F019, F023
4. Sprint 4: Polish & UX — F063, F101, F102

Blocked items (skip until unblocked):
- F007 — All Courses Aggregate View (stale data problem, needs architectural decision)
- F081 — IMSCC Fix Publish (content ID mapping problem)

## Important Conventions

**Standards tags format:** `"cvc-oei:D5"`, `"qm:8.1"`, `"peralta:E4"` — always lowercase prefix, colon separator, uppercase section ID.

**Severity scoring:** high = −10 pts, medium = −5 pts, low = −2 pts from a base of 100. Score floors at 0.

**No auto-publish:** Every fix goes through `fixStaging.ts` (staged state) before the user explicitly publishes. Never bypass this workflow.

**`skipFetch` guard in `IssueDetailModal`:** Issues with `contentType === 'module'`, `contentType === 'course'`, `contentId === 'syllabus'`, or categories like `'policies'`/`'objectives'` must set `skipFetch = true` before calling `loadContent()` — these aren't fetchable Canvas page URLs.

**Color contrast fix format:** `issue.suggestedFix` for contrast issues is raw CSS (`"color:#xxxxxx"`). Parse with regex `/color:\s*(#[0-9a-fA-F]{3,6})/` — never display this raw string to users.

**New issues must have `standardsTags`:** Every `ScanIssue` object created by any scanner must include `standardsTags: getStandardsTagsForIssue('<category>')`. Without this, the issue won't appear in per-standard analytics pills.

**PDF export uses jsPDF:** `ComplianceReports.tsx` uses `jsPDF` for programmatic PDF generation. Do not revert to popup/print dialog approach.
