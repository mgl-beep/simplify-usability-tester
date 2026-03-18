import { X, Shield, Lock, Eye, Database, Cloud, Server } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

interface PrivacyStatementProps {
  isOpen: boolean;
  onClose: () => void;
}

const sections = [
  {
    icon: Eye,
    color: "#0071e3",
    title: "What We Access",
    items: [
      "Course pages, assignments, and module structure (instructor-authored content only)",
      "Course announcements and discussion topic titles",
      "File metadata (names, types — not file contents)",
    ],
  },
  {
    icon: Lock,
    color: "#ff3b30",
    title: "What We Never Access",
    items: [
      "Student names, emails, or any personally identifiable information",
      "Student submissions, grades, or performance data",
      "Student discussion posts or replies",
      "Enrollment rosters or attendance records",
      "Quiz responses or assessment attempts",
    ],
  },
  {
    icon: Database,
    color: "#ff9500",
    title: "How Data Is Stored",
    items: [
      "All scan results are stored locally in your browser — not on our servers",
      "Your Canvas API token is stored in your browser session only and cleared when you close the tab",
      "No course content is permanently stored on any SIMPLIFY server",
      "No student data is collected, stored, or transmitted at any point",
    ],
  },
  {
    icon: Cloud,
    color: "#5856d6",
    title: "AI Processing",
    items: [
      "AI suggestions (alt text, objectives, content rewrites) are generated using instructor-authored content only",
      "No student-generated content is ever sent to AI",
      "AI processing happens through our secure server — your Canvas token never reaches AI providers",
      "AI responses are not used to train models — we use OpenAI's API with data privacy protections",
    ],
  },
  {
    icon: Server,
    color: "#34c759",
    title: "Infrastructure & Security",
    items: [
      "All connections use HTTPS encryption",
      "Our server acts as a secure proxy — Canvas API calls never go directly from your browser",
      "Canvas tokens are validated and sanitized server-side",
      "Rate limiting protects against abuse",
      "No analytics, tracking pixels, or third-party cookies",
    ],
  },
];

export function PrivacyStatement({ isOpen, onClose }: PrivacyStatementProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[500px] !max-w-[90vw] p-0 gap-0 bg-white rounded-[20px] border-[#d2d2d7] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Privacy & Data</DialogTitle>
        <DialogDescription className="sr-only">How SIMPLIFY handles your data</DialogDescription>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#d2d2d7] bg-[#EEECE8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(52,199,89,0.15)" }}>
              <Shield className="w-4 h-4 text-[#34c759]" strokeWidth={2} />
            </div>
            <h2 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f]">
              Privacy & Data
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close privacy statement"
            className="w-8 h-8 rounded-full hover:bg-[#f2f2f7] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#636366]" strokeWidth={2} />
          </button>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 py-5 space-y-4">
            {/* FERPA Banner */}
            <div className="p-4 rounded-[10px] border border-[#34c759]/30" style={{ backgroundColor: "rgba(52,199,89,0.08)" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Shield className="w-4 h-4 text-[#34c759]" strokeWidth={2} />
                <p className="text-[14px] font-semibold text-[#1d1d1f]">FERPA Compliant by Design</p>
              </div>
              <p className="text-[13px] text-[#636366] leading-relaxed pl-[24px]">
                SIMPLIFY analyzes instructor-authored course content for accessibility and quality.
                It never accesses, stores, or transmits student data of any kind.
              </p>
            </div>

            {/* Sections — title inside card for consistent padding */}
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title} className="p-4 rounded-[10px] border border-[#d2d2d7]" style={{ backgroundColor: "rgba(238,236,232,0.5)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4" style={{ color: section.color }} strokeWidth={1.5} />
                    <p className="text-[13px] font-semibold text-[#1d1d1f]">{section.title}</p>
                  </div>
                  <div className="space-y-2 pl-[24px]">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0" style={{ backgroundColor: section.color, opacity: 0.5 }} />
                        <p className="text-[13px] text-[#636366] leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#d2d2d7] bg-[#EEECE8] flex items-center justify-between">
          <a
            href="mailto:support@simplifylti.com"
            className="flex items-center h-[32px] px-4 rounded-full border border-[#d2d2d7] bg-white hover:border-[#0071e3] text-[12px] font-medium text-[#1d1d1f] hover:text-[#0071e3] transition-colors"
          >
            Email Support
          </a>
          <button
            onClick={onClose}
            className="h-[32px] px-4 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
