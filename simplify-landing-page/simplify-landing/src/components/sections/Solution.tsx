"use client";
import { SectionEyebrow, SectionHeadline, SectionDescription, FadeUp } from "../ui/Section";
import DashboardMockup from "../mockups/DashboardMockup";

export default function Solution() {
  return (
    <section id="solution" className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeUp>
          <SectionEyebrow>The Solution</SectionEyebrow>
          <SectionHeadline>One scan. Every rubric. One-click fixes.</SectionHeadline>
          <SectionDescription>
            SIMPLIFY replaces your patchwork of tools with a single Canvas
            plug-in that scans your entire course, reports issues in the rubric
            language you already use, and fixes the most common problems
            automatically.
          </SectionDescription>
        </FadeUp>

        <FadeUp delay={0.15}>
          <div className="max-w-3xl mx-auto">
            <DashboardMockup />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
