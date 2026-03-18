import { FileText, ChevronRight, Download, ExternalLink, Eye, BarChart3 } from "lucide-react";
import { motion } from "motion/react";

export function AnalyticsVariations() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <h1 className="text-3xl font-semibold text-[#1d1d1f] mb-8">Analytics Tab - Design Variations</h1>
        
        {/* Variation 1: Subtle emphasis with icon-based reports */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1d1d1f]">Variation 1: Subtle Hierarchy + Icon Reports</h2>
          <div className="space-y-2.5 max-w-[900px]">
            <div className="mb-1">
              <h3 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Standards & Equity Alignment</h3>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-4 flex items-center gap-3">
                <span className="text-[15px] text-[#636366] font-medium">Standards:</span>
                <div className="flex items-center gap-2.5">
                  <div className="px-4 py-2 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]">
                    <span className="text-[15px] font-medium text-[#1d1d1f]">CVC-OEI 21%</span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]">
                    <span className="text-[15px] font-medium text-[#1d1d1f]">Peralta 28%</span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]">
                    <span className="text-[15px] font-medium text-[#1d1d1f]">QM 28%</span>
                  </div>
                </div>
              </div>
              <button className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-4 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow min-w-[140px] flex items-center justify-center gap-2">
                <FileText className="w-[18px] h-[18px] text-[#ff3b30]" strokeWidth={2} />
                <span className="text-[15px] font-semibold text-[#ff3b30]">Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* Variation 2: Lighter text with underlined reports */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1d1d1f]">Variation 2: Lighter Standards + Underlined Reports</h2>
          <div className="space-y-2.5 max-w-[900px]">
            <div className="mb-1">
              <h3 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Standards & Equity Alignment</h3>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-4 flex items-center gap-3">
                <span className="text-[15px] text-[#636366] font-medium">Standards:</span>
                <div className="flex items-center gap-2.5">
                  <div className="px-4 py-2 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]">
                    <span className="text-[15px] font-normal text-[#6e6e73]">CVC-OEI <span className="font-semibold text-[#1d1d1f]">21%</span></span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]">
                    <span className="text-[15px] font-normal text-[#6e6e73]">Peralta <span className="font-semibold text-[#1d1d1f]">28%</span></span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]">
                    <span className="text-[15px] font-normal text-[#6e6e73]">QM <span className="font-semibold text-[#1d1d1f]">28%</span></span>
                  </div>
                </div>
              </div>
              <button className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-4 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all min-w-[140px] flex items-center justify-center gap-2 group">
                <span className="text-[15px] font-semibold text-[#ff3b30] underline decoration-[1.5px] underline-offset-2">Reports</span>
                <ChevronRight className="w-4 h-4 text-[#ff3b30]" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Variation 3: All caps standards with badge-style reports */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1d1d1f]">Variation 3: Uppercase Standards + Badge Reports</h2>
          <div className="space-y-2.5 max-w-[900px]">
            <div className="mb-1">
              <h3 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Standards & Equity Alignment</h3>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-4 flex items-center gap-3">
                <span className="text-[13px] text-[#636366] font-semibold uppercase tracking-wide">Standards:</span>
                <div className="flex items-center gap-2.5">
                  <div className="px-4 py-2 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]">
                    <span className="text-[13px] font-semibold text-[#6e6e73] uppercase tracking-wide">CVC-OEI <span className="text-[15px] text-[#1d1d1f] ml-1">21%</span></span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]">
                    <span className="text-[13px] font-semibold text-[#6e6e73] uppercase tracking-wide">Peralta <span className="text-[15px] text-[#1d1d1f] ml-1">28%</span></span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]">
                    <span className="text-[13px] font-semibold text-[#6e6e73] uppercase tracking-wide">QM <span className="text-[15px] text-[#1d1d1f] ml-1">28%</span></span>
                  </div>
                </div>
              </div>
              <button className="bg-[#ff3b30] hover:bg-[#ff2d20] rounded-[12px] shadow-[0_2px_8px_rgba(255,59,48,0.2)] px-5 py-4 hover:shadow-[0_4px_12px_rgba(255,59,48,0.3)] transition-all min-w-[140px] flex items-center justify-center gap-2">
                <FileText className="w-[18px] h-[18px] text-white" strokeWidth={2} />
                <span className="text-[15px] font-semibold text-white">Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* Variation 4: Score first, subtle labels with dropdown-style reports */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1d1d1f]">Variation 4: Score Emphasis + Dropdown Reports</h2>
          <div className="space-y-2.5 max-w-[900px]">
            <div className="mb-1">
              <h3 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Standards & Equity Alignment</h3>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-4 flex items-center gap-3">
                <span className="text-[15px] text-[#636366] font-medium">Standards:</span>
                <div className="flex items-center gap-2.5">
                  <div className="px-4 py-2 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]">
                    <span className="text-[17px] font-bold text-[#1d1d1f]">21%</span>
                    <span className="text-[13px] font-normal text-[#636366] ml-1.5">CVC-OEI</span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]">
                    <span className="text-[17px] font-bold text-[#1d1d1f]">28%</span>
                    <span className="text-[13px] font-normal text-[#636366] ml-1.5">Peralta</span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]">
                    <span className="text-[17px] font-bold text-[#1d1d1f]">28%</span>
                    <span className="text-[13px] font-normal text-[#636366] ml-1.5">QM</span>
                  </div>
                </div>
              </div>
              <button className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-4 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:border-[#ff3b30]/30 transition-all min-w-[160px] flex items-center justify-center gap-2 group">
                <BarChart3 className="w-[18px] h-[18px] text-[#ff3b30]" strokeWidth={2} />
                <span className="text-[15px] font-semibold text-[#1d1d1f]">View Reports</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#636366] group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Variation 5: Minimal with text-only reports */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1d1d1f]">Variation 5: Minimal + Text Link Reports</h2>
          <div className="space-y-2.5 max-w-[900px]">
            <div className="mb-1">
              <h3 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Standards & Equity Alignment</h3>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-4 flex items-center gap-3">
                <span className="text-[14px] text-[#636366] font-normal">Standards:</span>
                <div className="flex items-center gap-2.5">
                  <div className="px-3.5 py-1.5 rounded-full bg-[#EEECE8]">
                    <span className="text-[14px] font-normal text-[#636366]">CVC-OEI</span>
                    <span className="text-[15px] font-semibold text-[#1d1d1f] ml-2">21%</span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full bg-[#EEECE8]">
                    <span className="text-[14px] font-normal text-[#636366]">Peralta</span>
                    <span className="text-[15px] font-semibold text-[#1d1d1f] ml-2">28%</span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full bg-[#EEECE8]">
                    <span className="text-[14px] font-normal text-[#636366]">QM</span>
                    <span className="text-[15px] font-semibold text-[#1d1d1f] ml-2">28%</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-4 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow min-w-[140px] flex items-center justify-center">
                <button className="text-[15px] font-semibold text-[#007aff] hover:text-[#0051d5] transition-colors">
                  Reports →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Variation 6: Compact with external link reports */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1d1d1f]">Variation 6: Compact + External Link Style</h2>
          <div className="space-y-2.5 max-w-[900px]">
            <div className="mb-1">
              <h3 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Standards & Equity Alignment</h3>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-4 flex items-center gap-3">
                <span className="text-[14px] text-[#636366] font-medium">Standards:</span>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-[#f5f5f7] border border-[#e5e5e7]">
                    <span className="text-[14px] text-[#636366]">CVC-OEI</span>
                    <span className="text-[14px] font-semibold text-[#1d1d1f] ml-1.5">21%</span>
                  </div>
                  <span className="text-[#d2d2d7]">•</span>
                  <div className="px-3 py-1.5 rounded-full bg-[#f5f5f7] border border-[#e5e5e7]">
                    <span className="text-[14px] text-[#636366]">Peralta</span>
                    <span className="text-[14px] font-semibold text-[#1d1d1f] ml-1.5">28%</span>
                  </div>
                  <span className="text-[#d2d2d7]">•</span>
                  <div className="px-3 py-1.5 rounded-full bg-[#f5f5f7] border border-[#e5e5e7]">
                    <span className="text-[14px] text-[#636366]">QM</span>
                    <span className="text-[14px] font-semibold text-[#1d1d1f] ml-1.5">28%</span>
                  </div>
                </div>
              </div>
              <button className="bg-white rounded-[12px] border border-[#d2d2d7] shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-4 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:bg-[#EEECE8] transition-all min-w-[160px] flex items-center justify-center gap-2 group">
                <Eye className="w-[17px] h-[17px] text-[#636366] group-hover:text-[#ff3b30] transition-colors" strokeWidth={2} />
                <span className="text-[15px] font-medium text-[#1d1d1f]">View Reports</span>
                <ExternalLink className="w-[15px] h-[15px] text-[#636366] opacity-60 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
