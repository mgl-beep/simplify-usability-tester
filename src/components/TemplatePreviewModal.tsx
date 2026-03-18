import { X, Download, CheckCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { CourseTemplate } from "../utils/courseTemplates";

interface TemplatePreviewModalProps {
  template: CourseTemplate;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export function TemplatePreviewModal({ template, isOpen, onClose, onDownload }: TemplatePreviewModalProps) {
  const handleDownloadAndClose = () => {
    onDownload();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] max-w-[90vw] max-h-[90vh] bg-white rounded-[20px] shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#d2d2d7] flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-[22px] font-semibold tracking-tight text-[#1d1d1f] mb-2">
                    {template.name}
                  </h2>
                  <p className="text-[13px] text-[#636366] mb-3">
                    {template.description}
                  </p>
                  
                  {/* Compliance Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-[#34c759]/10 text-[#34c759] text-[11px] font-semibold rounded-full border border-[#34c759]/20">
                      ✓ CVC-OEI: {template.rubricCompliance.cvcOEI}% Compliant
                    </span>
                    <span className="px-3 py-1 bg-[#0071e3]/10 text-[#0071e3] text-[11px] font-semibold rounded-full border border-[#0071e3]/20">
                      ✓ Peralta: {template.rubricCompliance.peralta}% Compliant
                    </span>
                    <span className="px-3 py-1 bg-[#ff9500]/10 text-[#ff9500] text-[11px] font-semibold rounded-full border border-[#ff9500]/20">
                      ✓ WCAG {template.rubricCompliance.wcag}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-[#636366]" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Features */}
              <div className="mb-6">
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-3">
                  ✨ Template Features
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {template.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-[#EEECE8] rounded-[8px]">
                      <CheckCircle className="w-4 h-4 text-[#34c759] flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-[12px] text-[#1d1d1f]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template Structure Preview */}
              <div className="mb-6">
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-3">
                  📋 Template Structure
                </h3>
                
                {template.content.type === 'full-course' && template.content.modules && (
                  <div className="space-y-3">
                    {template.content.modules.map((module, index) => (
                      <div key={index} className="border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                        <div className="px-4 py-3 bg-[#EEECE8] border-b border-[#d2d2d7]">
                          <h4 className="text-[13px] font-semibold text-[#1d1d1f]">{module.name}</h4>
                          <p className="text-[11px] text-[#636366] mt-0.5">{module.description}</p>
                        </div>
                        <div className="px-4 py-3">
                          <ul className="space-y-1.5">
                            {module.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-center gap-2 text-[12px] text-[#1d1d1f]" style={{ paddingLeft: `${(item.indent || 0) * 16}px` }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] flex-shrink-0"></span>
                                {item.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {template.content.type === 'page' && template.content.html && (
                  <div className="border border-[#d2d2d7] rounded-[10px] p-4 bg-[#EEECE8]">
                    <p className="text-[12px] text-[#636366] mb-3">
                      This template includes a fully accessible HTML page with:
                    </p>
                    <ul className="space-y-1.5">
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Semantic HTML structure
                      </li>
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        ARIA landmarks and labels
                      </li>
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        High contrast colors (4.5:1 minimum)
                      </li>
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Keyboard navigation support
                      </li>
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Screen reader optimized
                      </li>
                    </ul>
                  </div>
                )}

                {template.content.type === 'assignment' && (
                  <div className="border border-[#d2d2d7] rounded-[10px] p-4 bg-[#EEECE8]">
                    <p className="text-[12px] text-[#636366] mb-3">
                      Assignment template includes:
                    </p>
                    <ul className="space-y-1.5">
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Clear learning objectives
                      </li>
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Step-by-step instructions
                      </li>
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Accessible grading rubric
                      </li>
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Multiple submission format options
                      </li>
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Support resources linked
                      </li>
                    </ul>
                  </div>
                )}

                {template.content.type === 'module' && template.content.modules && (
                  <div className="space-y-3">
                    {template.content.modules.map((module, index) => (
                      <div key={index} className="border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                        <div className="px-4 py-3 bg-[#EEECE8] border-b border-[#d2d2d7]">
                          <h4 className="text-[13px] font-semibold text-[#1d1d1f]">{module.name}</h4>
                          <p className="text-[11px] text-[#636366] mt-0.5">{module.description}</p>
                        </div>
                        <div className="px-4 py-3">
                          <ul className="space-y-1.5">
                            {module.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-center gap-2 text-[12px] text-[#1d1d1f]" style={{ paddingLeft: `${(item.indent || 0) * 16}px` }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] flex-shrink-0"></span>
                                {item.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {template.content.type === 'syllabus' && (
                  <div className="border border-[#d2d2d7] rounded-[10px] p-4 bg-[#EEECE8]">
                    <p className="text-[12px] text-[#636366] mb-3">
                      Comprehensive syllabus template includes:
                    </p>
                    <ul className="space-y-1.5">
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Course & instructor information
                      </li>
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Clear learning outcomes
                      </li>
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Free/OER required materials
                      </li>
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Accessible grading rubric
                      </li>
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Course schedule
                      </li>
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Comprehensive accessibility statement
                      </li>
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Student support resources
                      </li>
                      <li className="flex items-center gap-2 text-[12px] text-[#1d1d1f]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        Diversity & inclusion statement
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Rubric Compliance Details */}
              <div>
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-3">
                  📊 Rubric Compliance
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-[#34c759]/30 rounded-[10px] p-4 bg-[#34c759]/5">
                    <div className="text-[24px] font-bold text-[#34c759] mb-1">
                      {template.rubricCompliance.cvcOEI}%
                    </div>
                    <div className="text-[11px] font-semibold text-[#1d1d1f] mb-1">
                      CVC-OEI Rubric
                    </div>
                    <div className="text-[10px] text-[#636366]">
                      44 criteria across Content, Interaction, Assessment, Accessibility
                    </div>
                  </div>
                  
                  <div className="border border-[#0071e3]/30 rounded-[10px] p-4 bg-[#0071e3]/5">
                    <div className="text-[24px] font-bold text-[#0071e3] mb-1">
                      {template.rubricCompliance.peralta}%
                    </div>
                    <div className="text-[11px] font-semibold text-[#1d1d1f] mb-1">
                      Peralta Equity
                    </div>
                    <div className="text-[10px] text-[#636366]">
                      8 criteria: UDL, Diversity, Bias, Student Resources
                    </div>
                  </div>
                  
                  <div className="border border-[#ff9500]/30 rounded-[10px] p-4 bg-[#ff9500]/5">
                    <div className="text-[24px] font-bold text-[#ff9500] mb-1">
                      {template.rubricCompliance.wcag}
                    </div>
                    <div className="text-[11px] font-semibold text-[#1d1d1f] mb-1">
                      WCAG Standard
                    </div>
                    <div className="text-[10px] text-[#636366]">
                      Web Content Accessibility Guidelines
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#d2d2d7] flex items-center justify-between flex-shrink-0">
              <p className="text-[12px] text-[#636366]">
                Download this template to use in your Canvas course
              </p>
              <div className="flex items-center gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="h-[36px] px-4 rounded-[10px] border-[#d2d2d7]"
                >
                  Close
                </Button>
                <Button
                  onClick={handleDownloadAndClose}
                  className="h-[36px] px-4 rounded-[10px] bg-[#0071e3] hover:bg-[#0077ed] text-white"
                >
                  <Download className="w-4 h-4 mr-2" strokeWidth={2} />
                  Download Template
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
