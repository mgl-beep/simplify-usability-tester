"use client";
import { Check, Minus, CircleDot } from "lucide-react";
import { SectionEyebrow, SectionHeadline, FadeUp } from "../ui/Section";

type Val = "yes" | "no" | "partial";
interface Row {
  feature: string;
  simplify: Val;
  udoit: Val;
  ally: Val;
  pope: Val;
  canvas: Val;
}

const rows: Row[] = [
  { feature: "Full-course HTML scan", simplify: "yes", udoit: "yes", ally: "no", pope: "no", canvas: "no" },
  { feature: "Document scanning (PDF, DOCX)", simplify: "yes", udoit: "partial", ally: "yes", pope: "no", canvas: "no" },
  { feature: "Course structure analysis", simplify: "yes", udoit: "no", ally: "no", pope: "no", canvas: "no" },
  { feature: "CVC-OEI rubric alignment", simplify: "yes", udoit: "no", ally: "no", pope: "no", canvas: "no" },
  { feature: "Quality Matters alignment", simplify: "yes", udoit: "no", ally: "no", pope: "no", canvas: "no" },
  { feature: "Peralta Equity rubric", simplify: "yes", udoit: "no", ally: "no", pope: "no", canvas: "no" },
  { feature: "One-click auto-fixes", simplify: "yes", udoit: "partial", ally: "no", pope: "no", canvas: "no" },
  { feature: "AI-generated alt text", simplify: "yes", udoit: "no", ally: "no", pope: "no", canvas: "no" },
  { feature: "Bulk fix operations", simplify: "yes", udoit: "no", ally: "no", pope: "no", canvas: "no" },
  { feature: "Institutional dashboard", simplify: "yes", udoit: "no", ally: "partial", pope: "yes", canvas: "no" },
  { feature: "PDF report export (POCR/QM)", simplify: "yes", udoit: "no", ally: "no", pope: "no", canvas: "no" },
  { feature: "UDL content variety check", simplify: "yes", udoit: "no", ally: "no", pope: "no", canvas: "no" },
  { feature: "Equity self-assessment", simplify: "yes", udoit: "no", ally: "no", pope: "no", canvas: "no" },
  { feature: "Progress tracking over time", simplify: "yes", udoit: "no", ally: "partial", pope: "partial", canvas: "no" },
];

function Indicator({ val }: { val: Val }) {
  if (val === "yes") return <Check size={18} className="text-simplify-green mx-auto" />;
  if (val === "partial") return <CircleDot size={16} className="text-simplify-amber mx-auto" />;
  return <Minus size={16} className="text-slate-300 mx-auto" />;
}

export default function Comparison() {
  return (
    <section id="comparison" className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeUp>
          <SectionEyebrow>Why SIMPLIFY?</SectionEyebrow>
          <SectionHeadline>Everything you need. Nothing you don&apos;t.</SectionHeadline>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="overflow-x-auto mt-10 -mx-4 px-4">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-3 text-slate-500 font-medium">Feature</th>
                  <th className="py-3 px-3 text-simplify-blue font-bold bg-simplify-blue-light/40 rounded-t-lg">SIMPLIFY</th>
                  <th className="py-3 px-3 text-slate-500 font-medium">UDOIT</th>
                  <th className="py-3 px-3 text-slate-500 font-medium">Ally</th>
                  <th className="py-3 px-3 text-slate-500 font-medium">Pope Tech</th>
                  <th className="py-3 px-3 text-slate-500 font-medium">Canvas</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.feature} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="text-left py-3 px-3 text-slate-700">{r.feature}</td>
                    <td className="py-3 px-3 bg-simplify-blue-light/20"><Indicator val={r.simplify} /></td>
                    <td className="py-3 px-3"><Indicator val={r.udoit} /></td>
                    <td className="py-3 px-3"><Indicator val={r.ally} /></td>
                    <td className="py-3 px-3"><Indicator val={r.pope} /></td>
                    <td className="py-3 px-3"><Indicator val={r.canvas} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
