import { useState, useEffect } from 'react';
import { Check, X, MoreHorizontal, AlertCircle, Trash2, Archive, Eye, EyeOff, Download, Send } from 'lucide-react';
import { Button } from './button';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'warning';
  onClick: (selectedIds: string[]) => void;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  confirmationTitle?: string;
}

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  actions: BulkAction[];
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  position?: 'top' | 'bottom' | 'sticky';
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  actions,
  onSelectAll,
  onDeselectAll,
  position = 'sticky'
}: BulkActionsBarProps) {
  const [showConfirmation, setShowConfirmation] = useState<{
    action: BulkAction;
    selectedIds: string[];
  } | null>(null);

  const positionStyles = {
    top: 'relative',
    bottom: 'relative',
    sticky: 'sticky top-0 z-40'
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className={`${positionStyles[position]} bg-gradient-to-r from-[#0071e3] to-[#0077ed] border-b border-white/20 shadow-lg animate-in slide-in-from-top duration-200`}>
        <div className="px-6 py-3 flex items-center justify-between">
          {/* Left: Selection Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white">
                  {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
                </p>
                <p className="text-[13px] text-white/70">
                  {selectedCount === totalCount ? 'All items selected' : `${totalCount - selectedCount} remaining`}
                </p>
              </div>
            </div>

            {/* Select All/None */}
            <div className="flex items-center gap-2 ml-4">
              {selectedCount < totalCount && onSelectAll && (
                <button
                  onClick={onSelectAll}
                  className="text-[13px] text-white/90 hover:text-white font-medium underline underline-offset-2"
                >
                  Select all {totalCount}
                </button>
              )}
              {onDeselectAll && (
                <button
                  onClick={onDeselectAll}
                  className="text-[13px] text-white/90 hover:text-white font-medium underline underline-offset-2"
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {actions.map((action) => {
              const variantStyles = {
                default: 'bg-white/20 hover:bg-white/30 text-white border border-white/30',
                primary: 'bg-white hover:bg-white/90 text-[#0071e3] border-0',
                danger: 'bg-red-500 hover:bg-red-600 text-white border-0',
                warning: 'bg-amber-500 hover:bg-amber-600 text-white border-0'
              };

              return (
                <Button
                  key={action.id}
                  onClick={() => {
                    if (action.requiresConfirmation) {
                      // Show confirmation modal
                      setShowConfirmation({ action, selectedIds: [] });
                    } else {
                      action.onClick([]);
                    }
                  }}
                  className={`h-[40px] px-4 rounded-lg text-[14px] font-medium transition-all shadow-sm ${
                    variantStyles[action.variant || 'default']
                  }`}
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <ConfirmationModal
          action={showConfirmation.action}
          selectedCount={selectedCount}
          onConfirm={() => {
            showConfirmation.action.onClick(showConfirmation.selectedIds);
            setShowConfirmation(null);
          }}
          onCancel={() => setShowConfirmation(null)}
        />
      )}
    </>
  );
}

// Checkbox for Bulk Selection
interface BulkCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  label?: string;
}

export function BulkCheckbox({ checked, onChange, indeterminate = false, label }: BulkCheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            checked || indeterminate
              ? 'border-[#0071e3] bg-[#0071e3]'
              : 'border-[#d2d2d7] bg-white group-hover:border-[#636366]'
          }`}
        >
          {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          {indeterminate && !checked && (
            <div className="w-2.5 h-0.5 bg-white rounded-full" />
          )}
        </div>
      </div>
      {label && (
        <span className="text-[14px] text-[#1d1d1f] select-none">
          {label}
        </span>
      )}
    </label>
  );
}

// Bulk Action Row (for individual items)
interface BulkActionRowProps {
  id: string;
  checked: boolean;
  onToggle: (id: string, checked: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function BulkActionRow({ id, checked, onToggle, children, className = '' }: BulkActionRowProps) {
  return (
    <div
      className={`group/row relative transition-all ${
        checked ? 'bg-[#0071e3]/5 ring-2 ring-[#0071e3]/20' : 'hover:bg-[#f5f5f7]'
      } ${className}`}
    >
      {/* Checkbox Column */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/row:opacity-100 transition-opacity">
        <BulkCheckbox
          checked={checked}
          onChange={(isChecked) => onToggle(id, isChecked)}
        />
      </div>

      {/* Content */}
      <div className={`transition-all ${checked || 'group-hover/row:pl-8'}`}>
        {children}
      </div>
    </div>
  );
}

// Confirmation Modal
interface ConfirmationModalProps {
  action: BulkAction;
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmationModal({ action, selectedCount, onConfirm, onCancel }: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div 
        className="bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] max-w-[460px] w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title & Message */}
        <div className="px-6 pt-6 pb-5">
          <h3 className="text-[22px] font-bold text-[#1d1d1f] mb-3 leading-tight">
            {action.confirmationTitle || 'Confirm Action'}
          </h3>
          <p className="text-[16px] text-[#4a4a4a] leading-relaxed">
            {action.confirmationMessage || `Are you sure you want to ${action.label.toLowerCase()} ${selectedCount} ${selectedCount === 1 ? 'item' : 'items'}?`}
          </p>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col">
          {/* Primary Action */}
          <button
            onClick={onConfirm}
            className={`h-[56px] text-[17px] font-semibold text-white transition-colors ${
              action.variant === 'danger'
                ? 'bg-[#ff3b30] hover:bg-[#e6342a] active:bg-[#cc2e25]'
                : 'bg-[#007aff] hover:bg-[#0051d5] active:bg-[#004bb8]'
            }`}
          >
            {action.label}
          </button>
          
          {/* Cancel */}
          <button
            onClick={onCancel}
            className="h-[56px] text-[17px] font-normal text-[#636366] hover:bg-[#f5f5f7] active:bg-[#e8e8ed] transition-colors border-t border-[#d2d2d7]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Preset Bulk Actions
export const commonBulkActions = {
  fixAll: {
    id: 'fix-all',
    label: 'Fix All',
    icon: <Check className="w-4 h-4" strokeWidth={2} />,
    variant: 'primary' as const,
    requiresConfirmation: true,
    confirmationMessage: 'This will automatically fix all selected issues. You can undo changes later.'
  },
  ignore: {
    id: 'ignore',
    label: 'Ignore',
    icon: <EyeOff className="w-4 h-4" strokeWidth={2} />,
    variant: 'default' as const
  },
  delete: {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4" strokeWidth={2} />,
    variant: 'danger' as const,
    requiresConfirmation: true,
    confirmationMessage: 'This action cannot be undone. Are you sure you want to delete the selected items?'
  },
  archive: {
    id: 'archive',
    label: 'Archive',
    icon: <Archive className="w-4 h-4" strokeWidth={2} />,
    variant: 'default' as const
  },
  export: {
    id: 'export',
    label: 'Export',
    icon: <Download className="w-4 h-4" strokeWidth={2} />,
    variant: 'default' as const
  }
};

// Hook for managing bulk selection
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(items.map(item => item.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length) {
      deselectAll();
    } else {
      selectAll();
    }
  };

  const isSelected = (id: string) => selectedIds.has(id);

  const selectedItems = items.filter(item => selectedIds.has(item.id));

  return {
    selectedIds: Array.from(selectedIds),
    selectedItems,
    selectedCount: selectedIds.size,
    isSelected,
    toggleItem,
    selectAll,
    deselectAll,
    toggleAll,
    isAllSelected: selectedIds.size === items.length && items.length > 0,
    isIndeterminate: selectedIds.size > 0 && selectedIds.size < items.length
  };
}