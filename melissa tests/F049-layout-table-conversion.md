# F049 — Layout Table Semantic Conversion

**Branch:** Already on main (pre-existing implementation)
**Key files:** `accessibilityScanner.ts`, `IssueDetailModal.tsx`, `canvasFixer.ts`

## What this feature does

Tables used for layout (positioning images, links, or spacing) create accessibility barriers for screen reader users. This feature detects layout tables and walks you through converting them to proper semantic HTML — letting you choose what the table is actually being used for (list, navigation, gallery, or data).

## How to test

### Setup
1. Open the app at localhost:3000
2. Connect to Canvas and select a course that has tables used for layout purposes (not data tables — think tables used to arrange images side by side, or tables used as navigation menus)
3. Run a scan

### Test the detection
4. Look for issues titled **"Table Used for Layout (Not Data)"** in the scan results
5. They should have "high" severity

### Test the purpose-selection flow
6. Click on a layout table issue to open the detail modal
7. You should see:
   - The table HTML rendered at the top
   - **Step 1:** "Is this table being used to display data?" with two buttons:
     - "Yes, it's a data table" (blue)
     - "No, it's for layout" (orange)
8. Click **"No, it's for layout"**
9. **Step 2:** "What are you using this table for?" with multi-select options:
   - List of items
   - Links / Navigation
   - Image gallery
   - Actual data
   - You can select multiple (e.g., "Links" + "Image gallery")
10. Select one or more purposes, then click **Continue**
11. **Step 3:** Confirmation screen with:
    - A plain-English description of what will happen (e.g., "The table will be converted into a bulleted list")
    - A **Preview** box showing the converted HTML
    - An "Accessibility improvements" box listing what standards are met
    - **Convert Table** button
12. Click **Convert Table** to stage the fix
13. Before/after preview should show the table replaced with semantic HTML

### What to look for
- Does the 2-step flow work? (data check, then purpose selection)
- Can you select multiple purposes?
- Does the preview update based on your selections?
- Does "Go Back" and "Change selections" work?
- Does the converted HTML look correct in the preview?

## Pass criteria
- Layout tables are detected during scan
- Purpose-selection UI appears with multi-select
- Preview shows converted HTML
- Fix can be staged and published
