import { Star, Flag, AlertCircle, AlertTriangle, Info, CheckCircle2, Clock, Zap } from 'lucide-react';

// Priority System
export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'none';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export function PriorityBadge({ 
  priority, 
  size = 'md', 
  showLabel = true, 
  interactive = false,
  onClick 
}: PriorityBadgeProps) {
  const config = {
    critical: {
      icon: Zap,
      label: 'Critical',
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      ring: 'ring-red-500/20'
    },
    high: {
      icon: AlertCircle,
      label: 'High',
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-300',
      ring: 'ring-orange-500/20'
    },
    medium: {
      icon: AlertTriangle,
      label: 'Medium',
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-300',
      ring: 'ring-amber-500/20'
    },
    low: {
      icon: Info,
      label: 'Low',
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-300',
      ring: 'ring-blue-500/20'
    },
    none: {
      icon: Info,
      label: 'None',
      bg: 'bg-[#e5e5e7]',
      text: 'text-[#636366]',
      border: 'border-[#d2d2d7]',
      ring: 'ring-[#636366]/20'
    }
  };

  const sizes = {
    sm: { container: 'h-6 px-2 gap-1', icon: 'w-3 h-3', text: 'text-[11px]' },
    md: { container: 'h-7 px-2.5 gap-1.5', icon: 'w-3.5 h-3.5', text: 'text-[12px]' },
    lg: { container: 'h-8 px-3 gap-2', icon: 'w-4 h-4', text: 'text-[13px]' }
  };

  const c = config[priority];
  const s = sizes[size];
  const Icon = c.icon;

  const Component = interactive ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`inline-flex items-center ${s.container} rounded-full ${c.bg} ${c.border} border ${c.text} font-semibold transition-all ${
        interactive ? `cursor-pointer hover:shadow-sm hover:ring-2 ${c.ring}` : ''
      }`}
    >
      <Icon className={s.icon} strokeWidth={2.5} />
      {showLabel && <span className={s.text}>{c.label}</span>}
    </Component>
  );
}

// Star/Flag for Priority Marking
interface PriorityMarkerProps {
  isMarked: boolean;
  onToggle: () => void;
  type?: 'star' | 'flag';
  size?: number;
}

export function PriorityMarker({ isMarked, onToggle, type = 'star', size = 20 }: PriorityMarkerProps) {
  const Icon = type === 'star' ? Star : Flag;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`transition-all hover:scale-110 ${
        isMarked
          ? type === 'star'
            ? 'text-amber-500 fill-amber-500'
            : 'text-red-500 fill-red-500'
          : 'text-[#d2d2d7] hover:text-[#636366]'
      }`}
      aria-label={isMarked ? `Remove ${type}` : `Add ${type}`}
    >
      <Icon 
        className={`w-${size/4} h-${size/4}`}
        strokeWidth={1.5}
        style={{ width: size, height: size }}
      />
    </button>
  );
}

// Status Badge System
export type Status = 'pending' | 'staged' | 'published' | 'ignored' | 'failed' | 'in-progress';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showDot?: boolean;
  animated?: boolean;
}

export function StatusBadge({ 
  status, 
  size = 'md', 
  showIcon = true, 
  showDot = false,
  animated = false 
}: StatusBadgeProps) {
  const config = {
    pending: {
      icon: Clock,
      label: 'Pending',
      bg: 'bg-[#EEECE8]',
      text: 'text-[#636366]',
      border: 'border-[#d2d2d7]',
      dot: 'bg-[#636366]'
    },
    staged: {
      icon: Clock,
      label: 'Staged',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-500'
    },
    published: {
      icon: CheckCircle2,
      label: 'Published',
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      dot: 'bg-green-500'
    },
    ignored: {
      icon: Info,
      label: 'Ignored',
      bg: 'bg-[#EEECE8]',
      text: 'text-[#636366]',
      border: 'border-[#d2d2d7]',
      dot: 'bg-[#636366]'
    },
    failed: {
      icon: AlertCircle,
      label: 'Failed',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      dot: 'bg-red-500'
    },
    'in-progress': {
      icon: Clock,
      label: 'In Progress',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500'
    }
  };

  const sizes = {
    sm: { container: 'h-6 px-2 gap-1.5', icon: 'w-3 h-3', text: 'text-[11px]', dot: 'w-1.5 h-1.5' },
    md: { container: 'h-7 px-2.5 gap-2', icon: 'w-3.5 h-3.5', text: 'text-[12px]', dot: 'w-2 h-2' },
    lg: { container: 'h-8 px-3 gap-2', icon: 'w-4 h-4', text: 'text-[13px]', dot: 'w-2 h-2' }
  };

  const c = config[status];
  const s = sizes[size];
  const Icon = c.icon;

  return (
    <div className={`inline-flex items-center ${s.container} rounded-full ${c.bg} ${c.border} border ${c.text} font-medium`}>
      {showDot && (
        <div className={`${s.dot} ${c.dot} rounded-full ${animated && status === 'in-progress' ? 'animate-pulse' : ''}`} />
      )}
      {showIcon && !showDot && <Icon className={s.icon} strokeWidth={2} />}
      <span className={s.text}>{c.label}</span>
    </div>
  );
}

