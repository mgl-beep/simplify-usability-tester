/**
 * MODAL SIZE COMPARISON - WIREFRAME DIAGRAM
 * Shows how the improved modal matches Canvas content area proportions
 */

export function ModalSizeComparisonWireframe() {
  return (
    <div className="p-8 bg-[#EEECE8] min-h-screen">
      <h1 className="text-[24px] font-semibold text-[#1d1d1f] mb-8">
        Modal Size Comparison: Canvas-Matched Proportions
      </h1>

      <div className="grid grid-cols-2 gap-8 mb-12">
        {/* BEFORE: Old Modal */}
        <div>
          <h2 className="text-[18px] font-semibold text-red-600 mb-4">
            ❌ BEFORE: Too Large (800px)
          </h2>
          <div className="border-4 border-red-400 bg-white rounded-lg p-4 relative" style={{ width: '100%', maxWidth: '800px' }}>
            <div className="text-[12px] text-red-600 font-mono mb-2">max-w-[800px] • 90vh</div>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="font-semibold mb-1">Problem:</div>
              <ul className="text-[13px] space-y-1 ml-4">
                <li>• Wider than Canvas content area</li>
                <li>• Feels disconnected from interface</li>
                <li>• Creates jarring size contrast</li>
                <li>• Obscures too much of Canvas UI</li>
              </ul>
            </div>
            <div className="mt-4 h-64 bg-gray-100 rounded flex items-center justify-center text-[13px] text-gray-500">
              [Content area - too spacious]
            </div>
          </div>
        </div>

        {/* AFTER: New Modal */}
        <div>
          <h2 className="text-[18px] font-semibold text-green-600 mb-4">
            ✅ AFTER: Canvas-Matched (680px)
          </h2>
          <div className="border-4 border-green-400 bg-white rounded-lg p-4 relative" style={{ width: '100%', maxWidth: '680px' }}>
            <div className="text-[12px] text-green-600 font-mono mb-2">max-w-[680px] • 85vh (max 720px)</div>
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="font-semibold mb-1">Benefits:</div>
              <ul className="text-[13px] space-y-1 ml-4">
                <li>✓ Matches Canvas content width</li>
                <li>✓ Feels integrated with interface</li>
                <li>✓ Natural visual harmony</li>
                <li>✓ Better proportional balance</li>
              </ul>
            </div>
            <div className="mt-4 h-64 bg-gray-100 rounded flex items-center justify-center text-[13px] text-gray-500">
              [Content area - properly sized]
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL DIAGRAM: Side-by-side with Canvas */}
      <div className="border-2 border-[#d2d2d7] rounded-xl bg-white p-6">
        <h2 className="text-[18px] font-semibold text-[#1d1d1f] mb-6">
          📐 Size Comparison with Canvas Interface
        </h2>

        <div className="flex gap-6">
          {/* Canvas Sidebar */}
          <div className="w-[60px] bg-[#2d3b45] rounded-lg flex flex-col items-center py-4 gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded"></div>
            <div className="w-8 h-8 bg-white/20 rounded"></div>
            <div className="w-8 h-8 bg-white/20 rounded"></div>
            <div className="text-[10px] text-white/60 mt-2 rotate-90 whitespace-nowrap">Canvas Sidebar</div>
          </div>

          {/* Canvas Content Area */}
          <div className="flex-1 space-y-4">
            <div className="bg-[#EEECE8] border border-[#d2d2d7] rounded-lg p-4">
              <div className="text-[11px] font-mono text-[#636366] mb-2">Canvas Content Area: ~650-700px wide</div>
              <div className="h-48 bg-white rounded border border-[#d2d2d7] flex items-center justify-center">
                <span className="text-[13px] text-[#636366]">Course content renders here</span>
              </div>
            </div>

            {/* Modal Overlay */}
            <div className="bg-[#0071e3]/10 border-2 border-[#0071e3] rounded-lg p-4">
              <div className="text-[11px] font-mono text-[#0071e3] font-semibold mb-2">
                ✅ SIMPLIFY Modal: 680px wide (matches content area)
              </div>
              <div className="h-48 bg-white rounded border-2 border-[#0071e3] flex items-center justify-center">
                <span className="text-[13px] text-[#0071e3] font-semibold">
                  Modal fits naturally within Canvas layout
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED MEASUREMENTS */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#d2d2d7] rounded-lg p-4">
          <div className="text-[11px] font-semibold text-[#636366] uppercase mb-2">Canvas Sidebar</div>
          <div className="text-[24px] font-semibold text-[#1d1d1f]">~60px</div>
          <div className="text-[12px] text-[#636366]">Fixed width</div>
        </div>

        <div className="bg-white border border-[#d2d2d7] rounded-lg p-4">
          <div className="text-[11px] font-semibold text-[#636366] uppercase mb-2">Canvas Content</div>
          <div className="text-[24px] font-semibold text-[#1d1d1f]">650-700px</div>
          <div className="text-[12px] text-[#636366]">Responsive width</div>
        </div>

        <div className="bg-[#0071e3]/10 border-2 border-[#0071e3] rounded-lg p-4">
          <div className="text-[11px] font-semibold text-[#0071e3] uppercase mb-2">SIMPLIFY Modal</div>
          <div className="text-[24px] font-semibold text-[#0071e3]">680px</div>
          <div className="text-[12px] text-[#0071e3] font-semibold">Perfect match ✓</div>
        </div>
      </div>

      {/* HEIGHT ADJUSTMENTS */}
      <div className="mt-8 bg-[#0071e3]/5 border border-[#0071e3] rounded-xl p-6">
        <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-4">Height Optimization</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-[13px] font-semibold text-[#1d1d1f] mb-2">Before:</div>
            <code className="text-[12px] bg-red-50 text-red-600 px-2 py-1 rounded">h-[90vh]</code>
            <p className="text-[12px] text-[#636366] mt-2">
              Too tall on most screens, forces excessive scrolling
            </p>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[#1d1d1f] mb-2">After:</div>
            <code className="text-[12px] bg-green-50 text-green-600 px-2 py-1 rounded">h-[85vh] max-h-[720px]</code>
            <p className="text-[12px] text-[#636366] mt-2">
              Comfortable viewing height, capped for large screens
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ============================================
 * IMPLEMENTATION NOTES
 * ============================================
 * 
 * The key changes made to match Canvas proportions:
 * 
 * 1. WIDTH ADJUSTMENT:
 *    - Old: max-w-[800px] (too wide)
 *    - New: max-w-[680px] (matches Canvas content area)
 *    - Reduction: 120px (~15% smaller)
 * 
 * 2. HEIGHT ADJUSTMENT:
 *    - Old: h-[90vh] (no cap)
 *    - New: h-[85vh] max-h-[720px]
 *    - Benefit: Prevents modal from being overwhelming on large screens
 * 
 * 3. VISUAL HARMONY:
 *    - Modal now feels "native" to Canvas interface
 *    - No jarring size differences
 *    - Better focus on content without distraction
 * 
 * 4. USER EXPERIENCE:
 *    - Less eye travel between modal and Canvas content
 *    - More predictable interaction space
 *    - Reduced cognitive load from size mismatch
 * 
 * ============================================
 * TESTING CHECKLIST:
 * ============================================
 * 
 * Test on these screen sizes:
 * □ 1920×1080 (Full HD) - Modal should be 680px × 720px
 * □ 1440×900 (Laptop) - Modal should be 680px × 765px (85vh)
 * □ 1280×720 (Small laptop) - Modal should be 680px × 612px (85vh)
 * □ <680px width (Tablet/Mobile) - Modal should be full width with padding
 */
