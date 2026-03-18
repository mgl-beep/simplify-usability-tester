# F023 — Course Policies Detection (A12/A13/A14)

**Branch:** `feature/F023-course-policies`
**Key files:** `cvcOeiRubricScanner.ts`, `standardsMapping.ts`

## What this feature does

Detects whether a course includes three types of institutional support information required by the CVC-OEI rubric:

- **A12 — Course Policies**: Grading policies, academic integrity, late policies, syllabus, etc.
- **A13 — Student Support Services**: Tutoring, counseling, disability services (DSPS), library, writing center, financial aid
- **A14 — Technology Support**: Help desk, IT support, Canvas help, technical/browser/system requirements

These are course-level checks — the scanner looks across ALL course content (pages, syllabus, assignments, discussions, modules, announcements) for relevant keywords. If none are found, one issue is created per missing category.

## How to test

### Test 1: Course WITHOUT policies/support/tech info

1. Open the app at localhost:3000
2. Connect to Canvas and select a course that is mostly empty or has minimal content (no syllabus, no policies page, no student resources)
3. Run a scan
4. Look for these three issues in the scan results:
   - **"Course Policies Not Found"** — should have standardsTags including `cvc-oei:A12`
   - **"Student Support Services Not Found"** — should have standardsTags including `cvc-oei:A13`
   - **"Technology Support Information Not Found"** — should have standardsTags including `cvc-oei:A14`
5. All three should have:
   - Severity: medium
   - Category: policies
   - autoFixAvailable: false
   - contentType: course

### Test 2: Course WITH policies/support/tech info

1. Select a course that has a Syllabus page with grading policies, mentions tutoring or counseling, and references tech support or system requirements
2. Run a scan
3. Verify that the corresponding issues are NOT created
   - If the course has a syllabus with grading policy → no "Course Policies Not Found" issue
   - If the course mentions tutoring or disability services → no "Student Support Services Not Found" issue
   - If the course mentions help desk or system requirements → no "Technology Support Information Not Found" issue

### Test 3: Click into an issue

1. Click on any of the three policy issues to open the detail modal
2. Verify:
   - The issue description explains what's missing
   - Fix steps are shown with actionable guidance
   - No errors or blank content (skipFetch should work correctly)
   - The "Why this matters" section shows an impact statement

### What to look for
- Are all three checks working independently? (A course could pass A12 but fail A13 and A14)
- Do the standardsTags show correctly in the analytics pills?
- Does opening the issue modal work without errors?
- Is the severity "medium" for all three?

## Pass criteria
- Courses missing policy keywords get a "Course Policies Not Found" issue (A12)
- Courses missing support service keywords get a "Student Support Services Not Found" issue (A13)
- Courses missing tech support keywords get a "Technology Support Information Not Found" issue (A14)
- Courses that DO have these elements are NOT flagged
- All issues have correct standardsTags (cvc-oei:A12, cvc-oei:A13, cvc-oei:A14 respectively)
- Issue modal opens without errors
