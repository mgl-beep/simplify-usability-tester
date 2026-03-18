"use client";
import { ShieldCheck, Lock, ServerOff } from "lucide-react";
import { SectionEyebrow, SectionHeadline, SectionDescription, FadeUp } from "../ui/Section";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "FERPA Compliant",
    desc: "SIMPLIFY only accesses course content — pages, assignments, files, and structure. It never touches student submissions, grades, or personal information.",
  },
  {
    icon: ServerOff,
    title: "No Data Stored",
    desc: "Your course content is analyzed in real time and never stored on our servers. Scan results stay in your browser's local storage — we don't keep copies.",
  },
  {
    icon: Lock,
    title: "No Data Shared",
    desc: "Your content is never shared with third parties, used for model training, or accessed by anyone outside your session. Your courses stay yours.",
  },
];

export default function Trust() {
  return (
    <section id="trust" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeUp>
          <SectionEyebrow>Privacy &amp; Security</SectionEyebrow>
          <SectionHeadline>Your data stays yours. Period.</SectionHeadline>
          <SectionDescription>
            SIMPLIFY is built with institutional trust in mind. We don&apos;t store
            your course content, we don&apos;t share it, and we&apos;re fully FERPA
            compliant.
          </SectionDescription>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-8 mt-4">
          {trustPoints.map((p, i) => (
            <FadeUp key={p.title} delay={i * 0.1}>
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow text-left h-full">
                <div className="w-12 h-12 rounded-xl bg-simplify-green-light flex items-center justify-center mb-5">
                  <p.icon size={24} className="text-simplify-green" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 font-[family-name:var(--font-plus-jakarta)]">
                  {p.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
