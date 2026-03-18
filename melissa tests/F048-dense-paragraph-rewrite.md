# F048 — Dense Paragraph AI Rewrite

**Branch:** Already on main (pre-existing implementation)
**Key files:** `usabilityScanner.ts`, `IssueDetailModal.tsx`, `content-rewriter.ts`, `canvasFixer.ts`

## What this feature does

When a paragraph in your Canvas course is longer than 150 words, the scanner flags it as a "Long Text Block." The modal then auto-generates an AI rewrite that breaks the content into shorter chunks with optional subheadings — keeping the instructor's original words, just restructured for easier reading.

## How to test

### Setup
1. Open the app at localhost:3000
2. Connect to Canvas and select a course that has pages with long paragraphs (150+ words in a single paragraph)
3. Run a scan

### Test the detection
4. Look for issues titled **"Long Text Block"** in the scan results
5. They should have a severity of "low" and show the word count

### Test the AI rewrite
6. Click on a "Long Text Block" issue to open the detail modal
7. You should see:
   - The flagged paragraph text displayed at the top
   - An orange word count badge (e.g., "312 words") with "limit is 150 words per paragraph"
   - An **AI Rewrite** section that auto-loads (blue spinner: "AI is rewriting this content...")
8. Wait for the AI to finish — a textarea appears with the restructured content
9. The AI should:
   - Keep the original words and voice
   - Break into shorter paragraphs
   - Add subheadings where helpful
   - Convert list-like items to bullet points where natural
10. You can **edit** the AI suggestion in the textarea
11. Click **"Regenerate"** link to get a new suggestion
12. Click **Save & Close** to stage the fix
13. Before/after preview should show original vs. restructured content

### What to look for
- Does the word count badge show the correct number?
- Does the AI rewrite load automatically when you open the issue?
- Can you edit the rewrite before staging?
- Does "Regenerate" produce a new version?
- Does the before/after preview look correct?

## Pass criteria
- Dense paragraphs (150+ words) are flagged during scan
- AI rewrite auto-generates when modal opens
- User can edit the suggestion
- Fix can be staged and published
