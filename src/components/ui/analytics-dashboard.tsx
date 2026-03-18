import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Calendar, Download, Filter } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Button } from './button';

// Analytics Types
export interface AnalyticsData {
  issuesTrend: Array<{
    date: string;
    total: number;
    fixed: number;
    pending: number;
  }>;
  issuesByCategory: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  issuesBySeverity: Array<{
    severity: string;
    count: number;
  }>;
  fixRate: Array<{
    week: string;
    rate: number;
  }>;
  courseComparison: Array<{
    courseName: string;
    issues: number;
    score: number;
  }>;
  timeToFix: {
    average: number;
    median: number;
    fastest: number;
    slowest: number;
  };
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  dateRange?: '7d' | '30d' | '90d' | 'all';
  onDateRangeChange?: (range: '7d' | '30d' | '90d' | 'all') => void;
  onExport?: () => void;
}

export function AnalyticsDashboard({ 
  data, 
  dateRange = '30d',
  onDateRangeChange,
  onExport 
}: AnalyticsDashboardProps) {
  const [activeChart, setActiveChart] = useState<'trend' | 'category' | 'severity'>('trend');

  // Calculate summary stats
  const totalIssues = data.issuesTrend.reduce((sum, d) => sum + d.total, 0);
  const totalFixed = data.issuesTrend.reduce((sum, d) => sum + d.fixed, 0);
  const fixRate = totalIssues > 0 ? Math.round((totalFixed / totalIssues) * 100) : 0;
  
  const latestData = data.issuesTrend[data.issuesTrend.length - 1];
  const previousData = data.issuesTrend[data.issuesTrend.length - 2];
  const trendChange = previousData ? 
    Math.round(((latestData.total - previousData.total) / previousData.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-semibold text-[#1d1d1f] tracking-tight">
            Analytics Dashboard
          </h2>
          <p className="text-[14px] text-[#636366] mt-1">
            Comprehensive insights into course accessibility
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Filter */}
          <div className="flex items-center gap-1 bg-[#EEECE8] rounded-lg p-1">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => onDateRangeChange?.(range)}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                  dateRange === range
                    ? 'bg-white shadow-sm text-[#0071e3]'
                    : 'text-[#636366] hover:text-[#1d1d1f]'
                }`}
              >
                {range === 'all' ? 'All Time' : range.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Export Button */}
          {onExport && (
            <Button
              onClick={onExport}
              className="h-10 px-4 rounded-lg border border-[#d2d2d7] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
            >
              <Download className="w-4 h-4 mr-2" strokeWidth={2} />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Issues"
          value={totalIssues}
          change={trendChange}
          trend={trendChange < 0 ? 'down' : 'up'}
          icon={Activity}
          color="blue"
        />
        <StatCard
          label="Issues Fixed"
          value={totalFixed}
          change={fixRate}
          changeLabel="Fix Rate"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          label="Pending Issues"
          value={totalIssues - totalFixed}
          icon={BarChart3}
          color="orange"
        />
        <StatCard
          label="Avg. Time to Fix"
          value={`${data.timeToFix.average}h`}
          subtitle={`Median: ${data.timeToFix.median}h`}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Main Chart Section */}
      <div className="bg-white rounded-[16px] border border-[#d2d2d7] p-6">
        {/* Chart Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveChart('trend')}
              className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-all ${
                activeChart === 'trend'
                  ? 'bg-[#0071e3] text-white'
                  : 'text-[#636366] hover:bg-[#f5f5f7]'
              }`}
            >
              Issues Trend
            </button>
            <button
              onClick={() => setActiveChart('category')}
              className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-all ${
                activeChart === 'category'
                  ? 'bg-[#0071e3] text-white'
                  : 'text-[#636366] hover:bg-[#f5f5f7]'
              }`}
            >
              By Category
            </button>
            <button
              onClick={() => setActiveChart('severity')}
              className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-all ${
                activeChart === 'severity'
                  ? 'bg-[#0071e3] text-white'
                  : 'text-[#636366] hover:bg-[#f5f5f7]'
              }`}
            >
              By Severity
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="h-[400px]">
          {activeChart === 'trend' && <IssuesTrendChart data={data.issuesTrend} />}
          {activeChart === 'category' && <CategoryPieChart data={data.issuesByCategory} />}
          {activeChart === 'severity' && <SeverityBarChart data={data.issuesBySeverity} />}
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Fix Rate Trend */}
        <div className="bg-white rounded-[16px] border border-[#d2d2d7] p-6">
          <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-4">
            Fix Rate Over Time
          </h3>
          <div className="h-[250px]">
            <FixRateChart data={data.fixRate} />
          </div>
        </div>

        {/* Course Comparison */}
        <div className="bg-white rounded-[16px] border border-[#d2d2d7] p-6">
          <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-4">
            Course Comparison
          </h3>
          <div className="h-[250px]">
            <CourseComparisonChart data={data.courseComparison} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card
interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down';
  subtitle?: string;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

function StatCard({ label, value, change, changeLabel, trend, subtitle, icon: Icon, color }: StatCardProps) {
  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-200' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-200' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-200' }
  };

  const c = colors[color];

  return (
    <div className="bg-white rounded-[16px] border border-[#d2d2d7] p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[14px] font-medium text-[#636366]">{label}</span>
        <div className={`w-10 h-10 rounded-full ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} strokeWidth={2} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[32px] font-semibold text-[#1d1d1f] tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-[13px] text-[#636366] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            trend === 'down' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {trend === 'down' ? (
              <TrendingDown className="w-3.5 h-3.5 text-green-600" strokeWidth={2.5} />
            ) : (
              <TrendingUp className="w-3.5 h-3.5 text-red-600" strokeWidth={2.5} />
            )}
            <span className={`text-[12px] font-semibold ${
              trend === 'down' ? 'text-green-600' : 'text-red-600'
            }`}>
              {Math.abs(change)}%{changeLabel ? ` ${changeLabel}` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Issues Trend Chart
function IssuesTrendChart({ data }: { data: AnalyticsData['issuesTrend'] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
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
        <XAxis 
          dataKey="date" 
          tick={{ fill: '#636366', fontSize: 12 }}
          stroke="#d2d2d7"
        />
        <YAxis 
          tick={{ fill: '#636366', fontSize: 12 }}
          stroke="#d2d2d7"
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #d2d2d7',
            borderRadius: '8px',
            padding: '12px'
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
        <Area 
          type="monotone" 
          dataKey="total" 
          stroke="#0071e3" 
          fill="url(#totalGradient)"
          strokeWidth={2}
          name="Total Issues"
        />
        <Area 
          type="monotone" 
          dataKey="fixed" 
          stroke="#00d084" 
          fill="url(#fixedGradient)"
          strokeWidth={2}
          name="Fixed"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Category Pie Chart
function CategoryPieChart({ data }: { data: AnalyticsData['issuesByCategory'] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPie>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RechartsPie>
    </ResponsiveContainer>
  );
}

// Severity Bar Chart
function SeverityBarChart({ data }: { data: AnalyticsData['issuesBySeverity'] }) {
  const colors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#f59e0b',
    low: '#3b82f6'
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e7" />
        <XAxis 
          dataKey="severity" 
          tick={{ fill: '#636366', fontSize: 12 }}
          stroke="#d2d2d7"
        />
        <YAxis 
          tick={{ fill: '#636366', fontSize: 12 }}
          stroke="#d2d2d7"
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #d2d2d7',
            borderRadius: '8px',
            padding: '12px'
          }}
        />
        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[entry.severity.toLowerCase() as keyof typeof colors] || '#3b82f6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Fix Rate Chart
function FixRateChart({ data }: { data: AnalyticsData['fixRate'] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e7" />
        <XAxis 
          dataKey="week" 
          tick={{ fill: '#636366', fontSize: 12 }}
          stroke="#d2d2d7"
        />
        <YAxis 
          tick={{ fill: '#636366', fontSize: 12 }}
          stroke="#d2d2d7"
          domain={[0, 100]}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #d2d2d7',
            borderRadius: '8px',
            padding: '12px'
          }}
          formatter={(value) => `${value}%`}
        />
        <Line 
          type="monotone" 
          dataKey="rate" 
          stroke="#00d084" 
          strokeWidth={3}
          dot={{ fill: '#00d084', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Course Comparison Chart
function CourseComparisonChart({ data }: { data: AnalyticsData['courseComparison'] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e7" />
        <XAxis type="number" tick={{ fill: '#636366', fontSize: 12 }} stroke="#d2d2d7" />
        <YAxis 
          type="category" 
          dataKey="courseName" 
          tick={{ fill: '#636366', fontSize: 11 }}
          stroke="#d2d2d7"
          width={120}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #d2d2d7',
            borderRadius: '8px',
            padding: '12px'
          }}
        />
        <Bar dataKey="issues" fill="#0071e3" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
