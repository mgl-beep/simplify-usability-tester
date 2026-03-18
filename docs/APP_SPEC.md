# SIMPLIFY — Application Specification

**Version:** 1.0
**Date:** 2026-02-21
**Status:** Current State Documentation
**Companion Document:** `PRD.md` (product requirements)

---

## 1. Current State

SIMPLIFY is a functional web application that allows California Community College faculty and instructional designers to:

- Connect to a Canvas LMS course via Personal Access Token
- Scan course content (pages, assignments, announcements, discussions, quizzes) for accessibility and rubric violations
- View flagged issues mapped to CVC-OEI, Quality Matters, and Peralta Online Equity standards
- Stage, preview, and publish fixes back to Canvas
- Import offline courses via IMSCC packages (scanned from Supabase storage)
- View compliance analytics and export audit reports

The application runs entirely in the browser (React SPA). All Canvas API calls are proxied through a Supabase Edge Function to bypass CORS. There is no native Canvas LTI integration yet — authentication is token-based.

---

## 2. Technical Architecture

### Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript, Vite 6 |
| Styling | Tailwind CSS + shadcn/ui (Radix UI primitives) |
| Backend/Proxy | Supabase Edge Function (Deno + Hono) |
| Database | Supabase PostgreSQL (imported courses only) |
| AI | OpenAI GPT-4o Vision (alt text, captions, objectives, link text) |
| Auth | Canvas Personal Access Token (PAT) — stored in localStorage |
| Build Output | `build/` directory (Vite) |

### Folder Structure

```
src/
├── App.tsx                      # Root component; all global state lives here
├── main.tsx                     # React entry point
├── index.css                    # Global styles
├── assets/                      # Static images (Figma exports)
├── components/
│   ├── ui/                      # shadcn/ui primitive components
│   ├── Analytics.tsx            # Standards compliance analytics
│   ├── CanvasConnectionModal.tsx# Canvas PAT login modal
│   ├── CanvasDashboard.tsx      # Canvas homepage view
│   ├── ComplianceReports.tsx    # Audit report generation + PDF export
│   ├── CourseBuilders.tsx       # Course template builder
│   ├── CourseCard.tsx           # Course tile in course list
│   ├── CourseView.tsx           # Full course content structure view
│   ├── IssueDetailModal.tsx     # Per-issue detail, fix options, preview
│   ├── IssuesListModal.tsx      # Paginated list of all scan issues
│   ├── LiveScanView.tsx         # Real-time scan progress display
│   ├── ScanPanel.tsx            # Right-side drawer showing scan results
│   ├── SimplifyDashboard.tsx    # Main tool interface (Overview/Analytics/Builders)
│   └── [30+ additional components — see Section 5]
├── utils/
│   ├── api.ts                   # Supabase client for imported courses
│   ├── canvasAPI.ts             # Canvas LMS API wrapper (proxied)
│   ├── canvasFixer.ts           # Fix engine — applies all fix types to HTML
│   ├── fixStaging.ts            # Two-phase stage→publish workflow
│   ├── colorContrast.ts         # WCAG 2.1 contrast ratio calculation
│   ├── contentScanner.ts        # Content-level issue detection
│   ├── courseScanner.ts         # Scan orchestrator (calls all scanners)
│   ├── htmlSanitizer.ts         # HTML sanitization for safe storage/display
│   ├── imsccParser.ts           # IMSCC course package parser
│   ├── imsccFixer.ts            # Fixes for IMSCC-sourced issues
│   ├── supabaseFixer.ts         # Applies fixes to Supabase-stored courses
│   ├── aiFixerService.ts        # AI suggestion service (alt text, captions, etc.)
│   ├── aiObjectivesGenerator.ts # AI learning objectives generation
│   ├── courseTemplates.ts       # Predefined course templates
│   ├── scanners/
│   │   ├── accessibilityScanner.ts  # WCAG 2.1 — alt text, headings, tables, contrast
│   │   ├── usabilityScanner.ts      # CVC-OEI — captions, chunking, nav depth
│   │   ├── designScanner.ts         # Font/styling consistency checks
│   │   ├── cvcOeiRubricScanner.ts   # CVC-OEI Sections A–D rubric checks
│   │   └── linkDetector.ts          # Broken links, long URLs, unclear link text
│   └── standards/
│       ├── standardsMapping.ts      # Maps issue types → CVC-OEI/QM/Peralta tags
│       └── qualityMatters.ts        # Quality Matters 7th Ed. standard definitions
supabase/
└── functions/
    └── canvas-proxy/
        └── index.tsx            # Hono-based Edge Function (Canvas proxy + AI endpoints)
```

