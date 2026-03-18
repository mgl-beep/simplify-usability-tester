import React, { useEffect, useState } from 'react';
import { X, Calendar, Award, Clock, CheckCircle2 } from 'lucide-react';
import { CanvasAssignment, getAssignment, getCanvasConfig } from '../utils/canvasAPI';

interface AssignmentViewerProps {
  courseId: number;
  assignmentId: number;
  assignmentName: string;
  onClose: () => void;
}

export function AssignmentViewer({ courseId, assignmentId, assignmentName, onClose }: AssignmentViewerProps) {
  const [assignment, setAssignment] = useState<CanvasAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssignment() {
      try {
        setLoading(true);
        setError(null);
        
        const config = getCanvasConfig();
        if (!config) {
          setError('Not connected to Canvas');
          return;
        }
        
        const data = await getAssignment(config, courseId, assignmentId);
        
        setAssignment(data);
      } catch (err: any) {
        console.error('❌ Error fetching assignment:', err);
        console.error('❌ Error stack:', err.stack);
        
        // Provide more helpful error messages
        let errorMessage = 'Failed to load assignment';
        if (err.message?.includes('Not Found') || err.message?.includes('404')) {
          errorMessage = 'Assignment not found. It may have been deleted or is not published.';
        } else if (err.message?.includes('Unauthorized') || err.message?.includes('401')) {
          errorMessage = 'You do not have permission to view this assignment.';
        } else if (err.message?.includes('Canvas API error')) {
          errorMessage = err.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignment();
  }, [courseId, assignmentId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white my-8 rounded-lg shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-semibold text-gray-900">{assignmentName}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {assignment && (
            <div className="space-y-6">
              {/* Assignment Details Card */}
              <div className="bg-[#EEECE8] border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Due Date */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-gray-700">Due</div>
                      <div className="text-sm text-gray-900">{formatDate(assignment.due_at)}</div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-gray-700">Points</div>
                      <div className="text-sm text-gray-900">
                        {assignment.points_possible || 0}
                      </div>
                    </div>
                  </div>

                  {/* Available */}
                  {assignment.unlock_at && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-gray-700">Available from</div>
                        <div className="text-sm text-gray-900">{formatDate(assignment.unlock_at)}</div>
                      </div>
                    </div>
                  )}

                  {/* Available Until */}
                  {assignment.lock_at && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-gray-700">Available until</div>
                        <div className="text-sm text-gray-900">{formatDate(assignment.lock_at)}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submission Types */}
                {assignment.submission_types && assignment.submission_types.length > 0 && (
                  <div className="pt-3 border-t border-gray-300">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Submission Types</div>
                    <div className="text-sm text-gray-900">
                      {assignment.submission_types
                        .map(type => type.replace(/_/g, ' '))
                        .join(', ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Assignment Description */}
              {assignment.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <div 
                    className="canvas-content"
                    dangerouslySetInnerHTML={{ __html: assignment.description }}
                  />
                </div>
              )}

              {/* Rubric */}
              {assignment.rubric && assignment.rubric.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Rubric</h3>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#EEECE8]">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                            Criteria
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                            Ratings
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                            Points
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {assignment.rubric.map((criterion: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div className="font-medium">{criterion.description}</div>
                              {criterion.long_description && (
                                <div className="mt-1 text-gray-600 text-xs">
                                  {criterion.long_description}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {criterion.ratings && criterion.ratings.length > 0 && (
                                <div className="space-y-1">
                                  {criterion.ratings.map((rating: any, rIdx: number) => (
                                    <div key={rIdx} className="text-xs">
                                      <span className="font-medium text-gray-900">
                                        {rating.description}
                                      </span>
                                      {' - '}
                                      <span className="text-gray-600">{rating.points} pts</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                              {criterion.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}