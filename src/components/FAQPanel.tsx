import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

interface FAQPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAIHelp?: () => void;
}

const faqData = [
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
  }
];

export function FAQPanel({ isOpen, onClose, onOpenAIHelp }: FAQPanelProps) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex(prev => prev === key ? null : key);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[500px] !max-w-[90vw] p-0 gap-0 bg-white rounded-[20px] border-[#d2d2d7] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Frequently Asked Questions</DialogTitle>
        <DialogDescription className="sr-only">Common questions about using SIMPLIFY</DialogDescription>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#d2d2d7] bg-[#EEECE8] flex items-center justify-between">
          <h2 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f]">
            Frequently Asked Questions
          </h2>
          <button
            onClick={onClose}
            aria-label="Close FAQ"
            className="w-8 h-8 rounded-full hover:bg-[#f2f2f7] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#636366]" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 py-5 space-y-6">
            {faqData.map((section, si) => (
              <div key={si}>
                <p className="text-[11px] font-semibold tracking-[0.08em] text-[#86868b] mb-3">
                  {section.category}
                </p>
                <div className="space-y-0 border border-[#d2d2d7] rounded-[10px] overflow-hidden" style={{ backgroundColor: "rgba(238,236,232,0.5)" }}>
                  {section.questions.map((item, qi) => {
                    const key = `${si}-${qi}`;
                    const isOpen = openIndex === key;
                    return (
                      <div key={key} className={qi > 0 ? "border-t border-[#d2d2d7]" : ""}>
                        <button
                          onClick={() => toggle(key)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#f9f9fb] transition-colors"
                        >
                          <span className="text-[14px] font-medium text-[#1d1d1f] pr-3">{item.q}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-[#86868b] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                            strokeWidth={2}
                          />
                        </button>
                        <div
                          className="overflow-hidden transition-all duration-200"
                          style={{ maxHeight: isOpen ? 200 : 0, opacity: isOpen ? 1 : 0 }}
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
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#d2d2d7] bg-[#EEECE8]">
          <p className="text-[12px] text-[#636366] text-center">
            Need more help? Try <button onClick={() => { onClose(); onOpenAIHelp?.(); }} className="text-[#0071e3] font-medium hover:underline">Ask AI</button> for personalized answers.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