### Data Flow

```
Browser (React SPA)
    │
    │  Canvas API calls (pages, assignments, etc.)
    ▼
Supabase Edge Function (canvas-proxy)
    │
    │  Forwards requests with Authorization: Bearer <canvas_token>
    ▼
Canvas LMS API (*.instructure.com)
    │
    │  Returns HTML content
    ▼
Supabase Edge Function
    │
    ▼
Browser — HTML parsed with DOMParser, scanners run locally
    │
    ▼
ScanIssue[] array stored in React state + localStorage cache
    │
    ├── Fix staged (fixStaging.ts)
    │     - Before/After HTML generated locally
    │     - Issue status → 'staged'
    │
    ├── User reviews Before/After preview (IssueDetailModal / FixPreviewModal)
    │
    └── User confirms → canvasFixer.ts → Supabase Edge Function → Canvas API (PUT/POST)
```

### State Management

All state lives in `App.tsx` (no Redux, no Zustand). Key state:

| State Variable | Type | Purpose |
|---|---|---|
| `selectedCourse` | `{courseId, courseName, isImported}` | Active course |
| `scanResults` | `ScanIssue[]` | Current course issues |
| `allCourseScanResults` | `Record<number, ScanIssue[]>` | Per-course cached results |
| `isScanning` | `boolean` | Scan in progress flag |
| `enabledStandards` | `string[]` | Active rubric filters |
| `aiSuggestionsCache` | `Record<string, string>` | Cached AI suggestions |
| `currentView` | `string` | Active page ("simplify" \| "courses" \| ...) |

Scan results are persisted to localStorage keyed by courseId. The synthetic "All Courses" view uses `courseId=0` and is explicitly excluded from localStorage persistence.

### ScanIssue Interface

```typescript
export interface ScanIssue {
  id: string;
  type: string;                    // e.g., 'missing-alt-text', 'contrast', 'broken-link'
  category: string;                // 'accessibility' | 'usability' | 'design' | 'content'
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location: string;                // Human-readable (e.g., "Week 1 Overview")
  contentType: string;             // 'page' | 'assignment' | 'announcement' | 'discussion'
  contentId: string | number;
  courseId?: number;
  autoFixAvailable: boolean;
  standardsTags: string[];         // e.g., ['cvc-oei:D7', 'qm:8.1']
  status: 'pending' | 'staged' | 'published' | 'ignored' | 'resolved';
  elementHtml?: string;            // HTML snippet of the problematic element
  textColor?: string;              // Detected text color (hex) — contrast issues
  backgroundColor?: string;        // Effective background color (hex) — contrast issues
  suggestedFix?: string;           // AI-generated suggestion
  fixSteps?: string[];             // Step-by-step remediation instructions
  originalContent?: string;        // Stored on staging for undo
}
```

---

## 3. Feature Status Table

### 3.1 Core Scanning

| Feature | Status | Notes |
|---|---|---|
| Canvas connection via PAT | ✅ Done | Token stored in localStorage; passed to Supabase proxy |
| Fetch pages, assignments, announcements, discussions | ✅ Done | Via canvas-proxy Edge Function |
| Fetch quizzes | ✅ Done | Endpoint exists in Edge Function |
| Fetch modules structure | ✅ Done | Used for nav-depth check |
| Scan all course content types | ✅ Done | courseScanner.ts orchestrates all scanners |
| Filter issues by enabled standards | ✅ Done | enabledStandards array; defaults to all three |
| Per-course scan cache (localStorage) | ✅ Done | allCourseScanResults keyed by courseId |
| "All Courses" aggregate view | 🚧 Partial | Aggregation works; courseId=0 guard prevents bad localStorage writes |
| IMSCC file import + scan | 🚧 Partial | Parser + Supabase storage exist; fix publishing back to a Canvas import has gaps |
| Live scan progress display | ✅ Done | LiveScanView shows per-item progress |

