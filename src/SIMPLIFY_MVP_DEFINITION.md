# SIMPLIFY MVP Definition

## Executive Summary

**Product:** SIMPLIFY - Canvas LMS Accessibility & Usability Scanner
**Goal:** Help instructors create WCAG 2.2 AA compliant courses with minimal effort
**Target Users:** College instructors, instructional designers, accessibility coordinators
**Timeline:** 8-12 weeks to MVP launch

---

## 1. Key Assumptions

### Market Assumptions
1. **Pain Point Exists:** Instructors struggle with accessibility compliance and find it overwhelming
2. **Canvas Dominance:** 70%+ of target institutions use Canvas LMS
3. **Compliance Pressure:** Institutions face legal/regulatory pressure to ensure accessibility
4. **Time Scarcity:** Instructors lack time to manually review courses for accessibility
5. **Low Expertise:** Most instructors don't know WCAG standards in detail

### Product Assumptions
1. **One-Click Fixes Work:** Auto-fixing 60-70% of common issues (alt text, headings, color contrast) is valuable
2. **Canvas API Sufficient:** Canvas API provides enough access to scan and modify course content
3. **IMSCC Import Valuable:** Instructors will use IMSCC import for offline course analysis
4. **Standards Alignment:** Focusing on WCAG 2.2 AA (not AAA) meets 95% of institutional requirements
5. **Embedded Tool:** Users prefer SIMPLIFY embedded in Canvas over standalone dashboard

### Business Assumptions
1. **Freemium Model:** Free tier drives adoption, paid tier converts 5-10% of users
2. **Viral Growth:** Instructors will share with colleagues if tool saves 2+ hours per course
3. **Institution Sales:** Universities will pay for campus-wide licenses after instructor validation
4. **Support Load:** Auto-fix reduces support burden vs. manual guidance tools

---

## 2. What We're Testing (Hypotheses)

### Primary Hypothesis
**"Instructors will use a one-click accessibility scanner + auto-fix tool at least once per month if it saves them 2+ hours of work."**

### Secondary Hypotheses
1. **Scanning is sticky:** Users who scan 1 course will scan 3+ courses within first month
2. **Auto-fix drives value:** 70%+ of users will use auto-fix vs. manual review only
3. **Canvas integration matters:** Embedded tool has 5x higher usage than standalone dashboard
4. **Standards don't matter (to users):** Users care about "pass/fail" more than WCAG vs CVC-OEI specifics
5. **Visual clarity wins:** Users prefer simple "95/100 score" over detailed rubric breakdowns

### What Success Looks Like (4 weeks post-launch)
- ✅ **100 active users** (defined as 1+ scan per week)
- ✅ **60% auto-fix adoption rate** (users who run auto-fix on 50%+ of detected issues)
- ✅ **3.5+ scans per user** (average scans in first month)
- ✅ **40% week-1 retention** (users who return in week 2)
- ✅ **80% issue detection accuracy** (validated against manual WCAG audits)

---

## 3. Success Metrics

### North Star Metric
**"Hours Saved per Instructor per Month"**
- Target: 4 hours saved/instructor/month
- Calculation: (Issues Auto-Fixed × 2 min avg) + (Issues Flagged × 0.5 min saved finding them manually)

### Primary Metrics (Week 1-4)

| Metric | Target | How Measured |
|--------|--------|--------------|
| **User Activation** | 100 users scan 1+ course | Backend: unique users with scan_count >= 1 |
| **Scan Frequency** | 3.5 scans/user avg | Backend: total_scans / unique_users |
| **Auto-Fix Adoption** | 60% of users use auto-fix | Backend: users_with_autofix / total_users |
| **Week-1 Retention** | 40% return in week 2 | Backend: users_active_week2 / users_active_week1 |
| **Issue Accuracy** | 80% precision/recall | Manual: validate 50 random scans vs expert audit |

### Secondary Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| **Time to First Scan** | < 5 min from signup | Frontend analytics: signup_time → first_scan_time |
| **Scan Completion Rate** | 85% complete scan | Backend: completed_scans / started_scans |
| **Fix Success Rate** | 95% fixes apply correctly | Backend: successful_fixes / attempted_fixes |
| **Support Tickets** | < 5% users need help | Support: tickets / total_users |
| **NPS (Net Promoter Score)** | 40+ (week 4) | In-app survey: "How likely to recommend?" |

### Learning Metrics (What We Want to Learn)

