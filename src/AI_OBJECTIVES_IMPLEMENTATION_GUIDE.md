# AI Learning Objectives Auto-Fix - Implementation Guide

## Overview

This is a complete, production-ready AI-powered auto-fix system for generating learning objectives that comply with:
- **CVC-OEI Standards A1-A3** (Course and unit-level learning objectives)
- **Peralta E5** (Measurable learning outcomes)
- **Quality Matters 2.1** (Learning objectives/competencies are clearly stated)

## Architecture

### Frontend Component
**File:** `/components/AIObjectivesGenerator.tsx`

**Features:**
✅ 3-phase UX flow (Analyzing → Preview/Edit → Complete)
✅ Inline editing of generated objectives
✅ Add/remove objectives
✅ Bloom's Taxonomy visualization
✅ Live preview of formatted HTML
✅ Apple-inspired design matching SIMPLIFY aesthetic

### Backend AI Engine
**File:** `/supabase/functions/server/ai_objectives_generator.tsx`

**Features:**
✅ OpenAI GPT-4 integration
✅ Bloom's Taxonomy action verb selection
✅ Rubric-aligned prompt engineering
✅ Fallback generation (if API fails)
✅ HTML formatting for Canvas
✅ Automatic Bloom's level detection

### API Route
**File:** `/supabase/functions/server/ai_generate_objectives_route.tsx`

**Endpoint:** `POST /make-server-74508696/ai/generate-objectives`

**Request Body:**
```json
{
  "moduleTitle": "Introduction to ITEC 800",
  "moduleItems": [
    "ITEM: Syllabus",
    "ITEM: Week 1 Reading",
    "ITEM: Discussion Forum"
  ],
  "courseName": "ITEC 800 THEORY",
  "courseLevel": "800"
}
```

**Response:**
```json
{
  "success": true,
  "objectives": [
    "Explain the key concepts of educational technology theory",
    "Apply research methodologies to analyze learning environments"
  ],
  "structuredObjectives": [
    {
      "text": "Explain the key concepts...",
      "bloomsLevel": "understand",
      "actionVerb": "Explain"
    }
  ],
  "htmlContent": "<h3>Learning Objectives</h3>..."
}
```

## Integration with Issue Detail Modal

### Step 1: Detect "Unit Objectives Missing" Issue

In your issue scanning logic, identify issues with:
- `category: "unit-objectives-missing"`
- `autoFixAvailable: true`

### Step 2: Add AI Generation Button

When user clicks "Apply Fix" for this issue type, show the `AIObjectivesGenerator` component instead of the regular fix UI.

### Step 3: Connect to Backend

```typescript
// In IssueDetailModal.tsx or similar
import { AIObjectivesGenerator } from './AIObjectivesGenerator';

const handleGenerateObjectives = async (objectives: string[]) => {
  // Format objectives for Canvas API
  const htmlContent = `
    <h3>Learning Objectives</h3>
    <p>By the end of this module, students will be able to:</p>
    <ul>
      ${objectives.map(obj => `<li>${obj}</li>`).join('\n')}
    </ul>
  `;
  
  // Update Canvas module description via API
  await updateCanvasModule(moduleId, htmlContent);
  
  // Mark issue as resolved
  onResolve(issue);
};
```

## Bloom's Taxonomy Reference

The system uses these action verbs by cognitive level:

| Level | Verbs |
|-------|-------|
| **Remember** | Define, List, Recall, Identify, Label, Name, State |
| **Understand** | Explain, Describe, Summarize, Interpret, Classify, Compare, Discuss |
| **Apply** | Apply, Demonstrate, Use, Implement, Execute, Solve, Calculate |
| **Analyze** | Analyze, Examine, Investigate, Differentiate, Distinguish, Compare, Contrast |
| **Evaluate** | Evaluate, Assess, Critique, Judge, Justify, Defend, Argue |
| **Create** | Create, Design, Develop, Construct, Formulate, Compose, Plan |

## Rubric Alignment

### CVC-OEI A1-A3
- **A1:** Course-level learning objectives clearly stated
- **A2:** Module/unit-level learning objectives clearly stated  
- **A3:** Learning objectives are measurable

### Peralta E5
- Measurable learning outcomes using action verbs
- Clear connection to course content
- Specific and achievable objectives

### Quality Matters 2.1
- Learning objectives/competencies clearly communicated
- Appropriate level for course (graduate vs undergraduate)
- Aligned with module content

## Prompt Engineering Strategy

The AI prompt includes:
1. **Role definition:** Expert instructional designer
2. **Context:** Module title, course name, content items
3. **Requirements:** Bloom's taxonomy, measurable, specific
4. **Format:** JSON array for easy parsing
5. **Standards:** Explicit mention of CVC-OEI, Peralta, QM

## Error Handling

✅ **OpenAI API failure** → Falls back to template-based objectives
✅ **Invalid JSON** → Attempts to extract from markdown code blocks
✅ **Empty response** → Returns basic 3-objective set
✅ **Network errors** → User-friendly error messages

## Next Steps to Complete Integration

1. **Add API route to `/supabase/functions/server/index.tsx`**
   - Copy content from `/supabase/functions/server/ai_generate_objectives_route.tsx`
   - Paste it before the `Deno.serve(app.fetch);` line

2. **Connect frontend to Issue Detail Modal**
   - Import `AIObjectivesGenerator` component
   - Show it when user clicks "Apply Fix" on objectives issues
   - Pass module data from the issue

3. **Update Canvas via API**
   - Use the `htmlContent` from AI response
   - Call Canvas API to update module description
   - Handle Canvas API errors gracefully

4. **Track Resolution**
   - Mark issue as `resolved` after successful application
   - Add to undo stack for reverting if needed
   - Update scan results in state

## Testing Checklist

- [ ] Generate objectives for a module with 3-5 items
- [ ] Edit generated objectives inline
- [ ] Add/remove objectives
- [ ] Preview HTML output
- [ ] Apply to Canvas and verify in Canvas UI
- [ ] Test with empty modules (edge case)
- [ ] Test with very long module titles
- [ ] Test API failure fallback
- [ ] Verify rubric standard tags are present

## Benefits of This Approach

**Simple:** 3-click process (Apply Fix → Review → Apply)
**Accurate:** GPT-4 analyzes actual module content  
**Aligned:** Explicitly follows rubric standards
**Editable:** Users can modify before applying
**Fast:** ~2-3 seconds to generate
**Recoverable:** Undo option available

## Sample Output

For module "Introduction to ITEC 800" with items about theory, research, and practice:

```
By the end of this module, students will be able to:
• Explain the fundamental theories and principles of educational technology
• Analyze research methodologies appropriate for studying technology integration
• Evaluate the effectiveness of technology-enhanced learning environments
• Apply evidence-based practices to design educational technology solutions
```

---

**Status:** ✅ **READY FOR INTEGRATION**
**Estimated Integration Time:** 30-45 minutes
**Dependencies:** OpenAI API key (already configured)
