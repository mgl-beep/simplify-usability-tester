# Pilot Launch Checklist

## Security (All Done)
- [x] No API keys exposed in browser DevTools
- [x] Security headers present (HSTS, X-Frame-Options, CSP, etc.)
- [x] Rate limiting on Supabase endpoints (100 req/min/IP)
- [x] Canvas tokens in sessionStorage (cleared on tab close)
- [x] Token validation and sanitization server-side

## In-App Trust & Transparency (All Done)
- [x] Privacy & Data dialog accessible from Help menu
- [x] Privacy & Data link on connection screen (before users enter token)
- [x] FERPA Compliant banner in Privacy dialog
- [x] "Learn more" link in Pilot Welcome opens Privacy & Data
- [x] All privacy claims verified against codebase

## Pilot User Experience (All Done)
- [x] Pilot Welcome modal on first connection
- [x] Help Center (merged FAQ + troubleshooting)
- [x] Ask SIMPLIFY AI chat (GPT-4o-mini)
- [x] In-app feedback form (Bug/Suggestion/Question)
- [x] About SIMPLIFY page (mission, team, commitment)
- [x] Onboarding tour available

## Error Handling (All Done)
- [x] Global ErrorBoundary catches React crashes
- [x] Unhandled promise rejections caught
- [x] Errors logged to Supabase (no PII)
- [x] Friendly fallback UI with reload button

## Deployment (All Done)
- [x] Supabase Edge Function deployed with latest code
- [x] Vercel auto-deploys on push to main
- [x] vercel.json has no-cache for index.html (prevents stale chunks)

## Landing Page
- [x] Pricing removed from navbar
- [ ] Consider updating landing page CTA for pilot framing

## Documents for Institutions
- [x] FERPA Compliance Statement drafted (docs/pilot-readiness/FERPA_COMPLIANCE_STATEMENT.md)
- [ ] Pilot Agreement (what we ask of schools — feedback, survey, walkthrough)
- [ ] Post-Pilot Survey (Google Form or Typeform)
- [ ] Sustainability Narrative (grants, partnerships)
- [ ] Tech Support Plan (email + in-app feedback, 24-48hr response)

## App Features (41/41 passing)
- [x] Full course scanning (accessibility, usability, CVC-OEI, design, links)
- [x] AI-powered fix suggestions
- [x] Stage → Publish workflow with undo
- [x] Batch fix all + batch publish
- [x] Analytics dashboard with per-rubric scores
- [x] PDF/CSV report export + leadership brief
- [x] IMSCC file import
- [x] Course template builder
- [x] WCAG-compliant UI
