import { useState, useEffect } from "react";
import { parseIMSCCFile, type IMSCCCourse } from "../utils/imsccParser";
import JSZip from "jszip";
import type { CourseFile } from "./FilesView";
import { getCourses as getCanvasCourses, type CanvasCourse, getCanvasConfig } from "../utils/canvasAPI";
import { saveCourse } from "../utils/api";
import { toast } from "sonner@2.0.3";
import { File, CheckCircle, Loader2, AlertCircle, X } from "lucide-react";
import type { ScanIssue } from "../App";

interface CourseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCourse: (courseId: string, courseName: string, scannedIssues?: ScanIssue[], courseData?: IMSCCCourse, zip?: JSZip) => void;
  lastScanDates?: Record<string, Date>;
}

export function CourseSelectionModal({ isOpen, onClose, onSelectCourse, lastScanDates }: CourseSelectionModalProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [canvasCourses, setCanvasCourses] = useState<CanvasCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [uploadedIMSCC, setUploadedIMSCC] = useState<IMSCCCourse | null>(null);
  const [uploadedZip, setUploadedZip] = useState<JSZip | null>(null);
  const [scannedIssues, setScannedIssues] = useState<ScanIssue[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCanvasCourses();
    }
  }, [isOpen]);

  const loadCanvasCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const config = getCanvasConfig();
      if (!config) {
        // Don't show error - user might only be using IMSCC import
        setCanvasCourses([]);
        return;
      }

      try {
        const courses = await getCanvasCourses(config);
        setCanvasCourses(courses);
      } catch (canvasError) {
        // Silently handle Canvas API errors - user might not have permissions
        setCanvasCourses([]);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      // Don't toast error - user can still upload IMSCC
      setCanvasCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  if (!isOpen) return null;

  const formatLastScan = (date: Date) => {
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const formattedTime = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    return `Last scanned: ${formattedDate} at ${formattedTime}`;
  };

  const handleScan = () => {
    
    if (selectedCourseId) {
      if (selectedCourseId === "uploaded") {
        if (uploadedIMSCC) {
          onSelectCourse(selectedCourseId, uploadedIMSCC.title, scannedIssues, uploadedIMSCC, uploadedZip);
        }
      } else {
        const course = canvasCourses.find(c => c.id.toString() === selectedCourseId);
        if (course) {
          onSelectCourse(selectedCourseId, course.name);
        }
      }
    }
  };

  const handleIMSCCUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast.loading(`Uploading ${file.name}...`, { id: 'imscc-upload' });
    
    setIsUploading(true);
    setUploadError(null);
    setUploadedIMSCC(null);

    try {
      toast.loading('Parsing course package...', { id: 'imscc-upload' });
      
      const { course, issues, zip } = await parseIMSCCFile(file);
      
      // Extract file list from zip
      const fileList: CourseFile[] = [];
      zip.forEach((relativePath, zipEntry) => {
        // Skip directories and manifest files
        if (!zipEntry.dir && !relativePath.includes('imsmanifest.xml')) {
          const fileName = relativePath.split('/').pop() || relativePath;
          fileList.push({
            name: fileName,
            path: relativePath,
            size: zipEntry._data?.uncompressedSize || 0,
            type: fileName.split('.').pop() || 'unknown',
            modified: zipEntry.date?.toISOString()
          });
        }
      });
      
      toast.loading('Saving to database...', { id: 'imscc-upload' });
      
      // Save to Supabase
      const courseId = course.identifier || `course-${Date.now()}`;
      await saveCourse(
        courseId,
        course.title,
        course,
        issues,
        {
          uploadedAt: new Date().toISOString(),
          fileName: file.name,
          fileSize: file.size,
          files: fileList, // Store the file list
        }
      );
      
      toast.success(`${course.title} uploaded & saved! Found ${issues.length} issues`, { id: 'imscc-upload' });
      
      setUploadedIMSCC(course);
      setUploadedZip(zip);
      setScannedIssues(issues);
      setSelectedCourseId("uploaded");
      setIsUploading(false);
    } catch (error) {
      console.error('❌ IMSCC Upload Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to parse IMSCC file';
      toast.error(errorMsg, { id: 'imscc-upload' });
      setUploadError(errorMsg);
      setIsUploading(false);
    }
  };

  const getCourseColor = (courseId: number) => {
    const colors = [
      "from-[#0084ff] to-[#0066cc]",
      "from-[#00D084] to-[#00B873]",
      "from-[#FF6B6B] to-[#E85555]",
      "from-[#FFA726] to-[#FF8F00]",
      "from-[#9C27B0] to-[#7B1FA2]",
      "from-[#4CAF50] to-[#388E3C]",
    ];
    return colors[courseId % colors.length];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[580px] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e5e7]">
          <h2 className="text-[22px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
            Select Course to Scan
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors"
          >
            <X className="w-5 h-5 text-[#636366]" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          <p className="text-[15px] text-[#636366] mb-4">
            Choose a course to scan for accessibility and usability issues:
          </p>
          
          {/* Loading State */}
          {isLoadingCourses && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#0071e3] animate-spin" strokeWidth={2} />
            </div>
          )}

          {/* Course List */}
          {!isLoadingCourses && (
            <div className="space-y-3">
              {canvasCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id.toString())}
                  className={`w-full text-left rounded-[12px] border-2 transition-all duration-200 overflow-hidden ${
                    selectedCourseId === course.id.toString()
                      ? "border-[#0071e3] shadow-md"
                      : "border-[#e5e5e7] hover:border-[#d2d2d7]"
                  }`}
                >
                  <div className="flex items-center">
                    {/* Course Color Bar */}
                    <div className={`w-[80px] h-[80px] bg-gradient-to-br ${getCourseColor(course.id)} flex-shrink-0`} />
                    
                    {/* Course Info */}
                    <div className="flex-1 px-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.011em]">
                          {course.name}
                        </h3>
                        {course.workflow_state !== 'available' && (
                          <span className="px-2 py-0.5 bg-[#EEECE8] rounded-full text-[11px] font-semibold text-[#636366] tracking-[-0.006em]">
                            Unpublished
                          </span>
                        )}
                      </div>
                      <p className="text-[14px] text-[#636366] mt-0.5 tracking-[-0.006em]">
                        {course.course_code}
                      </p>
                      {lastScanDates && lastScanDates[course.id.toString()] && (
                        <p className="text-[12px] text-[#0071e3] mt-1 tracking-[-0.006em]">
                          {formatLastScan(lastScanDates[course.id.toString()])}
                        </p>
                      )}
                    </div>

                    {/* Selection Indicator */}
                    {selectedCourseId === course.id.toString() && (
                      <div className="mr-4">
                        <div className="w-6 h-6 rounded-full bg-[#0071e3] flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {/* Uploaded IMSCC */}
              {uploadedIMSCC && (
                <button
                  onClick={() => setSelectedCourseId("uploaded")}
                  className={`w-full text-left rounded-[12px] border-2 transition-all duration-200 overflow-hidden ${
                    selectedCourseId === "uploaded"
                      ? "border-[#0071e3] shadow-md"
                      : "border-[#e5e5e7] hover:border-[#d2d2d7]"
                  }`}
                >
                  <div className="flex items-center">
                    {/* IMSCC Icon */}
                    <div className="w-[80px] h-[80px] bg-gradient-to-br from-[#34C759] to-[#30B350] flex items-center justify-center flex-shrink-0">
                      <File className="w-10 h-10 text-white" strokeWidth={1.5} />
                    </div>
                    
                    {/* IMSCC Info */}
                    <div className="flex-1 px-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.011em]">
                          {uploadedIMSCC.title}
                        </h3>
                        <span className="px-2 py-0.5 bg-[#34C759]/10 rounded-full text-[11px] font-semibold text-[#34C759] tracking-[-0.006em] flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" strokeWidth={2.5} />
                          Scanned
                        </span>
                      </div>
                      <p className="text-[14px] text-[#636366] mt-0.5 tracking-[-0.006em]">
                        {uploadedIMSCC.fileCount} files · {scannedIssues.length} issues found
                      </p>
                    </div>

                    {/* Selection Indicator */}
                    {selectedCourseId === "uploaded" && (
                      <div className="mr-4">
                        <div className="w-6 h-6 rounded-full bg-[#0071e3] flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoadingCourses && canvasCourses.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-[#636366] mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-[15px] text-[#636366]">No courses found</p>
              <p className="text-[13px] text-[#636366] mt-1">Upload an IMSCC file below</p>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e5e7]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-[13px] text-[#636366]">or</span>
            </div>
          </div>

          {/* Folder Upload */}
          <div className="mt-3 space-y-3">
            <label
              htmlFor="imsccFile"
              className={`flex items-center justify-center px-5 h-[48px] rounded-[12px] text-[15px] font-semibold border-2 border-dashed transition-all cursor-pointer ${
                isUploading
                  ? "border-[#34C759] bg-[#34C759]/5 text-[#34C759] cursor-wait"
                  : "border-[#d2d2d7] text-[#1d1d1f] hover:border-[#34C759] hover:bg-[#f5f5f7]"
              }`}
            >
              <File className={`w-5 h-5 mr-2 ${isUploading ? "animate-pulse" : ""}`} strokeWidth={2} />
              {isUploading ? "Processing IMSCC..." : "Upload IMSCC Course Package"}
            </label>
            <input
              type="file"
              id="imsccFile"
              className="hidden"
              accept=".imscc,.zip"
              onChange={handleIMSCCUpload}
              disabled={isUploading}
            />
            
            {uploadError && (
              <div className="mt-3 p-3 bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-[8px]">
                <p className="text-[13px] text-[#ff3b30]">{uploadError}</p>
              </div>
            )}
            {!uploadError && !uploadedIMSCC && (
              <p className="text-[12px] text-[#636366] mt-2 text-center">
                Upload an IMSCC course package (.imscc or .zip)
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 bg-[#EEECE8] border-t border-[#e5e5e7]">
          <button
            onClick={onClose}
            className="px-5 h-[40px] rounded-[10px] text-[15px] font-semibold text-[#1d1d1f] hover:bg-[#e5e5e7] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleScan}
            disabled={!selectedCourseId}
            className={`px-5 h-[40px] rounded-[10px] text-[15px] font-semibold text-white transition-all ${
              selectedCourseId
                ? "bg-[#0071e3] hover:bg-[#0077ed]"
                : "bg-[#d2d2d7] cursor-not-allowed"
            }`}
          >
            Scan Course
          </button>
        </div>
      </div>
    </div>
  );
}