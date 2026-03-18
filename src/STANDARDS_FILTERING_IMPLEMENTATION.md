# Standards-Based Scanning + Filtering System - Implementation Summary

## ✅ What Was Implemented

### 1. **Standards Mapping System** (`/utils/standards/standardsMapping.ts`)

Created a comprehensive mapping system that ties every issue category to specific rubric standards:

- **WCAG 2.2 AA**: `wcag:#.#.#` (e.g., `wcag:1.1.1`, `wcag:2.4.4`)
- **CVC-OEI**: `cvc-oei:D#` (e.g., `cvc-oei:D3`, `cvc-oei:D4`) 
- **Peralta**: `peralta:E#` (e.g., `peralta:E1`, `peralta:E4`)
- **Quality Matters**: `qm:8.#` (e.g., `qm:8.1`, `qm:8.3`)

**Functions:**
- `getStandardsTagsForIssue(category)` - Returns array of standards tags for an issue category
- `issueMatchesEnabledStandards(tags, enabled)` - Filters issues based on enabled standards
- `getStandardDescription(tag)` - Returns human-readable description
- `getIssueStandards(issue)` - Gets all standards for a specific issue

### 2. **Updated ScanIssue Interface** (`/App.tsx`)

Added new field to the ScanIssue interface:
```typescript
standardsTags: string[]; // Array of standard tags (e.g., ["cvc-oei:D3", "qm:8.3", "wcag:2.4.4"])
```

Also expanded category union type to include table-related categories:
- `table-headers`
- `table-caption`
- `layout-table`

### 3. **Updated Accessibility Scanner** (`/utils/scanners/accessibilityScanner.ts`)

Added `standardsTags` to all issue types:
- ✅ Missing Alt Text → `['wcag:1.1.1', 'cvc-oei:D3', 'qm:8.1', 'peralta:E4']`
- ✅ Insufficient Color Contrast → `['wcag:1.4.3', 'cvc-oei:D3', 'qm:8.2', 'peralta:E4']`
- ✅ Heading Hierarchy Skipped → `['wcag:1.3.1', 'wcag:2.4.6', 'cvc-oei:D3', 'qm:8.1', 'peralta:E4']`
- ✅ Non-Descriptive Link Text → `['wcag:2.4.4', 'cvc-oei:D3', 'qm:8.1', 'peralta:E1']`
- ✅ Long URL as Link Text → `['wcag:2.4.4', 'cvc-oei:D3', 'peralta:E1', 'qm:8.1']`
- ✅ Table Missing Headers → `['wcag:1.3.1', 'cvc-oei:D3', 'qm:8.1', 'peralta:E4']`
- ✅ Table Missing Caption → `['wcag:1.3.1', 'cvc-oei:D3', 'qm:8.1']`
- ✅ Layout Table → `['wcag:1.3.1', 'cvc-oei:D3', 'qm:8.1', 'peralta:E4']`

### 4. **Updated Usability Scanner** (`/utils/scanners/usabilityScanner.ts`)

Added `standardsTags` to all issue types:
- ✅ Video Lacks Captions → `['wcag:1.2.2', 'cvc-oei:D4', 'qm:8.3', 'peralta:E4']`
- ✅ Long Text Block → `['cvc-oei:D1', 'qm:4.1', 'peralta:E4']`
- ✅ Assignment Lacks Instructions → `['cvc-oei:D2', 'qm:1.1', 'peralta:E4']`
- ✅ PDF Accessibility Check → `['wcag:1.3.1', 'cvc-oei:D3', 'qm:8.4', 'peralta:E1']`
- ✅ Complex Navigation → `['cvc-oei:D2', 'qm:8.5', 'peralta:E4']`

### 5. **Updated Demo/Sample Issues** (`/utils/courseScanner.ts`)

All 5 demo issues now include `standardsTags`:
- Demo 1: Missing Alt Text
- Demo 2: Low Color Contrast
- Demo 3: Inconsistent Heading Structure
- Demo 4: Video Missing Captions
- Demo 5: Broken External Link

### 6. **Updated LiveScanView Filtering** (`/components/LiveScanView.tsx`)

Implemented smart filtering logic:
- Uses new `standardsTags` field if available
- Falls back to legacy `rubricStandard` field for backwards compatibility
- Calls `issueMatchesEnabledStandards()` for efficient filtering
- If no standards are enabled, shows ZERO issues (empty state)
- If issue has no `standardsTags`, it's hidden (unmapped issues don't appear)

