# SIMPLIFY Real-Time Course Fixing System - Implementation Plan

**Date:** January 14, 2025, 2:45 PM  
**Version:** 2.0 - PUBLISH WORKFLOW UPDATE  
**Status:** Planning Phase

---

## 🎯 **CORE UX PHILOSOPHY: PUBLISH WORKFLOW**

### **Design Approach: "Stage → Review → Publish"**

Instead of applying fixes live to Canvas immediately, SIMPLIFY uses a **staging workflow**:

```
1. USER: Scans course → Issues detected
2. USER: Clicks "Fix Now" on issues → Fixes staged locally
3. USER: Reviews preview of all pending changes
4. USER: Clicks "Publish to Canvas" → All fixes sync at once
5. CANVAS: Course updated with all approved changes
```

**Benefits:**
- ✅ Review all changes before they go live
- ✅ Batch publish reduces API calls
- ✅ Undo is simple (don't publish)
- ✅ Clear separation between "working draft" and "published"
- ✅ Similar to Git workflow (stage → commit → push)

---

## 📊 Current Architecture Analysis

### **Data Storage & Processing Flow**

#### **OpenAI Integration: NOT CURRENTLY ACTIVE**
- File exists: `/utils/aiFixerService.ts`
- **Current Status:** Placeholder functions only, NO actual OpenAI API calls being made
- Environment variable defined but not used: `OPENAI_API_KEY`
- Functions return hardcoded/rule-based fixes, not AI-generated

**What processes the data:**
1. **Course Scanner** (`/utils/courseScanner.ts`)
   - Fetches content from Canvas API or Supabase
   - Runs rule-based scanners (accessibility, usability, design)
   - Returns array of `ScanIssue` objects

2. **Fix Processors** (Rule-based, NOT AI):
   - `/utils/canvasFixer.ts` - Applies regex/DOM-based fixes
   - Alt-text: Generates from filename
   - Contrast: Replaces with hardcoded accessible colors
   - Headings: DOM parsing and restructuring

#### **Data Flow for Imported Courses (IMSCC)**

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER UPLOADS IMSCC FILE                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│   FRONTEND: Parse IMSCC → Extract HTML/content                  │
│   File: /utils/imsccParser.ts                                   │
└───────��────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│   FRONTEND: Scan content for issues                             │
│   File: /utils/courseScanner.ts                                 │
│   Output: ScanIssue[]                                           │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│   SAVE TO SUPABASE (KV Store)                                   │
│   Key: course_{courseId}                                        │
│   Value: {                                                      │
│     courseData: IMSCCCourse (full IMSCC parsed structure),     │
│     scanResults: ScanIssue[],                                  │
│     metadata: { courseCode, importDate, etc }                  │
│   }                                                             │
│   Route: POST /courses                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│   STORED IN SUPABASE KV TABLE: kv_store_74508696               │
│   - NOT synced to Canvas yet                                    │
│   - All content lives in Supabase                               │
└─────────────────────────────────────────────────────────────────┘
```

#### **Data Flow for Live Canvas Courses**

```
┌─────────────────────────────────────────────────────────────────┐
│   USER SELECTS CANVAS COURSE FROM DASHBOARD                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│   FETCH FROM CANVAS API (via server proxy)                      │
│   - Pages: /api/v1/courses/:id/pages                           │
│   - Assignments: /api/v1/courses/:id/assignments               │
│   - Announcements: /api/v1/courses/:id/announcements           │
│   Route: GET /canvas/courses/:id/*                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│   FRONTEND: Scan fetched content                                │
│   File: /utils/courseScanner.ts                                 │
│   Output: ScanIssue[] with contentId, contentType metadata     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│   OPTIONALLY SAVE SCAN TO SUPABASE                              │
│   (for historical tracking)                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│   DISPLAY ISSUES IN SCAN PANEL                                  │
│   File: /components/ScanPanel.tsx                               │
└─────────────────────────────────────────────────────────────────┘
```

#### **Fix Application Flow - CURRENT SYSTEM**

```
USER CLICKS "FIX NOW"
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│   DETERMINE: Imported Course OR Canvas Course?                  │
└────────┬──────────────────────────────────────┬─────────────────┘
         │                                      │
         │ IMPORTED COURSE                      │ CANVAS COURSE
         ▼                                      ▼
┌────────────────────────────┐    ┌─────────���──────────────────────┐
│ ❌ PROBLEM: NO PATH EXISTS │    │ ✅ PATH EXISTS (partially)     │
│                            │    │                                │
│ Should:                    │    │ 1. Get original content from   │
│ 1. Load from Supabase      │    │    Canvas API                  │
│ 2. Apply fix to courseData │    │ 2. Apply fix (regex/DOM)       │
│ 3. Save back to Supabase   │    │ 3. PUT to Canvas API           │
│ 4. Update UI               │    │    via /canvas/update-page     │
│                            │    │                                │
│ Currently:                 │    │ ❌ ISSUE: contentId/contentType│
│ - Nothing happens          │    │    not always populated        │
└────────────────────────────┘    └────────────────────────────────┘
```

---

## 🚨 **CRITICAL ISSUES IDENTIFIED**

### **Issue #1: Imported Courses Cannot Be Fixed**
- **Problem:** No code path exists to update imported course content
- **Why:** `canvasFixer.ts` only handles Canvas API updates
- **Fix Required:** Create separate fixer for Supabase-stored courses

### **Issue #2: Scanner Not Populating contentId/contentType**
- **Problem:** When scanning, `ScanIssue` objects missing crucial metadata
- **Impact:** Even Canvas courses can't be fixed properly
- **Location:** `/utils/courseScanner.ts` lines 100-200
- **Fix Required:** Ensure scanner captures page URL, assignment ID, etc.

### **Issue #3: No Visual Feedback**
- **Problem:** Fixes happen behind the scenes, no way to verify
- **Impact:** User doesn't know if fix worked
- **Fix Required:** Live preview system

---

## 🎯 **REVISED IMPLEMENTATION PLAN**

### **NEW: Issue State Management System**

Each issue can have one of four states:
1. **`pending`** - Issue detected, not yet addressed
2. **`staged`** - Fix applied locally, waiting to publish
3. **`ignored`** - User decided to ignore this issue
4. **`published`** - Fix published to Canvas

```typescript
// Updated ScanIssue interface
export interface ScanIssue {
  id: string;
  status: 'pending' | 'staged' | 'ignored' | 'published';
  stagedFix?: {
    originalContent: string;
    fixedContent: string;
    timestamp: Date;
  };
  // ... other fields
}
```

---

### **PHASE 0: Fix Critical Bugs + Staging System** ⚡ *MUST DO FIRST*

**Goal:** Make "Fix Now" work AND implement staging workflow

**Task 0.1: Fix Scanner to Populate Metadata**
```typescript
// In /utils/courseScanner.ts
// When creating ScanIssue objects, ensure:
{
  ...issue,
  status: 'pending',                 // NEW: Initial state
  contentType: 'page',               // or 'assignment'
  contentId: page.url,               // or assignment.id
  canvasUrl: `${domain}/courses/${courseId}/pages/${page.url}/edit`
}
```

**Task 0.2: Create Staging Fix System**
```typescript
// New file: /utils/fixStaging.ts
export interface StagedFix {
  issueId: string;
  contentType: 'page' | 'assignment';
  contentId: string;
  originalContent: string;
  fixedContent: string;
  fixType: string;
}

// Store staged fixes in React state (App.tsx)
const [stagedFixes, setStagedFixes] = useState<Map<string, StagedFix>>(new Map());

// Stage a fix (doesn't publish yet)
export function stageFix(issue: ScanIssue): StagedFix {
  // Apply fix locally
  const fixedContent = applyFix(issue);
  
  return {
    issueId: issue.id,
    contentType: issue.contentType,
    contentId: issue.contentId,
    originalContent: getCurrentContent(),
    fixedContent: fixedContent,
    fixType: issue.category
  };
}
```

**Task 0.3: Create Supabase Course Fixer**
```typescript
// New file: /utils/supabaseFixer.ts
export async function fixSupabaseIssue(
  courseId: string,
  issue: ScanIssue
): Promise<FixResult> {
  // 1. Fetch course from Supabase
  const { course } = await getCourse(courseId);
  
  // 2. Find and fix content in courseData
  const fixedData = applyFixToCourseData(course.courseData, issue);
  
  // 3. Save back to Supabase (STAGING AREA)
  await updateCourse(courseId, fixedData);
  
  return { success: true, stagedFix: fixedData };
}
```

**Task 0.4: Implement "Fix Now" → Stages Fix Locally**
```typescript
// In /components/IssueDetailModal.tsx or ScanPanel.tsx
const handleFixNow = async (issue: ScanIssue) => {
  setIsFixing(true);
  
  // Apply fix and stage it (doesn't publish yet)
  const stagedFix = await stageFix(issue);
  
  // Update issue status to 'staged'
  updateIssueStatus(issue.id, 'staged', stagedFix);
  
  // Show in UI as "Staged for publish"
  toast.success('Fix staged! Click "Publish" to apply to Canvas');
  
  setIsFixing(false);
};
```

**Task 0.5: Implement "Ignore" Button**
```typescript
const handleIgnore = (issue: ScanIssue) => {
  // Mark issue as ignored
  updateIssueStatus(issue.id, 'ignored');
  
  toast.info('Issue ignored');
};
```

**Files to Create:**
- `/utils/fixStaging.ts` - **NEW FILE** - Staging system
- `/utils/supabaseFixer.ts` - **NEW FILE** - Supabase fixer

**Files to Modify:**
- `/utils/courseScanner.ts` - Add contentId/contentType + status field
- `/components/IssueDetailModal.tsx` - Add "Ignore" button
- `/components/ScanPanel.tsx` - Add inline "Fix Now" + "Ignore" buttons
- `/App.tsx` - Add stagedFixes state management
- `/utils/api.ts` - Add `updateCourse()` function

**Estimated Time:** 3-4 hours

---

### **PHASE 1: Inline "Fix Now" + "Ignore" Buttons** 🎯 *Core UX*

**Goal:** Quick access to fix or ignore issues from scan drawer

**Design:**
```
┌─────────────────────────────────────────────────────────┐
│  ❌ Missing Alt Text                                    │
│     Module 1 > Front Page                              │
│     [Fix Now]  [Ignore]                                │
│      ↑ 60px     ↑ 60px (compact buttons)               │
└─────────────────────────────────────────────────────────┘
```

**Button Specifications:**
- **Fix Now**: Blue background, white text, 60px width
- **Ignore**: Gray outline, gray text, 60px width
- Both: 28px height, 12px font size, rounded corners
- Side by side with 8px gap

**Implementation:**
```typescript
// In IssuesList component (ScanPanel.tsx)
<div className="flex items-center gap-2 mt-2">
  <button
    onClick={(e) => {
      e.stopPropagation();
      onFixNow(issue);
    }}
    className="h-[28px] px-3 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[12px] font-medium rounded-[6px] transition-colors"
    disabled={issue.status === 'staged' || issue.status === 'ignored'}
  >
    {issue.status === 'staged' ? '✓ Staged' : 'Fix Now'}
  </button>
  
  <button
    onClick={(e) => {
      e.stopPropagation();
      onIgnore(issue);
    }}
    className="h-[28px] px-3 border border-[#d2d2d7] hover:bg-[#f5f5f7] text-[#86868b] text-[12px] font-medium rounded-[6px] transition-colors"
    disabled={issue.status === 'ignored'}
  >
    {issue.status === 'ignored' ? '✓ Ignored' : 'Ignore'}
  </button>
</div>
```

**State Indicators:**
- **Pending**: Show "Fix Now" + "Ignore" buttons
- **Staged**: Show "✓ Staged" (green text, disabled)
- **Ignored**: Show "✓ Ignored" (gray text, disabled)
- **Published**: Show "✓ Published" (blue text)

**Files to Modify:**
- `/components/ScanPanel.tsx` - Add buttons to IssuesList
- `/App.tsx` - Add onFixNow and onIgnore handlers

**Estimated Time:** 1 hour

---

### **PHASE 1.75: "Batch Fix All" + "Publish to Canvas"** 🚀 *Core Workflow*

**Goal:** Allow users to fix all issues at once and publish all staged changes to Canvas

**New UI Elements:**

#### **1. Scan Panel Header with Action Buttons**
```
┌────────────────────────────────────────────────────────┐
│  Course Scan                                     [X]   │
│  Accessibility & Usability Analysis                   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  12 Issues  |  3 Staged  |  2 Ignored           │ │
│  │                                                  │ │
│  │  [Fix All Auto-Fixable]  [Publish to Canvas]    │ │
│  │   ↑ Blue button           ↑ Green button (glow) │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

#### **2. Batch Fix All Implementation**
```typescript
// In /components/ScanPanel.tsx
const handleBatchFixAll = async () => {
  const autoFixableIssues = scanResults.filter(
    issue => issue.autoFixAvailable && issue.status === 'pending'
  );
  
  if (autoFixableIssues.length === 0) {
    toast.info('No auto-fixable issues remaining');
    return;
  }
  
  setIsBatchFixing(true);
  
  // Show progress toast
  const progressToastId = toast.loading(
    `Staging fixes: 0/${autoFixableIssues.length}`,
    { id: 'batch-fix' }
  );
  
  let fixed = 0;
  const results = [];
  
  for (const issue of autoFixableIssues) {
    try {
      // Stage each fix (doesn't publish yet)
      const result = await stageFix(issue);
      results.push(result);
      
      // Update issue status
      updateIssueStatus(issue.id, 'staged', result);
      
      fixed++;
      toast.loading(
        `Staging fixes: ${fixed}/${autoFixableIssues.length}`,
        { id: 'batch-fix' }
      );
    } catch (error) {
      console.error(`Failed to fix issue ${issue.id}:`, error);
    }
  }
  
  setIsBatchFixing(false);
  toast.success(
    `${fixed} fixes staged! Click "Publish to Canvas" to apply.`,
    { id: 'batch-fix' }
  );
};
```

#### **3. Publish to Canvas Workflow**
```typescript
// In /components/ScanPanel.tsx or App.tsx
const handlePublishToCanvas = async () => {
  const stagedIssues = scanResults.filter(issue => issue.status === 'staged');
  
  if (stagedIssues.length === 0) {
    toast.error('No staged fixes to publish');
    return;
  }
  
  // Show confirmation modal
  const confirmed = await confirm({
    title: 'Publish Changes to Canvas?',
    message: `This will apply ${stagedIssues.length} fixes to your Canvas course. This action cannot be undone.`,
    confirmText: 'Publish to Canvas',
    cancelText: 'Cancel'
  });
  
  if (!confirmed) return;
  
  setIsPublishing(true);
  
  // Group fixes by contentId to minimize API calls
  const fixesByContent = groupFixesByContent(stagedIssues);
  
  let published = 0;
  const total = fixesByContent.length;
  
  for (const [contentId, issues] of fixesByContent) {
    try {
      // Publish all fixes for this content item at once
      await publishFixesToCanvas(courseId, contentId, issues);
      
      // Mark all issues as published
      issues.forEach(issue => {
        updateIssueStatus(issue.id, 'published');
      });
      
      published++;
      toast.loading(
        `Publishing: ${published}/${total} pages updated`,
        { id: 'publish' }
      );
    } catch (error) {
      console.error(`Failed to publish fixes for ${contentId}:`, error);
      toast.error(`Failed to publish some fixes: ${error.message}`);
    }
  }
  
  setIsPublishing(false);
  
  if (published === total) {
    toast.success(
      `✅ All ${stagedIssues.length} fixes published to Canvas!`,
      { id: 'publish', duration: 5000 }
    );
  } else {
    toast.warning(
      `⚠️ ${published}/${total} pages updated. Some fixes failed.`,
      { id: 'publish' }
    );
  }
};
```

#### **4. New Utility Functions**
```typescript
// In /utils/fixPublisher.ts (NEW FILE)

/**
 * Group staged fixes by contentId to batch updates
 */
export function groupFixesByContent(
  issues: ScanIssue[]
): Map<string, ScanIssue[]> {
  const grouped = new Map<string, ScanIssue[]>();
  
  issues.forEach(issue => {
    if (!issue.contentId) return;
    
    const existing = grouped.get(issue.contentId) || [];
    existing.push(issue);
    grouped.set(issue.contentId, existing);
  });
  
  return grouped;
}

/**
 * Publish all staged fixes for a specific content item to Canvas
 */
export async function publishFixesToCanvas(
  courseId: string,
  contentId: string,
  issues: ScanIssue[]
): Promise<void> {
  // Determine content type (all issues for same content should have same type)
  const contentType = issues[0].contentType;
  
  if (!contentType) {
    throw new Error('Missing content type');
  }
  
  // Get current content from Canvas
  let currentContent = await getCanvasContent(courseId, contentId, contentType);
  
  // Apply all fixes sequentially to the content
  for (const issue of issues) {
    if (issue.stagedFix) {
      // Replace originalContent with fixedContent
      currentContent = currentContent.replace(
        issue.stagedFix.originalContent,
        issue.stagedFix.fixedContent
      );
    }
  }
  
  // Single API call to update Canvas
  if (contentType === 'page') {
    await updateCanvasPage(courseId, contentId, currentContent);
  } else if (contentType === 'assignment') {
    await updateCanvasAssignment(courseId, contentId, currentContent);
  }
}
```

**UI Button States:**
- **"Fix All Auto-Fixable"**:
  - Enabled: When pending auto-fixable issues exist
  - Disabled: When no pending auto-fixable issues OR batch fixing in progress
  - Shows spinner when running
  
- **"Publish to Canvas"**:
  - Enabled: When staged fixes exist
  - Disabled: When no staged fixes OR publishing in progress
  - Glows with green subtle animation when staged fixes present
  - Shows "Publishing..." with progress indicator

**Visual Design:**
```tsx
<div className="flex items-center gap-3 p-4 border-b border-[#d2d2d7]">
  <div className="flex-1">
    <div className="text-[14px] text-[#1d1d1f]">
      {scanResults.length} Issues
      {stagedCount > 0 && ` • ${stagedCount} Staged`}
      {ignoredCount > 0 && ` • ${ignoredCount} Ignored`}
    </div>
  </div>
  
  <Button
    onClick={handleBatchFixAll}
    disabled={autoFixableCount === 0 || isBatchFixing}
    className="h-[36px] px-4 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[14px] rounded-[8px]"
  >
    {isBatchFixing ? (
      <>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Staging Fixes...
      </>
    ) : (
      `Fix All (${autoFixableCount})`
    )}
  </Button>
  
  <Button
    onClick={handlePublishToCanvas}
    disabled={stagedCount === 0 || isPublishing}
    className={`h-[36px] px-4 text-white text-[14px] rounded-[8px] ${
      stagedCount > 0
        ? 'bg-[#34c759] hover:bg-[#30b350] animate-pulse'
        : 'bg-[#86868b] cursor-not-allowed'
    }`}
  >
    {isPublishing ? (
      <>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Publishing...
      </>
    ) : (
      `Publish to Canvas (${stagedCount})`
    )}
  </Button>
</div>
```

**Files to Create:**
- `/utils/fixPublisher.ts` - **NEW FILE** - Batch publishing logic
- `/components/PublishConfirmModal.tsx` - **NEW FILE** - Confirmation dialog

**Files to Modify:**
- `/components/ScanPanel.tsx` - Add header buttons and handlers
- `/App.tsx` - Add publish state management

**Estimated Time:** 2-3 hours

---

### **PHASE 1.5: Improve Dashboard "Scan Course" CTA** ✨ *Quick UX Win*

**Goal:** Make it easier for users to start scanning courses with a prominent call-to-action

**Current State:**
- "Scan a Course" button exists in SimplifyDashboard header (top right)
- Easy to miss, not visually prominent

**New Design:**
```
┌───────────────────────────────────────────────────────────────────┐
│                    SIMPLIFY DASHBOARD                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │                      │  │              │  │              │   │
│  │  🔍 Select a Course  │  │  📊 Total    │  │  🎯 Courses  │   │
│  │     to Scan          │  │    Issues    │  │    Scanned   │   │
│  │                      │  │              │  │              │   │
│  │  [Scan a Course]     │  │     247      │  │      12      │   │
│  │   (blue button)      │  │              │  │              │   │
│  │                      │  │              │  │              │   │
│  └──────────────────────┘  └──────────────┘  └──────────────┘   │
│   ↑ NEW CARD                ↑ Existing cards                     │
└───────────────────────────────────────────────────────────────────┘
```

**Features:**
- Large card-sized CTA (same height as metric cards)
- Blue background (`bg-[#0071e3]`) to stand out
- Icon + text + button all in one card
- Positioned top-left, before Total Issues card
- Maintains Apple-style clean design

**Files to Modify:**
- `/components/SimplifyDashboard.tsx` - Add new CTA card component

**Estimated Time:** 20 minutes

---

### **PHASE 2: Split-View with Live Preview**

**Goal:** Show actual course content alongside issues

**Architecture:**
```
┌──────────────────────────────────────────────────────────────────┐
│                      SCAN VIEW (New Layout)                       │
├────────────────────────────┬─────────────────────────────────────┤
│                            │                                     │
│  COURSE CONTENT PREVIEW    │    SCAN RESULTS DRAWER             │
│  (60% width)               │    (40% width)                     │
│                            │                                     │
│  ┌──────────────────────┐  │  ┌───────────────────────────────┐│
│  │  [Front Page]        │  │  │  🔍 12 Issues Found          ││
│  │                      │  │  │  ─────────────────────────   ││
│  │  <img> ← Missing alt │  │  │  ❌ Alt Text Missing         ││
│  │                      │  │  │     Module 1 > Front Page    ││
│  │  [H3] Bad heading    │  │  │     [Fix Now] [View]         ││
│  │                      │  │  │                              ││
│  │  Low contrast text   │  │  │  ❌ Inconsistent Heading     ││
│  │                      │  │  │     Module 1 > Front Page    ││
│  └──────────────────────┘  │  │     [Fix Now] [View]         ││
│                            │  └───────────────────────────────┘│
│  When click "Fix Now" →    │                                     │
│  Element gets green border │  → Issue shows ✅ Fixed            │
│  & updates in real-time    │                                     │
└────────────────────────────┴─────────────────────────────────────┘
```

**Components to Create:**
1. **`CourseContentViewer.tsx`** - Render HTML content with highlighting
2. **`SplitViewLayout.tsx`** - Container for left/right split
3. **`ContentHighlight.tsx`** - Visual indicators for issues

**How Content Rendering Works:**

**Option A: Direct HTML Rendering** (RECOMMENDED)
```typescript
// Fetch page content from Canvas or Supabase
const pageHtml = await getPageContent(courseId, pageId);

// Render in iframe for isolation
<iframe 
  srcDoc={pageHtml}
  className="w-full h-full"
  sandbox="allow-same-origin"
/>

// Use postMessage to communicate with iframe
// Inject CSS to highlight problematic elements
```

**Option B: Canvas Iframe Embed**
```typescript
// Load actual Canvas page in iframe
<iframe 
  src={`https://${domain}/courses/${courseId}/pages/${pageUrl}`}
  className="w-full h-full"
/>

// Limitation: Can't inject highlighting CSS (CORS)
// Pro: Shows exactly what student sees
```

**Files to Create:**
- `/components/CourseContentViewer.tsx`
- `/components/SplitViewLayout.tsx`
- `/components/ContentHighlight.tsx`

**Files to Modify:**
- `/components/ScanPanel.tsx` - Integrate split view
- `/App.tsx` - Pass course content data

**Estimated Time:** 4-5 hours

---

### **PHASE 3: Real-Time Fix Visualization**

**Goal:** See fixes being applied live with animations

**Features:**
1. **Optimistic Updates** - Show fix immediately, rollback on error
2. **Visual Diff** - Highlight what changed (before → after)
3. **Animations** - Smooth transitions when fixing
4. **Undo Button** - Revert changes instantly

**Visual Flow:**
```
1. USER: Clicks "Fix Now" on "Missing Alt Text"
   
2. UI IMMEDIATELY:
   ┌─────────────────────────────────────────┐
   │ Issue card → Shows spinner              │
   │ Preview → Image gets pulsing red border │
   │ Toast → "Applying fix..."               │
   └─────────────────────────────────────────┘

3. BACKGROUND: API call to fix issue
   
4. SUCCESS:
   ┌─────────────────────────────────────────┐
   │ Issue card → ✅ "Fixed" (green)         │
   │ Preview → Border turns green, fades     │
   │ Toast → "Alt text added" [Undo]         │
   │ New badge appears: "🏷️ alt='...'"      │
   └─────────────────────────────────────────┘

5. IF USER CLICKS UNDO:
   ┌─────────────────────────────────────────┐
   │ Revert to original state                │
   │ Issue card → Back to "Fix Now" button   │
   │ Preview → Remove alt text badge         │
   └─────────────────────────────────────────┘
```

**Implementation:**
- Use `motion` library for animations
- Store undo history in React state
- Add CSS injection to iframe for highlighting
- Create before/after comparison modal

**Files to Modify:**
- `/components/CourseContentViewer.tsx` - Add animations
- `/components/ScanPanel.tsx` - Add undo UI
- `/utils/canvasFixer.ts` - Return detailed results
- `/utils/supabaseFixer.ts` - Return detailed results

**Estimated Time:** 3-4 hours

---

## 📂 **File Structure Overview**

```
/utils/
  ├── canvasFixer.ts          ← Fixes Canvas courses via API
  ├── supabaseFixer.ts        ← NEW: Fixes imported courses in Supabase
  ├── courseScanner.ts        ← MODIFY: Add contentId/contentType
  ├── api.ts                  ← MODIFY: Add updateCourse()
  └── aiFixerService.ts       ← Future: Real OpenAI integration

/components/
  ├── ScanPanel.tsx                ← MODIFY: Split-view layout
  ├── IssueDetailModal.tsx         ← MODIFY: Route to correct fixer
  ├── CourseContentViewer.tsx      ← NEW: Live preview component
  ├── SplitViewLayout.tsx          ← NEW: Left/right container
  └── ContentHighlight.tsx         ← NEW: Visual issue indicators

/supabase/functions/server/
  └── index.tsx                    ← MODIFY: Add updateCourse route
```

---

## ⏱️ **TOTAL TIME ESTIMATE**

| Phase | Task | Time |
|-------|------|------|
| **Phase 0** | Fix critical bugs + staging system | 3-4 hours |
| **Phase 1** | Inline fix + ignore buttons | 1 hour |
| **Phase 1.5** | Improve Dashboard CTA | 20 min |
| **Phase 1.75** | "Batch Fix All" + "Publish to Canvas" | 2-3 hours |
| **Phase 2** | Split-view preview | 4-5 hours |
| **Phase 3** | Real-time animations | 3-4 hours |
| **TOTAL** | | **13-17 hours** |

---

## 🤔 **QUESTIONS ANSWERED**

### **Q1: Is OpenAI API being used?**
**A:** NO. The file `/utils/aiFixerService.ts` exists but contains only placeholder functions. No actual OpenAI API calls are made. Fixes are rule-based (regex, DOM manipulation).

**Future Enhancement:** Could integrate real OpenAI Vision API for intelligent alt-text generation and GPT-4 for readability improvements.

---

### **Q2: How is course content stored?**

**A:** TWO different paths:

#### **Path 1: Imported Courses (IMSCC Upload)**
```
Storage: Supabase KV Store (kv_store_74508696 table)
Key Pattern: course_{uniqueId}
Data Structure:
{
  courseId: "generated-uuid",
  courseName: "Course Name",
  courseData: {
    // Full IMSCC structure
    modules: [...],
    pages: [...],
    assignments: [...],
    files: [...]
  },
  scanResults: ScanIssue[],
  metadata: { courseCode, importDate }
}

Sync to Canvas: NOT AUTOMATIC
- User must manually export fixed IMSCC and upload to Canvas
- OR we could add "Push to Canvas" feature (future)
```

#### **Path 2: Live Canvas Courses**
```
Storage: Fetched on-demand from Canvas API
- NOT stored in Supabase permanently
- Scan results MAY be cached in Supabase
- Fixes applied DIRECTLY to Canvas via API

Sync: IMMEDIATE
- When "Fix Now" is clicked
- PUT request to Canvas API
- Change reflects in Canvas instantly
```

---

### **Q3: How do fixes sync to Canvas?**

**A:** DEPENDS on course type:

#### **Imported Courses (IMSCC):**
```
Current: NO AUTO-SYNC
- Fixes stored in Supabase only
- User must export and manually upload to Canvas

Proposed (Phase 4 - Future):
- Add "Publish to Canvas" button
- Use Canvas Import API to push fixed course
- Requires Canvas course ID to target
```

#### **Live Canvas Courses:**
```
Current: IMMEDIATE SYNC (when it works)
1. User clicks "Fix Now"
2. Frontend calls /utils/canvasFixer.ts
3. Fixer calls server route: /canvas/update-page
4. Server makes PUT to Canvas API
5. Canvas content updated instantly

Issue: Not working due to missing contentId/contentType
Fix: Phase 0 will resolve this
```

---

## 🚀 **RECOMMENDED START SEQUENCE**

### **Step 1: Phase 0 - Fix Critical Bugs + Staging System** (DO THIS FIRST)
This is MANDATORY because nothing works without it.

### **Step 2: Phase 1 - Inline Buttons** (Quick Win)
Show immediate value while we build bigger features.

### **Step 3: Phase 1.5 - Improve Dashboard CTA** (Quick UX Win)
Make it easier for users to start scanning courses.

### **Step 4: Phase 1.75 - Batch Fix All + Publish to Canvas** (Core Workflow)
Allow users to fix all issues at once and publish changes.

### **Step 5: Phase 2 - Split View** (Big Impact)
Transform the UX and enable visual verification.

### **Step 6: Phase 3 - Real-Time Polish** (Delight)
Make it feel magical.

---

## 🎨 **FUTURE ENHANCEMENTS** (Not in current plan)

1. **Real OpenAI Integration**
   - Use GPT-4 Vision for intelligent alt-text
   - Use GPT-4 for readability improvements
   - Requires: `OPENAI_API_KEY` secret

2. **Batch Fix All**
   - Fix all issues at once
   - Show progress bar
   - Generate comprehensive change log

3. **Publish to Canvas from Imported Courses**
   - Use Canvas Course Import API
   - Push fixed IMSCC directly to target course
   - No manual export/upload needed

4. **Collaborative Fixing**
   - Multiple users can fix same course
   - WebSocket for real-time updates
   - Show who's fixing what

5. **Fix History & Audit Log**
   - Track all changes made
   - Export compliance reports
   - Revert to any previous state

---

## ✅ **NEXT STEPS**

**DECISION NEEDED:** Which phase should we start with?

**Recommendation:** Start with **Phase 0** to fix broken functionality, then proceed to Phase 1 → 1.5 → 1.75 → 2 → 3.

**Ready to begin?** Say the word and I'll start implementing! 🚀

---

## 📝 **UPDATED SUMMARY - Version 2.0 Changes**

### **Key UX Changes from User Feedback:**

1. **✅ Publish Workflow Added**
   - Fixes are staged locally first
   - User reviews all changes
   - Single "Publish to Canvas" button applies all staged fixes at once
   - Similar to Git: stage → review → push

2. **✅ Batch Fix All**
   - Native function to fix all auto-fixable issues at once
   - Shows progress toast during staging
   - All fixes staged, ready for review before publishing

3. **✅ Ignore Functionality**
   - Each issue now has "Ignore" button alongside "Fix Now"
   - Compact buttons (60px width, 28px height)
   - Ignored issues persist across sessions
   - Users can ignore style preferences they intentionally chose

4. **✅ Dashboard CTA Card**
   - Large blue card at top-left of dashboard
   - Same height as metric cards
   - More prominent than header button
   - Drives user engagement with scanning

### **Issue States:**
- **Pending** → Default state after scan
- **Staged** → Fix applied locally, not yet published
- **Ignored** → User chose to skip this issue
- **Published** → Fix successfully pushed to Canvas

### **User Journey:**
```
1. User scans course → Issues detected
2. User clicks "Fix All Auto-Fixable" → All fixes staged
3. User reviews staged fixes in preview (Phase 2)
4. User clicks "Publish to Canvas" → Batch upload to Canvas
5. Toast: "✅ 24 fixes published to Canvas!"
```

---

## 🎯 **IMPLEMENTATION PRIORITY**

**Phase 0 is CRITICAL** - Without it, nothing else works. Must be completed first.

**Quick Wins (Phase 1, 1.5, 1.75)** - Show immediate value, build user confidence

**Long-term (Phase 2, 3)** - Transform the experience, make it delightful

Total estimated time: **13-17 hours** across all phases.

---

**Last Updated:** January 14, 2025, 2:45 PM  
**Plan Version:** 2.0 - PUBLISH WORKFLOW UPDATE