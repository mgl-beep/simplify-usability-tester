import { useState } from 'react';
import { FileText, Download, Eye, Settings, ChevronDown, Check, Image, BarChart3 } from 'lucide-react';
import { Button } from './button';

interface ReportSection {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  required?: boolean;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  format: 'pdf' | 'html' | 'docx';
}

interface ReportBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: ReportConfig) => Promise<void>;
  courseName: string;
  availableSections: ReportSection[];
  templates?: ReportTemplate[];
}

export interface ReportConfig {
  title: string;
  format: 'pdf' | 'html' | 'docx';
  sections: string[];
  options: {
    includeLogo: boolean;
    includeCharts: boolean;
    includeScreenshots: boolean;
    includeTimestamps: boolean;
    includeRecommendations: boolean;
    colorScheme: 'color' | 'grayscale';
    pageNumbers: boolean;
    tableOfContents: boolean;
  };
  branding?: {
    logo?: string;
    primaryColor?: string;
    institutionName?: string;
  };
}

export function ReportBuilder({
  isOpen,
  onClose,
  onGenerate,
  courseName,
  availableSections,
  templates = []
}: ReportBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [config, setConfig] = useState<ReportConfig>({
    title: `${courseName} - Accessibility Report`,
    format: 'pdf',
    sections: availableSections.filter(s => s.enabled || s.required).map(s => s.id),
    options: {
      includeLogo: true,
      includeCharts: true,
      includeScreenshots: false,
      includeTimestamps: true,
      includeRecommendations: true,
      colorScheme: 'color',
      pageNumbers: true,
      tableOfContents: true
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleToggleSection = (sectionId: string) => {
    const section = availableSections.find(s => s.id === sectionId);
    if (section?.required) return;

    setConfig(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionId)
        ? prev.sections.filter(id => id !== sectionId)
        : [...prev.sections, sectionId]
    }));
  };

  const handleApplyTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template.id);
    setConfig(prev => ({
      ...prev,
      format: template.format,
      sections: template.sections.filter(s => s.enabled || s.required).map(s => s.id)
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      await onGenerate(config);

      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        onClose();
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[16px] w-full max-w-[900px] max-h-[90vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e5e7] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0071e3] to-[#00d084] flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-[#1d1d1f]">
                Generate Custom Report
              </h2>
              <p className="text-[13px] text-[#636366]">{courseName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Templates */}
            {templates.length > 0 && (
              <div>
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-3">
                  Quick Templates
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleApplyTemplate(template)}
                      className={`p-4 rounded-[12px] border-2 text-left transition-all ${
                        selectedTemplate === template.id
                          ? 'border-[#0071e3] bg-[#0071e3]/5'
                          : 'border-[#d2d2d7] hover:border-[#636366]'
                      }`}
                    >
                      <FileText className={`w-5 h-5 mb-2 ${
                        selectedTemplate === template.id ? 'text-[#0071e3]' : 'text-[#636366]'
                      }`} strokeWidth={2} />
                      <p className="text-[14px] font-semibold text-[#1d1d1f] mb-1">
                        {template.name}
                      </p>
                      <p className="text-[12px] text-[#636366]">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Report Title */}
            <div>
              <label className="block text-[13px] font-semibold text-[#636366] uppercase tracking-wide mb-2">
                Report Title
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                className="w-full h-11 px-4 rounded-lg border border-[#d2d2d7] text-[15px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent"
              />
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-[13px] font-semibold text-[#636366] uppercase tracking-wide mb-3">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['pdf', 'html', 'docx'] as const).map(format => (
                  <button
                    key={format}
                    onClick={() => setConfig(prev => ({ ...prev, format }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      config.format === format
                        ? 'border-[#0071e3] bg-[#0071e3]/5'
                        : 'border-[#d2d2d7] hover:border-[#636366]'
                    }`}
                  >
                    <FileText className={`w-5 h-5 mb-1 mx-auto ${
                      config.format === format ? 'text-[#0071e3]' : 'text-[#636366]'
                    }`} strokeWidth={2} />
                    <p className={`text-[13px] font-semibold ${
                      config.format === format ? 'text-[#0071e3]' : 'text-[#1d1d1f]'
                    }`}>
                      {format.toUpperCase()}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div>
              <label className="block text-[13px] font-semibold text-[#636366] uppercase tracking-wide mb-3">
                Include Sections
              </label>
              <div className="space-y-2">
                {availableSections.map(section => (
                  <label
                    key={section.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      section.required
                        ? 'bg-[#EEECE8] cursor-not-allowed opacity-60'
                        : 'hover:bg-[#EEECE8] cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={config.sections.includes(section.id)}
                      onChange={() => handleToggleSection(section.id)}
                      disabled={section.required}
                      className="w-5 h-5 mt-0.5 rounded border-[#d2d2d7] text-[#0071e3] focus:ring-2 focus:ring-[#0071e3] disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-medium text-[#1d1d1f]">
                          {section.title}
                        </p>
                        {section.required && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[11px] font-semibold">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#636366] mt-0.5">
                        {section.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="block text-[13px] font-semibold text-[#636366] uppercase tracking-wide mb-3">
                Report Options
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries({
                  includeLogo: 'Include institution logo',
                  includeCharts: 'Include charts and graphs',
                  includeScreenshots: 'Include issue screenshots',
                  includeTimestamps: 'Include scan timestamps',
                  includeRecommendations: 'Include fix recommendations',
                  pageNumbers: 'Add page numbers',
                  tableOfContents: 'Generate table of contents'
                }).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-[#f5f5f7] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={config.options[key as keyof typeof config.options] as boolean}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        options: { ...prev.options, [key]: e.target.checked }
                      }))}
                      className="w-4 h-4 rounded border-[#d2d2d7] text-[#0071e3] focus:ring-2 focus:ring-[#0071e3]"
                    />
                    <span className="text-[13px] text-[#1d1d1f]">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Scheme */}
            <div>
              <label className="block text-[13px] font-semibold text-[#636366] uppercase tracking-wide mb-3">
                Color Scheme
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['color', 'grayscale'] as const).map(scheme => (
                  <button
                    key={scheme}
                    onClick={() => setConfig(prev => ({ 
                      ...prev, 
                      options: { ...prev.options, colorScheme: scheme }
                    }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      config.options.colorScheme === scheme
                        ? 'border-[#0071e3] bg-[#0071e3]/5'
                        : 'border-[#d2d2d7] hover:border-[#636366]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {scheme === 'color' ? (
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded bg-red-500" />
                          <div className="w-3 h-3 rounded bg-green-500" />
                          <div className="w-3 h-3 rounded bg-blue-500" />
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded bg-gray-800" />
                          <div className="w-3 h-3 rounded bg-gray-500" />
                          <div className="w-3 h-3 rounded bg-gray-300" />
                        </div>
                      )}
                    </div>
                    <p className={`text-[13px] font-semibold ${
                      config.options.colorScheme === scheme ? 'text-[#0071e3]' : 'text-[#1d1d1f]'
                    }`}>
                      {scheme === 'color' ? 'Full Color' : 'Grayscale'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress */}
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#636366]">Generating report...</span>
                  <span className="text-[#0071e3] font-semibold">{progress}%</span>
                </div>
                <div className="h-2 bg-[#e5e5e7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0071e3] to-[#00d084] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#e5e5e7] flex items-center gap-3 flex-shrink-0">
          <Button
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 h-[44px] rounded-full border border-[#d2d2d7] bg-white text-[#1d1d1f]"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {/* Preview */}}
            disabled={isGenerating}
            className="h-[44px] px-6 rounded-full border border-[#d2d2d7] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
          >
            <Eye className="w-4 h-4 mr-2" strokeWidth={2} />
            Preview
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || config.sections.length === 0}
            className="flex-1 h-[44px] rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white disabled:opacity-50"
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" strokeWidth={2} />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Predefined Templates
export const defaultTemplates: ReportTemplate[] = [
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'High-level overview for stakeholders',
    format: 'pdf',
    sections: [
      { id: 'overview', title: 'Overview', description: 'Course summary', enabled: true, required: true },
      { id: 'highlights', title: 'Key Highlights', description: 'Top issues', enabled: true },
      { id: 'recommendations', title: 'Recommendations', description: 'Next steps', enabled: true }
    ]
  },
  {
    id: 'detailed-audit',
    name: 'Detailed Audit',
    description: 'Complete technical analysis',
    format: 'pdf',
    sections: [
      { id: 'overview', title: 'Overview', description: 'Course summary', enabled: true, required: true },
      { id: 'wcag', title: 'WCAG Compliance', description: 'WCAG 2.2 AA', enabled: true },
      { id: 'issues', title: 'All Issues', description: 'Detailed list', enabled: true },
      { id: 'modules', title: 'Module Analysis', description: 'Per-module breakdown', enabled: true },
      { id: 'recommendations', title: 'Recommendations', description: 'Fix suggestions', enabled: true }
    ]
  },
  {
    id: 'compliance',
    name: 'Compliance Report',
    description: 'Standards & regulations',
    format: 'pdf',
    sections: [
      { id: 'overview', title: 'Overview', description: 'Course summary', enabled: true, required: true },
      { id: 'wcag', title: 'WCAG 2.2 AA', description: 'Web accessibility', enabled: true },
      { id: 'cvc-oei', title: 'CVC-OEI', description: 'Online education', enabled: true },
      { id: 'qm', title: 'Quality Matters', description: 'QM standards', enabled: true }
    ]
  }
];
