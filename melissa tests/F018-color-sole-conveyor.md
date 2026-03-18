# F018 — Color as Sole Conveyor Detection

**Branch:** `feature/F018-color-sole-conveyor`
**Key files:** `accessibilityScanner.ts`, `standardsMapping.ts`

## What this feature does

Detects when color is used as the only means of conveying information in Canvas course content. For example, if an instructor uses red text to indicate "important" items but doesn't also bold, italicize, or add a symbol, colorblind users may miss the emphasis entirely. This maps to WCAG 1.4.1 (Use of Color) and CVC-OEI D6.

Because the scanner can't know the instructor's *intent*, flagged items are presented as manual-review prompts — the instructor decides whether the color is decorative or meaningful.

## How to test

### Setup
1. Open the app at localhost:3000
2. Connect to Canvas and select a course that has colored text in its pages (e.g., red text for warnings, green text for correct answers, colored spans for emphasis)
3. Run a scan

### Test the detection
4. Look for issues titled **"Color May Be Used as Sole Indicator"** in the scan results
5. They should have **medium** severity
6. Click on one to open the detail modal

### What should be flagged
7. A `<span style="color: red">Important deadline</span>` inside a paragraph — YES, should be flagged
8. A `<font color="#ff0000">Warning text</font>` inside a paragraph — YES, should be flagged
9. Colored text inside a Canvas RCE `data-mce-style` attribute — YES, should be flagged

### What should NOT be flagged
10. Colored text that is also **bold**: `<strong><span style="color:red">Important</span></strong>` — NO
11. Colored text that is also *italic*: `<em><span style="color:blue">Note</span></em>` — NO
12. Colored text inside a heading (`<h2><span style="color:red">Section</span></h2>`) — NO
13. Colored text inside a link (`<a href="..."><span style="color:red">Click</span></a>`) — NO
14. Text with inline `font-weight: bold` in the same style — NO
15. Black or near-black text (`color: #000000`, `color: #1a1a1a`) — NO (default text)
16. White or near-white text — NO
17. An entire paragraph that is all one color (not a phrase within a larger block) — NO

### Test the issue details
18. Open a flagged issue — the description should mention:
    - The specific text that was colored
    - The detected color value
    - That this is a manual review item
    - A reference to WCAG 1.4.1
19. The fix steps should guide the instructor to add bold, italic, icons, or labels
20. `autoFixAvailable` should be `false` (no auto-fix for this — it requires human judgment)

### Test the standards tags
21. In the Analytics panel, check that the issue appears under **CVC-OEI D6** standard
22. The issue should also appear under **QM 8.2** and **QM 8.3** filters

## If you don't have a course with colored text

Create a test page in Canvas with this HTML (use the Canvas HTML editor):

```html
<p>Please review the following items:</p>
<p><span style="color: #ff0000">This deadline is critical — submit by Friday.</span></p>
<p>Regular text here. <span style="color: #008000">Correct answer shown in green.</span> More regular text.</p>
<p><strong><span style="color: #0000ff">This is blue AND bold — should NOT be flagged.</span></strong></p>
<p><span style="color: #ff6600">Warning: late submissions lose 10 points.</span></p>
```

## Pass criteria
- Color-only text patterns are detected during scan
- Issues have the title "Color May Be Used as Sole Indicator"
- Issues have severity "medium" and `autoFixAvailable: false`
- standardsTags include `cvc-oei:D6`
- Bold/italic/underline colored text is NOT flagged
- Headings and links with color are NOT flagged
- Entire-paragraph color styling is NOT flagged (only partial phrases)
