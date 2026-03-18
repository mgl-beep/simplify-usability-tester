import { ScanSearch, Settings2 } from "lucide-react";
import { Button } from "./ui/button";
import { UsabilityScorecard } from "./UsabilityScorecard";
import { UnifiedCalendar } from "./UnifiedCalendar";
import { QuickStats } from "./QuickStats";
import { CanvasSettings } from "./CanvasSettings";
import { useState } from "react";
import { CourseTemplates } from "./CourseTemplates";
import { Analytics } from "./Analytics";
import { CourseBuilders } from "./CourseBuilders";

// Simplify Icon Component
function SimplifyIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      {/* Shield outline */}
      <path d="M12 3 L4 6 L4 11 C4 15.5 7 19 12 21 C17 19 20 15.5 20 11 L20 6 L12 3 Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Checkmark inside */}
      <path d="M9 12 L11 14 L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

interface DashboardContentProps {
  onScanCourse: () => void;
  onOpenStandards: () => void;
  onIssuesClick?: () => void;
  issuesCount?: number;
  selectedCourseName?: string | null;
}

export function DashboardContent({ onScanCourse, onOpenStandards, onIssuesClick, issuesCount, selectedCourseName }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "templates" | "builders">("overview");
  return (
    <>
      <div className="min-h-full bg-gradient-to-br from-[#EEECE8] via-[#EEECE8] to-[#E4E2DE]">
        {/* Header - Apple-inspired clean design */}
        <header className="bg-white border-b border-[#d2d2d7]">
          <div className="px-8 h-[88px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SimplifyIcon className="w-[48px] h-[48px] text-[#1d1d1f]" />
              <div>
                <h1 className="text-[32px] tracking-[-0.01em] text-[#1d1d1f] font-[600] leading-none">SIMPLIFY</h1>
                <p className="text-[15px] text-[#636366] mt-0.5">
                  {selectedCourseName ? `Scanning: ${selectedCourseName}` : 'Course design and accessibility tools'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={onOpenStandards}
                variant="outline"
                className="h-[44px] px-6 rounded-full border border-[#d2d2d7] bg-transparent hover:bg-[#f5f5f7] text-[#1d1d1f] text-[15px] font-normal transition-all hover:border-[#b3b3b3]"
              >
                <Settings2 className="w-[18px] h-[18px] mr-2.5" strokeWidth={1.5} />
                Standards
              </Button>
              <Button
                onClick={onScanCourse}
                className="bg-[#007AFF] hover:bg-[#3395FF] text-white h-[44px] px-7 rounded-full shadow-lg hover:shadow-xl transition-all text-[15px] font-semibold"
              >
                <ScanSearch className="w-[18px] h-[18px] mr-2.5" strokeWidth={2} />
                {selectedCourseName ? 'Scan Another Course' : 'Select Course to Scan'}
              </Button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-[#d2d2d7] px-8">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-3 text-[16px] font-semibold transition-colors ${
                activeTab === "overview"
                  ? "text-[#0071e3] border-b-2 border-[#0071e3] -mb-px"
                  : "text-[#636366] hover:text-[#1d1d1f]"
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-3 text-[16px] font-semibold transition-colors ${
                activeTab === "analytics"
                  ? "text-[#0071e3] border-b-2 border-[#0071e3] -mb-px"
                  : "text-[#636366] hover:text-[#1d1d1f]"
              }`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-3 text-[16px] font-semibold transition-colors ${
                activeTab === "templates"
                  ? "text-[#0071e3] border-b-2 border-[#0071e3] -mb-px"
                  : "text-[#636366] hover:text-[#1d1d1f]"
              }`}
            >
              Templates
            </button>
            <button 
              onClick={() => setActiveTab("builders")}
              className={`px-4 py-3 text-[16px] font-semibold transition-colors ${
                activeTab === "builders"
                  ? "text-[#0071e3] border-b-2 border-[#0071e3] -mb-px"
                  : "text-[#636366] hover:text-[#1d1d1f]"
              }`}
            >
              Builders
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === "overview" && (
            <>
              {/* Quick Stats - Full Width */}
              <QuickStats onIssuesClick={onIssuesClick} issuesCount={issuesCount} />

              {/* Main Grid - 2 Columns Side by Side */}
              <div className="grid grid-cols-2 gap-6 mt-6">
                {/* Usability Scorecard */}
                <div>
                  <UsabilityScorecard />
                </div>

                {/* AI Assignment Generator */}
                <div>
                  <UnifiedCalendar />
                </div>
              </div>

              {/* Canvas Connection - Bottom of Page */}
              <div className="mt-6 space-y-6">
                <CanvasSettings />
              </div>
            </>
          )}

          {activeTab === "analytics" && (
            <Analytics />
          )}

          {activeTab === "templates" && (
            <CourseTemplates />
          )}

          {activeTab === "builders" && (
            <CourseBuilders />
          )}
        </div>
      </div>

    </>
  );
}