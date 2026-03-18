import { useState, useLayoutEffect, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ScanSearch, Zap, BarChart3, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion } from "framer-motion";

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  target: string | null;
  icon: React.ElementType;
  title: string;
  description: string;
}

const STEPS: TourStep[] = [
  {
    target: null,
    icon: ScanSearch,
    title: "Welcome to SIMPLIFY",
    description: "Scan your Canvas courses for accessibility and quality issues, then fix them with AI.",
  },
  {
    target: '[data-tour="scan-course"]',
    icon: ScanSearch,
    title: "Scan a Course",
    description: "Click this button to select a course from the dropdown. SIMPLIFY will scan every page, module, and assignment for issues.",
  },
  {
    target: '[data-tour="tab-overview"]',
    icon: Zap,
    title: "Review & Fix Issues",
    description: "After scanning, issues appear here sorted by severity. Click any issue for AI-powered fix suggestions.",
  },
  {
    target: '[data-tour="tab-analytics"]',
    icon: BarChart3,
    title: "Track Your Progress",
    description: "View compliance scores by standard and export PDF reports from the Analytics tab.",
  },
];

/* ── Reduced motion check ── */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/* ── Hook: measure a DOM element's position ── */
function useTargetRect(selector: string | null, isOpen: boolean, step: number) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const measure = useCallback(() => {
    if (!selector) { setRect(null); return; }
    const el = document.querySelector(selector);
    if (el) setRect(el.getBoundingClientRect());
  }, [selector]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(measure, 60);
    return () => clearTimeout(t);
  }, [isOpen, step, measure]);

  useEffect(() => {
    if (!isOpen || !selector) return;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [isOpen, selector, measure]);

  return rect;
}

