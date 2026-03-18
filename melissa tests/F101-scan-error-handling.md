# F101 - Scan Error Handling and Retry

## What This Feature Does

When a scan fails (network error, API timeout, rate limit), the app now shows a visible error message with a Retry button instead of failing silently. If the scan partially completed before failing, the partial results are still shown.

## How to Test

### Test 1: Trigger a scan error (no Canvas connection)

1. Open the app at localhost:3000
2. Disconnect from Canvas (or use an invalid API token)
3. Try to scan a course
4. **Expected**: You should see a red "Scan Failed" screen with:
   - A red circle icon with an X
   - The error message explaining what went wrong
   - A blue "Retry Scan" button
   - A "Dismiss" button
5. The app should NOT be stuck in a "Scanning..." state

### Test 2: Retry button works

1. After seeing the error screen from Test 1
2. Click "Retry Scan"
3. **Expected**: The error clears and the scan starts again (you'll see "Scanning Course..." spinner)
4. If Canvas is still misconfigured, the error will show again (which is correct)

### Test 3: Dismiss button works

1. After seeing the error screen
2. Click "Dismiss"
3. **Expected**: The error disappears and you're back to the normal empty state (no crash, no stuck spinner)

### Test 4: Partial results preserved (if applicable)

1. Start a scan on a course with many pages
2. If the scan fails partway through (e.g., network drops mid-scan)
3. **Expected**: Any issues found before the failure are still shown in the results table
4. A yellow/red error banner appears ABOVE the results table saying "Scan completed with errors"
5. The banner includes a "Retry Scan" button and an X to dismiss

### Test 5: Error appears in ScanPanel drawer too

1. From the Courses tab, click a course and click "Scan"
2. If the scan fails, the ScanPanel drawer should also show the error banner
3. The error banner should have Retry and Dismiss buttons

### Test 6: Successful scan clears previous error

1. Trigger a scan error (e.g., bad API token)
2. See the error message
3. Fix the issue (reconnect to Canvas with a valid token)
4. Scan again
5. **Expected**: The error is cleared and fresh results are shown normally

## What to Look For

- The error message should be readable and helpful (not a raw JavaScript error dump)
- The Retry button should work without refreshing the page
- The app should never get stuck in a permanent "Scanning..." state after an error
- The styling should match the rest of the app (rounded corners, Apple-style design)
