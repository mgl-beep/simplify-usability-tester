import { CheckCircle2, Clock } from "lucide-react";
import { motion } from "motion/react";

interface UsabilityScorecardRingOptionsProps {
  scanResults?: any[];
  lastScanTime?: Date;
  variant?: 'thin-rings' | 'gauge' | 'compact-grid' | 'vertical-stack';
}

export function UsabilityScorecardRingOptions({ 
  scanResults = [], 
  lastScanTime,
  variant = 'thin-rings' 
}: UsabilityScorecardRingOptionsProps) {
  const hasData = scanResults && scanResults.length > 0;
  
  const totalIssues = hasData ? scanResults.length : 0;
  const accessibilityIssues = hasData ? scanResults.filter(issue => issue.type === 'accessibility').length : 0;
  const usabilityIssues = hasData ? scanResults.filter(issue => issue.type === 'usability').length : 0;
  
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

  const improvements = scanResults
    .filter(issue => issue.status === 'fixed')
    .slice(0, 3)
    .map(issue => ({
      date: "Today",
      item: issue.title,
      type: issue.type
    }));

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

  // Option 1: Thin Rings with Large Numbers
  const ThinRingsLayout = () => (
    <div className="flex items-center justify-between gap-8">
      {/* Overall Score */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-[70px] h-[70px]">
          <svg className="w-[70px] h-[70px] transform -rotate-90">
            <circle cx="35" cy="35" r="32" stroke="#EEECE8" strokeWidth="4" fill="none" />
            {hasData && (
              <motion.circle
                cx="35"
                cy="35"
                r="32"
                stroke="#0071e3"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 201 }}
                animate={{ strokeDashoffset: 201 - (201 * overallScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeDasharray="201"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-[22px] font-semibold ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
              {hasData ? overallScore : '--'}
            </span>
          </div>
        </div>
        <div>
          <div className="text-[15px] text-[#1d1d1f] font-semibold">Course Health</div>
          <div className="text-[13px] text-[#636366]">{hasData ? `${totalIssues} issues` : 'Run a scan'}</div>
        </div>
      </div>

      {/* Accessibility Score */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-[70px] h-[70px]">
          <svg className="w-[70px] h-[70px] transform -rotate-90">
            <circle cx="35" cy="35" r="32" stroke="#EEECE8" strokeWidth="4" fill="none" />
            {hasData && (
              <motion.circle
                cx="35"
                cy="35"
                r="32"
                stroke="#28A745"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 201 }}
                animate={{ strokeDashoffset: 201 - (201 * accessibilityScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                strokeDasharray="201"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-[22px] font-semibold ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
              {hasData ? accessibilityScore : '--'}
            </span>
          </div>
        </div>
        <div>
          <div className="text-[15px] text-[#1d1d1f] font-semibold">Accessibility</div>
          <div className="text-[13px] text-[#636366]">{accessibilityIssues} issues</div>
        </div>
      </div>

      {/* Usability Score */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-[70px] h-[70px]">
          <svg className="w-[70px] h-[70px] transform -rotate-90">
            <circle cx="35" cy="35" r="32" stroke="#EEECE8" strokeWidth="4" fill="none" />
            {hasData && (
              <motion.circle
                cx="35"
                cy="35"
                r="32"
                stroke="#E68A00"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 201 }}
                animate={{ strokeDashoffset: 201 - (201 * usabilityScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                strokeDasharray="201"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-[22px] font-semibold ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
              {hasData ? usabilityScore : '--'}
            </span>
          </div>
        </div>
        <div>
          <div className="text-[15px] text-[#1d1d1f] font-semibold">Usability</div>
          <div className="text-[13px] text-[#636366]">{usabilityIssues} issues</div>
        </div>
      </div>
    </div>
  );

  // Option 2: Gauge/Semi-Circle Style
  const GaugeLayout = () => (
    <div className="flex items-end justify-between gap-6">
      {/* Overall Score Gauge */}
      <div className="flex-1 flex flex-col items-center">
        <div className="relative w-[120px] h-[65px] mb-2">
          <svg className="w-[120px] h-[65px]" viewBox="0 0 120 65">
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              stroke="#EEECE8"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {hasData && (
              <motion.path
                d="M 10 60 A 50 50 0 0 1 110 60"
                stroke="#0071e3"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 157 }}
                animate={{ strokeDashoffset: 157 - (157 * overallScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeDasharray="157"
              />
            )}
          </svg>
          <div className="absolute bottom-0 left-0 right-0 text-center">
            <span className={`text-[28px] font-semibold ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
              {hasData ? overallScore : '--'}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-[15px] text-[#1d1d1f] font-semibold">Course Health</div>
          <div className="text-[13px] text-[#636366]">{hasData ? `${totalIssues} issues` : 'Run a scan'}</div>
        </div>
      </div>

      {/* Accessibility Score Gauge */}
      <div className="flex-1 flex flex-col items-center">
        <div className="relative w-[120px] h-[65px] mb-2">
          <svg className="w-[120px] h-[65px]" viewBox="0 0 120 65">
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              stroke="#EEECE8"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {hasData && (
              <motion.path
                d="M 10 60 A 50 50 0 0 1 110 60"
                stroke="#28A745"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 157 }}
                animate={{ strokeDashoffset: 157 - (157 * accessibilityScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                strokeDasharray="157"
              />
            )}
          </svg>
          <div className="absolute bottom-0 left-0 right-0 text-center">
            <span className={`text-[28px] font-semibold ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
              {hasData ? accessibilityScore : '--'}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-[15px] text-[#1d1d1f] font-semibold">Accessibility</div>
          <div className="text-[13px] text-[#636366]">{accessibilityIssues} issues</div>
        </div>
      </div>

      {/* Usability Score Gauge */}
      <div className="flex-1 flex flex-col items-center">
        <div className="relative w-[120px] h-[65px] mb-2">
          <svg className="w-[120px] h-[65px]" viewBox="0 0 120 65">
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              stroke="#EEECE8"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {hasData && (
              <motion.path
                d="M 10 60 A 50 50 0 0 1 110 60"
                stroke="#E68A00"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 157 }}
                animate={{ strokeDashoffset: 157 - (157 * usabilityScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                strokeDasharray="157"
              />
            )}
          </svg>
          <div className="absolute bottom-0 left-0 right-0 text-center">
            <span className={`text-[28px] font-semibold ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
              {hasData ? usabilityScore : '--'}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-[15px] text-[#1d1d1f] font-semibold">Usability</div>
          <div className="text-[13px] text-[#636366]">{usabilityIssues} issues</div>
        </div>
      </div>
    </div>
  );

  // Option 3: Compact Grid (2 columns)
  const CompactGridLayout = () => (
    <div className="grid grid-cols-2 gap-4">
      {/* Overall Score - Spans 2 columns */}
      <div className="col-span-2 flex items-center gap-4 bg-[#EEECE8] rounded-[10px] p-3 border border-[#d2d2d7]">
        <div className="relative w-[65px] h-[65px]">
          <svg className="w-[65px] h-[65px] transform -rotate-90">
            <circle cx="32.5" cy="32.5" r="28" stroke="#EEECE8" strokeWidth="6" fill="none" />
            {hasData && (
              <motion.circle
                cx="32.5"
                cy="32.5"
                r="28"
                stroke="#0071e3"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 176 }}
                animate={{ strokeDashoffset: 176 - (176 * overallScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeDasharray="176"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-[20px] font-semibold ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
              {hasData ? overallScore : '--'}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[15px] text-[#1d1d1f] font-semibold">Course Health</div>
          <div className="text-[13px] text-[#636366]">{hasData ? `${totalIssues} issues` : 'Run a scan'}</div>
        </div>
      </div>

      {/* Accessibility Score */}
      <div className="flex items-center gap-3 bg-[#EEECE8] rounded-[10px] p-3 border border-[#d2d2d7]">
        <div className="relative w-[55px] h-[55px]">
          <svg className="w-[55px] h-[55px] transform -rotate-90">
            <circle cx="27.5" cy="27.5" r="24" stroke="#EEECE8" strokeWidth="5" fill="none" />
            {hasData && (
              <motion.circle
                cx="27.5"
                cy="27.5"
                r="24"
                stroke="#28A745"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 151 }}
                animate={{ strokeDashoffset: 151 - (151 * accessibilityScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                strokeDasharray="151"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-[18px] font-semibold ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
              {hasData ? accessibilityScore : '--'}
            </span>
          </div>
        </div>
        <div>
          <div className="text-[14px] text-[#1d1d1f] font-semibold">Accessibility</div>
          <div className="text-[13px] text-[#636366]">{accessibilityIssues} issues</div>
        </div>
      </div>

      {/* Usability Score */}
      <div className="flex items-center gap-3 bg-[#EEECE8] rounded-[10px] p-3 border border-[#d2d2d7]">
        <div className="relative w-[55px] h-[55px]">
          <svg className="w-[55px] h-[55px] transform -rotate-90">
            <circle cx="27.5" cy="27.5" r="24" stroke="#EEECE8" strokeWidth="5" fill="none" />
            {hasData && (
              <motion.circle
                cx="27.5"
                cy="27.5"
                r="24"
                stroke="#E68A00"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 151 }}
                animate={{ strokeDashoffset: 151 - (151 * usabilityScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                strokeDasharray="151"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-[18px] font-semibold ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
              {hasData ? usabilityScore : '--'}
            </span>
          </div>
        </div>
        <div>
          <div className="text-[14px] text-[#1d1d1f] font-semibold">Usability</div>
          <div className="text-[13px] text-[#636366]">{usabilityIssues} issues</div>
        </div>
      </div>
    </div>
  );

  // Option 4: Vertical Stack (Most Compact)
  const VerticalStackLayout = () => (
    <div className="space-y-3">
      {/* Overall Score */}
      <div className="flex items-center justify-between bg-[#EEECE8] rounded-[10px] p-3 border border-[#d2d2d7]">
        <div className="flex items-center gap-3">
          <div className="relative w-[50px] h-[50px]">
            <svg className="w-[50px] h-[50px] transform -rotate-90">
              <circle cx="25" cy="25" r="22" stroke="#EEECE8" strokeWidth="4" fill="none" />
              {hasData && (
                <motion.circle
                  cx="25"
                  cy="25"
                  r="22"
                  stroke="#0071e3"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 138 }}
                  animate={{ strokeDashoffset: 138 - (138 * overallScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeDasharray="138"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-[16px] font-semibold ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
                {hasData ? overallScore : '--'}
              </span>
            </div>
          </div>
          <div>
            <div className="text-[15px] text-[#1d1d1f] font-semibold">Course Health</div>
            <div className="text-[13px] text-[#636366]">{hasData ? `${totalIssues} issues` : 'Run a scan'}</div>
          </div>
        </div>
      </div>

      {/* Accessibility Score */}
      <div className="flex items-center justify-between bg-[#EEECE8] rounded-[10px] p-3 border border-[#d2d2d7]">
        <div className="flex items-center gap-3">
          <div className="relative w-[50px] h-[50px]">
            <svg className="w-[50px] h-[50px] transform -rotate-90">
              <circle cx="25" cy="25" r="22" stroke="#EEECE8" strokeWidth="4" fill="none" />
              {hasData && (
                <motion.circle
                  cx="25"
                  cy="25"
                  r="22"
                  stroke="#28A745"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 138 }}
                  animate={{ strokeDashoffset: 138 - (138 * accessibilityScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                  strokeDasharray="138"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-[16px] font-semibold ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
                {hasData ? accessibilityScore : '--'}
              </span>
            </div>
          </div>
          <div>
            <div className="text-[15px] text-[#1d1d1f] font-semibold">Accessibility</div>
            <div className="text-[13px] text-[#636366]">{accessibilityIssues} issues</div>
          </div>
        </div>
      </div>

      {/* Usability Score */}
      <div className="flex items-center justify-between bg-[#EEECE8] rounded-[10px] p-3 border border-[#d2d2d7]">
        <div className="flex items-center gap-3">
          <div className="relative w-[50px] h-[50px]">
            <svg className="w-[50px] h-[50px] transform -rotate-90">
              <circle cx="25" cy="25" r="22" stroke="#EEECE8" strokeWidth="4" fill="none" />
              {hasData && (
                <motion.circle
                  cx="25"
                  cy="25"
                  r="22"
                  stroke="#E68A00"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 138 }}
                  animate={{ strokeDashoffset: 138 - (138 * usabilityScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                  strokeDasharray="138"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-[16px] font-semibold ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
                {hasData ? usabilityScore : '--'}
              </span>
            </div>
          </div>
          <div>
            <div className="text-[15px] text-[#1d1d1f] font-semibold">Usability</div>
            <div className="text-[13px] text-[#636366]">{usabilityIssues} issues</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden max-w-[826px]">
      <div className="px-4 py-3 border-b border-[#d2d2d7] bg-[#EEECE8]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[22px] tracking-tight text-[#1d1d1f] font-semibold">Usability Scorecard</h2>
            <p className="text-[13px] text-[#636366] mt-0.5">
              {hasData ? `Based on ${totalIssues} issues found` : 'No scan data available'}
            </p>
          </div>
          {lastScanTime && (
            <span className="text-[13px] text-[#636366]">Last scan: {formatLastScan()}</span>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Render selected variant */}
        {variant === 'thin-rings' && <ThinRingsLayout />}
        {variant === 'gauge' && <GaugeLayout />}
        {variant === 'compact-grid' && <CompactGridLayout />}
        {variant === 'vertical-stack' && <VerticalStackLayout />}

        {/* Recent Activity - Same for all variants */}
        <div className="border-t border-[#d2d2d7] pt-3.5 mt-4">
          <h3 className="text-[15px] text-[#1d1d1f] font-semibold mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#636366]" strokeWidth={2} />
            Recent Activity
          </h3>
          <div className="space-y-1.5">
            {hasData ? (
              improvements.length > 0 ? (
                improvements.map((improvement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#34c759]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                    </div>
                    <span className="text-[13px] text-[#1d1d1f] flex-1">{improvement.item}</span>
                    <span className={`text-[13px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                      improvement.type === "accessibility" 
                        ? "bg-[#34c759]/10 text-[#34c759]" 
                        : "bg-[#FF9F0A]/10 text-[#FF9F0A]"
                    }`}>
                      {improvement.type}
                    </span>
                    <button className="text-[13px] text-[#0071e3] hover:text-[#0077ed] hover:underline transition-all duration-200 ease-out px-2 font-medium">
                      Undo
                    </button>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-[#636366]/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#636366]" strokeWidth={2} />
                  </div>
                  <span className="text-[13px] text-[#636366] flex-1">No issues fixed yet</span>
                </motion.div>
              )
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-[#636366]/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#636366]" strokeWidth={2} />
                </div>
                <span className="text-[13px] text-[#636366] flex-1">Start by selecting a course and running a scan</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
