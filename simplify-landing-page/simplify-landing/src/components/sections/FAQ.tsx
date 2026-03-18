"use client";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { SectionEyebrow, SectionHeadline, FadeUp } from "../ui/Section";

const faqs = [
  {
    q: "How is SIMPLIFY different from UDOIT?",
    a: "UDOIT scans native HTML content in Canvas, which is great \u2014 but it doesn\u2019t scan uploaded documents (PDFs, Word files), doesn\u2019t map findings to CVC-OEI or QM rubric elements, and offers limited auto-fix capabilities. SIMPLIFY does all of that in a single tool, plus adds equity rubric alignment and institutional dashboards.",
  },
  {
    q: "Does SIMPLIFY replace Ally?",
    a: "Ally is strong at scanning uploaded documents and providing alternative formats to students. SIMPLIFY complements or replaces Ally by adding course-wide HTML scanning, rubric-aligned reporting, one-click fixes, and course structure analysis. If you need student-facing alternative formats (e.g., audio versions of PDFs), Ally still provides that. For everything else, SIMPLIFY covers it.",
  },
  {
    q: "What rubrics does SIMPLIFY support?",
    a: "At launch, SIMPLIFY supports three frameworks: the CVC-OEI Course Design Rubric (Sections A-D), the Quality Matters Higher Education Rubric (8 Standards), and the Peralta Online Equity Rubric 3.0 (Elements E1-E8). You can run reports against any one rubric or all three simultaneously.",
  },
  {
    q: "Will SIMPLIFY change my course content without my approval?",
    a: "Never. Every auto-fix is previewed before you apply it. You can edit suggestions, skip issues, or dismiss them entirely. Bulk \u201CFix All\u201D operations show you exactly what will change before you confirm. And every fix is fully reversible \u2014 we maintain a complete change log with one-click rollback.",
  },
  {
    q: "How long does a scan take?",
    a: "A typical 16-week course with 50-100 content items scans in about 30 seconds. Larger courses with many uploaded documents may take 1-2 minutes. You can also schedule automatic weekly scans that run in the background and email you a summary report.",
  },
  {
    q: "Is student data accessed or stored?",
    a: "No. SIMPLIFY only accesses course content \u2014 pages, assignments, files, and structure. It never accesses student submissions, grades, or personal information. We are fully FERPA compliant and pursuing SOC 2 Type II certification.",
  },
  {
    q: "How does the pilot work?",
    a: "The free pilot gives you 60 days with up to 10 courses. Your institution\u2019s Canvas admin installs SIMPLIFY as an LTI tool (takes about 5 minutes). Faculty can then launch it from any course\u2019s navigation menu. No credit card required. At the end of the pilot, you can continue with an institutional license or simply uninstall.",
  },
  {
    q: "Does it work with other LMS platforms?",
    a: "SIMPLIFY launches with Canvas LMS support. Support for Moodle, Blackboard Ultra, and Brightspace is on our roadmap for 2027. If you\u2019re interested in a non-Canvas LMS, let us know \u2014 it helps us prioritize.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeUp>
          <SectionEyebrow>FAQ</SectionEyebrow>
          <SectionHeadline>Questions? We&apos;ve got answers.</SectionHeadline>
        </FadeUp>

        <FadeUp delay={0.1}>
          <Accordion.Root type="single" collapsible className="mt-10 text-left space-y-3">
            {faqs.map((f, i) => (
              <Accordion.Item
                key={i}
                value={`faq-${i}`}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <Accordion.Trigger className="flex items-center justify-between w-full px-6 py-4 text-left font-semibold text-slate-800 hover:bg-slate-50 transition-colors group">
                  <span>{f.q}</span>
                  <ChevronDown
                    size={18}
                    className="text-slate-400 accordion-chevron shrink-0 ml-4"
                  />
                </Accordion.Trigger>
                <Accordion.Content className="accordion-content overflow-hidden">
                  <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                    {f.a}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </FadeUp>
      </div>
    </section>
  );
}