| Question | How We'll Learn |
|----------|-----------------|
| What issues are most common? | Backend analytics: issue_type frequency distribution |
| What issues get fixed most? | Backend: fix_rate by issue_type |
| What issues get ignored most? | Backend: ignore_rate by issue_type |
| Where do users drop off? | Frontend: funnel analysis (signup → scan → review → fix) |
| What causes auto-fix failures? | Backend: error logs, fix_failure_reasons |
| Do users care about standards? | Heatmaps: clicks on WCAG/CVC-OEI/QM tabs vs Overview |
| Do users understand severity? | Survey: "What does 'high severity' mean to you?" |

---

## 4. MVP Feature Breakdown

### MUST-HAVE (Ship with MVP)
*These features are absolutely required for the MVP to be viable. Without any one of these, users cannot complete the core workflow.*

#### Core Workflow
- ✅ **Canvas OAuth Login** - Connect to Canvas account
- ✅ **Course Selection** - Browse and select courses from Canvas
- ✅ **IMSCC Import** - Upload and scan IMSCC files
- ✅ **Basic Scan Engine** - Detect top 10 most common issues:
  1. Missing alt text on images
  2. Empty or redundant link text ("click here")
  3. Incorrect heading hierarchy (skip levels)
  4. Missing heading structure
  5. Color contrast issues (text/background)
  6. Missing form labels
  7. Broken links (404s)
  8. Non-descriptive file names
  9. Missing page titles
  10. Inaccessible tables (missing headers)

- ✅ **Scan Results Dashboard** - Simple list of issues with:
  - Issue title & description
  - Location (module, page)
  - Severity (critical/high/medium/low)
  - "Fix Now" button

- ✅ **One-Click Auto-Fix** - For 5 easiest issues:
  1. Alt text (suggest based on filename/context)
  2. Link text (extract nearby text)
  3. Heading levels (auto-correct hierarchy)
  4. Form labels (match to nearby text)
  5. Page titles (use page name)

- ✅ **Fix Preview** - Show before/after diff before applying
- ✅ **Publish to Canvas** - Push fixes back to Canvas with one click
- ✅ **Undo Fixes** - Revert last batch of fixes

#### UI/UX Essentials
- ✅ **Simple 3-Tab Layout:**
  - Overview (scan results + quick stats)
  - Issues List (filterable by severity)
  - Settings (Canvas token, preferences)

- ✅ **Progress Indicators** - Show scan/fix progress
- ✅ **Empty States** - Clear guidance when no issues found
- ✅ **Error Messages** - Helpful error text for common failures
- ✅ **Mobile-Responsive** - Works on tablets (not phone-optimized yet)

#### Data & Infrastructure
- ✅ **Supabase Backend** - Store user data, scan history
- ✅ **Canvas API Integration** - Read/write course content
- ✅ **Basic Scan History** - Show last 10 scans per user
- ✅ **Error Logging** - Track fix failures for debugging

---

### SHOULD-HAVE (Add if time permits)
*These features significantly improve the experience but aren't required for MVP validation. Add only if core features are complete and stable.*

#### Enhanced Scanning
- 🟡 **Severity Scoring** - Overall course score (0-100)
- 🟡 **Module-Level Breakdown** - Show issues by module
- 🟡 **Issue Categories** - Group by accessibility/usability/design
- 🟡 **Scan Scheduling** - Auto-scan courses weekly
- 🟡 **Bulk Scanning** - Scan all courses at once

#### Better Fixes
- 🟡 **Batch Fix All** - Fix all auto-fixable issues in one click
- 🟡 **Fix Recommendations** - Show manual fix guidance for complex issues
- 🟡 **Before/After Gallery** - Visual comparison of fixes
- 🟡 **Fix History Timeline** - Show what was fixed when

#### Standards & Compliance
- 🟡 **WCAG 2.2 AA Report** - Basic compliance report (PDF)
- 🟡 **Export Issues (CSV)** - Download issue list
- 🟡 **Standards Explainer** - Tooltip help for WCAG criteria

#### User Experience
- 🟡 **Onboarding Tour** - 3-step intro for new users
- 🟡 **Keyboard Shortcuts** - Power user shortcuts (Cmd+S to scan)
- 🟡 **Dark Mode** - Theme toggle
- 🟡 **Email Notifications** - Notify when scan completes

---

### NICE-TO-HAVE (Post-MVP / V2)
*These features are valuable but not needed for initial validation. Build only after achieving product-market fit with core features.*

