"use client";
import { Check } from "lucide-react";
import { SectionEyebrow, SectionHeadline, FadeUp } from "../ui/Section";

const plans = [
  {
    name: "Pilot",
    price: "Free",
    period: "60 days, up to 10 courses",
    desc: "Try SIMPLIFY risk-free with your real courses.",
    features: [
      "Full-course scanning (HTML content)",
      "CVC-OEI + QM rubric reporting",
      "One-click fixes (alt text, headings, contrast, tables)",
      "PDF report export",
      "Email support",
    ],
    cta: "Start Free Pilot",
    featured: false,
  },
  {
    name: "Institution",
    price: "Custom",
    period: "per institution / per year",
    desc: "Full SIMPLIFY for your entire institution.",
    features: [
      "Everything in Pilot, plus:",
      "Document scanning (PDF, DOCX, PPTX)",
      "Peralta Equity rubric + UDL checks",
      "Institutional admin dashboard",
      "Scheduled scans + email summaries",
      "Dedicated onboarding + training",
      "Priority support + SLA",
    ],
    cta: "Request a Quote",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "multi-campus / district",
    desc: "For districts and multi-college systems.",
    features: [
      "Everything in Institution, plus:",
      "Multi-campus aggregate dashboards",
      "Custom rubric configurations",
      "API access + webhooks",
      "SSO integration (SAML/CAS)",
      "Dedicated success manager",
      "SOC 2 compliance documentation",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeUp>
          <SectionEyebrow>Pricing</SectionEyebrow>
          <SectionHeadline>
            Start with a free pilot. Scale when you&apos;re ready.
          </SectionHeadline>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-8 mt-12 items-stretch">
          {plans.map((p, i) => (
            <FadeUp key={p.name} delay={i * 0.1}>
              <div
                className={`relative flex flex-col rounded-2xl border p-8 text-left h-full transition-shadow ${
                  p.featured
                    ? "border-simplify-blue shadow-xl scale-[1.02] bg-white"
                    : "border-slate-200 shadow-sm bg-white hover:shadow-md"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-simplify-blue px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}

                <h3 className="text-xl font-bold text-slate-900 font-[family-name:var(--font-plus-jakarta)]">
                  {p.name}
                </h3>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-slate-900 font-[family-name:var(--font-plus-jakarta)]">
                    {p.price}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{p.period}</p>
                <p className="text-slate-600 mt-4 mb-6">{p.desc}</p>

                <ul className="space-y-3 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Check size={16} className="text-simplify-green mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#cta"
                  className={`mt-8 block text-center font-semibold py-3 rounded-lg transition-all ${
                    p.featured
                      ? "bg-simplify-blue text-white hover:bg-simplify-blue-dark shadow-sm"
                      : "border-2 border-simplify-blue text-simplify-blue hover:bg-simplify-blue hover:text-white"
                  }`}
                >
                  {p.cta}
                </a>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