### 3.2 Accessibility Scanning (CVC-OEI Section D / WCAG 2.0 AA)

| Check | Standard | Status | Notes |
|---|---|---|---|
| Missing alt text on images | D7 / WCAG 1.1.1 | ✅ Done | Detects `<img>` missing `alt` or with empty `alt` on non-decorative images |
| Heading hierarchy violations | D1 | ✅ Done | Detects skipped levels, missing H1, bold-as-heading |
| Tables without `<th>` headers | D4 | ✅ Done | Checks first row for `<th>` presence |
| Tables without `<caption>` | D4 | ✅ Done | Checks for `<caption>` element on data tables |
| Color contrast below 4.5:1 | D5 / WCAG 1.4.3 | ✅ Done | WCAG 2.1 ratio calculation; detects inline style + data-mce-style |
| Background color detection | D5 | ✅ Done | Walks ancestor chain; checks style, data-mce-style, bgcolor attr |
| Color as sole info conveyor | D6 | ❌ Not Started | No check implemented |
| Lists created with wrong markup | D2 | ❌ Not Started | Manual dashes/asterisks not detected |
| Link text unclear ("click here") | D3 | ✅ Done | linkDetector.ts checks for non-descriptive link text |
| Raw URL as link text | D3 | ✅ Done | linkDetector.ts flags URLs >50 chars as link text |
| Video without captions | D12 | 🚧 Partial | Checks YouTube cc_load_policy; not comprehensive |
| Audio without transcript | D13 | ❌ Not Started | Flagging only; no transcript generation (out of scope v1) |
| Auto-playing audio/video | D16 | ❌ Not Started | No `autoplay` attribute check |
| Flashing content | D14 | ❌ Not Started | Out of scope v1 |
| Slide accessibility | D9 | ❌ Not Started | Out of scope v1 |
| Spreadsheet accessibility | D10 | ❌ Not Started | Out of scope v1 |
| PDF reading order | D8 | ❌ Not Started | Out of scope v1 |

### 3.3 Rubric Scanning (CVC-OEI Sections A–C)

| Check | Standard | Status | Notes |
|---|---|---|---|
| Learning objectives present in modules | A1, A2 | 🚧 Partial | Detection exists; AI generation works; mapping to all module pages is incomplete |
| Content organized into distinct units | A5 | 🚧 Partial | Module structure checked; depth check exists |
| Page content chunked with headings | A6 | ✅ Done | accessibilityScanner heading check covers this |
| Instructor contact info present | B3 | 🚧 Partial | cvcOeiRubricScanner looks for contact patterns |
| Student interaction opportunities | B4, B5 | 🚧 Partial | Discussion detection exists |
| Course policies easy to find | A12 | ❌ Not Started | No syllabus/policy detection |
| Links to student support services | A13 | ❌ Not Started | No support links check |
| Technology support info | A14 | ❌ Not Started | No tech support info check |
| Assessment rubrics present | C5 | ❌ Not Started | No rubric attachment detection |
| Feedback timing policy | C7 | ❌ Not Started | No feedback policy detection |

### 3.4 Quality Matters (7th Edition)

| Area | Standards | Status | Notes |
|---|---|---|---|
| Learning Objectives | 2.1–2.5 | 🚧 Partial | Objective generation exists; coverage incomplete |
| Assessment alignment | 3.1–3.6 | ❌ Not Started | No alignment verification |
| Accessibility & Usability | 8.1–8.7 | 🚧 Partial | WCAG checks cover 8.3, 8.4 partially |
| Course Overview | 1.1–1.9 | ❌ Not Started | |
| Instructional Materials | 4.1–4.5 | ❌ Not Started | |
| Learning Activities | 5.1–5.4 | ❌ Not Started | |
| Course Technology | 6.1–6.4 | ❌ Not Started | |
| Learner Support | 7.1–7.4 | ❌ Not Started | |

