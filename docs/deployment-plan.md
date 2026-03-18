# Deployment Plan

## App Architecture Summary

Simplify is a **pure frontend SPA** (React + Vite). The backend is already deployed:
- **Supabase Edge Functions** — handle Canvas proxy requests, AI calls, content storage
- **Canvas API** — called directly from the browser using the user's own token
- **OpenAI API** — called via Supabase Edge Functions (key is server-side, not exposed)

Deploying the app means **hosting the static `build/` folder** on a CDN. No server needed.

---

## Option 1: Vercel ⭐ Recommended

**Best fit for React/Vite. Zero config, deploys automatically from GitHub.**

### Pros
- Connects directly to your GitHub repo — every push to `main` auto-deploys
- Detects Vite automatically, no configuration file needed
- Preview deployments for every branch/PR (great for testing before releasing)
- Free tier is generous (100GB bandwidth/month)
- Environment variables set in the Vercel dashboard (not in code)
- Custom domain is one DNS record

### Cons
- Vendor lock-in (easy to migrate out, but worth knowing)
- Free tier has limits on team members for collaborative projects

### Deploy Steps
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select this repo → Vercel auto-detects Vite
3. Set environment variables in Project Settings → Environment Variables:
   - (Check if any `VITE_*` vars are needed beyond Supabase — see note below)
4. Click Deploy → done. Future pushes to `main` deploy automatically.
5. Optionally connect a custom domain (e.g., `simplify.yourdomain.com`)

---

## Option 2: Netlify

**Near-identical to Vercel. Slightly more manual setup for Vite.**

### Pros
- GitHub integration with auto-deploy
- Free tier (100GB bandwidth/month)
- Good environment variable management
- Has a form-handling feature (not needed here, but useful later)
- Slightly older/more established — some teams prefer it

### Cons
- Requires a `netlify.toml` config file to set build command and output dir
- Slightly slower build pipeline than Vercel in practice
- UI is a bit more cluttered

### Deploy Steps
1. Create `netlify.toml` in project root:
   ```toml
   [build]
     command = "npm run build"
     publish = "build"
   ```
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from GitHub
3. Set environment variables in Site Settings → Environment Variables
4. Deploy. Auto-deploys on every push to `main`.

---

## Option 3: Cloudflare Pages

**Best performance globally. Slightly more setup, most scalable long-term.**

### Pros
- Fastest CDN globally (Cloudflare's network — 300+ edge locations)
- Very generous free tier (unlimited bandwidth)
- Built-in DDoS protection
- If you ever add server-side logic, Cloudflare Workers integrate naturally
- Good for institutional/enterprise use cases (colleges may prefer Cloudflare's security reputation)

### Cons
- Build config requires manual setup (specify `npm run build` and `build` output dir)
- Environment variables UI is less intuitive than Vercel/Netlify
- Slightly longer initial setup

### Deploy Steps
1. Go to [pages.cloudflare.com](https://pages.cloudflare.com) → Create application → Pages → Connect to Git
2. Select repo → Set build settings:
   - Build command: `npm run build`
   - Build output directory: `build`
3. Add environment variables in Settings → Environment Variables
4. Deploy. Auto-deploys on push to `main`.

---

## Comparison Table

| | Vercel | Netlify | Cloudflare Pages |
|---|---|---|---|
| Setup time | ~5 min | ~10 min | ~15 min |
| Auto-deploy from GitHub | ✅ | ✅ | ✅ |
| Preview deployments | ✅ | ✅ | ✅ |
| Free bandwidth | 100 GB/mo | 100 GB/mo | Unlimited |
| CDN speed | Fast | Fast | Fastest |
| Vite support | Zero-config | Needs `netlify.toml` | Manual config |
| Best for | Fastest to ship | Familiar alternative | Scale / enterprise |

---

## Pre-Deployment Checklist

### Environment Variables
Vite `VITE_*` variables are **baked into the build bundle at compile time** — they are visible in the browser. Audit before deploying:

- [ ] Confirm no secret API keys are in `VITE_*` vars (OpenAI key should only be in Supabase Edge Functions)
- [ ] Confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are safe to expose (anon key is designed to be public)

Check current env vars:
```bash
grep -r "import.meta.env" src/ | grep -v ".test." | sort -u
```

### Canvas CORS
Canvas API calls are made directly from the browser. When deployed to a public domain, verify:
- [ ] Canvas does not block cross-origin requests from your deployed URL
- [ ] If Canvas blocks it, the Supabase Edge Function proxy (`make-server-74508696`) handles the request instead — confirm it's deployed and working

### SPA Routing
All three platforms handle SPA fallback (redirect all paths to `index.html`) automatically for Vite projects. No extra config needed.

### Custom Domain (optional)
Once deployed, you can point a domain like `simplify.yourdomain.com` with a CNAME record. All three platforms walk you through this in their dashboard.

---

## Recommendation

**Start with Vercel.** It's the fastest path from repo to live URL (~5 minutes), auto-deploys on every push, and has the best Vite support out of the box. You can migrate to Cloudflare Pages later if you need better global performance or enterprise-grade infrastructure.

---

## Incomplete Flags (Resume Later)

The following scanner flags were disabled before user testing and need to be finished before a full production release. Search `TODO: RESUME` in `cvcOeiRubricScanner.ts` to find all 4:

| Flag | Standard | Needs |
|---|---|---|
| No Anonymous Feedback Mechanism | CVC-OEI A11 | Better detection heuristics |
| Course Policies Incomplete | CVC-OEI A12, QM 5.1 | Syllabus fetching + AI fix |
| Student Services Links Missing Context | CVC-OEI A12/A13 | Smarter detection logic |
| Instructor Response Times Unclear | CVC-OEI B2/B3, QM 5.3 | Keyword detection + AI fix |
