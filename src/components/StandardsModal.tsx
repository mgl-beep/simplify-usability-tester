import { X, Plus, CheckCircle2, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";

interface Standard {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  description: string;
  criteria: number;
}

const defaultStandards: Standard[] = [
  {
    id: "cvc-oei",
    name: "CVC-OEI Course Design Rubric",
    version: "2020",
    enabled: true,
    description: "Comprehensive course design standards from the California Virtual Campus - Online Education Initiative",
    criteria: 52
  },
  {
    id: "peralta",
    name: "Peralta Online Equity Rubric",
    version: "3.0 (2020)",
    enabled: true,
    description: "Equity-focused online course design framework emphasizing inclusive pedagogy",
    criteria: 38
  },
  {
    id: "quality-matters",
    name: "Quality Matters Higher Education Rubric",
    version: "7th Edition",
    enabled: true,
    description: "Nationally recognized quality assurance system for online and blended learning",
    criteria: 43
  }
  // Note: WCAG tags are still used internally for technical tracking but not displayed as a separate rubric
  // since CVC-OEI, Quality Matters, and Peralta all incorporate WCAG compliance requirements
];

interface StandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  enabledStandards?: string[];
  onSaveStandards?: (enabledStandards: string[]) => void;
}

export function StandardsModal({ isOpen, onClose, enabledStandards: initialEnabledStandards, onSaveStandards }: StandardsModalProps) {
  // Initialize standards with enabled state from props or default
  const [standards, setStandards] = useState<Standard[]>(() => {
    if (initialEnabledStandards) {
      return defaultStandards.map(s => ({
        ...s,
        enabled: initialEnabledStandards.includes(s.id)
      }));
    }
    return defaultStandards;
  });

  const toggleStandard = (id: string) => {
    setStandards(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleSave = () => {
    // Save the enabled standards
    const enabledIds = standards.filter(s => s.enabled).map(s => s.id);
    if (onSaveStandards) {
      onSaveStandards(enabledIds);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[896px] p-0 gap-0 bg-white rounded-[16px] border-[#d2d2d7] overflow-hidden">
        {/* Visually Hidden Title for Accessibility */}
        <DialogTitle className="sr-only">Standards Alignment</DialogTitle>
        <DialogDescription className="sr-only">
          Choose which rubrics and standards to evaluate against
        </DialogDescription>
        
        {/* Header - Match Feature Guide gradient background */}
        <div className="px-6 py-4 border-b border-[#d2d2d7] bg-gradient-to-r from-[#0071e3]/10 to-[#34c759]/10">
          <div>
            <h2 className="text-[24px] tracking-tight text-[#1d1d1f] mb-0.5">Standards Alignment</h2>
            <p className="text-[13px] text-[#636366]">
              Choose which rubrics and standards to evaluate against
            </p>
          </div>
        </div>

        {/* Content - No ScrollArea */}
        <div className="px-6 py-5">
          {/* Active Standards */}
          <div>
            <h3 className="text-[16px] text-[#1d1d1f] mb-3">Active Standards</h3>
            <div className="space-y-2.5">
              {standards.map((standard) => (
                <div
                  key={standard.id}
                  className={`border rounded-[12px] p-4 transition-all ${
                    standard.enabled
                      ? "border-[#0071e3] bg-[#0071e3]/5"
                      : "border-[#d2d2d7] bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Toggle */}
                    <button
                      onClick={() => toggleStandard(standard.id)}
                      className="mt-0.5"
                    >
                      {standard.enabled ? (
                        <div className="w-6 h-6 rounded-full bg-[#0071e3] flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-[#d2d2d7]" />
                      )}
                    </button>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="text-[15px] text-[#1d1d1f] mb-0.5">
                            {standard.name}
                          </h4>
                          <p className="text-[12px] text-[#636366]">
                            Version {standard.version} • {standard.criteria} criteria
                          </p>
                        </div>
                        <button className="p-1.5 hover:bg-[#f5f5f7] rounded-lg transition-colors">
                          <Settings className="w-4 h-4 text-[#636366]" strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="text-[13px] text-[#636366] leading-relaxed">
                        {standard.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#d2d2d7] bg-[#EEECE8] flex items-center justify-between">
          <p className="text-[12px] text-[#636366]">
            {standards.filter(s => s.enabled).length} of {standards.length} standards active
          </p>
          <Button
            onClick={handleSave}
            className="bg-[#0071e3] hover:bg-[#0077ed] text-white h-[36px] px-5 rounded-[10px]"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}