// Category Badge (for issue types)
export type IssueCategory = 'accessibility' | 'usability' | 'design' | 'content' | 'technical';

interface CategoryBadgeProps {
  category: IssueCategory;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle';
}

export function CategoryBadge({ category, size = 'md', variant = 'default' }: CategoryBadgeProps) {
  const config = {
    accessibility: {
      label: 'Accessibility',
      color: variant === 'subtle' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-[#0071e3] text-white',
      icon: '♿'
    },
    usability: {
      label: 'Usability',
      color: variant === 'subtle' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-[#00d084] text-white',
      icon: '👤'
    },
    design: {
      label: 'Design',
      color: variant === 'subtle' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-[#9333ea] text-white',
      icon: '🎨'
    },
    content: {
      label: 'Content',
      color: variant === 'subtle' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-[#f59e0b] text-white',
      icon: '📝'
    },
    technical: {
      label: 'Technical',
      color: variant === 'subtle' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-[#6b7280] text-white',
      icon: '⚙️'
    }
  };

  const sizes = {
    sm: { container: 'h-6 px-2 gap-1', text: 'text-[11px]' },
    md: { container: 'h-7 px-2.5 gap-1.5', text: 'text-[12px]' },
    lg: { container: 'h-8 px-3 gap-2', text: 'text-[13px]' }
  };

  const c = config[category];
  const s = sizes[size];

  return (
    <div className={`inline-flex items-center ${s.container} rounded-full ${c.color} ${variant === 'subtle' ? 'border' : ''} font-medium`}>
      <span>{c.icon}</span>
      <span className={s.text}>{c.label}</span>
    </div>
  );
}

// Severity Badge
export type Severity = 'critical' | 'high' | 'medium' | 'low';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md' | 'lg';
}

export function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
  const config = {
    critical: {
      label: 'Critical',
      bg: 'bg-red-500',
      text: 'text-white',
      dots: 4
    },
    high: {
      label: 'High',
      bg: 'bg-orange-500',
      text: 'text-white',
      dots: 3
    },
    medium: {
      label: 'Medium',
      bg: 'bg-amber-500',
      text: 'text-white',
      dots: 2
    },
    low: {
      label: 'Low',
      bg: 'bg-blue-500',
      text: 'text-white',
      dots: 1
    }
  };

  const sizes = {
    sm: { container: 'h-6 px-2 gap-1.5', text: 'text-[11px]', dot: 'w-1 h-1' },
    md: { container: 'h-7 px-2.5 gap-2', text: 'text-[12px]', dot: 'w-1 h-1' },
    lg: { container: 'h-8 px-3 gap-2', text: 'text-[13px]', dot: 'w-1.5 h-1.5' }
  };

  const c = config[severity];
  const s = sizes[size];

  return (
    <div className={`inline-flex items-center ${s.container} rounded-full ${c.bg} ${c.text} font-semibold`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: c.dots }).map((_, i) => (
          <div key={i} className={`${s.dot} bg-white rounded-full opacity-90`} />
        ))}
      </div>
      <span className={s.text}>{c.label}</span>
    </div>
  );
}

// Combined Badge Group
interface BadgeGroupProps {
  badges: React.ReactNode[];
  gap?: number;
}

export function BadgeGroup({ badges, gap = 2 }: BadgeGroupProps) {
  return (
    <div className={`flex items-center flex-wrap gap-${gap}`}>
      {badges.map((badge, i) => (
        <div key={i}>{badge}</div>
      ))}
    </div>
  );
}