/* ── Main component ── */
export function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const current = STEPS[step];
  const rect = useTargetRect(current.target, isOpen, step);
  const isCentered = !current.target;

  const next = () => (step === STEPS.length - 1 ? close() : setStep(step + 1));
  const back = () => setStep(step - 1);
  const close = () => { setStep(0); onClose(); };

  /* ── A11y: Save trigger + auto-focus dialog ── */
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
    return () => {
      if (!isOpen && triggerRef.current) {
        triggerRef.current.focus();
        triggerRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => dialogRef.current?.focus());
    }
  }, [isOpen, step]);

  /* ── A11y: Keyboard — Escape to close + focus trap ── */
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); return; }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, step]);

  if (!isOpen) return null;
  if (current.target && !rect) return null;

  /* ── Animation config — respects reduced motion ── */
  const noMotion = { duration: 0 };
  const fadeIn = reducedMotion ? noMotion : { duration: 0.25 };
  const slideIn = reducedMotion ? noMotion : { duration: 0.2, delay: 0.05 };
  const pathAnim = reducedMotion ? noMotion : { duration: 0.3, ease: "easeInOut" as const };
  const pulseAnim = reducedMotion
    ? { duration: 0, repeat: 0 as const }
    : { duration: 2, repeat: Infinity as const };

  /* Spotlight SVG */
  const pad = 10;
  const tooltipGap = current.target?.includes("tab-") ? 8 : 0;
  const r = 10;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const overlay = rect
    ? `M0 0H${W}V${H}H0Z M${rect.left - pad + r} ${rect.top - pad} H${rect.right + pad - r} Q${rect.right + pad} ${rect.top - pad} ${rect.right + pad} ${rect.top - pad + r} V${rect.bottom + pad - r} Q${rect.right + pad} ${rect.bottom + pad} ${rect.right + pad - r} ${rect.bottom + pad} H${rect.left - pad + r} Q${rect.left - pad} ${rect.bottom + pad} ${rect.left - pad} ${rect.bottom + pad - r} V${rect.top - pad + r} Q${rect.left - pad} ${rect.top - pad} ${rect.left - pad + r} ${rect.top - pad}Z`
    : `M0 0H${W}V${H}H0Z`;

  /* Tooltip position */
  let tooltipPos: React.CSSProperties;
  if (isCentered) {
    tooltipPos = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, margin: "auto", width: 400, height: "fit-content" };
  } else {
    const left = Math.max(16, Math.min(rect!.left + rect!.width / 2 - 108, W - 376));
    tooltipPos = { position: "fixed", top: rect!.bottom + pad + 14 + tooltipGap, left, width: 360 };
  }

  /* ── A11y-safe colors (all pass WCAG AA 4.5:1 on white) ── */
  const textDark = "#1d1d1f";   // 16.8:1
  const textBody = "#585860";   // 5.6:1
  const textMuted = "#636366";  // 5.0:1
  const accentBlue = "#0071e3"; // 4.6:1

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Onboarding tour: ${current.title}`}
      tabIndex={-1}
      style={{ position: "fixed", inset: 0, zIndex: 50000, outline: "none" }}
    >
      {/* Screen reader live region for step announcements */}
      <div aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
        {isCentered
          ? `${current.title}. ${current.description}`
          : `Step ${step} of ${STEPS.length - 1}: ${current.title}. ${current.description}`
        }
      </div>

      {/* Overlay — decorative, hidden from screen readers */}
      <motion.svg
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fadeIn}
      >
        <motion.path d={overlay} fill="rgba(0,0,0,0.55)" fillRule="evenodd" animate={{ d: overlay }} transition={pathAnim} />
      </motion.svg>

      {/* Pulsing ring — decorative */}
      {rect && (
        <motion.div
          aria-hidden="true"
          style={{ position: "fixed", top: rect.top - pad - 2, left: rect.left - pad - 2, width: rect.width + (pad + 2) * 2, height: rect.height + (pad + 2) * 2, borderRadius: r + 2, border: "2px solid rgba(0,113,227,0.4)", pointerEvents: "none", zIndex: 50001 }}
          animate={reducedMotion ? {} : { opacity: [0.4, 1, 0.4] }}
          transition={pulseAnim}
        />
      )}

      {/* Arrow — decorative, flush with card */}
      {rect && (
        <div aria-hidden="true" style={{ position: "fixed", top: rect.bottom + pad + tooltipGap, left: rect.left + rect.width / 2 - 14, width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderBottom: "14px solid white", zIndex: 50003 }} />
      )}

      {/* ── WELCOME CARD ── */}
      {isCentered && (
        <motion.div
          key="welcome"
          style={{ ...tooltipPos, zIndex: 50002 }}
          initial={reducedMotion ? {} : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={fadeIn}
        >
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
            <div style={{ padding: "44px 36px 16px", textAlign: "center" }}>
              <h2 id="tour-title" style={{ fontSize: 26, fontWeight: 700, color: textDark, margin: "0 0 20px", lineHeight: 1.2 }}>
                Welcome to SIMPLIFY<span aria-hidden="true" style={{ display: 'inline-block', width: 5, height: 5, backgroundColor: '#f5a623', borderRadius: 0, verticalAlign: 'baseline', position: 'relative', top: -1, marginLeft: -1 }}></span>
              </h2>
              <p id="tour-desc" style={{ fontSize: 17, color: textBody, lineHeight: 1.55, margin: 0 }}>
                Scan your Canvas courses for accessibility and quality issues,<br />then fix them with AI.
              </p>
            </div>
            <div style={{ padding: "16px 36px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <button
                onClick={close}
                style={{ fontSize: 16, fontWeight: 500, color: textMuted, background: "none", border: "none", cursor: "pointer", padding: "10px 16px" }}
              >
                Skip
              </button>
              <button
                onClick={next}
                style={{ fontSize: 16, fontWeight: 600, color: "#fff", backgroundColor: "#0071e3", border: "none", borderRadius: 12, padding: "12px 32px", cursor: "pointer" }}
              >
                Get Started
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── SPOTLIGHT TOOLTIP ── */}
      {!isCentered && (
        <motion.div
          key={`step-${step}`}
          style={{ ...tooltipPos, zIndex: 50002 }}
          initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={slideIn}
        >
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 16px 40px rgba(0,0,0,0.18)", position: "relative" }}>
            {/* Close X — clean, no outline */}
            <button
              onClick={close}
              aria-label="Close tour"
              style={{ position: "absolute", top: 14, right: 14, zIndex: 1, width: 24, height: 24, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
            >
              <X aria-hidden="true" style={{ width: 16, height: 16, color: textMuted }} strokeWidth={2} />
            </button>

            {/* Progress bar */}
            <div
              role="progressbar"
              aria-valuenow={step}
              aria-valuemin={1}
              aria-valuemax={STEPS.length - 1}
              aria-label={`Tour progress: step ${step} of ${STEPS.length - 1}`}
              style={{ height: 10, background: "#e5e5ea", borderRadius: "14px 14px 0 0", overflow: "hidden" }}
            >
              <div style={{ height: 10, background: "#f5a623", borderRadius: "0 5px 5px 0", width: `${((step) / (STEPS.length - 1)) * 100}%`, transition: reducedMotion ? "none" : "width 0.3s ease" }} />
            </div>

            {/* Step content */}
            <div style={{ padding: "22px 26px 12px", textAlign: "center" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: accentBlue, margin: "0 0 8px", letterSpacing: "0.03em", textTransform: "uppercase" as const }}>Step {step} of {STEPS.length - 1}</p>
              <h3 id="tour-step-title" style={{ fontSize: 19, fontWeight: 600, color: textDark, margin: "0 0 8px", lineHeight: 1.2 }}>{current.title}</h3>
              <p id="tour-step-desc" style={{ fontSize: 15, color: textBody, lineHeight: 1.5, margin: 0 }}>{current.description}</p>
            </div>

            {/* Nav */}
            <div style={{ padding: "10px 26px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                onClick={back}
                aria-label="Go to previous step"
                style={{ fontSize: 14, fontWeight: 500, color: textMuted, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, padding: "6px 0" }}
              >
                <ChevronLeft aria-hidden="true" style={{ width: 15, height: 15 }} /> Back
              </button>
              <button
                onClick={next}
                aria-label={step === STEPS.length - 1 ? "Finish tour" : "Go to next step"}
                style={{ fontSize: 14, fontWeight: 600, color: "#fff", backgroundColor: "#0071e3", border: "none", borderRadius: 10, padding: "9px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                {step === STEPS.length - 1 ? "Done" : "Next"} {step < STEPS.length - 1 && <ChevronRight aria-hidden="true" style={{ width: 15, height: 15 }} />}
              </button>
            </div>
          </div>
        </motion.div>
      )}

    </div>,
    document.body
  );
}
