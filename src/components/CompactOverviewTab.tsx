import { useState } from 'react';
import { ScanSearch, Zap, CheckCircle2, AlertCircle, ChevronRight, TrendingUp } from 'lucide-react';
import { UnifiedPageTemplate, UnifiedStatsGrid, UnifiedGrid, UnifiedCard, UnifiedSectionHeader } from './ui/unified-page-template';
import { Button } from './ui/button';
import type { ScanIssue } from '../App';

interface CompactOverviewTabProps {
  courseName: string;
  scanResults: ScanIssue[];
  onScanCourse: () => void;
  onViewAllIssues: () => void;
  onFixIssue: (issue: ScanIssue) => void;
  isScanning: boolean;
}

export function CompactOverviewTab({
  courseName,
  scanResults,
  onScanCourse,
  onViewAllIssues,
  onFixIssue,
  isScanning
}: CompactOverviewTabProps) {
  // Calculate stats
  const totalIssues = scanResults.length;
  const criticalIssues = scanResults.filter(i => i.severity === 'high').length;
  const fixedIssues = scanResults.filter(i => i.status === 'published').length;
  const overallScore = totalIssues > 0 ? Math.round((fixedIssues / totalIssues) * 100) : 100;

  // Top 6 issues for above-the-fold display
  const topIssues = scanResults
    .filter(i => i.status !== 'published')
    .sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    })
    .slice(0, 6);

  // Grouped issues for secondary content
  const issuesByCategory = scanResults.reduce((acc, issue) => {
    if (!acc[issue.category]) acc[issue.category] = [];
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<string, ScanIssue[]>);

  return (
    <UnifiedPageTemplate
      title={courseName}
      subtitle="Course Overview & Scan Results"
      actions={[
        {
          label: isScanning ? 'Scanning...' : 'Scan Course',
          onClick: onScanCourse,
          variant: 'primary',
          icon: <ScanSearch className="w-4 h-4" strokeWidth={2} />
        },
        {
          label: 'View All Issues',
          onClick: onViewAllIssues,
          variant: 'outline'
        }
      ]}
      stats={
        <UnifiedStatsGrid
          stats={[
            {
              label: 'Overall Score',
              value: overallScore,
              sublabel: 'out of 100',
              trend: { value: 12, isPositive: true },
              icon: <TrendingUp className="w-5 h-5 text-green-600" strokeWidth={2} />
            },
            {
              label: 'Total Issues',
              value: totalIssues,
              sublabel: `${fixedIssues} fixed`,
              icon: <AlertCircle className="w-5 h-5 text-red-600" strokeWidth={2} />
            },
            {
              label: 'Critical',
              value: criticalIssues,
              sublabel: 'requires attention',
              icon: <Zap className="w-5 h-5 text-orange-600" strokeWidth={2} />
            },
            {
              label: 'Fixed',
              value: fixedIssues,
              sublabel: `${Math.round((fixedIssues/totalIssues)*100)}% complete`,
              icon: <CheckCircle2 className="w-5 h-5 text-green-600" strokeWidth={2} />
            }
          ]}
        />
      }
      primaryContent={
        <div className="p-6">
          <UnifiedSectionHeader
            title="Top Priority Issues"
            subtitle={`Showing ${topIssues.length} of ${totalIssues} issues`}
            action={
              totalIssues > 6 && (
                <Button
                  onClick={onViewAllIssues}
                  className="h-8 px-3 text-[13px] text-[#0071e3] hover:text-[#0077ed]"
                >
                  View All <ChevronRight className="w-3.5 h-3.5 ml-1" strokeWidth={2} />
                </Button>
              )
            }
          />

          {topIssues.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-1">
                No Issues Found
              </h3>
              <p className="text-[14px] text-[#636366]">
                Great work! This course meets all accessibility standards.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {topIssues.map((issue) => (
                <CompactIssueRow
                  key={issue.id}
                  issue={issue}
                  onFix={() => onFixIssue(issue)}
                />
              ))}
            </div>
          )}
        </div>
      }
      secondaryContent={
        <div className="space-y-6">
          <UnifiedSectionHeader
            title="Issues by Category"
            subtitle="Breakdown of all detected issues"
          />

          <UnifiedGrid columns={2} gap={4}>
            {Object.entries(issuesByCategory).map(([category, issues]) => (
              <UnifiedCard key={category} padding="md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[14px] font-semibold text-[#1d1d1f] capitalize">
                    {category.replace(/-/g, ' ')}
                  </span>
                  <span className="text-[20px] font-bold text-[#0071e3]">
                    {issues.length}
                  </span>
                </div>
                <div className="h-2 bg-[#EEECE8] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0071e3]"
                    style={{ width: `${(issues.length / totalIssues) * 100}%` }}
                  />
                </div>
              </UnifiedCard>
            ))}
          </UnifiedGrid>
        </div>
      }
      secondaryTitle="Detailed Breakdown"
      defaultExpanded={false}
    />
  );
}

// Compact Issue Row
function CompactIssueRow({ issue, onFix }: { issue: ScanIssue; onFix: () => void }) {
  const severityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-[#d2d2d7] hover:border-[#0071e3] hover:bg-[#0071e3]/5 transition-all group">
      {/* Severity Badge */}
      <div className={`px-2 py-1 rounded border ${severityColors[issue.severity]} text-[11px] font-semibold uppercase flex-shrink-0`}>
        {issue.severity}
      </div>

      {/* Issue Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-[14px] font-medium text-[#1d1d1f] mb-0.5 truncate">
          {issue.title}
        </h4>
        <p className="text-[12px] text-[#636366] truncate">
          {issue.location}
        </p>
      </div>

      {/* Fix Button */}
      <Button
        onClick={onFix}
        className="h-8 px-3 rounded-lg bg-[#0071e3] text-white hover:bg-[#0077ed] text-[13px] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      >
        Fix Now
      </Button>
    </div>
  );
}
