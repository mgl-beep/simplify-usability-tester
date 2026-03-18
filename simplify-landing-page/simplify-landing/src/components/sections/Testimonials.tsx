"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SectionEyebrow, SectionHeadline, FadeUp } from "../ui/Section";

const testimonials = [
  {
    quote: "I used to spend an entire prep week running UDOIT and fixing things page by page. SIMPLIFY did my whole course in 30 seconds and fixed half the issues automatically. I got my weekend back.",
    author: "Dr. Maria Santos",
    role: "Biology Faculty",
    institution: "Bay Area Community College",
  },
  {
    quote: "The rubric-aligned reports are a game-changer for POCR. I can hand faculty a report that maps directly to the CVC-OEI elements instead of making them decode WCAG codes.",
    author: "James Chen",
    role: "Instructional Designer",
    institution: "Central Valley College District",
  },
  {
    quote: "For the first time, I can tell our accreditor exactly what percentage of our courses meet accessibility standards \u2014 and show them the improvement trend. That used to be a manual audit that took weeks.",
    author: "Dr. Aisha Thompson",
    role: "VP of Instruction",
    institution: "Southern California CC District",
  },
  {
    quote: "The Peralta equity checklists opened my eyes to things I wasn\u2019t even thinking about. It\u2019s not just about compliance \u2014 it\u2019s about whether my course actually works for all of my students.",
    author: "Prof. David Reyes",
    role: "English Faculty",
    institution: "Northern California College",
  },
];

export default function Testimonials() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  const next = useCallback(() => setIdx((i) => (i + 1) % count), [count]);
  const prev = () => setIdx((i) => (i - 1 + count) % count);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <section id="testimonials" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeUp>
          <SectionEyebrow>What Educators Say</SectionEyebrow>
          <SectionHeadline>Faculty love it. Admins trust it.</SectionHeadline>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div
            className="max-w-3xl mx-auto mt-12"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-live="polite"
          >
            <div className="relative bg-slate-50 rounded-2xl p-8 md:p-10 border border-slate-200">
              <Quote size={32} className="text-simplify-blue/20 mb-4 mx-auto" />
              <p className="text-lg md:text-xl text-slate-700 italic leading-relaxed mb-6">
                &ldquo;{testimonials[idx].quote}&rdquo;
              </p>
              <div>
                <div className="font-semibold text-slate-900">{testimonials[idx].author}</div>
                <div className="text-sm text-slate-500">
                  {testimonials[idx].role} &middot; {testimonials[idx].institution}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prev}
                className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={18} className="text-slate-500" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === idx ? "bg-simplify-blue" : "bg-slate-300"
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight size={18} className="text-slate-500" />
              </button>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