---

## 🎯 How It Works

### Scanning Process
1. Scanner detects an issue (e.g., missing alt text)
2. Calls `getStandardsTagsForIssue('alt-text')`
3. Returns: `['wcag:1.1.1', 'cvc-oei:D3', 'qm:8.1', 'peralta:E4']`
4. Issue is created with these tags in the `standardsTags` array

### Filtering Process
1. User opens Standards modal
2. User selects which rubrics to enable (e.g., only WCAG + CVC-OEI)
3. Enabled standards: `['wcag', 'cvc-oei']`
4. LiveScanView filters issues using `issueMatchesEnabledStandards()`
5. For each issue, checks if ANY tag matches ANY enabled standard
6. Example: Issue with tags `['wcag:1.1.1', 'qm:8.1']` → **SHOWN** (wcag matches)
7. Example: Issue with tags `['qm:8.1', 'peralta:E4']` → **HIDDEN** (no match)

---

## 🔗 Standards Alignment

### Issue Category → Standards Tags Mapping

| Issue Category | WCAG | CVC-OEI | Quality Matters | Peralta |
|----------------|------|---------|-----------------|---------|
| **alt-text** | 1.1.1 | D3 | 8.1 | E4 |
| **contrast** | 1.4.3 | D3 | 8.2 | E4 |
| **inconsistent-heading** | 1.3.1, 2.4.6 | D3 | 8.1 | E4 |
| **table-headers** | 1.3.1 | D3 | 8.1 | E4 |
| **table-caption** | 1.3.1 | D3 | 8.1 | - |
| **layout-table** | 1.3.1 | D3 | 8.1 | E4 |
| **broken-link** | 2.4.4 | D3 | 8.1 | E1 |
| **long-url** | 2.4.4 | D3 | 8.1 | E1 |
| **video-caption** | 1.2.2 | D4 | 8.3 | E4 |
| **pdf-tag** | 1.3.1 | D3 | 8.4 | E1 |
| **readability** | - | D1 | 4.1 | E4 |
| **confusing-navigation** | - | D2 | 1.1 | E4 |
| **deep-nav** | - | D2 | 8.5 | E4 |

---

## 🚀 Next Steps

### Testing
1. Connect to Canvas
2. Scan a course
3. Open Standards modal (top right button)
4. Toggle different rubrics on/off
5. Verify scan results update in real-time
6. Check that issue counts match filtered results

### Expected Behavior
- ✅ All standards enabled → Shows ALL issues
- ✅ Only WCAG enabled → Shows only WCAG-related issues
- ✅ WCAG + CVC-OEI → Shows issues with EITHER standard
- ✅ No standards enabled → Shows ZERO issues (empty state)
- ✅ Issue with no tags → Hidden (quality control)

---

## 📝 Files Modified

1. `/App.tsx` - Updated ScanIssue interface
2. `/utils/standards/standardsMapping.ts` - **NEW FILE** - Complete mapping system
3. `/utils/scanners/accessibilityScanner.ts` - Added standardsTags to all issues
4. `/utils/scanners/usabilityScanner.ts` - Added standardsTags to all issues
5. `/utils/courseScanner.ts` - Added standardsTags to demo issues
6. `/components/LiveScanView.tsx` - Implemented filtering logic

---

## ✨ Key Features

1. **Explicit Standard Mapping**: Every issue is tied to specific rubric criteria
2. **Multi-Standard Support**: Issues can map to multiple rubrics simultaneously  
3. **Real-Time Filtering**: Toggle standards to see results update instantly
4. **Backwards Compatible**: Falls back to `rubricStandard` for legacy issues
5. **Quality Control**: Unmapped issues are hidden (prevents showing unmapped data)
6. **User Control**: Saved to localStorage, persists across sessions

---

## 🎉 Status: COMPLETE

The standards-based scanning and filtering system is now fully implemented! Users can:
- Scan courses and get standards-mapped issues
- Filter results by WCAG, CVC-OEI, Quality Matters, and Peralta rubrics
- See real-time updates when toggling standards
- Trust that scan results always match selected standards

All scan results now explicitly state which rubric standards they violate, providing clear guidance for remediation.
