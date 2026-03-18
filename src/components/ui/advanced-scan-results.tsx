import { useState } from 'react';
import { LayoutGrid, List, SlidersHorizontal, Download, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { Button } from './button';
import type { ScanIssue } from '../../App';

type ViewMode = 'card' | 'table' | 'compact';
type SortField = 'title' | 'severity' | 'category' | 'status' | 'location';
type SortDirection = 'asc' | 'desc';
type GroupBy = 'none' | 'category' | 'severity' | 'status' | 'course' | 'module';

interface AdvancedScanResultsProps {
  issues: ScanIssue[];
  onSelectIssue?: (issue: ScanIssue) => void;
  renderIssueCard?: (issue: ScanIssue) => React.ReactNode;
  renderIssueRow?: (issue: ScanIssue) => React.ReactNode;
  showViewToggle?: boolean;
  showExport?: boolean;
  defaultView?: ViewMode;
  defaultSort?: { field: SortField; direction: SortDirection };
  defaultGroupBy?: GroupBy;
}

export function AdvancedScanResults({
  issues,
  onSelectIssue,
  renderIssueCard,
  renderIssueRow,
  showViewToggle = true,
  showExport = true,
  defaultView = 'card',
  defaultSort = { field: 'severity', direction: 'desc' },
  defaultGroupBy = 'none'
}: AdvancedScanResultsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [sortField, setSortField] = useState<SortField>(defaultSort.field);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort.direction);
  const [groupBy, setGroupBy] = useState<GroupBy>(defaultGroupBy);

  // Sorting logic — secondary sort by title groups similar issues together
  const sortedIssues = [...issues].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    let primary = 0;
    switch (sortField) {
      case 'severity':
        const severityOrder = { high: 3, medium: 2, low: 1 };
        primary = (severityOrder[a.severity] - severityOrder[b.severity]) * multiplier;
        break;
      case 'category':
        primary = a.category.localeCompare(b.category) * multiplier;
        break;
      case 'status':
        primary = (a.status || 'pending').localeCompare(b.status || 'pending') * multiplier;
        break;
      case 'location':
        primary = a.location.localeCompare(b.location) * multiplier;
        break;
      case 'title':
      default:
        return a.title.localeCompare(b.title) * multiplier;
    }
    // Secondary sort by title to group similar issues together
    if (primary !== 0) return primary;
    return a.title.localeCompare(b.title);
  });

  // Grouping logic
  const groupedIssues = groupBy === 'none' 
    ? { 'All Issues': sortedIssues }
    : sortedIssues.reduce((groups, issue) => {
        let key = '';
        switch (groupBy) {
          case 'category':
            key = issue.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            break;
          case 'severity':
            key = issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1);
            break;
          case 'status':
            key = (issue.status || 'pending').charAt(0).toUpperCase() + (issue.status || 'pending').slice(1);
            break;
          case 'course':
            key = issue.courseName || 'Unknown Course';
            break;
          case 'module':
            key = issue.location.split(' > ')[0] || 'No Module';
            break;
        }
        
        if (!groups[key]) groups[key] = [];
        groups[key].push(issue);
        return groups;
      }, {} as Record<string, ScanIssue[]>);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Title', 'Severity', 'Category', 'Status', 'Location', 'Description'].join(','),
      ...sortedIssues.map(issue => 
        [
          `"${issue.title}"`,
          issue.severity,
          issue.category,
          issue.status || 'pending',
          `"${issue.location}"`,
          `"${issue.description}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-[12px] border border-[#d2d2d7]">
        {/* Left: View Toggle */}
        {showViewToggle && (
          <div className="flex items-center gap-1 p-1 bg-[#EEECE8] rounded-lg">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'card'
                  ? 'bg-white text-[#0071e3] shadow-sm'
                  : 'text-[#636366] hover:text-[#1d1d1f]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#0071e3] shadow-sm'
                  : 'text-[#636366] hover:text-[#1d1d1f]'
              }`}
            >
              <List className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'compact'
                  ? 'bg-white text-[#0071e3] shadow-sm'
                  : 'text-[#636366] hover:text-[#1d1d1f]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Center: Controls */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          {/* Sort */}
          <SortDropdown
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          {/* Group By */}
          <GroupByDropdown
            groupBy={groupBy}
            onGroupChange={setGroupBy}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {showExport && (
            <Button
              onClick={handleExport}
              className="h-[36px] px-4 rounded-lg border border-[#d2d2d7] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
            >
              <Download className="w-4 h-4 mr-2" strokeWidth={2} />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-4">
        <p className="text-[14px] text-[#636366]">
          Showing <span className="font-semibold text-[#1d1d1f]">{issues.length}</span> {issues.length === 1 ? 'issue' : 'issues'}
          {groupBy !== 'none' && (
            <span> grouped by <span className="font-semibold text-[#1d1d1f]">{groupBy}</span></span>
          )}
        </p>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {Object.entries(groupedIssues).map(([groupName, groupIssues]) => (
          <div key={groupName}>
            {groupBy !== 'none' && (
              <div className="mb-4">
                <h3 className="text-[16px] font-semibold text-[#1d1d1f] tracking-tight">
                  {groupName}
                  <span className="ml-2 text-[14px] text-[#636366] font-normal">
                    ({groupIssues.length})
                  </span>
                </h3>
              </div>
            )}

            {viewMode === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupIssues.map((issue) => (
                  <div key={issue.id} onClick={() => onSelectIssue?.(issue)}>
                    {renderIssueCard ? renderIssueCard(issue) : <DefaultIssueCard issue={issue} />}
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'table' && (
              <IssueTable
                issues={groupIssues}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onSelectIssue={onSelectIssue}
                renderRow={renderIssueRow}
              />
            )}

            {viewMode === 'compact' && (
              <div className="space-y-1">
                {groupIssues.map((issue) => (
                  <div key={issue.id} onClick={() => onSelectIssue?.(issue)}>
                    {renderIssueRow ? renderIssueRow(issue) : <DefaultIssueCompact issue={issue} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Sort Dropdown
function SortDropdown({ sortField, sortDirection, onSort }: {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const options: { field: SortField; label: string }[] = [
    { field: 'severity', label: 'Severity' },
    { field: 'title', label: 'Title' },
    { field: 'category', label: 'Category' },
    { field: 'status', label: 'Status' },
    { field: 'location', label: 'Location' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#d2d2d7] bg-white hover:bg-[#f5f5f7] transition-colors"
      >
        <ArrowUpDown className="w-4 h-4 text-[#636366]" strokeWidth={2} />
        <span className="text-[13px] text-[#1d1d1f] font-medium">
          Sort: {options.find(o => o.field === sortField)?.label}
        </span>
        {sortDirection === 'asc' ? (
          <ArrowUp className="w-3 h-3 text-[#0071e3]" strokeWidth={2.5} />
        ) : (
          <ArrowDown className="w-3 h-3 text-[#0071e3]" strokeWidth={2.5} />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[180px] bg-white rounded-lg border border-[#d2d2d7] shadow-xl z-50">
          {options.map((option) => (
            <button
              key={option.field}
              onClick={() => {
                onSort(option.field);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-[13px] transition-colors ${
                sortField === option.field
                  ? 'bg-[#0071e3]/10 text-[#0071e3] font-medium'
                  : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Group By Dropdown
function GroupByDropdown({ groupBy, onGroupChange }: {
  groupBy: GroupBy;
  onGroupChange: (group: GroupBy) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const options: { value: GroupBy; label: string }[] = [
    { value: 'none', label: 'No Grouping' },
    { value: 'category', label: 'By Category' },
    { value: 'severity', label: 'By Severity' },
    { value: 'status', label: 'By Status' },
    { value: 'course', label: 'By Course' },
    { value: 'module', label: 'By Module' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#d2d2d7] bg-white hover:bg-[#f5f5f7] transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4 text-[#636366]" strokeWidth={2} />
        <span className="text-[13px] text-[#1d1d1f] font-medium">
          {options.find(o => o.value === groupBy)?.label}
        </span>
        <ChevronDown className="w-3 h-3 text-[#636366]" strokeWidth={2} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[160px] bg-white rounded-lg border border-[#d2d2d7] shadow-xl z-50">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onGroupChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-[13px] transition-colors ${
                groupBy === option.value
                  ? 'bg-[#0071e3]/10 text-[#0071e3] font-medium'
                  : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Default Issue Card
function DefaultIssueCard({ issue }: { issue: ScanIssue }) {
  return (
    <div className="bg-white rounded-lg border border-[#d2d2d7] p-4 hover:shadow-md transition-all cursor-pointer">
      <h4 className="text-[15px] font-semibold text-[#1d1d1f] mb-2">{issue.title}</h4>
      <p className="text-[13px] text-[#636366] line-clamp-2 mb-3">{issue.description}</p>
      <div className="flex items-center gap-2 text-[12px] text-[#636366]">
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded">{issue.severity}</span>
        <span>{issue.location}</span>
      </div>
    </div>
  );
}

// Default Compact Row
function DefaultIssueCompact({ issue }: { issue: ScanIssue }) {
  return (
    <div className="bg-white rounded-lg border border-[#d2d2d7] px-4 py-3 hover:bg-[#f5f5f7] transition-colors cursor-pointer flex items-center justify-between">
      <div className="flex-1">
        <span className="text-[14px] text-[#1d1d1f] font-medium">{issue.title}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-[#636366]">{issue.location}</span>
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[11px] font-semibold">{issue.severity}</span>
      </div>
    </div>
  );
}

// Issue Table
function IssueTable({ issues, sortField, sortDirection, onSort, onSelectIssue, renderRow }: {
  issues: ScanIssue[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onSelectIssue?: (issue: ScanIssue) => void;
  renderRow?: (issue: ScanIssue) => React.ReactNode;
}) {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-[#d2d2d7]" strokeWidth={2} />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-[#0071e3]" strokeWidth={2.5} />
      : <ArrowDown className="w-3 h-3 text-[#0071e3]" strokeWidth={2.5} />;
  };

  return (
    <div className="bg-white rounded-lg border border-[#d2d2d7] overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#EEECE8] border-b border-[#e5e5e7]">
          <tr>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => onSort('title')}
                className="flex items-center gap-2 text-[13px] font-semibold text-[#1d1d1f] hover:text-[#0071e3] transition-colors"
              >
                Issue
                <SortIcon field="title" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => onSort('severity')}
                className="flex items-center gap-2 text-[13px] font-semibold text-[#1d1d1f] hover:text-[#0071e3] transition-colors"
              >
                Severity
                <SortIcon field="severity" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => onSort('category')}
                className="flex items-center gap-2 text-[13px] font-semibold text-[#1d1d1f] hover:text-[#0071e3] transition-colors"
              >
                Category
                <SortIcon field="category" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => onSort('status')}
                className="flex items-center gap-2 text-[13px] font-semibold text-[#1d1d1f] hover:text-[#0071e3] transition-colors"
              >
                Status
                <SortIcon field="status" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => onSort('location')}
                className="flex items-center gap-2 text-[13px] font-semibold text-[#1d1d1f] hover:text-[#0071e3] transition-colors"
              >
                Location
                <SortIcon field="location" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, index) => (
            <tr
              key={issue.id}
              onClick={() => onSelectIssue?.(issue)}
              className={`cursor-pointer hover:bg-[#f5f5f7] transition-colors ${
                index !== issues.length - 1 ? 'border-b border-[#e5e5e7]' : ''
              }`}
            >
              {renderRow ? (
                renderRow(issue)
              ) : (
                <>
                  <td className="px-4 py-3 text-[14px] text-[#1d1d1f] font-medium">{issue.title}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[11px] font-semibold uppercase">
                      {issue.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#636366]">{issue.category}</td>
                  <td className="px-4 py-3 text-[13px] text-[#636366]">{issue.status || 'Pending'}</td>
                  <td className="px-4 py-3 text-[13px] text-[#636366]">{issue.location}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
