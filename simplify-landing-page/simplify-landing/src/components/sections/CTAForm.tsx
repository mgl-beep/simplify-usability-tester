"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle } from "lucide-react";
import { SectionHeadline, FadeUp } from "../ui/Section";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  institution: z.string().min(2, "Institution is required"),
  role: z.string().min(1, "Please select your role"),
  courses: z.string().optional(),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const roles = [
  "Faculty / Instructor",
  "Instructional Designer",
  "Accessibility Coordinator",
  "Department Chair",
  "Dean / VP of Instruction",
  "IT / Canvas Admin",
  "Other",
];

export default function CTAForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await fetch("/api/pilot-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // fail silently for demo
    }
    setSubmitted(true);
  };

  return (
    <section id="cta" className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left copy */}
          <FadeUp>
            <SectionHeadline>Ready to simplify accessibility?</SectionHeadline>
            <p className="text-slate-500 text-lg leading-relaxed mb-6">
              Join the pilot program and see how SIMPLIFY transforms your course
              cleanup workflow. Free for 60 days. No credit card required. Setup
              takes 5 minutes.
            </p>
            <ul className="space-y-3 text-slate-600">
              {[
                "Scan your real courses — not a demo sandbox",
                "CVC-OEI and QM rubric reports from day one",
                "One-click fixes for the most common issues",
                "Cancel anytime — no strings attached",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle size={18} className="text-simplify-green mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </FadeUp>

          {/* Right form */}
          <FadeUp delay={0.12}>
            {submitted ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-simplify-green-light flex items-center justify-center">
                  <CheckCircle size={32} className="text-simplify-green" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2 font-[family-name:var(--font-plus-jakarta)]">
                  You&apos;re in!
                </h3>
                <p className="text-slate-500">
                  Check your email for next steps. We&apos;ll have your pilot
                  ready within one business day.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-5"
                noValidate
              >
                <Field label="Full Name" error={errors.name?.message}>
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="Dr. Jane Smith"
                    className="input-field"
                    aria-describedby={errors.name ? "name-err" : undefined}
                  />
                </Field>

                <Field label="Work Email" error={errors.email?.message}>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="jsmith@college.edu"
                    className="input-field"
                    aria-describedby={errors.email ? "email-err" : undefined}
                  />
                </Field>

                <Field label="Institution" error={errors.institution?.message}>
                  <input
                    {...register("institution")}
                    type="text"
                    placeholder="Bay Area Community College"
                    className="input-field"
                    aria-describedby={errors.institution ? "institution-err" : undefined}
                  />
                </Field>

                <Field label="Your Role" error={errors.role?.message}>
                  <select
                    {...register("role")}
                    className="input-field"
                    defaultValue=""
                    aria-describedby={errors.role ? "role-err" : undefined}
                  >
                    <option value="" disabled>Select your role</option>
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>

                <Field label="How many courses?" required={false}>
                  <select {...register("courses")} className="input-field" defaultValue="">
                    <option value="">Select</option>
                    <option value="1-5">1-5</option>
                    <option value="6-20">6-20</option>
                    <option value="21-100">21-100</option>
                    <option value="100+">100+</option>
                  </select>
                </Field>

                <Field label="Anything else we should know?" required={false}>
                  <textarea
                    {...register("message")}
                    rows={3}
                    placeholder="E.g., we're preparing for POCR review, we currently use UDOIT..."
                    className="input-field resize-none"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-semibold text-white bg-simplify-blue py-3.5 rounded-lg hover:bg-simplify-blue-dark transition-colors shadow-sm disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting\u2026" : "Request Free Pilot \u2192"}
                </button>

                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  We respect your privacy. Your information is used only to set
                  up your pilot and will never be shared with third parties.
                </p>
              </form>
            )}
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  required = true,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-simplify-red ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-simplify-red mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
