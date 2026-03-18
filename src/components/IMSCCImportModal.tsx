import { useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner@2.0.3";
import { parseIMSCCFile } from "../utils/imsccParser";
import { saveCourse } from "../utils/api";

interface IMSCCImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export function IMSCCImportModal({ isOpen, onClose, onImportComplete }: IMSCCImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-populate course name from file name
      const fileName = selectedFile.name.replace(/\.(imscc|zip)$/i, '');
      if (!courseName) {
        setCourseName(fileName);
      }
      if (!courseCode) {
        setCourseCode(fileName.replace(/[^a-zA-Z0-9-]/g, '-').toUpperCase());
      }
    }
  };

  const handleImport = async () => {
    if (!file || !courseName.trim() || !courseCode.trim()) {
      toast.error("Please provide course name, course code, and select an IMSCC file");
      return;
    }

    setIsUploading(true);
    setUploadProgress("Parsing IMSCC file...");

    try {
      
      toast.loading('Parsing course package...', { id: 'imscc-import' });
      
      // Step 1: Parse the IMSCC file
      const { course, issues, zip } = await parseIMSCCFile(file);
      
      setUploadProgress("Saving to Simplify database...");
      toast.loading('Saving to Simplify database...', { id: 'imscc-import' });

      // Step 2: Save to Supabase with custom name and code
      const courseId = course.identifier || `course-${Date.now()}`;
      await saveCourse(
        courseId,
        courseName.trim(),
        {
          ...course,
          title: courseName.trim(), // Override with custom name
          courseCode: courseCode.trim(), // Add custom course code
        },
        issues,
        {
          uploadedAt: new Date().toISOString(),
          fileName: file.name,
          fileSize: file.size,
          courseCode: courseCode.trim(),
        }
      );

      toast.success(`${courseName} imported to Simplify! Found ${issues.length} issues`, { id: 'imscc-import' });
      
      // Reset and close
      setFile(null);
      setCourseName("");
      setCourseCode("");
      setIsUploading(false);
      setUploadProgress("");
      
      onImportComplete();
      onClose();

    } catch (error) {
      console.error("❌ IMSCC import error:", error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to import IMSCC';
      toast.error(`Import failed: ${errorMsg}`, { id: 'imscc-import' });
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-2xl w-[600px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C7CDD1]">
          <h2 className="text-[18px] font-semibold text-[#2D3B45]">Import IMSCC Course</h2>
          <button
            onClick={onClose}
            className="text-[#6B7780] hover:text-[#2D3B45] transition-colors"
            disabled={isUploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {/* File Upload */}
          <div>
            <label className="block text-[14px] font-semibold text-[#2D3B45] mb-2">
              Select IMSCC File
            </label>
            <div className="border-2 border-dashed border-[#C7CDD1] rounded-lg p-6 text-center">
              <input
                type="file"
                id="imscc-file-input"
                accept=".imscc,.zip"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <label
                htmlFor="imscc-file-input"
                className="cursor-pointer inline-flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-[#6B7780] mb-2" strokeWidth={1.5} />
                <span className="text-[14px] text-[#2D3B45] font-medium">
                  {file ? file.name : "Click to select IMSCC file"}
                </span>
                <span className="text-[12px] text-[#6B7780] mt-1">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Accepts .imscc or .zip files"}
                </span>
              </label>
            </div>
          </div>

          {/* Course Details */}
          <div>
            <label className="block text-[14px] font-semibold text-[#2D3B45] mb-2">
              New Course Details
            </label>
            <div className="space-y-3">
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full p-3 border border-[#C7CDD1] rounded-lg text-[14px] text-[#2D3B45] placeholder:text-[#86868B] focus:border-[#0084ff] focus:outline-none focus:ring-2 focus:ring-[#0084ff]/20"
                disabled={isUploading}
                placeholder="Course Name (e.g., Introduction to Psychology)"
              />
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full p-3 border border-[#C7CDD1] rounded-lg text-[14px] text-[#2D3B45] placeholder:text-[#86868B] focus:border-[#0084ff] focus:outline-none focus:ring-2 focus:ring-[#0084ff]/20"
                disabled={isUploading}
                placeholder="Course Code (e.g., PSY-101)"
              />
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-[#0084ff]/10 border border-[#0084ff] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-[#0084ff] animate-spin" />
                <div>
                  <p className="text-[14px] font-semibold text-[#2D3B45]">
                    Importing Course Content
                  </p>
                  <p className="text-[12px] text-[#6B7780] mt-1">
                    {uploadProgress}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#C7CDD1] bg-[#F5F5F5]">
          <Button
            onClick={onClose}
            disabled={isUploading}
            className="bg-white hover:bg-[#F5F5F5] text-[#2D3B45] border border-[#C7CDD1] h-[36px] px-4 rounded-md text-[14px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || !courseName || !courseCode || isUploading}
            className="bg-[#0084ff] hover:bg-[#0077ed] text-white h-[36px] px-4 rounded-md text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import Course
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}