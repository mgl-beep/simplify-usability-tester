# Objectives Detection Debugging Guide

## Issue
"Unit Objectives Missing" errors are still showing up for modules that may or may not actually have objectives. We need to determine if the objectives are truly missing or if the scanner isn't detecting them properly.

## Changes Made

### Enhanced Logging in `cvcOeiRubricScanner.ts`

Added comprehensive console logging to track:

1. **Module-Level Checks**:
   - Number of items in the module
   - Number of pages available for matching
   - Module description length

2. **Page Item Analysis**:
   - Whether `content` or `body` properties exist on module items
   - Content source (allPages lookup vs. direct item.content/body)
   - Content length at each stage

3. **Extraction Process**:
   - Whether an "objectives heading" was found
   - Number of objectives extracted from dedicated sections
   - Results from fallback extraction methods

4. **Final Results**:
   - Summary of what was checked (overview pages, all pages, module description)
   - Suggestion for where to add objectives

## How to Debug

### Step 1: Open Browser Console
Open your browser's Developer Tools (F12) and go to the Console tab.

### Step 2: Run a Scan
Scan a course that's showing "Unit Objectives Missing" errors.

### Step 3: Look for Objective Check Logs

Look for logs that start with:
```
🔍 [OBJECTIVES CHECK] Starting scan for module "Module Name"
```

For each module flagged as missing objectives, you'll see:

#### a) Module Overview
```
🔍 [OBJECTIVES CHECK] Starting scan for module "Module 0: Orientation"
   - Module has 5 items
   - allPages array has 12 pages
   - Module description length: 0
   - Found 1 overview/intro pages
     - "Module 0: Orientation Overview"
       * type: Page
       * page_url: module-0-orientation-overview
       * has content: true
       * has body: true
       * content length: 1250
       * body length: 1250
```

**What to Check**: 
- Does the module have items? 
- Are there overview pages?
- Do the items have `content` or `body` properties?

#### b) Content Source
```
   📄 Checking page: "Module 0: Orientation Overview"
     - Content source: pageItem.content
     - Final content length: 1250
     - Content preview: <html content here>...
```

**What to Check**:
- Is content being loaded? (length > 0)
- What's the content source? (`allPages lookup`, `pageItem.content`, `pageItem.body`, or `NONE`)
- Does the preview show actual page content?

#### c) Extraction Results
```
       🔍 [EXTRACT] Text length: 1250, Clean text length: 985
       🔍 [EXTRACT] Has objectives heading: true
       ✅ [EXTRACT] Found 3 objectives in dedicated section
```

OR

```
       🔍 [EXTRACT] Text length: 1250, Clean text length: 985
       🔍 [EXTRACT] Has objectives heading: false
       🔍 [EXTRACT] Trying fallback extraction (scattered objectives)...
       📊 [EXTRACT] Final extraction result: 0 objectives found
```

**What to Check**:
- Did it find an objectives heading?
- How many objectives were extracted?
- If 0 objectives, look at the content preview to see if objectives exist in a format the scanner doesn't recognize

#### d) Final Decision
```
   ❌ NO OBJECTIVES FOUND in module "Module 0: Orientation"
     - Checked 1 overview pages
     - Checked 5 total pages
     - Checked module description (0 chars)
     - Suggesting to add to: "Module 0: Orientation Overview"
```

## Common Issues and Solutions

### Issue 1: Content Length is 0
**Symptom**: `Content source: NONE` or `content length: 0`

**Cause**: The server isn't fetching page content for module items, OR the page matching isn't working.

**Solution**: 
- Check that the server is fetching page content (lines 451-480 in `/supabase/functions/server/index.tsx`)
- Verify the `page_url` matching is working correctly

### Issue 2: Objectives Exist But Aren't Detected
**Symptom**: Content preview shows objectives, but extraction finds 0

**Possible Causes**:
1. Objectives don't have a recognizable heading ("Module Objectives:", "Learning Outcomes:", etc.)
2. Objectives aren't formatted as bullets or numbered lists
3. Objectives don't start with Bloom's taxonomy action verbs
4. Objectives are in tables or complex HTML that gets stripped

**Solutions**:
- Look at the content preview in the logs
- Check if objectives need to be formatted differently
- May need to expand the extraction patterns

### Issue 3: Heading Found But No Extraction
**Symptom**: `Has objectives heading: true` but `Found 0 objectives`

**Cause**: The items after the heading don't match the extraction pattern (too short, no action verbs, etc.)

**Solution**: Look at the content preview and adjust the extraction validation logic

### Issue 4: Page URL Mismatch
**Symptom**: `Looking for page URL "xyz": NOT FOUND ✗` for all pages

**Cause**: The `page_url` from module items doesn't match the `url` property in the `allPages` array

**Solution**: Check how pages are being fetched and stored. The server adds `content` and `body` directly to module items, so this fallback should work, but the primary lookup may fail.

## Next Steps

1. **Run a scan** and collect the console logs
2. **Share the logs** for the specific modules showing "Unit Objectives Missing"
3. **Determine**: 
   - Do the modules actually have objectives?
   - If yes, what format are they in?
   - If no, then the flagging is correct
4. **Adjust** the extraction patterns if needed

## Expected Outcome

After reviewing the logs, we'll know:
- ✅ Whether objectives truly exist in the modules
- ✅ Where they're located (which page, module description, etc.)
- ✅ What format they're in
- ✅ Why the scanner isn't detecting them (if applicable)
- ✅ Whether the flagging is correct or if we need to improve detection
