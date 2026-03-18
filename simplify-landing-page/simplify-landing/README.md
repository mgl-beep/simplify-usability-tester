# SIMPLIFY — Marketing Landing Page

Marketing site for **SIMPLIFY**, a Canvas LTI plug-in that scans entire courses for accessibility and usability issues, maps findings to the rubrics faculty already use (CVC-OEI, Quality Matters, Peralta Equity), and offers one-click fixes.

## About SIMPLIFY

SIMPLIFY replaces the patchwork of institutional accessibility tools (UDOIT, Ally, Pope Tech, built-in Canvas checker) with a single, unified experience. It is purpose-built for the California Community College ecosystem and designed to be adopted by any Canvas institution.

**Key capabilities:**
- Full-course scanning — pages, assignments, discussions, quizzes, files
- Rubric-aligned reporting against CVC-OEI (Sections A–D), QM (Standards 1–8), and Peralta (E1–E8)
- One-click auto-fixes for common issues (alt text, heading hierarchy, color contrast, table headers, link text)
- Institutional admin dashboards with trend reporting
- Equity and UDL checklists (Peralta rubric integration)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| UI | React 19, [Tailwind CSS 4](https://tailwindcss.com/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) validation |
| Icons | [Lucide React](https://lucide.dev/) |
| Components | [Radix UI](https://www.radix-ui.com/) (Accordion, Tabs) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or yarn / pnpm / bun)

### Install & Run

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/
│   ├── api/pilot-request/  # Pilot request form API route
│   ├── globals.css          # Global styles + Tailwind
│   ├── layout.tsx           # Root layout (fonts, metadata, SEO)
│   └── page.tsx             # Landing page (assembles all sections)
├── components/
│   ├── mockups/
│   │   └── DashboardMockup.tsx
│   ├── sections/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Problem.tsx
│   │   ├── Solution.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Rubrics.tsx
│   │   ├── Comparison.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Stats.tsx
│   │   ├── Pricing.tsx
│   │   ├── FAQ.tsx
│   │   ├── CTAForm.tsx
│   │   └── Footer.tsx
│   └── ui/
│       └── Section.tsx      # Shared section layout primitives
```

## Page Sections

| Section | Description |
|---|---|
| **Hero** | Headline, value prop, CTA, and interactive dashboard mockup |
| **Problem** | Pain points faculty face with fragmented accessibility tools |
| **Solution** | How SIMPLIFY unifies scanning, reporting, and fixing |
| **Features** | Core capabilities with visual breakdowns |
| **How It Works** | Step-by-step walkthrough of the user flow |
| **Rubrics** | Supported frameworks (CVC-OEI, QM, Peralta) |
| **Comparison** | Side-by-side comparison with existing tools |
| **Testimonials** | Faculty and staff quotes |
| **Stats** | Key impact metrics |
| **Pricing** | Three tiers — Pilot (free), Institution, Enterprise |
| **CTA Form** | Pilot request form with validation |
| **FAQ** | Common questions (accordion) |

## Deployment

Build and serve the production version:

```bash
npm run build
npm run start
```

The app can be deployed to any platform that supports Next.js — Vercel, AWS, Docker, etc.

## License

Proprietary. All rights reserved by Simplify Inc.
