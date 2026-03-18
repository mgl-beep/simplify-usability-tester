import { useState, useEffect } from "react";
import { Star, Settings, BookOpen, MoreVertical, Upload, File, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { getCourses, getCanvasConfig, type CanvasCourse } from "../utils/canvasAPI";
import { getCourses as getSimplifyC } from "../utils/api";
import { toast } from "sonner@2.0.3";
import { Button } from "./ui/button";
import { IMSCCImportModal } from "./IMSCCImportModal";
import { CourseCardSkeleton } from "./ui/skeleton-loader";
import { EmptyState } from "./ui/empty-state";
import { ErrorAlert } from "./ui/error-alert";

interface CanvasCoursesProps {
  onSelectCourse: (courseId: number, courseName: string, isImported?: boolean, originalCourseId?: string) => void;
  refreshKey?: number;
}

export function CanvasCourses({ onSelectCourse, refreshKey }: CanvasCoursesProps) {
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "unpublished">("all");
  const [showImportModal, setShowImportModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCourseIds, setImportedCourseIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setIsLoading(true);
      
      let canvasCourses: CanvasCourse[] = [];
      let simplifyCourses: CanvasCourse[] = [];
      const importedIds = new Set<number>();
      
      // Only try to load Canvas courses if domain is configured and we have a token
      const config = getCanvasConfig();
      if (config) {
        try {
          canvasCourses = await getCourses(config);
        } catch (canvasError) {
          // Silently ignore Canvas API errors - user might not have permissions
        }
      }
      
      // Load imported courses from Simplify database
      try {
        const savedCourses = await getSimplifyC();
        
        // Convert Simplify courses to CanvasCourse format
        simplifyCourses = savedCourses.map((sc, index) => {
          const id = parseInt(sc.courseId.replace(/\\D/g, '')) || 999000 + index; // Generate numeric ID
          importedIds.add(id); // Track as imported
          
          return {
            id,
            name: sc.courseName,
            course_code: sc.metadata?.courseCode || 'IMPORTED',
            workflow_state: 'unpublished',
            account_id: 0,
            start_at: null,
            end_at: null,
            enrollment_term_id: 0,
            created_at: sc.lastScan || new Date().toISOString(),
            // Store the original courseId for backend operations
            originalCourseId: sc.courseId,
          };
        });
      } catch (simplifyError) {
      }
      
      // Combine Canvas courses with Simplify imported courses
      const allCourses = [...canvasCourses, ...simplifyCourses];
      
      toast.success(`Loaded ${canvasCourses.length} Canvas + ${simplifyCourses.length} imported courses`, {
        duration: 1000
      });
      
      setCourses(allCourses);
      setImportedCourseIds(importedIds);
    } catch (err) {
      console.error("Error loading courses:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load courses";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportComplete = () => {
    // Reload courses after import
    loadCourses();
  };

  const handleDeleteCourse = async (course: CanvasCourse) => {
    if (!confirm(`Are you sure you want to delete "${course.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { deleteCourse } = await import('../utils/api');
      const deleteId = course.originalCourseId || course.id.toString();
      
      toast.loading('Deleting course...', { id: 'delete-course' });
      
      await deleteCourse(deleteId);
      
      toast.success(`"${course.name}" deleted successfully`, { id: 'delete-course' });
      
      // Reload courses
      loadCourses();
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      toast.error(`Failed to delete course: ${error.message}`, { id: 'delete-course' });
    }
  };

  const filteredCourses = courses.filter(course => {
    if (filter === "published") return course.workflow_state === "available";
    if (filter === "unpublished") return course.workflow_state === "unpublished";
    return true;
  });

  const publishedCourses = courses.filter(course => course.workflow_state === "available");
  const unpublishedCourses = courses.filter(course => course.workflow_state === "unpublished");

  return (
    <>
      <IMSCCImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />
      
      <div className="min-h-screen bg-white">
        {/* Canvas-style page header */}
        <div className="border-b border-[#C7CDD1] bg-white">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-[32px] font-normal text-[#2D3B45]">Dashboard</h1>
            
            {/* Upload IMSCC Button */}
            <Button
              onClick={() => setShowImportModal(true)}
              className="bg-[#0084ff] hover:bg-[#0077ed] text-white h-[36px] px-4 rounded-md text-[14px]"
            >
              <Upload className="w-4 h-4 mr-2" strokeWidth={2} />
              Import IMSCC
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#E5E5E5] border-t-[#0084ff] rounded-full animate-spin" />
              <p className="text-[14px] text-[#6B7780] mt-4">Loading courses...</p>
            </div>
          )}

          {/* Published Courses Section */}
          {!isLoading && publishedCourses.length > 0 && (
            <div className="mb-12">
              <h2 className="text-[18px] font-normal text-[#2D3B45] mb-6">
                Published Courses ({publishedCourses.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishedCourses.map((course) => {
                  const isImported = importedCourseIds.has(course.id);
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isImported={isImported}
                      onDelete={isImported ? () => handleDeleteCourse(course) : undefined}
                      onClick={() => {
                        onSelectCourse(course.id, course.name, isImported, course.originalCourseId);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Unpublished Courses Section */}
          {!isLoading && unpublishedCourses.length > 0 && (
            <div className="mb-12">
              <h2 className="text-[18px] font-normal text-[#2D3B45] mb-6">
                Unpublished Courses ({unpublishedCourses.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpublishedCourses.map((course) => {
                  const isImported = importedCourseIds.has(course.id);
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isImported={isImported}
                      onDelete={isImported ? () => handleDeleteCourse(course) : undefined}
                      onClick={() => {
                        onSelectCourse(course.id, course.name, isImported, course.originalCourseId);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && courses.length === 0 && (
            <EmptyState
              icon={BookOpen}
              title="No courses found"
              description="You don't have any courses yet. Import an IMSCC file or connect to Canvas to get started."
              action={{
                label: 'Import IMSCC',
                onClick: () => setShowImportModal(true)
              }}
            />
          )}

          {/* Error state */}
          {error && (
            <ErrorAlert
              type="error"
              title="Unable to load courses"
              message={error}
              action={{
                label: 'Try Again',
                onClick: loadCourses
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

interface FilterTabProps {
  label: string;
  active: boolean;
  count: number;
  onClick: () => void;
}

function FilterTab({ label, active, count, onClick }: FilterTabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        pb-3 px-2 text-[14px] font-medium border-b-2 transition-colors
        ${active
          ? 'border-[#0084ff] text-[#0084ff]'
          : 'border-transparent text-[#6B7780] hover:text-[#2D3B45]'
        }
      `}
    >
      {label} <span className="text-[#86868B]">({count})</span>
    </button>
  );
}

interface CourseCardProps {
  course: CanvasCourse;
  isImported?: boolean;
  onDelete?: () => void;
  onClick: () => void;
}

function CourseCard({ course, isImported, onDelete, onClick }: CourseCardProps) {
  const isPublished = course.workflow_state === "available";
  const bgColors = [
    "#FFA726", // Orange (like in Canvas)
    "#0084ff",
    "#00D084", 
    "#FF6B6B",
    "#9C27B0",
    "#4CAF50",
  ];
  const bgColor = bgColors[course.id % bgColors.length];
  
  // Use Canvas course image if available, otherwise fall back to solid color
  const hasImage = course.image_download_url;

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-[#C7CDD1] rounded-[8px] overflow-hidden hover:shadow-lg transition-all cursor-pointer group max-w-[280px] relative"
    >
      {/* Course header - Image or solid color - No white space */}
      <div className="h-[140px] relative overflow-hidden bg-transparent">
        {hasImage ? (
          <img 
            src={course.image_download_url} 
            alt={course.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full" 
            style={{ backgroundColor: bgColor }}
          />
        )}
        
        {/* Three-dot menu on top of image/color - Canvas style */}
        <div className="absolute top-2 right-2">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="w-8 h-8 rounded bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-all"
          >
            <MoreVertical className="w-4 h-4 text-[#2D3B45]" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Course info - Compact spacing */}
      <div className="p-3 bg-white pt-[23px]">
        <h3 className="text-[15px] font-semibold text-[#2D3B45] mb-0.5 group-hover:text-[#0084ff] transition-colors line-clamp-2 min-h-[40px]">
          {course.name}
        </h3>
        <p className="text-[15px] text-[#6B7780] mb-2 uppercase">
          {course.course_code}
        </p>

        {/* Bottom row: Status badge and delete button */}
        <div className="flex items-center justify-between pt-1 min-h-[28px]">
          {/* Status badge */}
          {!isPublished && (
            <span className="text-[11px] px-2 py-1 rounded bg-[#E5E5E5] text-[#6B7780] font-medium">
              Unpublished
            </span>
          )}
          
          {/* Delete button - ALWAYS VISIBLE for imported courses */}
          {isImported && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white border border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 hover:border-red-400 transition-all shadow-sm"
              title="Delete imported course"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="text-[11px] font-semibold">Remove</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}