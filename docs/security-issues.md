# Security Issues Report — Simplify / Canvas Integration App

**Prepared for:** Melissa Lee
**Date:** February 2026
**Prepared by:** Security audit via Claude Code

---

## What This Document Is

A programmer who reviewed this project flagged potential security concerns. This document lists all the security issues found in the codebase, ranked from most serious to least serious. Each issue includes a plain-English explanation of what it is, why it matters, and what needs to be done to fix it.

---

## Quick Summary

| Severity | Count | What it means |
|---|---|---|
| 🔴 Critical | 2 | Must be fixed before more users are added |
| 🟠 High | 7 | Should be fixed soon — real risk of abuse |
| 🟡 Medium | 5 | Important to address in the next development cycle |
| 🟢 Low | 2 | Worth fixing eventually, lower immediate risk |

---

## 🔴 CRITICAL Issues

### #1 — Anyone can call your AI and Canvas proxy server without logging in

**File:** `src/supabase/functions/server/index.tsx`

**What's happening:**
Your app has a server (a "Supabase Edge Function") that does the heavy work: it talks to Canvas on your behalf, runs AI analysis, and creates announcements. This server should only respond to requests from your logged-in users. Right now, it responds to anyone who knows the server's URL — even someone who has never used your app and has no account.

**Why this is a problem:**
If someone finds your server URL (which is not secret — it's embedded in your app code), they could:
- Use your OpenAI account to run AI requests, racking up charges on your bill
- Try to read course data from Canvas accounts that aren't theirs
- Spam your server with thousands of requests, causing it to slow down or cost you money

**What needs to be fixed:**
Every request to the server needs to prove the user is logged in before the server does anything. This is called "authentication." Your server currently accepts and processes requests before checking who is asking.

---

### #2 — Your server's admin database key is being used where it shouldn't be

**File:** `src/supabase/functions/server/index.tsx`

**What's happening:**
Your app uses Supabase (a database service) to store data. Supabase has two keys: a "public" key for normal users, and a "service role" key that has full admin access to everything in the database with no restrictions. The server code is using the admin key for some operations that don't need it.

**Why this is a problem:**
The service role key bypasses all security rules in the database. If there's ever a bug in your server code, an attacker could potentially exploit it to read, modify, or delete all data in your database — including data from all users.

**What needs to be fixed:**
Use the restricted public key for all database operations that don't absolutely require admin access.

---

## 🟠 HIGH Issues

### #3 — Your server key is visible inside your app code

**File:** `src/utils/supabase/info.tsx`

**What's happening:**
Your Supabase "anon key" (a long string of letters and numbers starting with `eyJ...`) is written directly in your app's source code. Since your app runs in the browser, anyone can open browser developer tools and read this key.

**Why this is a problem:**
With this key, someone could directly query your Supabase database, bypassing your app entirely. If your database security rules ("Row Level Security") aren't perfectly configured, this could expose user data.

**What needs to be fixed:**
This is somewhat expected for Supabase public keys — they are designed to be public. However, you must make sure Supabase Row Level Security is properly enabled on all tables so that even someone with this key can only see what they're supposed to see.

---

### #4 — Your server will accept requests from any website in the world

**File:** `src/supabase/functions/server/index.tsx`

**What's happening:**
Your server has a CORS setting of `origin: "*"`. CORS is a web security rule that controls which websites are allowed to talk to your server. The wildcard `*` means any website anywhere — including malicious ones — can send requests to your server.

**Why this is a problem:**
A malicious website could trick one of your users into visiting it, then silently send requests to your server using that user's credentials. This is called a Cross-Site Request Forgery (CSRF) attack.

**What needs to be fixed:**
Change the CORS setting to only allow requests from your specific app's URL (e.g., `https://your-app.vercel.app`).

---

### #5 — Canvas API tokens are stored in an insecure location in the browser

**File:** `src/utils/canvasAPI.ts` (localStorage usage throughout)

**What's happening:**
When a user connects their Canvas account, their Canvas API token is saved in the browser's `localStorage`. This is like writing your house key on a sticky note and putting it on your door.

**Why this is a problem:**
Any JavaScript code running on the same page can read `localStorage`. If your app ever has an XSS vulnerability (see issues #13 and #17 below), an attacker could steal every user's Canvas token. With a Canvas token, an attacker can impersonate that user on Canvas — read their grades, submit assignments, send messages, etc.

**What needs to be fixed:**
Tokens should ideally be stored in `httpOnly` cookies (which JavaScript cannot read), or at minimum the app should not store the raw token in a readable location. This is a larger architectural change.

---

### #6 — The AI (OpenAI) endpoints have no authentication

**File:** `src/supabase/functions/server/index.tsx` — AI-related endpoints

**What's happening:**
Your server has endpoints that call OpenAI's API (for the course analysis feature). These endpoints currently have no authentication check — anyone who finds the URL can trigger AI requests.

**Why this is a problem:**
OpenAI charges per request. If someone discovers your server URL, they could write a script that sends thousands of requests per minute, costing you significant money on your OpenAI bill without you noticing.

**What needs to be fixed:**
Add authentication checks before any endpoint that calls OpenAI. Only logged-in users with a valid Canvas token should be able to trigger AI analysis.

---

### #7 — The Canvas API proxy has no authentication

**File:** `src/supabase/functions/server/index.tsx` — Canvas proxy endpoints

**What's happening:**
Your server acts as a "proxy" — it receives requests from your app, adds the Canvas API token, and forwards them to Canvas. There's no check that the person asking is actually a legitimate user of your app.

**Why this is a problem:**
Someone could send crafted requests to your server pretending to be a Canvas user and attempt to extract course data, or use your server as a relay to attack Canvas accounts.

**What needs to be fixed:**
The Canvas token itself is the credential here, but the server should validate that the token is present and properly formatted before forwarding requests.

---

### #8 — No limit on how many requests one person can send

**File:** `src/supabase/functions/server/index.tsx` (entire file)

**What's happening:**
There is no rate limiting on your server. Rate limiting means "one person can only make X requests per minute."

**Why this is a problem:**
Without rate limiting, a single person (or automated script) can flood your server with thousands of requests simultaneously. This can:
- Max out your Supabase Edge Function quota
- Run up your OpenAI bill
- Make the service slow or unavailable for legitimate users

**What needs to be fixed:**
Add rate limiting per user or per IP address. Supabase has built-in rate limiting features that can be enabled.

---

### #9 — No limit on OpenAI spending

**File:** `src/supabase/functions/server/index.tsx`

**What's happening:**
The server sends course content to OpenAI for analysis with no cap on how much content it will process in a given time period.

**Why this is a problem:**
A user (or attacker) could trigger analysis of extremely large courses repeatedly, potentially generating large OpenAI bills with no safeguard.

**What needs to be fixed:**
Set spending limits in your OpenAI dashboard, and add server-side limits on content size before sending to OpenAI.

---

## 🟡 MEDIUM Issues

### #10 — Canvas token validation is weak

**File:** `src/supabase/functions/server/index.tsx`

**What's happening:**
When your server receives a Canvas token, it does a basic check (looks for the word "Bearer" and checks the token isn't too short). It doesn't verify the token is actually valid by checking with Canvas.

**Why this is a problem:**
Malformed or garbage tokens can still partially get through validation, potentially causing unexpected errors or behavior.

**What needs to be fixed:**
Validate tokens by making a test API call to Canvas before processing any request.

---

### #11 — HTML content from Canvas is inserted directly into the page

**File:** `src/components/SimplifyDashboard.tsx` and related components

**What's happening:**
Canvas course content (descriptions, assignment instructions, etc.) can contain HTML. Your app uses `dangerouslySetInnerHTML` to display this content, which inserts the raw HTML from Canvas directly into your page.

**Why this is a problem:**
If a Canvas course ever contained malicious JavaScript (either from a compromised Canvas account or a bad actor with edit access), that script would run in your app. This is called an XSS (Cross-Site Scripting) attack.

**What needs to be fixed:**
"Sanitize" the HTML before displaying it — strip out any `<script>` tags or event handlers. Libraries like `DOMPurify` do this automatically.

---

### #12 — Course ID is passed to Canvas without validation

**File:** `src/supabase/functions/server/index.tsx`

**What's happening:**
When your app requests data for a specific course, it sends the course ID to your server, which then passes it directly to Canvas in the URL. There's no check that the course ID is actually a valid number.

**Why this is a problem:**
If someone sends a crafted course ID containing special characters or path traversal sequences (like `../`), it could potentially cause unexpected behavior in how the URL is constructed.

**What needs to be fixed:**
Validate that courseId is a valid integer before using it in any URL.

---

### #13 — No CSRF protection

**File:** `src/supabase/functions/server/index.tsx`

**What's happening:**
CSRF (Cross-Site Request Forgery) protection means adding a secret token to every form or API request so the server can verify the request came from your app specifically.

**Why this is a problem:**
Without this, if someone tricks a logged-in user into visiting a malicious page, that page could send requests to your server that look like they came from your app.

**What needs to be fixed:**
This partially overlaps with fixing the CORS wildcard (Issue #4). Tightening CORS + adding authentication reduces this risk significantly.

---

### #14 — Sensitive information appears in browser logs

**File:** Multiple files — console.log statements throughout

**What's happening:**
The code has many `console.log` statements that print tokens, user data, course content, and API responses to the browser's developer console. (Example: `console.log("🔑 Token found in localStorage:", token)`)

**Why this is a problem:**
If a user is sharing their screen, doing a recorded tutorial, or has browser extensions that capture console logs, sensitive information could be inadvertently exposed.

**What needs to be fixed:**
Remove all `console.log` statements that output tokens, user data, or API responses before a production release.

---

## 🟢 LOW Issues

### #15 — Course content from Canvas could contain tracking scripts

**File:** Components that display Canvas content

**What's happening:**
This is an extension of Issue #11. Beyond XSS, some Canvas courses may embed tracking pixels or analytics scripts from third-party services.

**Why this is a problem:**
Low risk in practice since most Canvas instances sanitize content before storing it, but worth noting.

**What needs to be fixed:**
The DOMPurify sanitization fix from Issue #11 addresses this as well.

---

### #16 — No error boundary to prevent full app crashes

**File:** `src/App.tsx`

**What's happening:**
If a component crashes due to unexpected data from Canvas, the entire app breaks and shows a blank white page.

**Why this is a problem:**
While not a security issue per se, unexpected crashes can sometimes leak information about the app's internal structure in error messages.

**What needs to be fixed:**
Add React error boundaries around major sections of the app.

---

## Priority Order for Fixes

If a developer is working on this, here is the recommended fix order:

1. **Add authentication to all server endpoints** (Issues #1, #6, #7) — one change that fixes the three most critical issues
2. **Fix CORS to only allow your app's URL** (Issue #4) — quick config change
3. **Add rate limiting** (Issue #8) — prevents abuse and cost overruns
4. **Add OpenAI spending limits** (Issue #9) — do this in OpenAI dashboard today, no code needed
5. **Sanitize Canvas HTML with DOMPurify** (Issues #11, #15) — `npm install dompurify`, one-line fix per component
6. **Validate courseId as integer** (Issue #12) — one line of code
7. **Remove debug console.log statements** (Issue #14) — code cleanup
8. **Review database security rules in Supabase** (Issues #2, #3) — Supabase dashboard configuration

---

## A Note on Severity vs. Likelihood

"Critical" and "High" don't necessarily mean an attack is happening right now — they mean that if an attacker were to target your app, these would be the easiest ways in with the highest potential damage. For a small app in early stages, the practical risk depends heavily on whether anyone malicious knows the app exists. But as your user base grows, these become increasingly important to address.

---

*This document was generated by automated security analysis of the codebase as of February 2026. It should be reviewed by a qualified security professional before taking remediation action in a production environment.*
