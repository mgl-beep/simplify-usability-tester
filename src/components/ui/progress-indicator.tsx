import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface ProgressStep {
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep?: number;
  totalItems?: number;
  currentItem?: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressIndicator({
  steps,
  currentStep,
  totalItems,
  currentItem,
  showPercentage = true,
  size = 'md'
}: ProgressIndicatorProps) {
  const percentage = totalItems && currentItem 
    ? Math.round((currentItem / totalItems) * 100)
    : currentStep !== undefined 
    ? Math.round(((currentStep + 1) / steps.length) * 100)
    : 0;

  const sizes = {
    sm: {
      container: 'gap-2',
      text: 'text-[12px]',
      icon: 'w-4 h-4',
      bar: 'h-1'
    },
    md: {
      container: 'gap-3',
      text: 'text-[14px]',
      icon: 'w-5 h-5',
      bar: 'h-1.5'
    },
    lg: {
      container: 'gap-4',
      text: 'text-[15px]',
      icon: 'w-6 h-6',
      bar: 'h-2'
    }
  };

  const s = sizes[size];

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className={`w-full bg-[#e5e5e7] rounded-full overflow-hidden ${s.bar}`}>
          <div
            className="h-full bg-gradient-to-r from-[#0071e3] to-[#0077ed] transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showPercentage && (
          <div className="flex items-center justify-between mt-2">
            <span className={`${s.text} text-[#636366] font-medium`}>
              {currentItem && totalItems ? (
                <>Processing {currentItem} of {totalItems}</>
              ) : (
                <>Step {(currentStep ?? 0) + 1} of {steps.length}</>
              )}
            </span>
            <span className={`${s.text} text-[#0071e3] font-semibold`}>
              {percentage}%
            </span>
          </div>
        )}
      </div>

      {/* Step Indicators */}
      <div className={`flex items-start ${s.container}`}>
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isComplete = currentStep !== undefined && index < currentStep;
          const isError = step.status === 'error';

          return (
            <div key={index} className="flex-1">
              <div className="flex items-center gap-2">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {isComplete ? (
                    <div className="bg-[#00d084] rounded-full p-1">
                      <CheckCircle2 className={`${s.icon} text-white`} strokeWidth={2.5} />
                    </div>
                  ) : isActive ? (
                    <div className="bg-[#0071e3] rounded-full p-1 animate-pulse">
                      <Loader2 className={`${s.icon} text-white animate-spin`} strokeWidth={2.5} />
                    </div>
                  ) : isError ? (
                    <div className="bg-red-500 rounded-full p-1">
                      <Circle className={`${s.icon} text-white`} strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div className="bg-[#e5e5e7] rounded-full p-1">
                      <Circle className={`${s.icon} text-[#636366]`} strokeWidth={2} />
                    </div>
                  )}
                </div>

                {/* Label */}
                <span 
                  className={`${s.text} font-medium tracking-tight ${
                    isComplete ? 'text-[#00d084]' :
                    isActive ? 'text-[#0071e3]' :
                    isError ? 'text-red-500' :
                    'text-[#636366]'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="h-0.5 bg-[#e5e5e7] mt-3 ml-[calc(50%-1rem)]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Circular Progress Component
interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
}

export function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  label,
  showPercentage = true
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e5e7"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0071e3" />
            <stop offset="100%" stopColor="#00d084" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">
            {Math.round(percentage)}%
          </span>
        )}
        {label && (
          <span className="text-[13px] text-[#636366] mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

// Inline Progress Bar
interface InlineProgressProps {
  current: number;
  total: number;
  label?: string;
  compact?: boolean;
}

export function InlineProgress({ current, total, label, compact = false }: InlineProgressProps) {
  const percentage = Math.round((current / total) * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-[#636366]">{label}</span>
        <div className="flex-1 h-1 bg-[#e5e5e7] rounded-full overflow-hidden min-w-[60px]">
          <div
            className="h-full bg-[#0071e3] transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-[#0071e3] font-medium min-w-[3ch]">{percentage}%</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[14px]">
        <span className="text-[#636366]">{label}</span>
        <span className="text-[#0071e3] font-semibold">
          {current} / {total}
        </span>
      </div>
      <div className="h-1.5 bg-[#e5e5e7] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#0071e3] to-[#0077ed] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
