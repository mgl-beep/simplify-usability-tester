import { Users, BookOpen } from "lucide-react";

interface Course {
  id: string;
  title: string;
  progress: number;
  modules: number;
  students: number;
  color: string;
}

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-[16px] border border-[#d2d2d7]/50 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-[#d2d2d7]">
      {/* Color Header */}
      <div className={`h-2 bg-gradient-to-r ${course.color}`} />
      
      <div className="p-6">
        <h3 className="text-[17px] tracking-tight text-[#1d1d1f] mb-3">
          {course.title}
        </h3>
        
        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-[#636366]">Progress</span>
            <span className="text-[12px] text-[#1d1d1f]">{course.progress}%</span>
          </div>
          <div className="h-1.5 bg-[#EEECE8] rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${course.color} transition-all duration-300`}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 pt-3 border-t border-[#f5f5f7]">
          <div className="flex items-center gap-1.5 text-[#636366]">
            <BookOpen className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[12px]">{course.modules} modules</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#636366]">
            <Users className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[12px]">{course.students} students</span>
          </div>
        </div>
      </div>
    </div>
  );
}
