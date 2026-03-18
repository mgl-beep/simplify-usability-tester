# F102 - Modal UI Consistency Across Flag Types

## What Changed
Normalized card container styles, border widths, border radii, spacing, icons, and text sizes across all issue type modals so they follow the same design system.

## Design System Reference
- **Card containers**: `border border-[#d2d2d7] rounded-[10px] bg-white`
- **Error/warning boxes**: `rounded-[8px]` with colored borders
- **Info boxes**: `bg-[#f0f9ff] border border-[#0071e3]/20 rounded-[8px]`
- **Section headings**: `text-[14px] font-semibold text-[#1d1d1f]`
- **Accordion icons**: Wand2 for AI suggestions, Lightbulb for Writing Tips, BookOpen for Examples

## Test Steps

### 1. Alt Text Issue Modal
- Open an alt text issue from the scan results
- Verify the image preview card has a thin border (not thick/double), rounded corners
- Verify the decorative check prompt card matches (thin border, rounded corners)
- If you click "No, generate alt text":
  - Verify the AI Suggested Alt Text accordion uses a wand icon
  - Verify Writing Tips accordion uses a lightbulb icon
  - Verify Examples accordion uses a book icon
  - Verify the hint text "Click a suggestion to use it..." appears below suggestions

### 2. Contrast Issue Modal
- Open a contrast issue from the scan results
- Verify the color preview card has a thin border and rounded-[10px] corners
- Verify "Why This Is a Problem" box has pink background with rounded-[8px]
- Verify the blue tip box appears below

### 3. Table Issue Modal (Caption)
- Open a table caption issue
- Verify the table preview card has a thin border (not thick), rounded-[10px] top corners
- Verify the data table check prompt has a thin border, rounded-[10px] bottom corners
- If confirmed as data table:
  - Verify AI Suggested Captions uses a wand icon (not a lightning bolt)
  - Verify Writing Tips uses a lightbulb icon
  - Verify Examples uses a book icon
  - Verify the hint text appears below caption suggestions
  - Verify writing tips use checkmark/x text symbols (not icons)
  - Verify examples use emoji-style formatting

### 4. Link Text Issue Modal
- Open a link text issue
- Verify AI Suggestions heading has a wand icon, card uses `rounded-[10px] bg-white`
- Verify Writing Tips accordion uses a lightbulb icon
- Verify Examples accordion uses a book icon

### 5. Objectives Issue Modal
- Open an objectives issue
- Verify the Outcomes card uses `border-[#d2d2d7] rounded-[10px] bg-white` (white background, not gray)
- Verify consistent spacing between sections

### 6. Layout Table Issue Modal
- Open a layout table issue
- Verify the table preview has thin borders
- Verify the purpose selection panel has thin borders and rounded-[10px] corners
- If selecting purposes and continuing:
  - Verify the preview card uses rounded-[10px]
  - Verify the accessibility improvements card uses rounded-[10px] and white background

### 7. Color-Only Issue Modal
- Open a color-only issue
- Verify fix option cards have thin borders and rounded-[10px] corners
- Verify "Why This Is a Problem" box styling matches contrast issue

### 8. Video Caption Issue Modal
- Open a video caption issue (if available)
- Verify the video preview card uses `border-[#d2d2d7]` (consistent border color)

### 9. Cross-Modal Consistency
- Compare any two different issue type modals side by side
- Verify section spacing is consistent (mb-4 between major sections)
- Verify "Why This Is a Problem" boxes all look the same
- Verify all accordion sections use the same header style and border pattern

## What to Look For
- No thick/double borders on cards (should all be single-pixel)
- Consistent rounded corners on card containers (rounded-[10px])
- White backgrounds on main content cards (not gray #fafafa)
- Same icon usage across all modal types for equivalent sections
- Consistent padding and spacing between sections
