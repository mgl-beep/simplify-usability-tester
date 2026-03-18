import { X, ChevronRight, Image, Type, Contrast, MapPin, Book } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { motion } from "motion/react";
import { useState } from "react";

interface TemplatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  template: "navigation" | "accessibility" | null;
}

export function TemplatePreview({ isOpen, onClose, template }: TemplatePreviewProps) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setApplied(true);
      setTimeout(() => {
        setApplied(false);
        onClose();
      }, 1500);
    }, 2000);
  };

  if (!template) return null;

  const isNavigation = template === "navigation";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1000px] max-h-[90vh] p-0 gap-0 bg-white rounded-[16px] border-[#d2d2d7] overflow-hidden">
        <DialogTitle className="sr-only">
          {isNavigation ? "Navigation Template Preview" : "Accessibility Template Preview"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isNavigation
            ? "Preview and apply navigation template with simplified structure and clear navigation"
            : "Preview and apply accessibility template with WCAG 2.2 AA compliance"}
        </DialogDescription>
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#d2d2d7] flex items-center justify-between">
          <div>
            <h2 className="text-[24px] tracking-tight text-[#1d1d1f] mb-1">
              {isNavigation ? "Navigation Template" : "Accessibility Template"}
            </h2>
            <p className="text-[13px] text-[#636366]">
              {isNavigation
                ? "Simplified structure with optimized click-depth and clear navigation"
                : "WCAG 2.2 AA compliant with built-in accessibility prompts"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-[#636366]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-8">
            {/* Features */}
            <div className="mb-8">
              <h3 className="text-[17px] text-[#1d1d1f] mb-4">What This Template Provides</h3>
              <div className="grid grid-cols-2 gap-4">
                {isNavigation ? (
                  <>
                    <FeatureCard
                      icon={<MapPin className="w-5 h-5" />}
                      iconBg="bg-[#ff9500]/10"
                      iconColor="text-[#ff9500]"
                      title="Clear Module Flow"
                      description="Consistent, predictable structure with logical progression"
                    />
                    <FeatureCard
                      icon={<ChevronRight className="w-5 h-5" />}
                      iconBg="bg-[#0071e3]/10"
                      iconColor="text-[#0071e3]"
                      title="Breadcrumb Trails"
                      description="Always know where you are in the course hierarchy"
                    />
                    <FeatureCard
                      icon={<Type className="w-5 h-5" />}
                      iconBg="bg-[#34c759]/10"
                      iconColor="text-[#34c759]"
                      title="Standardized Headings"
                      description="Consistent heading levels and spacing throughout"
                    />
                    <FeatureCard
                      icon={<Book className="w-5 h-5" />}
                      iconBg="bg-[#a855f7]/10"
                      iconColor="text-[#a855f7]"
                      title="Optimized Click-Depth"
                      description="All content accessible within 2-3 clicks maximum"
                    />
                  </>
                ) : (
                  <>
                    <FeatureCard
                      icon={<Image className="w-5 h-5" />}
                      iconBg="bg-[#0071e3]/10"
                      iconColor="text-[#0071e3]"
                      title="Alt Text Placeholders"
                      description="Pre-labeled prompts for every image uploaded"
                    />
                    <FeatureCard
                      icon={<Contrast className="w-5 h-5" />}
                      iconBg="bg-[#34c759]/10"
                      iconColor="text-[#34c759]"
                      title="Color Contrast Checker"
                      description="Built-in recommendations for WCAG compliance"
                    />
                    <FeatureCard
                      icon={<Type className="w-5 h-5" />}
                      iconBg="bg-[#ff9500]/10"
                      iconColor="text-[#ff9500]"
                      title="Structured Headings"
                      description="Proper H1, H2, H3 hierarchy for screen readers"
                    />
                    <FeatureCard
                      icon={<Book className="w-5 h-5" />}
                      iconBg="bg-[#a855f7]/10"
                      iconColor="text-[#a855f7]"
                      title="Media Caption Prompts"
                      description="Automatic reminders for video captions and transcripts"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="mb-6">
              <h3 className="text-[17px] text-[#1d1d1f] mb-4">Live Preview</h3>
              <div className="border-2 border-[#d2d2d7] rounded-[16px] overflow-hidden">
                {isNavigation ? <NavigationPreview /> : <AccessibilityPreview />}
              </div>
            </div>

            {/* What Gets Fixed */}
            <div className="bg-[#EEECE8] rounded-[12px] p-6">
              <h3 className="text-[15px] text-[#1d1d1f] mb-3">Issues This Template Fixes</h3>
              <div className="space-y-2">
                {isNavigation ? (
                  <>
                    <FixItem text="Pages buried more than 3 clicks deep" />
                    <FixItem text="Inconsistent heading structure across modules" />
                    <FixItem text="Unclear module titles and repetitive section names" />
                    <FixItem text="Missing breadcrumb navigation" />
                    <FixItem text="Mismatched formatting disrupting readability" />
                  </>
                ) : (
                  <>
                    <FixItem text="Missing alternative text on images" />
                    <FixItem text="Low color contrast (below 4.5:1 ratio)" />
                    <FixItem text="Improper heading hierarchy for screen readers" />
                    <FixItem text="Videos without caption prompts" />
                    <FixItem text="PDFs without accessibility tagging reminders" />
                  </>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#d2d2d7] bg-[#EEECE8] flex items-center justify-between">
          <p className="text-[12px] text-[#636366]">
            This will restructure your course content and apply the template
          </p>
          <div className="flex items-center gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={applying}
              className="h-[36px] px-5 rounded-[10px] border-[#d2d2d7] hover:bg-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={applying || applied}
              className={`h-[36px] px-5 rounded-[10px] ${
                applied
                  ? "bg-[#34c759] hover:bg-[#34c759]"
                  : "bg-[#0071e3] hover:bg-[#0077ed]"
              } text-white`}
            >
              {applying ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                  />
                  Applying...
                </>
              ) : applied ? (
                "Applied Successfully!"
              ) : (
                "Apply Template"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeatureCard({ icon, iconBg, iconColor, title, description }: { 
  icon: React.ReactNode; 
  iconBg: string;
  iconColor: string;
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-white border border-[#d2d2d7] rounded-[12px] p-4">
      <div className={`w-10 h-10 ${iconBg} rounded-[10px] flex items-center justify-center mb-3`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="text-[14px] text-[#1d1d1f] mb-1">{title}</div>
      <div className="text-[12px] text-[#636366] leading-relaxed">{description}</div>
    </div>
  );
}

function FixItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-4 h-4 rounded-full bg-[#34c759] flex items-center justify-center flex-shrink-0 mt-0.5">
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
      </div>
      <span className="text-[13px] text-[#1d1d1f]">{text}</span>
    </div>
  );
}

function NavigationPreview() {
  return (
    <div className="bg-white p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-[#636366] mb-6 pb-4 border-b border-[#d2d2d7]">
        <span className="hover:text-[#0071e3] cursor-pointer">Home</span>
        <ChevronRight className="w-3 h-3" />
        <span className="hover:text-[#0071e3] cursor-pointer">Design Systems</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#1d1d1f]">Module 3: Typography</span>
      </div>

      {/* Module Navigation */}
      <div className="mb-6">
        <h4 className="text-[15px] text-[#1d1d1f] mb-3">Course Modules</h4>
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`rounded-[10px] p-3 text-center cursor-pointer transition-all ${
              i === 3 ? "bg-[#0071e3] text-white" : "bg-[#EEECE8] hover:bg-[#e8e8ed]"
            }`}>
              <div className={`text-[10px] mb-1 ${i === 3 ? "text-white/80" : "text-[#636366]"}`}>
                Module {i}
              </div>
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-1">
                <div className={`h-full ${i === 3 ? "bg-white" : "bg-[#0071e3]"}`} 
                     style={{ width: `${Math.min(i * 20, 100)}%` }} />
              </div>
              <div className={`text-[9px] ${i === 3 ? "text-white/70" : "text-[#636366]"}`}>
                {Math.min(i * 20, 100)}% complete
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <h4 className="text-[15px] text-[#1d1d1f] mb-3">Quick Access</h4>
        <div className="grid grid-cols-2 gap-2">
          {["Assignments", "Resources", "Discussions", "Grades"].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between bg-[#EEECE8] rounded-[10px] px-3 py-2.5 hover:bg-[#e8e8ed] cursor-pointer transition-colors"
            >
              <span className="text-[13px] text-[#1d1d1f]">{item}</span>
              <ChevronRight className="w-4 h-4 text-[#636366]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AccessibilityPreview() {
  return (
    <div className="bg-white p-8">
      {/* Color Contrast Checker */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Contrast className="w-4 h-4 text-[#636366]" />
          <h4 className="text-[15px] text-[#1d1d1f]">Live Contrast Checker</h4>
        </div>
        <div className="space-y-2">
          <ContrastRow label="Heading Text" ratio="7.2:1" status="pass" />
          <ContrastRow label="Body Text" ratio="6.8:1" status="pass" />
          <ContrastRow label="Link Text" ratio="5.1:1" status="pass" />
          <ContrastRow label="Secondary Text" ratio="4.6:1" status="pass" />
        </div>
      </div>

      {/* Alt Text Helper */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Image className="w-4 h-4 text-[#636366]" />
          <h4 className="text-[15px] text-[#1d1d1f]">Alt Text Assistant</h4>
        </div>
        <div className="bg-[#EEECE8] rounded-[10px] p-4">
          <div className="w-full h-28 bg-gradient-to-br from-[#0071e3] to-[#005bb5] rounded-[8px] mb-3 flex items-center justify-center">
            <Image className="w-10 h-10 text-white/30" />
          </div>
          <div className="mb-2">
            <label className="block text-[11px] text-[#636366] mb-1">
              Alternative Text (Required)
            </label>
            <input
              type="text"
              placeholder="Describe this image for screen readers..."
              className="w-full px-3 py-2 bg-white border border-[#d2d2d7] rounded-[8px] text-[12px] focus:outline-none focus:border-[#0071e3]"
            />
          </div>
          <p className="text-[10px] text-[#636366]">
            💡 Be descriptive: Include context, colors, actions, and important details
          </p>
        </div>
      </div>

      {/* Heading Structure */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-4 h-4 text-[#636366]" />
          <h4 className="text-[15px] text-[#1d1d1f]">Semantic Structure</h4>
        </div>
        <div className="space-y-2 bg-[#EEECE8] rounded-[10px] p-4">
          <HeadingRow level="H1" text="Course Title" indent={0} />
          <HeadingRow level="H2" text="Module Name" indent={1} />
          <HeadingRow level="H3" text="Section Title" indent={2} />
          <HeadingRow level="H4" text="Subsection" indent={3} />
        </div>
      </div>
    </div>
  );
}

function ContrastRow({ label, ratio, status }: { label: string; ratio: string; status: "pass" | "fail" }) {
  return (
    <div className="flex items-center justify-between bg-[#EEECE8] rounded-[8px] px-3 py-2">
      <span className="text-[13px] text-[#1d1d1f]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-[#636366]">{ratio}</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${
          status === "pass" ? "bg-[#34c759] text-white" : "bg-[#ff3b30] text-white"
        }`}>
          {status === "pass" ? "✓ WCAG AA" : "✗ Fail"}
        </span>
      </div>
    </div>
  );
}

function HeadingRow({ level, text, indent }: { level: string; text: string; indent: number }) {
  const sizes = { H1: "text-[14px]", H2: "text-[13px]", H3: "text-[12px]", H4: "text-[11px]" };
  return (
    <div className="flex items-center gap-2" style={{ paddingLeft: `${indent * 16}px` }}>
      <span className="text-[10px] text-[#636366] w-8">{level}</span>
      <span className={`${sizes[level as keyof typeof sizes]} text-[#1d1d1f]`}>{text}</span>
    </div>
  );
}