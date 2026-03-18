# F072 — Leadership Brief PDF Export

**Branch:** Already on main (pre-existing implementation)
**Key files:** `ComplianceReports.tsx`

## What this feature does

Generates a professional PDF "Leadership Compliance Brief" that summarizes your course's accessibility status. Designed for institutional review — includes executive summary, key metrics, standards alignment, critical issues, and a compliance statement.

## How to test

### Setup
1. Open the app at localhost:3000
2. Connect to Canvas and select a course
3. Run a scan so you have issues in the results

### Test the PDF export
4. Click on **Compliance Reports** in the left sidebar (or tab navigation)
5. You should see:
   - An **Audit Snapshot** card with course name, compliance status badge, total issues, critical count
   - A **Standards Alignment** section showing CVC-OEI, Peralta, and Quality Matters issue counts
   - A **Key Risks** section listing the top critical/high issues
   - An **Export Documentation** section at the bottom
6. Click the **PDF Brief** button
7. A PDF file should **immediately download** to your computer (no popup, no print dialog)
8. Open the downloaded PDF and verify it contains:
   - "SIMPLIFY" header with "Leadership Compliance Brief" subtitle
   - Course name, report date, last scan date
   - Executive Summary with status badge (Meets Standards / Partial Compliance / Action Required)
   - Key Metrics boxes (Total Issues, Critical, Coverage)
   - Standards Alignment table (CVC-OEI, Peralta, Quality Matters with issue counts)
   - Key Risks section listing critical issues with severity badges
   - Compliance Statement
   - Footer with copyright

### Also test CSV export
9. Click the **CSV Log** button
10. A CSV file should download with all issues listed

### What to look for
- Does the PDF download instantly (no popup/print dialog)?
- Is the PDF properly formatted and readable?
- Do the numbers in the PDF match what's shown on screen?
- Does the compliance status badge color match the severity?

## Pass criteria
- PDF Brief button triggers an instant download
- PDF contains all sections (summary, metrics, standards, risks, statement)
- Data in PDF matches the scan results on screen
- PDF is properly formatted (no overlapping text, readable fonts)
