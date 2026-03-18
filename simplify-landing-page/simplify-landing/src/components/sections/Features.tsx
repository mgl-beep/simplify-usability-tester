"use client";
import { ScanSearch, BookOpen, Wand2, BarChart3, Check } from "lucide-react";
import { SectionEyebrow, FadeUp } from "../ui/Section";
import { ReactNode } from "react";

const features = [
  {
    icon: ScanSearch,
    eyebrow: "Course Scanner",
    title: "Full-course scan in seconds",
    desc: "SIMPLIFY scans every page, assignment, discussion, quiz, syllabus, and uploaded document in your course. Not just the page you\u2019re editing \u2014 everything, all at once.",
    bullets: [
      "WCAG 2.1 AA compliance checks on all HTML content",
      "PDF, DOCX, and PPTX document accessibility analysis",
      "Broken link detection across your entire course",
      "Course structure validation (modules, navigation, welcome page)",
    ],
    mockup: <ScanMockup />,
  },
  {
    icon: BookOpen,
    eyebrow: "Rubric-Aligned Reports",
    title: "Reports that speak your rubric\u2019s language",
    desc: "SIMPLIFY maps every issue directly to the CVC-OEI, Quality Matters, or Peralta rubric standards your institution uses — so you always know exactly where you stand.",
    bullets: [
      "Choose your rubric: CVC-OEI, QM, Peralta, or all three",
      "Issues grouped by rubric section (not WCAG success criteria)",
      "Element-level scoring: Aligned / Partially Aligned / Not Aligned",
      "Export PDF reports ready for peer course review submission",
    ],
    mockup: <ReportMockup />,
  },
  {
    icon: Wand2,
    eyebrow: "One-Click Fixes",
    title: "Don\u2019t just find problems \u2014 fix them",
    desc: "For the most common accessibility issues, SIMPLIFY offers automated fixes you can preview, edit, and apply without ever leaving the tool. Bulk operations let you fix entire categories at once.",
    bullets: [
      "AI-generated alt text suggestions (editable before applying)",
      "Heading hierarchy repair with live preview",
      "Color contrast fixes with compliant alternatives",
      'Table header insertion and link text improvements',
      '"Fix All" for batch operations \u2014 with full undo/rollback',
    ],
    mockup: <FixMockup />,
  },
  {
    icon: BarChart3,
    eyebrow: "Compliance Reports",
    title: "Generate reports ready for submission",
    desc: "Export professional compliance reports mapped to CVC-OEI, Quality Matters, or Peralta rubric standards. Share with peer course reviewers, department chairs, or keep for your own records.",
    bullets: [
      "PDF reports grouped by rubric section with pass/fail status",
      "Score breakdown by standard (Section A, B, C, D)",
      "Before-and-after evidence of fixes applied",
      "One-click export \u2014 ready for peer course review submission",
    ],
    mockup: <ComplianceReportMockup />,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {features.map((f, i) => {
          const reverse = i % 2 === 1;
          return (
            <div
              key={f.eyebrow}
              className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                i > 0 ? "mt-20 md:mt-28" : ""
              }`}
            >
              <FadeUp
                className={reverse ? "lg:order-2" : ""}
                delay={0}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-simplify-blue-light flex items-center justify-center mb-4">
                    <f.icon size={24} className="text-simplify-blue" />
                  </div>
                  <SectionEyebrow>{f.eyebrow}</SectionEyebrow>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-plus-jakarta)]">
                    {f.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed mb-6">{f.desc}</p>
                  <ul className="space-y-3">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-slate-600">
                        <Check
                          size={18}
                          className="text-simplify-green mt-0.5 shrink-0"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
              <FadeUp
                className={reverse ? "lg:order-1" : ""}
                delay={0.12}
              >
                {f.mockup}
              </FadeUp>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---- mini mockups ---- */
function MockupShell({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border bg-white shadow-lg overflow-hidden" style={{ borderColor: "#d2d2d7" }}>
      <div className="bg-slate-100 px-4 py-2 flex items-center gap-1.5 border-b" style={{ borderColor: "#d2d2d7" }}>
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
      </div>
      {children}
    </div>
  );
}

function ScanMockup() {
  const items = [
    { label: "Pages", count: "12/12", done: true },
    { label: "Assignments", count: "8/8", done: true },
    { label: "Discussions", count: "3/5", done: false },
    { label: "Quizzes", count: "0/4", done: false },
    { label: "Syllabus", count: "", done: true },
  ];
  return (
    <MockupShell>
      {/* Dark header */}
      <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: "#1c1917" }}>
        <span className="text-white font-bold text-xs tracking-wide">SIMPLIFY<span style={{ color: "#F59E0B" }}>.</span></span>
        <span className="text-stone-400 text-[10px]">|</span>
        <span className="text-stone-300 text-[10px]">Scanning BIO 101...</span>
      </div>
      <div className="p-4 space-y-2.5">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-3">
            <span className="text-sm text-stone-600 w-24 shrink-0">{it.label}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#EEECE8" }}>
              {it.done ? (
                <div className="h-full w-full rounded-full" style={{ backgroundColor: "#34c759" }} />
              ) : it.count === "3/5" ? (
                <div className="h-full rounded-full" style={{ width: "60%", backgroundColor: "#0071e3" }} />
              ) : (
                <div className="h-full rounded-full" style={{ width: "0%", backgroundColor: "#0071e3" }} />
              )}
            </div>
            <span className="text-xs text-stone-400 w-12 text-right shrink-0">
              {it.done ? (
                <span style={{ color: "#34c759" }} className="font-semibold">{it.count || ""} &#10003;</span>
              ) : (
                <span>{it.count}</span>
              )}
            </span>
          </div>
        ))}
        <div className="pt-1 text-[11px] text-stone-400">23 of 29 items scanned...</div>
      </div>
    </MockupShell>
  );
}

function ReportMockup() {
  const standardFilters = [
    { label: "CVC-OEI", active: true, bg: "#FFF7ED", text: "#EA580C", border: "#FDBA74" },
    { label: "QM", active: false, bg: "#EFF6FF", text: "#2563EB", border: "#93C5FD" },
    { label: "Peralta", active: false, bg: "#F0FDF4", text: "#16A34A", border: "#86EFAC" },
  ];
  const rows = [
    { standard: "D.3", desc: "Images have descriptive alt text", issues: 3, severity: "High", color: "#ff3b30", bg: "#FEE2E2" },
    { standard: "D.5", desc: "Color contrast meets 4.5:1", issues: 2, severity: "Medium", color: "#ff9500", bg: "#FEF3C7" },
    { standard: "D.7", desc: "Headings are properly structured", issues: 1, severity: "Low", color: "#92400E", bg: "#FEF9C3" },
    { standard: "A.2", desc: "Learning objectives are measurable", issues: 2, severity: "Medium", color: "#ff9500", bg: "#FEF3C7" },
  ];
  return (
    <MockupShell>
      <div className="p-4">
        {/* Standards filter pills */}
        <div className="flex items-center gap-2 mb-3">
          {standardFilters.map((s) => (
            <span
              key={s.label}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-pointer"
              style={{
                backgroundColor: s.active ? s.bg : "transparent",
                color: s.active ? s.text : "#a1a1aa",
                border: `1px solid ${s.active ? s.border : "#d2d2d7"}`,
              }}
            >
              {s.label}
            </span>
          ))}
        </div>

        {/* Issue rows */}
        <div className="space-y-0">
          {rows.map((r) => (
            <div
              key={r.standard}
              className="flex items-center justify-between py-2 border-b last:border-0"
              style={{ borderColor: "#d2d2d7" }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-bold text-stone-500 shrink-0">{r.standard}</span>
                <span className="text-sm text-stone-600 truncate">{r.desc}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-[10px] text-stone-400">{r.issues} issues</span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: r.bg, color: r.color }}
                >
                  {r.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MockupShell>
  );
}

function FixMockup() {
  return (
    <MockupShell>
      {/* Header with severity badge */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-stone-800">Missing Alt Text</span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#FEE2E2", color: "#ff3b30" }}
          >
            High
          </span>
        </div>
        <div className="text-[11px] text-stone-400 flex items-center gap-1">
          <span>&#128218;</span> BIO 101 &rsaquo; Module 3 &rsaquo; Cell Structure
        </div>
      </div>

      {/* Standards bar */}
      <div className="mx-4 mb-3 px-3 py-1.5 rounded-lg flex items-center gap-2" style={{ background: "linear-gradient(135deg, #FFF7ED, #EFF6FF)" }}>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FFF7ED", color: "#EA580C", border: "1px solid #FDBA74" }}>
          CVC-OEI: D3
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", border: "1px solid #86EFAC" }}>
          Peralta: E4
        </span>
      </div>

      {/* Plant cell image */}
      <div className="mx-4 mb-3">
        <div
          className="w-full rounded-lg overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: "#FAFAF9", border: "1px solid #d2d2d7" }}
        >
          <img
            src="/plant-cell.png"
            alt=""
            className="w-full max-h-60 object-contain p-1"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* AI suggestion — alt text */}
      <div className="mx-4 mb-2">
        <div className="text-[10px] text-stone-400 mb-1 flex items-center gap-1">
          <span>&#10024;</span> Suggested Alt Text
        </div>
        <div
          className="text-sm text-stone-600 rounded-lg p-3 italic"
          style={{ backgroundColor: "#FAFAF9", border: "1px solid #d2d2d7" }}
        >
          &ldquo;Diagram of plant cell showing chloroplasts, mitochondria, and cell wall&rdquo;
        </div>
      </div>

      {/* AI suggestion — equivalent text description for complex image */}
      <div className="mx-4 mb-3">
        <div className="text-[10px] text-stone-400 mb-1 flex items-center gap-1">
          <span>&#128203;</span> Suggested Text Description <span className="text-[9px] ml-1 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#EFF6FF", color: "#2563EB", border: "1px solid #93C5FD" }}>Complex Image</span>
        </div>
        <div
          className="text-xs text-stone-500 rounded-lg p-3 leading-relaxed"
          style={{ backgroundColor: "#FAFAF9", border: "1px solid #d2d2d7" }}
        >
          &ldquo;This diagram illustrates the internal structure of a typical plant cell, labeling the cell wall, cell membrane, chloroplasts (where photosynthesis occurs), mitochondria (energy production), central vacuole, nucleus, and endoplasmic reticulum. Arrows indicate the flow of energy between organelles.&rdquo;
        </div>
      </div>

      {/* Save button */}
      <div className="px-4 pb-4">
        <span
          className="inline-block text-xs font-semibold text-white px-5 py-2 rounded-[10px]"
          style={{ backgroundColor: "#0071e3" }}
        >
          Save &amp; Close
        </span>
      </div>
    </MockupShell>
  );
}

function ComplianceReportMockup() {
  return (
    <MockupShell>
      <div className="p-4">
        {/* Report header */}
        <div className="text-sm font-bold text-stone-800 mb-1">Compliance Report — BIO 101</div>
        <div className="text-[11px] text-stone-400 mb-3">Generated Mar 10, 2026</div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Score", value: "87/100" },
            { label: "Issues", value: "14 found" },
            { label: "Auto-Fixed", value: "9" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg px-2.5 py-2 text-center"
              style={{ backgroundColor: "#EEECE8", border: "1px solid #d2d2d7" }}
            >
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">{s.label}</div>
              <div className="text-sm font-bold text-stone-700">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Standards breakdown */}
        <div className="text-[11px] text-stone-400 uppercase tracking-wider mb-2">Standards Breakdown</div>
        <div className="space-y-1.5 mb-3">
          {[
            { label: "CVC-OEI Section D", pct: 78, color: "#EA580C", bg: "#FFF7ED" },
            { label: "CVC-OEI Section A", pct: 92, color: "#16A34A", bg: "#F0FDF4" },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <span className="text-xs text-stone-600 w-32 shrink-0 truncate">{row.label}</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#EEECE8" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                />
              </div>
              <span className="text-xs font-semibold text-stone-600 w-8 text-right">{row.pct}%</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <span
            className="text-xs font-semibold text-white px-4 py-1.5 rounded-lg"
            style={{ backgroundColor: "#0071e3" }}
          >
            Download PDF
          </span>
          <span
            className="text-xs font-medium text-stone-500 px-4 py-1.5 rounded-lg border"
            style={{ borderColor: "#d2d2d7" }}
          >
            Share Report
          </span>
        </div>
      </div>
    </MockupShell>
  );
}
