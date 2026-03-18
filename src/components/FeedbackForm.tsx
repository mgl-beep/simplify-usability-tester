import { useState } from "react";
import { X, Send, Loader2, CheckCircle2, Bug, Lightbulb, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { getCanvasDomain } from "../utils/canvasAPI";

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { key: "bug", label: "Bug Report", icon: Bug, color: "#ff3b30", desc: "Something isn't working" },
  { key: "suggestion", label: "Suggestion", icon: Lightbulb, color: "#ff9500", desc: "An idea to improve SIMPLIFY" },
  { key: "question", label: "Question", icon: HelpCircle, color: "#0071e3", desc: "Need help with something" },
];

export function FeedbackForm({ isOpen, onClose }: FeedbackFormProps) {
  const [category, setCategory] = useState<string>("bug");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);

    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74508696/submit-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          category,
          message: message.trim(),
          userAgent: navigator.userAgent,
          pageUrl: window.location.href,
          canvasDomain: getCanvasDomain() || "unknown",
        }),
      });
      setSent(true);
    } catch (error) {
      console.error("Feedback submission error:", error);
      // Still show success — we don't want to frustrate the user
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after close animation
    setTimeout(() => {
      setCategory("bug");
      setMessage("");
      setSent(false);
    }, 200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="!w-[440px] !max-w-[90vw] p-0 gap-0 bg-white rounded-[20px] border-[#d2d2d7] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Send Feedback</DialogTitle>
        <DialogDescription className="sr-only">Share feedback about SIMPLIFY</DialogDescription>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#d2d2d7] bg-[#EEECE8] flex items-center justify-between">
          <h2 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f]">
            Send Feedback
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close feedback form"
            className="w-8 h-8 rounded-full hover:bg-[#f2f2f7] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#636366]" strokeWidth={2} />
          </button>
        </div>

        {sent ? (
          /* Success state */
          <div className="px-6 py-12 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#34c759]/15 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 text-[#34c759]" strokeWidth={2} />
            </div>
            <p className="text-[18px] font-semibold text-[#1d1d1f] mb-2">Thank you!</p>
            <p className="text-[14px] text-[#636366] mb-6">
              Your feedback helps us improve SIMPLIFY for everyone.
            </p>
            <button
              onClick={handleClose}
              className="h-[40px] px-6 rounded-[10px] bg-[#0071e3] hover:bg-[#0077ed] text-white text-[14px] font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form */
          <div className="px-6 py-5">
            {/* Category selector */}
            <p className="text-[12px] font-semibold text-[#86868b] tracking-[0.06em] mb-2.5">CATEGORY</p>
            <div className="flex gap-2 mb-5">
              {categories.map(cat => {
                const Icon = cat.icon;
                const selected = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[10px] border transition-all ${
                      selected
                        ? "border-[#0071e3] bg-[#0071e3]/5"
                        : "border-[#d2d2d7] bg-white hover:bg-[#f5f5f7]"
                    }`}
                  >
                    <Icon className="w-5 h-5" style={{ color: selected ? cat.color : "#86868b" }} strokeWidth={1.5} />
                    <span className={`text-[12px] font-medium ${selected ? "text-[#1d1d1f]" : "text-[#86868b]"}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Message */}
            <p className="text-[12px] font-semibold text-[#86868b] tracking-[0.06em] mb-2.5">MESSAGE</p>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={
                category === "bug" ? "Describe what happened and what you expected..."
                : category === "suggestion" ? "Tell us your idea..."
                : "What do you need help with?"
              }
              rows={4}
              className="w-full px-4 py-3 rounded-[10px] border border-[#d2d2d7] text-[14px] text-[#1d1d1f] placeholder:text-[#86868b] resize-none focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors"
            />

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || sending}
              className="w-full mt-4 h-[44px] rounded-[10px] bg-[#0071e3] hover:bg-[#0077ed] text-white text-[15px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" strokeWidth={2} /> Send Feedback</>
              )}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
