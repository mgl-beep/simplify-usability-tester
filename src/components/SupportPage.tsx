import { useState } from "react";
import { X, ChevronDown, Monitor, Key, RefreshCw, AlertCircle, Mail, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

interface SupportPageProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback?: () => void;
}

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

export function SupportPage({ isOpen, onClose, onOpenFeedback }: SupportPageProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[500px] !max-w-[90vw] p-0 gap-0 bg-white rounded-[20px] border-[#d2d2d7] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Help & Support</DialogTitle>
        <DialogDescription className="sr-only">Troubleshooting and support resources</DialogDescription>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#d2d2d7] bg-[#EEECE8] flex items-center justify-between">
          <h2 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f]">
            Help & Support
          </h2>
          <button
            onClick={onClose}
            aria-label="Close support"
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
              <div className="p-4 rounded-[10px] border border-[#d2d2d7]" style={{ backgroundColor: "rgba(238,236,232,0.5)" }}>
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

            {/* Troubleshooting */}
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-[#86868b] mb-3">TROUBLESHOOTING</p>
              <div className="border border-[#d2d2d7] rounded-[10px] overflow-hidden" style={{ backgroundColor: "rgba(238,236,232,0.5)" }}>
                {troubleshooting.map((item, i) => {
                  const isOpen = openIndex === i;
                  const Icon = item.icon;
                  return (
                    <div key={i} className={i > 0 ? "border-t border-[#d2d2d7]" : ""}>
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : i)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#f9f9fb] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 pr-3">
                          <Icon className="w-3.5 h-3.5 text-[#86868b] flex-shrink-0" strokeWidth={1.5} />
                          <span className="text-[13px] font-medium text-[#1d1d1f]">{item.q}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-[#86868b] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                          strokeWidth={2}
                        />
                      </button>
                      <div
                        className="overflow-hidden transition-all duration-200"
                        style={{ maxHeight: isOpen ? 200 : 0, opacity: isOpen ? 1 : 0 }}
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

            {/* Contact */}
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-[#86868b] mb-3">GET HELP</p>
              <div className="space-y-2">
                <a
                  href="mailto:support@simplifylti.com"
                  className="flex items-center gap-3 p-3.5 rounded-[10px] border border-[#d2d2d7] hover:border-[#0071e3] hover:bg-[#0071e3]/5 transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#0071e3]" strokeWidth={1.5} />
                  <div>
                    <p className="text-[13px] font-medium text-[#1d1d1f]">Email Support</p>
                    <p className="text-[11px] text-[#86868b]">support@simplifylti.com — we respond within 24-48 hours</p>
                  </div>
                </a>
                {onOpenFeedback && (
                  <button
                    onClick={() => { onClose(); onOpenFeedback(); }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-[10px] border border-[#d2d2d7] hover:border-[#5856d6] hover:bg-[#5856d6]/5 transition-colors text-left"
                  >
                    <MessageCircle className="w-4 h-4 text-[#5856d6]" strokeWidth={1.5} />
                    <div>
                      <p className="text-[13px] font-medium text-[#1d1d1f]">In-App Feedback</p>
                      <p className="text-[11px] text-[#86868b]">Report a bug, suggest a feature, or ask a question</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
