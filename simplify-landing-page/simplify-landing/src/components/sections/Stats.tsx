"use client";
import { useEffect, useRef, useState } from "react";
import { FadeUp } from "../ui/Section";

const stats = [
  { target: 50, suffix: "%", label: "Less time on accessibility remediation" },
  { target: 40, suffix: "%+", label: "Of issues auto-fixed with one click" },
  { target: 35, suffix: "+", label: "Scan rules mapped across 3 rubrics" },
  { target: 30, suffix: " sec", label: "Average full-course scan time" },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 2000;
          const start = performance.now();
          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-extrabold font-[family-name:var(--font-plus-jakarta)]">
      {value}
      {suffix}
    </div>
  );
}

export default function Stats() {
  return (
    <section id="stats" className="py-16 md:py-20 bg-gradient-to-r from-simplify-blue-dark to-simplify-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center text-white">
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.08}>
              <Counter target={s.target} suffix={s.suffix} />
              <p className="text-sm text-blue-200 mt-2 max-w-[180px] mx-auto leading-snug">{s.label}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
