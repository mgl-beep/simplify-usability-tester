# Pilot Readiness — Changelog

All new components, features, and changes made for pilot launch readiness.

**Date:** March 17, 2026

---

## New Components

### 1. Privacy & Data Modal (`src/components/PrivacyStatement.tsx`)
- In-app privacy statement accessible from Help dropdown and connection screen
- 5 sections: What We Access, What We Never Access, How Data Is Stored, AI Processing, Infrastructure & Security
- FERPA Compliant banner at top
- Verified against actual codebase — all claims are accurate

### 2. Help Center (`src/components/HelpCenter.tsx`)
- **Merged FAQ + Help & Support** into a single unified panel
- Contains: System Requirements, 5 FAQ sections (14 questions), 5 Troubleshooting accordion items
- Footer has "Send Feedback" and "Ask AI" links (replaces separate menu items)
- Replaces `FAQPanel.tsx` and `SupportPage.tsx` in the Help dropdown

### 3. Feedback Form (`src/components/FeedbackForm.tsx`)
- In-app feedback form with 3 categories: Bug Report, Suggestion, Question
- Submits to Supabase `/submit-feedback` endpoint (stored in KV store)
- Shows success confirmation after submission
- Accessible from Help Center footer

### 4. Pilot Welcome (`src/components/PilotWelcome.tsx`)
- One-time modal shown after first Canvas connection (500ms delay)
- 4 steps: Scan your course, Review & fix issues, Share feedback, Complete pilot survey
- "Learn more" link opens Privacy & Data dialog
- Uses localStorage flag (`simplify_pilot_welcome_seen`) to show only once

### 5. About SIMPLIFY (`src/components/AboutSimplify.tsx`)
- Mission, origin story (California community colleges), features overview
- Commitment to sustainability (grants, partnerships)
- Team section
- Version "1.0 Pilot" in footer

### 6. Error Boundary (`src/components/ErrorBoundary.tsx`)
- Global React error boundary wrapping the entire app
- Catches React errors and unhandled promise rejections
- Logs errors to Supabase `/log-error` endpoint (no PII)
- Shows friendly fallback UI with reload button

### 7. AI Help Chat (`src/components/AIHelpChat.tsx`)
- Chat interface using GPT-4o-mini (~$0.0001 per question)
- Quick prompt buttons for common questions
- Accessible from Help dropdown as "Ask SIMPLIFY"
- Resets conversation on each open

---

## Security Fixes

### 8. Removed Exposed API Key (T1.1)
- **File:** `src/utils/aiObjectivesGenerator.ts`
- Removed direct OpenAI API call that exposed key in browser DevTools
- Rewired `ObjectivesEditorModal.tsx` to use Supabase proxy endpoint

### 9. Security Headers (T1.3)
- **File:** `vercel.json`
- Added: Strict-Transport-Security, X-Content-Type-Options (nosniff), X-Frame-Options (DENY), X-XSS-Protection, Referrer-Policy, Permissions-Policy

### 10. Rate Limiting (T1.4)
- **File:** `src/supabase/functions/server/index.tsx`
- In-memory IP-based rate limiting: 100 requests/minute per IP
- Automatic cleanup of stale entries every 60 seconds
- Skips health checks and OPTIONS preflight requests

---

## Backend Endpoints Added

### `/submit-feedback` (POST)
- Stores feedback in Supabase KV store
- Fields: category, message, timestamp, canvasDomain

### `/log-error` (POST)
- Stores frontend errors in Supabase KV store
- Fields: message, stack, componentStack, pageUrl, timestamp

### `/ai/generate-objectives` (POST)
- Moved from client-side direct OpenAI call to server proxy
- Same functionality, now secure

---

## UI Changes

### Help Dropdown Condensed (7 → 5 items)
**Before:** Take a Tour, FAQ, Ask SIMPLIFY, Send Feedback, Privacy & Data, Help & Support, About SIMPLIFY
**After:** Take a Tour, Help Center, Ask SIMPLIFY, Privacy & Data, About SIMPLIFY

### Connection Screen
- Added Privacy & Data link in the info box below the Connect button
- Shield icon replaces emoji lock

### Landing Page
- Removed "Pricing" link from navbar (Pricing component was already not rendered)

---

## Documents Created

### FERPA Compliance Statement (`docs/FERPA_COMPLIANCE_STATEMENT.md`)
- 1-page shareable document for institutions
- Covers: what we access, what we never access, data storage, AI processing, infrastructure
- Compliance summary table
- Statement that no student data sharing agreement is needed

---

## Files Modified

| File | What Changed |
|------|-------------|
| `src/App.tsx` | PilotWelcome + PrivacyStatement state, imports, renders |
| `src/components/SimplifyDashboard.tsx` | Help dropdown: 7→5 items, HelpCenter replaces FAQ+Support |
| `src/components/CanvasConnectionModal.tsx` | Privacy & Data link in connection screen |
| `src/components/ObjectivesEditorModal.tsx` | Rewired to Supabase proxy (no more direct OpenAI) |
| `src/utils/aiObjectivesGenerator.ts` | Removed `generateLearningObjectives` function |
| `src/supabase/functions/server/index.tsx` | Rate limiting, /submit-feedback, /log-error endpoints |
| `src/main.tsx` | Wrapped App in ErrorBoundary |
| `vercel.json` | Security headers for all routes |

## New Files Created

| File | Purpose |
|------|---------|
| `src/components/PrivacyStatement.tsx` | Privacy & Data dialog |
| `src/components/HelpCenter.tsx` | Merged FAQ + Help & Support |
| `src/components/FeedbackForm.tsx` | In-app feedback form |
| `src/components/PilotWelcome.tsx` | One-time pilot welcome modal |
| `src/components/AboutSimplify.tsx` | About page |
| `src/components/ErrorBoundary.tsx` | Global error boundary |
| `docs/FERPA_COMPLIANCE_STATEMENT.md` | Shareable FERPA document |

## Files No Longer Used (kept but replaced)

| File | Replaced By |
|------|-------------|
| `src/components/FAQPanel.tsx` | `HelpCenter.tsx` |
| `src/components/SupportPage.tsx` | `HelpCenter.tsx` |
