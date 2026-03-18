import { useState } from "react";
import { X, ChevronDown, Monitor, Key, RefreshCw, AlertCircle, MessageCircle, Heart, GraduationCap, Zap, Rocket, Users } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback?: () => void;
  onOpenAIHelp?: () => void;
}

const faqSections = [
  {
    category: "GETTING STARTED",
    questions: [
      {
        q: "How do I scan a course?",
        a: "Click \"Scan Course\" in the header, select your course, and SIMPLIFY scans every page, module, and assignment automatically."
      },
      {
        q: "What standards does SIMPLIFY check?",
        a: "CVC-OEI, Quality Matters (QM), Peralta Equity rubric, and WCAG 2.1 AA accessibility."
      },
      {
        q: "Do I need to connect to Canvas first?",
        a: "Yes — enter your Canvas URL and API token in the connection screen. Your credentials are stored locally."
      }
    ]
  },
  {
    category: "STANDARDS",
    questions: [
      {
        q: "What is CVC-OEI?",
        a: "The California Virtual Campus – Online Education Initiative course design rubric. It covers 52 criteria across sections A–D including course design, interaction, assessment, and accessibility. Required for California Community College online courses.",
        link: { label: "View the full rubric →", url: "https://cvc.edu/wp-content/uploads/2018/10/CVC-OEI-Course-Design-Rubric-rev.10.2018.pdf" }
      },
      {
        q: "What is the Peralta rubric?",
        a: "The Peralta Online Equity Rubric focuses on inclusive and equitable course design. It has 38 criteria emphasizing culturally responsive pedagogy, accessible content, and student-centered learning.",
        link: { label: "View the full rubric →", url: "https://www.peralta.edu/hubfs/Peralta-Online-Equity-Rubric-3.0-Oct-2020.pdf" }
      },
      {
        q: "What is Quality Matters?",
        a: "Quality Matters (QM) is a nationally recognized quality assurance framework for online and blended courses. The Higher Education Rubric (7th Edition) has 43 criteria covering learning objectives, assessment, materials, and learner support.",
        link: { label: "View the full rubric →", url: "https://www.qualitymatters.org/sites/default/files/PDFs/StandardsfromtheQMHigherEducationRubric.pdf" }
      }
    ]
  },
  {
    category: "SEVERITY LEVELS",
    questions: [
      {
        q: "What does High severity mean?",
        a: "High severity issues (−10 pts each) block access for some users or violate a core compliance standard. These must be fixed before publishing. Examples: missing alt text on images, broken links, insufficient color contrast, no captions on HTML5 video."
      },
      {
        q: "What does Medium severity mean?",
        a: "Medium severity issues (−5 pts each) reduce usability or fail a rubric standard, but don't completely block access. You should fix these. Examples: vague learning objectives, no rubric on graded assignments, color used as the only way to convey information."
      },
      {
        q: "What does Low severity mean?",
        a: "Low severity issues (−2 pts each) are best practice recommendations that improve the student experience. Fix these when you can. Examples: long paragraphs (150+ words), small font sizes, too many different fonts, brief assignment instructions."
      }
    ]
  },
  {
    category: "FIXING ISSUES",
    questions: [
      {
        q: "How do I fix an issue?",
        a: "Click any issue to see AI-suggested fixes. Click \"Stage Fix\" to queue it, then \"Publish\" to apply it to Canvas."
      },
      {
        q: "Can I undo a fix?",
        a: "Staged fixes can be reverted before publishing. After publishing, re-scan to verify."
      },
      {
        q: "What does \"Stage Fix\" mean?",
        a: "Staging saves the fix locally without changing Canvas. You review staged fixes before publishing."
      }
    ]
  },
  {
    category: "ANALYTICS & REPORTS",
    questions: [
      {
        q: "What does the compliance score mean?",
        a: "A percentage: high severity issues = −10pts, medium = −5pts, low = −2pts from a base of 100."
      },
      {
        q: "Can I export a report?",
        a: "Yes — go to the Analytics tab, click \"Export PDF\" for a downloadable compliance report."
      }
    ]
  },
];

