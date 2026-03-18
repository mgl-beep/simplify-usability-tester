import { motion } from "motion/react";
import { ExternalLink, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function LoginHeaderVariants() {
  const variants = [
    {
      name: "Option 1: Subtle Gradient Band",
      description: "Soft blue-to-teal gradient header with centered typography",
      header: (
        <div className="bg-gradient-to-r from-[#0071e3] via-[#0088cc] to-[#00a0b0] px-8 py-6 text-center">
          <h1 className="text-[28px] tracking-[-0.02em] text-white font-[600] leading-tight mb-1">
            SIMPLIFY
          </h1>
          <p className="text-[14px] text-white/90">
            Connect to your Canvas account
          </p>
        </div>
      )
    },
    {
      name: "Option 2: Thin Accent Line",
      description: "Minimal white header with colored top border accent",
      header: (
        <div className="relative px-8 py-6 text-center bg-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0071e3] via-[#0088cc] to-[#00a0b0]" />
          <h1 className="text-[28px] tracking-[-0.02em] text-[#1d1d1f] font-[600] leading-tight mb-1">
            SIMPLIFY
          </h1>
          <p className="text-[14px] text-[#6e6e73]">
            Connect to your Canvas account
          </p>
        </div>
      )
    },
    {
      name: "Option 3: Soft Tinted Panel",
      description: "Light blue tinted background with dark text",
      header: (
        <div className="bg-[#f0f8ff] px-8 py-6 text-center border-b border-[#e0efff]">
          <h1 className="text-[28px] tracking-[-0.02em] text-[#1d1d1f] font-[600] leading-tight mb-1">
            SIMPLIFY
          </h1>
          <p className="text-[14px] text-[#6e6e73]">
            Connect to your Canvas account
          </p>
        </div>
      )
    },
    {
      name: "Option 4: Plain White + Strong Typography",
      description: "Minimal white header with bold typography hierarchy",
      header: (
        <div className="px-8 py-6 text-center bg-white border-b border-[#f0f0f0]">
          <h1 className="text-[32px] tracking-[-0.03em] text-[#1d1d1f] font-[700] leading-tight mb-1">
            SIMPLIFY
          </h1>
          <p className="text-[14px] text-[#636366] font-medium">
            Connect to your Canvas account
          </p>
        </div>
      )
    },
    {
      name: "Option 5: Borderless with Colored Title",
      description: "Ultra minimal with colored brand title",
      header: (
        <div className="px-8 py-6 text-center bg-white">
          <h1 className="text-[30px] tracking-[-0.02em] text-[#0071e3] font-[600] leading-tight mb-1">
            SIMPLIFY
          </h1>
          <p className="text-[14px] text-[#6e6e73]">
            Connect to your Canvas account
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#EEECE8] p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-[32px] font-semibold text-[#1d1d1f] mb-3">
            Canvas Login Modal Header Options
          </h1>
          <p className="text-[17px] text-[#6e6e73] max-w-[700px] mx-auto">
            5 clean, minimal alternatives without logo icons or decorative elements.
            Body layout remains identical—only header styling changes.
          </p>
        </div>

        {/* Variants Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {variants.map((variant, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col"
            >
              {/* Variant Label */}
              <div className="mb-4">
                <h2 className="text-[18px] font-semibold text-[#1d1d1f] mb-1">
                  {variant.name}
                </h2>
                <p className="text-[13px] text-[#6e6e73]">
                  {variant.description}
                </p>
              </div>

              {/* Modal Preview */}
              <div className="bg-white rounded-[20px] shadow-xl overflow-hidden flex-1">
                {/* Header */}
                {variant.header}

                {/* Body - Consistent across all variants */}
                <div className="px-8 py-6">
                  <div className="text-center mb-5">
                    <h2 className="text-[20px] font-semibold text-[#1d1d1f] mb-1">
                      Get Started
                    </h2>
                    <p className="text-[13px] text-[#636366]">
                      SIMPLIFY will integrate with your Canvas LMS
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Domain Input */}
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-[#1d1d1f]">
                        Canvas Domain
                      </Label>
                      <Input
                        type="text"
                        placeholder="canvas.instructure.com"
                        className="h-[44px] rounded-[10px] border-[#d2d2d7] text-[14px]"
                        disabled
                      />
                    </div>

                    {/* Access Token Input */}
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-[#1d1d1f]">
                        Access Token
                      </Label>
                      <Input
                        type="password"
                        placeholder="1234~abcdefghijklmnopqrstuvwxyz"
                        className="h-[44px] rounded-[10px] border-[#d2d2d7] text-[14px]"
                        disabled
                      />
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="flex items-center gap-1 text-[11px] text-[#0071e3] hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" strokeWidth={2} />
                        Generate token in Canvas Settings
                      </a>
                    </div>

                    {/* Connect Button */}
                    <Button
                      disabled
                      className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white h-[48px] rounded-[10px] text-[15px] font-semibold shadow-lg"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" strokeWidth={2} />
                      Connect to Canvas
                    </Button>

                    {/* Info Note */}
                    <div className="p-3 bg-[#EEECE8] rounded-[10px] border border-[#e5e5e7]">
                      <p className="text-[11px] text-[#636366] text-center">
                        🔒 Your credentials are stored locally and never shared
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Notes */}
        <div className="mt-12 bg-white rounded-[12px] border border-[#d2d2d7] p-6">
          <h3 className="text-[20px] font-semibold text-[#1d1d1f] mb-4">
            Design Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-[14px]">
            <div>
              <h4 className="font-semibold text-[#1d1d1f] mb-2">Option 1: Subtle Gradient</h4>
              <ul className="space-y-1 text-[#6e6e73]">
                <li>• Modern gradient aesthetic</li>
                <li>• Clear brand presence</li>
                <li>• White text on color</li>
                <li>• Medium visual weight</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#1d1d1f] mb-2">Option 2: Thin Accent</h4>
              <ul className="space-y-1 text-[#6e6e73]">
                <li>• Ultra minimal approach</li>
                <li>• Subtle brand color hint</li>
                <li>• Clean white header</li>
                <li>• Lowest visual weight</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#1d1d1f] mb-2">Option 3: Soft Tinted</h4>
              <ul className="space-y-1 text-[#6e6e73]">
                <li>• Gentle background tint</li>
                <li>• Approachable aesthetic</li>
                <li>• Subtle border separation</li>
                <li>• Light visual weight</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#1d1d1f] mb-2">Option 4: Plain White</h4>
              <ul className="space-y-1 text-[#6e6e73]">
                <li>• Typography-focused</li>
                <li>• Maximum simplicity</li>
                <li>• Bold title treatment</li>
                <li>• Professional, clean</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#1d1d1f] mb-2">Option 5: Colored Title</h4>
              <ul className="space-y-1 text-[#6e6e73]">
                <li>• Brand color in title</li>
                <li>• No background styling</li>
                <li>• Borderless design</li>
                <li>• Contemporary minimal</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-[#EEECE8] rounded-[8px]">
            <p className="text-[14px] text-[#6e6e73]">
              <strong className="text-[#1d1d1f]">Recommendation:</strong> Options 2, 3, or 5 offer the cleanest, 
              most modern aesthetic. Option 2 (thin accent line) provides subtle branding with maximum minimalism. 
              Option 3 (soft tinted) feels the most approachable. Option 5 (colored title) is the most contemporary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
