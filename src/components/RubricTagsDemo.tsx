/**
 * Demo component showing different rubric tag design options
 * This is for design comparison - not part of the main app
 */

import React from 'react';

interface TagDemoProps {
  cvcOeiTags: string[];
  peraltaTags: string[];
  qmTags: string[];
}

export function RubricTagsDemo({ cvcOeiTags, peraltaTags, qmTags }: TagDemoProps) {
  return (
    <div className="p-8 space-y-8 bg-gray-50">
      <div className="text-2xl font-bold text-gray-900">Rubric Tag Design Options</div>
      
      {/* OPTION 1: Current Design - Grouped with Labels */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-700">Option 1: Grouped with Labels (Current)</div>
        <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-[#fff8f0] via-white to-[#f0fdf4] border border-gray-200 rounded-lg">
          {cvcOeiTags.length > 0 && (
            <div className="inline-flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#1d1d1f]">CVC-OEI:</span>
              {cvcOeiTags.map((tag, index) => (
                <span key={tag} className="inline-flex items-center gap-1">
                  {index > 0 && <span className="text-[#636366]">,</span>}
                  <span className="px-1.5 py-0.5 bg-[#ff9500] text-white text-[10px] font-bold rounded">
                    {tag}
                  </span>
                </span>
              ))}
            </div>
          )}
          
          {cvcOeiTags.length > 0 && peraltaTags.length > 0 && (
            <div className="w-px h-4 bg-gray-300"></div>
          )}
          
          {peraltaTags.length > 0 && (
            <div className="inline-flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#22c55e]">PERALTA:</span>
              {peraltaTags.map((tag, index) => (
                <span key={tag} className="inline-flex items-center gap-1">
                  {index > 0 && <span className="text-[#636366]">,</span>}
                  <span className="px-1.5 py-0.5 bg-[#22c55e] text-white text-[10px] font-bold rounded">
                    {tag}
                  </span>
                </span>
              ))}
            </div>
          )}

          {(cvcOeiTags.length > 0 || peraltaTags.length > 0) && qmTags.length > 0 && (
            <div className="w-px h-4 bg-gray-300"></div>
          )}

          {qmTags.length > 0 && (
            <div className="inline-flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#0071e3]">QM:</span>
              {qmTags.map((tag, index) => (
                <span key={tag} className="inline-flex items-center gap-1">
                  {index > 0 && <span className="text-[#636366]">,</span>}
                  <span className="px-1.5 py-0.5 bg-[#0071e3] text-white text-[10px] font-bold rounded">
                    {tag}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OPTION 2: Pill Style - All in One Flow */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-700">Option 2: Pill/Chip Style</div>
        <div className="flex items-center flex-wrap gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
          {cvcOeiTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-[#ff9500] text-white text-[11px] font-semibold rounded-full">
              <span className="opacity-80">CVC-OEI</span>
              <span>{tag}</span>
            </span>
          ))}
          {peraltaTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-[#22c55e] text-white text-[11px] font-semibold rounded-full">
              <span className="opacity-80">PERALTA</span>
              <span>{tag}</span>
            </span>
          ))}
          {qmTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-[#0071e3] text-white text-[11px] font-semibold rounded-full">
              <span className="opacity-80">QM</span>
              <span>{tag}</span>
            </span>
          ))}
        </div>
      </div>

      {/* OPTION 3: Compact Badges Only */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-700">Option 3: Compact Badges Only</div>
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg">
          {cvcOeiTags.map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 bg-[#ff9500] text-white text-[10px] font-bold rounded">
              {tag}
            </span>
          ))}
          {cvcOeiTags.length > 0 && (peraltaTags.length > 0 || qmTags.length > 0) && (
            <span className="text-gray-300">•</span>
          )}
          {peraltaTags.map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 bg-[#22c55e] text-white text-[10px] font-bold rounded">
              {tag}
            </span>
          ))}
          {peraltaTags.length > 0 && qmTags.length > 0 && (
            <span className="text-gray-300">•</span>
          )}
          {qmTags.map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 bg-[#0071e3] text-white text-[10px] font-bold rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* OPTION 4: Inline with Colored Text */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-700">Option 4: Inline with Colored Text</div>
        <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px]">
          {cvcOeiTags.length > 0 && (
            <span className="inline-flex items-center gap-1 mr-3">
              <span className="font-semibold text-[#ff9500]">CVC-OEI</span>
              <span className="text-gray-600">{cvcOeiTags.join(', ')}</span>
            </span>
          )}
          {peraltaTags.length > 0 && (
            <span className="inline-flex items-center gap-1 mr-3">
              <span className="font-semibold text-[#22c55e]">PERALTA</span>
              <span className="text-gray-600">{peraltaTags.join(', ')}</span>
            </span>
          )}
          {qmTags.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="font-semibold text-[#0071e3]">QM</span>
              <span className="text-gray-600">{qmTags.join(', ')}</span>
            </span>
          )}
        </div>
      </div>

      {/* OPTION 5: Outlined Badges */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-700">Option 5: Outlined Badges</div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
          {cvcOeiTags.length > 0 && (
            <div className="inline-flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#ff9500]">CVC-OEI</span>
              {cvcOeiTags.map((tag) => (
                <span key={tag} className="px-1.5 py-0.5 border-2 border-[#ff9500] text-[#ff9500] text-[10px] font-bold rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {cvcOeiTags.length > 0 && peraltaTags.length > 0 && (
            <span className="text-gray-300">|</span>
          )}
          
          {peraltaTags.length > 0 && (
            <div className="inline-flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#22c55e]">PERALTA</span>
              {peraltaTags.map((tag) => (
                <span key={tag} className="px-1.5 py-0.5 border-2 border-[#22c55e] text-[#22c55e] text-[10px] font-bold rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {(cvcOeiTags.length > 0 || peraltaTags.length > 0) && qmTags.length > 0 && (
            <span className="text-gray-300">|</span>
          )}

          {qmTags.length > 0 && (
            <div className="inline-flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#0071e3]">QM</span>
              {qmTags.map((tag) => (
                <span key={tag} className="px-1.5 py-0.5 border-2 border-[#0071e3] text-[#0071e3] text-[10px] font-bold rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OPTION 6: Subtle Background */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-700">Option 6: Subtle Background</div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
          {cvcOeiTags.length > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded">
              <span className="text-[11px] font-semibold text-[#ff9500]">CVC-OEI</span>
              {cvcOeiTags.map((tag, index) => (
                <span key={tag} className="inline-flex items-center">
                  {index > 0 && <span className="text-orange-300 mx-0.5">,</span>}
                  <span className="text-[11px] font-bold text-[#ff9500]">{tag}</span>
                </span>
              ))}
            </div>
          )}
          
          {peraltaTags.length > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded">
              <span className="text-[11px] font-semibold text-[#22c55e]">PERALTA</span>
              {peraltaTags.map((tag, index) => (
                <span key={tag} className="inline-flex items-center">
                  {index > 0 && <span className="text-green-300 mx-0.5">,</span>}
                  <span className="text-[11px] font-bold text-[#22c55e]">{tag}</span>
                </span>
              ))}
            </div>
          )}

          {qmTags.length > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded">
              <span className="text-[11px] font-semibold text-[#0071e3]">QM</span>
              {qmTags.map((tag, index) => (
                <span key={tag} className="inline-flex items-center">
                  {index > 0 && <span className="text-blue-300 mx-0.5">,</span>}
                  <span className="text-[11px] font-bold text-[#0071e3]">{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OPTION 7: Dot Separators */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-700">Option 7: Dot Separators (Minimalist)</div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px]">
          <span className="font-semibold text-[#1d1d1f]">Standards:</span>
          {cvcOeiTags.map((tag, index) => (
            <span key={tag} className="inline-flex items-center gap-1.5">
              {index === 0 && cvcOeiTags.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#ff9500]"></span>}
              <span className="text-[#1d1d1f]">{tag}</span>
            </span>
          ))}
          {peraltaTags.map((tag, index) => (
            <span key={tag} className="inline-flex items-center gap-1.5">
              {index === 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>}
              <span className="text-[#1d1d1f]">{tag}</span>
            </span>
          ))}
          {qmTags.map((tag, index) => (
            <span key={tag} className="inline-flex items-center gap-1.5">
              {index === 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"></span>}
              <span className="text-[#1d1d1f]">{tag}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Example usage
export function RubricTagsDemoExample() {
  return (
    <RubricTagsDemo
      cvcOeiTags={['A4', 'A5', 'A8']}
      peraltaTags={['E5']}
      qmTags={['8.1', '8.3']}
    />
  );
}
