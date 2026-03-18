"use client";
import { motion, useReducedMotion } from "framer-motion";
import DashboardMockup from "../mockups/DashboardMockup";

export default function Hero() {
  const prefersReduced = useReducedMotion();
  const dur = prefersReduced ? 0 : undefined;

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden bg-gradient-to-b from-white to-slate-50">
      {/* faint dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #2563EB 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
        {/* Left — text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur ?? 0.6, ease: "easeOut" }}
        >
          <span className="text-slate-400 font-semibold text-sm uppercase tracking-[0.15em] mb-4 block">
            Canvas LTI Plug-in for Higher Education
          </span>

          <p className="text-simplify-blue font-semibold text-lg md:text-xl mb-3 tracking-tight">
            AI capability. Human integrity.
          </p>

          <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl md:text-5xl lg:text-[3.25rem] text-slate-900 leading-[1.1] mb-6">
            100% ADA compliance?{" "}
            <span className="text-simplify-blue">SIMPLIFY has your back</span> — for accessibility, and more.
          </h1>

          <p className="text-slate-600 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
            SIMPLIFY scans your entire Canvas course against the rubrics you
            already use — CVC-OEI, Quality Matters, and Peralta Equity — then
            fixes issues with one click.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <a
              href="#cta"
              className="inline-flex items-center justify-center font-semibold text-white bg-simplify-blue px-8 py-3.5 rounded-lg hover:bg-simplify-blue-dark transition-colors shadow-md hover:shadow-lg text-base"
            >
              Request a Pilot&nbsp;&rarr;
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center font-semibold text-simplify-blue hover:underline text-base py-3.5"
            >
              See How It Works&nbsp;&darr;
            </a>
          </div>

          {/* Social proof */}
          <div className="flex flex-col gap-3">
            <span className="text-sm text-slate-400 font-medium">
              Trusted by faculty at California Community Colleges
            </span>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-8 w-16 rounded-md bg-slate-200/70"
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right — mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: dur ?? 0.7, delay: dur === 0 ? 0 : 0.2, ease: "easeOut" }}
        >
          <DashboardMockup className="max-w-lg mx-auto lg:max-w-none" />
        </motion.div>
      </div>
    </section>
  );
}
