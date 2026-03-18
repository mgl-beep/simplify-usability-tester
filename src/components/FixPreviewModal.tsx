import { X, ArrowRight, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { useState } from "react";
import type { ScanIssue } from "../App";
import { motion } from "motion/react";

interface PreviewChange {
  issueId: string;
  title: string;
  category: string;
  severity: "high" | "medium" | "low";
  before: string;
  after: string;
  explanation: string;
  confidence: "high" | "medium" | "low";
}

interface FixPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFixes: () => void;
  changes: PreviewChange[];
  courseName: string;
}

export function FixPreviewModal({
  isOpen,
  onClose,
  onApplyFixes,
  changes,
  courseName
}: FixPreviewModalProps) {
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(
    changes[0]?.issueId || null
  );

  const selectedChange = changes.find(c => c.issueId === selectedChangeId);

  const getSeverityColor = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return "bg-[#ff3b30] text-white";
      case "medium":
        return "bg-[#ff9500] text-white";
      case "low":
        return "bg-[#ffcc00] text-[#1d1d1f]";
    }
  };

  const getConfidenceBadge = (confidence: "high" | "medium" | "low") => {
    const colors = {
      high: "bg-[#34c759]/10 text-[#34c759]",
      medium: "bg-[#ff9500]/10 text-[#ff9500]",
      low: "bg-[#636366]/10 text-[#636366]"
    };
    return (
      <Badge className={`${colors[confidence]} text-[10px] px-2 py-0.5 h-5 border-0`}>
        {confidence === 'high' ? '✓ High' : confidence === 'medium' ? '~ Medium' : '? Low'} Confidence
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1100px] max-h-[85vh] p-0 gap-0 bg-white rounded-[20px] border-[#d2d2d7] overflow-hidden">
        <DialogTitle className="sr-only">AI-Powered Fixes Preview</DialogTitle>
        <DialogDescription className="sr-only">
          Review AI-generated fixes for accessibility and usability issues before applying them to your course
        </DialogDescription>
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#d2d2d7] bg-gradient-to-r from-[#0071e3]/5 to-[#34c759]/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-[#0071e3]" strokeWidth={2} />
                <h2 className="text-[26px] font-semibold tracking-tight text-[#1d1d1f]">
                  AI-Powered Fixes Preview
                </h2>
              </div>
              <p className="text-[14px] text-[#636366]">
                Review {changes.length} intelligent fixes for <span className="font-semibold text-[#1d1d1f]">{courseName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-white/80 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-[#636366]" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(85vh-180px)]">
          {/* Left Sidebar - Changes List */}
          <div className="w-[320px] border-r border-[#e5e5e7] bg-[#EEECE8]">
            <div className="p-4 border-b border-[#e5e5e7] bg-white">
              <h3 className="text-[13px] font-semibold text-[#636366] uppercase tracking-wide">
                Proposed Changes
              </h3>
            </div>
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                {changes.map((change, index) => (
                  <motion.button
                    key={change.issueId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedChangeId(change.issueId)}
                    className={`w-full text-left p-3 rounded-[10px] transition-all ${
                      selectedChangeId === change.issueId
                        ? "bg-white shadow-sm border-2 border-[#0071e3]"
                        : "bg-white/50 border-2 border-transparent hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Badge className={`${getSeverityColor(change.severity)} text-[9px] px-1.5 py-0 h-4 border-0`}>
                        {change.severity}
                      </Badge>
                      <span className="text-[11px] text-[#636366] uppercase tracking-wide">
                        {change.category.replace('-', ' ')}
                      </span>
                    </div>
                    <h4 className="text-[13px] font-medium text-[#1d1d1f] mb-1">
                      {change.title}
                    </h4>
                    {getConfidenceBadge(change.confidence)}
                  </motion.button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Content - Before/After Preview */}
          <div className="flex-1 flex flex-col">
            {selectedChange ? (
              <>
                {/* Change Header */}
                <div className="p-6 border-b border-[#e5e5e7] bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${getSeverityColor(selectedChange.severity)} text-[10px] px-2 py-0.5 h-5 border-0`}>
                      {selectedChange.severity}
                    </Badge>
                    <h3 className="text-[20px] font-semibold text-[#1d1d1f]">
                      {selectedChange.title}
                    </h3>
                    {getConfidenceBadge(selectedChange.confidence)}
                  </div>
                  <p className="text-[14px] text-[#636366] leading-relaxed">
                    {selectedChange.explanation}
                  </p>
                </div>

                {/* Before/After Comparison */}
                <ScrollArea className="flex-1">
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Before */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-4 h-4 text-[#ff3b30]" strokeWidth={2} />
                          <h4 className="text-[13px] font-semibold text-[#636366] uppercase tracking-wide">
                            Before (Original)
                          </h4>
                        </div>
                        <div className="bg-[#fff5f5] border-2 border-[#ff3b30]/20 rounded-[12px] p-5">
                          <pre className="text-[13px] text-[#1d1d1f] font-mono whitespace-pre-wrap break-words">
                            {selectedChange.before}
                          </pre>
                        </div>
                      </div>

                      {/* After */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-4 h-4 text-[#34c759]" strokeWidth={2} />
                          <h4 className="text-[13px] font-semibold text-[#636366] uppercase tracking-wide">
                            After (AI Fixed)
                          </h4>
                        </div>
                        <div className="bg-[#f0fdf4] border-2 border-[#34c759]/20 rounded-[12px] p-5">
                          <pre className="text-[13px] text-[#1d1d1f] font-mono whitespace-pre-wrap break-words">
                            {selectedChange.after}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* Visual Arrow */}
                    <div className="flex justify-center my-6">
                      <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#0071e3] to-[#34c759] rounded-full">
                        <span className="text-[12px] font-semibold text-white">AI Enhancement</span>
                        <ArrowRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[14px] text-[#636366]">Select a change to preview</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#d2d2d7] bg-[#EEECE8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0071e3]" strokeWidth={2} />
            <p className="text-[12px] text-[#636366]">
              AI analyzed your course and generated {changes.length} intelligent fixes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="h-[40px] px-5 rounded-[10px] border-[#d2d2d7] hover:bg-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onApplyFixes();
                onClose();
              }}
              className="bg-gradient-to-r from-[#0071e3] to-[#34c759] hover:from-[#0077ed] hover:to-[#30b350] text-white h-[40px] px-6 rounded-[10px]"
            >
              <Sparkles className="w-4 h-4 mr-2" strokeWidth={2} />
              Apply All Fixes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}