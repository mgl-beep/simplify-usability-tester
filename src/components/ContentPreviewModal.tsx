import { X, Eye, Code, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import type { ScanIssue } from '../App';
import { getCanvasConfig, getPage } from '../utils/canvasAPI';

interface ContentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: ScanIssue | null;
  originalContent?: string;
  fixedContent?: string;
  onPublish?: () => void;
  onCancel?: () => void;
  isPublishing?: boolean;
}

export function ContentPreviewModal({
  isOpen,
  onClose,
  issue,
  originalContent: providedOriginal,
  fixedContent: providedFixed,
  onPublish,
  onCancel,
  isPublishing
}: ContentPreviewModalProps) {
  const [viewMode, setViewMode] = useState<'split' | 'before' | 'after'>('split');
  const [showCode, setShowCode] = useState(false);
  const [originalContent, setOriginalContent] = useState(providedOriginal || '');
  const [fixedContent, setFixedContent] = useState(providedFixed || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (issue && !providedOriginal) {
      loadContent();
    } else if (providedOriginal) {
      setOriginalContent(providedOriginal);
      setFixedContent(providedFixed || providedOriginal);
    }
  }, [issue, providedOriginal, providedFixed]);

  const loadContent = async () => {
    if (!issue || !issue.contentId || !issue.contentType) return;
    
    // Skip loading from Canvas API for demo issues - use elementHtml instead
    if (issue.isDemo) {
      const fallbackContent = issue.elementHtml || '<p>Demo content preview</p>';
      setOriginalContent(fallbackContent);
      setFixedContent(fallbackContent);
      return;
    }
    
    setIsLoading(true);
    try {
      const config = getCanvasConfig();
      if (!config) throw new Error('Canvas not configured');

      if (issue.contentType === 'page') {
        const page = await getPage(config, parseInt(issue.courseId), issue.contentId);
        setOriginalContent(page.body || '');
        setFixedContent(page.body || '');
      }
    } catch (error) {
      console.error('Error loading content:', error);
      // Gracefully handle Canvas API errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Don't show error toast for 404s - just use fallback content
      if (!errorMessage.includes('404') && !errorMessage.includes('Not Found')) {
        console.warn('Could not load full page content, using element preview instead');
      }
      
      // Fallback to elementHtml if available
      if (issue?.elementHtml) {
        setOriginalContent(issue.elementHtml);
        setFixedContent(issue.elementHtml);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!issue) return null;

  const renderContent = (html: string, highlightIssue: boolean = false) => {
    if (!html) return <div className="text-[#636366] text-[14px]">No content available</div>;

    // If we should highlight the issue, wrap the problematic element
    let displayHtml = html;
    if (highlightIssue && issue.elementHtml) {
      // Add a red border around problematic elements
      const highlightedElement = issue.elementHtml.replace(
        /^<([a-z0-9]+)/i,
        '<$1 style="border: 2px solid #ff3b30; background-color: rgba(255, 59, 48, 0.1); padding: 2px;"'
      );
      displayHtml = html.replace(issue.elementHtml, highlightedElement);
    }

    return (
      <div 
        className="prose max-w-none text-[16px]"
        dangerouslySetInnerHTML={{ __html: displayHtml }}
        style={{ 
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: '1.6'
        }}
      />
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-[1200px] max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#d2d2d7] flex items-center justify-between flex-shrink-0">
                <div className="flex-1">
                  <h2 className="text-[20px] font-semibold text-[#1d1d1f] mb-1">Content Preview</h2>
                  <p className="text-[13px] text-[#636366]">
                    {issue.title} • {issue.location}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-[#EEECE8] rounded-[8px] p-1">
                    <button
                      onClick={() => setViewMode('before')}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-[6px] transition-colors ${
                        viewMode === 'before'
                          ? 'bg-white text-[#1d1d1f] shadow-sm'
                          : 'text-[#636366] hover:text-[#1d1d1f]'
                      }`}
                    >
                      Before
                    </button>
                    <button
                      onClick={() => setViewMode('split')}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-[6px] transition-colors ${
                        viewMode === 'split'
                          ? 'bg-white text-[#1d1d1f] shadow-sm'
                          : 'text-[#636366] hover:text-[#1d1d1f]'
                      }`}
                    >
                      Split
                    </button>
                    <button
                      onClick={() => setViewMode('after')}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-[6px] transition-colors ${
                        viewMode === 'after'
                          ? 'bg-white text-[#1d1d1f] shadow-sm'
                          : 'text-[#636366] hover:text-[#1d1d1f]'
                      }`}
                    >
                      After
                    </button>
                  </div>

                  {/* Show Code Toggle */}
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className={`h-[32px] px-3 rounded-[8px] text-[12px] font-medium transition-colors flex items-center gap-2 ${
                      showCode
                        ? 'bg-[#0071e3] text-white'
                        : 'bg-[#EEECE8] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    Code
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-[#636366]" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-8 h-8 text-[#0071e3] animate-spin" />
                  </div>
                ) : (
                  <div className={`grid ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'} gap-6 h-full`}>
                    {/* Before */}
                    {(viewMode === 'before' || viewMode === 'split') && (
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-[14px] font-semibold text-[#ff3b30]">
                            Before (Current Issue)
                          </h3>
                          <div className="text-[11px] text-[#636366] bg-[#EEECE8] px-2 py-1 rounded">
                            {issue.severity} severity
                          </div>
                        </div>
                        <div className="flex-1 border border-[#ff3b30] rounded-[12px] p-4 bg-[#fff9f8] overflow-auto">
                          {showCode ? (
                            <pre className="text-[12px] font-mono text-[#1d1d1f] whitespace-pre-wrap break-words">
                              {originalContent || issue.elementHtml}
                            </pre>
                          ) : (
                            renderContent(originalContent, true)
                          )}
                        </div>
                        
                        {/* Issue Details */}
                        <div className="mt-3 p-3 bg-[#EEECE8] rounded-[8px]">
                          <div className="text-[12px] font-medium text-[#1d1d1f] mb-1">Issue:</div>
                          <div className="text-[12px] text-[#636366]">{issue.description}</div>
                        </div>
                      </div>
                    )}

                    {/* After */}
                    {(viewMode === 'after' || viewMode === 'split') && (
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-[14px] font-semibold text-[#34c759]">
                            After (Suggested Fix)
                          </h3>
                          <div className="text-[11px] text-[#34c759] bg-[#34c759]/10 px-2 py-1 rounded font-medium">
                            ✓ Fixed
                          </div>
                        </div>
                        <div className="flex-1 border border-[#34c759] rounded-[12px] p-4 bg-[#f6fff8] overflow-auto">
                          {showCode ? (
                            <pre className="text-[12px] font-mono text-[#1d1d1f] whitespace-pre-wrap break-words">
                              {fixedContent}
                            </pre>
                          ) : (
                            renderContent(fixedContent, false)
                          )}
                        </div>
                        
                        {/* Fix Details */}
                        <div className="mt-3 p-3 bg-[#EEECE8] rounded-[8px]">
                          <div className="text-[12px] font-medium text-[#1d1d1f] mb-1">Suggested Fix:</div>
                          <div className="text-[12px] text-[#636366]">{issue.suggestedFix}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#d2d2d7] flex items-center justify-between flex-shrink-0">
                <div className="text-[12px] text-[#636366]">
                  Standard: {issue.rubricStandard}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onCancel}
                    className="h-[36px] px-4 bg-[#EEECE8] hover:bg-[#e8e8ed] text-[#1d1d1f] text-[14px] font-medium rounded-[8px] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onPublish}
                    className={`h-[36px] px-4 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[14px] font-medium rounded-[8px] transition-colors ${
                      isPublishing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isPublishing}
                  >
                    {isPublishing ? 'Publishing...' : 'Publish Fix'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}