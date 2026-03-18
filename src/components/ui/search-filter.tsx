import { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { Button } from './button';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  type: 'single' | 'multiple';
}

interface SearchFilterProps {
  placeholder?: string;
  filters?: FilterGroup[];
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: Record<string, string[]>) => void;
  searchValue?: string;
  activeFilters?: Record<string, string[]>;
  showFilterCount?: boolean;
}

export function SearchFilter({
  placeholder = 'Search...',
  filters = [],
  onSearch,
  onFilterChange,
  searchValue = '',
  activeFilters = {},
  showFilterCount = true
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState(searchValue);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(activeFilters);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearch?.(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, onSearch]);

  const handleFilterToggle = (groupId: string, optionValue: string, type: 'single' | 'multiple') => {
    setSelectedFilters(prev => {
      const current = prev[groupId] || [];
      let updated: string[];

      if (type === 'single') {
        updated = current.includes(optionValue) ? [] : [optionValue];
      } else {
        updated = current.includes(optionValue)
          ? current.filter(v => v !== optionValue)
          : [...current, optionValue];
      }

      const newFilters = { ...prev, [groupId]: updated };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    onFilterChange?.({});
  };

  const activeFilterCount = Object.values(selectedFilters).reduce(
    (count, values) => count + values.length,
    0
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636366]" strokeWidth={2} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full h-[44px] pl-10 pr-10 rounded-full border border-[#d2d2d7] bg-white text-[15px] text-[#1d1d1f] placeholder:text-[#636366] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#e5e5e7] hover:bg-[#d2d2d7] flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-[#636366]" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Filter Button */}
        {filters.length > 0 && (
          <div className="relative" ref={filtersRef}>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-[44px] px-4 rounded-full border transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3]'
                  : 'border-[#d2d2d7] bg-white text-[#1d1d1f]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" strokeWidth={2} />
              Filters
              {showFilterCount && activeFilterCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-[#0071e3] text-white text-[12px] font-semibold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Filters Dropdown */}
            {showFilters && (
              <div className="absolute top-full right-0 mt-2 w-[320px] bg-white rounded-[12px] border border-[#d2d2d7] shadow-2xl z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#e5e5e7]">
                  <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Filter Options</h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[13px] text-[#0071e3] hover:text-[#0077ed] font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Filter Groups */}
                <div className="max-h-[400px] overflow-y-auto">
                  {filters.map((group, groupIndex) => (
                    <div key={group.id} className={groupIndex > 0 ? 'border-t border-[#e5e5e7]' : ''}>
                      <div className="p-4">
                        <h4 className="text-[13px] font-semibold text-[#636366] uppercase tracking-wide mb-3">
                          {group.label}
                        </h4>
                        <div className="space-y-2">
                          {group.options.map((option) => {
                            const isSelected = selectedFilters[group.id]?.includes(option.value) || false;

                            return (
                              <button
                                key={option.id}
                                onClick={() => handleFilterToggle(group.id, option.value, group.type)}
                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#f5f5f7] transition-colors group/option"
                              >
                                <span className={`text-[14px] ${isSelected ? 'text-[#1d1d1f] font-medium' : 'text-[#636366]'}`}>
                                  {option.label}
                                </span>
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'border-[#0071e3] bg-[#0071e3]'
                                    : 'border-[#d2d2d7] bg-white group-hover/option:border-[#636366]'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-[13px] text-[#636366] font-medium">Active filters:</span>
          {Object.entries(selectedFilters).map(([groupId, values]) =>
            values.map((value) => {
              const group = filters.find(f => f.id === groupId);
              const option = group?.options.find(o => o.value === value);

              return option ? (
                <button
                  key={`${groupId}-${value}`}
                  onClick={() => handleFilterToggle(groupId, value, group?.type || 'multiple')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0071e3]/10 border border-[#0071e3]/20 rounded-full text-[13px] text-[#0071e3] font-medium hover:bg-[#0071e3]/20 transition-colors"
                >
                  {option.label}
                  <X className="w-3 h-3" strokeWidth={2.5} />
                </button>
              ) : null;
            })
          )}
        </div>
      )}
    </div>
  );
}

// Quick Filter Buttons (for common filters)
interface QuickFilterProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}

export function QuickFilter({ label, active, onClick, count }: QuickFilterProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium transition-all ${
        active
          ? 'bg-[#0071e3] text-white shadow-sm'
          : 'bg-white border border-[#d2d2d7] text-[#1d1d1f] hover:border-[#636366]'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`px-1.5 py-0.5 rounded text-[12px] font-semibold ${
          active ? 'bg-white/20' : 'bg-[#e5e5e7] text-[#636366]'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// Saved Filter Presets
interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, string[]>;
  count?: number;
}

interface SavedFiltersProps {
  savedFilters: SavedFilter[];
  onSelect: (filters: Record<string, string[]>) => void;
  onSave?: (name: string, filters: Record<string, string[]>) => void;
  onDelete?: (id: string) => void;
  currentFilters: Record<string, string[]>;
}

export function SavedFilters({ savedFilters, onSelect, onSave, onDelete, currentFilters }: SavedFiltersProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterName, setFilterName] = useState('');

  const handleSave = () => {
    if (filterName.trim() && onSave) {
      onSave(filterName, currentFilters);
      setFilterName('');
      setShowSaveModal(false);
    }
  };

  const hasActiveFilters = Object.values(currentFilters).some(arr => arr.length > 0);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {savedFilters.map((saved) => (
        <div key={saved.id} className="flex items-center gap-1 bg-white border border-[#d2d2d7] rounded-full pl-4 pr-1 py-1">
          <button
            onClick={() => onSelect(saved.filters)}
            className="text-[13px] text-[#1d1d1f] font-medium hover:text-[#0071e3] transition-colors"
          >
            {saved.name}
            {saved.count !== undefined && (
              <span className="ml-2 text-[#636366]">({saved.count})</span>
            )}
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(saved.id)}
              className="w-6 h-6 rounded-full hover:bg-[#e5e5e7] flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-[#636366]" strokeWidth={2.5} />
            </button>
          )}
        </div>
      ))}

      {hasActiveFilters && onSave && (
        <button
          onClick={() => setShowSaveModal(true)}
          className="px-4 py-1.5 bg-white border border-dashed border-[#636366] rounded-full text-[13px] text-[#636366] hover:border-[#0071e3] hover:text-[#0071e3] font-medium transition-colors whitespace-nowrap"
        >
          + Save Filter
        </button>
      )}

      {/* Save Filter Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] p-6 w-full max-w-[400px] shadow-2xl">
            <h3 className="text-[18px] font-semibold text-[#1d1d1f] mb-4">Save Filter Preset</h3>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Filter name (e.g., High Priority Items)"
              className="w-full h-[44px] px-4 rounded-lg border border-[#d2d2d7] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 h-[44px] rounded-full border border-[#d2d2d7] bg-white text-[#1d1d1f]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!filterName.trim()}
                className="flex-1 h-[44px] rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white disabled:opacity-50"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