const troubleshooting = [
  {
    q: "Page won't load or shows a blank screen",
    a: "Try a hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows). If that doesn't work, clear your browser cache and reload.",
    icon: RefreshCw,
  },
  {
    q: "\"Canvas connection failed\" error",
    a: "Check that your Canvas URL is correct (e.g., yourschool.instructure.com) and that your API token hasn't expired. Go to Canvas → Account → Settings → New Access Token to generate a fresh one.",
    icon: Key,
  },
  {
    q: "Scan seems stuck or takes too long",
    a: "Large courses with many pages can take 1-2 minutes. If it exceeds 3 minutes, close the scan panel and try again. If the problem persists, try scanning a single course instead of 'All Courses'.",
    icon: AlertCircle,
  },
  {
    q: "AI suggestions aren't loading",
    a: "AI features rely on our server. If suggestions fail, wait a moment and try again. During high usage periods, there may be brief delays. The scan itself works independently of AI.",
    icon: AlertCircle,
  },
  {
    q: "Fix didn't publish to Canvas",
    a: "Make sure you clicked 'Publish to Canvas' after staging fixes. Check that your Canvas API token has edit permissions (not read-only). If you see an error, your token may have expired.",
    icon: Key,
  },
];

export function HelpCenter({ isOpen, onClose, onOpenFeedback, onOpenAIHelp }: HelpCenterProps) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex(prev => prev === key ? null : key);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[500px] !max-w-[90vw] p-0 gap-0 bg-white rounded-[20px] border-[#d2d2d7] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Help Center</DialogTitle>
        <DialogDescription className="sr-only">FAQ, troubleshooting, and support resources</DialogDescription>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#d2d2d7] bg-[#EEECE8] flex items-center justify-between">
          <h2 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f]">
            Help Center
          </h2>
          <button
            onClick={onClose}
            aria-label="Close help center"
            className="w-8 h-8 rounded-full hover:bg-[#f2f2f7] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#636366]" strokeWidth={2} />
          </button>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 py-5 space-y-6">
            {/* System Requirements */}
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-[#86868b] mb-3">SYSTEM REQUIREMENTS</p>
              <div className="p-4 rounded-[10px] border border-[#248a3d]/20" style={{ backgroundColor: "rgba(52,199,89,0.08)" }}>
                <div className="flex items-start gap-3">
                  <Monitor className="w-4 h-4 text-[#636366] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div className="space-y-1.5">
                    <p className="text-[13px] text-[#1d1d1f]"><span className="font-medium">Browser:</span> Chrome, Firefox, Safari, or Edge (latest version)</p>
                    <p className="text-[13px] text-[#1d1d1f]"><span className="font-medium">Canvas:</span> API access token with read/write permissions</p>
                    <p className="text-[13px] text-[#1d1d1f]"><span className="font-medium">Network:</span> Stable internet connection</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Sections */}
            {faqSections.map((section, si) => (
              <div key={si}>
                <p className="text-[11px] font-semibold tracking-[0.08em] text-[#86868b] mb-3">
                  {section.category}
                </p>
                <div className="space-y-0 border border-[#d2d2d7] rounded-[10px] overflow-hidden" style={{ backgroundColor: "rgba(238,236,232,0.5)" }}>
                  {section.questions.map((item, qi) => {
                    const key = `faq-${si}-${qi}`;
                    const isItemOpen = openIndex === key;
                    return (
                      <div key={key} className={qi > 0 ? "border-t border-[#d2d2d7]" : ""}>
                        <button
                          onClick={() => toggle(key)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#f9f9fb] transition-colors"
                        >
                          <span className="text-[13px] font-medium text-[#1d1d1f] pr-3">{item.q}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-[#86868b] shrink-0 transition-transform duration-200 ${isItemOpen ? "rotate-180" : ""}`}
                            strokeWidth={2}
                          />
                        </button>
                        <div
                          className="overflow-hidden transition-all duration-200"
                          style={{ maxHeight: isItemOpen ? 200 : 0, opacity: isItemOpen ? 1 : 0 }}
                        >
                          <p className="px-4 pb-3 text-[13px] text-[#636366] leading-relaxed">
                            {item.a}
                            {(item as any).link && (
                              <>
                                {" "}
                                <a href={(item as any).link.url} target="_blank" rel="noopener noreferrer" className="text-[#0071e3] font-medium hover:underline">
                                  {(item as any).link.label}
                                </a>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Troubleshooting */}
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-[#86868b] mb-3">TROUBLESHOOTING</p>
              <div className="border border-[#d2d2d7] rounded-[10px] overflow-hidden" style={{ backgroundColor: "rgba(238,236,232,0.5)" }}>
                {troubleshooting.map((item, i) => {
                  const key = `ts-${i}`;
                  const isItemOpen = openIndex === key;
                  const Icon = item.icon;
                  return (
                    <div key={i} className={i > 0 ? "border-t border-[#d2d2d7]" : ""}>
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#f9f9fb] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 pr-3">
                          <Icon className="w-3.5 h-3.5 text-[#86868b] flex-shrink-0" strokeWidth={1.5} />
                          <span className="text-[13px] font-medium text-[#1d1d1f]">{item.q}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-[#86868b] shrink-0 transition-transform duration-200 ${isItemOpen ? "rotate-180" : ""}`}
                          strokeWidth={2}
                        />
                      </button>
                      <div
                        className="overflow-hidden transition-all duration-200"
                        style={{ maxHeight: isItemOpen ? 200 : 0, opacity: isItemOpen ? 1 : 0 }}
                      >
                        <p className="px-4 pb-3 pl-[42px] text-[13px] text-[#636366] leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* About SIMPLIFY */}
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-[#86868b] mb-3">ABOUT SIMPLIFY</p>
              <div className="p-4 rounded-[10px] border border-[#d2d2d7] space-y-4" style={{ backgroundColor: "#fff" }}>
                <div className="flex items-start gap-2.5">
                  <Heart className="w-4 h-4 text-[#ff3b30] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-[13px] text-[#636366] leading-relaxed">
                    <span className="font-medium text-[#1d1d1f]">Our Mission</span> — Built by educators, for educators. Every student deserves an accessible learning experience, and every instructor deserves tools that make it achievable.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <GraduationCap className="w-4 h-4 text-[#0071e3] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-[13px] text-[#636366] leading-relaxed">
                    <span className="font-medium text-[#1d1d1f]">Built for Community Colleges</span> — Born from the real needs of California Community College faculty preparing CVC-OEI compliant courses.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-[#ff9500] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-[13px] text-[#636366] leading-relaxed">
                    <span className="font-medium text-[#1d1d1f]">What We Do</span> — Scan courses for accessibility issues, map to CVC-OEI/QM/Peralta standards, generate AI fix suggestions, and publish fixes to Canvas with one click.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Rocket className="w-4 h-4 text-[#5856d6] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-[13px] text-[#636366] leading-relaxed">
                    <span className="font-medium text-[#1d1d1f]">Our Commitment</span> — Actively developed with input from real faculty. Pursuing grant funding and institutional partnerships to keep SIMPLIFY sustainable.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-[#248a3d] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-[13px] text-[#636366] leading-relaxed">
                    <span className="font-medium text-[#1d1d1f]">The Team</span> — A focused, mission-driven project with deep roots in California higher education, working closely with pilot institutions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#d2d2d7] bg-[#EEECE8]">
          <div className="flex items-center justify-center gap-2.5">
            {onOpenFeedback && (
              <button
                onClick={() => { onClose(); onOpenFeedback(); }}
                className="flex items-center gap-1.5 h-[32px] px-4 rounded-full border border-[#d2d2d7] bg-white hover:border-[#5856d6] text-[12px] font-medium text-[#5856d6] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                Send Feedback
              </button>
            )}
            {onOpenAIHelp && (
              <button
                onClick={() => { onClose(); onOpenAIHelp(); }}
                className="flex items-center gap-1.5 h-[32px] px-4 rounded-full border border-[#d2d2d7] bg-white hover:border-[#248a3d] text-[12px] font-medium text-[#248a3d] transition-colors"
              >
                Ask AI
              </button>
            )}
            <a
              href="mailto:support@simplifylti.com"
              className="flex items-center gap-1.5 h-[32px] px-4 rounded-full border border-[#d2d2d7] bg-white hover:border-[#0071e3] text-[12px] font-medium text-[#0071e3] transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
