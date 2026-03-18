# F035+F100 — Batch Publish Progress Feedback

**Branch:** `feature/F035-batch-progress`
**Files changed:** `src/App.tsx`

## What changed

Before: When you clicked "Publish to Canvas" for multiple staged fixes, you only saw a single toast message saying "Publishing X fixes..." with no detail about what was happening.

Now: A progress modal pops up showing every fix being published, one by one, with status for each.

## How to test

### Setup
1. Open the app at localhost:3000
2. Connect to Canvas and select a course
3. Run a scan so you have issues in the list

### Test the progress modal
4. Click **Batch Fix All** in the bottom bar to stage all auto-fixable issues
5. Click **Publish to Canvas** (green button)
6. Confirm in the publish confirmation dialog
7. You should now see a **progress modal** with:
   - A title: "Publishing Fixes to Canvas..."
   - A progress bar that fills up as items are processed
   - A list of every fix being published
   - Each item shows one of these statuses:
     - Gray dot = waiting (pending)
     - Blue spinner = currently being published
     - Green checkmark = success
     - Red X = failed (with error message)
8. When all items finish, the title changes to "Publish Complete"
9. A summary shows how many succeeded and how many failed
10. Click **Done** to close the modal

### What to look for
- Does the progress bar animate smoothly?
- Can you see each item change from pending to publishing to success/failed?
- If any items fail, does the error message make sense?
- Does the Done button only appear after everything finishes?

## Pass criteria
- Progress modal appears during batch publish
- Each item shows its individual status
- Summary shows at the end
- Done button closes the modal
