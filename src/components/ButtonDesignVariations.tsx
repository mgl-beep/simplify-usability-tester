import { HelpCircle, Settings2, ScanSearch } from "lucide-react";

export function ButtonDesignVariations() {
  return (
    <div className="min-h-screen bg-[#EEECE8] p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-[32px] tracking-tight text-[#1d1d1f] mb-2">Button Design Variations</h1>
          <p className="text-[16px] text-[#636366]">10 Apple-inspired button styles with different interactions</p>
        </div>

        <div className="space-y-8">
          {/* Variation 1: Classic Translucent Glass */}
          <div className="bg-gradient-to-r from-[#2d2d2f] to-[#1d1d1f] rounded-[20px] p-8">
            <div className="mb-4">
              <h3 className="text-[18px] font-semibold text-white mb-1">1. Classic Translucent Glass</h3>
              <p className="text-[14px] text-[#636366]">Frosted glass with backdrop blur - hover brightens background</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-[44px] px-6 rounded-full border border-white/20 bg-white/5 hover:bg-white/25 text-white text-[15px] font-normal transition-all backdrop-blur-md hover:border-white/40 flex items-center gap-2.5">
                <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Feature Guide
              </button>
              <button className="h-[44px] px-6 rounded-full border border-white/20 bg-white/5 hover:bg-white/25 text-white text-[15px] font-normal transition-all backdrop-blur-md hover:border-white/40 flex items-center gap-2.5">
                <Settings2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Standards
              </button>
              <button className="bg-[#007AFF] hover:bg-[#3395FF] text-white h-[44px] px-7 rounded-full shadow-lg hover:shadow-xl transition-all text-[15px] font-semibold flex items-center gap-2.5">
                <ScanSearch className="w-[18px] h-[18px]" strokeWidth={2} />
                Select Course to Scan
              </button>
            </div>
          </div>

          {/* Variation 2: Solid with Glow */}
          <div className="bg-gradient-to-r from-[#2d2d2f] to-[#1d1d1f] rounded-[20px] p-8">
            <div className="mb-4">
              <h3 className="text-[18px] font-semibold text-white mb-1">2. Solid with Glow Effect</h3>
              <p className="text-[14px] text-[#636366]">Solid background with subtle glow on hover</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-[44px] px-6 rounded-full bg-white/10 hover:bg-white/20 text-white text-[15px] font-normal transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2.5">
                <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Feature Guide
              </button>
              <button className="h-[44px] px-6 rounded-full bg-white/10 hover:bg-white/20 text-white text-[15px] font-normal transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2.5">
                <Settings2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Standards
              </button>
              <button className="bg-[#007AFF] hover:bg-[#3395FF] text-white h-[44px] px-7 rounded-full shadow-lg transition-all text-[15px] font-semibold hover:shadow-[0_0_30px_rgba(0,122,255,0.5)] flex items-center gap-2.5">
                <ScanSearch className="w-[18px] h-[18px]" strokeWidth={2} />
                Select Course to Scan
              </button>
            </div>
          </div>

          {/* Variation 3: Outline Fade In */}
          <div className="bg-gradient-to-r from-[#2d2d2f] to-[#1d1d1f] rounded-[20px] p-8">
            <div className="mb-4">
              <h3 className="text-[18px] font-semibold text-white mb-1">3. Outline Fade In</h3>
              <p className="text-[14px] text-[#636366]">Thin outline that fills with background on hover</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-[44px] px-6 rounded-full border border-white/30 bg-transparent hover:bg-white/15 text-white text-[15px] font-normal transition-all backdrop-blur-sm flex items-center gap-2.5">
                <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Feature Guide
              </button>
              <button className="h-[44px] px-6 rounded-full border border-white/30 bg-transparent hover:bg-white/15 text-white text-[15px] font-normal transition-all backdrop-blur-sm flex items-center gap-2.5">
                <Settings2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Standards
              </button>
              <button className="bg-[#007AFF] hover:bg-[#3395FF] text-white h-[44px] px-7 rounded-full shadow-lg hover:shadow-xl transition-all text-[15px] font-semibold flex items-center gap-2.5">
                <ScanSearch className="w-[18px] h-[18px]" strokeWidth={2} />
                Select Course to Scan
              </button>
            </div>
          </div>

          {/* Variation 4: Gradient Border */}
          <div className="bg-gradient-to-r from-[#2d2d2f] to-[#1d1d1f] rounded-[20px] p-8">
            <div className="mb-4">
              <h3 className="text-[18px] font-semibold text-white mb-1">4. Gradient Border Glow</h3>
              <p className="text-[14px] text-[#636366]">Border opacity increases on hover with gradient hint</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-[44px] px-6 rounded-full border-2 border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 text-white text-[15px] font-normal transition-all flex items-center gap-2.5">
                <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Feature Guide
              </button>
              <button className="h-[44px] px-6 rounded-full border-2 border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 text-white text-[15px] font-normal transition-all flex items-center gap-2.5">
                <Settings2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Standards
              </button>
              <button className="bg-gradient-to-r from-[#007AFF] to-[#0A84FF] hover:from-[#3395FF] hover:to-[#3D9FFF] text-white h-[44px] px-7 rounded-full shadow-lg hover:shadow-xl transition-all text-[15px] font-semibold flex items-center gap-2.5">
                <ScanSearch className="w-[18px] h-[18px]" strokeWidth={2} />
                Select Course to Scan
              </button>
            </div>
          </div>

          {/* Variation 5: Flat Minimal */}
          <div className="bg-gradient-to-r from-[#2d2d2f] to-[#1d1d1f] rounded-[20px] p-8">
            <div className="mb-4">
              <h3 className="text-[18px] font-semibold text-white mb-1">5. Flat Minimal</h3>
              <p className="text-[14px] text-[#636366]">No border, simple background change on hover</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-[44px] px-6 rounded-full bg-white/8 hover:bg-white/18 text-white text-[15px] font-normal transition-all flex items-center gap-2.5">
                <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Feature Guide
              </button>
              <button className="h-[44px] px-6 rounded-full bg-white/8 hover:bg-white/18 text-white text-[15px] font-normal transition-all flex items-center gap-2.5">
                <Settings2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Standards
              </button>
              <button className="bg-[#007AFF] hover:bg-[#3395FF] text-white h-[44px] px-7 rounded-full transition-all text-[15px] font-semibold flex items-center gap-2.5">
                <ScanSearch className="w-[18px] h-[18px]" strokeWidth={2} />
                Select Course to Scan
              </button>
            </div>
          </div>

          {/* Variation 6: Bold Shadow Lift */}
          <div className="bg-gradient-to-r from-[#2d2d2f] to-[#1d1d1f] rounded-[20px] p-8">
            <div className="mb-4">
              <h3 className="text-[18px] font-semibold text-white mb-1">6. Bold Shadow Lift</h3>
              <p className="text-[14px] text-[#636366]">Shadow increases dramatically on hover</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-[44px] px-6 rounded-full border border-white/25 bg-white/8 hover:bg-white/16 text-white text-[15px] font-normal transition-all shadow-sm hover:shadow-[0_8px_24px_rgba(255,255,255,0.15)] flex items-center gap-2.5">
                <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Feature Guide
              </button>
              <button className="h-[44px] px-6 rounded-full border border-white/25 bg-white/8 hover:bg-white/16 text-white text-[15px] font-normal transition-all shadow-sm hover:shadow-[0_8px_24px_rgba(255,255,255,0.15)] flex items-center gap-2.5">
                <Settings2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Standards
              </button>
              <button className="bg-[#007AFF] hover:bg-[#3395FF] text-white h-[44px] px-7 rounded-full shadow-md hover:shadow-[0_12px_40px_rgba(0,122,255,0.4)] transition-all text-[15px] font-semibold flex items-center gap-2.5">
                <ScanSearch className="w-[18px] h-[18px]" strokeWidth={2} />
                Select Course to Scan
              </button>
            </div>
          </div>

          {/* Variation 7: Icon Shift */}
          <div className="bg-gradient-to-r from-[#2d2d2f] to-[#1d1d1f] rounded-[20px] p-8">
            <div className="mb-4">
              <h3 className="text-[18px] font-semibold text-white mb-1">7. Icon Shift Animation</h3>
              <p className="text-[14px] text-[#636366]">Icon shifts slightly on hover</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-[44px] px-6 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 text-white text-[15px] font-normal transition-all group flex items-center gap-2.5">
                <HelpCircle className="w-[18px] h-[18px] transition-transform group-hover:rotate-12" strokeWidth={1.5} />
                Feature Guide
              </button>
              <button className="h-[44px] px-6 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 text-white text-[15px] font-normal transition-all group flex items-center gap-2.5">
                <Settings2 className="w-[18px] h-[18px] transition-transform group-hover:rotate-90" strokeWidth={1.5} />
                Standards
              </button>
              <button className="bg-[#007AFF] hover:bg-[#3395FF] text-white h-[44px] px-7 rounded-full shadow-lg hover:shadow-xl transition-all text-[15px] font-semibold group flex items-center gap-2.5">
                <ScanSearch className="w-[18px] h-[18px] transition-transform group-hover:scale-110" strokeWidth={2} />
                Select Course to Scan
              </button>
            </div>
          </div>

          {/* Variation 8: Double Border */}
          <div className="bg-gradient-to-r from-[#2d2d2f] to-[#1d1d1f] rounded-[20px] p-8">
            <div className="mb-4">
              <h3 className="text-[18px] font-semibold text-white mb-1">8. Double Border Effect</h3>
              <p className="text-[14px] text-[#636366]">Inner shadow creates double border appearance</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-[44px] px-6 rounded-full border border-white/30 bg-white/5 hover:bg-white/15 text-white text-[15px] font-normal transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)] flex items-center gap-2.5">
                <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Feature Guide
              </button>
              <button className="h-[44px] px-6 rounded-full border border-white/30 bg-white/5 hover:bg-white/15 text-white text-[15px] font-normal transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)] flex items-center gap-2.5">
                <Settings2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Standards
              </button>
              <button className="bg-[#007AFF] hover:bg-[#3395FF] text-white h-[44px] px-7 rounded-full shadow-lg hover:shadow-xl transition-all text-[15px] font-semibold flex items-center gap-2.5">
                <ScanSearch className="w-[18px] h-[18px]" strokeWidth={2} />
                Select Course to Scan
              </button>
            </div>
          </div>

          {/* Variation 9: Segmented Control Style */}
          <div className="bg-gradient-to-r from-[#2d2d2f] to-[#1d1d1f] rounded-[20px] p-8">
            <div className="mb-4">
              <h3 className="text-[18px] font-semibold text-white mb-1">9. Segmented Control Style</h3>
              <p className="text-[14px] text-[#636366]">iOS segmented control inspired - tighter spacing</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 rounded-full p-1 backdrop-blur-md flex items-center gap-1">
                <button className="h-[40px] px-5 rounded-full bg-transparent hover:bg-white/15 text-white text-[14px] font-normal transition-all flex items-center gap-2">
                  <HelpCircle className="w-[16px] h-[16px]" strokeWidth={1.5} />
                  Feature Guide
                </button>
                <button className="h-[40px] px-5 rounded-full bg-transparent hover:bg-white/15 text-white text-[14px] font-normal transition-all flex items-center gap-2">
                  <Settings2 className="w-[16px] h-[16px]" strokeWidth={1.5} />
                  Standards
                </button>
              </div>
              <button className="bg-[#007AFF] hover:bg-[#3395FF] text-white h-[44px] px-7 rounded-full shadow-lg hover:shadow-xl transition-all text-[15px] font-semibold flex items-center gap-2.5">
                <ScanSearch className="w-[18px] h-[18px]" strokeWidth={2} />
                Select Course to Scan
              </button>
            </div>
          </div>

          {/* Variation 10: Underline Accent */}
          <div className="bg-gradient-to-r from-[#2d2d2f] to-[#1d1d1f] rounded-[20px] p-8">
            <div className="mb-4">
              <h3 className="text-[18px] font-semibold text-white mb-1">10. Bottom Accent Line</h3>
              <p className="text-[14px] text-[#636366]">Subtle bottom border appears on hover</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-[44px] px-6 rounded-full bg-white/5 hover:bg-white/15 text-white text-[15px] font-normal transition-all border-b-2 border-transparent hover:border-white/40 flex items-center gap-2.5">
                <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Feature Guide
              </button>
              <button className="h-[44px] px-6 rounded-full bg-white/5 hover:bg-white/15 text-white text-[15px] font-normal transition-all border-b-2 border-transparent hover:border-white/40 flex items-center gap-2.5">
                <Settings2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
                Standards
              </button>
              <button className="bg-[#007AFF] hover:bg-[#3395FF] text-white h-[44px] px-7 rounded-full shadow-lg hover:shadow-xl transition-all text-[15px] font-semibold border-b-2 border-transparent hover:border-[#60B0FF] flex items-center gap-2.5">
                <ScanSearch className="w-[18px] h-[18px]" strokeWidth={2} />
                Select Course to Scan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
