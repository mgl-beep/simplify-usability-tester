import { X, ScanSearch, MessageCircle, FileText, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";

interface PilotWelcomeProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacy?: () => void;
}

const steps = [
  {
    icon: ScanSearch,
    color: "#0071e3",
    title: "Scan your course",
    desc: "Click \"Scan Course\" to analyze any Canvas course for accessibility and quality issues.",
  },
  {
    icon: Shield,
    color: "#34c759",
    title: "Review & fix issues",
    desc: "See AI-powered fix suggestions, stage them, and publish directly to Canvas.",
  },
  {
    icon: MessageCircle,
    color: "#5856d6",
    title: "Share your feedback",
    desc: "Use the Help menu to send us feedback — bugs, ideas, questions. We read everything.",
  },
  {
    icon: FileText,
    color: "#ff9500",
    title: "Complete our pilot survey",
    desc: "After exploring, we'll send a short survey to help us improve SIMPLIFY for everyone.",
  },
];

export function PilotWelcome({ isOpen, onClose, onOpenPrivacy }: PilotWelcomeProps) {
  const handleDismiss = () => {
    localStorage.setItem("simplify_pilot_welcome_seen", "1");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDismiss}>
      <DialogContent className="!w-[480px] !max-w-[90vw] p-0 gap-0 bg-white rounded-[20px] border-[#d2d2d7] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Welcome to the SIMPLIFY Pilot</DialogTitle>
        <DialogDescription className="sr-only">Overview of the pilot program</DialogDescription>

        {/* Header */}
        <div className="px-6 pt-8 pb-4 text-center" style={{ background: "linear-gradient(135deg, #0071e3 0%, #00b4d8 100%)" }}>
          <div className="w-16 h-16 rounded-[18px] bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 mt-[15px]">
            <Shield className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-[24px] font-bold text-white tracking-tight mb-1">
            Welcome to the SIMPLIFY Pilot
          </h2>
          <p className="text-[14px] text-white/80">
            Thank you for helping us improve online course accessibility.
          </p>
        </div>

        {/* Steps */}
        <div className="px-6 py-6 space-y-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: `${step.color}15` }}>
                  <Icon className="w-[18px] h-[18px]" style={{ color: step.color }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#1d1d1f] mb-0.5">{step.title}</p>
                  <p className="text-[13px] text-[#636366] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-8">
          <button
            onClick={handleDismiss}
            className="w-full h-[48px] rounded-[12px] text-white text-[16px] font-semibold transition-colors"
            style={{ background: "linear-gradient(135deg, #0071e3 0%, #00b4d8 100%)" }}
          >
            Get Started
          </button>
          <p className="text-[13px] text-[#86868b] text-center mt-4">
            Your data is private. We never access student information.{" "}
            <button onClick={() => { handleDismiss(); onOpenPrivacy?.(); }} className="text-[#0071e3] hover:underline">Learn more</button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
