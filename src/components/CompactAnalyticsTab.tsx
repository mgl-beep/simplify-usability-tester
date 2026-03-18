import { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import { UnifiedPageTemplate, UnifiedStatsGrid, UnifiedGrid, UnifiedCard } from './ui/unified-page-template';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CompactAnalyticsTabProps {
  courseName: string;
  analyticsData: {
    summary: {
      totalScans: number;
      avgFixTime: string;
      fixRate: number;
      issuesTrend: number;
    };
    trendData: Array<{
      date: string;
      total: number;
      fixed: number;
    }>;
    categoryData: Array<{
      category: string;
      count: number;
    }>;
  };
  onExport: () => void;
}

export function CompactAnalyticsTab({
  courseName,
  analyticsData,
  onExport
}: CompactAnalyticsTabProps) {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <UnifiedPageTemplate
      title="Analytics"
      subtitle={`Performance insights for ${courseName}`}
      actions={[
        {
          label: 'Export Data',
          onClick: onExport,
          variant: 'outline',
          icon: <Download className="w-4 h-4" strokeWidth={2} />
        }
      ]}
      stats={
        <UnifiedStatsGrid
          stats={[
            {
              label: 'Total Scans',
              value: analyticsData.summary.totalScans,
              sublabel: 'all time',
              icon: <BarChart3 className="w-5 h-5 text-blue-600" strokeWidth={2} />
            },
            {
              label: 'Avg Fix Time',
              value: analyticsData.summary.avgFixTime,
              sublabel: 'per issue',
              icon: <Calendar className="w-5 h-5 text-purple-600" strokeWidth={2} />
            },
            {
              label: 'Fix Rate',
              value: `${analyticsData.summary.fixRate}%`,
              sublabel: 'completion',
              trend: { value: 8, isPositive: true },
              icon: <TrendingUp className="w-5 h-5 text-green-600" strokeWidth={2} />
            },
            {
              label: 'Issue Trend',
              value: analyticsData.summary.issuesTrend,
              sublabel: 'vs last period',
              trend: { value: 15, isPositive: false }
            }
          ]}
        />
      }
      primaryContent={
        <div className="p-6">
          {/* Date Range Selector */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
              Issues Over Time
            </h3>
            <div className="flex items-center gap-1 bg-[#EEECE8] rounded-lg p-1">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                    dateRange === range
                      ? 'bg-white shadow-sm text-[#0071e3]'
                      : 'text-[#636366] hover:text-[#1d1d1f]'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Trend Chart - Compact */}
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.trendData}>
                <defs>
                  <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0071e3" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="fixedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d084" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d084" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e7" />
                <XAxis dataKey="date" tick={{ fill: '#636366', fontSize: 12 }} stroke="#d2d2d7" />
                <YAxis tick={{ fill: '#636366', fontSize: 12 }} stroke="#d2d2d7" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #d2d2d7',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                />
                <Area type="monotone" dataKey="total" stroke="#0071e3" fill="url(#totalGradient)" strokeWidth={2} name="Total Issues" />
                <Area type="monotone" dataKey="fixed" stroke="#00d084" fill="url(#fixedGradient)" strokeWidth={2} name="Fixed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      }
      secondaryContent={
        <div className="space-y-6">
          <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
            Issues by Category
          </h3>

          {/* Category Chart - Horizontal Bars */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e7" />
                <XAxis type="number" tick={{ fill: '#636366', fontSize: 12 }} stroke="#d2d2d7" />
                <YAxis type="category" dataKey="category" tick={{ fill: '#636366', fontSize: 12 }} stroke="#d2d2d7" width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #d2d2d7',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#0071e3" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats Grid */}
          <UnifiedGrid columns={3} gap={3}>
            <UnifiedCard padding="md">
              <p className="text-[12px] text-[#636366] mb-1">Most Common</p>
              <p className="text-[18px] font-semibold text-[#1d1d1f]">Alt Text Missing</p>
              <p className="text-[13px] text-[#0071e3] font-medium">24 occurrences</p>
            </UnifiedCard>
            <UnifiedCard padding="md">
              <p className="text-[12px] text-[#636366] mb-1">Fastest Fix</p>
              <p className="text-[18px] font-semibold text-[#1d1d1f]">Color Contrast</p>
              <p className="text-[13px] text-green-600 font-medium">Avg 2.3 min</p>
            </UnifiedCard>
            <UnifiedCard padding="md">
              <p className="text-[12px] text-[#636366] mb-1">Most Improved</p>
              <p className="text-[18px] font-semibold text-[#1d1d1f]">Module 3</p>
              <p className="text-[13px] text-green-600 font-medium">↑ 45% fixed</p>
            </UnifiedCard>
          </UnifiedGrid>
        </div>
      }
      secondaryTitle="Detailed Analytics"
      defaultExpanded={false}
    />
  );
}
