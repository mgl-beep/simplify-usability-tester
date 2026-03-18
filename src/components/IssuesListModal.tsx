import { X, AlertCircle, ImageOff, Palette, Link as LinkIcon, MapPin, Type, FileText, Video, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import type { ScanIssue } from "../App";

interface IssuesListModalProps {
  isOpen: boolean;
  onClose: () => void;
  issues: ScanIssue[];
  onSelectIssue: (issue: ScanIssue) => void;
}

const categoryIcons = {
  "alt-text": ImageOff,
  "contrast": Palette,
  "video-caption": Video,
  "pdf-tag": FileText,
  "broken-link": LinkIcon,
  "deep-nav": MapPin,
  "inconsistent-heading": Type,
  "formatting": Type,
  "long-url": LinkIcon
};

const severityColors = {
  high: "bg-[#ff3b30] text-white",
  medium: "bg-[#ff9500] text-white",
  low: "bg-[#ffcc00] text-[#1d1d1f]"
};

export function IssuesListModal({
  isOpen,
  onClose,
  issues,
  onSelectIssue
}: IssuesListModalProps) {
  const [filterType, setFilterType] = useState<"all" | "accessibility" | "usability">("all");
  const [filterSeverity, setFilterSeverity] = useState<"all" | "high" | "medium" | "low">("all");
  const [filterCourse, setFilterCourse] = useState<"all" | "1" | "2">("all");

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const matchesType = filterType === "all" || issue.type === filterType;
    const matchesSeverity = filterSeverity === "all" || issue.severity === filterSeverity;
    const matchesCourse = filterCourse === "all" || issue.courseId === filterCourse;
    return matchesType && matchesSeverity && matchesCourse;
  });

  const accessibilityCount = issues.filter(i => i.type === "accessibility").length;
  const usabilityCount = issues.filter(i => i.type === "usability").length;
  const highCount = issues.filter(i => i.severity === "high").length;
  const mediumCount = issues.filter(i => i.severity === "medium").length;
  const lowCount = issues.filter(i => i.severity === "low").length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] max-h-[85vh] bg-white rounded-[20px] shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-[#d2d2d7]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-[24px] tracking-tight text-[#1d1d1f] mb-1">
                    All Issues
                  </h2>
                  <p className="text-[14px] text-[#636366]">
                    {filteredIssues.length} of {issues.length} issues shown
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-[#636366]" strokeWidth={1.5} />
                </button>
              </div>

              {/* Filters */}
              <div className="space-y-3">
                {/* Type Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="w-4 h-4 text-[#636366]" strokeWidth={1.5} />
                    <span className="text-[13px] text-[#636366]">Filter by Type</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFilterType("all")}
                      className={`px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                        filterType === "all"
                          ? "bg-[#0071e3] text-white"
                          : "bg-[#EEECE8] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                      }`}
                    >
                      All ({issues.length})
                    </button>
                    <button
                      onClick={() => setFilterType("accessibility")}
                      className={`px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                        filterType === "accessibility"
                          ? "bg-[#0071e3] text-white"
                          : "bg-[#EEECE8] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                      }`}
                    >
                      Accessibility ({accessibilityCount})
                    </button>
                    <button
                      onClick={() => setFilterType("usability")}
                      className={`px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                        filterType === "usability"
                          ? "bg-[#0071e3] text-white"
                          : "bg-[#EEECE8] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                      }`}
                    >
                      Usability ({usabilityCount})
                    </button>
                  </div>
                </div>

                {/* Severity Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-[#636366]" strokeWidth={1.5} />
                    <span className="text-[13px] text-[#636366]">Filter by Severity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFilterSeverity("all")}
                      className={`px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                        filterSeverity === "all"
                          ? "bg-[#0071e3] text-white"
                          : "bg-[#EEECE8] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterSeverity("high")}
                      className={`px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                        filterSeverity === "high"
                          ? "bg-[#ff3b30] text-white"
                          : "bg-[#ff3b30]/10 text-[#ff3b30] hover:bg-[#ff3b30]/20"
                      }`}
                    >
                      High ({highCount})
                    </button>
                    <button
                      onClick={() => setFilterSeverity("medium")}
                      className={`px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                        filterSeverity === "medium"
                          ? "bg-[#ff9500] text-white"
                          : "bg-[#ff9500]/10 text-[#ff9500] hover:bg-[#ff9500]/20"
                      }`}
                    >
                      Medium ({mediumCount})
                    </button>
                    <button
                      onClick={() => setFilterSeverity("low")}
                      className={`px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                        filterSeverity === "low"
                          ? "bg-[#ffcc00] text-[#1d1d1f]"
                          : "bg-[#ffcc00]/10 text-[#ffcc00] hover:bg-[#ffcc00]/20"
                      }`}
                    >
                      Low ({lowCount})
                    </button>
                  </div>
                </div>

                {/* Course Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[13px] text-[#636366]">Filter by Course</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFilterCourse("all")}
                      className={`px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                        filterCourse === "all"
                          ? "bg-[#0071e3] text-white"
                          : "bg-[#EEECE8] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                      }`}
                    >
                      All Courses
                    </button>
                    <button
                      onClick={() => setFilterCourse("2")}
                      className={`px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                        filterCourse === "2"
                          ? "bg-[#0071e3] text-white"
                          : "bg-[#EEECE8] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                      }`}
                    >
                      Creative Writing
                    </button>
                    <button
                      onClick={() => setFilterCourse("1")}
                      className={`px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                        filterCourse === "1"
                          ? "bg-[#0071e3] text-white"
                          : "bg-[#EEECE8] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                      }`}
                    >
                      Cats 101
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Issues List */}
            <ScrollArea className="flex-1 px-8 py-6">
              <div className="space-y-3">
                {filteredIssues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="w-12 h-12 text-[#636366] mb-4" strokeWidth={1.5} />
                    <p className="text-[15px] text-[#636366] mb-1">No issues found</p>
                    <p className="text-[13px] text-[#636366]">Try adjusting your filters</p>
                  </div>
                ) : (
                  filteredIssues.map((issue) => {
                    const Icon = categoryIcons[issue.category];
                    return (
                      <button
                        key={issue.id}
                        onClick={() => {
                          onSelectIssue(issue);
                          onClose();
                        }}
                        className="w-full bg-white border border-[#d2d2d7] rounded-[12px] p-4 hover:border-[#0071e3] hover:bg-[#0071e3]/5 transition-all text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#EEECE8] flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-[#636366]" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-[15px] text-[#1d1d1f]">{issue.title}</span>
                              <Badge className={`${severityColors[issue.severity]} text-[10px] px-1.5 py-0 h-4 border-0`}>
                                {issue.severity}
                              </Badge>
                              {issue.autoFixAvailable && (
                                <Badge className="bg-[#0071e3]/10 text-[#0071e3] text-[10px] px-1.5 py-0 h-4 border-0">
                                  auto-fix
                                </Badge>
                              )}
                              <Badge className="bg-[#636366]/10 text-[#636366] text-[10px] px-1.5 py-0 h-4 border-0">
                                {issue.type}
                              </Badge>
                            </div>
                            {issue.courseName && (
                              <p className="text-[13px] text-[#0071e3] mb-1.5">
                                📚 {issue.courseName}
                              </p>
                            )}
                            <p className="text-[13px] text-[#636366] mb-1">
                              {issue.description}
                            </p>
                            <p className="text-[12px] text-[#636366]">
                              📍 {issue.location}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-[#d2d2d7] flex items-center justify-between">
              <div className="text-[13px] text-[#636366]">
                Click any issue to view details and fix suggestions
              </div>
              <Button
                onClick={onClose}
                variant="outline"
                className="h-[36px] px-4 rounded-[12px] border-[#d2d2d7] hover:bg-[#f5f5f7]"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
