import { useState } from 'react';
import { LayoutGrid, List, Table2, Columns } from 'lucide-react';

export type ViewMode = 'grid' | 'list' | 'table' | 'compact';

interface ViewToggleProps {
  modes?: ViewMode[];
  defaultMode?: ViewMode;
  onChange?: (mode: ViewMode) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function ViewToggle({ 
  modes = ['grid', 'list', 'table'], 
  defaultMode = 'grid',
  onChange,
  size = 'md'
}: ViewToggleProps) {
  const [activeMode, setActiveMode] = useState<ViewMode>(defaultMode);

  const handleModeChange = (mode: ViewMode) => {
    setActiveMode(mode);
    onChange?.(mode);
  };

  const modeConfig = {
    grid: {
      icon: LayoutGrid,
      label: 'Grid View',
      tooltip: 'View as grid'
    },
    list: {
      icon: List,
      label: 'List View',
      tooltip: 'View as list'
    },
    table: {
      icon: Table2,
      label: 'Table View',
      tooltip: 'View as table'
    },
    compact: {
      icon: Columns,
      label: 'Compact View',
      tooltip: 'View as compact list'
    }
  };

  const sizes = {
    sm: { button: 'w-8 h-8', icon: 'w-3.5 h-3.5' },
    md: { button: 'w-9 h-9', icon: 'w-4 h-4' },
    lg: { button: 'w-10 h-10', icon: 'w-5 h-5' }
  };

  const s = sizes[size];

  return (
    <div className="inline-flex items-center bg-[#EEECE8] rounded-lg p-1 gap-1">
      {modes.map((mode) => {
        const config = modeConfig[mode];
        const Icon = config.icon;
        const isActive = activeMode === mode;

        return (
          <button
            key={mode}
            onClick={() => handleModeChange(mode)}
            className={`${s.button} rounded-md flex items-center justify-center transition-all ${
              isActive
                ? 'bg-white shadow-sm text-[#0071e3]'
                : 'text-[#636366] hover:text-[#1d1d1f]'
            }`}
            title={config.tooltip}
            aria-label={config.label}
          >
            <Icon className={s.icon} strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}

// View Container - Handles different layout modes
interface ViewContainerProps<T> {
  mode: ViewMode;
  items: T[];
  renderGrid: (item: T, index: number) => React.ReactNode;
  renderList: (item: T, index: number) => React.ReactNode;
  renderTable?: (items: T[]) => React.ReactNode;
  renderCompact?: (item: T, index: number) => React.ReactNode;
  gridCols?: number;
  gap?: number;
}

export function ViewContainer<T>({
  mode,
  items,
  renderGrid,
  renderList,
  renderTable,
  renderCompact,
  gridCols = 3,
  gap = 4
}: ViewContainerProps<T>) {
  if (mode === 'table' && renderTable) {
    return <div>{renderTable(items)}</div>;
  }

  if (mode === 'grid') {
    return (
      <div 
        className={`grid gap-${gap}`}
        style={{ 
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` 
        }}
      >
        {items.map((item, index) => (
          <div key={index}>{renderGrid(item, index)}</div>
        ))}
      </div>
    );
  }

  if (mode === 'compact' && renderCompact) {
    return (
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index}>{renderCompact(item, index)}</div>
        ))}
      </div>
    );
  }

  // Default: list mode
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index}>{renderList(item, index)}</div>
      ))}
    </div>
  );
}

// Responsive Grid Helper
interface ResponsiveGridProps {
  children: React.ReactNode;
  minWidth?: number;
  gap?: number;
}

export function ResponsiveGrid({ children, minWidth = 280, gap = 16 }: ResponsiveGridProps) {
  return (
    <div 
      className="grid"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
        gap: `${gap}px`
      }}
    >
      {children}
    </div>
  );
}

// View Settings Panel
interface ViewSettingsProps {
  sortOptions: Array<{ value: string; label: string }>;
  currentSort: string;
  onSortChange: (value: string) => void;
  densityOptions?: Array<{ value: 'comfortable' | 'compact' | 'spacious'; label: string }>;
  currentDensity?: 'comfortable' | 'compact' | 'spacious';
  onDensityChange?: (value: 'comfortable' | 'compact' | 'spacious') => void;
}

export function ViewSettings({
  sortOptions,
  currentSort,
  onSortChange,
  densityOptions,
  currentDensity,
  onDensityChange
}: ViewSettingsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Sort */}
      <div className="flex items-center gap-2">
        <label className="text-[13px] text-[#636366] font-medium">Sort by:</label>
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="h-9 px-3 rounded-lg border border-[#d2d2d7] bg-white text-[14px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Density */}
      {densityOptions && onDensityChange && currentDensity && (
        <div className="flex items-center gap-2">
          <label className="text-[13px] text-[#636366] font-medium">Density:</label>
          <div className="inline-flex items-center bg-[#EEECE8] rounded-lg p-1 gap-1">
            {densityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onDensityChange(option.value)}
                className={`px-3 h-7 rounded-md text-[13px] font-medium transition-all ${
                  currentDensity === option.value
                    ? 'bg-white shadow-sm text-[#0071e3]'
                    : 'text-[#636366] hover:text-[#1d1d1f]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Complete View Header
interface ViewHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  viewModes?: ViewMode[];
  sortOptions: Array<{ value: string; label: string }>;
  currentSort: string;
  onSortChange: (value: string) => void;
  actions?: React.ReactNode;
}

export function ViewHeader({
  title,
  subtitle,
  count,
  viewMode,
  onViewModeChange,
  viewModes = ['grid', 'list', 'table'],
  sortOptions,
  currentSort,
  onSortChange,
  actions
}: ViewHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      {/* Title Section */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3">
          <h2 className="text-[24px] font-semibold text-[#1d1d1f] tracking-tight">
            {title}
          </h2>
          {count !== undefined && (
            <span className="text-[16px] text-[#636366] font-normal">
              ({count})
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[14px] text-[#636366] mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Controls Section */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Sort Dropdown */}
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="h-10 px-3 rounded-lg border border-[#d2d2d7] bg-white text-[14px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* View Toggle */}
        <ViewToggle
          modes={viewModes}
          defaultMode={viewMode}
          onChange={onViewModeChange}
        />

        {/* Additional Actions */}
        {actions}
      </div>
    </div>
  );
}