#### Analytics & Insights
- 🔵 **Advanced Analytics Dashboard** - Charts, trends, comparisons
- 🔵 **Course Comparison** - Compare 2+ courses side-by-side
- 🔵 **Historical Trends** - Track improvement over time
- 🔵 **Benchmark Data** - Compare to institution averages

#### AI & Automation
- 🔵 **AI Recommendations** - Smart suggestions for complex fixes
- 🔵 **AI Assignment Generator** - Create accessible assignments
- 🔵 **AI Syllabus Builder** - Generate accessible syllabi
- 🔵 **Smart Alt Text** - GPT-4 vision for image descriptions

#### Advanced Standards
- 🔵 **CVC-OEI Rubric** - Full rubric support
- 🔵 **Quality Matters** - QM Higher Ed Rubric scoring
- 🔵 **Custom Rubrics** - Institution-specific standards
- 🔵 **Peralta Rubric** - Additional compliance option

#### Collaboration
- 🔵 **Team Features** - Share scans with co-instructors
- 🔵 **Comments/Notes** - Add context to issues
- 🔵 **Approval Workflows** - Require review before fixes publish
- 🔵 **Audit Trail** - Full change history with user attribution

#### Integrations
- 🔵 **Slack Notifications** - Post scan results to Slack
- 🔵 **Microsoft Teams** - Teams integration
- 🔵 **LTI 1.3** - Deep Canvas integration (app in sidebar)
- 🔵 **API for Institutions** - Allow custom integrations

#### Advanced Features
- 🔵 **Custom Reports** - Branded PDF reports with logo
- 🔵 **Accessibility Scorecard** - Persistent scoring widget
- 🔵 **Course Builder Template** - Start from accessible templates
- 🔵 **Bulk Import** - Upload 100+ IMSCC files
- 🔵 **Advanced Settings** - Granular control over scan behavior

---

## 5. What We'll Build Later (Post-MVP Roadmap)

### Phase 2: Product-Market Fit (Weeks 13-20)
**After validating MVP hypotheses, build based on user feedback**

**If users love auto-fix:**
- Advanced AI fixes (GPT-4 for complex content)
- Batch operations (fix 100+ issues)
- Fix confidence scoring

**If users struggle with Canvas:**
- LTI 1.3 deep integration (embedded in Canvas)
- Canvas notifications
- Direct Canvas assignment editing

**If institutions show interest:**
- Multi-user accounts (department licenses)
- Admin dashboard (institution-wide analytics)
- Compliance reporting (for accreditation)

### Phase 3: Monetization (Weeks 21-30)
**After 500+ active users**

**Freemium Tier Limits:**
- Free: 3 scans/month, basic auto-fix
- Pro ($19/month): Unlimited scans, advanced AI, priority support
- Institution ($499/month): 50 users, admin dashboard, custom branding

**Paid Features:**
- AI-powered content generation
- Advanced analytics & comparisons
- Custom compliance reports
- API access
- Priority support (< 4 hour response)

### Phase 4: Scale & Expand (6+ months)
**After achieving profitability**

- **Other LMS Support** - Blackboard, Moodle, D2L
- **Mobile Apps** - iOS/Android for on-the-go scanning
- **Accessibility Checker API** - Sell to other EdTech companies
- **Content Library** - Marketplace for accessible course templates
- **Training Platform** - Teach instructors about accessibility

---

## 6. MVP Development Priorities

### Week 1-2: Foundation
- [ ] Canvas OAuth + API integration
- [ ] Basic scan engine (detect top 5 issues)
- [ ] Simple results display
- [ ] Database schema (Supabase)

### Week 3-4: Auto-Fix
- [ ] Auto-fix logic for alt text, headings, links
- [ ] Before/after preview
- [ ] Publish to Canvas
- [ ] Undo functionality

### Week 5-6: UX Polish
- [ ] 3-tab layout (Overview, Issues, Settings)
- [ ] Progress indicators
- [ ] Empty states
- [ ] Error handling
- [ ] Mobile-responsive

### Week 7-8: Testing & Launch
- [ ] User testing (10 instructors)
- [ ] Bug fixes
- [ ] Onboarding flow
- [ ] Analytics instrumentation
- [ ] Soft launch (50 beta users)

### Week 9-12: Iterate
- [ ] Fix bugs based on user feedback
- [ ] Add 1-2 should-have features
- [ ] Improve auto-fix accuracy
- [ ] Optimize performance
- [ ] Public launch

---

## 7. Success Criteria for MVP

