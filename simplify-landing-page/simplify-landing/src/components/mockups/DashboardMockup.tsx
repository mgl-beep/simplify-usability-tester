"use client";
import { motion, useReducedMotion } from "framer-motion";

const statCards = [
  { label: "Score", value: "87", suffix: "/100" },
  { label: "Issues Found", value: "14", suffix: "" },
  { label: "Auto-Fixable", value: "9", suffix: "" },
  { label: "Published", value: "3", suffix: "" },
];

const standardsPills = [
  { label: "CVC-OEI", pct: 78, bg: "#FFF7ED", text: "#EA580C", border: "#FDBA74" },
  { label: "QM", pct: 82, bg: "#EFF6FF", text: "#2563EB", border: "#93C5FD" },
  { label: "Peralta", pct: 71, bg: "#F0FDF4", text: "#16A34A", border: "#86EFAC" },
];

const issues = [
  { title: "Missing Alt Text", severity: "High", color: "#ff3b30", bg: "#FEE2E2" },
  { title: "Low Color Contrast", severity: "Medium", color: "#ff9500", bg: "#FEF3C7" },
  { title: "Missing Learning Objectives", severity: "Low", color: "#92400E", bg: "#FEF9C3" },
];

export default function DashboardMockup({ className = "" }: { className?: string }) {
  const prefersReduced = useReducedMotion();
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden ${className}`}>
      {/* Browser chrome */}
      <div className="bg-slate-100 px-4 py-2.5 flex items-center gap-2 border-b border-slate-200">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-amber-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-slate-400 bg-white rounded px-3 py-0.5 flex-1 text-center truncate">
          simplifylti.com/course/bio-101
        </span>
      </div>

      {/* Dark header bar */}
      <div className="px-4 py-2.5 flex items-center gap-3" style={{ backgroundColor: "#1c1917" }}>
        <span className="text-white font-bold text-sm tracking-wide">SIMPLIFY<span style={{ color: "#F59E0B" }}>.</span></span>
        <span className="text-stone-400 text-xs">|</span>
        <span className="text-stone-300 text-xs truncate">BIO 101 — Intro to Biology</span>
      </div>

      {/* Stat cards on beige background */}
      <div className="px-4 py-3" style={{ backgroundColor: "#EEECE8" }}>
        <div className="grid grid-cols-4 gap-2">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              className="rounded-lg border bg-white px-2.5 py-2 text-center"
              style={{ borderColor: "#d2d2d7" }}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={
                prefersReduced
                  ? { duration: 0 }
                  : { delay: 0.3 + i * 0.1, duration: 0.4, ease: "easeOut" }
              }
            >
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">{card.label}</div>
              <div className="text-lg font-bold text-stone-800 leading-tight">
                {card.value}
                <span className="text-xs font-normal text-stone-400">{card.suffix}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Standards pills */}
      <div className="px-4 py-2.5 flex items-center gap-2 border-b" style={{ borderColor: "#d2d2d7" }}>
        <span className="text-[10px] text-stone-400 uppercase tracking-wider mr-1">Standards</span>
        {standardsPills.map((s, i) => (
          <motion.span
            key={s.label}
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={
              prefersReduced
                ? { duration: 0 }
                : { delay: 0.6 + i * 0.12, duration: 0.35, ease: "easeOut" }
            }
          >
            {s.label} {s.pct}%
          </motion.span>
        ))}
      </div>

      {/* Issue list */}
      <div className="px-4 py-3 space-y-0">
        {issues.map((issue, i) => (
          <motion.div
            key={issue.title}
            className="flex items-center justify-between py-2 border-b last:border-0"
            style={{ borderColor: "#d2d2d7" }}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={
              prefersReduced
                ? { duration: 0 }
                : { delay: 0.8 + i * 0.1, duration: 0.3, ease: "easeOut" }
            }
          >
            <span className="text-sm text-stone-700">{issue.title}</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: issue.bg, color: issue.color }}
            >
              {issue.severity}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 flex gap-2 border-t" style={{ borderColor: "#d2d2d7" }}>
        <span
          className="text-xs font-semibold text-white px-4 py-1.5 rounded-lg"
          style={{ backgroundColor: "#0071e3" }}
        >
          Fix All (9)
        </span>
        <span
          className="text-xs font-medium text-stone-500 px-4 py-1.5 rounded-lg border"
          style={{ borderColor: "#d2d2d7" }}
        >
          Export PDF
        </span>
      </div>
    </div>
  );
}
