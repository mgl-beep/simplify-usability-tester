# F019 — Auto-Play Media Detection (D16)

**Branch:** `feature/F019-autoplay-media`
**Files changed:** `accessibilityScanner.ts`, `standardsMapping.ts`, `canvasFixer.ts`

## What changed

Before: The scanner did not detect audio, video, or iframe elements with autoplay attributes.

Now: The accessibility scanner detects `<audio>` and `<video>` elements with the `autoplay` attribute, and `<iframe>` embeds with `autoplay=1` in their src URL. Issues are tagged with CVC-OEI D16. The fix engine can remove the autoplay attribute/parameter automatically.

## How to test

### Setup
1. Open the app at localhost:3000
2. Connect to Canvas and select a course

### Test autoplay detection
3. If the course has pages with embedded YouTube/Vimeo videos that use `autoplay=1` in the embed URL, or `<audio>`/`<video>` tags with the autoplay attribute, run a scan
4. Look for issues titled **"Video Set to Auto-Play"**, **"Audio Set to Auto-Play"**, or **"YouTube video Set to Auto-Play"**
5. Each issue should show:
   - Severity: **High**
   - Standards tags including **cvc-oei:D16**
   - The element HTML snippet
   - A suggested fix describing how to remove autoplay

### Test that non-autoplay media is NOT flagged
6. If the course has `<audio>` or `<video>` elements WITHOUT the autoplay attribute, verify they do NOT appear as autoplay issues
7. If the course has `<iframe>` embeds without `autoplay=1` in the URL, verify they are NOT flagged

### Test the fix flow
8. Click on an autoplay issue to open the detail modal
9. Click "Fix Now" to stage the fix
10. Verify the fix preview shows the autoplay attribute removed
11. Publish to Canvas to apply

### If you don't have autoplay content
If your test course doesn't have autoplay media, you can manually test by:
- Creating a Canvas page with this HTML in the rich content editor (switch to HTML mode):
  ```html
  <video autoplay src="test.mp4">Your browser does not support video.</video>
  ```
- Or embedding a YouTube video with autoplay:
  ```html
  <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" width="560" height="315"></iframe>
  ```
- Then scan the course and verify the issues appear

## Pass criteria
- Audio/video elements with autoplay attribute are detected
- Iframe embeds with autoplay=1 in src URL are detected
- All issues have standardsTags including 'cvc-oei:D16'
- Media elements WITHOUT autoplay are NOT flagged
- Fix removes the autoplay attribute/parameter correctly
