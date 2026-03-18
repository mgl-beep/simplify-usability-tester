# F050 — AI Broken Link Replacement

**Branch:** `feature/F050-broken-link-ai`
**Files changed:** `linkDetector.ts`, `cvcOeiRubricScanner.ts`, `canvasFixer.ts`, `IssueDetailModal.tsx`, `courseScanner.ts`, `contentScanner.ts`

## What changed

Before: Broken links were detected in demo/IMSCC modes only, and there was no way to fix them — no URL input, no fix pipeline.

Now: The scanner detects broken link patterns (empty hrefs, javascript: links, placeholder URLs), and the modal lets you enter a replacement URL + link text, then publish the fix to Canvas.

## How to test

### Setup
1. Open the app at localhost:3000
2. Connect to Canvas and select a course that has links with problems (empty hrefs, javascript:void links, or links to example.com)
3. Run a scan

### Test broken link detection
4. Look for issues titled **"Broken or Invalid Link"** in the scan results
5. If you don't see any, that's OK — it means your course doesn't have obviously broken links. You can test with the demo data instead (disconnect from Canvas and scan to get demo issues including "Broken External Link")

### Test the fix flow
6. Click on a broken link issue to open the detail modal
7. You should see:
   - The flagged link HTML at the top
   - A **"Replacement URL"** input field — type a working URL here (like `https://www.google.com`)
   - Below that, a **"New Link Text"** input — type descriptive text (like "Google Search")
   - AI may auto-suggest link text (blue spinner while loading)
   - The URL field shows green "Valid URL format" when you enter a proper https:// URL
   - The URL field shows orange warning if the format looks incomplete
8. The **Save & Close** button stays disabled until BOTH fields are filled in
9. Click **Save & Close** to stage the fix
10. You should see a before/after preview showing the old broken link replaced with your new URL and text
11. Publish to Canvas to apply

### What to look for
- Does the replacement URL field appear only for broken link issues (not for other link issues)?
- Does the Save & Close button correctly require both URL and text?
- Does the AI link text suggestion load automatically?
- Does the before/after preview show the correct changes?

## Pass criteria
- Broken links are detected during scan
- Modal shows both URL and text input fields
- Fix stages correctly with before/after preview
- Fix can be published to Canvas
