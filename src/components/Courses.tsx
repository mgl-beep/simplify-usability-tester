import { Upload, MoreVertical } from "lucide-react";
import { SecondaryNav } from "./SecondaryNav";
import { CourseUploadModal } from "./CourseUploadModal";
import { CourseContent } from "./CourseContent";
import { ModulesView } from "./ModulesView";
import { useState } from "react";

const initialCourses = [
  {
    id: "1",
    name: "Cats 101",
    code: "BIO-CAT-2024",
    color: "from-[#b8860b] to-[#8b6914]",
    published: false
  },
  {
    id: "2",
    name: "Creative Writing",
    code: "ENGL-7E-38694",
    color: "from-[#E8A5C8] to-[#D895B8]",
    published: true
  }
];

type TabType = "all" | "published" | "unpublished";

interface CoursesProps {
  onSelectCourse?: (courseId: string | null) => void;
  selectedCourseId?: string | null;
  onScanCourse?: () => void;
}

export function Courses({ onSelectCourse, selectedCourseId, onScanCourse }: CoursesProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedNavItem, setSelectedNavItem] = useState<string>("Modules");
  const selectedCourse = selectedCourseId ? initialCourses.find(c => c.id === selectedCourseId) : null;
  
  // Filter courses based on active tab
  const filteredCourses = initialCourses.filter(course => {
    if (activeTab === "all") return true;
    if (activeTab === "published") return course.published;
    if (activeTab === "unpublished") return !course.published;
    return true;
  });

  return (
    <div className="flex h-full min-h-screen bg-white">
      {/* Secondary Navigation - Only show when a course is selected */}
      {selectedCourse && (
        <SecondaryNav 
          courseName={selectedCourse.name} 
          selectedItem={selectedNavItem}
          onSelectItem={setSelectedNavItem}
        />
      )}

      {/* Show Course Content if selected, otherwise show course grid */}
      {selectedCourse ? (
        selectedNavItem === "Modules" ? (
          <ModulesView 
            courseName={selectedCourse.name}
            courseCode={selectedCourse.code}
            onBackToCourses={() => onSelectCourse && onSelectCourse(null)}
            onScanCourse={onScanCourse}
          />
        ) : (
          <CourseContent 
            courseName={selectedCourse.name}
            courseCode={selectedCourse.code}
          />
        )
      ) : (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <header className="border-b border-[#e5e5e7] bg-white">
            <div className="px-12 py-6 flex items-center justify-between">
              <h1 className="text-[40px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">Courses</h1>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="flex items-center gap-2 px-5 h-[44px] bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-[12px] transition-colors"
              >
                <Upload className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-[15px]">Import Course</span>
              </button>
            </div>
            
            {/* Tabs */}
            <div className="px-12">
              <div className="flex items-center gap-8 border-b border-[#e5e5e7]">
                <button
                  className={`pb-3 text-[17px] font-semibold ${activeTab === "all" ? "text-[#0071e3] border-b-2 border-[#0071e3] -mb-px" : "text-[#636366] hover:text-[#1d1d1f] transition-colors"} tracking-[-0.011em]`}
                  onClick={() => setActiveTab("all")}
                >
                  All Courses
                </button>
                <button
                  className={`pb-3 text-[17px] font-semibold ${activeTab === "published" ? "text-[#0071e3] border-b-2 border-[#0071e3] -mb-px" : "text-[#636366] hover:text-[#1d1d1f] transition-colors"} tracking-[-0.011em]`}
                  onClick={() => setActiveTab("published")}
                >
                  Published
                </button>
                <button
                  className={`pb-3 text-[17px] font-semibold ${activeTab === "unpublished" ? "text-[#0071e3] border-b-2 border-[#0071e3] -mb-px" : "text-[#636366] hover:text-[#1d1d1f] transition-colors"} tracking-[-0.011em]`}
                  onClick={() => setActiveTab("unpublished")}
                >
                  Unpublished
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 px-12 py-8 bg-white">
            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group text-left bg-white rounded-[16px] border border-[#e5e5e7] overflow-hidden hover:shadow-lg hover:border-[#d2d2d7] transition-all duration-200 cursor-pointer"
                  onClick={() => onSelectCourse && onSelectCourse(course.id)}
                >
                  {/* Course Header with gradient */}
                  <div className={`h-[140px] bg-gradient-to-br ${course.color} relative`}>
                    {/* Three dots menu */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Menu functionality can be added here
                      }}
                      className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-white" strokeWidth={2} />
                    </button>
                    {!course.published && (
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[12px] font-semibold text-[#1d1d1f] tracking-[-0.006em]">
                          Unpublished
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Course Body */}
                  <div className="p-5">
                    <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-1 group-hover:text-[#0071e3] transition-colors tracking-[-0.011em]">
                      {course.name}
                    </h3>
                    <p className="text-[14px] font-semibold text-[#636366] tracking-[-0.006em]">
                      {course.code}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Course Upload Modal */}
      <CourseUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={() => {
          // Could add toast notification or refresh course list here
        }}
      />
    </div>
  );
}