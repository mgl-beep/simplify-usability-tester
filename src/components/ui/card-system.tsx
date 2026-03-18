import { LucideIcon } from 'lucide-react';

// Elevation System
type Elevation = 0 | 1 | 2 | 3 | 4;

const elevations = {
  0: 'shadow-none',
  1: 'shadow-sm',
  2: 'shadow-md',
  3: 'shadow-lg',
  4: 'shadow-2xl'
};

const elevationHovers = {
  0: 'hover:shadow-sm',
  1: 'hover:shadow-md',
  2: 'hover:shadow-lg',
  3: 'hover:shadow-xl',
  4: 'hover:shadow-2xl'
};

// Base Card Component
interface CardProps {
  children: React.ReactNode;
  elevation?: Elevation;
  hoverElevation?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export function Card({
  children,
  elevation = 0,
  hoverElevation = false,
  padding = 'md',
  border = true,
  rounded = 'lg',
  className = '',
  onClick,
  interactive = false
}: CardProps) {
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const roundeds = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-[12px]',
    xl: 'rounded-[16px]'
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white
        ${border ? 'border border-[#d2d2d7]' : ''}
        ${roundeds[rounded]}
        ${paddings[padding]}
        ${elevations[elevation]}
        ${hoverElevation ? elevationHovers[elevation] : ''}
        ${interactive || onClick ? 'cursor-pointer transition-all duration-200 hover:border-[#636366]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Stat Card
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  onClick?: () => void;
}

export function StatCard({ label, value, icon: Icon, trend, color = 'blue', onClick }: StatCardProps) {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-700'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-700'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      text: 'text-purple-700'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      text: 'text-orange-700'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      text: 'text-red-700'
    }
  };

  const c = colors[color];

  return (
    <Card 
      elevation={0} 
      hoverElevation={!!onClick}
      interactive={!!onClick}
      onClick={onClick}
      className="group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[14px] font-medium text-[#636366]">{label}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-full ${c.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
            <Icon className={`w-5 h-5 ${c.icon}`} strokeWidth={2} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-[32px] font-semibold text-[#1d1d1f] tracking-tight">{value}</span>
        {trend && (
          <span className={`text-[13px] font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
    </Card>
  );
}

// Feature Card
interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  badge?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export function FeatureCard({ icon: Icon, title, description, action, badge, color = 'blue' }: FeatureCardProps) {
  const colors = {
    blue: 'from-[#0071e3] to-[#0077ed]',
    green: 'from-[#00d084] to-[#00ba75]',
    purple: 'from-[#9333ea] to-[#7e22ce]',
    orange: 'from-[#f59e0b] to-[#d97706]'
  };

  return (
    <Card elevation={0} hoverElevation interactive className="group overflow-hidden">
      {/* Gradient Header */}
      <div className={`h-[80px] bg-gradient-to-br ${colors[color]} mb-4 -m-4 mb-4`} />

      {/* Content */}
      <div className="space-y-3">
        {/* Title & Badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[16px] font-semibold text-[#1d1d1f] tracking-tight group-hover:text-[#0071e3] transition-colors">
            {title}
          </h3>
          {badge}
        </div>

        {/* Description */}
        <p className="text-[14px] text-[#636366] leading-relaxed">
          {description}
        </p>

        {/* Action */}
        {action && (
          <button
            onClick={action.onClick}
            className="text-[14px] text-[#0071e3] hover:text-[#0077ed] font-medium transition-colors"
          >
            {action.label} →
          </button>
        )}
      </div>
    </Card>
  );
}

// List Card (for items)
interface ListCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon | string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
}

export function ListCard({ title, subtitle, icon, badge, action, onClick, selected = false }: ListCardProps) {
  const Icon = typeof icon === 'string' ? null : icon;
  const emoji = typeof icon === 'string' ? icon : null;

  return (
    <Card
      elevation={0}
      padding="md"
      interactive={!!onClick}
      onClick={onClick}
      className={`group ${selected ? 'ring-2 ring-[#0071e3] bg-[#0071e3]/5' : ''}`}
    >
      <div className="flex items-center gap-3">
        {/* Icon/Emoji */}
        {Icon && (
          <div className="w-10 h-10 rounded-full bg-[#EEECE8] flex items-center justify-center flex-shrink-0 group-hover:bg-[#e5e5e7] transition-colors">
            <Icon className="w-5 h-5 text-[#0071e3]" strokeWidth={2} />
          </div>
        )}
        {emoji && (
          <div className="w-10 h-10 rounded-full bg-[#EEECE8] flex items-center justify-center flex-shrink-0 text-[20px]">
            {emoji}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-[15px] font-semibold text-[#1d1d1f] truncate">
              {title}
            </h4>
            {badge}
          </div>
          {subtitle && (
            <p className="text-[13px] text-[#636366] truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action */}
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </Card>
  );
}

// Content Card (for rich content)
interface ContentCardProps {
  title: string;
  description?: string;
  image?: string;
  imageGradient?: string;
  metadata?: Array<{ label: string; value: string }>;
  actions?: React.ReactNode;
  onClick?: () => void;
}

export function ContentCard({ 
  title, 
  description, 
  image, 
  imageGradient,
  metadata = [],
  actions,
  onClick 
}: ContentCardProps) {
  return (
    <Card 
      elevation={0} 
      hoverElevation 
      padding="none" 
      interactive={!!onClick}
      onClick={onClick}
      className="overflow-hidden group"
    >
      {/* Image/Gradient Header */}
      {image ? (
        <div className="h-[140px] overflow-hidden bg-[#EEECE8]">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : imageGradient ? (
        <div className={`h-[140px] bg-gradient-to-br ${imageGradient}`} />
      ) : null}

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-1 group-hover:text-[#0071e3] transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-[14px] text-[#636366] leading-relaxed line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Metadata */}
        {metadata.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            {metadata.map((item, i) => (
              <div key={i} className="text-[12px]">
                <span className="text-[#636366]">{item.label}: </span>
                <span className="text-[#1d1d1f] font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="pt-2 border-t border-[#e5e5e7]">
            {actions}
          </div>
        )}
      </div>
    </Card>
  );
}

// Section Card (for grouping content)
interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function SectionCard({ 
  title, 
  subtitle, 
  action, 
  children,
  collapsible = false,
  defaultCollapsed = false
}: SectionCardProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <Card elevation={0}>
      {/* Header */}
      <div 
        className={`flex items-start justify-between mb-4 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <div className="flex-1">
          <h3 className="text-[18px] font-semibold text-[#1d1d1f] tracking-tight mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[14px] text-[#636366]">
              {subtitle}
            </p>
          )}
        </div>
        {action && !collapsible && (
          <div className="flex-shrink-0 ml-4">
            {action}
          </div>
        )}
      </div>

      {/* Content */}
      {(!collapsible || !isCollapsed) && (
        <div className="animate-in slide-in-from-top-2 fade-in-0 duration-200">
          {children}
        </div>
      )}
    </Card>
  );
}
