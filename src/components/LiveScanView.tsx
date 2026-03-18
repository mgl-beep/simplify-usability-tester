import { AlertCircle, CheckCircle2, AlertTriangle, Loader2, ChevronRight, Filter, RefreshCw, XCircle, RotateCcw, X, Zap, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMemo, useState } from 'react';
import type { ScanIssue } from '../App';
import { Badge } from './ui/badge';
import { issueMatchesEnabledStandards } from '../utils/standards/standardsMapping';

// Shared severity color palette — used for badge rendering
const SEVERITY_COLORS = {
  high:   { backgroundColor: '#FCEEED', color: '#C4342A' },
  medium: { backgroundColor: '#FDF4E4', color: '#A06820' },
  low:    { backgroundColor: '#EEEFF2', color: '#626870' },
} as const;

interface LiveScanViewProps {
  isScanning: boolean;
  scanResults: ScanIssue[];
  onSelectIssue: (issue: ScanIssue) => void;
  onBatchFixAll?: () => void;
  onPublishToCanvas?: () => void;
  onPublishSingleIssue?: (issue: ScanIssue) => void;
  handleRevertStagedFix?: (issue: ScanIssue) => void;
  onUndo?: (issue: ScanIssue) => void;
  courseName?: string;
  courseId?: string;
  lastScanTime?: Date;
  enabledStandards?: string[];
  onRescan?: () => void;
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

// Helper function to abbreviate long issue titles
function abbreviateIssueTitle(title: string): string {
  const abbreviations: Record<string, string> = {
    'Expectation': 'Exp.',
    'Expectations': 'Exp.',
    'Instructions': 'Instr.',
    'Alternative': 'Alt.',
    'Accessibility': 'A11y',
    'Navigation': 'Nav.',
    'Assignment': 'Assign.',
    'Announcement': 'Announce.',
    'Participation': 'Particip.',
    'Description': 'Desc.',
    'Information': 'Info.',
    'Requirements': 'Req.',
    'Recommendation': 'Recomm.',
    'Implementation': 'Impl.',
    'Configuration': 'Config.',
    'Documentation': 'Docs',
    'Organization': 'Org.',
    'Introduction': 'Intro.',
    'Presentation': 'Present.',
    'Explanation': 'Explan.',
  };

  let abbreviated = title;
  
  // Replace long words with abbreviations
  Object.entries(abbreviations).forEach(([long, short]) => {
    const regex = new RegExp(`\\b${long}\\b`, 'gi');
    abbreviated = abbreviated.replace(regex, short);
  });

  return abbreviated;
}

export function LiveScanView({
  isScanning,
  scanResults,
  onSelectIssue,
  onBatchFixAll,
  onPublishToCanvas,
  onPublishSingleIssue,
  handleRevertStagedFix,
  onUndo,
  courseName,
  courseId,
  lastScanTime,
  enabledStandards,
  onRescan,
  scanError,
  onRetryScan,
  onDismissScanError
}: LiveScanViewProps) {
  const actionColor = "#3b82f6"; // Tab Blue

  // Dropdown state for action buttons on staged rows

  // Fallback: read persisted scan time from localStorage if prop not provided
  const displayScanTime = useMemo(() => {
    if (lastScanTime) return lastScanTime;
    if (!courseId) return undefined;
    try {
      const times = JSON.parse(localStorage.getItem('simplify_all_scan_times') || '{}');
      return times[courseId] ? new Date(times[courseId]) : undefined;
    } catch { return undefined; }
  }, [lastScanTime, courseId]);
  // Filter scan results based on enabled standards using the new standardsTags system
  const filteredResults = enabledStandards && enabledStandards.length > 0
    ? scanResults.filter(issue => {
        // Use the standardsTags field for filtering
        if (issue.standardsTags && issue.standardsTags.length > 0) {
          return issueMatchesEnabledStandards(issue.standardsTags, enabledStandards);
        }
        
        // Fallback to old rubricStandard field for backwards compatibility
        if (issue.rubricStandard) {
          const standard = issue.rubricStandard;
          
          // Map old rubricStandard format to enabled standards
          if (standard.match(/^[A-Z]\./)) {
            return enabledStandards.includes('cvc-oei');
          }
          if (standard.startsWith('QM')) {
            return enabledStandards.includes('quality-matters');
          }
          if (standard.startsWith('WCAG')) {
            return enabledStandards.includes('wcag');
          }
          if (standard.startsWith('P.') || standard.match(/^Peralta/i)) {
            return enabledStandards.includes('peralta');
          }
        }
        
        // If no standards tags and no rubricStandard, hide the issue (it's unmapped)
        return false;
      })
    : []; // If no enabled standards, show ZERO issues (per requirements)
  
  // Calculate counts based on filtered results
  const highCount = filteredResults.filter(r => r.severity === "high").length;
  const mediumCount = filteredResults.filter(r => r.severity === "medium").length;
  const lowCount = filteredResults.filter(r => r.severity === "low").length;
  
  // IMPORTANT: Count staged issues from ORIGINAL scanResults, not filtered
  // This allows publishing staged fixes even when they're filtered from view
  const stagedCount = scanResults.filter(r => r.status === 'staged').length;
  
  const pendingAutoFixableCount = filteredResults.filter(r => r.status === 'pending' && r.autoFixAvailable).length;
  
  // DEBUG: Log button state
  
  // Check if these are demo/sample issues
  const hasDemoIssues = filteredResults.length > 0 && filteredResults.every(issue => issue.isDemo === true);
  
  // Check if this is an "All Courses" scan
  const isAllCoursesScan = courseName === 'All Courses';
  
  // Check if no standards are selected
  const noStandardsSelected = enabledStandards && enabledStandards.length === 0;
  
  // Sort by severity (high first), then title to group similar issues
  const sortedResults = [...filteredResults].sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    const sevDiff = (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
    if (sevDiff !== 0) return sevDiff;
    return a.title.localeCompare(b.title);
  });

