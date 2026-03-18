import { useState } from "react";
import { ChevronDown, ChevronRight, FileText, Video, File, Image, Link2, ClipboardList, BookOpen, Home, ScanSearch } from "lucide-react";
import { Button } from "./ui/button";
import type { IMSCCCourse } from "../utils/imsccParser";

interface CourseViewerProps {
  course: IMSCCCourse;
  onScanCourse?: () => void;
}

export function CourseViewer({ course, onScanCourse }: CourseViewerProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentView, setCurrentView] = useState<"home" | "modules">("home");

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "Page":
      case "WikiPage":
        return <FileText className="w-4 h-4" strokeWidth={2} />;
      case "Assignment":
        return <ClipboardList className="w-4 h-4" strokeWidth={2} />;
      case "Discussion":
        return <BookOpen className="w-4 h-4" strokeWidth={2} />;
      case "ExternalUrl":
        return <Link2 className="w-4 h-4" strokeWidth={2} />;
      case "File":
        return <File className="w-4 h-4" strokeWidth={2} />;
      default:
        return <FileText className="w-4 h-4" strokeWidth={2} />;
    }
  };

  const renderContent = (item: any) => {
    if (!item) return null;

    // Find the resource content
    const resource = course.resources.find(r => 
      r.identifier === item.identifierref || 
      r.title === item.title
    );

    return (
      <div className="flex-1 bg-white rounded-[12px] border border-[#e5e5e7] p-6 overflow-auto">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-[28px] font-semibold text-[#1d1d1f] mb-4">{item.title}</h2>
          
          {resource?.content ? (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: resource.content }}
            />
          ) : (
            <div className="text-[15px] text-[#636366]">
              <p className="mb-4"><strong>Type:</strong> {item.type}</p>
              {item.url && (
                <p className="mb-4">
                  <strong>URL:</strong> <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[#0071e3] hover:underline">{item.url}</a>
                </p>
              )}
              {!resource && <p className="mt-4 text-[#636366] italic">Content not available for this item type.</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHomeView = () => {
    return (
      <div className="flex-1 bg-white rounded-[12px] border border-[#e5e5e7] p-8 overflow-auto">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-[36px] font-semibold text-[#1d1d1f] mb-6">{course.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-5 bg-[#EEECE8] rounded-[12px]">
              <div className="text-[13px] text-[#636366] mb-1">Modules</div>
              <div className="text-[28px] font-semibold text-[#1d1d1f]">{course.modules.length}</div>
            </div>
            <div className="p-5 bg-[#EEECE8] rounded-[12px]">
              <div className="text-[13px] text-[#636366] mb-1">Resources</div>
              <div className="text-[28px] font-semibold text-[#1d1d1f]">{course.resources.length}</div>
            </div>
            <div className="p-5 bg-[#EEECE8] rounded-[12px]">
              <div className="text-[13px] text-[#636366] mb-1">Total Files</div>
              <div className="text-[28px] font-semibold text-[#1d1d1f]">{course.fileCount}</div>
            </div>
            <div className="p-5 bg-[#EEECE8] rounded-[12px]">
              <div className="text-[13px] text-[#636366] mb-1">Total Items</div>
              <div className="text-[28px] font-semibold text-[#1d1d1f]">
                {course.modules.reduce((sum, m) => sum + m.items.length, 0)}
              </div>
            </div>
          </div>

          <div className="border-t border-[#e5e5e7] pt-6">
            <h2 className="text-[22px] font-semibold text-[#1d1d1f] mb-4">Course Structure</h2>
            <div className="space-y-3">
              {course.modules.map((module, index) => (
                <div key={index} className="p-4 bg-[#EEECE8] rounded-[10px]">
                  <div className="text-[17px] font-semibold text-[#1d1d1f] mb-2">{module.title}</div>
                  <div className="text-[14px] text-[#636366]">{module.items.length} items</div>
                </div>
              ))}
            </div>
          </div>

          {onScanCourse && (
            <div className="mt-8 p-6 bg-gradient-to-br from-[#0071e3]/5 to-[#0071e3]/10 rounded-[12px] border border-[#0071e3]/20">
              <h3 className="text-[19px] font-semibold text-[#1d1d1f] mb-2">Ready to Simplify?</h3>
              <p className="text-[15px] text-[#636366] mb-4">
                Scan this course for accessibility and usability issues to get started with improvements.
              </p>
              <Button
                onClick={onScanCourse}
                className="bg-[#0071e3] hover:bg-[#0077ed] text-white h-[40px] px-6 rounded-full"
              >
                <ScanSearch className="w-4 h-4 mr-2" strokeWidth={2} />
                Scan This Course
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Course Header */}
      <div className="bg-white border-b border-[#d2d2d7] px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-[-0.022em]">{course.title}</h1>
            <p className="text-[15px] text-[#636366] mt-1">
              Imported IMSCC Course · {course.modules.length} modules · {course.fileCount} files
            </p>
          </div>
          {onScanCourse && (
            <Button
              onClick={onScanCourse}
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white h-[40px] px-6 rounded-full"
            >
              <ScanSearch className="w-4 h-4 mr-2" strokeWidth={2} />
              Scan Course
            </Button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 mt-6">
          <button
            onClick={() => {
              setCurrentView("home");
              setSelectedItem(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[15px] font-semibold transition-colors ${
              currentView === "home"
                ? "bg-[#0071e3] text-white"
                : "text-[#636366] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]"
            }`}
          >
            <Home className="w-4 h-4" strokeWidth={2} />
            Home
          </button>
          <button
            onClick={() => {
              setCurrentView("modules");
              setSelectedItem(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[15px] font-semibold transition-colors ${
              currentView === "modules"
                ? "bg-[#0071e3] text-white"
                : "text-[#636366] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]"
            }`}
          >
            <BookOpen className="w-4 h-4" strokeWidth={2} />
            Modules
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 p-8 overflow-hidden">
        {currentView === "home" ? (
          renderHomeView()
        ) : (
          <>
            {/* Modules Sidebar */}
            <div className="w-[360px] bg-white rounded-[12px] border border-[#e5e5e7] overflow-auto">
              <div className="p-4 border-b border-[#e5e5e7]">
                <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Course Modules</h2>
              </div>
              <div className="p-2">
                {course.modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="mb-2">
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModule(module.title)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-[8px] hover:bg-[#f5f5f7] transition-colors text-left"
                    >
                      {expandedModules.has(module.title) ? (
                        <ChevronDown className="w-4 h-4 text-[#636366] flex-shrink-0" strokeWidth={2} />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#636366] flex-shrink-0" strokeWidth={2} />
                      )}
                      <span className="text-[15px] font-semibold text-[#1d1d1f] flex-1">{module.title}</span>
                      <span className="text-[12px] text-[#636366] bg-[#EEECE8] px-2 py-0.5 rounded-full">
                        {module.items.length}
                      </span>
                    </button>

                    {/* Module Items */}
                    {expandedModules.has(module.title) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {module.items.map((item, itemIndex) => (
                          <button
                            key={itemIndex}
                            onClick={() => setSelectedItem(item)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-[6px] transition-colors text-left ${
                              selectedItem === item
                                ? "bg-[#0071e3]/10 text-[#0071e3]"
                                : "hover:bg-[#f5f5f7] text-[#1d1d1f]"
                            }`}
                          >
                            <span className={selectedItem === item ? "text-[#0071e3]" : "text-[#636366]"}>
                              {getItemIcon(item.type)}
                            </span>
                            <span className="text-[14px] flex-1 truncate">{item.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content Display */}
            {selectedItem ? (
              renderContent(selectedItem)
            ) : (
              <div className="flex-1 bg-white rounded-[12px] border border-[#e5e5e7] flex items-center justify-center">
                <div className="text-center text-[#636366]">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" strokeWidth={1.5} />
                  <p className="text-[15px]">Select a module item to view its content</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
