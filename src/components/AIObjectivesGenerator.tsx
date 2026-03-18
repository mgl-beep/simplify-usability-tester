import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';

interface AIObjectivesGeneratorProps {
  moduleTitle: string;
  moduleItems: string[];
  onGenerate: (objectives: string[]) => void;
  onCancel: () => void;
  isGenerating?: boolean;
}

export function AIObjectivesGenerator({
  moduleTitle,
  moduleItems,
  onGenerate,
  onCancel,
  isGenerating = false
}: AIObjectivesGeneratorProps) {
  const [phase, setPhase] = useState<'generating' | 'preview' | 'complete'>('generating');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // Call the API to generate objectives using AI
  const generateObjectives = async () => {
    setPhase('generating');
    
    try {
      // Prepare module content string for API
      const moduleContent = `MODULE: ${moduleTitle}\n\n` + moduleItems.map(item => `ITEM: ${item}`).join('\n\n');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74508696/generate-learning-objectives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ 
          moduleContent, 
          courseName: 'Course' // Could be passed as prop if available
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate objectives');
      }

      const data = await response.json();
      
      if (data.success && data.objectives) {
        // Extract text from objectives (API returns objects with text, bloomsLevel, actionVerb)
        const objectiveTexts = data.objectives.map((obj: any) => {
          // If it's already a string, use it directly
          if (typeof obj === 'string') return obj;
          // Otherwise extract the text property
          return obj.text || '';
        }).filter(Boolean);
        
        setObjectives(objectiveTexts);
        setPhase('preview');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating objectives:', error);
      
      // Fallback to demo objectives if API fails
      const fallbackObjectives = [
        `Explain the key concepts covered in ${moduleTitle}`,
        `Apply knowledge from ${moduleTitle} to solve relevant problems`,
        `Analyze the relationships between different components of ${moduleTitle}`,
        `Evaluate different approaches presented in ${moduleTitle}`
      ];
      
      setObjectives(fallbackObjectives);
      setPhase('preview');
      
      toast.error('AI generation unavailable, using fallback objectives. Please review and edit as needed.');
    }
  };

  // Start generation on mount
  useEffect(() => {
    generateObjectives();
  }, []);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(objectives[index]);
  };

  const handleSaveEdit = (index: number) => {
    const updated = [...objectives];
    updated[index] = editText;
    setObjectives(updated);
    setEditingIndex(null);
  };

  const handleAddObjective = () => {
    setObjectives([...objectives, 'New learning objective']);
    setEditingIndex(objectives.length);
    setEditText('New learning objective');
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    setPhase('complete');
    setTimeout(() => {
      onGenerate(objectives);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[16px] shadow-2xl max-w-[700px] w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e5e5ea]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0071e3] to-[#0077ed] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-[#1d1d1f]">
                AI Learning Objectives Generator
              </h2>
              <p className="text-[13px] text-[#636366] mt-0.5">
                Aligned with CVC-OEI A1-A3, Peralta E5, QM 2.1
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(80vh-180px)]">
          <AnimatePresence mode="wait">
            {/* Phase 1: Generating */}
            {phase === 'generating' && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-[#0071e3]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-[#0071e3] animate-spin" strokeWidth={2} />
                </div>
                <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-2">
                  Analyzing Module Content
                </h3>
                <p className="text-[14px] text-[#636366] mb-6">
                  Reviewing {moduleItems.length} items in "{moduleTitle}"
                </p>
                <div className="bg-[#f5f5f7] rounded-[8px] p-3 text-left max-w-[500px] mx-auto">
                  <p className="text-[12px] text-[#636366] font-medium mb-2">ANALYZING:</p>
                  <div className="space-y-1">
                    {moduleItems.slice(0, 3).map((item, i) => (
                      <div key={i} className="text-[13px] text-[#1d1d1f] flex items-center gap-2">
                        <div className="w-1 h-1 bg-[#0071e3] rounded-full" />
                        {item.length > 60 ? item.substring(0, 60) + '...' : item}
                      </div>
                    ))}
                    {moduleItems.length > 3 && (
                      <div className="text-[13px] text-[#636366] italic">
                        +{moduleItems.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase 2: Preview & Edit */}
            {phase === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-4">
                  <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">
                    Generated Learning Objectives
                  </h3>
                  <p className="text-[13px] text-[#636366]">
                    Review and edit objectives before applying. Click any objective to edit.
                  </p>
                </div>

                {/* Objectives List */}
                <div className="space-y-3 mb-4">
                  {objectives.map((objective, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-[#f5f5f7] rounded-[8px] p-3 hover:bg-[#e8e8ed] transition-colors group"
                    >
                      {editingIndex === index ? (
                        <div className="space-y-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-2 text-[13px] border border-[#d2d2d7] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0071e3] resize-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveEdit(index)}
                              className="px-3 py-1.5 bg-[#0071e3] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#0077ed]"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="px-3 py-1.5 bg-white text-[#636366] text-[12px] font-medium rounded-[6px] border border-[#d2d2d7] hover:bg-[#f5f5f7]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-[#0071e3] text-white rounded-full flex items-center justify-center text-[12px] font-semibold mt-0.5">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-[13px] text-[#1d1d1f] leading-relaxed">
                              {objective}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(index)}
                              className="p-1.5 hover:bg-white rounded-[6px] transition-colors"
                              title="Edit objective"
                            >
                              <Edit3 className="w-4 h-4 text-[#0071e3]" strokeWidth={2} />
                            </button>
                            {objectives.length > 1 && (
                              <button
                                onClick={() => handleRemoveObjective(index)}
                                className="p-1.5 hover:bg-white rounded-[6px] transition-colors"
                                title="Remove objective"
                              >
                                <AlertCircle className="w-4 h-4 text-[#ff3b30]" strokeWidth={2} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Add Objective Button */}
                <button
                  onClick={handleAddObjective}
                  className="w-full py-2.5 border-2 border-dashed border-[#d2d2d7] rounded-[8px] text-[13px] text-[#636366] hover:border-[#0071e3] hover:text-[#0071e3] hover:bg-[#0071e3]/5 transition-colors font-medium"
                >
                  + Add Another Objective
                </button>

                {/* Format Preview */}
                <div className="mt-5 p-4 bg-[#EEECE8] rounded-[8px] border border-[#e5e5ea]">
                  <p className="text-[12px] text-[#636366] font-medium mb-2">PREVIEW:</p>
                  <div className="text-[13px] text-[#1d1d1f] leading-relaxed space-y-2">
                    <p className="font-semibold">Learning Objectives</p>
                    <p>By the end of this module, students will be able to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      {objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase 3: Complete */}
            {phase === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-[#34c759]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#34c759]" strokeWidth={2} />
                </div>
                <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-2">
                  Objectives Generated!
                </h3>
                <p className="text-[14px] text-[#636366]">
                  Adding to module description...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {phase === 'preview' && (
          <div className="px-6 py-4 border-t border-[#e5e5ea] flex items-center justify-between">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-[14px] text-[#636366] hover:text-[#1d1d1f] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={objectives.length === 0}
              className="px-6 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[14px] font-semibold rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
              Apply Objectives
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}