  // Group issues by course if it's an All Courses scan
  const groupedIssues = isAllCoursesScan
    ? sortedResults.reduce((acc, issue) => {
        const courseKey = issue.courseName || 'Unknown Course';
        if (!acc[courseKey]) {
          acc[courseKey] = [];
        }
        acc[courseKey].push(issue);
        return acc;
      }, {} as Record<string, typeof filteredResults>)
    : null;

  // Blank state - no scan performed yet
  if (!isScanning && scanResults.length === 0 && !displayScanTime) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-2">
        {/* Header Bar - Empty State */}
        <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden px-5 py-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5" style={{ color: '#636366' }} />
            <span className="text-[13px] text-[#1d1d1f] font-medium">Last Scan:</span>
            <span className="text-[13px] text-[#636366]">No scans yet</span>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden">
          <table className="w-full">
            <thead style={{ background: '#EEECE8', borderBottom: '1px solid #D4D2CC' }}>
              <tr className="text-left text-[13px]" style={{ color: '#52504A' }}>
                <th scope="col" className="px-4 py-3 font-semibold">Issue</th>
                <th scope="col" className="px-4 py-3 font-semibold">Location</th>
                <th scope="col" className="px-4 py-3 font-semibold">Severity</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-4 py-28">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-[#EEECE8] rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="w-6 h-6 text-[#636366]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[20px] tracking-tight text-[#1d1d1f] font-semibold mb-2">
                      No Scan Results Yet
                    </h3>
                    <p className="text-[14px] text-[#636366] leading-relaxed max-w-[500px]">
                      Click "Select Course to Scan" in the header to analyze a course for accessibility and usability issues.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // No standards selected - show empty state prompting user to select standards
  if (!isScanning && enabledStandards && enabledStandards.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-2">
        {/* Header Bar */}
        <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5" style={{ color: '#636366' }} />
              <span className="text-[13px] text-[#1d1d1f] font-medium">Last Scan:</span>
              {lastScanTime ? (
                <>
                  <span className="text-[14px] text-[#1d1d1f] font-semibold">{(courseName || 'Course').toUpperCase()}</span>
                  <span className="text-[#636366] text-[13px]">•</span>
                  <span className="text-[13px] text-[#636366]">
                    {lastScanTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {lastScanTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </span>
                </>
              ) : (
                <span className="text-[13px] text-[#636366]">No scans yet</span>
              )}
            </div>
            {onRescan && courseName && (
              <button
                onClick={onRescan}
                disabled={isScanning}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#0071e3] hover:bg-[#0071e3]/10 transition-colors disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                Rescan
              </button>
            )}
          </div>
        </div>

        {/* Empty State - No Standards Selected */}
        <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden">
          <table className="w-full">
            <thead style={{ background: '#EEECE8', borderBottom: '1px solid #D4D2CC' }}>
              <tr className="text-left text-[13px]" style={{ color: '#52504A' }}>
                <th scope="col" className="px-4 py-3 font-semibold">Issue</th>
                <th scope="col" className="px-4 py-3 font-semibold">Location</th>
                <th scope="col" className="px-4 py-3 font-semibold">Severity</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-4 py-28">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-[#EEECE8] rounded-full flex items-center justify-center mb-4">
                      <Filter className="w-6 h-6 text-[#636366]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[20px] tracking-tight text-[#1d1d1f] font-semibold mb-2">
                      Select a Standard to View Results
                    </h3>
                    <p className="text-[14px] text-[#636366] leading-relaxed max-w-[500px]">
                      Click "Standards" in the header to enable at least one rubric standard (CVC-OEI, Peralta, Quality Matters, or WCAG 2.2 AA).
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Empty course scanned - show success message
  if (!isScanning && scanResults.length === 0 && displayScanTime) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-2">
        {/* Header Bar - Empty Course State */}
        <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden px-5 py-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5" style={{ color: '#636366' }} />
            <span className="text-[13px] text-[#1d1d1f] font-medium">Last Scan:</span>
            <span className="text-[14px] text-[#1d1d1f] font-semibold">{(courseName || 'Course').toUpperCase()}</span>
            <span className="text-[#636366] text-[13px]">•</span>
            <span className="text-[13px] text-[#636366]">
              {displayScanTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {displayScanTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </span>
          </div>
        </div>

        {/* Empty Course Success State */}
        <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden">
          <table className="w-full">
            <thead style={{ background: '#EEECE8', borderBottom: '1px solid #D4D2CC' }}>
              <tr className="text-left text-[13px]" style={{ color: '#52504A' }}>
                <th scope="col" className="px-4 py-3 font-semibold">Issue</th>
                <th scope="col" className="px-4 py-3 font-semibold">Location</th>
                <th scope="col" className="px-4 py-3 font-semibold">Severity</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-4 py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-[#34C759]/10 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-[#34C759]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-[20px] tracking-tight text-[#1d1d1f] font-semibold mb-2">
                      Course is Empty
                    </h3>
                    <p className="text-[14px] text-[#636366] leading-relaxed max-w-[500px]">
                      This course has no pages, assignments, or announcements to scan. Add content to the course and scan again to check for accessibility and usability issues.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Scanning state
  if (isScanning) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-2">
        {/* Header Bar - Scanning State */}
        <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden px-5 py-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5 animate-spin" style={{ color: '#636366' }} />
            <span className="text-[13px] text-[#1d1d1f] font-medium">Last Scan:</span>
            {displayScanTime ? (
              <>
                <span className="text-[14px] text-[#1d1d1f] font-semibold">{(courseName || 'Course').toUpperCase()}</span>
                <span className="text-[#636366] text-[13px]">•</span>
                <span className="text-[13px] text-[#636366]">
                  {displayScanTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {displayScanTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </span>
              </>
            ) : (
              <span className="text-[13px] text-[#636366]">Scanning...</span>
            )}
          </div>
        </div>

        {/* Scanning State - Same Container as Empty State */}
        <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden">
          <table className="w-full">
            <thead style={{ background: '#EEECE8', borderBottom: '1px solid #D4D2CC' }}>
              <tr className="text-left text-[13px]" style={{ color: '#52504A' }}>
                <th scope="col" className="px-4 py-3 font-semibold">Issue</th>
                <th scope="col" className="px-4 py-3 font-semibold">Location</th>
                <th scope="col" className="px-4 py-3 font-semibold">Severity</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-4 py-28">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-12 h-12 bg-[#0071e3]/10 rounded-full flex items-center justify-center mb-4">
                      <Loader2 className="w-6 h-6 text-[#3b82f6] animate-spin" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[20px] tracking-tight text-[#1d1d1f] font-semibold mb-2">
                      Scanning Course...
                    </h3>
                    <p className="text-[14px] text-[#636366] leading-relaxed max-w-[500px]">
                      Analyzing {courseName || 'your course'} for accessibility and usability issues
                    </p>
                  </motion.div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  // Scan error state with no results - show full-page error
  if (scanError && !isScanning && scanResults.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-2">
        {/* Header Bar - Error State */}
        <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden px-5 py-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5" style={{ color: '#636366' }} />
            <span className="text-[13px] text-[#1d1d1f] font-medium">Last Scan:</span>
            {displayScanTime ? (
              <>
                <span className="text-[14px] text-[#1d1d1f] font-semibold">{(courseName || 'Course').toUpperCase()}</span>
                <span className="text-[#636366] text-[13px]">•</span>
                <span className="text-[13px] text-[#636366]">
                  {displayScanTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {displayScanTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </span>
              </>
            ) : (
              <span className="text-[13px] text-[#636366]">
                {courseName ? `${courseName.toUpperCase()} — Scan failed` : 'Scan failed'}
              </span>
            )}
          </div>
        </div>

        {/* Error State */}
        <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden">
          <table className="w-full">
            <thead style={{ background: '#EEECE8', borderBottom: '1px solid #D4D2CC' }}>
              <tr className="text-left text-[13px]" style={{ color: '#52504A' }}>
                <th scope="col" className="px-4 py-3 font-semibold">Issue</th>
                <th scope="col" className="px-4 py-3 font-semibold">Location</th>
                <th scope="col" className="px-4 py-3 font-semibold">Severity</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-4 py-20">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-14 h-14 bg-[#ff3b30]/10 rounded-full flex items-center justify-center mb-4">
                      <XCircle className="w-7 h-7 text-[#ff3b30]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[20px] tracking-tight text-[#1d1d1f] font-semibold mb-2">
                      Scan Failed
                    </h3>
                    <p className="text-[14px] text-[#636366] leading-relaxed max-w-[500px] mb-1">
                      Something went wrong while scanning {courseName || 'your course'}.
                    </p>
                    <p className="text-[13px] text-[#ff3b30]/80 leading-relaxed max-w-[500px] mb-6 font-mono bg-[#ff3b30]/5 px-3 py-1.5 rounded-[8px]">
                      {scanError}
                    </p>
                    <div className="flex items-center gap-3">
                      {onRetryScan && (
                        <button
                          onClick={onRetryScan}
                          className="h-[40px] px-5 rounded-[10px] bg-[#0071e3] hover:bg-[#0077ed] text-white text-[14px] font-semibold transition-colors flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Retry Scan
                        </button>
                      )}
                      {onDismissScanError && (
                        <button
                          onClick={onDismissScanError}
                          className="h-[40px] px-5 rounded-[10px] border border-[#d2d2d7] bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] text-[14px] font-medium transition-colors flex items-center gap-2"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </motion.div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // No standards selected state - show a message
  if (noStandardsSelected && scanResults.length > 0) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-2">
        {/* Header Bar */}
        <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden px-5 py-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5" style={{ color: '#636366' }} />
            <span className="text-[13px] text-[#1d1d1f] font-medium">Last Scan:</span>
            <span className="text-[14px] text-[#1d1d1f] font-semibold">{(courseName || 'No course').toUpperCase()}</span>
            <span className="text-[#636366] text-[13px]">•</span>
            <span className="text-[13px] text-[#636366]">
              {lastScanTime ? `${new Date(lastScanTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${new Date(lastScanTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` : 'Never'}
            </span>
          </div>
        </div>

        {/* No Filters Selected State */}
        <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden">
          <table className="w-full">
            <thead style={{ background: '#EEECE8', borderBottom: '1px solid #D4D2CC' }}>
              <tr className="text-left text-[13px]" style={{ color: '#52504A' }}>
                <th scope="col" className="w-[25%] px-5 py-3 font-semibold">Issue</th>
                <th scope="col" className="w-[11%] px-3 py-3 font-semibold text-center">Auto-fix</th>
                <th scope="col" className="w-[39%] px-5 py-3 font-semibold">Location</th>
                <th scope="col" className="w-[12.5%] px-5 py-3 font-semibold text-center">Severity</th>
                <th scope="col" className="w-[12.5%] px-5 py-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-20">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-[#ff9500]/10 rounded-full flex items-center justify-center mb-4">
                      <AlertTriangle className="w-6 h-6 text-[#ff9500]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[20px] tracking-tight text-[#1d1d1f] font-semibold mb-2">
                      No Standards Selected
                    </h3>
                    <p className="text-[14px] text-[#636366] leading-relaxed max-w-[500px] mb-4">
                      You've unselected all rubric standards. Please click the "Standards" button in the header to select at least one standard to view issues.
                    </p>
                    <p className="text-[12px] text-[#636366]">
                      Found {scanResults.length} total {scanResults.length === 1 ? 'issue' : 'issues'} in this course
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Results state - Option 1: Compact Table
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[1008px] mx-auto space-y-2"
    >
      {/* Header Bar - Sticky/Fixed */}
      <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5" style={{ color: '#636366' }} />
          <span className="text-[13px] text-[#1d1d1f] font-medium">Last Scan:</span>
          <span className="text-[14px] text-[#1d1d1f] font-semibold">
            {(courseName || 'Course').toUpperCase()}
          </span>
          {displayScanTime && (
            <>
              <span className="text-[#636366] text-[13px]">•</span>
              <span className="text-[13px] text-[#636366]">
                {displayScanTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {displayScanTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>
            </>
          )}
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBatchFixAll}
            disabled={pendingAutoFixableCount === 0 || !onBatchFixAll}
            className="text-[13px] font-medium flex items-center gap-1.5 transition-colors underline underline-offset-2"
            style={{
              color: pendingAutoFixableCount > 0 && onBatchFixAll ? actionColor : 'rgba(134,134,139,0.4)',
              textDecorationColor: pendingAutoFixableCount > 0 && onBatchFixAll ? `${actionColor}4D` : 'transparent',
              cursor: pendingAutoFixableCount > 0 && onBatchFixAll ? 'pointer' : 'not-allowed',
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            Fix All {pendingAutoFixableCount > 0 ? `(${pendingAutoFixableCount})` : ''}
          </button>
          <span className="w-px h-4 bg-[#d2d2d7]" />
          <button
            onClick={() => {
              if (stagedCount === 0) { console.error("No staged fixes to publish! stagedCount is 0"); return; }
              if (!onPublishToCanvas) { console.error("onPublishToCanvas is undefined!"); return; }
              onPublishToCanvas();
            }}
            disabled={stagedCount === 0 || !onPublishToCanvas}
            title={stagedCount === 0 ? "Stage fixes first by clicking Batch Fix All or individual Fix Now buttons" : "Publish all staged fixes to Canvas"}
            className="text-[13px] font-medium flex items-center gap-1.5 transition-colors underline underline-offset-2"
            style={{
              color: stagedCount > 0 && onPublishToCanvas ? actionColor : 'rgba(134,134,139,0.4)',
              textDecorationColor: stagedCount > 0 && onPublishToCanvas ? `${actionColor}4D` : 'transparent',
              cursor: stagedCount > 0 && onPublishToCanvas ? 'pointer' : 'not-allowed',
            }}
          >
            <Send className="w-3.5 h-3.5" />
            Publish {stagedCount > 0 ? `(${stagedCount})` : ''}
          </button>

        </div>
      </div>

      {/* Scan Error Banner - shown above results when scan failed with partial results */}
      {scanError && !isScanning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#fff5f5] rounded-[10px] border border-[#ff3b30]/20 px-5 py-3.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ff3b30]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <XCircle className="w-4.5 h-4.5 text-[#ff3b30]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[14px] text-[#1d1d1f] font-medium">
                Scan completed with errors
              </p>
              <p className="text-[12px] text-[#636366]">
                {scanError} — Showing {filteredResults.length} partial {filteredResults.length === 1 ? 'result' : 'results'} found before the error.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onRetryScan && (
              <button
                onClick={onRetryScan}
                className="h-[32px] px-4 rounded-[8px] bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Scan
              </button>
            )}
            {onDismissScanError && (
              <button
                onClick={onDismissScanError}
                className="w-[32px] h-[32px] rounded-[8px] border border-[#d2d2d7] bg-white hover:bg-[#f5f5f7] text-[#636366] transition-colors flex items-center justify-center"
                title="Dismiss error"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Table - Google Sheets Clean with Fixed Height and Scrolling */}
      <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden h-[500px] flex flex-col">
        {/* Header - Fixed */}
        <div className="border-b" style={{ borderColor: '#D4D2CC', background: '#EEECE8' }}>
          <div className="grid grid-cols-[300px_90px_200px_100px_100px_180px] gap-0 text-[13px] font-semibold" style={{ color: '#52504A' }}>
            <div className="px-5 py-3">Issue</div>
            <div className="px-3 py-3 text-center">Auto-fix</div>
            <div className="px-4 py-3">Location</div>
            <div className="px-4 py-3 text-center">Severity</div>
            <div className="px-4 py-3 text-center">Status</div>
            <div className="px-4 py-3 text-center">Action</div>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {isAllCoursesScan && groupedIssues ? (
            // Grouped view for All Courses scan
            <>
              {Object.entries(groupedIssues).map(([courseNameKey, issues], groupIndex) => (
                <div key={courseNameKey}>
                  {/* Course header row */}
                  <div className="bg-[#EEECE8] border-b border-[#e5e5ea] px-5 py-2.5">
                    <span className="text-[15px] font-semibold text-[#1d1d1f]">{courseNameKey}</span>
                    <span className="ml-2 text-[13px] text-[#636366]">({issues.length} {issues.length === 1 ? 'issue' : 'issues'})</span>
                  </div>
                  
                  {/* Issues for this course */}
                  <AnimatePresence mode="popLayout">
                    {issues.map((issue, index) => (
                      <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => onSelectIssue(issue)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectIssue(issue); } }}
                        aria-label={`${issue.title} — ${issue.severity} severity, ${issue.status || 'pending'}`}
                        className="grid grid-cols-[300px_90px_200px_100px_100px_180px] gap-0 border-b border-[#f5f5f7] cursor-pointer transition-all h-[44px] items-center"
                    onMouseEnter={(e) => { e.currentTarget.style.borderLeft = '3px solid #3b82f6'; e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderLeft = '3px solid transparent'; e.currentTarget.style.backgroundColor = ''; }}
                    onFocus={(e) => { e.currentTarget.style.borderLeft = '3px solid #3b82f6'; e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.04)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderLeft = '3px solid transparent'; e.currentTarget.style.backgroundColor = ''; }}
                      >
                        <div className="px-5 py-0 overflow-hidden">
                          <span className="text-[13px] text-[#1d1d1f] truncate block" title={issue.title}>
                            {issue.title}
                          </span>
                        </div>
                        <div className="px-3 py-0 text-center">
                          {issue.autoFixAvailable ? (
                            <span className="text-[13px] px-2 py-0.5 rounded-[4px] whitespace-nowrap inline-block font-medium" style={{ backgroundColor: '#EFF5FF', color: '#4888E0' }}>
                              auto-fix
                            </span>
                          ) : (
                            <span className="text-[13px] px-2 py-0.5 rounded-[4px] whitespace-nowrap inline-block font-medium" style={{ backgroundColor: '#F5F2ED', color: '#948C7E' }}>
                              manual fix
                            </span>
                          )}
                        </div>
                        <div className="px-4 py-0 overflow-hidden">
                          <span className="text-[13px] text-[#636366] truncate block" title={issue.location}>
                            {issue.location}
                          </span>
                        </div>
                        <div className="px-4 py-0 text-center">
                          <span className="text-[13px] px-2.5 py-1 rounded-[4px] font-medium inline-block" style={SEVERITY_COLORS[issue.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.low}>
                            {issue.severity}
                          </span>
                        </div>
                        <div className="px-4 py-0 text-center">
                          <span className="text-[12px] font-semibold" style={{ color: issue.status === 'staged' ? '#4d7033' : issue.status === 'published' ? '#566585' : issue.status === 'resolved' ? '#4d7033' : issue.status === 'ignored' ? '#636366' : '#7a7a7e' }}>
                            {issue.status || 'pending'}
                          </span>
                        </div>
                        <div className="px-2 py-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                          {issue.status === 'staged' && (onPublishSingleIssue || handleRevertStagedFix) && (
                            <div className="flex items-center gap-2">
                              {onPublishSingleIssue && (
                                <button
                                  onClick={() => onPublishSingleIssue(issue)}
                                  className="text-[12px] px-2.5 py-1 rounded-[4px] font-medium transition-colors whitespace-nowrap" style={{ backgroundColor: '#1E2E4A', color: '#FFFFFF', border: 'none' }}
                                >
                                  Publish
                                </button>
                              )}
                              {handleRevertStagedFix && (
                                <button
                                  onClick={() => handleRevertStagedFix(issue)}
                                  className="text-[12px] px-2.5 py-1 rounded-[6px] border border-[#d2d2d7] text-[#636366] hover:bg-[#f5f5f7] font-medium transition-colors whitespace-nowrap"
                                >
                                  Revert
                                </button>
                              )}
                            </div>
                          )}
                          {issue.status === 'published' && onUndo && (
                            <button
                              onClick={() => onUndo(issue)}
                              className="text-[12px] px-2.5 py-1 rounded-[6px] border border-[#ff9500] text-[#ff9500] hover:bg-[#ff9500]/10 font-medium transition-colors whitespace-nowrap"
                            >
                              Undo
                            </button>
                          )}
                          {issue.status === 'ignored' && (
                            <span className="text-[12px] px-2.5 py-1 rounded-[6px] bg-[#636366]/10 text-[#636366] font-medium whitespace-nowrap">
                              Ignored
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ))}
            </>
          ) : (
            // Regular view for single course scan
            <AnimatePresence mode="popLayout">
              {sortedResults.map((issue, index) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    onSelectIssue(issue);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectIssue(issue); } }}
                  aria-label={`${issue.title} — ${issue.severity} severity, ${issue.status || 'pending'}`}
                  className="grid grid-cols-[300px_90px_200px_100px_100px_180px] gap-0 border-b border-[#f5f5f7] cursor-pointer transition-all h-[44px] items-center"
                    onMouseEnter={(e) => { e.currentTarget.style.borderLeft = '3px solid #3b82f6'; e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderLeft = '3px solid transparent'; e.currentTarget.style.backgroundColor = ''; }}
                    onFocus={(e) => { e.currentTarget.style.borderLeft = '3px solid #3b82f6'; e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.04)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderLeft = '3px solid transparent'; e.currentTarget.style.backgroundColor = ''; }}
                >
                  <div className="px-5 py-0 overflow-hidden">
                    <span className="text-[13px] text-[#1d1d1f] truncate block" title={issue.title}>
                      {issue.title}
                    </span>
                  </div>
                  <div className="px-3 py-0 text-center">
                    {issue.autoFixAvailable ? (
                      <span className="text-[13px] px-2 py-0.5 rounded-[4px] whitespace-nowrap inline-block font-medium" style={{ backgroundColor: '#EFF5FF', color: '#4888E0' }}>
                        auto-fix
                      </span>
                    ) : (
                      <span className="text-[13px] px-2 py-0.5 rounded-[4px] whitespace-nowrap inline-block font-medium" style={{ backgroundColor: '#F5F2ED', color: '#948C7E' }}>
                        manual fix
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-0 overflow-hidden">
                    <span className="text-[13px] text-[#636366] truncate block" title={issue.location}>
                      {issue.location}
                    </span>
                  </div>
                  <div className="px-4 py-0 text-center">
                    <span className="text-[13px] px-2.5 py-1 rounded-[4px] font-medium inline-block" style={SEVERITY_COLORS[issue.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.low}>
                      {issue.severity}
                    </span>
                  </div>
                  <div className="px-4 py-0 text-center">
                    <span className={`text-[13px] px-2.5 py-1 rounded-[4px] font-medium inline-block ${
                      issue.status === 'staged' ? 'bg-[#E8F2E8] text-[#4d7033]' :
                      issue.status === 'published' ? 'bg-[#E8F0FE] text-[#566585]' :
                      issue.status === 'resolved' ? 'bg-[#E8F2E8] text-[#4d7033]' :
                      issue.status === 'ignored' ? 'bg-[#636366]/10 text-[#636366]' :
                      'bg-[#f5f5f7] text-[#7a7a7e]'
                    }`}>
                      {issue.status || 'pending'}
                    </span>
                  </div>
                  <div className="px-2 py-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    {issue.status === 'staged' && (onPublishSingleIssue || handleRevertStagedFix) && (
                      <div className="flex items-center gap-2">
                        {/* Publish button */}
                        {onPublishSingleIssue && (
                          <button
                            onClick={() => onPublishSingleIssue(issue)}
                            className="text-[12px] px-2.5 py-1 rounded-[4px] font-medium transition-colors whitespace-nowrap"
                            style={{ backgroundColor: '#1E2E4A', color: '#FFFFFF', border: 'none' }}
                          >
                            Publish
                          </button>
                        )}
                        {/* Revert button — plain, no dropdown */}
                        {handleRevertStagedFix && (
                          <button
                            onClick={() => handleRevertStagedFix(issue)}
                            className="text-[12px] px-2.5 py-1 rounded-[6px] border border-[#d2d2d7] text-[#636366] hover:bg-[#f5f5f7] font-medium transition-colors whitespace-nowrap"
                          >
                            Revert
                          </button>
                        )}
                      </div>
                    )}
                    {issue.status === 'published' && onUndo && (
                      <button
                        onClick={() => onUndo(issue)}
                        className="text-[12px] px-2.5 py-1 rounded-[6px] border border-[#ff9500] text-[#ff9500] hover:bg-[#ff9500]/10 font-medium transition-colors whitespace-nowrap"
                      >
                        Undo
                      </button>
                    )}
                    {issue.status === 'ignored' && (
                      <span className="text-[12px] px-2.5 py-1 rounded-[6px] bg-[#636366]/10 text-[#636366] font-medium whitespace-nowrap">
                        Ignored
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}