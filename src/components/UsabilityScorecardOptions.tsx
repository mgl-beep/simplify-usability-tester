import { CheckCircle2, Clock } from "lucide-react";
import { motion } from "motion/react";

interface UsabilityScorecardOptionsProps {
  scanResults?: any[];
  lastScanTime?: Date;
  variant?: 'bars' | 'mini-rings' | 'cards';
}

export function UsabilityScorecardOptions({ 
  scanResults = [], 
  lastScanTime,
  variant = 'bars' 
}: UsabilityScorecardOptionsProps) {
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

  // Option 1: Horizontal Bars Layout
  const BarsLayout = () => (
    <div className="space-y-4">
      {/* Overall Score */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <span className="text-[15px] text-[#1d1d1f] font-semibold">Course Health</span>
            <span className="text-[13px] text-[#636366] ml-2">Overall</span>
          </div>
          <span className="text-[22px] font-semibold text-[#1d1d1f]">
            {hasData ? overallScore : '--'}
          </span>
        </div>
        <div className="relative h-3 bg-[#e8e8eb] rounded-full overflow-hidden">
          {hasData && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallScore}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-[#0071e3] rounded-full"
            />
          )}
        </div>
        <div className="text-[13px] text-[#636366] mt-1">
          {hasData ? `${totalIssues} issues` : 'Run a scan'}
        </div>
      </div>

      {/* Accessibility Score */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <span className="text-[15px] text-[#1d1d1f] font-semibold">Accessibility</span>
          </div>
          <span className="text-[22px] font-semibold text-[#1d1d1f]">
            {hasData ? accessibilityScore : '--'}
          </span>
        </div>
        <div className="relative h-3 bg-[#e8e8eb] rounded-full overflow-hidden">
          {hasData && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${accessibilityScore}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="absolute top-0 left-0 h-full bg-[#28A745] rounded-full"
            />
          )}
        </div>
        <div className="text-[13px] text-[#636366] mt-1">{accessibilityIssues} issues</div>
      </div>

      {/* Usability Score */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <span className="text-[15px] text-[#1d1d1f] font-semibold">Usability</span>
          </div>
          <span className="text-[22px] font-semibold text-[#1d1d1f]">
            {hasData ? usabilityScore : '--'}
          </span>
        </div>
        <div className="relative h-3 bg-[#e8e8eb] rounded-full overflow-hidden">
          {hasData && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usabilityScore}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
              className="absolute top-0 left-0 h-full bg-[#E68A00] rounded-full"
            />
          )}
        </div>
        <div className="text-[13px] text-[#636366] mt-1">{usabilityIssues} issues</div>
      </div>
    </div>
  );

  // Option 2: Mini Rings in Horizontal Row
  const MiniRingsLayout = () => (
    <div className="flex items-start gap-6">
      {/* Overall Score */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative w-[60px] h-[60px]">
            <svg className="w-[60px] h-[60px] transform -rotate-90">
              <circle cx="30" cy="30" r="26" stroke="#e8e8eb" strokeWidth="6" fill="none" />
              {hasData && (
                <motion.circle
                  cx="30"
                  cy="30"
                  r="26"
                  stroke="#0071e3"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 163 }}
                  animate={{ strokeDashoffset: 163 - (163 * overallScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeDasharray="163"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-[18px] font-semibold ${hasData ? 'text-[#1d1d1f]' : 'text-[#636366]'}`}>
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
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative w-[60px] h-[60px]">
            <svg className="w-[60px] h-[60px] transform -rotate-90">
              <circle cx="30" cy="30" r="26" stroke="#e8e8eb" strokeWidth="6" fill="none" />
              {hasData && (
                <motion.circle
                  cx="30"
                  cy="30"
                  r="26"
                  stroke="#28A745"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 163 }}
                  animate={{ strokeDashoffset: 163 - (163 * accessibilityScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                  strokeDasharray="163"
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
            <div className="text-[15px] text-[#1d1d1f] font-semibold">Accessibility</div>
            <div className="text-[13px] text-[#636366]">{accessibilityIssues} issues</div>
          </div>
        </div>
      </div>

      {/* Usability Score */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative w-[60px] h-[60px]">
            <svg className="w-[60px] h-[60px] transform -rotate-90">
              <circle cx="30" cy="30" r="26" stroke="#e8e8eb" strokeWidth="6" fill="none" />
              {hasData && (
                <motion.circle
                  cx="30"
                  cy="30"
                  r="26"
                  stroke="#E68A00"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 163 }}
                  animate={{ strokeDashoffset: 163 - (163 * usabilityScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                  strokeDasharray="163"
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
            <div className="text-[15px] text-[#1d1d1f] font-semibold">Usability</div>
            <div className="text-[13px] text-[#636366]">{usabilityIssues} issues</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Option 3: Card-based Layout (like KPI cards)
  const CardsLayout = () => (
    <div className="grid grid-cols-3 gap-3">
      {/* Overall Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#EEECE8] rounded-[10px] border border-[#d2d2d7] p-4"
      >
        <div className="text-[13px] text-[#636366] mb-1 font-medium">Course Health</div>
        <div className="text-[32px] font-semibold tracking-tight leading-none mb-2 text-[#1d1d1f]">
          {hasData ? overallScore : '--'}
        </div>
        <div className="relative h-2 bg-[#e8e8eb] rounded-full overflow-hidden mb-2">
          {hasData && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallScore}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-[#0071e3] rounded-full"
            />
          )}
        </div>
        <div className="text-[13px] text-[#636366]">
          {hasData ? `${totalIssues} issues` : 'Run a scan'}
        </div>
      </motion.div>

      {/* Accessibility Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-[#EEECE8] rounded-[10px] border border-[#d2d2d7] p-4"
      >
        <div className="text-[13px] text-[#636366] mb-1 font-medium">Accessibility</div>
        <div className="text-[32px] font-semibold tracking-tight leading-none mb-2 text-[#1d1d1f]">
          {hasData ? accessibilityScore : '--'}
        </div>
        <div className="relative h-2 bg-[#e8e8eb] rounded-full overflow-hidden mb-2">
          {hasData && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${accessibilityScore}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="absolute top-0 left-0 h-full bg-[#28A745] rounded-full"
            />
          )}
        </div>
        <div className="text-[13px] text-[#636366]">{accessibilityIssues} issues</div>
      </motion.div>

      {/* Usability Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-[#EEECE8] rounded-[10px] border border-[#d2d2d7] p-4"
      >
        <div className="text-[13px] text-[#636366] mb-1 font-medium">Usability</div>
        <div className="text-[32px] font-semibold tracking-tight leading-none mb-2 text-[#1d1d1f]">
          {hasData ? usabilityScore : '--'}
        </div>
        <div className="relative h-2 bg-[#e8e8eb] rounded-full overflow-hidden mb-2">
          {hasData && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usabilityScore}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
              className="absolute top-0 left-0 h-full bg-[#E68A00] rounded-full"
            />
          )}
        </div>
        <div className="text-[13px] text-[#636366]">{usabilityIssues} issues</div>
      </motion.div>
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
        {variant === 'bars' && <BarsLayout />}
        {variant === 'mini-rings' && <MiniRingsLayout />}
        {variant === 'cards' && <CardsLayout />}

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
