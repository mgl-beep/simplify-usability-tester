interface QuickStatsProps {
  onIssuesClick?: () => void;
  issuesCount?: number;
  scanResults?: any[];
  lastScanTime?: Date;
}

export function QuickStats({ onIssuesClick, issuesCount = 0, scanResults = [], lastScanTime }: QuickStatsProps) {
  // Format last scan time as actual date/time
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

  // Calculate real stats from scan results
  const accessibilityIssues = scanResults.filter(issue => issue.type === 'accessibility').length;
  const usabilityIssues = scanResults.filter(issue => issue.type === 'usability').length;
  const highSeverityIssues = scanResults.filter(issue => issue.severity === 'high').length;

  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-[16px] p-5 border border-[#d2d2d7]/50 shadow-sm">
          <div className="text-[16px] text-[#636366] mb-1">Total Issues</div>
          <div className="text-[32px] tracking-tight text-[#1d1d1f]">{scanResults.length}</div>
          <div className="text-[16px] text-[#636366] mt-1">
            {scanResults.length === 0 ? 'No scan yet' : 'Found in last scan'}
          </div>
        </div>
        
        <div className="bg-white rounded-[16px] p-5 border border-[#d2d2d7]/50 shadow-sm">
          <div className="text-[16px] text-[#636366] mb-1">Accessibility</div>
          <div className="text-[32px] tracking-tight text-[#1d1d1f]">{accessibilityIssues}</div>
          <div className="text-[16px] text-[#636366] mt-1">WCAG 2.2 AA</div>
        </div>
        
        <div className="bg-white rounded-[16px] p-5 border border-[#d2d2d7]/50 shadow-sm">
          <div className="text-[16px] text-[#636366] mb-1">Usability</div>
          <div className="text-[32px] tracking-tight text-[#1d1d1f]">{usabilityIssues}</div>
          <div className="text-[16px] text-[#636366] mt-1">CVC-OEI standards</div>
        </div>

        <div className="bg-white rounded-[16px] p-5 border border-[#d2d2d7]/50 shadow-sm">
          <div className="text-[16px] text-[#636366] mb-1">High Priority</div>
          <div className="text-[32px] tracking-tight text-[#1d1d1f]">{highSeverityIssues}</div>
          <div className="text-[16px] text-[#DC3545] mt-1">Needs immediate attention</div>
        </div>
      </div>
    </div>
  );
}