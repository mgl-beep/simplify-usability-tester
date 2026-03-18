import { X, Upload, FileText, Image, Video, File, Loader2, CheckCircle2, Trash2, FolderOpen, BookOpen, FileCode } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { parseManifestXML, type ParsedCourse } from "../utils/manifestParser";

interface UploadedFile {
  id: string;
  file: File;
  type: "html" | "pdf" | "image" | "video" | "document" | "manifest" | "other";
  status: "pending" | "processing" | "complete";
}

interface CourseUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

const getFileType = (file: File): UploadedFile["type"] => {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "html" || ext === "htm") return "html";
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext || "")) return "image";
  if (["mp4", "mov", "avi", "webm"].includes(ext || "")) return "video";
  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext || "")) return "document";
  if (ext === "xml") return "manifest";
  return "other";
};

const getFileIcon = (type: UploadedFile["type"]) => {
  switch (type) {
    case "html":
      return FileText;
    case "pdf":
      return FileText;
    case "image":
      return Image;
    case "video":
      return Video;
    case "document":
      return FileText;
    case "manifest":
      return BookOpen;
    default:
      return File;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

export function CourseUploadModal({ isOpen, onClose, onUploadComplete }: CourseUploadModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      type: getFileType(file),
      status: "pending"
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const processFiles = () => {
    setIsProcessing(true);
    
    // Simulate processing each file
    uploadedFiles.forEach((file, index) => {
      setTimeout(() => {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );
        
        setTimeout(() => {
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === file.id ? { ...f, status: "complete" } : f
            )
          );
          
          // Check if all files are complete
          if (index === uploadedFiles.length - 1) {
            setTimeout(() => {
              setIsProcessing(false);
              setUploadComplete(true);
            }, 500);
          }
        }, 1000);
      }, index * 800);
    });
  };

  const handleImportCourse = () => {
    onUploadComplete?.();
    onClose();
    // Reset state
    setTimeout(() => {
      setUploadedFiles([]);
      setUploadComplete(false);
      setIsProcessing(false);
    }, 300);
  };

  const handleCloseModal = () => {
    onClose();
    // Reset state after animation
    setTimeout(() => {
      setUploadedFiles([]);
      setUploadComplete(false);
      setIsProcessing(false);
    }, 300);
  };

  const totalSize = uploadedFiles.reduce((acc, f) => acc + f.file.size, 0);
  const completeCount = uploadedFiles.filter(f => f.status === "complete").length;

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-[700px] p-0 gap-0 bg-white rounded-[16px] border-[#d2d2d7] overflow-hidden">
        <DialogTitle className="sr-only">Upload Course Files</DialogTitle>
        <DialogDescription className="sr-only">
          Upload multiple course files to import into Simplify
        </DialogDescription>
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#d2d2d7] flex items-center justify-between">
          <div>
            <h2 className="text-[24px] tracking-tight text-[#1d1d1f] mb-1">Upload Course Files</h2>
            <p className="text-[13px] text-[#636366]">
              {uploadComplete 
                ? `${uploadedFiles.length} files ready to import`
                : "Select or drag multiple files to import your course"}
            </p>
          </div>
          <button
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-[#636366]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[500px]">
          <div className="p-8">
            {uploadedFiles.length === 0 ? (
              /* Upload Area */
              <div>
                <input
                  type="file"
                  id="course-files-upload"
                  multiple
                  accept=".html,.htm,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.svg,.mp4,.mov,.avi,.webm,.txt,.zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="course-files-upload"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-full p-12 border-2 border-dashed rounded-[16px] transition-all cursor-pointer flex flex-col items-center gap-4 group ${
                    isDragging
                      ? "border-[#0071e3] bg-[#0071e3]/10"
                      : "border-[#d2d2d7] hover:border-[#0071e3] hover:bg-[#0071e3]/5"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                    isDragging
                      ? "bg-[#0071e3]/20"
                      : "bg-[#EEECE8] group-hover:bg-[#0071e3]/10"
                  }`}>
                    <Upload className={`w-8 h-8 transition-colors ${
                      isDragging
                        ? "text-[#0071e3]"
                        : "text-[#636366] group-hover:text-[#0071e3]"
                    }`} strokeWidth={1.5} />
                  </div>
                  <div className="text-center">
                    <p className={`text-[17px] mb-2 transition-colors ${
                      isDragging
                        ? "text-[#0071e3]"
                        : "text-[#1d1d1f] group-hover:text-[#0071e3]"
                    }`}>
                      {isDragging ? "Drop files here" : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-[13px] text-[#636366] mb-3">
                      Select multiple files from your course export
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 text-[11px] text-[#636366]">
                      <span className="px-2 py-1 bg-[#EEECE8] rounded-md">HTML</span>
                      <span className="px-2 py-1 bg-[#EEECE8] rounded-md">PDF</span>
                      <span className="px-2 py-1 bg-[#EEECE8] rounded-md">Images</span>
                      <span className="px-2 py-1 bg-[#EEECE8] rounded-md">Videos</span>
                      <span className="px-2 py-1 bg-[#EEECE8] rounded-md">Documents</span>
                      <span className="px-2 py-1 bg-[#EEECE8] rounded-md">ZIP</span>
                    </div>
                  </div>
                </label>

                {/* Quick Info */}
                <div className="mt-6 p-4 bg-[#EEECE8] rounded-[12px]">
                  <div className="flex items-start gap-3">
                    <FolderOpen className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="text-[13px] text-[#1d1d1f] mb-1">Importing from Canvas?</p>
                      <p className="text-[12px] text-[#636366] leading-relaxed">
                        Export your course from Canvas (Settings → Export Course Content), then upload the entire exported package here. Simplify will automatically organize pages, modules, and resources.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Files List */
              <div>
                {/* Files Summary */}
                <div className="mb-6 p-5 bg-[#EEECE8] rounded-[12px]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[15px] text-[#1d1d1f]">
                        {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""} selected
                      </p>
                      <p className="text-[12px] text-[#636366]">
                        Total size: {formatFileSize(totalSize)}
                      </p>
                    </div>
                    {isProcessing && (
                      <div className="text-right">
                        <p className="text-[13px] text-[#0071e3] mb-1">Processing...</p>
                        <p className="text-[11px] text-[#636366]">
                          {completeCount} of {uploadedFiles.length} complete
                        </p>
                      </div>
                    )}
                    {uploadComplete && (
                      <div className="flex items-center gap-2 text-[#34c759]">
                        <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
                        <span className="text-[13px]">Ready to import</span>
                      </div>
                    )}
                  </div>
                  
                  {isProcessing && (
                    <div className="w-full h-1.5 bg-[#d2d2d7] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#0071e3]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(completeCount / uploadedFiles.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>

                {/* Files Grid */}
                <div className="space-y-2 mb-6">
                  <AnimatePresence>
                    {uploadedFiles.map((file, index) => {
                      const Icon = getFileIcon(file.type);
                      return (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-4 bg-white border border-[#d2d2d7] rounded-[12px] hover:border-[#0071e3] transition-colors group"
                        >
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            file.status === "complete"
                              ? "bg-[#34c759]/10"
                              : file.status === "processing"
                              ? "bg-[#0071e3]/10"
                              : "bg-[#EEECE8]"
                          }`}>
                            {file.status === "complete" ? (
                              <CheckCircle2 className="w-5 h-5 text-[#34c759]" strokeWidth={2} />
                            ) : file.status === "processing" ? (
                              <Loader2 className="w-5 h-5 text-[#0071e3] animate-spin" strokeWidth={1.5} />
                            ) : (
                              <Icon className="w-5 h-5 text-[#636366]" strokeWidth={1.5} />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] text-[#1d1d1f] truncate">
                              {file.file.name}
                            </p>
                            <p className="text-[12px] text-[#636366]">
                              {formatFileSize(file.file.size)} • {file.type}
                            </p>
                          </div>

                          {/* Delete Button */}
                          {!isProcessing && !uploadComplete && (
                            <button
                              onClick={() => removeFile(file.id)}
                              className="w-8 h-8 rounded-lg hover:bg-[#f5f5f7] flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4 text-[#ff3b30]" strokeWidth={1.5} />
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Add More Files */}
                {!isProcessing && !uploadComplete && (
                  <div>
                    <input
                      type="file"
                      id="course-files-add-more"
                      multiple
                      accept=".html,.htm,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.svg,.mp4,.mov,.avi,.webm,.txt,.zip"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="course-files-add-more"
                      className="w-full p-4 border-2 border-dashed border-[#d2d2d7] rounded-[12px] hover:border-[#0071e3] hover:bg-[#0071e3]/5 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                    >
                      <Upload className="w-4 h-4 text-[#636366] group-hover:text-[#0071e3]" strokeWidth={1.5} />
                      <span className="text-[13px] text-[#636366] group-hover:text-[#0071e3]">
                        Add more files
                      </span>
                    </label>
                  </div>
                )}

                {/* Detected Content Preview */}
                {uploadComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-5 bg-[#0071e3]/5 border border-[#0071e3]/20 rounded-[12px]"
                  >
                    <h3 className="text-[15px] text-[#1d1d1f] mb-3">Detected Course Content</h3>
                    <div className="space-y-2 text-[13px] text-[#636366]">
                      <div className="flex items-center justify-between">
                        <span>• HTML Pages</span>
                        <span className="text-[#1d1d1f]">
                          {uploadedFiles.filter(f => f.type === "html").length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>• PDF Documents</span>
                        <span className="text-[#1d1d1f]">
                          {uploadedFiles.filter(f => f.type === "pdf").length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>• Images</span>
                        <span className="text-[#1d1d1f]">
                          {uploadedFiles.filter(f => f.type === "image").length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>• Videos</span>
                        <span className="text-[#1d1d1f]">
                          {uploadedFiles.filter(f => f.type === "video").length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>• Other Files</span>
                        <span className="text-[#1d1d1f]">
                          {uploadedFiles.filter(f => f.type === "document" || f.type === "other").length}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {uploadedFiles.length > 0 && (
          <div className="px-8 py-5 border-t border-[#d2d2d7] bg-[#EEECE8] flex items-center justify-between">
            {!uploadComplete ? (
              <>
                <Button
                  onClick={handleCloseModal}
                  variant="outline"
                  className="h-[40px] px-5 rounded-[10px] border-[#d2d2d7]"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={processFiles}
                  className="bg-[#0071e3] hover:bg-[#0077ed] text-white h-[40px] px-6 rounded-[10px]"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                      Processing...
                    </span>
                  ) : (
                    `Process ${uploadedFiles.length} File${uploadedFiles.length !== 1 ? "s" : ""}`
                  )}
                </Button>
              </>
            ) : (
              <>
                <p className="text-[12px] text-[#636366]">
                  Course files are ready to be imported
                </p>
                <Button
                  onClick={handleImportCourse}
                  className="bg-[#34c759] hover:bg-[#30b350] text-white h-[40px] px-6 rounded-[10px]"
                >
                  Import Course
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}