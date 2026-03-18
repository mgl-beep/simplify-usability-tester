import { TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { motion } from "motion/react";

interface UsabilityScorecardProps {
  scanResults?: any[];
  lastScanTime?: Date;
  onOpenDrawer?: () => void;
}

export function UsabilityScorecard({ scanResults = [], lastScanTime, onOpenDrawer }: UsabilityScorecardProps) {
  // Only show "no data" state if explicitly no scan results exist
  const hasData = scanResults && scanResults.length > 0;
  
  // Calculate scores based on actual scan results
  const totalIssues = hasData ? scanResults.length : 0;
  const accessibilityIssues = hasData ? scanResults.filter(issue => issue.type === 'accessibility').length : 0;
  const usabilityIssues = hasData ? scanResults.filter(issue => issue.type === 'usability').length : 0;
  
  // Score calculation: 100 - (issues * weight)
  // High severity = 10 points, Medium = 5 points, Low = 2 points
  const calculateScore = (issues: any[]) => {
    if (issues.length === 0) return 100;
    const penalty = issues.reduce((sum, issue) => {
      if (issue.severity === 'high') return sum + 10;
      if (issue.severity === 'medium') return sum + 5;
      return sum + 2;
    }, 0);
    return Math.max(0, Math.min(100, 100 - penalty));
  };
  
  const accessibilityScore = hasData ? calculateScore(scanResults.filter(issue => issue.type === 'accessibility')) : null;
  const usabilityScore = hasData ? calculateScore(scanResults.filter(issue => issue.type === 'usability')) : null;
  const overallScore = (accessibilityScore !== null && usabilityScore !== null) ? Math.round((accessibilityScore + usabilityScore) / 2) : null;

  // Get recent improvements (fixed issues)
  const improvements = scanResults
    .filter(issue => issue.status === 'fixed')
    .slice(0, 3)
    .map(issue => ({
      date: "Today",
      item: issue.title,
      type: issue.type
    }));

  // Format last scan time
  const formatLastScan = () => {
    if (!lastScanTime) return null;
    const dateStr = lastScanTime.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const timeStr = lastScanTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    return `${dateStr} at ${timeStr}`;
  };

  return (
    <div className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden" style={{ maxWidth: 720 }}>
      <div className="px-4 py-3 border-b" style={{ background: '#EEECE8', borderColor: '#D4D2CC' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[22px] tracking-tight text-[#1d1d1f] font-semibold">Usability Scorecard</h2>
            <p className="text-[15px] text-[#636366] mt-0.5">
              {hasData ? `Based on ${totalIssues} issues found` : 'No scan data available'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Gauge Layout - Aligned Grid with increased size */}
        <div className="grid grid-cols-3 gap-6 mb-4">
          {/* Overall Score Gauge — clickable, opens drawer */}
          <button
            className="flex flex-col items-center cursor-pointer group"
            onClick={() => { onOpenDrawer?.(); window.dispatchEvent(new CustomEvent('simplify-open-drawer')); localStorage.setItem('simplify_seen_gauge_click', '1'); }}
            title="View Audit & Evidence Report"
            style={undefined}
          >
            <div className="relative w-[210px] h-[127px] mb-2 group-hover:scale-[1.03] transition-transform">
              <svg className="w-[210px] h-[127px]" viewBox="0 0 210 127" role="img" aria-label={`Overall score: ${hasData ? overallScore : 'no data'} out of 100`}>
                {/* Background track - continuous arc */}
                <path
                  d="M 30 113 A 75 75 0 0 1 180 113"
                  stroke="#e8e8eb"
                  strokeWidth="32"
                  fill="none"
                  strokeLinecap="butt"
                />
                {/* Progress arc */}
                {hasData && (
                  <motion.path
                    d="M 30 113 A 75 75 0 0 1 180 113"
                    stroke="#0071e3"
                    strokeWidth="32"
                    fill="none"
                    strokeLinecap="butt"
                    initial={{ strokeDashoffset: 236 }}
                    animate={{ strokeDashoffset: 236 - (236 * overallScore) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeDasharray="236"
                  />
                )}
              </svg>
              <div className="absolute bottom-2 left-0 right-0 text-center">
                <span className={`text-[46px] font-semibold leading-none ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
                  {hasData ? overallScore : '--'}
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-[15px] text-[#1d1d1f] font-semibold mb-0.5 group-hover:text-[#0071e3] transition-colors">Statewide Compliance</div>
              <div className="text-[15px] text-[#636366]">
                {hasData ? `${totalIssues} issues` : 'Run a scan'}
              </div>
            </div>
          </button>

          {/* Accessibility Score Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative w-[210px] h-[127px] mb-2">
              <svg className="w-[210px] h-[127px]" viewBox="0 0 210 127" role="img" aria-label={`Accessibility score: ${hasData ? accessibilityScore : 'no data'} out of 100`}>
                {/* Background track - continuous arc */}
                <path
                  d="M 30 113 A 75 75 0 0 1 180 113"
                  stroke="#e8e8eb"
                  strokeWidth="32"
                  fill="none"
                  strokeLinecap="butt"
                />
                {/* Progress arc */}
                {hasData && (
                  <motion.path
                    d="M 30 113 A 75 75 0 0 1 180 113"
                    stroke="#28A745"
                    strokeWidth="32"
                    fill="none"
                    strokeLinecap="butt"
                    initial={{ strokeDashoffset: 236 }}
                    animate={{ strokeDashoffset: 236 - (236 * accessibilityScore) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    strokeDasharray="236"
                  />
                )}
              </svg>
              <div className="absolute bottom-2 left-0 right-0 text-center">
                <span className={`text-[46px] font-semibold leading-none ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
                  {hasData ? accessibilityScore : '--'}
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-[15px] text-[#1d1d1f] font-semibold mb-0.5">Accessibility</div>
              <div className="text-[15px] text-[#636366]">{accessibilityIssues} issues</div>
            </div>
          </div>

          {/* Usability Score Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative w-[210px] h-[127px] mb-2">
              <svg className="w-[210px] h-[127px]" viewBox="0 0 210 127" role="img" aria-label={`Usability score: ${hasData ? usabilityScore : 'no data'} out of 100`}>
                {/* Background track - continuous arc */}
                <path
                  d="M 30 113 A 75 75 0 0 1 180 113"
                  stroke="#e8e8eb"
                  strokeWidth="32"
                  fill="none"
                  strokeLinecap="butt"
                />
                {/* Progress arc */}
                {hasData && (
                  <motion.path
                    d="M 30 113 A 75 75 0 0 1 180 113"
                    stroke="#E68A00"
                    strokeWidth="32"
                    fill="none"
                    strokeLinecap="butt"
                    initial={{ strokeDashoffset: 236 }}
                    animate={{ strokeDashoffset: 236 - (236 * usabilityScore) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                    strokeDasharray="236"
                  />
                )}
              </svg>
              <div className="absolute bottom-2 left-0 right-0 text-center">
                <span className={`text-[46px] font-semibold leading-none ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
                  {hasData ? usabilityScore : '--'}
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-[15px] text-[#1d1d1f] font-semibold mb-0.5">Usability</div>
              <div className="text-[15px] text-[#636366]">{usabilityIssues} issues</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}