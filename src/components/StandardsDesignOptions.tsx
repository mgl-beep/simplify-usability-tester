import React from 'react';

export function StandardsDesignOptions() {
  return (
    <div className="p-8 bg-white space-y-8">
      <h1 className="text-2xl font-bold mb-6">Standards Display - 4 Compact Options</h1>
      
      {/* Option 1: Horizontal Side-by-Side */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-600">Option 1: Horizontal Side-by-Side</h2>
        <div className="flex gap-3">
          <div className="flex-1 px-3 py-2.5 bg-[#fff8f0] border border-[#ff9500]/20 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#ff9500] text-white text-[11px] font-bold rounded">D3</span>
              <span className="text-[12px] font-semibold text-[#ff9500]">CVC-OEI</span>
              <span className="text-[12px] text-[#1d1d1f]">Accessibility Standards</span>
            </div>
          </div>
          <div className="flex-1 px-3 py-2.5 bg-[#f0fdf4] border border-[#22c55e]/20 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#22c55e] text-white text-[11px] font-bold rounded">E4</span>
              <span className="text-[12px] font-semibold text-[#22c55e]">PERALTA</span>
              <span className="text-[12px] text-[#1d1d1f]">Universal Design</span>
            </div>
          </div>
        </div>
      </div>

      {/* Option 2: Compact Inline Tags */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-600">Option 2: Compact Inline Tags</h2>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fff8f0] border border-[#ff9500]/20 rounded-full">
            <span className="px-1.5 py-0.5 bg-[#ff9500] text-white text-[10px] font-bold rounded">D3</span>
            <span className="text-[11px] font-semibold text-[#ff9500]">CVC-OEI:</span>
            <span className="text-[11px] text-[#1d1d1f]">Accessibility Standards</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f0fdf4] border border-[#22c55e]/20 rounded-full">
            <span className="px-1.5 py-0.5 bg-[#22c55e] text-white text-[10px] font-bold rounded">E4</span>
            <span className="text-[11px] font-semibold text-[#22c55e]">PERALTA:</span>
            <span className="text-[11px] text-[#1d1d1f]">Universal Design for Learning</span>
          </div>
        </div>
      </div>

      {/* Option 3: Two-Column Grid */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-600">Option 3: Two-Column Condensed Grid</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="px-2.5 py-2 bg-[#fff8f0] border border-[#ff9500]/20 rounded-lg">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-[#ff9500] text-white text-[10px] font-bold rounded">D3</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-[#ff9500] leading-tight">CVC-OEI COURSE DESIGN</span>
                <span className="text-[11px] text-[#1d1d1f] leading-tight">Accessibility Standards</span>
              </div>
            </div>
          </div>
          <div className="px-2.5 py-2 bg-[#f0fdf4] border border-[#22c55e]/20 rounded-lg">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-[#22c55e] text-white text-[10px] font-bold rounded">E4</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-[#22c55e] leading-tight">PERALTA ONLINE EQUITY</span>
                <span className="text-[11px] text-[#1d1d1f] leading-tight">Universal Design for Learning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Option 4: Single Line Compact */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-600">Option 4: Single Line Ultra-Compact</h2>
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#fff8f0] via-white to-[#f0fdf4] border border-gray-200 rounded-lg">
          <div className="inline-flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-[#ff9500] text-white text-[10px] font-bold rounded">D3</span>
            <span className="text-[11px] text-[#1d1d1f]">CVC-OEI: Accessibility Standards</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="inline-flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-[#22c55e] text-white text-[10px] font-bold rounded">E4</span>
            <span className="text-[11px] text-[#1d1d1f]">PERALTA: Universal Design for Learning</span>
          </div>
        </div>
      </div>

      {/* Current Design for Comparison */}
      <div className="space-y-2 pt-4 border-t-2 border-gray-300">
        <h2 className="text-sm font-semibold text-gray-600">Current Design (for comparison)</h2>
        <div className="space-y-3">
          <div className="px-3 py-2.5 bg-[#fff8f0] border border-[#ff9500]/20 rounded-lg">
            <div className="text-[11px] font-semibold text-[#ff9500] mb-1">CVC-OEI COURSE DESIGN</div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#ff9500] text-white text-[11px] font-bold rounded">D3</span>
              <span className="text-[13px] text-[#1d1d1f]">D3: Accessibility Standards</span>
            </div>
          </div>
          <div className="px-3 py-2.5 bg-[#f0fdf4] border border-[#22c55e]/20 rounded-lg">
            <div className="text-[11px] font-semibold text-[#22c55e] mb-1">PERALTA ONLINE EQUITY</div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#22c55e] text-white text-[11px] font-bold rounded">E4</span>
              <span className="text-[13px] text-[#1d1d1f]">E4: Universal Design for Learning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
