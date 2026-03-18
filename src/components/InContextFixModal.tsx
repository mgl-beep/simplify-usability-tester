import { useState, useEffect } from "react";
import { X, AlertCircle, Check, SkipForward } from "lucide-react";
import { ScanIssue } from "../App";
import { getCanvasDomain } from "../utils/canvasAPI";

interface InContextFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: ScanIssue | null;
  courseId: string;
  onFixApplied: () => void;
}

interface FixOption {
  id: string;
  label: string;
  description: string;
  fixData: any;
}

export function InContextFixModal({
  isOpen,
  onClose,
  issue,
  courseId,
  onFixApplied,
}: InContextFixModalProps) {
  const [contentHtml, setContentHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [fixOptions, setFixOptions] = useState<FixOption[]>([]);

  useEffect(() => {
    if (isOpen && issue) {
      loadContentAndGenerateOptions();
    }
  }, [isOpen, issue]);

  const loadContentAndGenerateOptions = async () => {
    if (!issue) return;

    setIsLoading(true);

    try {
      // Skip loading from Canvas API for demo issues - use elementHtml instead
      if (issue.isDemo) {
        setContentHtml(issue.elementHtml || '<p>Demo content preview</p>');
        const options = generateFixOptions(issue);
        setFixOptions(options);
        return;
      }

      // Fetch the full Canvas content
      const content = await fetchCanvasContent(courseId, issue);
      setContentHtml(content);

      // Generate fix options based on the issue type
      const options = generateFixOptions(issue);
      setFixOptions(options);
    } catch (error) {
      console.error("Error loading content:", error);
      // Gracefully handle Canvas API errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Don't show error for 404s - just use fallback content
      if (!errorMessage.includes('404') && !errorMessage.includes('Not Found')) {
        console.warn('Could not load full content, using element preview instead');
      }
      
      // Fallback to elementHtml if available
      if (issue?.elementHtml) {
        setContentHtml(issue.elementHtml);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCanvasContent = async (
    courseId: string,
    issue: ScanIssue
  ): Promise<string> => {
    const domain = getCanvasDomain();
    const token = localStorage.getItem("canvas_token");

    if (!domain || !token) {
      throw new Error("Canvas connection not found");
    }

    let endpoint = "";
    if (issue.contentType === "page") {
      endpoint = `https://${domain}/api/v1/courses/${courseId}/pages/${issue.contentId}`;
    } else if (issue.contentType === "assignment") {
      endpoint = `https://${domain}/api/v1/courses/${courseId}/assignments/${issue.contentId}`;
    }

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch content");
    }

    const data = await response.json();
    return data.body || data.description || "";
  };

  const generateFixOptions = (issue: ScanIssue): FixOption[] => {
    const options: FixOption[] = [];

    switch (issue.category) {
      case "alt-text":
        // Multiple alt text suggestions
        options.push({
          id: "auto-generated",
          label: "Auto-generated description",
          description: issue.suggestedFix || "Add descriptive alt text based on context",
          fixData: { altText: issue.suggestedFix },
        });
        options.push({
          id: "decorative",
          label: "Mark as decorative",
          description: 'Set alt="" for decorative images',
          fixData: { altText: "" },
        });
        break;

      case "contrast":
        // Color contrast fix options
        options.push({
          id: "darken-text",
          label: "Darken text color",
          description: "Change text to #2D3B45 for better contrast",
          fixData: { textColor: "#2D3B45" },
        });
        options.push({
          id: "lighten-bg",
          label: "Lighten background",
          description: "Change background to #FFFFFF",
          fixData: { backgroundColor: "#FFFFFF" },
        });
        break;

      case "inconsistent-heading":
        // Heading hierarchy fixes
        const suggestedHeading = issue.suggestedFix?.match(/h[1-6]/i)?.[0] || "h2";
        options.push({
          id: "fix-hierarchy",
          label: `Change to ${suggestedHeading.toUpperCase()}`,
          description: issue.suggestedFix || "Fix heading hierarchy",
          fixData: { newHeading: suggestedHeading },
        });
        break;

      case "broken-link":
        options.push({
          id: "remove-link",
          label: "Remove broken link",
          description: "Remove the link but keep the text",
          fixData: { action: "remove" },
        });
        options.push({
          id: "update-link",
          label: "Update URL (manual)",
          description: "You'll need to provide a new URL",
          fixData: { action: "manual" },
        });
        break;

      default:
        // Generic fix option
        options.push({
          id: "auto-fix",
          label: "Apply suggested fix",
          description: issue.suggestedFix || "Apply automatic fix",
          fixData: {},
        });
    }

    return options;
  };

  const handleApplyFix = async () => {
    if (!selectedOption || !issue) return;

    setIsApplying(true);

    try {
      const option = fixOptions.find((opt) => opt.id === selectedOption);
      if (!option) return;

      // Call Canvas API to apply the fix
      const { fixCanvasIssue } = await import("../utils/canvasFixer");
      const result = await fixCanvasIssue(courseId, {
        ...issue,
        fixData: option.fixData,
      });

      if (result.success) {
        onFixApplied();
        onClose();
      }
    } catch (error) {
      console.error("Error applying fix:", error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleIgnore = () => {
    onClose();
  };

  if (!isOpen || !issue) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-[20px] shadow-[0_10px_60px_rgba(0,0,0,0.2)] w-full max-w-[1000px] max-h-[85vh] flex flex-col pointer-events-auto">
          {/* Header */}
          <div className="flex items-start justify-between px-8 pt-7 pb-5 border-b border-[#E5E5E5]">
            <div className="flex-1">
              <h2 className="text-[24px] font-semibold text-[#2D3B45] mb-2">
                Fix Issue in Context
              </h2>
              <p className="text-[14px] text-[#6B7780]">{issue.title}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-[#f5f5f5] flex items-center justify-center text-[#6B7780] transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Canvas Content Preview */}
              <div>
                <h3 className="text-[16px] font-semibold text-[#2D3B45] mb-3">
                  How Students See It
                </h3>
                <div className="bg-white rounded-lg p-6 border-2 border-[#C7CDD1]">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-[#E5E5E5] border-t-[#0084ff] rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Visual preview of the content */}
                      <div
                        className="prose prose-sm max-w-none [&>*]:m-0"
                        dangerouslySetInnerHTML={{
                          __html: highlightIssue(contentHtml, issue),
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* What's Wrong - Simple explanation */}
                <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-red-900 mb-2">
                        What's Wrong?
                      </p>
                      <p className="text-[13px] text-red-800 leading-relaxed">
                        {getSimpleExplanation(issue)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Fix Options */}
              <div>
                <h3 className="text-[16px] font-semibold text-[#2D3B45] mb-3">
                  Choose a Fix
                </h3>
                <div className="space-y-3">
                  {fixOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedOption(option.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedOption === option.id
                          ? "border-[#0084ff] bg-blue-50"
                          : "border-[#E5E5E5] hover:border-[#C7CDD1] bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            selectedOption === option.id
                              ? "border-[#0084ff] bg-[#0084ff]"
                              : "border-[#C7CDD1]"
                          }`}
                        >
                          {selectedOption === option.id && (
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-[14px] font-medium text-[#2D3B45]">
                            {option.label}
                          </p>
                          <p className="text-[13px] text-[#6B7780] mt-1">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Rubric Standard Reference */}
                {issue.rubricStandard && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-[12px] font-medium text-blue-900 mb-1">
                      Rubric Standard
                    </p>
                    <p className="text-[13px] text-blue-700">
                      {issue.rubricStandard}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-[#E5E5E5] flex items-center justify-between bg-[#f5f5f5]">
            <button
              onClick={handleIgnore}
              className="px-5 py-2.5 rounded-lg text-[14px] font-medium text-[#6B7780] hover:bg-[#E5E5E5] transition-colors flex items-center gap-2"
            >
              <SkipForward className="w-4 h-4" />
              Ignore
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-[14px] font-medium text-[#6B7780] hover:bg-[#E5E5E5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFix}
                disabled={!selectedOption || isApplying}
                className="px-6 py-2.5 rounded-lg text-[14px] font-semibold text-white bg-[#0084ff] hover:bg-[#0066cc] disabled:bg-[#C7CDD1] disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isApplying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Apply Fix
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to highlight the problematic element in the HTML
function highlightIssue(html: string, issue: ScanIssue): string {
  if (!issue.elementHtml) return html;

  // Try to find and highlight the problematic element
  const elementToFind = issue.elementHtml.trim();
  
  if (html.includes(elementToFind)) {
    return html.replace(
      elementToFind,
      `<div class="relative inline-block">
        <div class="absolute -inset-1 bg-yellow-200 rounded animate-pulse"></div>
        <div class="relative">${elementToFind}</div>
       </div>`
    );
  }

  return html;
}

// Helper function to get a simple explanation of the issue
function getSimpleExplanation(issue: ScanIssue): string {
  switch (issue.category) {
    case "alt-text":
      return "This image is missing descriptive alt text. Screen readers can't tell students what the image shows.";
    
    case "contrast":
      // Extract actual colors from the description if available
      const contrastMatch = issue.description.match(/contrast ratio of ([\d.]+):1/);
      const currentRatio = contrastMatch ? contrastMatch[1] : "low";
      return `The highlighted text has ${currentRatio}:1 contrast (needs 4.5:1). This makes it hard to read, especially for students with visual impairments or viewing on phones in bright light.`;
    
    case "inconsistent-heading":
      return "The heading structure skips levels (like going from H1 to H3). This confuses screen readers and makes it harder for students to navigate the page.";
    
    case "broken-link":
      return "This link doesn't work anymore. Students who click it will get an error.";
    
    case "video-caption":
      return "This video is missing captions. Deaf and hard-of-hearing students can't access the content.";
    
    case "pdf-tag":
      return "This PDF isn't tagged for accessibility. Screen readers can't navigate it properly.";
    
    case "deep-nav":
      return "Students have to click through too many levels to find this content. Simplify the navigation structure.";
    
    case "formatting":
      return "The text formatting makes it hard to read. Use proper headings and spacing instead of manual formatting.";
    
    case "long-url":
      return "This raw URL is displayed instead of descriptive link text. Screen readers will read the entire URL out loud.";
    
    default:
      return issue.description || "This content has an accessibility issue that needs to be fixed.";
  }
}