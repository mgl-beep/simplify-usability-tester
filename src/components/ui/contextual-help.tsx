import { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info, BookOpen, ExternalLink, X, ChevronRight } from 'lucide-react';

// Simple Tooltip
interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  maxWidth?: number;
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top', 
  delay = 300,
  maxWidth = 280 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-[#1d1d1f]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-[#1d1d1f]',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-[#1d1d1f]',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-[#1d1d1f]'
  };

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div className={`absolute ${positions[position]} z-50 animate-in fade-in-0 slide-in-from-bottom-1 duration-150`}>
          <div 
            className="bg-[#1d1d1f] text-white text-[13px] rounded-lg px-3 py-2 shadow-xl"
            style={{ maxWidth }}
          >
            {content}
          </div>
          <div className={`absolute w-0 h-0 border-4 ${arrows[position]}`} />
        </div>
      )}
    </div>
  );
}

// Help Icon with Tooltip
interface HelpIconProps {
  content: string | React.ReactNode;
  size?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function HelpIcon({ content, size = 16, position = 'top' }: HelpIconProps) {
  return (
    <Tooltip content={content} position={position}>
      <button 
        className="inline-flex items-center justify-center text-[#636366] hover:text-[#0071e3] transition-colors"
        aria-label="Help"
      >
        <HelpCircle style={{ width: size, height: size }} strokeWidth={2} />
      </button>
    </Tooltip>
  );
}

// Rich Popover Help
interface HelpPopoverProps {
  title: string;
  content: React.ReactNode;
  learnMoreUrl?: string;
  children: React.ReactNode;
  trigger?: 'hover' | 'click';
}

export function HelpPopover({ 
  title, 
  content, 
  learnMoreUrl, 
  children, 
  trigger = 'click' 
}: HelpPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleTrigger = () => {
    if (trigger === 'click') {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsOpen(false);
    }
  };

  return (
    <div 
      className="relative inline-flex"
      ref={popoverRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div onClick={handleTrigger}>
        {children}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[320px] bg-white rounded-[12px] border border-[#d2d2d7] shadow-2xl z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-[#e5e5e7]">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-[#0071e3]/10 flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 text-[#0071e3]" strokeWidth={2} />
              </div>
              <h4 className="text-[15px] font-semibold text-[#1d1d1f]">{title}</h4>
            </div>
            {trigger === 'click' && (
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-[#e5e5e7] flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <X className="w-4 h-4 text-[#636366]" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="text-[14px] text-[#1d1d1f] leading-relaxed">
              {content}
            </div>
          </div>

          {/* Footer */}
          {learnMoreUrl && (
            <div className="p-4 border-t border-[#e5e5e7]">
              <a
                href={learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] text-[#0071e3] hover:text-[#0077ed] font-medium transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
                Learn more
                <ExternalLink className="w-3 h-3" strokeWidth={2} />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Inline Help Text
interface InlineHelpProps {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'tip';
  icon?: boolean;
}

export function InlineHelp({ children, variant = 'info', icon = true }: InlineHelpProps) {
  const config = {
    info: {
      icon: Info,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-600'
    },
    warning: {
      icon: HelpCircle,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      iconColor: 'text-amber-600'
    },
    tip: {
      icon: HelpCircle,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      iconColor: 'text-green-600'
    }
  };

  const c = config[variant];
  const Icon = c.icon;

  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg ${c.bg} border ${c.border}`}>
      {icon && <Icon className={`w-4 h-4 ${c.iconColor} flex-shrink-0 mt-0.5`} strokeWidth={2} />}
      <p className={`text-[13px] ${c.text} leading-relaxed`}>{children}</p>
    </div>
  );
}

// Standards Explainer (for WCAG, CVC-OEI, etc.)
interface StandardExplainerProps {
  standard: string;
  description: string;
  criteria?: string[];
  learnMoreUrl?: string;
}

export function StandardExplainer({ 
  standard, 
  description, 
  criteria = [], 
  learnMoreUrl 
}: StandardExplainerProps) {
  return (
    <HelpPopover
      title={standard}
      content={
        <div className="space-y-3">
          <p className="text-[#636366]">{description}</p>
          {criteria.length > 0 && (
            <div>
              <p className="text-[12px] font-semibold text-[#1d1d1f] mb-2 uppercase tracking-wide">
                Key Criteria:
              </p>
              <ul className="space-y-1">
                {criteria.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[#1d1d1f]">
                    <ChevronRight className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      }
      learnMoreUrl={learnMoreUrl}
    >
      <button className="inline-flex items-center gap-1 text-[13px] text-[#0071e3] hover:text-[#0077ed] font-medium transition-colors">
        {standard}
        <Info className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    </HelpPopover>
  );
}

// First-Time User Tip
interface FirstTimeTipProps {
  id: string;
  title: string;
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onDismiss?: () => void;
}

export function FirstTimeTip({ id, title, message, position = 'bottom', onDismiss }: FirstTimeTipProps) {
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(`tip-dismissed-${id}`) === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem(`tip-dismissed-${id}`, 'true');
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3'
  };

  return (
    <div className={`absolute ${positions[position]} z-50 w-[280px] animate-in fade-in-0 slide-in-from-top-4 duration-300`}>
      <div className="bg-gradient-to-br from-[#0071e3] to-[#0077ed] rounded-[12px] p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <button
            onClick={handleDismiss}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </button>
        </div>
        <h4 className="text-[14px] font-semibold text-white mb-1">{title}</h4>
        <p className="text-[13px] text-white/90 leading-relaxed">{message}</p>
      </div>
      {/* Pointer */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#0071e3]" />
    </div>
  );
}

// Common Help Content Presets
export const helpContent = {
  wcag: {
    standard: 'WCAG 2.2 AA',
    description: 'Web Content Accessibility Guidelines ensure web content is accessible to people with disabilities.',
    criteria: [
      'Perceivable - Information must be presentable to users',
      'Operable - UI components must be operable',
      'Understandable - Information must be understandable',
      'Robust - Content must work with assistive technologies'
    ],
    learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/quickref/'
  },
  cvcOei: {
    standard: 'CVC-OEI Rubric',
    description: 'California Virtual Campus Online Education Initiative course design rubric for online learning excellence.',
    criteria: [
      'Course Overview and Introduction',
      'Content Presentation and Organization',
      'Learner Support and Resources',
      'Assessment and Feedback'
    ],
    learnMoreUrl: 'https://onlinenetworkofeducators.org/course-design-academy/design-basics/cvc-oei-course-design-rubric/'
  },
  qualityMatters: {
    standard: 'Quality Matters',
    description: 'A nationally recognized quality assurance system for online and blended learning.',
    criteria: [
      'Course Overview and Introduction',
      'Learning Objectives and Assessments',
      'Instructional Materials',
      'Learner Interaction and Engagement'
    ],
    learnMoreUrl: 'https://www.qualitymatters.org/'
  }
};
