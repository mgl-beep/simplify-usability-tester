import { X, AlertCircle, CheckCircle2, AlertTriangle, Info, ChevronRight, Loader2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ScanIssue } from '../App';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { IssueDetailModal } from './IssueDetailModal';
import { ContentPreviewModal } from './ContentPreviewModal';

interface ScanPanelProps {
  isOpen: boolean;
  onClose: () => void;
  scanResults: ScanIssue[];
  isScanning: boolean;
  onViewDetails: () => void;
  onApplyTemplate: (template: "navigation" | "accessibility") => void;
  onFixNow?: (issue: ScanIssue) => void;
  onIgnore?: (issue: ScanIssue) => void;
  onBatchFixAll?: () => void;
  onPublishToCanvas?: () => void;
  onUndo?: (issue: ScanIssue) => void;
  hideBatchFixAll?: boolean; // New prop to hide Batch Fix All button
  enabledStandards?: string[]; // Array of enabled standard IDs (e.g., ['cvc-oei', 'peralta', 'qm'])
  // AI suggestions cache for consistency
  aiSuggestionsCache?: Record<string, {
    suggestions: any[];
    pageInfo?: any;
    timestamp: Date;
    usedCount: number;
  }>;
  onUpdateAiCache?: (key: string, data: {
    suggestions: any[];
    pageInfo?: any;
    timestamp: Date;
    usedCount: number;
  }) => void;
  scanError?: string | null;
  onRetryScan?: () => void;
  onDismissScanError?: () => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  "alt-text": CheckCircle2,
  "contrast": AlertTriangle,
  "video-caption": CheckCircle2,
  "pdf-tag": CheckCircle2,
  "broken-link": AlertTriangle,
  "deep-nav": CheckCircle2,
  "inconsistent-heading": AlertTriangle,
  "formatting": AlertTriangle,
  "table-headers": AlertTriangle,
  "long-url": AlertTriangle,
  "confusing-navigation": AlertTriangle,
  "readability": CheckCircle2,
  "deep-click-path": AlertTriangle
};

const severityColors = {
  high: "bg-[#ff3b30] text-white",
  medium: "bg-[#ff9500] text-white",
  low: "bg-[#ffcc00] text-[#1d1d1f]"
};

