import { useState } from 'react';
import { Clock, CheckCircle2, XCircle, RotateCcw, Eye, User, Calendar, Filter } from 'lucide-react';
import { Button } from './button';

interface FixHistoryEntry {
  id: string;
  issueTitle: string;
  issueId: string;
  action: 'fixed' | 'staged' | 'published' | 'undone' | 'ignored';
  timestamp: Date;
  user?: string;
  originalContent?: string;
  fixedContent?: string;
  courseName?: string;
  location?: string;
  autoFixed?: boolean;
}

interface FixHistoryProps {
  entries: FixHistoryEntry[];
  onUndo?: (entry: FixHistoryEntry) => void;
  onViewDetails?: (entry: FixHistoryEntry) => void;
  showFilters?: boolean;
  showComparison?: boolean;
}

export function FixHistory({ 
  entries, 
  onUndo, 
  onViewDetails,
  showFilters = true,
  showComparison = true
}: FixHistoryProps) {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');

  const filteredEntries = entries.filter(entry => {
    if (filterAction !== 'all' && entry.action !== filterAction) return false;
    
    if (filterDate !== 'all') {
      const entryDate = new Date(entry.timestamp);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (filterDate === 'today' && daysDiff > 0) return false;
      if (filterDate === 'week' && daysDiff > 7) return false;
      if (filterDate === 'month' && daysDiff > 30) return false;
    }
    
    return true;
  });

  // Group by date
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, FixHistoryEntry[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold text-[#1d1d1f] tracking-tight">Fix History</h2>
          <p className="text-[14px] text-[#636366] mt-1">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'change' : 'changes'} recorded
          </p>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2">
            {/* Action Filter */}
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="h-[36px] px-3 pr-8 rounded-lg border border-[#d2d2d7] bg-white text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent"
            >
              <option value="all">All Actions</option>
              <option value="fixed">Fixed</option>
              <option value="staged">Staged</option>
              <option value="published">Published</option>
              <option value="undone">Undone</option>
              <option value="ignored">Ignored</option>
            </select>

            {/* Date Filter */}
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="h-[36px] px-3 pr-8 rounded-lg border border-[#d2d2d7] bg-white text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedEntries).map(([date, dateEntries]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-4 h-4 text-[#636366]" strokeWidth={2} />
              <h3 className="text-[14px] font-semibold text-[#1d1d1f]">{date}</h3>
              <div className="flex-1 h-px bg-[#e5e5e7]" />
            </div>

            {/* Entries */}
            <div className="space-y-3 pl-7">
              {dateEntries.map((entry) => (
                <FixHistoryCard
                  key={entry.id}
                  entry={entry}
                  onUndo={onUndo}
                  onViewDetails={onViewDetails}
                  showComparison={showComparison}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-[#d2d2d7] mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[15px] text-[#636366]">No history entries found</p>
        </div>
      )}
    </div>
  );
}

// Individual History Card
function FixHistoryCard({ 
  entry, 
  onUndo, 
  onViewDetails,
  showComparison 
}: { 
  entry: FixHistoryEntry;
  onUndo?: (entry: FixHistoryEntry) => void;
  onViewDetails?: (entry: FixHistoryEntry) => void;
  showComparison?: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);

  const actionConfig = {
    fixed: {
      icon: CheckCircle2,
      label: 'Fixed',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    staged: {
      icon: Clock,
      label: 'Staged',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    published: {
      icon: CheckCircle2,
      label: 'Published',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    undone: {
      icon: RotateCcw,
      label: 'Undone',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200'
    },
    ignored: {
      icon: XCircle,
      label: 'Ignored',
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200'
    }
  };

  const config = actionConfig[entry.action];
  const Icon = config.icon;
  const canUndo = entry.action === 'published' && entry.originalContent;

  return (
    <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden hover:shadow-md transition-all">
      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-full ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${config.color}`} strokeWidth={2} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <h4 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">
                  {entry.issueTitle}
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 ${config.bg} ${config.color} rounded text-[11px] font-semibold uppercase`}>
                    {config.label}
                  </span>
                  {entry.autoFixed && (
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-[11px] font-semibold uppercase">
                      Auto-Fixed
                    </span>
                  )}
                  {entry.courseName && (
                    <span className="text-[12px] text-[#636366]">
                      {entry.courseName}
                    </span>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <span className="text-[12px] text-[#636366] whitespace-nowrap">
                {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {/* Location */}
            {entry.location && (
              <p className="text-[13px] text-[#636366] mb-3">
                📍 {entry.location}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {showComparison && entry.originalContent && entry.fixedContent && (
                <Button
                  onClick={() => setShowDetails(!showDetails)}
                  className="h-[32px] px-3 rounded-lg border border-[#d2d2d7] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7] text-[13px]"
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                  {showDetails ? 'Hide' : 'Show'} Changes
                </Button>
              )}

              {canUndo && onUndo && (
                <Button
                  onClick={() => onUndo(entry)}
                  className="h-[32px] px-3 rounded-lg border border-[#d2d2d7] bg-white text-orange-600 hover:bg-orange-50 text-[13px]"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                  Undo
                </Button>
              )}

              {onViewDetails && (
                <Button
                  onClick={() => onViewDetails(entry)}
                  className="h-[32px] px-3 rounded-lg text-[#0071e3] hover:text-[#0077ed] text-[13px]"
                >
                  View Details →
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison View */}
      {showDetails && entry.originalContent && entry.fixedContent && (
        <div className="border-t border-[#e5e5e7] bg-[#EEECE8] p-4 animate-in slide-in-from-top-2 fade-in-0 duration-200">
          <div className="grid grid-cols-2 gap-4">
            {/* Before */}
            <div>
              <h5 className="text-[12px] font-semibold text-[#636366] uppercase tracking-wide mb-2">
                Before
              </h5>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                <pre className="text-[12px] text-[#1d1d1f] font-mono whitespace-pre-wrap">
                  {entry.originalContent}
                </pre>
              </div>
            </div>

            {/* After */}
            <div>
              <h5 className="text-[12px] font-semibold text-[#636366] uppercase tracking-wide mb-2">
                After
              </h5>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                <pre className="text-[12px] text-[#1d1d1f] font-mono whitespace-pre-wrap">
                  {entry.fixedContent}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact Timeline View
export function CompactTimeline({ entries, limit = 5 }: {
  entries: FixHistoryEntry[];
  limit?: number;
}) {
  const recentEntries = entries.slice(0, limit);

  return (
    <div className="space-y-3">
      {recentEntries.map((entry, index) => {
        const actionIcons = {
          fixed: <CheckCircle2 className="w-4 h-4 text-green-600" strokeWidth={2} />,
          staged: <Clock className="w-4 h-4 text-blue-600" strokeWidth={2} />,
          published: <CheckCircle2 className="w-4 h-4 text-green-600" strokeWidth={2} />,
          undone: <RotateCcw className="w-4 h-4 text-orange-600" strokeWidth={2} />,
          ignored: <XCircle className="w-4 h-4 text-gray-600" strokeWidth={2} />
        };

        return (
          <div key={entry.id} className="flex items-start gap-3">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#d2d2d7] flex items-center justify-center flex-shrink-0">
                {actionIcons[entry.action]}
              </div>
              {index < recentEntries.length - 1 && (
                <div className="w-0.5 h-full bg-[#e5e5e7] mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <p className="text-[14px] text-[#1d1d1f] font-medium mb-1">
                {entry.issueTitle}
              </p>
              <p className="text-[12px] text-[#636366]">
                {new Date(entry.timestamp).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Activity Summary Stats
export function ActivitySummary({ entries }: { entries: FixHistoryEntry[] }) {
  const stats = {
    total: entries.length,
    fixed: entries.filter(e => e.action === 'fixed' || e.action === 'published').length,
    staged: entries.filter(e => e.action === 'staged').length,
    undone: entries.filter(e => e.action === 'undone').length,
    autoFixed: entries.filter(e => e.autoFixed).length
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatBox label="Total Changes" value={stats.total} color="blue" />
      <StatBox label="Fixed" value={stats.fixed} color="green" />
      <StatBox label="Staged" value={stats.staged} color="blue" />
      <StatBox label="Auto-Fixed" value={stats.autoFixed} color="purple" />
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700'
  };

  return (
    <div className="bg-white rounded-lg border border-[#d2d2d7] p-4">
      <p className="text-[12px] text-[#636366] font-medium mb-1">{label}</p>
      <p className={`text-[28px] font-semibold ${colors[color]}`}>{value}</p>
    </div>
  );
}
