/**
 * Modern skeleton loader components
 * Clean, minimal, Apple-inspired design
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gradient-to-r from-[#f5f5f7] via-[#e8e8eb] to-[#f5f5f7] bg-[length:200%_100%] rounded-md ${className}`}
      style={{
        animation: 'shimmer 2s ease-in-out infinite'
      }}
    />
  );
}

// Course Card Skeleton
export function CourseCardSkeleton() {
  return (
    <div className="bg-white border border-[#d2d2d7] rounded-[8px] overflow-hidden max-w-[280px]">
      {/* Header image skeleton */}
      <Skeleton className="h-[140px] w-full rounded-none" />
      
      {/* Content skeleton */}
      <div className="p-3 pt-[23px]">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

// Module Card Skeleton
export function ModuleCardSkeleton() {
  return (
    <div className="border border-[#C7CDD1] rounded-md overflow-hidden bg-white">
      <div className="p-4 bg-[#F5F5F5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// Issue Row Skeleton
export function IssueRowSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 border-b border-[#e5e5e5] last:border-0">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="w-24 h-9 rounded-md flex-shrink-0" />
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-[16px] border border-[#d2d2d7] p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
      <Skeleton className="h-10 w-20 mb-2" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-[#e5e5e5] bg-[#EEECE8]">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-48 flex-1" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-[#e5e5e5] last:border-0">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

// Scan Results Skeleton
export function ScanResultsSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <IssueRowSkeleton key={i} />
      ))}
    </div>
  );
}

// Dashboard Stats Grid Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
    </div>
  );
}

// Add shimmer animation to global CSS
const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

// Export for adding to globals.css
export const skeletonStyles = shimmerKeyframes;
