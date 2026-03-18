# SIMPLIFY — Product Requirements Document (PRD)

**Version:** 1.0
**Date:** 2026-02-21
**Status:** Draft — for developer reference
**Author:** Generated from codebase analysis + founder interview

---

## 1. Problem Statement

California Community College (CCC) faculty are required to design online courses that meet the CVC-OEI Course Design Rubric and WCAG 2.0 AA accessibility standards before those courses can go live to students or qualify for the CVC Exchange (statewide cross-enrollment). The current review process is manual — faculty must self-check dozens of rubric criteria across potentially hundreds of pages, assignments, announcements, and discussions inside Canvas — and the feedback loop is slow (often a formal peer reviewer is needed).

Faculty have no easy tool to:
1. Automatically scan their course for rubric violations and accessibility gaps before students arrive
2. See plain-language explanations of what's wrong and why it matters
3. Fix common issues without editing HTML manually
4. Understand their course's overall compliance level at a glance

The result: courses go live with accessibility barriers and rubric gaps that harm student success, particularly for students who use assistive technology or are from underserved populations — the exact students the CVC-OEI initiative is designed to support.

---

## 2. Target Users

### Primary User: Individual CCC Faculty Member
- **Who:** A college instructor teaching an online or hybrid course on Canvas at a California Community College
- **Technical skill level:** Non-technical; comfortable with Canvas, not a developer
- **Context:** Preparing a course before the semester starts, or improving an existing course between terms
- **Motivation:** Wants to pass peer review, avoid accessibility complaints, and give students a better experience
- **Pain points:** Doesn't know what's wrong, doesn't know how to fix it, doesn't have time to learn WCAG or rubric criteria in depth

### Secondary User: Instructional Designer / Course Reviewer
- **Who:** An ID or online education specialist at a CCC reviewing faculty courses before they go live
- **Context:** Uses the tool to produce a compliance snapshot and guide the faculty member through fixes
- **Motivation:** Reduce the manual labor of rubric review; have an objective starting point for conversations with faculty

### Future/Institutional User: Department Chair / Dean / Accessibility Coordinator
- **Who:** An administrator who needs a birds-eye view of course quality across multiple sections or instructors
- **Context:** Reviews compliance reports and analytics for the department or institution
- **Motivation:** Demonstrate ADA compliance, track improvement over time, identify systemic issues

---

## 3. Core Features (Must-Haves)

These are the features that define SIMPLIFY as a product. Without all of them, the product does not achieve its goal.

### 3.1 Canvas Connection
Connect to a Canvas LMS instance using a Personal Access Token (current workaround) or, in the production LTI deployment, via LTI 1.3 launch authentication. Must support any `.instructure.com` domain.

### 3.2 Full Course Scan
Automatically scan all instructor-generated content in a Canvas course — pages, assignments, announcements, discussions, quizzes, and module structure — and return a prioritized list of issues.

### 3.3 Rubric-Mapped Issues
Every issue must be mapped to a specific rubric standard:
- **CVC-OEI** (primary): Sections A–D (Content, Interaction, Assessment, Accessibility)
- **Quality Matters 7th Edition** (primary): Standards 1–8
- **Peralta Online Equity Rubric v3.0** (secondary): Standards E1–E8

Each issue must display:
- The rubric standard it violates (e.g., "CVC-OEI D7")
- A plain-English explanation of why it matters to students
- The severity (High / Medium / Low)
- The exact location in the course (page name, assignment name, etc.)

### 3.4 Automated Fix Workflow
For issues that can be fixed without manual content creation (heading hierarchy, color contrast, link text, table headers, table captions), SIMPLIFY must:
1. Show a clear **Before** (current, failing state) and **After** (fixed state) preview
2. Apply the fix on confirmation
3. Publish the corrected HTML back to Canvas

### 3.5 AI-Assisted Fix Generation
For issues requiring content creation (alt text, table captions, learning objectives, dense paragraph rewrites), SIMPLIFY must use AI (GPT-4o) to generate suggested content. The instructor must be able to review, edit, and approve AI suggestions before anything is published. AI must never publish without instructor confirmation.

### 3.6 Stage → Review → Publish Workflow
Fixes go through a two-phase workflow:
- **Stage:** Preview the fix without touching Canvas
- **Publish:** Write the fix to Canvas after instructor review

This is intentional and must be preserved. Instructors should never lose content accidentally.