### 3.5 Peralta Online Equity Rubric (v3.0)

| Standard | Description | Status |
|---|---|---|
| E1 | Mitigates digital divide / tech access | ❌ Not Started |
| E2 | Student wellness + support services highlighted | ❌ Not Started |
| E3 | UDL principles applied | 🚧 Partial (via usability scan) |
| E4 | Communications value diversity | ❌ Not Started |
| E5 | Images reflect broad diversity | ❌ Not Started |
| E6 | Human biases identified | ❌ Not Started |
| E7 | Connections to students' lives and futures | ❌ Not Started |
| E8 | Communications foster care and connection | ❌ Not Started |

### 3.6 Automated Fix Workflow

| Feature | Status | Notes |
|---|---|---|
| Stage fix (preview without touching Canvas) | ✅ Done | fixStaging.ts; issue status → 'staged' |
| Before/After HTML preview | ✅ Done | IssueDetailModal + FixPreviewModal |
| Publish fix to Canvas | ✅ Done | canvasFixer.ts → Supabase proxy → Canvas API |
| Undo published fix | ✅ Done | originalContent stored; revert dialog |
| Batch stage auto-fixable issues | ✅ Done | batchStageFixes() in fixStaging.ts |
| Batch publish all staged fixes | 🚧 Partial | Confirm dialog exists; progress feedback incomplete |
| Alt text fix (manual entry) | ✅ Done | |
| Alt text fix (AI-generated) | ✅ Done | GPT-4o Vision; user must confirm before publish |
| Heading hierarchy fix | ✅ Done | Level reassignment or conversion to `<p>` |
| Table headers fix | ✅ Done | `<td>` → `<th>` conversion in first row |
| Table caption fix (manual) | ✅ Done | |
| Table caption fix (AI-generated) | ✅ Done | |
| Color contrast fix | ✅ Done | Inline `color` style override |
| Link text fix (manual) | ✅ Done | |
| Link text fix (AI-generated) | ✅ Done | |
| Learning objectives AI generation | ✅ Done | GPT-4o; injects into module overview page |
| Dense paragraph rewrite (AI) | ❌ Not Started | PRD §3.5 requirement; not implemented |
| Layout table semantic conversion | 🚧 Partial | Basic detection; purpose-based conversion flow not built |
| Fix for imported (IMSCC) courses | 🚧 Partial | supabaseFixer.ts exists; not fully integrated |

### 3.7 Standards-Based Filtering

| Feature | Status | Notes |
|---|---|---|
| Filter by CVC-OEI | ✅ Done | enabledStandards toggle |
| Filter by Quality Matters | ✅ Done | enabledStandards toggle |
| Filter by Peralta | ✅ Done | enabledStandards toggle |
| Standards filter persists across views | ✅ Done | State in App.tsx |

### 3.8 Compliance Score / Analytics

| Feature | Status | Notes |
|---|---|---|
| Overall compliance score display | ✅ Done | Weighted average |
| Per-rubric compliance breakdown | 🚧 Broken | CVC-OEI, QM, Peralta show 0% — standardsTags not mapping correctly to analytics calculation |
| Severity distribution chart | ✅ Done | High/Medium/Low counts |
| Score trend over time | 🚧 Partial | UI exists; no persistent history stored |
| Statewide compliance metrics | 🚧 Partial | UI exists; no real statewide data source |

### 3.9 Audit Report Export

| Feature | Status | Notes |
|---|---|---|
| Compliance report view | ✅ Done | ComplianceReports.tsx |
| PDF export | 🚧 Broken | Export function exists but does not generate a valid downloadable PDF |
| Leadership brief generation | 🚧 Partial | Text generation works; PDF export broken |
| Standards compliance grid in report | ✅ Done | |
| Critical issues list in report | ✅ Done | |

