import { X, ExternalLink, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { getCanvasDomain } from '../utils/canvasAPI';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DiscussionViewerProps {
  courseId: number;
  discussionId: number;
  discussionTitle: string;
  onClose: () => void;
}

interface Discussion {
  id: number;
  title: string;
  message: string;
  posted_at: string;
  author?: {
    display_name: string;
  };
  html_url: string;
}

export function DiscussionViewer({ courseId, discussionId, discussionTitle, onClose }: DiscussionViewerProps) {
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDiscussion = async () => {
      try {
        const domain = getCanvasDomain();
        
        if (!domain) {
          toast.error('Canvas domain not found');
          setIsLoading(false);
          return;
        }

        // Try multiple token keys for compatibility
        const token = localStorage.getItem('canvas_access_token') || 
                     localStorage.getItem('canvas_token');
        
        if (!token) {
          toast.error('Canvas token not found. Please reconnect to Canvas.');
          setIsLoading(false);
          return;
        }

        // Use the backend proxy to get discussion
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74508696/canvas/discussion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            domain,
            accessToken: token,
            courseId,
            discussionId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to load discussion: ${response.status}`);
        }

        const data = await response.json();
        setDiscussion(data.discussion);
      } catch (error) {
        console.error('❌ Error loading discussion:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load discussion');
      } finally {
        setIsLoading(false);
      }
    };

    loadDiscussion();
  }, [courseId, discussionId]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-[900px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C7CDD1]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <MessageSquare className="w-5 h-5 text-[#0084ff] flex-shrink-0" />
            <h2 className="text-[18px] font-semibold text-[#2D3B45] truncate">{discussionTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center transition-colors ml-4"
          >
            <X className="w-5 h-5 text-[#636366]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-[#E5E5E5] border-t-[#0084ff] rounded-full animate-spin mb-4" />
                <p className="text-[14px] text-[#6B7780]">Loading discussion...</p>
              </div>
            </div>
          ) : discussion ? (
            <div className="p-6">
              {/* Discussion metadata */}
              {discussion.author && (
                <div className="mb-4 pb-4 border-b border-[#E5E5E5]">
                  <p className="text-[13px] text-[#6B7780]">
                    Posted by <span className="font-semibold text-[#2D3B45]">{discussion.author.display_name}</span>
                    {discussion.posted_at && (
                      <span> • {new Date(discussion.posted_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}</span>
                    )}
                  </p>
                </div>
              )}

              {/* Discussion content */}
              <div 
                className="canvas-content"
                dangerouslySetInnerHTML={{ __html: discussion.message || '<p class="text-[#6B7780]">No content available</p>' }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-[#C7CDD1] mx-auto mb-4" />
                <p className="text-[16px] text-[#6B7780]">Discussion not found</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}