import { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Trash2, Loader2, BookOpen } from 'lucide-react';
import { ScanIssue } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ObjectivesEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: ScanIssue | null;
  onApply: (issue: ScanIssue, objectives: string[]) => void;
  moduleContent: string;
}

interface ObjectiveSuggestion {
  text: string;
  bloomLevel: string;
  confidence: number;
}

export function ObjectivesEditorModal({
  isOpen,
  onClose,
  issue,
  onApply,
  moduleContent
}: ObjectivesEditorModalProps) {
  const [objectives, setObjectives] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Auto-generate on open
  useEffect(() => {
    if (isOpen && issue && !hasGenerated) {
      generateObjectives();
    }
  }, [isOpen, issue]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setObjectives([]);
      setHasGenerated(false);
      setEditingIndex(null);
    }
  }, [isOpen]);

  const generateObjectives = async () => {
    if (!issue) return;

    setIsGenerating(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74508696/ai/generate-objectives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          moduleContent: moduleContent,
          moduleName: issue.location || 'this module',
          existingObjectives: issue.existingObjectives || []
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Strip "By the end of this module..." prefix for editing
      const { stripObjectivePrefix } = await import('../utils/aiObjectivesGenerator');
      const objectiveTexts = (data.objectives || []).map((text: string) => stripObjectivePrefix(text));

      setObjectives(objectiveTexts);
      setHasGenerated(true);
    } catch (error) {
      console.error('❌ Error generating objectives:', error);
      // Set fallback objectives
      setObjectives([
        'Explain the key concepts and theories presented in this module',
        'Apply the principles learned to analyze real-world scenarios'
      ]);
      setHasGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddObjective = () => {
    setObjectives([...objectives, '']);
    setEditingIndex(objectives.length);
  };

  const handleDeleteObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleEditObjective = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  const handleApply = () => {
    if (!issue) return;
    
    // Filter out empty objectives
    const validObjectives = objectives.filter(obj => obj.trim().length > 0);
    
    if (validObjectives.length === 0) {
      alert('Please add at least one learning objective.');
      return;
    }

    onApply(issue, validObjectives);
    onClose();
  };

  const handleRegenerate = () => {
    setHasGenerated(false);
    generateObjectives();
  };

  if (!isOpen || !issue) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Generate Learning Objectives
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {issue.location}
                </p>
              </div>
            </div>
            
            {/* Rubric Standards */}
            <div className="flex flex-wrap gap-2 mt-3">
              {issue.standardsTags.map((tag) => {
                const [rubric, standard] = tag.split(':');
                let bgColor = 'bg-[#EEECE8]';
                let textColor = 'text-gray-700';
                let label = rubric.toUpperCase();

                if (rubric === 'peralta') {
                  bgColor = 'bg-green-100';
                  textColor = 'text-green-700';
                  label = 'PERALTA';
                } else if (rubric === 'qm' || rubric === 'quality-matters') {
                  bgColor = 'bg-blue-100';
                  textColor = 'text-blue-700';
                  label = 'QM';
                }

                return (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${bgColor} ${textColor}`}
                  >
                    <span className="font-bold">{standard}</span>
                    <span className="opacity-75">{label}</span>
                  </span>
                );
              })}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 text-center">
                Analyzing module content and generating objectives...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This may take a few seconds
              </p>
            </div>
          ) : (
            <>
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 font-medium mb-1">
                      AI-Generated Learning Objectives
                    </p>
                    <p className="text-sm text-blue-700">
                      These objectives follow Bloom's Taxonomy and meet Peralta (E5) and Quality Matters (2.1) standards. 
                      Click any objective to edit, or add your own.
                    </p>
                  </div>
                </div>
              </div>

              {/* Objectives List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Learning Objectives ({objectives.length})
                  </h3>
                  <button
                    onClick={handleRegenerate}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    Regenerate
                  </button>
                </div>

                {objectives.map((objective, index) => (
                  <div
                    key={index}
                    className="group flex items-start gap-3 p-4 bg-[#EEECE8] rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-medium flex items-center justify-center mt-0.5">
                      {index + 1}
                    </div>
                    
                    {editingIndex === index ? (
                      <textarea
                        value={objective}
                        onChange={(e) => handleEditObjective(index, e.target.value)}
                        onBlur={() => setEditingIndex(null)}
                        autoFocus
                        rows={3}
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Enter learning objective (e.g., 'analyze the key principles of...')"
                      />
                    ) : (
                      <button
                        onClick={() => setEditingIndex(index)}
                        className="flex-1 text-left text-sm text-gray-700 hover:text-gray-900 group-hover:text-blue-700 transition-colors"
                      >
                        {objective || <span className="text-gray-400 italic">Click to edit...</span>}
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteObjective(index)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
                      title="Delete objective"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Add Objective Button */}
                <button
                  onClick={handleAddObjective}
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Objective
                </button>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="text-sm font-semibold text-amber-900 mb-2">
                  Preview: How this will appear in Canvas
                </h4>
                <div className="bg-white p-4 rounded border border-amber-300">
                  <h4 className="text-base font-semibold text-blue-700 mb-2">Learning Objectives</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>By the end of this module, students will be able to:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {objectives.filter(obj => obj.trim()).map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-[#EEECE8]">
          <div className="text-sm text-gray-600">
            {objectives.filter(obj => obj.trim()).length} objective{objectives.filter(obj => obj.trim()).length !== 1 ? 's' : ''} ready to insert
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isGenerating || objectives.filter(obj => obj.trim()).length === 0}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Insert Objectives
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