export function ScanPanel({
  isOpen,
  onClose,
  scanResults,
  isScanning,
  onViewDetails,
  onApplyTemplate,
  onFixNow,
  onIgnore,
  onBatchFixAll,
  onPublishToCanvas,
  onUndo,
  hideBatchFixAll,
  enabledStandards,
  aiSuggestionsCache,
  onUpdateAiCache,
  scanError,
  onRetryScan,
  onDismissScanError
}: ScanPanelProps) {
  const accessibilityIssues = scanResults.filter(r => r.type === "accessibility");
  const usabilityIssues = scanResults.filter(r => r.type === "usability");
  const highIssues = scanResults.filter(r => r.severity === "high").length;
  const mediumIssues = scanResults.filter(r => r.severity === "medium").length;

  // Calculate counts for batch actions
  const pendingAutoFixableCount = scanResults.filter(
    r => r.status === 'pending' && r.autoFixAvailable
  ).length;
  const stagedCount = scanResults.filter(r => r.status === 'staged').length;

  const [selectedIssue, setSelectedIssue] = useState<ScanIssue | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  // Sort results by severity, then by title to group similar issues together
  const sortedResults = [...scanResults].sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return a.title.localeCompare(b.title);
  });

  const handleFix = () => {
    setSelectedIssue(null);
    // Could add toast notification here
    if (onFixNow) {
      onFixNow(selectedIssue!);
    }
  };

  const handleIgnore = () => {
    setSelectedIssue(null);
    if (onIgnore) {
      onIgnore(selectedIssue!);
    }
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[480px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 h-[72px] flex items-center justify-between border-b border-[#d2d2d7]">
              <div>
                <h2 className="text-[20px] tracking-tight text-[#1d1d1f]">Course Scan</h2>
                <p className="text-[12px] text-[#636366]">Accessibility & Usability Analysis</p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-[#636366]" strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-6 pb-32">
                {/* Scan Error Banner */}
                {scanError && !isScanning && (
                  <div className="bg-[#fff5f5] rounded-[10px] border border-[#ff3b30]/20 p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#ff3b30]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertCircle className="w-4 h-4 text-[#ff3b30]" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-[#1d1d1f] font-medium mb-0.5">Scan Error</p>
                        <p className="text-[12px] text-[#636366] break-words">{scanError}</p>
                        <div className="flex items-center gap-2 mt-2.5">
                          {onRetryScan && (
                            <button
                              onClick={onRetryScan}
                              className="h-[28px] px-3 rounded-[6px] bg-[#0071e3] hover:bg-[#0077ed] text-white text-[12px] font-semibold transition-colors"
                            >
                              Retry Scan
                            </button>
                          )}
                          {onDismissScanError && (
                            <button
                              onClick={onDismissScanError}
                              className="h-[28px] px-3 rounded-[6px] border border-[#d2d2d7] bg-white hover:bg-[#f5f5f7] text-[#636366] text-[12px] font-medium transition-colors"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isScanning ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-12 h-12 text-[#0071e3] animate-spin mb-4" strokeWidth={1.5} />
                    <p className="text-[15px] text-[#636366] mb-2">Scanning your course...</p>
                    <p className="text-[12px] text-[#636366]">Analyzing accessibility and usability</p>
                  </div>
                ) : (
                  <>
                    {/* Summary */}
                    <div className="bg-[#EEECE8] rounded-[12px] p-5 mb-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[#ff3b30]/10 flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-5 h-5 text-[#ff3b30]" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <div className="text-[15px] text-[#1d1d1f] mb-1">
                            {sortedResults.length} {sortedResults.length !== scanResults.length && `of ${scanResults.length}`} Issues
                          </div>
                          <div className="text-[13px] text-[#636366] mb-3">
                            {highIssues} high priority, {mediumIssues} medium priority
                          </div>
                          <div className="flex items-center gap-3 text-[12px]">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-[#ff3b30]" />
                              <span className="text-[#636366]">{accessibilityIssues.length} Accessibility</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-[#ff9500]" />
                              <span className="text-[#636366]">{usabilityIssues.length} Usability</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="all" className="mb-6">
                      <TabsList className="w-full grid grid-cols-3 mb-4 bg-[#EEECE8] p-1 rounded-[10px]">
                        <TabsTrigger value="all" className="rounded-[8px] text-[13px]">
                          All ({scanResults.length})
                        </TabsTrigger>
                        <TabsTrigger value="accessibility" className="rounded-[8px] text-[13px]">
                          Accessibility ({accessibilityIssues.length})
                        </TabsTrigger>
                        <TabsTrigger value="usability" className="rounded-[8px] text-[13px]">
                          Usability ({usabilityIssues.length})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="all" className="mt-0">
                        <IssuesList 
                          issues={sortedResults} 
                          onSelectIssue={setSelectedIssue}
                          onFixNow={onFixNow}
                          onIgnore={onIgnore}
                          onUndo={onUndo}
                        />
                      </TabsContent>

                      <TabsContent value="accessibility" className="mt-0">
                        <IssuesList 
                          issues={accessibilityIssues} 
                          onSelectIssue={setSelectedIssue}
                          onFixNow={onFixNow}
                          onIgnore={onIgnore}
                          onUndo={onUndo}
                        />
                      </TabsContent>

                      <TabsContent value="usability" className="mt-0">
                        <IssuesList 
                          issues={usabilityIssues} 
                          onSelectIssue={setSelectedIssue}
                          onFixNow={onFixNow}
                          onIgnore={onIgnore}
                          onUndo={onUndo}
                        />
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </div>
            </div>

            {/* Sticky Footer with Batch Actions */}
            {!isScanning && scanResults.length > 0 && onBatchFixAll && onPublishToCanvas && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#d2d2d7] px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
                <div className="flex flex-col gap-3">
                  {/* Batch Fix All - Always visible unless explicitly hidden */}
                  {!hideBatchFixAll && (
                    <button
                      onClick={onBatchFixAll}
                      disabled={pendingAutoFixableCount === 0}
                      className={`w-full h-[44px] text-white text-[15px] font-medium rounded-[10px] transition-colors flex items-center justify-center gap-2 ${
                        pendingAutoFixableCount > 0
                          ? 'bg-[#0071e3] hover:bg-[#0077ed] cursor-pointer'
                          : 'bg-[#636366]/30 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span>Batch Fix All</span>
                      {pendingAutoFixableCount > 0 && (
                        <Badge className="bg-white/20 text-white text-[12px] px-2 py-0 h-5 border-0">
                          {pendingAutoFixableCount}
                        </Badge>
                      )}
                    </button>
                  )}
                  
                  {/* Publish to Canvas - Always visible */}
                  <button
                    onClick={onPublishToCanvas}
                    disabled={stagedCount === 0}
                    className={`w-full h-[44px] text-white text-[15px] font-medium rounded-[10px] transition-colors flex items-center justify-center gap-2 ${
                      stagedCount > 0
                        ? 'bg-[#34c759] hover:bg-[#30b350] cursor-pointer'
                        : 'bg-[#636366]/30 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span>Publish to Canvas</span>
                    {stagedCount > 0 && (
                      <Badge className="bg-white/20 text-white text-[12px] px-2 py-0 h-5 border-0">
                        {stagedCount}
                      </Badge>
                    )}
                  </button>
                  
                  {/* Info text */}
                  {stagedCount > 0 && (
                    <p className="text-[11px] text-[#636366] text-center">
                      {stagedCount} fix{stagedCount !== 1 ? 'es' : ''} ready to publish
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Issue Detail Modal */}
          <IssueDetailModal
            isOpen={!!selectedIssue}
            onClose={() => setSelectedIssue(null)}
            issue={selectedIssue}
            onApplyFix={handleFix}
            onIgnore={handleIgnore}
            enabledStandards={enabledStandards}
            aiSuggestionsCache={aiSuggestionsCache}
            onUpdateAiCache={onUpdateAiCache}
          />

          {/* Content Preview Modal - Will be used for showing staged fixes */}
          <ContentPreviewModal
            isOpen={false}
            onClose={() => {}}
            issue={null}
          />
        </>
      )}
    </AnimatePresence>
  );
}

function IssuesList({ issues, onSelectIssue, onFixNow, onIgnore, onUndo }: { issues: ScanIssue[], onSelectIssue: (issue: ScanIssue) => void, onFixNow?: (issue: ScanIssue) => void, onIgnore?: (issue: ScanIssue) => void, onUndo?: (issue: ScanIssue) => void }) {
  return (
    <div className="space-y-3">
      {issues.map((issue, i) => {
        const Icon = categoryIcons[issue.category] || AlertCircle;
        const status = issue.status || 'pending';
        
        return (
          <div
            key={issue.id}
            className="w-full bg-white border border-[#d2d2d7] rounded-[12px] p-4 hover:border-[#0071e3] transition-colors"
            style={i === 0 && !localStorage.getItem('simplify_seen_issue_click') ? { animation: 'pulse-ring 2s ease-in-out 3' } : undefined}
          >
            <button
              className="w-full text-left"
              onClick={() => { onSelectIssue(issue); localStorage.setItem('simplify_seen_issue_click', '1'); }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EEECE8] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#636366]" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[14px] text-[#1d1d1f]">{issue.title}</span>
                    <Badge
                      className={`${severityColors[issue.severity]} text-[10px] px-1.5 py-0 h-4 border-0`}
                      title={issue.severity === 'high' ? 'High (−10 pts): Blocks access. Must fix.'
                           : issue.severity === 'medium' ? 'Medium (−5 pts): Reduces usability.'
                           : 'Low (−2 pts): Best practice.'}
                    >
                      {issue.severity}
                    </Badge>
                    {issue.autoFixAvailable && (
                      <Badge className="bg-[#0071e3]/10 text-[#0071e3] text-[10px] px-1.5 py-0 h-4 border-0">
                        auto-fix
                      </Badge>
                    )}
                  </div>
                  {issue.courseName && (
                    <p className="text-[12px] text-[#0071e3] mb-1">
                      {issue.courseName}
                    </p>
                  )}
                  <p className="text-[12px] text-[#636366] mb-1">
                    {issue.description}
                  </p>
                  <p className="text-[11px] text-[#636366]">
                    📍 {issue.location}
                  </p>
                </div>
              </div>
            </button>
            
            {/* Inline action buttons */}
            {onFixNow && onIgnore && (
              <div className="flex items-center gap-2 mt-3 pl-11">
                {status === 'pending' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFixNow(issue);
                      }}
                      disabled={!issue.autoFixAvailable}
                      className={`h-[28px] px-3 text-[12px] font-medium rounded-[6px] transition-colors ${
                        issue.autoFixAvailable
                          ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
                          : 'bg-[#f5f5f7] text-[#636366] cursor-not-allowed'
                      }`}
                    >
                      Fix Now
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onIgnore(issue);
                      }}
                      className="h-[28px] px-3 border border-[#d2d2d7] hover:bg-[#f5f5f7] text-[#636366] text-[12px] font-medium rounded-[6px] transition-colors"
                    >
                      Ignore
                    </button>
                  </>
                )}
                
                {status === 'staged' && (
                  <div className="flex items-center gap-1.5 text-[12px] text-[#34c759] font-medium">
                    <span className="text-[14px]">✓</span>
                    <span>Staged for publish</span>
                  </div>
                )}
                
                {status === 'ignored' && (
                  <div className="flex items-center gap-1.5 text-[12px] text-[#636366] font-medium">
                    <span className="text-[14px]">✓</span>
                    <span>Ignored</span>
                  </div>
                )}
                
                {status === 'published' && onUndo && (
                  <>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#0071e3] font-medium">
                      <span className="text-[14px]">✓</span>
                      <span>Published</span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUndo(issue);
                      }}
                      className="h-[28px] px-3 border border-[#ff9500] hover:bg-[#ff9500]/10 text-[#ff9500] text-[12px] font-medium rounded-[6px] transition-colors"
                    >
                      Undo
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}