# Testing the Standards-Based Filtering System

## 🧪 Quick Test Guide

### Test 1: Verify All Standards Enabled (Default State)

**Steps:**
1. Click on SIMPLIFY in the left sidebar
2. Click "Scan Course" button
3. Select any course from the dropdown
4. Wait for scan to complete

**Expected Results:**
- ✅ Scan should show ALL detected issues
- ✅ Issues count in top-right should match total detected
- ✅ All 4 rubrics should show as enabled in Standards modal

---

### Test 2: Filter by WCAG Only

**Steps:**
1. Click "Standards" button (top-right corner of SIMPLIFY dashboard)
2. Uncheck "CVC-OEI Course Design Rubric"
3. Uncheck "Peralta Online Equity Rubric"
4. Uncheck "Quality Matters Higher Education Rubric"
5. Keep "WCAG Accessibility Principles" checked
6. Click "Save Changes"

**Expected Results:**
- ✅ Only WCAG-related issues should appear in scan results
- ✅ Issues like "Missing Alt Text", "Insufficient Color Contrast", "Heading Hierarchy" should REMAIN
- ✅ Issues like "Long Text Block" (CVC-OEI only) should DISAPPEAR
- ✅ Issue count should decrease to match filtered results

**Issues that should REMAIN (have WCAG tags):**
- Missing Alt Text (wcag:1.1.1)
- Insufficient Color Contrast (wcag:1.4.3)
- Heading Hierarchy Skipped (wcag:1.3.1, wcag:2.4.6)
- Non-Descriptive Link Text (wcag:2.4.4)
- Long URL as Link Text (wcag:2.4.4)
- Table Missing Headers (wcag:1.3.1)
- Video Missing Captions (wcag:1.2.2)
- PDF Accessibility (wcag:1.3.1)

**Issues that should DISAPPEAR (no WCAG tags):**
- Long Text Block (only cvc-oei:D1, qm:4.1, peralta:E4)
- Assignment Lacks Instructions (only cvc-oei:D2, qm:1.1, peralta:E4)
- Complex Navigation (only cvc-oei:D2, qm:8.5, peralta:E4)

---

### Test 3: Filter by CVC-OEI Only

**Steps:**
1. Open Standards modal
2. Uncheck all except "CVC-OEI Course Design Rubric"
3. Click "Save Changes"

**Expected Results:**
- ✅ ALL issues should appear (every issue maps to at least one CVC-OEI standard)
- ✅ CVC-OEI is the most comprehensive rubric in our mapping

---

### Test 4: No Standards Selected

**Steps:**
1. Open Standards modal
2. Uncheck ALL 4 rubrics
3. Click "Save Changes"

**Expected Results:**
- ✅ ZERO issues should appear
- ✅ Empty state should show: "No scan results"
- ✅ This confirms filtering is working (not showing unmapped data)

---

### Test 5: WCAG + CVC-OEI (Typical Academic Use Case)

**Steps:**
1. Open Standards modal
2. Check "WCAG Accessibility Principles"
3. Check "CVC-OEI Course Design Rubric"
4. Uncheck Peralta and Quality Matters
5. Click "Save Changes"

**Expected Results:**
- ✅ All issues should appear (both WCAG and CVC-OEI cover everything)
- ✅ This is the most common configuration for California Community Colleges

---

### Test 6: Quality Matters Only

**Steps:**
1. Open Standards modal
2. Uncheck all except "Quality Matters Higher Education Rubric"
3. Click "Save Changes"

**Expected Results:**
- ✅ Most accessibility issues should REMAIN (have qm:8.x tags)
- ✅ Usability issues should appear (qm:1.1, qm:4.1, qm:8.5)

---

## 🔍 Debugging Tips

### Check Console Logs
Open browser DevTools (F12) and look for:
```
🔍 Scan started - switching to Overview tab
✅ Found X issues
💾 Saved scan results to localStorage
```

### Verify Standards Tags
In the console, inspect an issue object:
```javascript
console.log(scanResults[0].standardsTags);
// Should output: ["wcag:1.1.1", "cvc-oei:D3", "qm:8.1", "peralta:E4"]
```

### Check Filtering Logic
```javascript
console.log(enabledStandards);
// Should output: ["wcag", "cvc-oei", ...] based on what's selected
```

---

## ✅ Success Criteria

The standards filtering system is working correctly if:

1. **All standards enabled** → Shows ALL issues detected
2. **One standard enabled** → Shows only issues with that standard's tags
3. **No standards enabled** → Shows ZERO issues (empty state)
4. **Issue counts update** → Match the filtered results exactly
5. **Settings persist** → Reloading page keeps your standard selections
6. **No console errors** → No JavaScript errors during filtering

---

## 🐛 Known Edge Cases

### Legacy Issues (Before Standards Tags Were Added)
- Issues created before this update may only have `rubricStandard` field
- Filtering falls back to checking `rubricStandard` text
- Eventually all issues will have `standardsTags`

### Demo/Sample Issues
- All 5 demo issues now have `standardsTags`
- They should filter correctly with the rest

---

## 📊 Expected Issue Counts by Standard

For a typical course scan with all issue types detected:

| Standard Selected | Approximate Issue Count |
|-------------------|------------------------|
| **All Standards** | 100% (baseline) |
| **WCAG Only** | ~75% (most accessibility) |
| **CVC-OEI Only** | ~100% (comprehensive coverage) |
| **Quality Matters Only** | ~80% (accessibility + pedagogy) |
| **Peralta Only** | ~60% (equity-focused) |
| **No Standards** | 0% (empty state) |

---

## 🎯 Real-World Scenario Test

**Scenario**: Your institution uses WCAG + Quality Matters for compliance

1. Open Standards modal
2. Enable "WCAG Accessibility Principles"
3. Enable "Quality Matters Higher Education Rubric"  
4. Disable CVC-OEI and Peralta
5. Scan a course

**Result**: You should see all accessibility issues + pedagogical best practices, filtered to align with your institution's specific requirements. Issues that only map to CVC-OEI or Peralta standards won't clutter the results.

---

## 💡 Tips for Testing

- Test with a **real course** that has diverse content (images, videos, PDFs, links)
- Try toggling standards **mid-scan** to see real-time updates
- Check that the **issue count badge** matches the displayed results
- Verify **localStorage persistence** by refreshing the page
- Test the **Standards modal** UI for smooth interactions

---

## 🚀 Ready to Test!

Your standards-based filtering system is fully implemented and ready for testing. Follow the test scenarios above to verify everything works as expected!