---

## 4. Remaining Work — Prioritized

### Priority 1 — Critical Bugs (Break Core UX)

**P1-A: Analytics 0% for CVC-OEI, Peralta, QM**
- **Problem:** The Analytics component calculates per-standard compliance percentages, but they always show 0% because `standardsTags` on issues are not matching the string patterns expected by the analytics calculation.
- **Root cause to investigate:** `standardsMapping.ts` generates tags in the format `'cvc-oei:D7'`; the analytics component may be checking against a different format.
- **Fix:** Audit the tag format output by `standardsMapping.ts` and the format expected by `Analytics.tsx`. Normalize one side.

**P1-B: Audit Report PDF Export Broken**
- **Problem:** The PDF export button in ComplianceReports.tsx does not produce a valid downloadable PDF.
- **Root cause to investigate:** Check whether the PDF library (likely `jsPDF` or `html2canvas`) is actually installed and whether the export function handles async rendering correctly.
- **Fix:** Confirm library is available, wire up async export correctly, test download in browser.

### Priority 2 — Incomplete Core Features

**P2-A: Layout Table Semantic Conversion Flow**
- **Problem:** Tables used for layout (not data) are flagged but the fix flow doesn't guide the instructor through purpose selection (list of items, nav, image gallery, side-by-side, spacing, actual data).
- **PRD reference:** §3.4, §4 ("I want to tell SIMPLIFY what my table is being used for")
- **Fix:** Add a purpose-selection step in IssueDetailModal for table issues before generating the semantic fix.

**P2-B: Dense Paragraph AI Rewrite**
- **Problem:** usabilityScanner.ts flags large text blocks (>600 words), but there is no AI rewrite suggestion in the fix workflow.
- **PRD reference:** §3.5, §4 ("I want SIMPLIFY to suggest a rewrite for paragraphs that are too long")
- **Fix:** Wire `aiFixerService.ts` to generate a rewrite suggestion for large-text-block issues. Show in IssueDetailModal with edit-before-publish flow.

**P2-C: AI Broken Link Replacement**
- **Problem:** `linkDetector.ts` flags broken links, but there is no AI suggestion for replacement URLs.
- **PRD reference:** §4
- **Fix:** Add a `/generate-link-replacement` endpoint (or use client-side AI call) to suggest replacement URL and link text. Show in fix modal.

### Priority 3 — Missing Scanner Coverage

**P3-A: CVC-OEI D2 — Manual List Formatting**
- Lists created with dashes or asterisks instead of `<ul>/<ol>` not detected.
- Add check in accessibilityScanner.ts for text nodes matching `^\s*[-*•]\s+` inside `<p>` tags.

**P3-B: CVC-OEI D6 — Color as Sole Conveyor**
- Color-coded information not backed by text/icon alternative not detected.
- Low feasibility to detect automatically; consider a manual-check prompt in the report.

**P3-C: CVC-OEI D16 — Auto-play Media**
- No check for `autoplay` attribute on `<audio>` and `<video>` elements.
- Add 3-line check in accessibilityScanner.ts.

**P3-D: CVC-OEI A12, A13, A14 — Course Policy & Support Links**
- No detection for course policies, student support links, or technology support info.
- Add keyword-based checks in cvcOeiRubricScanner.ts scanning syllabus/front page content.

### Priority 4 — Polish & UX

**P4-A: Batch Publish Progress**
- Batch publish staged fixes lacks per-item progress feedback. Users don't know which fixes succeeded or failed.

**P4-B: Score Trend History**
- Analytics shows a trend chart but there is no persistent storage of past scan scores. Needs a Supabase table or localStorage history to be meaningful.

**P4-C: Scan Completion Rate Feedback**
- When a scan fails partway through (network error, rate limit), the error handling is silent. Need a visible error state with retry option.

---

## 5. Component Inventory

### Active Production Components

