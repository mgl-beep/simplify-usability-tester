import { useState, useEffect } from "react";
import { Bell, Star, Calendar, ListTodo, BookOpen, MoreHorizontal, MoreVertical } from "lucide-react";
import { getCourses, getCanvasConfig, type CanvasCourse } from "../utils/canvasAPI";
import { getCourses as getSimplifyC } from "../utils/api";

interface CanvasDashboardProps {
  userName: string;
  onSelectCourse: (courseId: number, courseName: string, isImported?: boolean, originalCourseId?: string) => void;
  refreshKey?: number;
}

export function CanvasDashboard({ userName, onSelectCourse, refreshKey }: CanvasDashboardProps) {
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [importedCourseIds, setImportedCourseIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      
      let canvasCourses: CanvasCourse[] = [];
      let simplifyCourses: CanvasCourse[] = [];
      const importedIds = new Set<number>();
      
      // Load Canvas courses
      const config = getCanvasConfig();
      if (config) {
        try {
          canvasCourses = await getCourses(config);
        } catch (canvasError) {
        }
      }
      
      // Load imported courses from Simplify database
      try {
        const savedCourses = await getSimplifyC();
        
        // Convert Simplify courses to CanvasCourse format
        simplifyCourses = savedCourses.map((sc, index) => {
          const id = parseInt(sc.courseId.replace(/\\D/g, '')) || 999000 + index;
          importedIds.add(id);
          
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
            originalCourseId: sc.courseId,
          };
        });
      } catch (simplifyError) {
      }
      
      // Combine all courses
      const allCourses = [...canvasCourses, ...simplifyCourses];
      
      setCourses(allCourses);
      setImportedCourseIds(importedIds);
    } catch (err) {
      console.error("Error loading courses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Canvas-style page header */}
      <div className="bg-white border-b border-[#C7CDD1]">
        <div className="px-6 py-4">
          <h1 className="text-[23px] font-light text-[#2D3B45]">Dashboard</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Published Courses Section */}
        {!isLoading && courses.filter(c => c.workflow_state === 'available').length > 0 && (
          <div className="mb-8">
            <h2 className="text-[18px] font-normal text-[#2D3B45] mb-4">
              Published Courses ({courses.filter(c => c.workflow_state === 'available').length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.filter(c => c.workflow_state === 'available').map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={() => onSelectCourse(course.id, course.name, importedCourseIds.has(course.id), course.originalCourseId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Unpublished Courses Section */}
        {!isLoading && courses.filter(c => c.workflow_state !== 'available').length > 0 && (
          <div className="mb-8">
            <h2 className="text-[18px] font-normal text-[#2D3B45] mb-4">
              Unpublished Courses ({courses.filter(c => c.workflow_state !== 'available').length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.filter(c => c.workflow_state !== 'available').map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={() => onSelectCourse(course.id, course.name, importedCourseIds.has(course.id), course.originalCourseId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="bg-white border border-[#C7CDD1] rounded-md p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#E5E5E5] border-t-[#0084ff] rounded-full animate-spin" />
            <p className="text-[14px] text-[#6B7780] mt-4">Loading courses...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && courses.length === 0 && (
          <div className="bg-white border border-[#C7CDD1] rounded-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-[#C7CDD1] mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-[16px] text-[#6B7780] mb-2">No courses yet</p>
            <p className="text-[13px] text-[#6B7780]">
              You're not enrolled in any courses
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface CourseCardProps {
  course: CanvasCourse;
  onClick: () => void;
}

function CourseCard({ course, onClick }: CourseCardProps) {
  const bgColors = [
    "#FFA726", // Orange
    "#0084ff", // Blue
    "#00D084", // Green
    "#FF6B6B", // Red
    "#9C27B0", // Purple
    "#4CAF50", // Teal
  ];
  const bgColor = bgColors[course.id % bgColors.length];
  const hasImage = course.image_download_url;
  const isPublished = course.workflow_state === "available";

  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#C7CDD1] rounded-[8px] overflow-hidden hover:shadow-lg transition-all group cursor-pointer w-full max-w-[280px]"
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

        {/* Bottom row: Status badge */}
        <div className="flex items-center pt-1 min-h-[28px]">
          {!isPublished && (
            <span className="text-[11px] px-2 py-1 rounded bg-[#E5E5E5] text-[#6B7780] font-medium">
              Unpublished
            </span>
          )}
        </div>
      </div>
    </div>
  );
}