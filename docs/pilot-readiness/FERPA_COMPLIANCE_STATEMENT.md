# SIMPLIFY — FERPA Compliance Statement

**Version:** 1.0 | **Date:** March 2026 | **Contact:** support@simplifylti.com

---

## Overview

SIMPLIFY is a course content quality and accessibility scanner for Canvas LMS. It helps instructors identify and fix accessibility issues, align with CVC-OEI, Quality Matters, and Peralta Equity rubric standards, and improve the quality of their online course design.

This document describes how SIMPLIFY handles data and why it is compliant with the Family Educational Rights and Privacy Act (FERPA).

---

## What SIMPLIFY Accesses

SIMPLIFY connects to Canvas LMS through the instructor's personal API token and accesses **only instructor-authored course content**:

- Course pages and their HTML content
- Assignment descriptions and rubric metadata
- Module structure and organization
- Discussion topic titles and descriptions
- Course announcements
- File metadata (names and types — not file contents)

All data access is read-only during scanning. Write access is used only when an instructor explicitly chooses to publish a fix back to Canvas.

---

## What SIMPLIFY Never Accesses

SIMPLIFY does **not** access any student education records as defined by FERPA (34 CFR Part 99). Specifically, SIMPLIFY never accesses:

- Student names, emails, or any personally identifiable information (PII)
- Student submissions, papers, or uploaded files
- Grades, scores, or performance data
- Quiz responses or assessment attempts
- Enrollment rosters or attendance records
- Student discussion posts or replies
- Student communication or messaging
- Student profile information or account data

SIMPLIFY's Canvas API calls are scoped exclusively to course content endpoints. No student-facing API endpoints are called at any point.

---

## Data Storage and Retention

- **Scan results** are stored locally in the instructor's browser (localStorage). They are never transmitted to or stored on any SIMPLIFY server.
- **Canvas API tokens** are stored in the browser session only (sessionStorage) and are cleared when the browser tab is closed. Tokens are never persisted, logged, or transmitted beyond the secure proxy.
- **No course content** is permanently stored on any SIMPLIFY server. Content is processed in-memory during scanning and discarded.
- **No student data** is collected, stored, or transmitted at any point in the application lifecycle.

---

## AI Processing

SIMPLIFY uses AI (OpenAI GPT-4o via API) to generate fix suggestions such as alt text for images, improved link text, learning objectives, and content rewrites. Regarding AI processing:

- Only **instructor-authored content** is sent to the AI model — never student-generated content.
- AI requests are routed through SIMPLIFY's secure server proxy. The instructor's Canvas API token never reaches the AI provider.
- AI-generated suggestions are returned to the instructor for review. No suggestion is applied to Canvas without explicit instructor approval.
- OpenAI's API is used with data privacy protections — content sent via the API is not used to train models (per OpenAI's API data usage policy).

---

## Infrastructure and Security

- All connections between the instructor's browser, SIMPLIFY's server, and Canvas use **HTTPS/TLS encryption**.
- Canvas API calls are proxied through a secure server (Supabase Edge Function) to prevent direct browser-to-Canvas requests and protect API tokens.
- API tokens are validated and sanitized server-side before being forwarded to Canvas.
- **Rate limiting** is enforced to prevent abuse (100 requests per minute per IP).
- Security headers are configured on all responses: Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy.
- No analytics, tracking pixels, third-party cookies, or advertising frameworks are used.

---

## FERPA Compliance Summary

| Requirement | SIMPLIFY Status |
|---|---|
| Does not access student education records | Confirmed — only accesses instructor-authored course content |
| Does not store student PII | Confirmed — no student data is collected, stored, or transmitted |
| Data stored locally, not on external servers | Confirmed — scan results in browser localStorage only |
| Credentials handled securely | Confirmed — session-only storage, HTTPS, secure proxy |
| AI processing excludes student content | Confirmed — only instructor content sent to AI |
| Instructor controls all changes | Confirmed — every fix requires explicit review and approval |

---

## Institutional Use

SIMPLIFY operates as an **instructor productivity tool** — comparable to a grammar checker or document formatter. It works with the same course content that instructors can see and edit through the Canvas interface. Because SIMPLIFY does not access, process, or store any student education records, it does not trigger FERPA obligations related to third-party access to student data.

Institutions deploying SIMPLIFY do not need to:
- Execute a data sharing agreement for student records
- Notify students about SIMPLIFY's use
- Obtain student consent for SIMPLIFY access

---

## Contact

For questions about this compliance statement or SIMPLIFY's data practices:

**Email:** support@simplifylti.com

---

*This document reflects SIMPLIFY's architecture and data practices as of March 2026. It will be updated if material changes occur.*
