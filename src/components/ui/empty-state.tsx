import { LucideIcon } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
  size = 'md'
}: EmptyStateProps) {
  const sizes = {
    sm: {
      container: 'py-8',
      icon: 'w-12 h-12',
      title: 'text-[16px]',
      description: 'text-[13px]',
      maxWidth: 'max-w-[320px]'
    },
    md: {
      container: 'py-16',
      icon: 'w-16 h-16',
      title: 'text-[20px]',
      description: 'text-[14px]',
      maxWidth: 'max-w-[400px]'
    },
    lg: {
      container: 'py-24',
      icon: 'w-20 h-20',
      title: 'text-[24px]',
      description: 'text-[15px]',
      maxWidth: 'max-w-[480px]'
    }
  };

  const s = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${s.container}`}>
      {/* Icon or Illustration */}
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : (
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-[#0071e3]/5 rounded-full blur-2xl scale-150" />
          <div className="relative bg-gradient-to-br from-[#f5f5f7] to-[#e5e5e7] rounded-full p-5 border border-[#d2d2d7]/50">
            <Icon className={`${s.icon} text-[#636366]`} strokeWidth={1.5} />
          </div>
        </div>
      )}

      {/* Title */}
      <h3 className={`${s.title} font-semibold text-[#1d1d1f] mb-2 tracking-tight`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`${s.description} text-[#636366] ${s.maxWidth} mb-6 leading-relaxed`}>
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              className="h-[44px] px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[15px] font-medium shadow-sm"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              className="h-[44px] px-6 rounded-full border-[#d2d2d7] hover:border-[#636366] text-[#1d1d1f] text-[15px] font-normal"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset Empty States
export function NoCoursesEmpty({ onImport, onConnect }: { onImport?: () => void; onConnect?: () => void }) {
  return (
    <EmptyState
      icon={require('lucide-react').BookOpen}
      title="No courses yet"
      description="Import an IMSCC file or connect to Canvas to get started with course accessibility scanning."
      action={onImport ? { label: 'Import IMSCC', onClick: onImport } : undefined}
      secondaryAction={onConnect ? { label: 'Connect Canvas', onClick: onConnect } : undefined}
      size="lg"
    />
  );
}

export function NoScanResultsEmpty({ onScanCourse }: { onScanCourse?: () => void }) {
  return (
    <EmptyState
      icon={require('lucide-react').ScanSearch}
      title="No scan results"
      description="Select a course and run a scan to analyze accessibility and usability issues."
      action={onScanCourse ? { label: 'Scan Course', onClick: onScanCourse } : undefined}
      size="md"
    />
  );
}

export function NoIssuesFoundEmpty() {
  return (
    <EmptyState
      icon={require('lucide-react').CheckCircle2}
      title="No issues found"
      description="Great work! This course meets all accessibility and usability standards."
      size="md"
    />
  );
}

export function NoModulesEmpty() {
  return (
    <EmptyState
      icon={require('lucide-react').BookOpen}
      title="No modules found"
      description="This course doesn't have any modules yet. Add content in Canvas to get started."
      size="sm"
    />
  );
}

export function CourseEmptyState() {
  return (
    <EmptyState
      icon={require('lucide-react').FileQuestion}
      title="Course is empty"
      description="This course doesn't contain any content to scan. Add pages, assignments, or modules to begin."
      size="md"
    />
  );
}
