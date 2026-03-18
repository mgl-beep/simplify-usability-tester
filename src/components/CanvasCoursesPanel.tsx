import { useState, useEffect } from "react";
import { BookOpen, ExternalLink, Loader2, RefreshCw, AlertCircle, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  isConnectedToCanvas, 
  getCanvasDomain, 
  getCourses, 
  initializeCanvas,
  type CanvasCourse 
} from "../utils/canvasAPI";
import { toast } from "sonner@2.0.3";

export function CanvasCoursesPanel() {
  const [isConnected, setIsConnected] = useState(isConnectedToCanvas());
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = async () => {
    if (!isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      const domain = getCanvasDomain();
      if (!domain) {
        throw new Error("Canvas domain not found");
      }

      const config = initializeCanvas(domain);
      const canvasCourses = await getCourses(config);
      
      // Filter to only show active and available courses
      const activeCourses = canvasCourses.filter(
        course => course.workflow_state === 'available' || course.workflow_state === 'unpublished'
      );
      
      setCourses(activeCourses);
      toast.success(`Loaded ${activeCourses.length} courses from Canvas`);
    } catch (err) {
      console.error("Error loading Canvas courses:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load courses";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadCourses();
    }
  }, [isConnected]);

  // Listen for connection changes
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(isConnectedToCanvas());
    };
    
    window.addEventListener('storage', checkConnection);
    return () => window.removeEventListener('storage', checkConnection);
  }, []);

  if (!isConnected) {
    return (
      <div className="bg-white rounded-[16px] border border-[#e5e5e7] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#636366]/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#636366]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.011em]">
              Canvas Courses
            </h3>
            <p className="text-[13px] text-[#636366]">
              Connect to Canvas to view your courses
            </p>
          </div>
        </div>
        <div className="p-4 bg-[#EEECE8] rounded-[10px] text-center">
          <p className="text-[13px] text-[#636366]">
            Connect to Canvas in the settings below to see your courses here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[16px] border border-[#e5e5e7] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#0071e3]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.011em]">
              Canvas Courses
            </h3>
            <p className="text-[13px] text-[#636366]">
              {courses.length} courses from {getCanvasDomain()}
            </p>
          </div>
        </div>
        <Button
          onClick={loadCourses}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="h-[32px] px-3 rounded-[8px] border-[#d2d2d7]"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
          ) : (
            <RefreshCw className="w-4 h-4" strokeWidth={2} />
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-[10px]">
          <AlertCircle className="w-4 h-4 text-[#ff3b30] mt-0.5" strokeWidth={2} />
          <p className="text-[12px] text-[#ff3b30]">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#0071e3] animate-spin" strokeWidth={2} />
        </div>
      ) : courses.length === 0 ? (
        <div className="p-4 bg-[#EEECE8] rounded-[10px] text-center">
          <p className="text-[13px] text-[#636366]">
            No courses found in your Canvas account
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-3 border border-[#d2d2d7] rounded-[10px] hover:border-[#0071e3] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[14px] font-semibold text-[#1d1d1f] truncate">
                      {course.name}
                    </h4>
                    <Badge 
                      className={`text-[10px] px-1.5 py-0 h-4 border-0 ${
                        course.workflow_state === 'available' 
                          ? 'bg-[#34c759]/10 text-[#34c759]' 
                          : 'bg-[#636366]/10 text-[#636366]'
                      }`}
                    >
                      {course.workflow_state === 'available' ? 'published' : 'unpublished'}
                    </Badge>
                  </div>
                  <p className="text-[12px] text-[#636366]">
                    {course.course_code}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => {
                      window.open(
                        `https://${getCanvasDomain()}/courses/${course.id}`,
                        '_blank'
                      );
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-[28px] w-[28px] p-0 rounded-[6px]"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#636366]" strokeWidth={2} />
                  </Button>
                  <Button
                    onClick={() => {
                      toast.info("Course import coming soon! Export from Canvas and upload via the Courses tab.");
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-[28px] w-[28px] p-0 rounded-[6px]"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0071e3]" strokeWidth={2} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
