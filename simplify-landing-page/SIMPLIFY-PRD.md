# SIMPLIFY — Product Requirements Document

**Canvas LTI Course Cleanup & Accessibility Plug-in**

| Field | Detail |
|---|---|
| **Company** | Simplify (EdTech) |
| **Product** | SIMPLIFY — Canvas LTI Plug-in |
| **Version** | 1.0 PRD |
| **Date** | 2026-02-28 |
| **Author** | Product Team |
| **Status** | Draft |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Target Users & Personas](#4-target-users--personas)
5. [Framework Alignment](#5-framework-alignment)
6. [Competitive Landscape](#6-competitive-landscape)
7. [Product Scope & Feature Requirements](#7-product-scope--feature-requirements)
8. [Technical Architecture](#8-technical-architecture)
9. [Data Model & Scan Engine](#9-data-model--scan-engine)
10. [UX & Interaction Design](#10-ux--interaction-design)
11. [Phased Delivery Roadmap](#11-phased-delivery-roadmap)
12. [Risk Register](#12-risk-register)
13. [Appendix — Rubric Cross-Reference Matrix](#appendix--rubric-cross-reference-matrix)

---

## 1. Executive Summary

SIMPLIFY is a proposed Canvas LTI 1.3 plug-in that **scans an entire course for accessibility and usability issues, then offers clear guidance and — where possible — one-click automated fixes**. It replaces the current patchwork of institutional tools (UDOIT, Ally, Pope Tech, built-in Canvas checker) with a single, unified experience that speaks the language faculty already understand: the course-quality rubrics their institutions use.

The tool is grounded in three evidence-based frameworks:

- **CVC-OEI Course Design Rubric** (Sections A–D, 44 elements)
- **Quality Matters Higher Education Rubric** (8 General Standards, 44 Specific Review Standards)
- **Peralta Online Equity Rubric 3.0** (8 Elements, E1–E8)

Research consistently links online course design quality — clarity, navigation, accessibility — to improved student outcomes, reduced DFW rates, and more equitable learning experiences. SIMPLIFY operationalizes that research into an actionable tool.

---

## 2. Problem Statement

### The Faculty Experience Today

1. **Tool Fragmentation** — Institutions deploy multiple overlapping tools (UDOIT for HTML content, Ally for documents, Pope Tech for in-editor checks, the native Canvas accessibility checker). Faculty must learn each tool's UI, interpret each tool's reports, and mentally merge the results.

2. **Rubric / Tool Disconnect** — Faculty go through POCR, QM, or @ONE review processes using rubric language (e.g., "Section D, Element 12: Tables include header rows"). The accessibility tools they use speak a different language (e.g., "WCAG 2.1 SC 1.3.1 — Info and Relationships"). Faculty cannot easily map tool findings back to the rubric elements that matter for their reviews.

3. **Fix Friction** — Most tools identify problems but leave the fixing to the instructor. For common issues (missing alt text, heading hierarchy, color contrast, broken links) the fix is mechanical and could be automated or semi-automated, but today it requires manual editing page by page.

4. **Equity Blind Spots** — Existing tools focus narrowly on Section 508 / WCAG compliance. They do not address the broader course-design and equity dimensions captured by the CVC-OEI (Sections A–C) and Peralta (E1–E8) rubrics — things like UDL alignment, representation in imagery, and whether student-support information is surfaced clearly.

### The Institutional Experience Today

- Accessibility coordinators lack a single dashboard to see course-level and program-level compliance trends.
- Deans and VPIs cannot answer "What percentage of our courses meet the CVC-OEI rubric?" without manual audits.

---

## 3. Goals & Success Metrics

### Product Goals

| # | Goal | Measurable Target (Year 1) |
|---|---|---|
| G1 | Reduce time faculty spend on accessibility remediation | 50% reduction vs. current multi-tool workflow (measured by user survey) |
| G2 | Increase the percentage of course content passing accessibility checks | 30 percentage-point improvement within 60 days of plug-in activation |
| G3 | Unify rubric-aligned reporting into a single tool | Faculty can generate a CVC-OEI or QM-aligned report in < 2 clicks |
| G4 | Provide institutional visibility | Admins can view aggregate compliance data across all courses in a department/division |
| G5 | Support one-click fixes for the most common issues | Auto-fix coverage for >= 40% of flagged issues at launch |

### Key Performance Indicators (KPIs)

| KPI | Measurement Method |
|---|---|
| Scan adoption rate | % of active courses with at least one scan per term |
| Fix completion rate | % of flagged issues resolved within 30 days |
| Auto-fix acceptance rate | % of one-click fixes accepted (not reverted) by faculty |
| Time-to-remediate | Median minutes from scan → all issues resolved |
| NPS / satisfaction | In-app survey post-scan |
| Institutional coverage | % of departments with > 80% course compliance |

---

## 4. Target Users & Personas

### Primary: Faculty / Instructors

> **"I care about my students, but I don't have time to become an accessibility expert."**

- Teaches 4–5 sections per term, often with carryover course shells
- Has gone through (or is preparing for) CVC-OEI POCR or QM review
- Wants clear, actionable guidance — not WCAG spec citations
- Needs fixes they can apply quickly between semesters or during prep weeks

### Secondary: Instructional Designers / Accessibility Coordinators

> **"I support 50+ faculty and need to know where the biggest gaps are."**

- Runs training workshops on accessible course design
- Needs aggregate reporting to prioritize support efforts
- Wants to assign and track remediation tasks

### Tertiary: Administrators (Deans, VPIs, Distance Ed Directors)

> **"I need to report on accessibility compliance to our accreditor and the state."**

- Needs program-level and institution-level dashboards
- Wants trend data across terms
- Cares about CVC-OEI alignment for consortium participation

---

## 5. Framework Alignment

SIMPLIFY maps every scan rule to one or more elements from the three supported rubrics. This section details the rubrics and how they inform the product.

### 5.1 CVC-OEI Course Design Rubric

The CVC-OEI rubric contains 44 elements across four sections. SIMPLIFY's scan engine targets elements that can be evaluated programmatically.

| Section | Elements | Focus | SIMPLIFY Coverage |
|---|---|---|---|
| **A: Content Presentation** | 14 | Navigation, structure, objectives, support info | High — structural checks, link validation, module organization |
| **B: Interaction** | 6 | Instructor-student and student-student communication | Medium — presence of discussion boards, contact info, communication norms |
| **C: Assessment** | 8 | Alignment, instructions, feedback | Low-Medium — checks for rubric presence, instruction clarity indicators |
| **D: Accessibility** | 16 | Section 508 compliance, assistive technology compat | High — WCAG 2.1 AA automated checks on all HTML content and uploaded files |

*Source: [CVC-OEI Course Design Rubric](https://cvc.edu/wp-content/uploads/2018/10/CVC-OEI-Course-Design-Rubric-rev.10.2018.pdf), [ONE Course Design Academy](https://onlinenetworkofeducators.org/course-design-academy/online-course-rubric/)*

### 5.2 Quality Matters Higher Education Rubric (7th Edition)

QM uses 8 General Standards with 44 Specific Review Standards. Many are design-judgment calls that require human review, but several have automatable indicators.

| Standard | Name | Automatable Indicators |
|---|---|---|
| **1** | Course Overview & Introduction | Welcome page exists, syllabus linked, tech requirements listed, instructor bio present |
| **2** | Learning Objectives | Objectives present in modules, measurable verb detection (Bloom's taxonomy) |
| **3** | Assessment & Measurement | Rubrics attached to assignments, grading policy page exists |
| **4** | Instructional Materials | Broken link detection, file format diversity, OER/copyright notices |
| **5** | Learning Activities & Learner Interaction | Discussion boards present, group activities detected, participation expectations |
| **6** | Course Technology | External tool accessibility, plugin functionality checks |
| **7** | Learner Support | Links to tutoring, disability services, library, tech support |
| **8** | Accessibility & Usability | Full WCAG scan, navigation consistency, font readability, color contrast |

*Source: [Quality Matters Rubric Standards](https://www.qualitymatters.org/qa-resources/rubric-standards/higher-ed-rubric), [247Teach QM Guide](https://247teach.org/blog-for-instructional-design/understanding-the-quality-matters-rubric-a-comprehensive-guide-for-higher-education-and-corporate-learning)*

### 5.3 Peralta Online Equity Rubric 3.0

The Peralta rubric adds an equity lens with 8 elements (E1–E8) designed to complement the CVC-OEI rubric.

| Element | Name | SIMPLIFY Approach |
|---|---|---|
| **E1** | Technology Access | Flag when required tools lack free alternatives; check for tech-requirement documentation |
| **E2** | Student Resources & Support | Scan for links to counseling, food pantry, financial aid, disability services |
| **E3** | Universal Design for Learning (UDL) | Detect content format variety (text + video + audio); flag single-modality modules |
| **E4** | Diversity & Inclusion | Checklist prompt — flag absence of diversity statement or inclusive language indicators |
| **E5** | Images & Representation | Image analysis for representation diversity (future ML feature); manual checklist for v1 |
| **E6** | Human Bias | Checklist prompt — does the course include bias-awareness activities? |
| **E7** | Content Meaning | Checklist prompt — do assignments invite students to connect content to their identities? |
| **E8** | Connection & Belonging | Detect icebreaker activities, peer interaction structures, community-building assignments |

*Source: [Peralta Online Equity Rubric](https://www.peralta.edu/distance-education/online-equity-rubric), [Peralta Equity Rubric 3.0 PDF](https://f.hubspotusercontent00.net/hubfs/6398505/Peralta-Online-Equity-Rubric-3.0-Oct-2020.pdf)*

> **Design Principle:** Elements that cannot be fully automated (E4–E7 especially) are surfaced as guided self-assessment checklists with examples and resources, rather than false-positive automated flags.

---

## 6. Competitive Landscape

| Tool | Strengths | Gaps SIMPLIFY Fills |
|---|---|---|
| **UDOIT** | Scans native Canvas HTML content; open source | No document scanning; no rubric alignment; limited auto-fix; no equity checks |
| **Ally (Blackboard)** | Scans uploaded documents; provides alt formats to students | Proprietary/expensive; no CVC-OEI/QM mapping; no course-structure analysis; no equity layer |
| **Pope Tech** | In-editor real-time checking; institutional dashboards | Reactive (editor-level, not course-level); no rubric mapping; no UDL/equity checks |
| **Canvas Built-in Checker** | Zero-config; built into Rich Content Editor | Very limited rule set; no course-wide scan; no reporting |
| **Manual POCR/QM Review** | Gold standard for holistic review | Extremely labor-intensive; not scalable; no automation |

**SIMPLIFY's differentiator:** A single tool that combines course-wide scanning (content + structure + documents), rubric-aligned reporting (CVC-OEI, QM, Peralta), one-click fixes, and institutional dashboards — purpose-built for the California Community College ecosystem and transferable to any Canvas institution.

---

## 7. Product Scope & Feature Requirements

### 7.1 Course Scanner Engine

**Priority: P0 (Must-Have for MVP)**

| ID | Requirement | Details |
|---|---|---|
| SCAN-01 | Full-course scan | Scan all Pages, Assignments, Discussions, Quizzes, Syllabus, Module descriptions, and Announcements in a single pass |
| SCAN-02 | Document scanning | Scan uploaded files (PDF, DOCX, PPTX) for accessibility (tagged PDF, heading structure, alt text, reading order) |
| SCAN-03 | WCAG 2.1 AA rule set | Implement automated checks for: alt text, heading hierarchy, color contrast, table headers, link text, language attribute, list structure, form labels |
| SCAN-04 | Broken link detection | Crawl all links in course content and flag 404s, redirects to login walls, and expired URLs |
| SCAN-05 | Course structure analysis | Check for: consistent module naming, presence of module-level objectives, welcome page, syllabus, instructor contact info |
| SCAN-06 | Incremental re-scan | After fixes, re-scan only changed content (not the entire course) for rapid feedback |
| SCAN-07 | Scan scheduling | Allow scheduled scans (e.g., weekly) with emailed summary reports |

### 7.2 Rubric-Aligned Reporting

**Priority: P0 (Must-Have for MVP)**

| ID | Requirement | Details |
|---|---|---|
| RPT-01 | Rubric selector | User selects which rubric(s) to report against: CVC-OEI, QM, Peralta, or All |
| RPT-02 | Section/standard grouping | Issues grouped by rubric section (e.g., "Section D: Accessibility" or "QM Standard 8") rather than by WCAG success criterion |
| RPT-03 | Element-level scoring | For each rubric element, display: Aligned / Partially Aligned / Not Aligned / Unable to Assess (requires manual review) |
| RPT-04 | Issue detail drilldown | Each issue links to the specific page/content item, shows a preview, and explains the problem in plain language |
| RPT-05 | Exportable reports | Export as PDF (for POCR/QM review submission) and CSV (for institutional data analysis) |
| RPT-06 | Progress tracking | Dashboard shows improvement over time: issues found vs. fixed per scan |

### 7.3 Guided Fixes & Auto-Remediation

**Priority: P0 (Must-Have for MVP)**

| ID | Requirement | Details |
|---|---|---|
| FIX-01 | One-click alt text | For images missing alt text: suggest AI-generated alt text (editable before applying); apply via Canvas API |
| FIX-02 | Heading hierarchy repair | Detect skipped heading levels (h1 → h3); offer to restructure with preview |
| FIX-03 | Color contrast fixer | Identify low-contrast text; suggest compliant color alternatives; apply with one click |
| FIX-04 | Table header insertion | Detect data tables without `<th>` headers; offer to mark first row/column as headers |
| FIX-05 | Link text improvement | Flag generic link text ("click here", "link"); suggest descriptive alternatives |
| FIX-06 | Bulk operations | "Fix all" option for categories of issues (e.g., "Add decorative alt text to all decorative images") |
| FIX-07 | Undo / revert | All auto-fixes are reversible; maintain a change log per course with rollback capability |

### 7.4 Equity & UDL Checklists

**Priority: P1 (Post-MVP, Phase 2)**

| ID | Requirement | Details |
|---|---|---|
| EQ-01 | Peralta checklist integration | For each Peralta element (E1–E8), provide a guided self-assessment with examples and resource links |
| EQ-02 | UDL content variety check | Flag modules that rely on a single content format (e.g., all text, no video/audio alternatives) |
| EQ-03 | Support resource detection | Scan for presence of links to: disability services, counseling, financial aid, food pantry, tutoring |
| EQ-04 | Inclusive language prompts | Optional: flag potentially exclusionary language patterns (configurable sensitivity) |
| EQ-05 | Representation analysis | Future: ML-based image analysis to assess diversity in course imagery |

### 7.5 Institutional Admin Dashboard

**Priority: P1 (Post-MVP, Phase 2)**

| ID | Requirement | Details |
|---|---|---|
| ADM-01 | Multi-course view | Aggregate scan results across all courses in a department, division, or institution |
| ADM-02 | Trend reporting | Show compliance trends across terms (Fall → Spring → Summer) |
| ADM-03 | Faculty support queue | Flag courses with the most critical issues; assign to instructional designers |
| ADM-04 | Benchmark targets | Set institutional compliance targets and track progress toward them |
| ADM-05 | Role-based access | Admins see aggregate data only; individual course details visible only to course instructor + assigned ID |

### 7.6 Notifications & Workflow

**Priority: P2 (Phase 3)**

| ID | Requirement | Details |
|---|---|---|
| NTF-01 | Scan completion email | Email summary when scheduled scan completes |
| NTF-02 | Remediation reminders | Configurable reminders for unresolved issues (e.g., 7-day, 14-day nudges) |
| NTF-03 | Pre-term scan prompt | Automated prompt to scan courses 2 weeks before term start |
| NTF-04 | POCR/QM review export | One-click export formatted for POCR or QM submission workflows |

---

## 8. Technical Architecture

### 8.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Canvas LMS                             │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Pages   │  │ Modules  │  │ Assigns  │  │ Quizzes   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │
│       │              │              │               │       │
│       └──────────────┴──────────────┴───────────────┘       │
│                          │                                  │
│                    Canvas REST API                          │
│                    + LTI 1.3 Launch                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    SIMPLIFY Backend                           │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ LTI 1.3     │  │ Canvas API   │  │ Scan Engine        │  │
│  │ Auth Layer  │  │ Client       │  │                    │  │
│  │ (OIDC/JWT)  │  │ (REST calls) │  │ ┌────────────────┐ │  │
│  └─────────────┘  └──────────────┘  │ │ HTML Analyzer  │ │  │
│                                      │ │ (axe-core)     │ │  │
│  ┌─────────────┐  ┌──────────────┐  │ ├────────────────┤ │  │
│  │ Rubric Rule │  │ Fix Engine   │  │ │ Doc Analyzer   │ │  │
│  │ Mapper      │  │ (auto-patch) │  │ │ (PDF/DOCX/PPT) │ │  │
│  └─────────────┘  └──────────────┘  │ ├────────────────┤ │  │
│                                      │ │ Structure      │ │  │
│  ┌─────────────┐  ┌──────────────┐  │ │ Analyzer       │ │  │
│  │ Report      │  │ Notification │  │ │ (course map)   │ │  │
│  │ Generator   │  │ Service      │  │ ├────────────────┤ │  │
│  └─────────────┘  └──────────────┘  │ │ Link Checker   │ │  │
│                                      │ └────────────────┘ │  │
│                                      └────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐   │
│  │                    Data Store                         │   │
│  │  PostgreSQL (scan results, rules, user prefs, logs)   │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    SIMPLIFY Frontend                          │
│                  (React SPA, embedded via LTI)               │
│                                                              │
│  ┌────────────┐ ┌──────────────┐ ┌─────────────────────┐    │
│  │ Scan       │ │ Results &    │ │ Fix Interface       │    │
│  │ Dashboard  │ │ Rubric View  │ │ (preview + apply)   │    │
│  └────────────┘ └──────────────┘ └─────────────────────┘    │
│                                                              │
│  ┌────────────┐ ┌──────────────┐ ┌─────────────────────┐    │
│  │ Admin      │ │ Equity       │ │ Settings /          │    │
│  │ Dashboard  │ │ Checklists   │ │ Preferences         │    │
│  └────────────┘ └──────────────┘ └─────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **LTI Auth** | LTI 1.3 / LTI Advantage (OIDC + JWT) | Current Canvas standard; supports Names & Roles Provisioning, Assignment & Grade Services |
| **Backend** | Node.js (Express or Fastify) | Strong Canvas ecosystem support (ltijs library); async-friendly for batch scanning |
| **Scan Engine** | axe-core (HTML), custom analyzers (docs) | axe-core is the industry standard for automated WCAG testing; extensible rule API |
| **Document Analysis** | pdf-lib, mammoth.js (DOCX), python-pptx (via microservice) | Extract and analyze content structure from uploaded documents |
| **Database** | PostgreSQL | Relational model suits rubric/rule/result relationships; JSONB for flexible scan payloads |
| **Job Queue** | BullMQ (Redis-backed) | Handle scan jobs asynchronously; support scheduled scans and retry logic |
| **Frontend** | React + TypeScript | Embeds cleanly in Canvas LTI iframe; component library for consistent UI |
| **AI Services** | OpenAI / Claude API (optional) | Alt text generation, content summarization, Bloom's taxonomy verb detection |
| **Hosting** | AWS (ECS/Fargate) or similar | Scalable container deployment; per-institution isolation if needed |

### 8.3 Canvas API Integration Points

| API Endpoint | Purpose |
|---|---|
| `GET /api/v1/courses/:id/modules` | Enumerate all modules and module items |
| `GET /api/v1/courses/:id/pages` | Retrieve page content (HTML body) |
| `GET /api/v1/courses/:id/assignments` | Get assignment descriptions and attached files |
| `GET /api/v1/courses/:id/discussion_topics` | Get discussion content |
| `GET /api/v1/courses/:id/quizzes` | Get quiz descriptions |
| `GET /api/v1/courses/:id/files` | List and download uploaded files for document analysis |
| `PUT /api/v1/courses/:id/pages/:url` | Apply auto-fixes to page content |
| `PUT /api/v1/courses/:id/assignments/:id` | Apply auto-fixes to assignment descriptions |
| `GET /api/v1/courses/:id/front_page` | Check for welcome/home page |
| `GET /api/v1/courses/:id/tabs` | Verify navigation structure |

### 8.4 Security & Privacy

- All data transmitted over TLS 1.3
- OAuth 2.0 token scoping: request minimum permissions needed per scan type
- Scan results stored per-institution in logically isolated schemas
- PII minimization: store Canvas user IDs, not names/emails (resolve at display time)
- FERPA compliance: no student data accessed; tool operates on course content only
- SOC 2 Type II certification target for Year 2

---

## 9. Data Model & Scan Engine

### 9.1 Core Data Model

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  Institution │────<│    Course     │────<│   ScanRun     │
│              │     │              │     │               │
│ id           │     │ id           │     │ id            │
│ name         │     │ canvas_id    │     │ course_id     │
│ canvas_url   │     │ institution_ │     │ initiated_by  │
│ config       │     │ name         │     │ started_at    │
└─────────────┘     │ term         │     │ completed_at  │
                     └──────────────┘     │ status        │
                                          │ summary_json  │
                                          └───────┬───────┘
                                                  │
                                          ┌───────▼───────┐
                                          │   ScanIssue   │
                                          │               │
                                          │ id            │
                                          │ scan_run_id   │
                                          │ content_type  │  (page, assignment, file, etc.)
                                          │ content_id    │
                                          │ rule_id       │
                                          │ severity      │  (critical, serious, moderate, minor)
                                          │ status        │  (open, fixed, dismissed, auto-fixed)
                                          │ context_html  │  (snippet showing the issue)
                                          │ suggestion    │  (plain-language fix guidance)
                                          │ auto_fixable  │  (boolean)
                                          │ rubric_refs[] │  (array of rubric element mappings)
                                          └───────────────┘

┌─────────────────┐     ┌───────────────────┐
│    ScanRule      │────<│  RubricMapping    │
│                  │     │                   │
│ id               │     │ rule_id           │
│ name             │     │ rubric            │ (CVC-OEI, QM, Peralta)
│ description      │     │ section           │ (e.g., "D", "Standard 8", "E3")
│ category         │     │ element           │ (e.g., "D.12", "8.4", "E3")
│ wcag_criterion   │     │ element_text      │
│ severity_default │     └───────────────────┘
│ auto_fix_type    │
│ implementation   │
└─────────────────┘
```

### 9.2 Scan Rule Categories

| Category | Example Rules | Auto-Fixable? |
|---|---|---|
| **Images** | Missing alt text, decorative images not marked, complex images without long description | Yes (AI-generated alt text, `role="presentation"`) |
| **Headings** | Skipped levels, missing H1, empty headings | Yes (restructure hierarchy) |
| **Color** | Insufficient contrast (text), color-only information encoding | Yes (suggest replacement colors) |
| **Tables** | Missing headers, missing caption, complex tables without summary | Partial (add `<th>`, add scope) |
| **Links** | Generic text ("click here"), broken URLs, same text different destinations | Partial (broken link flagged, text suggestions) |
| **Media** | Video without captions, audio without transcript, auto-playing media | No (flag + guidance) |
| **Documents** | Untagged PDF, DOCX without heading structure, scanned image PDF | No (flag + remediation guide) |
| **Structure** | Missing module objectives, no welcome page, inconsistent naming, missing syllabus | Partial |
| **Navigation** | Unpublished items in modules, empty modules, excessive nesting | Partial |
| **UDL/Equity** | Single-format modules, missing support links, no diversity statement | Checklist-based |

---

## 10. UX & Interaction Design

### 10.1 User Flow — Faculty Scan & Fix

```
Launch SIMPLIFY         Select Rubric(s)        Run Scan
from Course Nav    →    ☑ CVC-OEI          →    [Scan Course]
                        ☑ QM                     ↓
                        ☐ Peralta                Scanning...
                                                 (progress bar)
                                                 ↓
                    ┌────────────────────────────────────┐
                    │        SCAN RESULTS DASHBOARD      │
                    │                                    │
                    │  Overall Score: 72/100              │
                    │  ████████████░░░░░  72%            │
                    │                                    │
                    │  ┌─────────┬──────┬──────┬──────┐ │
                    │  │ Critical│Serious│Moderate│Minor│ │
                    │  │   3     │  12   │  24   │  8  │ │
                    │  └─────────┴──────┴──────┴──────┘ │
                    │                                    │
                    │  BY RUBRIC SECTION:                 │
                    │  ▸ A: Content Presentation   ██░ 80%│
                    │  ▸ B: Interaction             █░  60%│
                    │  ▸ C: Assessment              ██░ 75%│
                    │  ▸ D: Accessibility           █░  65%│
                    │                                    │
                    │  [Fix All Auto-Fixable (18)]       │
                    │  [Export Report]  [Schedule Rescan] │
                    └────────────────────────────────────┘
                                    │
                            Click section D
                                    ▼
                    ┌────────────────────────────────────┐
                    │  SECTION D: ACCESSIBILITY          │
                    │                                    │
                    │  D.3 - Images have alt text         │
                    │  ✗ 5 images missing alt text        │
                    │    [View All] [Auto-Fix All]        │
                    │                                    │
                    │  D.7 - Headings structured properly │
                    │  ✗ 3 pages with skipped headings    │
                    │    [View All] [Auto-Fix All]        │
                    │                                    │
                    │  D.12 - Tables include headers      │
                    │  ✓ All tables pass                  │
                    │                                    │
                    │  D.14 - Color contrast sufficient   │
                    │  ✗ 4 contrast issues found          │
                    │    [View All] [Auto-Fix All]        │
                    └────────────────────────────────────┘
                                    │
                          Click "View All" on D.3
                                    ▼
                    ┌────────────────────────────────────┐
                    │  ISSUE DETAIL: Missing Alt Text     │
                    │                                    │
                    │  Page: "Week 3 - Photosynthesis"    │
                    │  ┌──────────────────────────┐      │
                    │  │  [image preview]          │      │
                    │  │  🔴 No alt text           │      │
                    │  └──────────────────────────┘      │
                    │                                    │
                    │  AI Suggestion:                     │
                    │  "Diagram showing the process of   │
                    │   photosynthesis with labeled       │
                    │   chloroplast, light reactions,     │
                    │   and Calvin cycle stages"          │
                    │                                    │
                    │  [✏️ Edit]  [✅ Apply]  [Skip]      │
                    │                                    │
                    │  ← Previous Issue  Next Issue →     │
                    └────────────────────────────────────┘
```

### 10.2 Design Principles

1. **Rubric-first, not WCAG-first** — Faculty see rubric element names and numbers, not technical spec citations. WCAG details available on expand for those who want them.

2. **Fix, don't just flag** — Every issue includes either a one-click fix or step-by-step guidance with screenshots. Never leave the user at a dead end.

3. **Progressive disclosure** — Dashboard → Section → Element → Issue → Fix. Users drill as deep as they need.

4. **Celebrate progress** — Show score improvements, confetti on 100%, "Your course improved 15 points since last scan."

5. **Respect autonomy** — Auto-fix suggestions are always previewed and editable. "Dismiss" is always an option with a reason field.

---

## 11. Phased Delivery Roadmap

### Phase 1 — MVP (Months 1–6)

**Theme: "Scan, Understand, Fix the Basics"**

| Milestone | Deliverables | Target |
|---|---|---|
| M1: Foundation (Mo 1–2) | LTI 1.3 auth, Canvas API integration, scan engine scaffolding, database schema | Internal alpha |
| M2: Core Scan (Mo 2–4) | WCAG HTML scanning (axe-core), course structure analysis, broken link detection | Closed beta (5 pilot institutions) |
| M3: Rubric Reporting (Mo 3–5) | CVC-OEI and QM rubric mapping, report UI, PDF export | Beta expansion (15 institutions) |
| M4: Auto-Fix (Mo 4–6) | Alt text (AI-assisted), heading repair, contrast fix, table headers, bulk operations | Public launch |

**MVP Feature Set:**
- Full-course HTML content scanning
- CVC-OEI Section A + D reporting, QM Standard 8 reporting
- One-click fixes for images, headings, contrast, tables, links
- Per-course scan dashboard with progress tracking
- PDF report export

### Phase 2 — Depth (Months 7–12)

**Theme: "Documents, Equity, and Institutional Scale"**

| Deliverable | Details |
|---|---|
| Document scanning | PDF, DOCX, PPTX accessibility analysis |
| Full rubric coverage | CVC-OEI Sections B + C, QM Standards 1–7, Peralta E1–E8 |
| Equity checklists | Guided self-assessment for Peralta elements |
| UDL content-variety check | Multi-modality detection per module |
| Admin dashboard v1 | Department-level aggregate views, trend reporting |
| Scan scheduling | Weekly auto-scans with email summaries |
| API & webhooks | Allow institutions to integrate scan data with their own systems |

### Phase 3 — Intelligence (Months 13–18)

**Theme: "Proactive, Predictive, Personalized"**

| Deliverable | Details |
|---|---|
| AI content suggestions | Suggest accessible alternatives for flagged content (e.g., rewrite complex text, suggest video captions) |
| Predictive scoring | "If you fix these 5 issues, your score will reach 90%" |
| Customizable rubrics | Institutions can create custom rubric mappings or weighted scoring |
| LMS-agnostic API | Abstract scan engine for potential Moodle/Blackboard/Brightspace support |
| Representation analysis | ML-based image diversity assessment for Peralta E5 |
| SCORM/LTI content analysis | Scan embedded third-party content packages |

---

## 12. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Canvas API rate limits** — Scanning large courses may hit API throttling | High | Medium | Implement exponential backoff, cache content locally, batch API calls efficiently |
| **Auto-fix introduces errors** — Automated changes break content formatting | Medium | High | Always preview before apply; maintain full change log with per-item rollback; integration tests against diverse real courses |
| **Faculty resistance** — Tool perceived as punitive compliance checker | Medium | High | Frame as "helper, not auditor"; lead with progress celebration; integrate into existing POCR/QM workflows as a support tool |
| **Rubric version changes** — CVC-OEI, QM, or Peralta update their rubrics | Medium | Low | Versioned rubric configuration; update mappings without code changes; rubric editor in admin settings |
| **AI alt text quality** — Generated descriptions are inaccurate or unhelpful | Medium | Medium | Always require human review before applying; allow easy editing; provide "flag as incorrect" feedback loop |
| **Document scanning accuracy** — Complex PDFs or scanned documents produce false positives | High | Medium | Clear confidence indicators; separate "definite" from "possible" issues; provide manual-review fallback guidance |
| **Institutional data isolation** — Multi-tenant data leakage | Low | Critical | Schema-per-tenant isolation; penetration testing; SOC 2 compliance program |
| **LTI spec evolution** — LTI 1.3 changes or Canvas deprecates endpoints | Low | Medium | Abstract LTI layer; monitor IMS Global and Instructure developer channels; maintain compatibility tests |

---

## Appendix — Rubric Cross-Reference Matrix

This matrix shows how SIMPLIFY scan rules map across all three rubrics, demonstrating the unified reporting value.

| SIMPLIFY Rule | CVC-OEI | QM Standard | Peralta | Auto-Fix? |
|---|---|---|---|---|
| Images: alt text present | D.3 | 8.3 | E3 (UDL) | Yes |
| Images: decorative marked | D.3 | 8.3 | — | Yes |
| Headings: proper hierarchy | D.4 | 8.1 | E3 (UDL) | Yes |
| Headings: no empty headings | D.4 | 8.1 | — | Yes |
| Color: sufficient contrast | D.14 | 8.4 | E3 (UDL) | Yes |
| Color: not sole indicator | D.14 | 8.4 | E1 (Tech) | No |
| Tables: headers present | D.12 | 8.3 | — | Yes |
| Tables: scope attributes | D.12 | 8.3 | — | Yes |
| Links: descriptive text | D.5 | 8.2 | — | Partial |
| Links: broken URLs | A.7 | 4.5 | — | No |
| Media: captions available | D.8 | 8.5 | E3 (UDL) | No |
| Media: transcript provided | D.8 | 8.5 | E3 (UDL) | No |
| Media: no autoplay | D.11 | 8.4 | E1 (Tech) | Yes |
| Docs: tagged PDF | D.1 | 8.6 | — | No |
| Docs: DOCX headings | D.4 | 8.1 | — | No |
| Structure: welcome page | A.1 | 1.1 | — | No |
| Structure: syllabus | A.2 | 1.2 | — | No |
| Structure: module objectives | A.3 | 2.2 | — | No |
| Structure: instructor contact | A.5 | 1.8 | — | No |
| Structure: tech requirements | A.6 | 1.6 | E1 (Tech) | No |
| Navigation: consistent naming | A.9 | 8.1 | — | No |
| Navigation: logical flow | A.10 | 8.1 | — | No |
| Support: disability services link | A.4 | 7.2 | E2 (Resources) | No |
| Support: tutoring link | A.4 | 7.3 | E2 (Resources) | No |
| Support: library link | A.4 | 7.3 | E2 (Resources) | No |
| UDL: multi-format content | — | 4.4 | E3 (UDL) | No |
| Equity: diversity statement | — | — | E4 (Diversity) | No |
| Equity: representation in images | — | — | E5 (Images) | No |
| Equity: bias activities | — | — | E6 (Bias) | No |
| Equity: identity connection | — | — | E7 (Meaning) | No |
| Equity: community building | — | — | E8 (Belonging) | No |
| Assessment: rubrics attached | C.5 | 3.3 | — | No |
| Assessment: grading policy | C.1 | 3.2 | — | No |
| Interaction: discussion boards | B.2 | 5.2 | E8 (Belonging) | No |
| Interaction: instructor presence | B.1 | 5.3 | — | No |

---

*Document version 1.0 — For internal review and stakeholder alignment.*
