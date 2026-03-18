import React, { useEffect, useState } from 'react';
import { X, FileText } from 'lucide-react';
import { CanvasPage, getPage, getCanvasConfig } from '../utils/canvasAPI';
import { getCourse } from '../utils/api';

interface PageViewerProps {
  courseId: number;
  pageUrl: string;
  pageTitle: string;
  onClose: () => void;
  isImported?: boolean;
  originalCourseId?: string;
}

export function PageViewer({ courseId, pageUrl, pageTitle, onClose, isImported, originalCourseId }: PageViewerProps) {
  const [page, setPage] = useState<CanvasPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      try {
        setLoading(true);
        setError(null);
        
        // Check if this is an imported course
        if (isImported === true) {
          const deleteId = originalCourseId || courseId.toString();
          const response = await getCourse(deleteId);
          
          // Find the page by URL/identifier
          const foundPage = response.course?.courseData?.pages?.find((p: any) => 
            p.identifier === pageUrl || 
            p.url === pageUrl ||
            p.identifier.includes(pageUrl) ||
            pageUrl.includes(p.identifier)
          );
          
          if (foundPage) {
            setPage({
              url: foundPage.url,
              title: foundPage.title,
              body: foundPage.body,
              created_at: '',
              updated_at: '',
              published: true,
              front_page: false,
              page_id: 0
            });
          } else {
            setError('Page not found in imported course');
          }
        } else {
          const config = getCanvasConfig();
          if (!config) {
            setError('Not connected to Canvas');
            return;
          }
          
          const data = await getPage(config, courseId, pageUrl);
          
          setPage(data);
        }
      } catch (err: any) {
        console.error('❌ Error fetching page:', err);
        console.error('❌ Error stack:', err.stack);
        
        // Provide more helpful error messages
        let errorMessage = 'Failed to load page';
        if (err.message?.includes('Not Found') || err.message?.includes('404')) {
          errorMessage = 'Page not found. It may have been deleted or is not published.';
        } else if (err.message?.includes('Unauthorized') || err.message?.includes('401')) {
          errorMessage = 'You do not have permission to view this page.';
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

    fetchPage();
  }, [courseId, pageUrl, isImported, originalCourseId]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white my-8 rounded-lg shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-semibold text-gray-900">{pageTitle}</h2>
          </div>
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

          {page && (
            <div>
              {/* Page Content */}
              {page.body ? (
                <div 
                  className="canvas-content prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: page.body }}
                />
              ) : (
                <div className="text-gray-500 text-center py-8">
                  This page has no content.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}