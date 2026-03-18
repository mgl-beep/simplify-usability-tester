import { useState, useEffect } from "react";
import { File, Folder, Image, FileText, Video, Music, Archive, Code, ChevronRight, Download, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { getCourse } from "../utils/api";
import { toast } from "sonner@2.0.3";

export interface CourseFile {
  name: string;
  path: string;
  size: number;
  type: string;
  modified?: string;
  isFolder?: boolean;
}

interface FilesViewProps {
  courseId: number;
  onDownload?: (file: CourseFile) => void;
  isImported?: boolean;
}

const getFileIcon = (fileName: string, isFolder: boolean) => {
  if (isFolder) return Folder;
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return Image;
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) return Video;
  if (['mp3', 'wav', 'ogg'].includes(ext || '')) return Music;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return Archive;
  if (['html', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'xml'].includes(ext || '')) return Code;
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return FileText;
  
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function FilesView({ courseId, onDownload, isImported }: FilesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load files for the course
  useEffect(() => {
    const loadFiles = async () => {
      setIsLoading(true);
      try {
        if (isImported) {
          // Load files from imported course in Supabase
          const response = await getCourse(courseId.toString());
          const fileList = response.course.metadata?.files || [];
          setFiles(fileList);
        } else {
          // For Canvas courses, show a message that files need to be accessed via Canvas
          // Canvas API has files, but for now we'll show empty state
          toast.info('Files from Canvas courses are not yet supported in SIMPLIFY');
          setFiles([]);
        }
      } catch (error) {
        console.error('Error loading files:', error);
        toast.error(`Error loading files: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setFiles([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFiles();
  }, [courseId, isImported]);
  
  // Organize files into folder structure
  const organizeFiles = (): { folders: Set<string>, files: CourseFile[] } => {
    const folders = new Set<string>();
    const currentFiles: CourseFile[] = [];
    
    files.forEach(file => {
      const parts = file.path.split('/');
      
      // If we're at root
      if (!currentPath) {
        // If file has a folder, add the folder
        if (parts.length > 1) {
          folders.add(parts[0]);
        } else {
          currentFiles.push(file);
        }
      } else {
        // We're inside a folder
        const pathParts = currentPath.split('/');
        const fileParts = file.path.split('/');
        
        // Check if file is in current path
        const isInCurrentPath = pathParts.every((part, i) => fileParts[i] === part);
        
        if (isInCurrentPath) {
          const remainingParts = fileParts.slice(pathParts.length);
          
          if (remainingParts.length > 1) {
            // There's a subfolder
            folders.add(remainingParts[0]);
          } else if (remainingParts.length === 1) {
            // It's a direct file
            currentFiles.push(file);
          }
        }
      }
    });
    
    return { folders, files: currentFiles };
  };
  
  const { folders, files: currentFiles } = organizeFiles();
  
  // Filter by search
  const filteredFiles = searchQuery
    ? currentFiles.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentFiles;
    
  const filteredFolders = searchQuery
    ? Array.from(folders).filter(folder =>
        folder.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : Array.from(folders);
  
  const breadcrumbs = currentPath ? currentPath.split('/') : [];
  
  const navigateToFolder = (folderName: string) => {
    setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
  };
  
  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentPath("");
    } else {
      const parts = currentPath.split('/');
      setCurrentPath(parts.slice(0, index + 1).join('/'));
    }
  };

  return (
    <div className="bg-white">
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-[#E5E5E5] border-t-[#0084ff] rounded-full animate-spin" />
          <p className="text-[14px] text-[#6B7780] mt-4">Loading files...</p>
        </div>
      ) : (
        <>
          {/* Search and Actions Bar */}
          <div className="border-b border-[#C7CDD1] px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 max-w-[400px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7780]" />
                <Input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-[36px] bg-white border-[#C7CDD1] text-[14px] focus-visible:ring-[#0084ff]"
                />
              </div>
            </div>
          </div>

          {/* Breadcrumbs */}
          {currentPath && (
            <div className="border-b border-[#C7CDD1] px-6 py-3 bg-[#F5F5F5]">
              <div className="flex items-center gap-2 text-[13px]">
                <button
                  onClick={() => navigateToBreadcrumb(-1)}
                  className="text-[#0084ff] hover:underline"
                >
                  Files
                </button>
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-[#6B7780]" />
                    <button
                      onClick={() => navigateToBreadcrumb(index)}
                      className={index === breadcrumbs.length - 1 
                        ? "text-[#2D3B45]" 
                        : "text-[#0084ff] hover:underline"
                      }
                    >
                      {crumb}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F5F5] border-b border-[#C7CDD1]">
                <tr>
                  <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#2D3B45] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#2D3B45] uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#2D3B45] uppercase tracking-wider">
                    Modified
                  </th>
                  <th className="px-6 py-3 text-right text-[12px] font-semibold text-[#2D3B45] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C7CDD1]">
                {/* Folders */}
                {filteredFolders.map((folder) => {
                  const Icon = Folder;
                  return (
                    <tr
                      key={folder}
                      onClick={() => navigateToFolder(folder)}
                      className="hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-[#0084ff]" strokeWidth={2} />
                          <span className="text-[14px] text-[#2D3B45] font-medium">{folder}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-[#6B7780]">—</td>
                      <td className="px-6 py-4 text-[14px] text-[#6B7780]">—</td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  );
                })}
                
                {/* Files */}
                {filteredFiles.map((file) => {
                  const Icon = getFileIcon(file.name, false);
                  return (
                    <tr key={file.path} className="hover:bg-[#F5F5F5] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-[#6B7780]" strokeWidth={2} />
                          <span className="text-[14px] text-[#2D3B45]">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-[#6B7780]">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 text-[14px] text-[#6B7780]">
                        {formatDate(file.modified)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {onDownload && (
                          <Button
                            onClick={() => onDownload(file)}
                            variant="ghost"
                            size="sm"
                            className="h-[28px] px-3 text-[13px] text-[#0084ff] hover:text-[#0077ed] hover:bg-[#0084ff]/10"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                
                {/* Empty State */}
                {filteredFolders.length === 0 && filteredFiles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <File className="w-16 h-16 text-[#C7CDD1] mx-auto mb-4" strokeWidth={1.5} />
                      <p className="text-[16px] text-[#6B7780] mb-2">
                        {searchQuery ? "No files found" : "This folder is empty"}
                      </p>
                      {searchQuery && (
                        <p className="text-[13px] text-[#6B7780]">
                          Try a different search term
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          <div className="border-t border-[#C7CDD1] px-6 py-3 bg-[#F5F5F5]">
            <p className="text-[12px] text-[#6B7780]">
              {filteredFolders.length + filteredFiles.length} item{filteredFolders.length + filteredFiles.length !== 1 ? 's' : ''}
              {searchQuery && ` (filtered from ${folders.size + currentFiles.length} total)`}
            </p>
          </div>
        </>
      )}
    </div>
  );
}