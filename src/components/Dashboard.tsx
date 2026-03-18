import { useState, useEffect } from "react";
import { MoreVertical, AlertCircle, Plus, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { getCourses, getCanvasDomain, initializeCanvas, type CanvasCourse } from "../utils/canvasAPI";

interface DashboardProps {
  onCourseClick?: (courseId: number, courseName: string) => void;
}

export function Dashboard({ onCourseClick }: DashboardProps) {
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const domain = getCanvasDomain();
      if (!domain) {
        setIsLoading(false);
        return;
      }

      const config = initializeCanvas(domain);
      const userCourses = await getCourses(config);
      setCourses(userCourses);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const publishedCourses = courses.filter(
    (course) => course.workflow_state === "available"
  );
  const unpublishedCourses = courses.filter(
    (course) => course.workflow_state === "unpublished"
  );

  // Generate a color for course card based on course ID
  const getCourseColor = (courseId: number) => {
    const colors = [
      "#E8A5C8", // pink
      "#6B4C9A", // purple
      "#00D084", // green
      "#0071E3", // blue
      "#FF9500", // orange
      "#FF3B30", // red
      "#34C759", // mint
      "#5856D6", // indigo
    ];
    return colors[courseId % colors.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0071e3] animate-spin mx-auto mb-4" />
          <p className="text-[15px] text-[#636366]">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <header className="border-b border-[#e5e5e7]">
        <div className="px-12 py-6">
          <h1 className="text-[34px] tracking-tight text-[#1d1d1f]">Dashboard</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-12 py-8">
        {/* Published Courses */}
        {publishedCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[22px] tracking-tight text-[#1d1d1f] mb-6">
              Published Courses ({publishedCourses.length})
            </h2>
            
            <div className="flex gap-6 flex-wrap">
              {publishedCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => onCourseClick?.(course.id, course.name)}
                  className="bg-white rounded-[20px] overflow-hidden border border-[#e5e5e7] shadow-sm w-[320px] hover:shadow-lg transition-all hover:scale-[1.02] text-left"
                >
                  {/* Card Header */}
                  <div
                    className="h-[240px] relative"
                    style={{ backgroundColor: getCourseColor(course.id) }}
                  >
                    <div className="absolute top-4 right-4 flex flex-col gap-1 p-2">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <h3
                      className="text-[20px] mb-2 font-medium"
                      style={{ color: getCourseColor(course.id) }}
                    >
                      {course.name}
                    </h3>
                    <p className="text-[15px] text-[#6B7280] mb-4">
                      {course.course_code}
                    </p>
                    
                    {/* Action Icons */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#6B7280] flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-white" strokeWidth={2} />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#6B7280] flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Unpublished Courses */}
        {unpublishedCourses.length > 0 && (
          <div>
            <h2 className="text-[22px] tracking-tight text-[#1d1d1f] mb-6">
              Unpublished Courses ({unpublishedCourses.length})
            </h2>
            
            <div className="flex gap-6 flex-wrap">
              {unpublishedCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => onCourseClick?.(course.id, course.name)}
                  className="bg-white rounded-[16px] overflow-hidden border border-[#e5e5e7] shadow-sm w-[320px] hover:shadow-lg transition-all hover:scale-[1.02] text-left"
                >
                  {/* Card Header */}
                  <div
                    className="h-[160px] relative"
                    style={{
                      background: `linear-gradient(to bottom right, ${getCourseColor(course.id)}, ${getCourseColor(course.id)}dd)`,
                    }}
                  >
                    <div className="absolute top-4 left-4">
                      <div className="bg-white text-[#1d1d1f] h-[32px] px-4 rounded-lg shadow-sm flex items-center justify-center text-[14px] font-medium">
                        Unpublished
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 p-2">
                      <MoreVertical className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <h3
                      className="text-[17px] mb-1 font-medium"
                      style={{ color: getCourseColor(course.id) }}
                    >
                      {course.name}
                    </h3>
                    <p className="text-[14px] text-[#636366]">
                      {course.course_code}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {courses.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-[17px] text-[#6B7280] mb-2">No courses found</p>
            <p className="text-[15px] text-[#636366]">
              Connect to Canvas to see your courses
            </p>
          </div>
        )}
      </div>
    </div>
  );
}