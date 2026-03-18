import { Link2Off, ImageOff, Volume2, Eye, FileText, TrendingUp, Navigation2, Download, CheckCircle2, AlertTriangle, XCircle, ArrowUp, ArrowDown, Minus, ChevronRight, ExternalLink, Shield } from "lucide-react";
import { motion } from "motion/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "./ui/button";
import { StatewideComplianceDrawer } from "./StatewideComplianceDrawer";
import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";

interface AnalyticsProps {
  scanResults?: any[];
  selectedCourse?: { courseId: number; courseName: string } | null;
  lastScanTime?: Date;
}

// Shared StatCard Component
interface StatCardProps {
  title: string;
  number: string | number;
  subtitle: string | React.ReactNode;
  delay?: number;
  numberColor?: string;
}

function StatCard({ title, number, subtitle, delay = 0, numberColor = "#1d1d1f" }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-[#EEECE8] rounded-[12px] border border-[#e5e5e7] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-4 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow flex flex-col justify-between h-[150px]"
    >
      <div className="text-[14px] text-[#636366] font-medium leading-[1.2] truncate">
        {title}
      </div>
      <div className="flex items-baseline gap-1">
        <div 
          className="text-[48px] font-semibold tracking-tight leading-none truncate" 
          style={{ color: numberColor }}
        >
          {number}
        </div>
      </div>
      <div className="text-[13px] text-[#636366] font-normal leading-[1.3] truncate">
        {subtitle}
      </div>
    </motion.div>
  );
}

