# Tabled Features — Bring Back Later

These features were built and working but tabled by the user for later. They can be re-enabled at any time.

---

## F017 — Manual List Formatting Detection (D2)
**What it does:** Detects text using dashes, asterisks, or bullet characters instead of proper HTML list markup (`<ul>`/`<ol>`).
**How to re-enable:**
- The scanner function (`checkManualListFormatting`) was removed from `src/utils/scanners/accessibilityScanner.ts` during the revert. The full code exists on branch `feature/F017-manual-list-detection` (commit `fda9b20`). Cherry-pick or re-add the function and its call in `scanAccessibility()`.
- Add `"manual-list"` back to the `category` union type in `src/App.tsx`
- Add the `manual-list` mapping back to `src/utils/standards/standardsMapping.ts`

---

## F023 — Course Policies Detection (A12/A13/A14)
**What it does:** Flags courses missing course policies (A12), student support services (A13), and technology support info (A14). Creates one issue per missing element.
**How to re-enable:**
- Uncomment this line in `src/utils/scanners/cvcOeiRubricScanner.ts` (around line 84):
  ```
  // issues.push(...scanA12_A14_InstitutionalSupport(content, courseName, courseId));
  ```
- That's it — the scanner function and all supporting code is still in the file.

---

## F063 — Score Trend History
**What it does:** Saves compliance scores to localStorage after each scan and displays a line chart in the Analytics tab using recharts, with per-course filtering.
**How to re-enable:**
- The full code exists on branch `feature/F063-trend-history` (commit `3e2c478`). Cherry-pick or re-merge that branch into main.
- Adds score history state to `src/App.tsx` and a trend chart to `src/components/Analytics.tsx`

---

## PDF Accessibility Scanner & Converter
**What it does:** Detects PDF files in course modules, flags them as needing accessibility checks, and offers AI-powered conversion from PDF to accessible HTML pages.
**Why tabled:** Was causing 502 crashes and had file ID mismatch issues.
**How to re-enable:**
- In `src/utils/courseScanner.ts` (around line 391-392), change `if (false &&` back to `if (`:
  ```
  // Change this:
  if (false && item.title && item.title.toLowerCase().endsWith('.pdf')) {
  // To this:
  if (item.title && item.title.toLowerCase().endsWith('.pdf')) {
  ```
- Backend converter already exists at `src/supabase/functions/server/pdf-to-html-converter.ts`
- Fix modal handling exists in `src/components/IssueDetailModal.tsx` (pdf-tag category branch)

---

## F007 — All Courses Aggregate View (removed)
**What it does:** Aggregated scan results across all previously scanned courses into one combined view.
**Why tabled:** Stale data problem — no good way to keep aggregate in sync when individual courses change.
**How to re-enable:** Needs architectural decision on how to handle staleness before rebuilding.

---

## F081 — IMSCC Fix Publish to Canvas (removed)
**What it does:** Publish fixes from IMSCC-imported courses back to Canvas.
**Why tabled:** IMSCC content IDs don't match Canvas content IDs after import, so fixes can't be mapped correctly.
**How to re-enable:** Needs a content ID mapping solution before rebuilding.
