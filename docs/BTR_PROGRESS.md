# BTR Progress Tracker — SIMPLIFY LTI

**Last Updated:** 2026-02-28
**Process:** BTR (Build, Test, Review) — see [BTR_PROCESS.md](./BTR_PROCESS.md)

---

## Dashboard

| Metric | Count |
|--------|-------|
| Total Features | 41 |
| Passing | 41 |
| Pass Rate | 100% |

---

## Features by Status

### Passing (41)

| ID | Feature | Category |
|----|---------|----------|
| F001 | Canvas PAT Connection | core-connection |
| F002 | Fetch Course Content Types | core-connection |
| F003 | Scan Orchestration | core-scanning |
| F004 | Live Scan Progress Display | core-scanning |
| F005 | Per-Course Scan Cache | core-scanning |
| F006 | Standards Filter Toggle | core-scanning |
| F010 | Missing Alt Text Detection | accessibility-scanning |
| F011 | Heading Hierarchy Violation Detection | accessibility-scanning |
| F012 | Table Headers Detection | accessibility-scanning |
| F013 | Table Caption Detection | accessibility-scanning |
| F014 | Color Contrast Detection | accessibility-scanning |
| F015 | Unclear Link Text Detection | accessibility-scanning |
| F016 | Video Caption Detection (partial) | accessibility-scanning |
| F018 | Color as Sole Conveyor Detection (D6) | accessibility-scanning |
| F019 | Auto-Play Media Detection (D16) | accessibility-scanning |
| F020 | Learning Objectives Detection | rubric-scanning |
| F021 | Content Organization Detection | rubric-scanning |
| F022 | Instructor Contact Info Detection | rubric-scanning |
| F030 | Stage Fix | fix-workflow |
| F031 | Before/After HTML Preview | fix-workflow |
| F032 | Publish Fix to Canvas | fix-workflow |
| F033 | Undo Published Fix | fix-workflow |
| F034 | Batch Stage Auto-Fixable Issues | fix-workflow |
| F035 | Batch Publish Staged Fixes | fix-workflow |
| F036 | Publish Confirmation Modal | fix-workflow |
| F040 | Alt Text Fix — Manual Entry | fix-types |
| F041 | Alt Text Fix — AI Generated | fix-types |
| F042 | Heading Hierarchy Fix | fix-types |
| F043 | Table Headers Fix | fix-types |
| F044 | Table Caption Fix — Manual and AI | fix-types |
| F045 | Color Contrast Fix | fix-types |
| F046 | Link Text Fix — Manual and AI | fix-types |
| F047 | Learning Objectives AI Generation | fix-types |
| F048 | Dense Paragraph AI Rewrite | fix-types |
| F049 | Layout Table Semantic Conversion | fix-types |
| F050 | AI Broken Link Replacement | fix-types |
| F060 | Overall Compliance Score | analytics |
| F061 | Per-Rubric Compliance Breakdown | analytics |
| F062 | Severity Distribution Chart | analytics |
| F070 | Compliance Report View | audit-reports |
| F071 | PDF Export | audit-reports |
| F072 | Leadership Brief Generation | audit-reports |
| F080 | IMSCC File Upload and Parse | imscc-import |
| F090 | Course Template Builder | course-builders |
| F091 | AI Content Template Generation | course-builders |
| F100 | Batch Publish Progress Feedback | ui-polish |
| F101 | Scan Error Handling and Retry | ui-polish |
| F102 | Modal UI Consistency | ui-polish |
| F103 | Onboarding Tour | ui-polish |

### Tabled (revisit later)

| ID | Feature | Category | Reason |
|----|---------|----------|--------|
| F063 | Score Trend History | analytics | Tabled by user |
| F017 | Manual List Formatting Detection (D2) | accessibility-scanning | Tabled by user |
| F023 | Course Policies Detection (A12/A13/A14) | rubric-scanning | Tabled by user |

---

## Sprint History

### Sprint 1: Critical Bug Fixes — DONE
- F061 — Analytics pills show percentages instead of raw counts
- F071 — PDF export uses jsPDF for instant download

### Sprint 2: Incomplete Core Features — DONE
- F035 + F100 — Batch publish with per-item progress feedback
- F048 — Dense paragraph AI rewrite (auto-generates on modal open)
- F049 — Layout table semantic conversion (purpose-selection flow)
- F050 — AI broken link replacement (URL + text input fields)
- F072 — Leadership brief PDF export

### Sprint 3: Missing Scanner Coverage — DONE
- F017 — Manual list formatting detection (dashes/asterisks instead of ul/ol)
- F018 — Color as sole conveyor detection (with auto-fix: wraps in bold)
- F019 — Auto-play media detection (audio/video/iframe autoplay)
- F023 — Course policies detection (A12/A13/A14 keyword scanning)

### Sprint 4: Polish & UX — DONE
- F101 — Scan error handling with visible error state and retry button
- F102 — Modal UI consistency normalized across all issue types

---

## Changelog

| Date | Action | Details |
|------|--------|---------|
| 2026-02-28 | F063, F017 tabled | Score trend history and manual list detection tabled by user for later |
| 2026-02-28 | Sprint 4 complete | F101, F102 merged — error handling and modal consistency |
| 2026-02-28 | Sprint 3 complete | F017, F018, F019, F023 merged — scanner coverage expanded with auto-fix for color-only issues |
| 2026-02-28 | Sprint 2 complete | F035+F100, F048, F049, F050, F072 merged — all core features now functional |
| 2026-02-28 | F061 merged to main | Analytics pills now show compliance percentages instead of raw counts |
| 2026-02-28 | F071 merged to main | PDF export now uses jsPDF for instant download |
| 2026-02-28 | BTR Process Created | Initial feature_list.json with 46 features, 30 passing, 16 failing |