| Component | Purpose |
|---|---|
| `App.tsx` | Root; all global state and event handlers |
| `SimplifyDashboard.tsx` | Main tab shell (Overview / Analytics / Builders) |
| `ScanPanel.tsx` | Slide-out drawer showing scan results grouped by severity |
| `IssuesListModal.tsx` | Full paginated issues list with filter/sort |
| `IssueDetailModal.tsx` | Per-issue detail: element preview, fix options, Before/After |
| `LiveScanView.tsx` | Live scanning progress with per-item status |
| `Analytics.tsx` | Standards compliance dashboard |
| `ComplianceReports.tsx` | Audit report + PDF export |
| `CanvasConnectionModal.tsx` | Token-based Canvas login |
| `CanvasCourses.tsx` | Course browser list |
| `CourseView.tsx` | Full course content tree |
| `CourseCard.tsx` | Course tile |
| `CourseDropdown.tsx` | Course selector in header |
| `CourseSelectionModal.tsx` | Course picker modal |
| `CourseBuilders.tsx` | Template builder interface |
| `CourseTemplates.tsx` | Predefined templates |
| `IMSCCImportModal.tsx` | Upload + import IMSCC file |
| `AccountPanel.tsx` | Account/settings side panel |
| `OnboardingTour.tsx` | First-run walkthrough |
| `StandardsModal.tsx` | Rubric filter selection |
| `CanvasSettings.tsx` | Canvas domain + token settings |
| `QuickStats.tsx` | Summary stat cards |
| `UsabilityScorecard.tsx` | Ring chart for usability score |

### Design/Demo Components (Not Production)

These exist from the Figma Make design process and are not rendered in the production flow. They can be removed or kept as design references.

| Component | Notes |
|---|---|
| `ButtonDesignVariations.tsx` | Design demo only |
| `AnalyticsVariations.tsx` | Design demo only |
| `LoginHeaderVariants.tsx` | Design demo only |
| `ModalDesignComparison.tsx` | Design demo only |
| `ModalSizeComparison.tsx` | Design demo only |
| `RubricTagsDemo.tsx` | Design demo only |
| `StandardsDesignOptions.tsx` | Design demo only |
| `UsabilityScorecardOptions.tsx` | Design demo only |
| `UsabilityScorecardRingOptions.tsx` | Design demo only |
| `CourseBuilders.PRESERVED.tsx` | Backup; superseded by CourseBuilders.tsx |

---

## 6. Known Issues

| Issue | Severity | Area | Status |
|---|---|---|---|
| Analytics shows 0% for CVC-OEI, QM, Peralta | High | Analytics | Open — standardsTags format mismatch |
| PDF export does not produce valid download | High | Audit Report | Open — library/async issue |
| Color contrast preview shows 1:1 ratio when background is CSS-class-based (not inline) | Medium | Scanner | Partially fixed — inline styles detected; class-based backgrounds not accessible from DOMParser |
| "All Courses" aggregate view can include stale per-course data | Low | Scanning | Open — no invalidation strategy |
| Score trend chart has no real history data | Medium | Analytics | Open — no persistence layer for historical scores |
| Batch publish has no per-item progress feedback | Low | Fix Workflow | Open |
| IMSCC fix publish back to Canvas incomplete | Medium | Fix Workflow | Open |

---

## 7. Development Guidelines

### What to Preserve (Do Not Change Without Discussion)

1. **Stage → Review → Publish workflow** — The two-phase fix system is intentional. Fixes must never be written to Canvas without explicit instructor confirmation. Do not add auto-publish shortcuts.

2. **AI never publishes without confirmation** — All AI-generated content (alt text, captions, objectives, link text) must go through the edit-and-confirm step in IssueDetailModal before anything touches Canvas.

3. **Supabase proxy for all Canvas API calls** — Canvas does not allow direct browser requests (CORS). Never attempt to call the Canvas API directly from the frontend.

4. **`standardsTags` on every ScanIssue** — Every issue pushed by any scanner must include `standardsTags: string[]`. Tags must follow the format `'cvc-oei:D7'`, `'qm:8.3'`, `'peralta:E3'`. This is the basis for all standards filtering and analytics.

