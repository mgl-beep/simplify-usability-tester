"use client";
import { MousePointerClick, FileSearch, Sparkles } from "lucide-react";
import { SectionEyebrow, SectionHeadline, FadeUp } from "../ui/Section";

const steps = [
  {
    num: 1,
    icon: MousePointerClick,
    title: "Scan",
    desc: "Launch SIMPLIFY from your Canvas course navigation. Select your rubric(s) and click \u201CScan Course.\u201D We\u2019ll check everything in seconds.",
  },
  {
    num: 2,
    icon: FileSearch,
    title: "Review",
    desc: "See results organized by rubric section \u2014 not WCAG codes. Drill into any issue to see exactly what\u2019s wrong and where, with plain-language explanations.",
  },
  {
    num: 3,
    icon: Sparkles,
    title: "Fix",
    desc: "Apply one-click fixes for common issues, or follow guided instructions for everything else. Watch your score climb in real time.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeUp>
          <SectionEyebrow>How It Works</SectionEyebrow>
          <SectionHeadline>Three steps to a better course.</SectionHeadline>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-8 mt-12 relative">
          {/* connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16.7%] right-[16.7%] h-0.5 bg-slate-200" aria-hidden="true" />

          {steps.map((s, i) => (
            <FadeUp key={s.num} delay={i * 0.12}>
              <div className="relative flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-simplify-blue text-white flex items-center justify-center text-lg font-bold mb-5 z-10 shadow-md">
                  {s.num}
                </div>
                <div className="w-10 h-10 rounded-xl bg-simplify-blue-light flex items-center justify-center mb-3">
                  <s.icon size={20} className="text-simplify-blue" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2 font-[family-name:var(--font-plus-jakarta)]">
                  {s.title}
                </h3>
                <p className="text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {s.desc}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