### 3.7 Standards-Based Filtering
Faculty must be able to filter their issue list by rubric standard (CVC-OEI / QM / Peralta) so they can focus on the review type they are preparing for.

### 3.8 Compliance Score / Analytics
Show the instructor an overall compliance score and per-rubric compliance percentage based on actual scan results. Must accurately reflect resolved vs. pending issues.

### 3.9 Audit Report Export
Generate a shareable compliance report (PDF or printable) that summarizes the course's rubric alignment status. This is used by faculty for self-review documentation and by IDs for peer review records.

---

## 4. User Stories

### Course Scanning
- As a faculty member, I want to connect SIMPLIFY to my Canvas course so that I can scan it without manual copying or exporting.
- As a faculty member, I want to see a list of every accessibility and rubric issue in my course so that I know what needs to be fixed before students arrive.
- As a faculty member, I want each issue to tell me exactly which rubric standard it violates and why it matters, so I can prioritize without reading the full rubric myself.
- As an instructional designer, I want to scan multiple courses at once so that I can identify the most at-risk courses in my department.

### Fixing Issues
- As a faculty member, I want to see a side-by-side Before/After preview for every fixable issue so that I know exactly what will change before I approve it.
- As a faculty member, I want AI to suggest alt text for my images so that I don't have to write it from scratch, and I can edit the suggestion before it goes live.
- As a faculty member, I want to tell SIMPLIFY what my table is being used for (navigation, data, image layout, etc.) so that it can suggest the right semantic HTML fix — not just drop raw code on me.
- As a faculty member, I want SIMPLIFY to suggest a rewrite for paragraphs that are too long, so I have a starting point for making my content more readable.
- As a faculty member, I want to undo a published fix so that I can recover my original content if something went wrong.
- As a faculty member, I want to fix all auto-fixable issues at once with a single "Batch Fix" button so that I can address the easy stuff quickly.

### Reporting & Progress
- As a faculty member, I want to see my overall compliance score by rubric section so that I know at a glance where my biggest gaps are.
- As a faculty member, I want to export a PDF compliance report to share with my department chair or attach to my peer review submission.
- As an instructional designer, I want to see analytics that show whether a faculty member's course quality has improved over time.
- As an administrator, I want statewide or district-wide compliance data so that I can report on accessibility compliance to leadership.

### Import & Offline Courses
- As an instructional designer, I want to upload an IMSCC course package and scan it before it's imported into Canvas, so that I can fix issues in the source file.

---

## 5. Success Metrics

### Adoption
- Time to first scan: A first-time user should be able to connect Canvas and complete a full scan in under 5 minutes
- Scan completion rate: >90% of initiated scans complete without error

### Impact
- Issues resolved per session: Average faculty user resolves at least 5 issues per session
- Fix acceptance rate: >70% of AI-suggested fixes (alt text, captions, objectives) are accepted without modification
- Re-scan improvement: A course that has been through one fix cycle should show a measurable reduction in high-severity issues on re-scan

### Quality
- False positive rate: <15% of flagged issues should be dismissed as "not an issue" by instructors
- False negative rate: Issues that match a CVC-OEI Incomplete designation in a formal peer review should be caught by the scanner in >80% of cases

### Rubric Alignment
- The scanner must correctly map every flagged issue to its CVC-OEI section/element (A1–D16), QM standard (1.1–8.7), or Peralta standard (E1–E8)
- Compliance scores in Analytics must match what a manual rubric count would produce

---

## 6. Out of Scope (v1)

These are explicitly NOT being built right now:

- **Full LTI 1.3 authentication** — Token-based login is the current approach; proper LTI credentialing is a future milestone
- **Third-party content accessibility** (publisher content, LTI apps, external PDFs not linked from Canvas) — SIMPLIFY can only scan instructor-generated HTML content inside Canvas
- **Slide deck accessibility** (PowerPoint, Google Slides) — CVC-OEI D9 applies but SIMPLIFY cannot parse uploaded slide files
- **Spreadsheet accessibility** — CVC-OEI D10 applies but out of scope for v1
- **Audio transcript generation** — CVC-OEI D13 applies; flagging audio files is in scope, auto-generating transcripts is not
- **Live caption planning** — CVC-OEI D15 applies to synchronous events; this tool only audits async course content
- **Grading/grade book data** — SIMPLIFY reads course content only; never touches student grades or submissions
- **Student-facing features** — This is an instructor/reviewer tool only
- **Additional rubric frameworks** (POCR, IGETC, institutional rubrics) — Not in scope until CVC-OEI + QM coverage is solid
- **Canvas mobile app** — Web-only tool
- **Direct Canvas SSO/OAuth without LTI** — Canvas OAuth2 flow is a potential future path; not in v1