### Go/No-Go Decision (Week 12)
**GO (Continue building) if:**
- ✅ 100+ active users (1+ scan/week)
- ✅ 40%+ week-1 retention
- ✅ 60%+ auto-fix adoption
- ✅ 80%+ issue detection accuracy
- ✅ 5+ institutions express interest in paid plans
- ✅ NPS > 40

**NO-GO (Pivot or shut down) if:**
- ❌ < 50 active users after 4 weeks
- ❌ < 20% week-1 retention
- ❌ < 30% auto-fix adoption (users prefer manual review)
- ❌ < 60% issue accuracy (too many false positives)
- ❌ NPS < 20 (users don't see value)

### Pivot Options (if NO-GO)
1. **Focus on compliance reporting** - Drop auto-fix, become reporting tool
2. **Switch to Moodle** - If Canvas API too limited
3. **B2B only** - Sell directly to institutions, skip freemium
4. **Content generation focus** - Pivot to AI assignment/syllabus builder
5. **Consulting service** - Manual accessibility audits vs software

---

## 8. Risk Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Canvas API limits block auto-fix | Medium | High | Test API thoroughly in week 1; have IMSCC-only fallback |
| Auto-fix breaks course content | Medium | Critical | Implement undo; show preview; start with 5 safest fixes only |
| Scan too slow (>2 min) | Medium | High | Optimize scan algorithm; use web workers; show progress |
| False positive rate too high | High | High | Manual validation of 100+ scans; tune detection thresholds |
| Supabase costs explode | Low | Medium | Monitor usage; implement rate limiting; cache scan results |

### Market Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Competitors launch similar tool | Low | Medium | Move fast; focus on best UX; lock in early users |
| Institutions already have solutions | Medium | High | Research competitors; find differentiation (speed, UX, AI) |
| Instructors don't care about accessibility | Low | Critical | Validate with interviews before building |
| Canvas changes API | Low | Critical | Stay updated on Canvas releases; maintain API abstraction layer |
| Legal liability for bad fixes | Low | High | Disclaimer in app; professional liability insurance |

### User Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Users don't trust auto-fix | High | High | Show previews; explain changes; allow manual review |
| Users overwhelmed by issues | High | Medium | Show top 10 only; hide low-priority; provide filters |
| Users abandon before seeing value | High | High | Onboarding tour; "Quick Win" suggestions; email drip campaign |
| Users confused by standards | Medium | Low | Hide WCAG jargon; use plain English; focus on pass/fail |

---

## 9. MVP Launch Checklist

### Pre-Launch (Week 8)
- [ ] 10 user beta tests completed
- [ ] All must-have features working
- [ ] Analytics instrumentation live
- [ ] Error logging configured
- [ ] Support email setup
- [ ] Pricing page (even if free)
- [ ] Terms of Service + Privacy Policy
- [ ] Demo video (2 min)

### Launch (Week 9)
- [ ] Post to r/Professors, r/highereducation
- [ ] Email to Canvas user groups
- [ ] LinkedIn post in EdTech groups
- [ ] Product Hunt launch
- [ ] Tweet thread with demo
- [ ] Blog post: "Why we built SIMPLIFY"

### Post-Launch (Week 10-12)
- [ ] Daily metric monitoring
- [ ] User interview (1-2 per week)
- [ ] Bug triage (fix critical within 24h)
- [ ] Weekly email to users (tips, updates)
- [ ] Iterate based on feedback

---

## 10. Open Questions (Need Answers Before Launch)

1. **Pricing:** Free tier limits? Pro price point?
2. **Legal:** Do we need legal review of auto-fixes?
3. **Marketing:** Which channel will drive most users?
4. **Competition:** What do Ally, Pope Tech charge? Why will users switch?
5. **Institutions:** Will universities pay for campus licenses? What price?
6. **Support:** Can we handle support with auto-fix? Or need docs/videos?
7. **Accuracy:** What's acceptable false positive rate? 10%? 5%?
8. **Standards:** Do users care about WCAG vs CVC-OEI? Or just "accessible"?

---

## Summary

**MVP Goal:** Validate that instructors will use a one-click accessibility scanner + auto-fix tool to save 2+ hours per course.

**Must-Have:** Scan top 10 issues → Auto-fix top 5 → Publish to Canvas → Undo if needed

**Success:** 100 active users, 40% retention, 60% auto-fix adoption, NPS > 40 (Week 12)

**Build Later:** Analytics, AI, collaboration, advanced standards, monetization

**Ship Fast:** 8 weeks to MVP, learn from users, iterate based on data

---

*This MVP definition is a living document. Update as we learn from users.*
