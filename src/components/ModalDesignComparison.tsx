import { useState } from 'react';
import { X, ChevronDown, ChevronRight, CheckCircle2, XCircle, Lightbulb, BookOpen, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalOption {
  id: string;
  name: string;
  description: string;
}

const modalOptions: ModalOption[] = [
  { id: 'accordion', name: 'Option 1: Accordion Sections', description: 'Collapsible sections with expand/collapse' },
  { id: 'tabs', name: 'Option 2: Tabbed Interface', description: 'Organize content into tabs' },
  { id: 'compact', name: 'Option 3: Compact Cards', description: 'Minimalist cards with tooltips' },
  { id: 'progressive', name: 'Option 4: Progressive Disclosure', description: 'Show less, reveal more on click' }
];

export function ModalDesignComparison() {
  const [selectedOption, setSelectedOption] = useState<string>('accordion');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['suggestion']));
  const [activeTab, setActiveTab] = useState<'suggestions' | 'tips' | 'examples'>('suggestions');

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Sample data
  const issue = {
    title: 'Table Missing Caption',
    severity: 'low',
    courseName: 'CATS 101',
    location: 'Home Page > Page',
    suggestions: {
      moderate: 'Overview of sessions in CATS 101, covering cat behavior, learning, and culture.',
      detailed: 'Detailed session overview for CATS 101, including topics on cat behavior, learning processes, and cultural significance.'
    }
  };

  return (
    <div className="fixed inset-0 bg-[#EEECE8] z-50 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-[#1d1d1f] mb-2">Modal Redesign Options</h1>
          <p className="text-[15px] text-[#636366]">Compare four different approaches to reduce cognitive overload while preserving all information.</p>
        </div>

        {/* Option Selector */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {modalOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`p-4 rounded-[12px] border-2 text-left transition-all ${
                selectedOption === option.id
                  ? 'border-[#0071e3] bg-[#0071e3]/5'
                  : 'border-[#d2d2d7] bg-white hover:border-[#0071e3]/40'
              }`}
            >
              <div className="text-[15px] font-semibold text-[#1d1d1f] mb-1">{option.name}</div>
              <div className="text-[13px] text-[#636366]">{option.description}</div>
            </button>
          ))}
        </div>

        {/* Modal Preview */}
        <div className="bg-white rounded-[16px] shadow-2xl max-w-[700px] mx-auto">
          {/* OPTION 1: Accordion Sections */}
          {selectedOption === 'accordion' && (
            <>
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#d2d2d7]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-[17px] font-semibold text-[#1d1d1f]">{issue.title}</h2>
                      <span className="px-2 py-0.5 rounded bg-[#ffcc00]/10 text-[#1d1d1f] text-[10px] font-semibold uppercase">
                        {issue.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#636366]">
                      <span>📚 {issue.courseName}</span>
                      <ChevronRight className="w-3 h-3" />
                      <span>{issue.location}</span>
                    </div>
                  </div>
                  <button className="text-[#636366] hover:text-[#1d1d1f]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                {/* AI Suggestions - Collapsible */}
                <div className="border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                  <button
                    onClick={() => toggleSection('suggestion')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-[#EEECE8] hover:bg-[#ebebed] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#0071e3]" />
                      <span className="text-[13px] font-semibold text-[#1d1d1f]">AI Suggested Caption</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#636366] transition-transform ${expandedSections.has('suggestion') ? '' : '-rotate-90'}`} />
                  </button>
                  <AnimatePresence>
                    {expandedSections.has('suggestion') && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-3 bg-white">
                          {/* Recommended */}
                          <div className="p-3 bg-[#0071e3]/5 border border-[#0071e3]/20 rounded-[8px]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[11px] font-semibold text-[#0071e3] uppercase">⚡ Recommended</span>
                              <button className="ml-auto text-[11px] text-[#0071e3] font-medium hover:underline">
                                Use This
                              </button>
                            </div>
                            <p className="text-[13px] text-[#1d1d1f]">{issue.suggestions.moderate}</p>
                            <p className="text-[11px] text-[#636366] mt-1">79 characters</p>
                          </div>
                          
                          {/* Detailed - Collapsed by default */}
                          <button
                            onClick={() => toggleSection('detailed')}
                            className="w-full text-left p-3 border border-[#d2d2d7] rounded-[8px] hover:bg-[#f5f5f7] transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-[#636366] uppercase">📋 Detailed Version</span>
                                <span className="text-[11px] text-[#636366]">120 chars</span>
                              </div>
                              <ChevronRight className={`w-3.5 h-3.5 text-[#636366] transition-transform ${expandedSections.has('detailed') ? 'rotate-90' : ''}`} />
                            </div>
                            {expandedSections.has('detailed') && (
                              <p className="text-[13px] text-[#1d1d1f] mt-2">{issue.suggestions.detailed}</p>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Writing Tips - Collapsible */}
                <div className="border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                  <button
                    onClick={() => toggleSection('tips')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-[#EEECE8] hover:bg-[#ebebed] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#0071e3]" />
                      <span className="text-[13px] font-semibold text-[#1d1d1f]">Writing Tips</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#636366] transition-transform ${expandedSections.has('tips') ? '' : '-rotate-90'}`} />
                  </button>
                  <AnimatePresence>
                    {expandedSections.has('tips') && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-2 bg-white text-[12px]">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#34c759] flex-shrink-0 mt-0.5" />
                            <span>Describe the <strong>purpose</strong> and <strong>content</strong></span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#34c759] flex-shrink-0 mt-0.5" />
                            <span>Include what data is being compared</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#34c759] flex-shrink-0 mt-0.5" />
                            <span>Be clear and concise (under 150 chars)</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <XCircle className="w-3.5 h-3.5 text-[#ff3b30] flex-shrink-0 mt-0.5" />
                            <span>Don't just say "Table" or "Data Table"</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Examples - Collapsible */}
                <div className="border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                  <button
                    onClick={() => toggleSection('examples')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-[#EEECE8] hover:bg-[#ebebed] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-[#0071e3]" />
                      <span className="text-[13px] font-semibold text-[#1d1d1f]">Examples</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#636366] transition-transform ${expandedSections.has('examples') ? '' : '-rotate-90'}`} />
                  </button>
                  <AnimatePresence>
                    {expandedSections.has('examples') && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-2 bg-white text-[12px]">
                          <div className="flex items-start gap-2">
                            <XCircle className="w-3.5 h-3.5 text-[#ff3b30] flex-shrink-0 mt-0.5" />
                            <div><span className="text-[#ff3b30] font-semibold">Bad:</span> "Table"</div>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#34c759] flex-shrink-0 mt-0.5" />
                            <div><span className="text-[#34c759] font-semibold">Good:</span> "Student enrollment by major for Fall 2024"</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-[#d2d2d7] flex items-center gap-3">
                <button className="flex-1 h-[44px] bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-[10px] font-semibold text-[15px] transition-colors">
                  Save & Close
                </button>
                <button className="px-6 h-[44px] text-[#636366] hover:text-[#1d1d1f] rounded-[10px] font-medium text-[15px] transition-colors">
                  Ignore
                </button>
              </div>
            </>
          )}

          {/* OPTION 2: Tabbed Interface */}
          {selectedOption === 'tabs' && (
            <>
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#d2d2d7]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-[17px] font-semibold text-[#1d1d1f]">{issue.title}</h2>
                      <span className="px-2 py-0.5 rounded bg-[#ffcc00]/10 text-[#1d1d1f] text-[10px] font-semibold uppercase">
                        {issue.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#636366]">
                      <span>📚 {issue.courseName}</span>
                      <ChevronRight className="w-3 h-3" />
                      <span>{issue.location}</span>
                    </div>
                  </div>
                  <button className="text-[#636366] hover:text-[#1d1d1f]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1">
                  {(['suggestions', 'tips', 'examples'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-[8px] text-[13px] font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-[#0071e3] text-white'
                          : 'text-[#636366] hover:bg-[#f5f5f7]'
                      }`}
                    >
                      {tab === 'suggestions' && '⚡ Suggestions'}
                      {tab === 'tips' && '📖 Tips'}
                      {tab === 'examples' && '💡 Examples'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-5 max-h-[60vh] overflow-y-auto">
                {activeTab === 'suggestions' && (
                  <div className="space-y-3">
                    <div className="p-4 bg-[#0071e3]/5 border border-[#0071e3]/20 rounded-[10px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-semibold text-[#0071e3] uppercase">⚡ Recommended</span>
                        <button className="ml-auto text-[12px] text-white bg-[#0071e3] hover:bg-[#0077ed] px-3 py-1 rounded-[6px] font-medium">
                          Use This
                        </button>
                      </div>
                      <p className="text-[14px] text-[#1d1d1f]">{issue.suggestions.moderate}</p>
                      <p className="text-[11px] text-[#636366] mt-2">79 characters</p>
                    </div>
                    
                    <div className="p-4 border border-[#d2d2d7] rounded-[10px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-semibold text-[#636366] uppercase">📋 Detailed</span>
                        <span className="ml-auto text-[11px] text-[#636366]">120 characters</span>
                      </div>
                      <p className="text-[14px] text-[#1d1d1f]">{issue.suggestions.detailed}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'tips' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#EEECE8] rounded-[8px] flex items-start gap-2 text-[13px]">
                      <CheckCircle2 className="w-4 h-4 text-[#34c759] flex-shrink-0 mt-0.5" />
                      <span>Describe the <strong>purpose</strong> and <strong>content</strong> of the table</span>
                    </div>
                    <div className="p-3 bg-[#EEECE8] rounded-[8px] flex items-start gap-2 text-[13px]">
                      <CheckCircle2 className="w-4 h-4 text-[#34c759] flex-shrink-0 mt-0.5" />
                      <span>Include what data is being compared or presented</span>
                    </div>
                    <div className="p-3 bg-[#EEECE8] rounded-[8px] flex items-start gap-2 text-[13px]">
                      <CheckCircle2 className="w-4 h-4 text-[#34c759] flex-shrink-0 mt-0.5" />
                      <span>Be clear and concise (under 150 chars)</span>
                    </div>
                    <div className="p-3 bg-[#fff5f5] border border-[#ff3b30]/20 rounded-[8px] flex items-start gap-2 text-[13px]">
                      <XCircle className="w-4 h-4 text-[#ff3b30] flex-shrink-0 mt-0.5" />
                      <span>Don't just say "Table" or "Data Table"</span>
                    </div>
                  </div>
                )}

                {activeTab === 'examples' && (
                  <div className="space-y-3">
                    <div className="p-4 bg-[#fff5f5] border border-[#ff3b30]/20 rounded-[8px]">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-[#ff3b30]" />
                        <span className="text-[12px] font-semibold text-[#ff3b30] uppercase">Bad Example</span>
                      </div>
                      <p className="text-[14px] text-[#1d1d1f]">"Table"</p>
                    </div>
                    
                    <div className="p-4 bg-[#f0fdf4] border border-[#34c759]/20 rounded-[8px]">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-[#34c759]" />
                        <span className="text-[12px] font-semibold text-[#34c759] uppercase">Good Example</span>
                      </div>
                      <p className="text-[14px] text-[#1d1d1f]">"Student enrollment by major for Fall 2024"</p>
                    </div>

                    <div className="p-4 bg-[#fff5f5] border border-[#ff3b30]/20 rounded-[8px]">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-[#ff3b30]" />
                        <span className="text-[12px] font-semibold text-[#ff3b30] uppercase">Bad Example</span>
                      </div>
                      <p className="text-[14px] text-[#1d1d1f]">"Data"</p>
                    </div>
                    
                    <div className="p-4 bg-[#f0fdf4] border border-[#34c759]/20 rounded-[8px]">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-[#34c759]" />
                        <span className="text-[12px] font-semibold text-[#34c759] uppercase">Good Example</span>
                      </div>
                      <p className="text-[14px] text-[#1d1d1f]">"Comparison of assignment scores across three sections"</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-[#d2d2d7] flex items-center gap-3">
                <button className="flex-1 h-[44px] bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-[10px] font-semibold text-[15px] transition-colors">
                  Save & Close
                </button>
                <button className="px-6 h-[44px] text-[#636366] hover:text-[#1d1d1f] rounded-[10px] font-medium text-[15px] transition-colors">
                  Ignore
                </button>
              </div>
            </>
          )}

          {/* OPTION 3: Compact Cards */}
          {selectedOption === 'compact' && (
            <>
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#d2d2d7]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-[17px] font-semibold text-[#1d1d1f]">{issue.title}</h2>
                      <span className="px-2 py-0.5 rounded bg-[#ffcc00]/10 text-[#1d1d1f] text-[10px] font-semibold uppercase">
                        {issue.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#636366]">
                      <span>📚 {issue.courseName}</span>
                      <ChevronRight className="w-3 h-3" />
                      <span>{issue.location}</span>
                    </div>
                  </div>
                  <button className="text-[#636366] hover:text-[#1d1d1f]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body - Ultra Compact */}
              <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                {/* Quick Action - Most Prominent */}
                <div className="p-4 bg-gradient-to-br from-[#0071e3]/10 to-[#0071e3]/5 border-2 border-[#0071e3] rounded-[12px]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#0071e3]" />
                      <span className="text-[12px] font-bold text-[#0071e3] uppercase tracking-wide">AI Suggestion</span>
                    </div>
                    <span className="text-[10px] text-[#636366] bg-white px-2 py-0.5 rounded">79 chars</span>
                  </div>
                  <p className="text-[15px] text-[#1d1d1f] font-medium leading-snug mb-3">
                    {issue.suggestions.moderate}
                  </p>
                  <button className="w-full h-[36px] bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-[8px] font-semibold text-[13px] transition-colors flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Use This Caption
                  </button>
                </div>

                {/* Compact Info Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Tips Card */}
                  <button 
                    onClick={() => toggleSection('tips-compact')}
                    className="p-3 border border-[#d2d2d7] rounded-[10px] hover:border-[#0071e3] hover:bg-[#f5f5f7] transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#0071e3]" />
                      <span className="text-[12px] font-semibold text-[#1d1d1f]">Best Practices</span>
                    </div>
                    <p className="text-[11px] text-[#636366]">4 writing tips</p>
                    {expandedSections.has('tips-compact') && (
                      <div className="mt-3 pt-3 border-t border-[#d2d2d7] space-y-1.5 text-[11px]">
                        <div className="flex gap-1.5">
                          <span className="text-[#34c759]">✓</span>
                          <span>Describe purpose & content</span>
                        </div>
                        <div className="flex gap-1.5">
                          <span className="text-[#34c759]">✓</span>
                          <span>Include data compared</span>
                        </div>
                        <div className="flex gap-1.5">
                          <span className="text-[#34c759]">✓</span>
                          <span>Under 150 characters</span>
                        </div>
                        <div className="flex gap-1.5">
                          <span className="text-[#ff3b30]">✗</span>
                          <span>Don't just say "Table"</span>
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Examples Card */}
                  <button 
                    onClick={() => toggleSection('examples-compact')}
                    className="p-3 border border-[#d2d2d7] rounded-[10px] hover:border-[#0071e3] hover:bg-[#f5f5f7] transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-3.5 h-3.5 text-[#ff9500]" />
                      <span className="text-[12px] font-semibold text-[#1d1d1f]">Examples</span>
                    </div>
                    <p className="text-[11px] text-[#636366]">Good vs Bad</p>
                    {expandedSections.has('examples-compact') && (
                      <div className="mt-3 pt-3 border-t border-[#d2d2d7] space-y-2 text-[11px]">
                        <div>
                          <span className="text-[#ff3b30] font-semibold">✗ Bad:</span>
                          <p className="text-[#636366] ml-3">"Table"</p>
                        </div>
                        <div>
                          <span className="text-[#34c759] font-semibold">✓ Good:</span>
                          <p className="text-[#1d1d1f] ml-3">"Student enrollment by major..."</p>
                        </div>
                      </div>
                    )}
                  </button>
                </div>

                {/* Alternative Suggestion - Minimized */}
                <details className="group">
                  <summary className="p-3 border border-[#d2d2d7] rounded-[10px] cursor-pointer hover:bg-[#f5f5f7] transition-colors flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#636366]">📋</span>
                      <span className="font-medium text-[#1d1d1f]">Show detailed version</span>
                      <span className="text-[#636366]">(120 chars)</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#636366] group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-2 p-3 bg-[#EEECE8] rounded-[8px] text-[13px] text-[#1d1d1f]">
                    {issue.suggestions.detailed}
                  </div>
                </details>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-[#d2d2d7] flex items-center gap-3">
                <button className="flex-1 h-[44px] bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-[10px] font-semibold text-[15px] transition-colors">
                  Save & Close
                </button>
                <button className="px-6 h-[44px] text-[#636366] hover:text-[#1d1d1f] rounded-[10px] font-medium text-[15px] transition-colors">
                  Ignore
                </button>
              </div>
            </>
          )}

          {/* OPTION 4: Progressive Disclosure */}
          {selectedOption === 'progressive' && (
            <>
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#d2d2d7]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-[17px] font-semibold text-[#1d1d1f]">{issue.title}</h2>
                      <span className="px-2 py-0.5 rounded bg-[#ffcc00]/10 text-[#1d1d1f] text-[10px] font-semibold uppercase">
                        {issue.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#636366]">
                      <span>📚 {issue.courseName}</span>
                      <ChevronRight className="w-3 h-3" />
                      <span>{issue.location}</span>
                    </div>
                  </div>
                  <button className="text-[#636366] hover:text-[#1d1d1f]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body - Progressive */}
              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Primary Action - Hero */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0071e3]/10 rounded-full mb-3">
                    <Zap className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span className="text-[11px] font-semibold text-[#0071e3] uppercase">Recommended Caption</span>
                  </div>
                  
                  <p className="text-[16px] text-[#1d1d1f] font-medium leading-snug mb-1 px-4">
                    {issue.suggestions.moderate}
                  </p>
                  <p className="text-[11px] text-[#636366] mb-4">79 characters • Clear and concise</p>
                  
                  <button className="w-full h-[48px] bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-[12px] font-semibold text-[15px] transition-colors mb-2 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Use This Caption
                  </button>
                  
                  <button 
                    onClick={() => toggleSection('more-options')}
                    className="text-[13px] text-[#0071e3] hover:underline font-medium"
                  >
                    {expandedSections.has('more-options') ? 'Show less' : 'Show more options'}
                  </button>
                </div>

                {/* Progressive Content */}
                <AnimatePresence>
                  {expandedSections.has('more-options') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-4 border-t border-[#d2d2d7]"
                    >
                      {/* Alternative */}
                      <div className="p-3 bg-[#EEECE8] rounded-[10px]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-[#636366] uppercase">Alternative (Detailed)</span>
                          <span className="text-[10px] text-[#636366]">120 chars</span>
                        </div>
                        <p className="text-[13px] text-[#1d1d1f] mb-2">{issue.suggestions.detailed}</p>
                        <button className="text-[12px] text-[#0071e3] hover:underline font-medium">
                          Use this instead
                        </button>
                      </div>

                      {/* Quick Tips */}
                      <div className="p-3 bg-[#f0f9ff] border border-[#0071e3]/20 rounded-[10px]">
                        <div className="text-[11px] font-semibold text-[#0071e3] mb-2 uppercase">💡 Quick Tips</div>
                        <div className="space-y-1 text-[12px] text-[#1d1d1f]">
                          <p>• Describe purpose & content</p>
                          <p>• Keep under 150 characters</p>
                          <p>• Avoid generic terms like "Table"</p>
                        </div>
                        <button 
                          onClick={() => toggleSection('full-tips')}
                          className="text-[11px] text-[#0071e3] hover:underline font-medium mt-2"
                        >
                          {expandedSections.has('full-tips') ? 'Hide examples' : 'See examples'}
                        </button>
                        
                        {expandedSections.has('full-tips') && (
                          <div className="mt-3 pt-3 border-t border-[#0071e3]/20 space-y-2 text-[11px]">
                            <div className="flex gap-2">
                              <span className="text-[#ff3b30]">✗</span>
                              <span>"Table" or "Data"</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-[#34c759]">✓</span>
                              <span>"Student enrollment by major for Fall 2024"</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-[#d2d2d7] flex items-center gap-3">
                <button className="flex-1 h-[44px] bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-[10px] font-semibold text-[15px] transition-colors">
                  Save & Close
                </button>
                <button className="px-6 h-[44px] text-[#636366] hover:text-[#1d1d1f] rounded-[10px] font-medium text-[15px] transition-colors">
                  Ignore
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer Notes */}
        <div className="mt-8 max-w-[700px] mx-auto">
          <div className="bg-white rounded-[12px] border border-[#d2d2d7] p-5">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-3">Design Comparison</h3>
            <div className="space-y-2 text-[13px] text-[#636366]">
              <p><strong className="text-[#1d1d1f]">Option 1 - Accordion:</strong> Traditional collapsible sections. Good for users who like control over what they see.</p>
              <p><strong className="text-[#1d1d1f]">Option 2 - Tabs:</strong> Organized into separate views. Reduces visual clutter but requires clicking between tabs.</p>
              <p><strong className="text-[#1d1d1f]">Option 3 - Compact Cards:</strong> Minimal initial view with expandable cards. Best for quick scanning.</p>
              <p><strong className="text-[#1d1d1f]">Option 4 - Progressive:</strong> Shows only the most important action first. Least overwhelming, most focused.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
