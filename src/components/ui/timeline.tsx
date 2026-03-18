import { Check, X, Clock, AlertCircle, Undo2, User, Bot, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';

// Timeline Item Types
export interface TimelineItem {
  id: string;
  timestamp: Date;
  type: 'fix' | 'undo' | 'scan' | 'import' | 'error' | 'info';
  title: string;
  description?: string;
  user?: string;
  automated?: boolean;
  metadata?: Record<string, any>;
  status?: 'success' | 'error' | 'pending' | 'warning';
  details?: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'danger';
  }>;
}

interface TimelineProps {
  items: TimelineItem[];
  grouped?: boolean;
  compact?: boolean;
  showFilters?: boolean;
  onUndo?: (itemId: string) => void;
}

export function Timeline({ items, grouped = false, compact = false, showFilters = true, onUndo }: TimelineProps) {
  const [filter, setFilter] = useState<'all' | 'fixes' | 'scans' | 'errors'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'fixes') return item.type === 'fix' || item.type === 'undo';
    if (filter === 'scans') return item.type === 'scan';
    if (filter === 'errors') return item.status === 'error';
    return true;
  });

  const groupedItems = grouped ? groupByDate(filteredItems) : { 'All Activity': filteredItems };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-2">
          {(['all', 'fixes', 'scans', 'errors'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-[14px] font-medium transition-all ${
                filter === f
                  ? 'bg-[#0071e3] text-white'
                  : 'bg-white border border-[#d2d2d7] text-[#1d1d1f] hover:border-[#636366]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[12px] ${
                  filter === f ? 'bg-white/20' : 'bg-[#e5e5e7] text-[#636366]'
                }`}>
                  {items.filter(item => {
                    if (f === 'fixes') return item.type === 'fix' || item.type === 'undo';
                    if (f === 'scans') return item.type === 'scan';
                    if (f === 'errors') return item.status === 'error';
                    return true;
                  }).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      {Object.entries(groupedItems).map(([date, dateItems]) => (
        <div key={date}>
          {/* Date Header */}
          {grouped && (
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-4 h-4 text-[#636366]" strokeWidth={2} />
              <h3 className="text-[15px] font-semibold text-[#1d1d1f]">{date}</h3>
              <div className="flex-1 h-px bg-[#e5e5e7]" />
            </div>
          )}

          {/* Items */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-[#e5e5e7]" />

            {/* Timeline Items */}
            <div className="space-y-4">
              {dateItems.map((item, index) => (
                <TimelineItemComponent
                  key={item.id}
                  item={item}
                  compact={compact}
                  isExpanded={expandedItems.has(item.id)}
                  onToggleExpanded={() => toggleExpanded(item.id)}
                  onUndo={onUndo}
                  isLast={index === dateItems.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-[#d2d2d7] mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[15px] text-[#636366]">No activity found</p>
        </div>
      )}
    </div>
  );
}

// Timeline Item Component
interface TimelineItemComponentProps {
  item: TimelineItem;
  compact: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUndo?: (itemId: string) => void;
  isLast: boolean;
}

function TimelineItemComponent({ 
  item, 
  compact, 
  isExpanded, 
  onToggleExpanded, 
  onUndo,
  isLast 
}: TimelineItemComponentProps) {
  const typeConfig = {
    fix: {
      icon: Check,
      bg: 'bg-green-100',
      border: 'border-green-500',
      icon_color: 'text-green-600'
    },
    undo: {
      icon: Undo2,
      bg: 'bg-blue-100',
      border: 'border-blue-500',
      icon_color: 'text-blue-600'
    },
    scan: {
      icon: Clock,
      bg: 'bg-purple-100',
      border: 'border-purple-500',
      icon_color: 'text-purple-600'
    },
    import: {
      icon: Calendar,
      bg: 'bg-indigo-100',
      border: 'border-indigo-500',
      icon_color: 'text-indigo-600'
    },
    error: {
      icon: X,
      bg: 'bg-red-100',
      border: 'border-red-500',
      icon_color: 'text-red-600'
    },
    info: {
      icon: AlertCircle,
      bg: 'bg-gray-100',
      border: 'border-gray-500',
      icon_color: 'text-gray-600'
    }
  };

  const config = typeConfig[item.type];
  const Icon = config.icon;
  const hasDetails = !!item.details;

  return (
    <div className="relative pl-12 pb-4">
      {/* Icon */}
      <div 
        className={`absolute left-0 top-0 w-10 h-10 rounded-full ${config.bg} border-2 ${config.border} flex items-center justify-center z-10`}
      >
        <Icon className={`w-5 h-5 ${config.icon_color}`} strokeWidth={2} />
      </div>

      {/* Content Card */}
      <div className={`bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden ${
        item.status === 'error' ? 'border-red-300 bg-red-50/30' : ''
      } ${item.status === 'warning' ? 'border-amber-300 bg-amber-50/30' : ''}`}>
        {/* Header */}
        <div className={`${compact ? 'p-3' : 'p-4'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Title & Time */}
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-[15px] font-semibold text-[#1d1d1f]">
                  {item.title}
                </h4>
                <span className="text-[12px] text-[#636366]">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-[14px] text-[#636366] mb-2 leading-relaxed">
                  {item.description}
                </p>
              )}

              {/* User/Automated Badge */}
              <div className="flex items-center gap-2">
                {item.automated ? (
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-100 border border-purple-200 rounded-full">
                    <Bot className="w-3 h-3 text-purple-600" strokeWidth={2} />
                    <span className="text-[11px] font-semibold text-purple-700">Automated</span>
                  </div>
                ) : item.user ? (
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-100 border border-blue-200 rounded-full">
                    <User className="w-3 h-3 text-blue-600" strokeWidth={2} />
                    <span className="text-[11px] font-semibold text-blue-700">{item.user}</span>
                  </div>
                ) : null}

                {/* Status Badge */}
                {item.status && (
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${
                    item.status === 'success' ? 'bg-green-100 border border-green-200' :
                    item.status === 'error' ? 'bg-red-100 border border-red-200' :
                    item.status === 'warning' ? 'bg-amber-100 border border-amber-200' :
                    'bg-gray-100 border border-gray-200'
                  }`}>
                    <span className={`text-[11px] font-semibold ${
                      item.status === 'success' ? 'text-green-700' :
                      item.status === 'error' ? 'text-red-700' :
                      item.status === 'warning' ? 'text-amber-700' :
                      'text-gray-700'
                    }`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Undo Button */}
              {item.type === 'fix' && onUndo && (
                <Button
                  onClick={() => onUndo(item.id)}
                  className="h-8 px-3 text-[13px] rounded-md bg-white border border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]"
                >
                  <Undo2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                  Undo
                </Button>
              )}

              {/* Custom Actions */}
              {item.actions?.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  className={`h-8 px-3 text-[13px] rounded-md ${
                    action.variant === 'primary' ? 'bg-[#0071e3] text-white hover:bg-[#0077ed]' :
                    action.variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
                    'bg-white border border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]'
                  }`}
                >
                  {action.label}
                </Button>
              ))}

              {/* Expand/Collapse */}
              {hasDetails && (
                <button
                  onClick={onToggleExpanded}
                  className="w-8 h-8 rounded-md bg-[#EEECE8] hover:bg-[#e5e5e7] flex items-center justify-center transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#636366]" strokeWidth={2} />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#636366]" strokeWidth={2} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        {hasDetails && isExpanded && (
          <div className="border-t border-[#e5e5e7] p-4 bg-[#EEECE8]/50">
            {item.details}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Functions
function groupByDate(items: TimelineItem[]): Record<string, TimelineItem[]> {
  const grouped: Record<string, TimelineItem[]> = {};

  items.forEach(item => {
    const date = formatDate(item.timestamp);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(item);
  });

  return grouped;
}

function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const itemDate = new Date(date);

  if (itemDate.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (itemDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return itemDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: itemDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
    });
  }
}

function formatTimestamp(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Compact Timeline Version
export function CompactTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const typeConfig = {
          fix: { icon: Check, color: 'text-green-600' },
          undo: { icon: Undo2, color: 'text-blue-600' },
          scan: { icon: Clock, color: 'text-purple-600' },
          import: { icon: Calendar, color: 'text-indigo-600' },
          error: { icon: X, color: 'text-red-600' },
          info: { icon: AlertCircle, color: 'text-gray-600' }
        };

        const config = typeConfig[item.type];
        const Icon = config.icon;

        return (
          <div 
            key={item.id} 
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f5f5f7] transition-colors"
          >
            <Icon className={`w-4 h-4 ${config.color} flex-shrink-0`} strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#1d1d1f] truncate">
                {item.title}
              </p>
              {item.description && (
                <p className="text-[12px] text-[#636366] truncate">
                  {item.description}
                </p>
              )}
            </div>
            <span className="text-[11px] text-[#636366] flex-shrink-0">
              {formatTimestamp(item.timestamp)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