export function Analytics({ scanResults = [], selectedCourse, lastScanTime }: AnalyticsProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showReportsPulse] = useState(() => !localStorage.getItem('simplify_seen_view_reports'));

  // Listen for gauge click from UsabilityScorecard
  useEffect(() => {
    const handler = () => setIsDrawerOpen(true);
    window.addEventListener('simplify-open-drawer', handler);
    return () => window.removeEventListener('simplify-open-drawer', handler);
  }, []);

  // Process scan results to get actual data
  const accessibilityIssues = scanResults.filter(issue => issue.type === 'accessibility');
  const usabilityIssues = scanResults.filter(issue => issue.type === 'usability');

  const totalAccessibilityIssues = accessibilityIssues.length;
  const totalUsabilityIssues = usabilityIssues.length;

  // Calculate scores (same logic as UsabilityScorecard)
  const calculateScore = (issues: any[]) => {
    const penalty = issues.reduce((sum, issue) => {
      if (issue.severity === 'high') return sum + 10;
      if (issue.severity === 'medium') return sum + 5;
      return sum + 2;
    }, 0);
    return Math.max(0, Math.min(100, 100 - penalty));
  };

  const avgAccessibility = calculateScore(accessibilityIssues);
  const avgUsability = calculateScore(usabilityIssues);
  const overallScore = Math.round((avgAccessibility + avgUsability) / 2);

  // Calculate standards-specific metrics

  const cvcOeiIssues = scanResults.filter(i => {
    if (!i.standardsTags || i.standardsTags.length === 0) return false;
    return i.standardsTags.some((tag: string) => tag.toLowerCase().includes('cvc-oei'));
  });

  const peraltaIssues = scanResults.filter(i => {
    if (!i.standardsTags || i.standardsTags.length === 0) return false;
    return i.standardsTags.some((tag: string) => tag.toLowerCase().includes('peralta'));
  });

  const qmIssues = scanResults.filter(i => {
    if (!i.standardsTags || i.standardsTags.length === 0) return false;
    return i.standardsTags.some((tag: string) =>
      tag.toLowerCase().startsWith('qm:') || tag.toLowerCase() === 'qm'
    );
  });

  // Calculate per-standard compliance percentages using the same penalty-based scoring
  const cvcOeiCompliance = cvcOeiIssues.length === 0 ? 100 : calculateScore(cvcOeiIssues);
  const peraltaCompliance = peraltaIssues.length === 0 ? 100 : calculateScore(peraltaIssues);
  const qmCompliance = qmIssues.length === 0 ? 100 : calculateScore(qmIssues);

  const getComplianceColor = (pct: number) => {
    if (pct >= 85) return '#1a7d32';
    if (pct >= 60) return '#b36b00';
    return '#c62828';
  };

  // Statewide Compliance Metrics - NOW USES SEVERITY-WEIGHTED SCORING (SAME AS STANDARDS)
  const complianceRate = calculateScore(scanResults);
  const highSeverity = scanResults.filter(i => i.severity === 'high').length;
  const complianceStatus = highSeverity === 0 && scanResults.length < 10 ? "Meets" : 
                          highSeverity < 3 && scanResults.length < 30 ? "Partial" : "Needs Attention";
  const courseCoverage = 100; // Simulated - single course scanned

  // Trend data - baseline vs current
  const trendData = [
    { point: "Baseline", score: Math.max(0, overallScore - 15) },
    { point: "Latest", score: overallScore }
  ];

  // Export handlers
  const handleExportPDF = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      alert('Please allow pop-ups to export PDF');
      return;
    }
    
    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SIMPLIFY Institutional Audit Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; }
            h1 { font-size: 28px; margin-bottom: 10px; }
            h2 { font-size: 20px; margin-top: 30px; margin-bottom: 15px; }
            .metric { display: inline-block; margin: 20px 20px 20px 0; }
            .metric-label { font-size: 13px; color: #666; }
            .metric-value { font-size: 32px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #EEECE8; font-weight: 600; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>SIMPLIFY Institutional Audit Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          
          <h2>Compliance Status</h2>
          <div class="metric">
            <div class="metric-label">Status</div>
            <div class="metric-value">${complianceStatus}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Compliance Rate</div>
            <div class="metric-value">${complianceRate}%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Coverage</div>
            <div class="metric-value">${courseCoverage}%</div>
          </div>
          
          <h2>Scores</h2>
          <table>
            <tr>
              <th>Metric</th>
              <th>Score</th>
            </tr>
            <tr>
              <td>Overall Score</td>
              <td>${overallScore}</td>
            </tr>
            <tr>
              <td>Accessibility</td>
              <td>${avgAccessibility}</td>
            </tr>
            <tr>
              <td>Usability</td>
              <td>${avgUsability}</td>
            </tr>
          </table>
          
          <h2>Issues</h2>
          <table>
            <tr>
              <th>Severity</th>
              <th>Count</th>
            </tr>
            <tr>
              <td>High</td>
              <td>${scanResults.filter((i: any) => i.severity === 'high').length}</td>
            </tr>
            <tr>
              <td>Medium</td>
              <td>${scanResults.filter((i: any) => i.severity === 'medium').length}</td>
            </tr>
            <tr>
              <td>Low</td>
              <td>${scanResults.filter((i: any) => i.severity === 'low').length}</td>
            </tr>
          </table>
          
          <button onclick="window.print()" style="margin-top: 30px; padding: 12px 24px; background: #0071e3; color: white; border: none; border-radius: 8px; font-size: 15px; cursor: pointer;">
            Print / Save as PDF
          </button>
        </body>
      </html>
    `;
    
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  };

  const handleExportCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Overall Score', overallScore],
      ['Accessibility Score', avgAccessibility],
      ['Usability Score', avgUsability],
      ['Compliance Status', complianceStatus],
      ['Compliance Rate', `${complianceRate}%`],
      ['Coverage', `${courseCoverage}%`],
      ['Total Issues', scanResults.length],
      ['High Severity', scanResults.filter((i: any) => i.severity === 'high').length],
      ['Medium Severity', scanResults.filter((i: any) => i.severity === 'medium').length],
      ['Low Severity', scanResults.filter((i: any) => i.severity === 'low').length]
    ];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `simplify-audit-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateEvidencePack = () => {
    alert('Evidence Pack generation would create a comprehensive ZIP file with:\n\n• Full audit report (PDF)\n• Issue screenshots\n• Compliance certificates\n• Remediation logs\n\nThis feature requires backend implementation.');
  };

  return (
    <div className="space-y-6" style={{ maxWidth: 720 }}>
      {/* Standards & Equity Alignment Section */}
      <div className="space-y-4">
        <h2 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">Standards & Equity Alignment</h2>
<div className="flex gap-4 items-stretch">
          {/* Standards Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 rounded-[16px] shadow-sm px-6 py-4 flex items-center gap-4"
            style={{ background: '#FFFFFF', border: '1px solid #d2d2d7' }}
          >
            <span className="text-[15px] text-[#1d1d1f] font-medium whitespace-nowrap">
              Standards Met:
            </span>
            <div className="flex items-center gap-2">
              {/* CVC-OEI Pill — soft orange tint */}
              <div className="px-3 py-1.5 rounded-full flex items-center gap-2" style={{ backgroundColor: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.35)' }}>
                <span className="text-[13px] font-medium" style={{ color: '#1d1d1f' }}>CVC-OEI</span>
                <span className="text-[13px] font-semibold" style={{ color: scanResults.length === 0 ? '#636366' : getComplianceColor(cvcOeiCompliance) }}>
                  {scanResults.length === 0 ? '--' : `${cvcOeiCompliance}%`}
                </span>
              </div>

              {/* Peralta Pill — soft green tint */}
              <div className="px-3 py-1.5 rounded-full flex items-center gap-2" style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)' }}>
                <span className="text-[13px] font-medium" style={{ color: '#1d1d1f' }}>Peralta</span>
                <span className="text-[13px] font-semibold" style={{ color: scanResults.length === 0 ? '#636366' : getComplianceColor(peraltaCompliance) }}>
                  {scanResults.length === 0 ? '--' : `${peraltaCompliance}%`}
                </span>
              </div>

              {/* QM Pill — soft blue tint */}
              <div className="px-3 py-1.5 rounded-full flex items-center gap-2" style={{ backgroundColor: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.4)' }}>
                <span className="text-[13px] font-medium" style={{ color: '#1d1d1f' }}>QM</span>
                <span className="text-[13px] font-semibold" style={{ color: scanResults.length === 0 ? '#636366' : getComplianceColor(qmCompliance) }}>
                  {scanResults.length === 0 ? '--' : `${qmCompliance}%`}
                </span>
              </div>
            </div>
          </motion.div>

          {/* View Reports Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-[16px] shadow-sm flex items-center"
            style={{ background: '#FFFFFF', border: '1px solid #d2d2d7' }}
          >
            {scanResults.length === 0 ? (
              <div className="text-[14px] text-[#636366] font-medium px-6 py-4">
                No reports available
              </div>
            ) : (
              <button
                className="flex items-center gap-2 px-6 py-4 group hover:bg-[#fafafa] transition-colors rounded-[16px]"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDrawerOpen(true);
                  localStorage.setItem('simplify_seen_view_reports', '1');
                }}
                title="View compliance reports and documentation"
                style={showReportsPulse ? { animation: 'pulse-ring 2s ease-in-out 3' } : undefined}
              >
                <BarChart3 className="w-[18px] h-[18px] text-[#ff3b30] flex-shrink-0" strokeWidth={2} />
                <span className="text-[15px] font-semibold text-[#1d1d1f] whitespace-nowrap">View Reports</span>
                <ChevronRight className="w-[18px] h-[18px] text-[#636366] flex-shrink-0 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Statewide Compliance Drawer */}
      <StatewideComplianceDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        scanResults={scanResults}
        selectedCourse={selectedCourse}
        lastScanTime={lastScanTime}
      />
    </div>
  );
}