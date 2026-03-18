import { FileText, Download, Shield, ArrowUp, ArrowDown, MoreVertical, FileSpreadsheet, Info, X, TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import type { ScanIssue } from '../App';

interface ComplianceReportsProps {
  scanResults?: ScanIssue[];
  selectedCourseName?: string | null;
  lastScanTime?: Date;
  courseId?: string;
}

const calcScore = (issues: ScanIssue[]) => {
  const penalty = issues.reduce((sum, issue) => {
    if (issue.severity === 'high') return sum + 10;
    if (issue.severity === 'medium') return sum + 5;
    return sum + 2;
  }, 0);
  return Math.max(0, Math.min(100, 100 - penalty));
};

const filterByRubric = (issues: ScanIssue[], rubric: string) => {
  if (rubric === 'all') return issues;
  return issues.filter(i => i.standardsTags?.some(tag => tag.startsWith(`${rubric}:`)));
};

export function ComplianceReports({ scanResults = [], selectedCourseName, lastScanTime, courseId }: ComplianceReportsProps) {
  // Calculate compliance metrics
  const totalIssues = scanResults.length;
  const highSeverity = scanResults.filter(i => i.severity === 'high').length;
  const mediumSeverity = scanResults.filter(i => i.severity === 'medium').length;
  const lowSeverity = scanResults.filter(i => i.severity === 'low').length;
  const complianceRate = scanResults.length === 0 ? 100 : Math.max(0, 100 - (scanResults.length * 2));
  const courseCoverage = 100; // Single course scanned

  // Status counts
  const pendingIssues = scanResults.filter(i => !i.status || i.status === 'pending').length;
  const resolvedIssues = scanResults.filter(i => i.status === 'published' || i.status === 'resolved').length;

  // Standards breakdown
  const cvcOeiIssues = scanResults.filter(i => i.standardsTags?.some(tag => tag.startsWith('cvc-oei:'))).length;
  const peraltaIssues = scanResults.filter(i => i.standardsTags?.some(tag => tag.startsWith('peralta:'))).length;
  const qmIssues = scanResults.filter(i => i.standardsTags?.some(tag => tag.startsWith('qm:'))).length;

  // Compliance status
  const complianceStatus = highSeverity === 0 && totalIssues < 10 ? "Meets Standards" : 
                          highSeverity < 3 && totalIssues < 30 ? "Partial Compliance" : "Action Required";

  // Calculate benchmark status
  const accessibilityBenchmark = complianceRate >= 90 ? 'Above' : complianceRate >= 70 ? 'At' : 'Below';
  const usabilityBenchmark = highSeverity === 0 ? 'Above' : highSeverity < 5 ? 'At' : 'Below';
  const overallBenchmark = complianceRate >= 85 && highSeverity < 3 ? 'Above' : 'At';

  // Top critical/high issues (max 5)
  const criticalIssues = scanResults
    .filter(i => i.severity === 'high' || i.severity === 'medium')
    .slice(0, 5);

  // Export PDF (Leadership Brief) — generates a real downloadable PDF using jsPDF
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Colors
    const blue = '#0071e3';
    const dark = '#1d1d1f';
    const gray = '#636366';
    const lightGray = '#f5f5f7';
    const red = '#ff3b30';
    const orange = '#ff9500';
    const green = '#2e7d32';

    // Helper: check if we need a new page
    const ensureSpace = (needed: number) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Helper: draw a rounded filled rectangle
    const drawRoundedRect = (x: number, ry: number, w: number, h: number, r: number, fillColor: string) => {
      doc.setFillColor(fillColor);
      doc.roundedRect(x, ry, w, h, r, r, 'F');
    };

    // === HEADER ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(dark);
    doc.text('SIMPLIFY', margin, y + 8);
    y += 14;

    doc.setFontSize(16);
    doc.setTextColor(blue);
    doc.text('Leadership Compliance Brief', margin, y);
    y += 8;

    // Blue divider line
    doc.setDrawColor(blue);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Metadata row
    doc.setFontSize(8);
    doc.setTextColor(gray);
    doc.setFont('helvetica', 'normal');
    const colWidth = contentWidth / 3;

    const metaLabels = ['COURSE', 'REPORT DATE', 'LAST SCAN'];
    const metaValues = [
      selectedCourseName || 'Not selected',
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      lastScanTime ? lastScanTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'
    ];

    metaLabels.forEach((label, i) => {
      const x = margin + i * colWidth;
      doc.setFontSize(7);
      doc.setTextColor(gray);
      doc.setFont('helvetica', 'normal');
      doc.text(label, x, y);
      doc.setFontSize(10);
      doc.setTextColor(dark);
      doc.setFont('helvetica', 'bold');
      doc.text(metaValues[i], x, y + 5);
    });
    y += 16;

    // === EXECUTIVE SUMMARY ===
    ensureSpace(30);
    doc.setFontSize(18);
    doc.setTextColor(dark);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', margin, y);
    y += 8;

    // Status badge
    const statusColor = complianceStatus === 'Meets Standards' ? green :
                         complianceStatus === 'Partial Compliance' ? orange : red;
    const statusBgColor = complianceStatus === 'Meets Standards' ? '#e8f5e9' :
                           complianceStatus === 'Partial Compliance' ? '#fff3e0' : '#ffebee';

    const statusText = complianceStatus.toUpperCase();
    doc.setFontSize(9);
    const statusWidth = doc.getTextWidth(statusText) + 10;
    drawRoundedRect(margin, y - 3.5, statusWidth, 7, 3, statusBgColor);
    doc.setTextColor(statusColor);
    doc.setFont('helvetica', 'bold');
    doc.text(statusText, margin + 5, y + 1);
    y += 10;

    // Summary paragraph
    doc.setFontSize(10);
    doc.setTextColor(dark);
    doc.setFont('helvetica', 'normal');
    const summaryText = `This report provides an executive-level overview of accessibility and usability compliance for ${selectedCourseName || 'the selected course'}. The assessment is based on CVC-OEI Design Principles, Peralta Online Equity Rubric, and Quality Matters Higher Education Rubric (7th Edition).`;
    const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 6;

    // === KEY METRICS ===
    ensureSpace(40);
    doc.setFontSize(18);
    doc.setTextColor(dark);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Metrics', margin, y);
    y += 8;

    const metricBoxWidth = (contentWidth - 8) / 3;
    const metricBoxHeight = 28;
    const metrics = [
      { value: String(totalIssues), label: 'Total Issues', color: dark },
      { value: String(highSeverity), label: 'Critical', color: red },
      { value: `${courseCoverage}%`, label: 'Coverage', color: dark }
    ];

    metrics.forEach((metric, i) => {
      const x = margin + i * (metricBoxWidth + 4);
      drawRoundedRect(x, y, metricBoxWidth, metricBoxHeight, 3, lightGray);

      doc.setFontSize(22);
      doc.setTextColor(metric.color);
      doc.setFont('helvetica', 'bold');
      const valWidth = doc.getTextWidth(metric.value);
      doc.text(metric.value, x + (metricBoxWidth - valWidth) / 2, y + 14);

      doc.setFontSize(8);
      doc.setTextColor(gray);
      doc.setFont('helvetica', 'normal');
      const labelWidth = doc.getTextWidth(metric.label);
      doc.text(metric.label, x + (metricBoxWidth - labelWidth) / 2, y + 22);
    });
    y += metricBoxHeight + 10;

    // === STANDARDS ALIGNMENT TABLE ===
    ensureSpace(50);
    doc.setFontSize(18);
    doc.setTextColor(dark);
    doc.setFont('helvetica', 'bold');
    doc.text('Standards Alignment', margin, y);
    y += 8;

    // Table header
    const col1W = contentWidth * 0.25;
    const col2W = contentWidth * 0.2;
    const col3W = contentWidth * 0.55;
    const rowHeight = 9;

    drawRoundedRect(margin, y, contentWidth, rowHeight, 1, lightGray);
    doc.setFontSize(9);
    doc.setTextColor(dark);
    doc.setFont('helvetica', 'bold');
    doc.text('Standard', margin + 4, y + 6);
    doc.text('Issues Found', margin + col1W + 4, y + 6);
    doc.text('Description', margin + col1W + col2W + 4, y + 6);
    y += rowHeight;

    // Table rows
    const tableRows = [
      ['CVC-OEI', String(cvcOeiIssues), 'California Virtual Campus - Online Education Initiative'],
      ['Peralta', String(peraltaIssues), 'Peralta Online Equity Rubric'],
      ['Quality Matters', String(qmIssues), 'Quality Matters Higher Ed Rubric (7th Ed.)']
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    tableRows.forEach((row, rowIdx) => {
      doc.setDrawColor('#e5e5e7');
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageWidth - margin, y);

      doc.setTextColor(dark);
      doc.text(row[0], margin + 4, y + 6);

      // Issue count — bold, colored if > 0
      const count = parseInt(row[1]);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(count > 0 ? red : dark);
      doc.text(row[1], margin + col1W + 4, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(gray);
      doc.text(row[2], margin + col1W + col2W + 4, y + 6);
      y += rowHeight;
    });

    // Bottom border for table
    doc.setDrawColor('#e5e5e7');
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // === CRITICAL ISSUES ===
    if (criticalIssues.length > 0) {
      ensureSpace(20 + criticalIssues.length * 14);
      doc.setFontSize(18);
      doc.setTextColor(dark);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Risks', margin, y);
      y += 8;

      criticalIssues.forEach((issue, idx) => {
        ensureSpace(14);
        // Severity badge
        const sevColor = issue.severity === 'high' ? red : orange;
        const sevBgColor = issue.severity === 'high' ? '#ffebee' : '#fff3e0';
        const sevText = issue.severity.toUpperCase();

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        const sevWidth = doc.getTextWidth(sevText) + 6;
        drawRoundedRect(margin, y - 3, sevWidth, 5.5, 1.5, sevBgColor);
        doc.setTextColor(sevColor);
        doc.text(sevText, margin + 3, y);

        // Issue title
        doc.setFontSize(9);
        doc.setTextColor(dark);
        doc.setFont('helvetica', 'bold');
        const titleX = margin + sevWidth + 4;
        const titleMaxW = contentWidth - sevWidth - 4;
        const titleLines = doc.splitTextToSize(issue.title, titleMaxW);
        doc.text(titleLines[0], titleX, y);
        y += 4;

        // Location
        doc.setFontSize(8);
        doc.setTextColor(gray);
        doc.setFont('helvetica', 'normal');
        doc.text(issue.location || '', titleX, y);
        y += 7;

        // Divider between issues
        if (idx < criticalIssues.length - 1) {
          doc.setDrawColor('#f5f5f7');
          doc.setLineWidth(0.2);
          doc.line(margin, y - 2, pageWidth - margin, y - 2);
        }
      });
      y += 6;
    }

    // === COMPLIANCE STATEMENT ===
    ensureSpace(30);
    doc.setFontSize(18);
    doc.setTextColor(dark);
    doc.setFont('helvetica', 'bold');
    doc.text('Compliance Statement', margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(dark);
    doc.setFont('helvetica', 'normal');
    const complianceText = 'This audit was conducted using SIMPLIFY, an automated accessibility and usability assessment tool aligned with Section 508, WCAG guidelines, and California Education Code Title 5 requirements.';
    const complianceLines = doc.splitTextToSize(complianceText, contentWidth);
    doc.text(complianceLines, margin, y);
    y += complianceLines.length * 5 + 10;

    // === FOOTER ===
    ensureSpace(20);
    doc.setDrawColor('#e5e5e7');
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setFontSize(8);
    doc.setTextColor(gray);
    doc.setFont('helvetica', 'normal');
    const footerLine1 = 'SIMPLIFY - Course Design and Accessibility Tools';
    const footerLine2 = 'Leadership Compliance Brief';
    const footerLine3 = `\u00A9 ${new Date().getFullYear()} - For Institutional Use Only`;
    doc.text(footerLine1, pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.text(footerLine2, pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.text(footerLine3, pageWidth / 2, y, { align: 'center' });

    // Save the PDF
    const filename = `SIMPLIFY-Brief-${selectedCourseName?.replace(/\s+/g, '-') || 'Course'}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  // Export CSV (Evidence Log)
  const handleExportCSV = () => {
    const headers = [
      'Issue ID',
      'Severity',
      'Category',
      'Title',
      'Location',
      'Standards',
      'Status',
      'Auto-Fix Available',
      'Content Type'
    ];
    
    const rows = scanResults.map((issue, index) => [
      `ISS-${String(index + 1).padStart(4, '0')}`,
      issue.severity.toUpperCase(),
      issue.category,
      issue.title,
      issue.location,
      issue.standardsTags?.join('; ') || 'N/A',
      issue.status || 'pending',
      issue.autoFixAvailable ? 'Yes' : 'No',
      issue.contentType || 'N/A'
    ]);

    const csvContent = [
      `"SIMPLIFY Evidence Log"`,
      `"Course: ${selectedCourseName || 'Not selected'}"`,
      `"Generated: ${new Date().toLocaleString()}"`,
      `"Last Scan: ${lastScanTime ? lastScanTime.toLocaleString() : 'N/A'}"`,
      '',
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `SIMPLIFY-Evidence-${selectedCourseName?.replace(/\s+/g, '-') || 'Course'}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Evidence Pack
  const handleGenerateEvidencePack = () => {
    alert('Evidence Pack generation would create a comprehensive ZIP file with:\\n\\n• Leadership brief (PDF)\\n• Evidence log (CSV)\\n• Issue screenshots\\n• Compliance certificates\\n\\nThis feature requires backend implementation.');
  };

  const [showReportGuide, setShowReportGuide] = useState(false);
  const [selectedRubric, setSelectedRubric] = useState<'all' | 'cvc-oei' | 'peralta' | 'qm'>('all');
  const [showRubricDropdown, setShowRubricDropdown] = useState(false);

  // Progress metrics: compare all issues (before) vs. open issues after fixes (after)
  const fixedIssues = scanResults.filter(i => i.status === 'published' || i.status === 'resolved');
  const openIssues = scanResults.filter(i => i.status !== 'published' && i.status !== 'resolved');
  const hasFixedAny = fixedIssues.length > 0;

  const progressData = useMemo(() => {
    const allFiltered = filterByRubric(scanResults, selectedRubric);
    const openFiltered = filterByRubric(openIssues, selectedRubric);

    const beforeScore = calcScore(allFiltered);
    const afterScore = calcScore(openFiltered);

    const countBySev = (issues: ScanIssue[], sev: string) => issues.filter(i => i.severity === sev).length;

    // Per-standard scores
    const standards = ['cvc-oei', 'peralta', 'qm'] as const;
    const perStandard = standards.map(std => {
      const allStd = scanResults.filter(i => i.standardsTags?.some(t => t.startsWith(`${std}:`)));
      const openStd = openIssues.filter(i => i.standardsTags?.some(t => t.startsWith(`${std}:`)));
      return {
        key: std,
        label: std === 'cvc-oei' ? 'CVC-OEI' : std === 'peralta' ? 'Peralta' : 'Quality Matters',
        beforeScore: calcScore(allStd),
        afterScore: calcScore(openStd),
        beforeCount: allStd.length,
        afterCount: openStd.length,
      };
    });

    return {
      beforeScore,
      afterScore,
      scoreDelta: afterScore - beforeScore,
      beforeTotal: allFiltered.length,
      afterTotal: openFiltered.length,
      fixedTotal: allFiltered.length - openFiltered.length,
      beforeHigh: countBySev(allFiltered, 'high'),
      afterHigh: countBySev(openFiltered, 'high'),
      beforeMedium: countBySev(allFiltered, 'medium'),
      afterMedium: countBySev(openFiltered, 'medium'),
      beforeLow: countBySev(allFiltered, 'low'),
      afterLow: countBySev(openFiltered, 'low'),
      perStandard,
    };
  }, [scanResults, openIssues, selectedRubric]);

  // Download progress report PDF
  const handleDownloadProgress = () => {
    if (!progressData) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const pw = doc.internal.pageSize.getWidth();
    const m = 20;
    const cw = pw - m * 2;
    let y = m;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor('#1d1d1f');
    doc.text('SIMPLIFY', m, y + 8);
    y += 14;
    doc.setFontSize(16);
    doc.setTextColor('#0071e3');
    doc.text('Progress Report', m, y);
    y += 8;
    doc.setDrawColor('#0071e3');
    doc.setLineWidth(0.8);
    doc.line(m, y, pw - m, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor('#636366');
    doc.setFont('helvetica', 'normal');
    doc.text(`Course: ${selectedCourseName || 'N/A'}`, m, y);
    y += 5;
    doc.text(`${progressData.fixedTotal} of ${progressData.beforeTotal} issues fixed`, m, y);
    y += 10;

    // Score comparison
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#1d1d1f');
    doc.text('Overall Score', m, y);
    y += 8;

    const boxW = (cw - 10) / 2;
    // Before box
    doc.setFillColor('#f5f5f7');
    doc.roundedRect(m, y, boxW, 25, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor('#636366');
    doc.setFont('helvetica', 'normal');
    doc.text('BEFORE FIXES', m + boxW / 2, y + 7, { align: 'center' });
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#1d1d1f');
    doc.text(`${progressData.beforeScore}`, m + boxW / 2, y + 20, { align: 'center' });

    // After box
    doc.setFillColor('#e8f5e9');
    doc.roundedRect(m + boxW + 10, y, boxW, 25, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor('#636366');
    doc.setFont('helvetica', 'normal');
    doc.text('AFTER FIXES', m + boxW + 10 + boxW / 2, y + 7, { align: 'center' });
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const scoreColor = progressData.scoreDelta >= 0 ? '#2e7d32' : '#c62828';
    doc.setTextColor(scoreColor);
    doc.text(`${progressData.afterScore}`, m + boxW + 10 + boxW / 2, y + 20, { align: 'center' });
    y += 30;

    // Delta
    const deltaSign = progressData.scoreDelta >= 0 ? '+' : '';
    doc.setFontSize(12);
    doc.setTextColor(scoreColor);
    doc.text(`${deltaSign}${progressData.scoreDelta} points`, pw / 2, y, { align: 'center' });
    y += 12;

    // Per-standard table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#1d1d1f');
    doc.text('Per-Standard Breakdown', m, y);
    y += 8;

    progressData.perStandard.forEach(std => {
      const delta = std.afterScore - std.beforeScore;
      const sign = delta >= 0 ? '+' : '';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor('#1d1d1f');
      doc.text(std.label, m, y + 4);
      doc.text(`${std.beforeScore} → ${std.afterScore}`, m + cw * 0.5, y + 4);
      doc.setTextColor(delta >= 0 ? '#2e7d32' : '#c62828');
      doc.setFont('helvetica', 'bold');
      doc.text(`${sign}${delta}`, m + cw * 0.8, y + 4);
      y += 7;
    });
    y += 6;

    // Footer
    doc.setDrawColor('#e5e5e7');
    doc.setLineWidth(0.3);
    doc.line(m, y, pw - m, y);
    y += 6;
    doc.setFontSize(8);
    doc.setTextColor('#636366');
    doc.setFont('helvetica', 'normal');
    doc.text('SIMPLIFY - Progress Report', pw / 2, y, { align: 'center' });
    y += 4;
    doc.text(`Generated ${new Date().toLocaleDateString()}`, pw / 2, y, { align: 'center' });

    doc.save(`SIMPLIFY-Progress-${selectedCourseName?.replace(/\s+/g, '-') || 'Course'}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-2.5">
      {/* Header - Simplified for leadership focus */}
      <div className="mb-0 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Compliance Reports</h2>
            <p className="text-[15px] text-[#636366] mt-0.5">
              {scanResults.length === 0
                ? 'Run a course scan to generate audit-ready documentation'
                : 'Leadership brief and audit-ready evidence exports'
              }
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowReportGuide(!showReportGuide)}
              aria-label="How to use this report"
              aria-expanded={showReportGuide}
              className="w-7 h-7 rounded-full border border-[#d2d2d7] bg-white hover:bg-[#f5f5f7] flex items-center justify-center transition-colors mt-0.5"
            >
              <Info className="w-3.5 h-3.5 text-[#636366]" />
            </button>
            {showReportGuide && (
              <div role="dialog" aria-label="How to use this report" className="absolute top-full mt-2 left-0 w-[340px] bg-white rounded-[12px] border border-[#d2d2d7] shadow-lg z-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-semibold text-[#1d1d1f]">How to Use This Report</h3>
                  <button onClick={() => setShowReportGuide(false)} aria-label="Close guide" className="text-[#636366] hover:text-[#1d1d1f]">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 text-[13px] text-[#1d1d1f] leading-relaxed">
                  <div>
                    <div className="font-semibold mb-0.5">Compliance Score</div>
                    <p className="text-[#636366]">Your score starts at 100 and decreases based on issues found. High severity issues (-10 pts), medium (-5 pts), low (-2 pts).</p>
                  </div>
                  <div>
                    <div className="font-semibold mb-0.5">Standards Alignment</div>
                    <p className="text-[#636366]">Shows how many issues map to each rubric (CVC-OEI, Peralta, Quality Matters). Focus on the rubric your institution requires.</p>
                  </div>
                  <div>
                    <div className="font-semibold mb-0.5">Key Risks</div>
                    <p className="text-[#636366]">The top issues that most impact accessibility and compliance. Fix these first for maximum improvement.</p>
                  </div>
                  <div>
                    <div className="font-semibold mb-0.5">Exports</div>
                    <p className="text-[#636366]">Download the PDF brief to share with your dean or department chair. The CSV evidence log is useful for accreditation documentation.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {scanResults.length === 0 ? (
        /* Empty State - Match other tabs */
        <div className="bg-white/50 backdrop-blur-sm rounded-[12px] border border-[#d2d2d7]">
          <table className="w-full">
            <thead className="border-b border-[#d2d2d7]">
              <tr className="text-left">
                <th className="px-4 py-3 text-[13px] font-medium text-[#6e6e73]">Report Type</th>
                <th className="px-4 py-3 text-[13px] font-medium text-[#6e6e73]">Status</th>
                <th className="px-4 py-3 text-[13px] font-medium text-[#6e6e73]">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3} className="px-4 py-28">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-[#f5f5f7] rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-[#636366]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[20px] tracking-tight text-[#1d1d1f] font-semibold mb-2">
                      No Compliance Data Available
                    </h3>
                    <p className="text-[14px] text-[#636366] leading-relaxed max-w-[500px]">
                      Run a course scan to generate compliance reports and audit documentation.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {/* Audit Snapshot - Compact certificate-style */}
          <div className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">Audit Snapshot</h3>
                <p className="text-[13px] text-[#636366] mt-0.5">Institutional compliance verification</p>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-[13px] font-semibold ${
                complianceStatus === 'Meets Standards' ? 'bg-[#e8f5e9] text-[#2e7d32]' :
                complianceStatus === 'Partial Compliance' ? 'bg-[#fff3e0] text-[#b36b00]' :
                'bg-[#ffebee] text-[#c62828]'
              }`}>
                {complianceStatus}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-[12px] text-[#636366] mb-1">Course</div>
                <div className="text-[14px] font-semibold text-[#1d1d1f]">{selectedCourseName || 'Not selected'}</div>
              </div>
              <div>
                <div className="text-[12px] text-[#636366] mb-1">Term</div>
                <div className="text-[14px] font-semibold text-[#1d1d1f]">Spring 2026</div>
              </div>
              <div>
                <div className="text-[12px] text-[#636366] mb-1">Last Verified</div>
                <div className="text-[14px] font-semibold text-[#1d1d1f]">
                  {lastScanTime ? lastScanTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#e5e5e7] grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-[24px] font-semibold text-[#1d1d1f] leading-none">{totalIssues}</div>
                <div className="text-[11px] text-[#636366] mt-1">Total Issues</div>
              </div>
              <div>
                <div className="text-[24px] font-semibold text-[#ff3b30] leading-none">{highSeverity}</div>
                <div className="text-[11px] text-[#636366] mt-1">Critical</div>
              </div>
              <div>
                <div className="text-[24px] font-semibold text-[#b36b00] leading-none">{pendingIssues}</div>
                <div className="text-[11px] text-[#636366] mt-1">Pending</div>
              </div>
              <div>
                <div className="text-[24px] font-semibold text-[#1d1d1f] leading-none">70%</div>
                <div className="text-[11px] text-[#636366] mt-1">Threshold</div>
              </div>
            </div>
          </div>

          {/* Standards Alignment - Short summary */}
          <div className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-4">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-3">Standards Alignment</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center justify-between px-3 py-2 bg-[#EEECE8] rounded-lg">
                <span className="text-[13px] text-[#555555]">CVC-OEI</span>
                <span className="text-[15px] font-semibold text-[#1d1d1f]">{cvcOeiIssues}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-[#EEECE8] rounded-lg">
                <span className="text-[13px] text-[#555555]">Peralta</span>
                <span className="text-[15px] font-semibold text-[#1d1d1f]">{peraltaIssues}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-[#EEECE8] rounded-lg">
                <span className="text-[13px] text-[#555555]">Quality Matters</span>
                <span className="text-[15px] font-semibold text-[#1d1d1f]">{qmIssues}</span>
              </div>
            </div>
          </div>

          {/* Progress Report — Before vs. After Fixes */}
          {progressData && (
            <div className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">Progress Report</h3>
                  <p className="text-[13px] text-[#636366] mt-0.5">{hasFixedAny ? `${fixedIssues.length} of ${totalIssues} issues fixed` : 'Fix issues to see your improvement'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Rubric selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowRubricDropdown(!showRubricDropdown)}
                      aria-expanded={showRubricDropdown}
                      aria-haspopup="listbox"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-lg border border-[#d2d2d7] transition-colors"
                    >
                      {selectedRubric === 'all' ? 'All Standards' : selectedRubric === 'cvc-oei' ? 'CVC-OEI' : selectedRubric === 'peralta' ? 'Peralta' : 'Quality Matters'}
                      <ChevronDown className="w-3.5 h-3.5 text-[#636366]" />
                    </button>
                    {showRubricDropdown && (
                      <div role="listbox" aria-label="Select rubric" className="absolute right-0 top-full mt-1 w-[180px] bg-white rounded-[10px] border border-[#d2d2d7] shadow-lg z-50 py-1">
                        {([['all', 'All Standards'], ['cvc-oei', 'CVC-OEI'], ['peralta', 'Peralta'], ['qm', 'Quality Matters']] as const).map(([key, label]) => (
                          <button
                            key={key}
                            role="option"
                            aria-selected={selectedRubric === key}
                            onClick={() => { setSelectedRubric(key as any); setShowRubricDropdown(false); }}
                            className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${selectedRubric === key ? 'bg-[#0071e3] text-white font-medium' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleDownloadProgress}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-[13px]"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Score delta banner */}
              <div className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg mb-4 ${progressData.scoreDelta > 0 ? 'bg-[#e8f5e9]' : progressData.scoreDelta < 0 ? 'bg-[#ffebee]' : 'bg-[#f5f5f7]'}`}>
                {progressData.scoreDelta > 0 ? (
                  <TrendingUp className="w-4 h-4 text-[#2e7d32]" />
                ) : progressData.scoreDelta < 0 ? (
                  <TrendingDown className="w-4 h-4 text-[#c62828]" />
                ) : (
                  <Minus className="w-4 h-4 text-[#636366]" />
                )}
                <span className={`text-[15px] font-semibold ${progressData.scoreDelta > 0 ? 'text-[#2e7d32]' : progressData.scoreDelta < 0 ? 'text-[#c62828]' : 'text-[#636366]'}`}>
                  {progressData.scoreDelta > 0 ? '+' : ''}{progressData.scoreDelta} points
                </span>
                <span className="text-[13px] text-[#636366]">
                  from fixes applied
                </span>
              </div>

              {/* Side-by-side cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Before Card */}
                <div className="border border-[#d2d2d7] rounded-[10px] p-4 bg-[#fafafa]">
                  <div className="mb-3">
                    <span className="text-[11px] font-semibold tracking-[0.06em] text-[#86868b]">BEFORE FIXES</span>
                  </div>
                  <div className="text-[36px] font-bold text-[#1d1d1f] leading-none mb-3">{progressData.beforeScore}</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#636366]">Total issues</span>
                      <span className="text-[13px] font-semibold text-[#1d1d1f]">{progressData.beforeTotal}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#636366]">High</span>
                      <span className="text-[13px] font-semibold text-[#ff3b30]">{progressData.beforeHigh}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#636366]">Medium</span>
                      <span className="text-[13px] font-semibold text-[#b36b00]">{progressData.beforeMedium}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#636366]">Low</span>
                      <span className="text-[13px] font-semibold text-[#636366]">{progressData.beforeLow}</span>
                    </div>
                  </div>
                </div>

                {/* After Card */}
                <div className="border border-[#d2d2d7] rounded-[10px] p-4 bg-white">
                  <div className="mb-3">
                    <span className="text-[11px] font-semibold tracking-[0.06em] text-[#86868b]">AFTER FIXES</span>
                  </div>
                  <div className="text-[36px] font-bold text-[#1d1d1f] leading-none mb-3">{progressData.afterScore}</div>
                  <div className="space-y-1.5">
                    {([
                      ['Total issues', progressData.afterTotal, progressData.beforeTotal, '#1d1d1f'],
                      ['High', progressData.afterHigh, progressData.beforeHigh, '#ff3b30'],
                      ['Medium', progressData.afterMedium, progressData.beforeMedium, '#b36b00'],
                      ['Low', progressData.afterLow, progressData.beforeLow, '#636366'],
                    ] as const).map(([label, after, before, color]) => {
                      const diff = after - before;
                      return (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-[12px] text-[#636366]">{label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-semibold" style={{ color }}>{after}</span>
                            {diff !== 0 && (
                              <span className={`text-[11px] font-medium ${diff < 0 ? 'text-[#2e7d32]' : 'text-[#c62828]'}`}>
                                {diff < 0 ? '' : '+'}{diff}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Per-standard breakdown */}
              <div className="border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#EEECE8] border-b border-[#d2d2d7]">
                  <span className="text-[12px] font-semibold text-[#555555]">Per-Standard Progress</span>
                </div>
                {progressData.perStandard.map((std, i) => {
                  const delta = std.afterScore - std.beforeScore;
                  const pct = Math.min(100, std.afterScore);
                  return (
                    <div key={std.key} className={`px-4 py-3 flex items-center gap-3 ${i > 0 ? 'border-t border-[#e5e5e7]' : ''}`}>
                      <div className="w-[110px] shrink-0">
                        <div className="text-[13px] font-medium text-[#1d1d1f]">{std.label}</div>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: pct >= 85 ? '#2e7d32' : pct >= 60 ? '#b36b00' : '#c62828',
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-[50px] text-right">
                        <span className="text-[14px] font-semibold text-[#1d1d1f]">{std.latestScore}</span>
                      </div>
                      <div className="w-[50px] text-right">
                        {delta !== 0 ? (
                          <span className={`text-[12px] font-semibold ${delta > 0 ? 'text-[#2e7d32]' : 'text-[#c62828]'}`}>
                            {delta > 0 ? '+' : ''}{delta}
                          </span>
                        ) : (
                          <span className="text-[12px] text-[#636366]">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


          {/* Key Risks Preview - Top 3-5 only */}
          {criticalIssues.length > 0 && (
            <div className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-4">
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-3">Key Risks</h3>
              <div className="space-y-2.5">
                {criticalIssues.map((issue) => (
                  <div key={issue.id} className="flex items-start gap-2.5 pb-2.5 border-b border-[#f5f5f7] last:border-0 last:pb-0">
                    <Badge 
                      variant={issue.severity === 'high' ? 'destructive' : 'warning'}
                      className="text-[10px] px-1.5 py-0.5 shrink-0 mt-0.5"
                    >
                      {issue.severity}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[#1d1d1f] font-medium leading-tight">{issue.title}</p>
                      <p className="text-[12px] text-[#636366] mt-0.5">{issue.location}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-[#e5e5e7] text-center">
                <button 
                  onClick={handleExportCSV}
                  className="text-[13px] text-[#0071e3] font-medium hover:underline"
                >
                  View full evidence log ({totalIssues} total issues) →
                </button>
              </div>
            </div>
          )}

          {/* Export Actions - Primary focus */}
          <div className="bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] rounded-[12px] border border-[#d2d2d7] p-5">
            <div className="text-center mb-4">
              <h3 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">Export Documentation</h3>
              <p className="text-[13px] text-[#6e6e73] mt-1">Generate comprehensive audit packages for institutional review</p>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              {/* Primary: Evidence Pack */}
              <Button
                onClick={handleGenerateEvidencePack}
                size="lg"
                className="h-11 px-6 text-[14px] bg-[#0071e3] hover:bg-[#0077ed] shadow-[0_2px_8px_rgba(0,113,227,0.3)]"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Evidence Pack
              </Button>

              {/* Secondary: Individual exports */}
              <Button
                onClick={handleExportPDF}
                variant="outline"
                size="lg"
                className="h-11 px-5 text-[14px]"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF Brief
              </Button>

              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="lg"
                className="h-11 px-5 text-[14px]"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                CSV Log
              </Button>
            </div>

            <p className="text-[11px] text-[#636366] text-center mt-3">
              Evidence Pack includes: Leadership brief (PDF) • Full issue log (CSV) • Compliance certificates
            </p>
          </div>
        </>
      )}
    </div>
  );
}