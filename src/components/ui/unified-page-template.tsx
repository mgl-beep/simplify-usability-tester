import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Button } from './button';

interface PageAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
}

interface UnifiedPageTemplateProps {
  title: string;
  subtitle?: string;
  actions?: PageAction[];
  stats?: React.ReactNode;
  primaryContent: React.ReactNode;
  secondaryContent?: React.ReactNode;
  secondaryTitle?: string;
  defaultExpanded?: boolean;
  compactMode?: boolean;
}

export function UnifiedPageTemplate({
  title,
  subtitle,
  actions,
  stats,
  primaryContent,
  secondaryContent,
  secondaryTitle = 'Additional Details',
  defaultExpanded = false,
  compactMode = true
}: UnifiedPageTemplateProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="min-h-screen bg-[#EEECE8]">
      {/* Header - Consistent across all pages */}
      <div className="bg-white border-b border-[#d2d2d7]">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex items-start justify-between gap-6">
            {/* Title Section */}
            <div className="flex-1 min-w-0">
              <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight mb-1">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[14px] text-[#636366]">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Actions */}
            {actions && actions.length > 0 && (
              <div className="flex items-center gap-3 flex-shrink-0">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    className={`h-10 px-4 rounded-lg font-medium text-[14px] ${
                      action.variant === 'primary'
                        ? 'bg-[#0071e3] text-white hover:bg-[#0077ed]'
                        : action.variant === 'secondary'
                        ? 'bg-[#00d084] text-white hover:bg-[#00ba75]'
                        : 'bg-white border border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]'
                    }`}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <div className="space-y-6">
          {/* Stats Summary - Above the fold */}
          {stats && (
            <div className="bg-white rounded-[12px] border border-[#d2d2d7] p-6">
              {stats}
            </div>
          )}

          {/* Primary Content - Key information, minimal scrolling */}
          <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden">
            {primaryContent}
          </div>

          {/* Secondary Content - Collapsible */}
          {secondaryContent && (
            <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#f5f5f7] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
                    {secondaryTitle}
                  </h3>
                  <Info className="w-4 h-4 text-[#636366]" strokeWidth={2} />
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[#636366]" strokeWidth={2} />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#636366]" strokeWidth={2} />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-[#e5e5e7] p-6 animate-in slide-in-from-top-2 fade-in-0 duration-200">
                  {secondaryContent}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Unified Stats Grid - Consistent across all pages
interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function UnifiedStatsGrid({ stats }: { stats: StatCardProps[] }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <UnifiedStatCard key={index} {...stat} />
      ))}
    </div>
  );
}

function UnifiedStatCard({ label, value, sublabel, trend, icon, onClick }: StatCardProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`text-left ${onClick ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[13px] font-medium text-[#636366] uppercase tracking-wide">
          {label}
        </span>
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[36px] font-semibold text-[#1d1d1f] tracking-tight leading-none mb-1">
            {value}
          </p>
          {sublabel && (
            <p className="text-[13px] text-[#636366]">
              {sublabel}
            </p>
          )}
        </div>
        {trend && (
          <div className={`px-2 py-1 rounded-full text-[12px] font-semibold ${
            trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </Component>
  );
}

// Unified Grid Container - Consistent spacing
interface UnifiedGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: number;
}

export function UnifiedGrid({ children, columns = 3, gap = 4 }: UnifiedGridProps) {
  return (
    <div 
      className={`grid gap-${gap}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}

// Unified Card - Consistent card style
interface UnifiedCardProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  interactive?: boolean;
}

export function UnifiedCard({
  title,
  description,
  action,
  children,
  padding = 'md',
  onClick,
  interactive = false
}: UnifiedCardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`bg-white rounded-[12px] border border-[#d2d2d7] text-left ${
        interactive || onClick ? 'hover:shadow-md hover:border-[#636366] transition-all cursor-pointer' : ''
      }`}
    >
      {(title || action) && (
        <div className={`flex items-start justify-between border-b border-[#e5e5e7] ${paddings.md}`}>
          <div>
            {title && (
              <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-1">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-[13px] text-[#636366]">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={paddings[padding]}>
        {children}
      </div>
    </Component>
  );
}

// Unified Section Header
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function UnifiedSectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-[18px] font-semibold text-[#1d1d1f] tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[13px] text-[#636366] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
