import { X, Shield, GraduationCap, Heart, Rocket, Users, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

interface AboutSimplifyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutSimplify({ isOpen, onClose }: AboutSimplifyProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[500px] !max-w-[90vw] p-0 gap-0 bg-white rounded-[20px] border-[#d2d2d7] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">About SIMPLIFY</DialogTitle>
        <DialogDescription className="sr-only">Learn about the SIMPLIFY project</DialogDescription>

        {/* Header */}
        <div className="px-6 pt-7 pb-5 text-center" style={{ background: "linear-gradient(135deg, #0071e3 0%, #00b4d8 100%)" }}>
          <div className="w-14 h-14 rounded-[16px] bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-[22px] font-bold text-white tracking-tight mb-1">
            SIMPLIFY
          </h2>
          <p className="text-[13px] text-white/80">
            Accessibility & Quality Scanner for Canvas LMS
          </p>
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[55vh]">
          <div className="px-6 py-5 space-y-5">
            {/* Mission */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-[#ff3b30]" strokeWidth={1.5} />
                <p className="text-[14px] font-semibold text-[#1d1d1f]">Our Mission</p>
              </div>
              <p className="text-[13px] text-[#636366] leading-relaxed pl-[26px]">
                SIMPLIFY was built by educators, for educators. We believe every student deserves
                an accessible learning experience — and every instructor deserves tools that make
                that achievable without a Ph.D. in web accessibility.
              </p>
            </div>

            {/* Origin */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-[#0071e3]" strokeWidth={1.5} />
                <p className="text-[14px] font-semibold text-[#1d1d1f]">Built for Community Colleges</p>
              </div>
              <p className="text-[13px] text-[#636366] leading-relaxed pl-[26px]">
                Born from the real needs of California Community College faculty preparing
                CVC-OEI compliant courses. SIMPLIFY understands CVC-OEI, Quality Matters,
                Peralta Equity, and WCAG 2.1 AA standards — because those are the standards
                our faculty live with every day.
              </p>
            </div>

            {/* What we do */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#ff9500]" strokeWidth={1.5} />
                <p className="text-[14px] font-semibold text-[#1d1d1f]">What SIMPLIFY Does</p>
              </div>
              <div className="space-y-1.5 pl-[26px]">
                {[
                  "Scans your entire Canvas course for accessibility and quality issues",
                  "Maps every issue to CVC-OEI, Quality Matters, and Peralta rubric standards",
                  "Generates AI-powered fix suggestions you can review and apply",
                  "Publishes fixes directly to Canvas with one click",
                  "Creates compliance reports you can share with administrators",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#86868b] mt-[7px] flex-shrink-0" />
                    <p className="text-[13px] text-[#636366] leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Commitment */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-4 h-4 text-[#5856d6]" strokeWidth={1.5} />
                <p className="text-[14px] font-semibold text-[#1d1d1f]">Our Commitment</p>
              </div>
              <p className="text-[13px] text-[#636366] leading-relaxed pl-[26px]">
                We're actively developing SIMPLIFY with input from real faculty at California
                institutions. We're pursuing grant funding, institutional partnerships, and
                foundation support to ensure SIMPLIFY remains available and sustainable for
                the community college ecosystem.
              </p>
            </div>

            {/* Team */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#34c759]" strokeWidth={1.5} />
                <p className="text-[14px] font-semibold text-[#1d1d1f]">The Team</p>
              </div>
              <p className="text-[13px] text-[#636366] leading-relaxed pl-[26px]">
                SIMPLIFY is a focused, mission-driven project with deep roots in California
                higher education. We work closely with pilot institutions to ensure every
                feature solves a real problem for real instructors.
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#d2d2d7] bg-[#EEECE8] flex items-center justify-between">
          <p className="text-[12px] text-[#636366]">
            Version 1.0 Pilot
          </p>
          <button
            onClick={onClose}
            className="h-[32px] px-4 rounded-[8px] bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
