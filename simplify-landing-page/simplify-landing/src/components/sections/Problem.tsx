"use client";
import { Layers, Languages, MousePointerClick } from "lucide-react";
import { SectionEyebrow, SectionHeadline, SectionDescription, FadeUp } from "../ui/Section";

const painPoints = [
  {
    icon: Layers,
    title: "Tool Overload",
    desc: "UDOIT for HTML. Ally for documents. Pope Tech in the editor. The built-in checker for basics. You\u2019re running four tools that don\u2019t talk to each other.",
  },
  {
    icon: Languages,
    title: "Rubric Disconnect",
    desc: "Your POCR reviewer says \u201CSection D, Element 12.\u201D Your accessibility tool says \u201CWCAG 2.1 SC 1.3.1.\u201D You\u2019re left playing translator between two worlds.",
  },
  {
    icon: MousePointerClick,
    title: "Flag Without Fix",
    desc: "Most tools tell you what\u2019s wrong \u2014 then leave you to fix it manually, page by page, image by image, table by table. Who has time for that?",
  },
];

export default function Problem() {
  return (
    <section id="problem" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeUp>
          <SectionEyebrow>The Problem</SectionEyebrow>
          <SectionHeadline>
            Your courses deserve better than a patchwork of tools.
          </SectionHeadline>
          <SectionDescription>
            Faculty shouldn&apos;t need four different tools, three browser tabs,
            and a rubric spreadsheet just to make their courses accessible.
          </SectionDescription>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-8 mt-4">
          {painPoints.map((p, i) => (
            <FadeUp key={p.title} delay={i * 0.1}>
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow text-left h-full">
                <div className="w-12 h-12 rounded-xl bg-simplify-blue-light flex items-center justify-center mb-5">
                  <p.icon size={24} className="text-simplify-blue" />
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
