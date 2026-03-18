import { useState } from "react";
import { X, Upload } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";

interface ImportCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (courseName: string, courseCode: string, file: File | null) => void;
}

export function ImportCourseModal({ isOpen, onClose, onImport }: ImportCourseModalProps) {
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.imscc') || file.name.endsWith('.zip')) {
        setSelectedFile(file);
        toast.success(`Selected: ${file.name}`);
      } else {
        toast.error("Please select a .imscc or .zip file");
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.name.endsWith('.imscc') || file.name.endsWith('.zip')) {
        setSelectedFile(file);
        toast.success(`Selected: ${file.name}`);
      } else {
        toast.error("Please select a .imscc or .zip file");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleImport = () => {
    if (!courseName.trim()) {
      toast.error("Please enter a course name");
      return;
    }
    if (!courseCode.trim()) {
      toast.error("Please enter a course code");
      return;
    }

    onImport(courseName.trim(), courseCode.trim(), selectedFile);
    
    // Reset form
    setCourseName("");
    setCourseCode("");
    setSelectedFile(null);
  };

  const handleCancel = () => {
    setCourseName("");
    setCourseCode("");
    setSelectedFile(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/40 z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] max-h-[90vh] bg-white rounded-[16px] shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#E5E5E5]">
              <h2 className="text-[24px] font-normal text-[#2D3B45]">Import as New Course</h2>
              <button
                onClick={handleCancel}
                className="w-9 h-9 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-[#6B7780]" strokeWidth={2} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {/* File Upload Area */}
              <div className="mb-6">
                <label className="block text-[16px] font-medium text-[#2D3B45] mb-3">
                  Select IMSCC File
                </label>
                
                <label
                  htmlFor="file-upload"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`
                    block border-2 border-dashed rounded-[12px] p-12 text-center cursor-pointer
                    transition-all
                    ${isDragging 
                      ? 'border-[#0084FF] bg-[#0084FF]/5' 
                      : selectedFile
                        ? 'border-[#00D084] bg-[#00D084]/5'
                        : 'border-[#D1D5DB] bg-white hover:border-[#0084FF] hover:bg-[#F5F5F7]'
                    }
                  `}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept=".imscc,.zip"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${selectedFile ? 'text-[#00D084]' : 'text-[#6B7780]'}`} strokeWidth={1.5} />
                  
                  {selectedFile ? (
                    <>
                      <p className="text-[16px] font-medium text-[#2D3B45] mb-1">
                        {selectedFile.name}
                      </p>
                      <p className="text-[14px] text-[#00D084]">
                        File selected · Click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[16px] font-medium text-[#2D3B45] mb-1">
                        Click to select IMSCC file
                      </p>
                      <p className="text-[14px] text-[#6B7780]">
                        Accepts .imscc or .zip files
                      </p>
                    </>
                  )}
                </label>
              </div>

              {/* Course Name */}
              <div className="mb-6">
                <label htmlFor="course-name" className="block text-[16px] font-medium text-[#2D3B45] mb-3">
                  Course Name
                </label>
                <input
                  id="course-name"
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g., Introduction to Psychology"
                  className="w-full px-4 py-3.5 border border-[#D1D5DB] rounded-[10px] text-[15px] text-[#2D3B45] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0084FF] focus:border-transparent transition-all"
                />
              </div>

              {/* Course Code */}
              <div className="mb-6">
                <label htmlFor="course-code" className="block text-[16px] font-medium text-[#2D3B45] mb-3">
                  Course Code
                </label>
                <input
                  id="course-code"
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g., PSY-101"
                  className="w-full px-4 py-3.5 border border-[#D1D5DB] rounded-[10px] text-[15px] text-[#2D3B45] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0084FF] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-[#E5E5E5] bg-[#F9F9F9]">
              <button
                onClick={handleCancel}
                className="px-6 py-3 rounded-[10px] text-[15px] font-medium text-[#2D3B45] hover:bg-[#E5E5E5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="px-6 py-3 bg-[#0084FF] hover:bg-[#0066CC] text-white rounded-[10px] text-[15px] font-medium transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" strokeWidth={2} />
                Import Course
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
