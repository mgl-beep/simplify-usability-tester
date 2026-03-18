"use client";
import * as Tabs from "@radix-ui/react-tabs";
import { SectionEyebrow, SectionHeadline, SectionDescription, FadeUp } from "../ui/Section";

function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 w-40 shrink-0 text-left">{label}</span>
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-simplify-blue transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-slate-600 w-12 text-right">{pct}%</span>
    </div>
  );
}

function Badge({ type }: { type: "auto" | "checklist" | "both" }) {
  const styles = {
    auto: "bg-simplify-green-light text-simplify-green",
    checklist: "bg-simplify-amber-light text-simplify-amber",
    both: "bg-simplify-blue-light text-simplify-blue",
  };
  const labels = { auto: "Automated", checklist: "Guided Checklist", both: "Auto + Checklist" };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

export default function Rubrics() {
  return (
    <section id="rubrics" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeUp>
          <SectionEyebrow>Framework Alignment</SectionEyebrow>
          <SectionHeadline>Built on the rubrics you already trust.</SectionHeadline>
          <SectionDescription>
            Every scan rule in SIMPLIFY maps directly to one or more elements
            from these evidence-based course quality and equity frameworks.
          </SectionDescription>
        </FadeUp>

        <FadeUp delay={0.1}>
          <Tabs.Root defaultValue="cvc" className="max-w-3xl mx-auto">
            <Tabs.List className="flex border-b border-slate-200 mb-8 justify-center gap-6" aria-label="Rubric frameworks">
              {[
                { val: "cvc", label: "CVC-OEI" },
                { val: "qm", label: "Quality Matters" },
                { val: "peralta", label: "Peralta Equity" },
              ].map((t) => (
                <Tabs.Trigger
                  key={t.val}
                  value={t.val}
                  className="text-sm font-semibold text-slate-500 pb-3 border-b-2 border-transparent data-[state=active]:border-simplify-blue data-[state=active]:text-simplify-blue transition-colors px-2"
                >
                  {t.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Tabs.Content value="cvc" className="text-left space-y-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                California Virtual Campus — Online Education Initiative
              </p>
              <ul className="text-sm text-slate-600 space-y-1 mb-5 list-disc list-inside">
                <li>44 elements across 4 sections</li>
                <li>High automation for Section A &amp; D</li>
                <li>Medium coverage for B &amp; C with guided checklists</li>
                <li>PDF reports ready for peer course review submission</li>
              </ul>
              <div className="space-y-3">
                <Bar label="A: Content Presentation" pct={85} />
                <Bar label="B: Interaction" pct={50} />
                <Bar label="C: Assessment" pct={40} />
                <Bar label="D: Accessibility" pct={95} />
              </div>
            </Tabs.Content>

            <Tabs.Content value="qm" className="text-left space-y-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                QM Higher Education Rubric, 7th Edition
              </p>
              <ul className="text-sm text-slate-600 space-y-1 mb-5 list-disc list-inside">
                <li>8 General Standards, 44 Specific Review Standards</li>
                <li>Strong automation for Standard 8</li>
                <li>Automatable indicators for Standards 1-7</li>
                <li>PDF reports ready for peer course review submission</li>
              </ul>
              <div className="space-y-3">
                {[
                  { label: "1: Course Overview", pct: 60 },
                  { label: "2: Learning Objectives", pct: 45 },
                  { label: "3: Assessment", pct: 40 },
                  { label: "4: Instructional Materials", pct: 55 },
                  { label: "5: Learning Activities", pct: 35 },
                  { label: "6: Course Technology", pct: 50 },
                  { label: "7: Learner Support", pct: 60 },
                  { label: "8: Accessibility", pct: 95 },
                ].map((b) => (
                  <Bar key={b.label} label={b.label} pct={b.pct} />
                ))}
              </div>
            </Tabs.Content>

            <Tabs.Content value="peralta" className="text-left space-y-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                Peralta Online Equity Rubric 3.0
              </p>
              <ul className="text-sm text-slate-600 space-y-1 mb-5 list-disc list-inside">
                <li>8 equity elements (E1-E8)</li>
                <li>Automated checks for E1, E2, E3, and E8</li>
                <li>Guided self-assessment for E4-E7</li>
                <li>The only Canvas tool addressing equity rubric elements</li>
              </ul>
              <div className="space-y-3">
                {([
                  { label: "E1: Technology Access", type: "auto" as const },
                  { label: "E2: Student Resources", type: "auto" as const },
                  { label: "E3: UDL", type: "auto" as const },
                  { label: "E4: Diversity & Inclusion", type: "checklist" as const },
                  { label: "E5: Images & Representation", type: "checklist" as const },
                  { label: "E6: Human Bias", type: "checklist" as const },
                  { label: "E7: Content Meaning", type: "checklist" as const },
                  { label: "E8: Connection & Belonging", type: "both" as const },
                ]).map((e) => (
                  <div key={e.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-600">{e.label}</span>
                    <Badge type={e.type} />
                  </div>
                ))}
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </FadeUp>
      </div>
    </section>
  );
}
