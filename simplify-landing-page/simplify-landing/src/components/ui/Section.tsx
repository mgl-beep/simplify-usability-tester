"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-simplify-blue font-semibold text-sm uppercase tracking-[0.15em] mb-3 block">
      {children}
    </span>
  );
}

export function SectionHeadline({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-slate-900 font-bold text-3xl md:text-4xl leading-tight mb-4 font-[family-name:var(--font-plus-jakarta)]">
      {children}
    </h2>
  );
}

export function SectionDescription({ children }: { children: ReactNode }) {
  return (
    <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-12">
      {children}
    </p>
  );
}

export function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