5. **`textColor` and `backgroundColor` on contrast issues** — Color contrast issues must store the detected hex values. The preview in IssueDetailModal reads these directly — do not remove these fields.

6. **`courseId` guard for localStorage** — The `allCourseScanResults` cache must never write with `courseId=0`. The guard in App.tsx (`if (selectedCourse && selectedCourse.courseId > 0)`) must be preserved.

### Patterns to Follow

- **Scanners are pure functions** — Each scanner (`accessibilityScanner.ts`, etc.) takes an HTML string and returns `ScanIssue[]`. Keep them free of side effects and API calls.
- **DOMParser for HTML analysis** — Use `new DOMParser().parseFromString(html, 'text/html')` for all HTML analysis. Never use regex to walk HTML structure (regexes are fine for attribute extraction).
- **Negative lookbehind for `color:` in style strings** — Use `/(?<!-)color\s*:\s*([^;]+)/i` to extract text color from inline styles without accidentally matching `background-color`.
- **Ancestor walk for background color** — `getEffectiveBackgroundColor()` in accessibilityScanner.ts walks `parentElement` checking `style`, `data-mce-style`, and `bgcolor` attributes. Use this pattern for any CSS value that may be inherited.
- **AI calls go through `aiFixerService.ts`** — Do not add direct `fetch('/generate-...')` calls in components. Route all AI requests through the service layer so caching and error handling are centralized.
- **`ScanIssue.status`** follows the state machine: `pending → staged → published | ignored | resolved`. Do not introduce additional status values without updating all consumers.

### Environment

- **Dev server:** `npm run dev` — starts Vite on port 3000
- **Build:** `npm run build` — outputs to `build/`
- **Edge Function:** Deployed on Supabase; URL and anon key in `src/utils/supabase/info.tsx`
- **Canvas domain:** User-configured at connection time; stored in localStorage as `canvasDomain`
- **Canvas token:** Stored in localStorage as `canvasToken` — never logged, never sent to third parties (only to the Supabase proxy which forwards to Canvas)

---

## 8. Phase 4 Summary: What's Next

### Top Priorities

1. **Fix Analytics 0% bug** — Standards compliance data is the core differentiator of SIMPLIFY. Showing 0% for all rubrics makes the analytics page meaningless. This is the highest-leverage fix.

2. **Fix Audit Report PDF export** — The compliance report is a primary deliverable for faculty peer review submissions. A broken export undermines the product's core value proposition.

3. **Layout Table semantic conversion flow** — The table fix is the most complex and most commonly needed accessibility fix in Canvas courses. Adding a purpose-selection step will significantly improve the fix acceptance rate (PRD success metric: >70%).

4. **Dense paragraph AI rewrite** — Completes the AI-assisted fix suite described in PRD §3.5. Requires adding one endpoint and wiring up one additional fix type in IssueDetailModal.

5. **Missing D2, D16, A12–A14 scanner checks** — Small additions that increase CVC-OEI coverage measurably and reduce the false-negative rate (PRD success metric: >80% of CVC-OEI failures caught).

### Decisions Needed Before Building

- **PDF export library:** Confirm whether `jsPDF`, `html2canvas`, or another library is the intended approach. The current broken implementation's library choice affects the fix strategy.
- **Score trend history storage:** Decide whether historical scan scores should be stored in Supabase (requires auth) or localStorage (simpler, device-local only).
- **Peralta E4–E8 feasibility:** These standards (diversity in images, bias identification, community building) are difficult to automate. Decide whether to implement as manual-check prompts in the report or attempt AI-based detection.
- **LTI 1.3 timeline:** The current PAT-based auth works for solo use but won't scale to institutional adoption. When does LTI become a priority?

### What Should NOT Change

- The stage/review/publish workflow (instructor safety net)
- The AI confirmation requirement before publishing
- The `standardsTags` format (`'rubric:standard'`)
- The Supabase proxy architecture for Canvas API calls
