import { ChevronRight, ChevronDown, Book, FileText, MessageSquare, CheckSquare, Video } from "lucide-react";
import { useState } from "react";

const courseModules = [
  {
    id: "1",
    title: "This is a Sample Module.",
    items: 6,
    content: [
      { id: "1-1", type: "text", title: "A module is usually one unit, one topic, or one week of content.", icon: Book },
      { id: "1-2", type: "page", title: "Sample Page", icon: FileText },
      { id: "1-3", type: "discussion", title: "Sample Discussion", icon: MessageSquare },
      { id: "1-4", type: "quiz", title: "Sample Quiz", icon: Book },
      { id: "1-5", type: "assignment", title: "Sample Assignment", icon: CheckSquare },
      { id: "1-6", type: "text", title: 'Want to create an additional module? Select the "+ Module" above.', icon: Book }
    ]
  },
  {
    id: "2",
    title: "Week 1 Course Materials",
    items: 8,
    content: []
  },
  {
    id: "3",
    title: "Week 2 Course Materials",
    items: 11,
    content: []
  },
  {
    id: "4",
    title: "Week 3 Course Materials",
    items: 15,
    content: []
  },
  {
    id: "5",
    title: "Week 4 Course Materials",
    items: 6,
    content: []
  }
];

interface CourseContentProps {
  courseName: string;
  courseCode: string;
}

export function CourseContent({ courseName, courseCode }: CourseContentProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>(["1"]); // First module expanded by default

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <div className="flex-1 min-h-full bg-white">
      {/* Header */}
      <header className="border-b border-[#e5e5e7] bg-white sticky top-0 z-10">
        <div className="px-12 py-6">
          <div className="flex items-center gap-2 text-[13px] text-[#636366] mb-2">
            <span>Courses</span>
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
            <span className="text-[#1d1d1f]">{courseName}</span>
          </div>
          <h1 className="text-[40px] font-semibold tracking-[-0.022em] text-[#1d1d1f] mb-2">
            {courseName}
          </h1>
          <p className="text-[17px] text-[#636366] tracking-[-0.011em]">{courseCode}</p>
        </div>
      </header>

      {/* Course Stats */}
      <div className="px-12 py-6 border-b border-[#e5e5e7] bg-[#EEECE8]">
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-[12px] p-5 border border-[#e5e5e7]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                <Book className="w-5 h-5 text-[#0071e3]" strokeWidth={2} />
              </div>
              <div>
                <div className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">14</div>
              </div>
            </div>
            <p className="text-[13px] text-[#636366]">Modules</p>
          </div>

          <div className="bg-white rounded-[12px] p-5 border border-[#e5e5e7]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#34c759]/10 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-[#34c759]" strokeWidth={2} />
              </div>
              <div>
                <div className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">47</div>
              </div>
            </div>
            <p className="text-[13px] text-[#636366]">Assignments</p>
          </div>

          <div className="bg-white rounded-[12px] p-5 border border-[#e5e5e7]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#ff9500]/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#ff9500]" strokeWidth={2} />
              </div>
              <div>
                <div className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">8</div>
              </div>
            </div>
            <p className="text-[13px] text-[#636366]">Discussions</p>
          </div>

          <div className="bg-white rounded-[12px] p-5 border border-[#e5e5e7]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#af52de]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#af52de]" strokeWidth={2} />
              </div>
              <div>
                <div className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">62</div>
              </div>
            </div>
            <p className="text-[13px] text-[#636366]">Pages</p>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="px-12 py-8">
        <h2 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight mb-6">Course Modules</h2>
        
        <div className="space-y-3">
          {courseModules.map((module) => {
            const isExpanded = expandedModules.includes(module.id);
            
            return (
              <div
                key={module.id}
                className="bg-white border border-[#d4d4d4] rounded-[8px] overflow-hidden"
              >
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f9f9f9] transition-colors text-left"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#6B7780] flex-shrink-0" strokeWidth={2} />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#6B7780] flex-shrink-0" strokeWidth={2} />
                    )}
                    <h3 className="text-[15px] font-semibold text-[#1d1d1f]">{module.title}</h3>
                  </div>
                  <span className="text-[13px] text-[#6B7780]">{module.items} items</span>
                </button>

                {/* Module Content */}
                {isExpanded && (
                  <div className="border-t border-[#e5e5e7]">{module.content.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          className="px-6 py-3 flex items-center gap-3 hover:bg-[#f9f9f9] cursor-pointer border-b border-[#f5f5f7] last:border-b-0"
                        >
                          <Icon className="w-5 h-5 text-[#6B7780] flex-shrink-0" strokeWidth={1.5} />
                          <span className="text-[14px] text-[#1d1d1f]">{item.title}</span>
                        </div>
                      );
                    })}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}