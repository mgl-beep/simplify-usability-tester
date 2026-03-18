import { X, Download, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { getCanvasDomain } from '../utils/canvasAPI';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface FileViewerProps {
  fileId: number;
  courseId: number;
  fileName: string;
  onClose: () => void;
}

export function FileViewer({ fileId, courseId, fileName, onClose }: FileViewerProps) {
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  const isPdf = fileExtension === 'pdf';
  
  // Add loading state and fetch file with Canvas token
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const domain = getCanvasDomain();
        
        if (!domain) {
          setError('Canvas domain not found');
          setIsLoading(false);
          return;
        }

        // Try multiple token keys for compatibility
        const token = localStorage.getItem('canvas_access_token') || 
                     localStorage.getItem('canvas_token');
        
        if (!token) {
          setError('Canvas authentication required');
          setIsLoading(false);
          return;
        }

        // Use the backend proxy to get file metadata
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74508696/canvas/file`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            domain,
            accessToken: token,
            fileId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to fetch file: ${response.status}`);
        }

        const data = await response.json();
        const downloadUrl = data.file.url;
        
        // Now fetch the actual file content
        const fileResponse = await fetch(downloadUrl);

        if (!fileResponse.ok) {
          throw new Error(`Failed to download file: ${fileResponse.status} ${fileResponse.statusText}`);
        }

        const blob = await fileResponse.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setIsLoading(false);
      } catch (err) {
        console.error('❌ Error loading file:', err);
        setError(err instanceof Error ? err.message : 'Failed to load file');
        setIsLoading(false);
      }
    };

    fetchFile();

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [fileId, courseId]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-[1200px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C7CDD1]">
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-semibold text-[#2D3B45] truncate">{fileName}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center transition-colors ml-4"
          >
            <X className="w-5 h-5 text-[#636366]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="bg-[#EEECE8] rounded-full p-6 mb-4">
                <Download className="w-12 h-12 text-[#0084ff]" />
              </div>
              <h3 className="text-[20px] font-semibold text-[#2D3B45] mb-2">
                {fileName}
              </h3>
              <p className="text-[14px] text-[#6B7780] mb-6 max-w-md">
                Loading file...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="bg-[#EEECE8] rounded-full p-6 mb-4">
                <Download className="w-12 h-12 text-[#0084ff]" />
              </div>
              <h3 className="text-[20px] font-semibold text-[#2D3B45] mb-2">
                {fileName}
              </h3>
              <p className="text-[14px] text-[#6B7780] mb-6 max-w-md">
                {error}
              </p>
            </div>
          ) : isPdf ? (
            // PDF Viewer using iframe
            <iframe
              src={`${blobUrl}#view=FitH`}
              className="w-full h-full border-0"
              title={fileName}
            />
          ) : (
            // For other file types, show download option
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="bg-[#EEECE8] rounded-full p-6 mb-4">
                <Download className="w-12 h-12 text-[#0084ff]" />
              </div>
              <h3 className="text-[20px] font-semibold text-[#2D3B45] mb-2">
                {fileName}
              </h3>
              <p className="text-[14px] text-[#6B7780] mb-6 max-w-md">
                This file type cannot be previewed in Simplify. Click below to download or open in Canvas.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (blobUrl) {
                      const a = document.createElement('a');
                      a.href = blobUrl;
                      a.download = fileName;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }
                  }}
                  className="bg-[#0084ff] hover:bg-[#0077ed] text-white h-[40px] px-6 rounded-md"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}