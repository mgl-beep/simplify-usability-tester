import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, MoreVertical, Eye, Download, ExternalLink } from 'lucide-react';
import { Button } from './button';

// Table Types
export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => React.ReactNode;
}

export interface TableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: 'default' | 'primary' | 'danger';
  show?: (item: T) => boolean;
}

interface AdvancedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: TableAction<T>[];
  onRowClick?: (item: T) => void;
  sortable?: boolean;
  pagination?: {
    pageSize: number;
    showPageSize?: boolean;
  };
  emptyState?: React.ReactNode;
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  getRowId?: (item: T) => string;
  stickyHeader?: boolean;
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
}

export function AdvancedTable<T>({
  data,
  columns,
  actions,
  onRowClick,
  sortable = true,
  pagination,
  emptyState,
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  getRowId,
  stickyHeader = false,
  striped = false,
  hover = true,
  compact = false
}: AdvancedTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 10);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Sorting
  const handleSort = (key: string) => {
    if (!sortable) return;

    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedData = sortConfig
    ? [...data].sort((a, b) => {
        const aVal = (a as any)[sortConfig.key];
        const bVal = (b as any)[sortConfig.key];

        if (aVal === bVal) return 0;

        const comparison = aVal < bVal ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      })
    : data;

  // Pagination
  const totalPages = pagination ? Math.ceil(sortedData.length / pageSize) : 1;
  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  // Selection
  const handleSelectAll = () => {
    if (!selectable || !getRowId) return;

    const allIds = paginatedData.map(getRowId);
    const allSelected = allIds.every(id => selectedIds.includes(id));

    if (allSelected) {
      onSelectionChange?.(selectedIds.filter(id => !allIds.includes(id)));
    } else {
      onSelectionChange?.([...selectedIds, ...allIds.filter(id => !selectedIds.includes(id))]);
    }
  };

  const handleSelectRow = (item: T) => {
    if (!selectable || !getRowId) return;

    const id = getRowId(item);
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  };

  const isAllSelected = selectable && getRowId
    ? paginatedData.every(item => selectedIds.includes(getRowId(item)))
    : false;

  const isSomeSelected = selectable && getRowId
    ? paginatedData.some(item => selectedIds.includes(getRowId(item)))
    : false;

  if (loading) {
    return (
      <div className="bg-white rounded-[12px] border border-[#d2d2d7] p-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#e5e5e7] border-t-[#0071e3] rounded-full animate-spin" />
        <p className="text-[14px] text-[#636366] mt-4">Loading data...</p>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <div>{emptyState}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden">
        <div className={`overflow-x-auto ${stickyHeader ? 'max-h-[600px] overflow-y-auto' : ''}`}>
          <table className="w-full">
            {/* Header */}
            <thead className={`bg-[#EEECE8] border-b border-[#e5e5e7] ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
              <tr>
                {/* Selection Checkbox */}
                {selectable && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={input => {
                        if (input) input.indeterminate = isSomeSelected && !isAllSelected;
                      }}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-[#d2d2d7] text-[#0071e3] focus:ring-2 focus:ring-[#0071e3]"
                    />
                  </th>
                )}

                {/* Column Headers */}
                {columns.map(column => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-[13px] font-semibold text-[#1d1d1f] uppercase tracking-wide ${
                      column.sortable !== false && sortable ? 'cursor-pointer hover:bg-[#e5e5e7] transition-colors' : ''
                    } ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}`}
                    style={{ width: column.width }}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {column.sortable !== false && sortable && (
                        <div className="text-[#636366]">
                          {sortConfig?.key === column.key ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp className="w-4 h-4" strokeWidth={2} />
                            ) : (
                              <ChevronDown className="w-4 h-4" strokeWidth={2} />
                            )
                          ) : (
                            <ChevronsUpDown className="w-4 h-4 opacity-40" strokeWidth={2} />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}

                {/* Actions Column */}
                {actions && actions.length > 0 && (
                  <th className="w-24 px-4 py-3 text-right text-[13px] font-semibold text-[#1d1d1f] uppercase tracking-wide">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {paginatedData.map((item, index) => {
                const rowId = getRowId?.(item);
                const isSelected = rowId ? selectedIds.includes(rowId) : false;

                return (
                  <tr
                    key={rowId || index}
                    className={`border-b border-[#e5e5e7] last:border-0 transition-colors ${
                      striped && index % 2 === 1 ? 'bg-[#EEECE8]/30' : ''
                    } ${hover ? 'hover:bg-[#f5f5f7]' : ''} ${
                      isSelected ? 'bg-[#0071e3]/5' : ''
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => !selectable && onRowClick?.(item)}
                  >
                    {/* Selection Checkbox */}
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRow(item);
                          }}
                          className="w-4 h-4 rounded border-[#d2d2d7] text-[#0071e3] focus:ring-2 focus:ring-[#0071e3]"
                        />
                      </td>
                    )}

                    {/* Data Cells */}
                    {columns.map(column => (
                      <td
                        key={column.key}
                        className={`px-4 ${compact ? 'py-2' : 'py-3'} text-[14px] text-[#1d1d1f] ${
                          column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''
                        }`}
                      >
                        {column.render
                          ? column.render(item, index)
                          : String((item as any)[column.key] || '-')}
                      </td>
                    ))}

                    {/* Actions */}
                    {actions && actions.length > 0 && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {actions
                            .filter(action => !action.show || action.show(item))
                            .map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(item);
                                }}
                                className={`h-8 px-3 text-[13px] rounded-md ${
                                  action.variant === 'primary'
                                    ? 'bg-[#0071e3] text-white hover:bg-[#0077ed]'
                                    : action.variant === 'danger'
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-white border border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]'
                                }`}
                              >
                                {action.icon && <span className="mr-1.5">{action.icon}</span>}
                                {action.label}
                              </Button>
                            ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          {/* Page Info */}
          <div className="text-[14px] text-[#636366]">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-9 px-3 rounded-lg border border-[#d2d2d7] bg-white text-[#1d1d1f] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-[14px] font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#0071e3] text-white'
                        : 'bg-white border border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-9 px-3 rounded-lg border border-[#d2d2d7] bg-white text-[#1d1d1f] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          </div>

          {/* Page Size Selector */}
          {pagination.showPageSize && (
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[#636366]">Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-9 px-3 rounded-lg border border-[#d2d2d7] bg-white text-[14px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