---

## 7. Rubric Reference: Standards Covered

### CVC-OEI Course Design Rubric (April 2020) — Full Standard List

**Section A: Content Presentation**
| Standard | Description |
|---|---|
| A1 | Unit objectives are included in individual learning units |
| A2 | Unit objectives include demonstrable/measurable learning outcomes |
| A3 | Content is clearly aligned with unit objectives |
| A4 | Course navigation and content flow are easily determined |
| A5 | Content is meaningfully segmented into distinct units/modules |
| A6 | Page content is chunked using heading styles |
| A7 | CMS tools are used effectively to reduce learning labor |
| A8 | A variety of media (text, audio, video, images) is used |
| A9 | Instructions for working with content are included |
| A10 | Individualized learning support opportunities are provided |
| A11 | Learners can give anonymous feedback on course design |
| A12 | Course policies (academic honesty, drop, late work) are easy to find |
| A13 | Links to student services (disability, tutoring, library, counseling) are included |
| A14 | Technology support information is included |

**Section B: Interaction**
| Standard | Description |
|---|---|
| B1 | Instructor initiates contact prior to or at the start of the course |
| B2 | Course design includes regular instructor-initiated student contact |
| B3 | Contact info and expected response times are easy to find |
| B4 | Opportunities for unstructured student-to-student interaction are available |
| B5 | Regular effective contact among students is designed into the course |
| B6 | Guidelines explaining required levels of student participation are provided |

**Section C: Assessment**
| Standard | Description |
|---|---|
| C1 | Assessment activities demonstrate authentic learning outcomes |
| C2 | Students are evaluated on performance aligned to course objectives |
| C3 | Both formative and summative assessments are used |
| C4 | Multiple assessments are administered throughout the course |
| C5 | Rubrics or scoring guides are included for most assessments |
| C6 | Clear instructions explain how to complete each assessment |
| C7 | A clear description of how timely feedback will be provided is included |
| C8 | Opportunities for student self-assessment are present |

**Section D: Accessibility**
| Standard | Description |
|---|---|
| D1 | Heading styles (H1–H6) used correctly; no bold/color used as headings |
| D2 | Lists created with list tools, not manual formatting (dashes, asterisks) |
| D3 | Links use meaningful text, not raw URLs |
| D4 | Tables have header cells and captions for complex tables |
| D5 | Sufficient color contrast (WCAG 2.0 AA: 4.5:1 normal, 3:1 large text) |
| D6 | Color is not the only means of conveying information |
| D7 | All images have appropriate alt text (or marked decorative) |
| D8 | Reading order is correctly set (primarily for PDFs/slides) |
| D9 | Slides use accessible layouts with unique titles |
| D10 | Spreadsheets have row/column labels and text descriptions |
| D11 | Content passes built-in accessibility checks |
| D12 | All video has accurate captions |
| D13 | Audio files have complete transcripts |
| D14 | Flashing/blinking content does not exceed 3 flashes/second |
| D15 | Live/synchronous video includes caption capability |
| D16 | Audio/video does not auto-play |

### Quality Matters Higher Education Rubric, 7th Edition

| Standard | Area | Points |
|---|---|---|
| 1.1–1.9 | Course Overview and Introduction | 1–3 each |
| 2.1–2.5 | Learning Objectives (Competencies) | 3 each |
| 3.1–3.6 | Assessment and Measurement | 2–3 each |
| 4.1–4.5 | Instructional Materials | 2–3 each |
| 5.1–5.4 | Learning Activities and Learner Interaction | 2–3 each |
| 6.1–6.4 | Course Technology | 1–3 each |
| 7.1–7.4 | Learner Support | 1–3 each |
| 8.1–8.7 | Accessibility and Usability | 1–3 each |

### Peralta Online Equity Rubric v3.0

| Standard | Description |
|---|---|
| E1 | Course mitigates digital divide/technology access issues |
| E2 | Course highlights student wellness and support services |
| E3 | Course content aligns with UDL principles |
| E4 | Communications demonstrate diversity is valued |
| E5 | Images reflect broad diversity; exceptions are explained |
| E6 | Human biases are identified in course content |
| E7 | Connections between content, students' lives, and futures are clear |
| E8 | Communications foster care and connection among students |
