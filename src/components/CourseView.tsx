import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Home, BookOpen, FileText, CheckSquare, MessageSquare, BarChart2, Users, Settings, Search, Trash2, AlertTriangle, File, ChevronDown, ChevronRight, Link2 } from "lucide-react";
import { getCourseModules, getCourseAssignments, getCourseFrontPage, deleteCourse as deleteCanvasCourse, getCanvasConfig, type CanvasModule, type CanvasModuleItem, type CanvasAssignment } from "../utils/canvasAPI";
import { Button } from "./ui/button";
import { toast } from "sonner@2.0.3";
import { FilesView, type CourseFile } from "./FilesView";
import { getCourse, deleteCourse as deleteImportedCourse } from "../utils/api";
import type { IMSCCModule, IMSCCItem } from "../utils/imsccParser";
import { AssignmentViewer } from "./AssignmentViewer";
import { PageViewer } from "./PageViewer";
import { FileViewer } from "./FileViewer";
import { DiscussionViewer } from "./DiscussionViewer";

interface CourseViewProps {
  courseId: number;
  courseName: string;
  onBack: () => void;
  onScan?: () => void; // Make optional
  onCourseDeleted?: () => void;
  isImported?: boolean;
  originalCourseId?: string; // Add this field
}

export function CourseView({ courseId, courseName, onBack, onScan, onCourseDeleted, isImported, originalCourseId }: CourseViewProps) {
  const [activeTab, setActiveTab] = useState<"home" | "modules" | "assignments" | "files">("home");
  const [modules, setModules] = useState<CanvasModule[]>([]);
  const [assignments, setAssignments] = useState<CanvasAssignment[]>([]);
  const [frontPage, setFrontPage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Use ref to prevent double API calls
  const hasLoadedRef = useRef(false);

  // Debug logging - CRITICAL DIAGNOSTICS

  useEffect(() => {
    
    // Reset the ref when courseId changes (switching between courses)
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = false;
    }
    
    // Load data based on course type
    if (isImported === true) {
      // Load imported course from backend
      loadImportedCourse();
    } else if (isImported === false) {
      // Load Canvas course from API
      loadCanvasCourse();
    } else {
      // Unknown state
      setIsLoading(false);
    }
    
    hasLoadedRef.current = true;
  }, [courseId, isImported, courseName, originalCourseId]);

  const loadImportedCourse = async () => {
    try {
      setIsLoading(true);
      const deleteId = originalCourseId || courseId.toString();
      
      toast.loading('Loading imported course...', { id: 'load-course' });
      
      const response = await getCourse(deleteId);
      
      // Set front page if available
      if (response.course?.courseData?.frontPage) {
        setFrontPage(response.course.courseData.frontPage);
      } else {
        setFrontPage(null);
      }
      
      // Convert IMSCC modules to Canvas module format
      if (response.course?.courseData?.modules) {
        const convertedModules: CanvasModule[] = response.course.courseData.modules.map((imsccModule: IMSCCModule, index: number) => ({
          id: index + 1,
          name: imsccModule.title,
          position: index + 1,
          unlock_at: undefined,
          require_sequential_progress: false,
          prerequisite_module_ids: [],
          state: 'active',
          items_count: imsccModule.items?.length || 0,
          items_url: '',
          items: imsccModule.items?.map((imsccItem: IMSCCItem, itemIndex: number) => ({
            id: itemIndex + 1,
            title: imsccItem.title,
            type: imsccItem.type || 'Page',
            content_id: itemIndex + 1,
            html_url: '',
            position: itemIndex + 1,
            indent: 0,
            module_id: index + 1,
            // Store the identifierref to look up page content
            page_url: imsccItem.content_id || imsccItem.identifierref,
          })) || [],
        }));
        
        setModules(convertedModules);
        toast.success(`Loaded ${convertedModules.length} modules from imported course`, { id: 'load-course', duration: 1000 });
      } else {
        toast.info('No modules found in this course', { id: 'load-course', duration: 1000 });
      }
    } catch (error) {
      console.error('❌ Error loading imported course:', error);
      toast.error(`Failed to load course: ${error.message}`, { id: 'load-course' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCanvasCourse = async () => {
    try {
      setIsLoading(true);
      toast.loading('Loading Canvas course...', { id: 'load-course' });
      
      await Promise.all([
        loadModules(),
        loadAssignments(),
        loadFrontPage(),
      ]);
      
      toast.success('Course loaded successfully', { id: 'load-course', duration: 1000 });
    } catch (error) {
      console.error('❌ Error loading Canvas course:', error);
      toast.error(`Failed to load course: ${error.message}`, { id: 'load-course' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadModules = async () => {
    
    // CRITICAL: Don't load if this is NOT explicitly a Canvas course
    if (isImported !== false) {
      setIsLoading(false);
      return;
    }
    
    // Don't load for invalid course IDs (e.g., "All Courses" with courseId 0)
    if (!courseId || courseId === 0 || isNaN(courseId)) {
      setIsLoading(false);
      return;
    }

    try {
      const config = getCanvasConfig();
      if (!config) {
        toast.error("Canvas configuration not found");
        setIsLoading(false);
        return;
      }

      toast.loading("Loading modules...", { id: 'load-modules' });
      const courseModules = await getCourseModules(config, courseId);
      
      toast.success(`Loaded ${courseModules.length} modules`, { id: 'load-modules', duration: 1000 });
      
      setModules(courseModules);
    } catch (error) {
      console.error("Error loading modules:", error);
      // Don't show toast for blocked imported courses
      if (isImported !== false) {
        return;
      }
      toast.error(`Failed to load modules: ${error.message}`, { id: 'load-modules' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAssignments = async () => {
    
    // CRITICAL: Don't load if this is NOT explicitly a Canvas course
    if (isImported !== false) {
      return;
    }
    
    // Don't load for invalid course IDs (e.g., "All Courses" with courseId 0)
    if (!courseId || courseId === 0 || isNaN(courseId)) {
      return;
    }

    try {
      const config = getCanvasConfig();
      if (!config) return;

      const courseAssignments = await getCourseAssignments(config, courseId);
      setAssignments(courseAssignments);
    } catch (error) {
      console.error("Error loading assignments:", error);
      // Don't show error for imported courses
      if (isImported !== false) {
        return;
      }
      toast.error(`Failed to load assignments: ${error.message}`, { id: 'load-assignments' });
    }
  };

  const loadFrontPage = async () => {
    
    // CRITICAL: Don't load if this is NOT explicitly a Canvas course
    if (isImported !== false) {
      return;
    }
    
    // Don't load for invalid course IDs (e.g., "All Courses" with courseId 0)
    if (!courseId || courseId === 0 || isNaN(courseId)) {
      return;
    }

    try {
      const config = getCanvasConfig();
      if (!config) return;

      const page = await getCourseFrontPage(config, courseId);
      if (page?.body) {
        setFrontPage(page.body);
      }
    } catch (error) {
      console.error("Error loading front page:", error);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      setIsDeleting(true);
      
      // ⚡ TRIPLE-LAYER DEFENSE: Check if this is an imported course
      if (isImported) {
        // Use originalCourseId if available, otherwise fall back to courseId.toString()
        const deleteId = originalCourseId || courseId.toString();
        
        // Delete from our backend database
        const result = await deleteImportedCourse(deleteId);
        toast.success("Course deleted successfully");
      } else {
        // Delete via Canvas API
        const config = getCanvasConfig();
        if (!config) {
          toast.error("Not connected to Canvas");
          setIsDeleting(false);
          return;
        }
        await deleteCanvasCourse(config, courseId);
        toast.success("Course deleted successfully");
      }
      
      // Close the confirmation modal
      setShowDeleteConfirm(false);
      
      // Notify parent to refresh and navigate back
      if (onCourseDeleted) {
        onCourseDeleted();
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error(`Failed to delete course: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col h-screen">
      {/* Top Header Bar - Spans full width */}
      <div className="border-b border-[#C7CDD1] bg-white flex flex-shrink-0">
        {/* Sidebar Header Section */}
        <div className="w-[200px] px-4 py-4 flex items-center flex-shrink-0">
          <button
            onClick={onBack}
            className="text-[#0084ff] hover:text-[#0077ed] flex items-center gap-2 text-[13px]"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Courses
          </button>
        </div>

        {/* Main Header Section */}
        <div className="flex-1 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-[23px] font-light text-[#2D3B45]">{courseName}</h1>
            <div className="flex items-center gap-3">
              {onScan && (
                <Button
                  onClick={onScan}
                  className="bg-[#00D084] hover:bg-[#00BA75] text-white h-[36px] px-4 rounded-md text-[14px]"
                >
                  Scan with SIMPLIFY
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area with Sidebar */}
      <div className="flex flex-1">
        {/* Vertical Canvas-style Sidebar - WHITE BACKGROUND */}
        <div className="w-[200px] bg-white flex-shrink-0 border-r border-[#C7CDD1]">
          {/* Navigation Items */}
          <nav className="py-2">
            <CourseNavTab
              icon={<Home className="w-5 h-5" />}
              label="Home"
              active={activeTab === "home"}
              onClick={() => setActiveTab("home")}
            />
            <CourseNavTab
              icon={<BookOpen className="w-5 h-5" />}
              label="Modules"
              active={activeTab === "modules"}
              onClick={() => setActiveTab("modules")}
            />
            <CourseNavTab
              icon={<CheckSquare className="w-5 h-5" />}
              label="Assignments"
              active={activeTab === "assignments"}
              onClick={() => setActiveTab("assignments")}
            />
            <CourseNavTab
              icon={<BarChart2 className="w-5 h-5" />}
              label="Grades"
              active={false}
              onClick={() => {}}
            />
            <CourseNavTab
              icon={<Users className="w-5 h-5" />}
              label="People"
              active={false}
              onClick={() => {}}
            />
            <CourseNavTab
              icon={<Settings className="w-5 h-5" />}
              label="Settings"
              active={false}
              onClick={() => {}}
            />
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto" style={{ fontSize: '14px' }}>
          {/* Content */}
          <div className="max-w-[1012px] mx-auto px-6 py-6 pb-[120px]">
            {activeTab === "modules" && (
              <>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-[#E5E5E5] border-t-[#0084ff] rounded-full animate-spin" />
                    <p className="text-[14px] text-[#6B7780] mt-4">Loading modules...</p>
                  </div>
                ) : modules.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-[#C7CDD1] mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-[16px] text-[#6B7780] mb-2">No modules found</p>
                    <p className="text-[13px] text-[#6B7780]">
                      This course doesn't have any modules yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((module) => (
                      <ModuleCard 
                        key={module.id} 
                        module={module} 
                        courseId={courseId}
                        isImported={isImported}
                        originalCourseId={originalCourseId}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "home" && (
              <>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-[#E5E5E5] border-t-[#0084ff] rounded-full animate-spin" />
                    <p className="text-[14px] text-[#6B7780] mt-4">Loading course home...</p>
                  </div>
                ) : frontPage ? (
                  <div 
                    className="canvas-content"
                    dangerouslySetInnerHTML={{ __html: frontPage }}
                  />
                ) : (
                  <div className="text-center py-24">
                    <Home className="w-20 h-20 text-[#C7CDD1] mx-auto mb-6" strokeWidth={1} />
                    <p className="text-[20px] text-[#2D3B45] font-normal mb-3">Welcome to {courseName}</p>
                    <p className="text-[14px] text-[#6B7780]">
                      This course doesn't have a home page configured yet
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === "assignments" && (
              <>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-[#E5E5E5] border-t-[#0084ff] rounded-full animate-spin" />
                    <p className="text-[14px] text-[#6B7780] mt-4">Loading assignments...</p>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckSquare className="w-16 h-16 text-[#C7CDD1] mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-[16px] text-[#6B7780] mb-2">No assignments found</p>
                    <p className="text-[13px] text-[#6B7780]">
                      This course doesn't have any assignments yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {/* Assignment List Header */}
                    <div className="bg-[#F5F5F5] border border-[#C7CDD1] rounded-t-md px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-[#6B7780]" />
                        <h2 className="text-[16px] font-semibold text-[#2D3B45]">Assignments</h2>
                      </div>
                      <span className="text-[13px] text-[#6B7780]">
                        {assignments.length} {assignments.length === 1 ? 'assignment' : 'assignments'}
                      </span>
                    </div>
                    
                    {/* Assignment List */}
                    <div className="border-l border-r border-b border-[#C7CDD1] rounded-b-md bg-white">
                      {assignments.map((assignment, index) => (
                        <AssignmentListItem
                          key={assignment.id}
                          assignment={assignment}
                          courseId={courseId}
                          isLast={index === assignments.length - 1}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "files" && (
              <FilesView courseId={courseId} isImported={isImported} />
            )}
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-md shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h2 className="text-[16px] font-semibold text-[#2D3B45]">Confirm Delete</h2>
                </div>
                <p className="text-[14px] text-[#6B7780] mb-4">
                  Are you sure you want to delete this course? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-4">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 h-[36px] px-4 rounded-md text-[14px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteCourse}
                    className="bg-red-500 hover:bg-red-600 text-white h-[36px] px-4 rounded-md text-[14px]"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <div className="inline-block w-5 h-5 border-4 border-[#E5E5E5] border-t-[#0084ff] rounded-full animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CourseNavTabProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function CourseNavTab({ icon, label, active, onClick }: CourseNavTabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 text-[14px] transition-colors border-l-[3px]
        ${active
          ? 'border-l-[#0084ff] bg-[#F0F8FF] text-[#0084ff] font-medium'
          : 'border-l-transparent text-[#0084ff] hover:bg-[#F5F5F5]'
        }
      `}
    >
      <span className={active ? 'text-[#0084ff]' : 'text-[#0084ff]'}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

interface ModuleCardProps {
  module: CanvasModule;
  courseId: number;
  isImported?: boolean;
  originalCourseId?: string;
}

function ModuleCard({ module, courseId, isImported, originalCourseId }: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{type: string; id: number; title: string; url?: string; fileName?: string} | null>(null);

  const handleItemClick = (item: CanvasModuleItem) => {
    
    // For external URLs, open in new tab
    if (item.type === 'ExternalUrl') {
      const url = item.external_url || item.url;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        console.error('❌ External URL item has no URL:', item);
      }
      return;
    }
    
    // For Files (PDFs, documents, etc.), open in FileViewer
    if (item.type === 'File') {
      // Use content_id to fetch the file via Canvas API
      setSelectedItem({
        type: 'File',
        id: item.content_id,
        title: item.title,
        fileName: item.title
      });
      return;
    }
    
    // For Discussions, open in DiscussionViewer
    if (item.type === 'Discussion') {
      setSelectedItem({
        type: 'Discussion',
        id: item.content_id,
        title: item.title,
      });
      return;
    }
    
    // For Quizzes, open in new tab (Canvas handles quizzes specially)
    if (item.type === 'Quiz') {
      const url = item.html_url || item.url;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        console.error('❌ Quiz item has no URL:', item);
        toast.error('Unable to open quiz - no URL found');
      }
      return;
    }
    
    // For assignments, open in modal viewer
    if (item.type === 'Assignment') {
      setSelectedItem({
        type: 'Assignment',
        id: item.content_id,
        title: item.title,
      });
      return;
    }
    
    // For pages, open in modal viewer
    if (item.type === 'Page') {
      // For pages, we need to extract the page URL from the item
      // Canvas stores the page URL in the 'page_url' field or we can extract from 'url'
      let pageUrl = item.page_url;
      
      // If page_url is not available, try to extract from url or html_url
      if (!pageUrl && item.url) {
        // Extract the page slug from the URL
        // URL format: /api/v1/courses/:course_id/pages/:page_url
        const urlMatch = item.url.match(/\/pages\/([^?]+)/);
        if (urlMatch) {
          pageUrl = urlMatch[1];
        }
      }
      
      if (!pageUrl && item.html_url) {
        // Extract from html_url
        // HTML URL format: https://canvas.domain/courses/:course_id/pages/:page_url
        const htmlUrlMatch = item.html_url.match(/\/pages\/([^?]+)/);
        if (htmlUrlMatch) {
          pageUrl = htmlUrlMatch[1];
        }
      }
      
      if (pageUrl) {
        setSelectedItem({
          type: 'Page',
          id: item.content_id,
          title: item.title,
          url: pageUrl,
        });
      } else {
        console.error('❌ Could not determine page URL from item:', item);
        toast.error('Unable to open page - no URL found');
      }
      return;
    }
    
    // For any other type, try to open the html_url or url if available
    const fallbackUrl = item.html_url || item.url;
    if (fallbackUrl) {
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    } else {
      console.error(`❌ ${item.type} item has no URL:`, item);
      toast.error(`Unable to open ${item.type} - no URL found`);
    }
  };

  return (
    <>
      <div className="border border-[#C7CDD1] rounded-md overflow-hidden bg-white">
        {/* Module Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 bg-[#F5F5F5] hover:bg-[#E5E5E5] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              <ChevronLeft className="w-5 h-5 text-[#6B7780] rotate-180" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#2D3B45]">{module.name}</h3>
          </div>
          <div className="text-[13px] text-[#6B7780]">
            {module.items_count} {module.items_count === 1 ? 'item' : 'items'}
          </div>
        </button>

        {/* Module Items */}
        {isExpanded && (
          <div className="border-t border-[#C7CDD1]">
            {!module.items || module.items.length === 0 ? (
              <div className="p-4 text-center text-[14px] text-[#6B7780]">
                No items in this module
              </div>
            ) : (
              module.items.map((item, index) => {
                // Check if item is a SubHeader (not clickable)
                const isSubHeader = item.type === 'SubHeader';
                
                return isSubHeader ? (
                  // SubHeader - Not clickable, just a text divider
                  <div
                    key={item.id}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 bg-[#EEECE8]
                      ${index !== module.items!.length - 1 ? 'border-b border-[#E5E5E5]' : ''}
                    `}
                  >
                    <ModuleItemIcon type={item.type} />
                    <div className="flex-1">
                      <h4 className="text-[14px] text-[#6B7780] font-medium">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                ) : (
                  // Clickable items
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`
                      w-full flex items-center gap-3 p-4 hover:bg-[#F5F5F5] transition-colors cursor-pointer text-left
                      ${index !== module.items!.length - 1 ? 'border-b border-[#E5E5E5]' : ''}
                    `}
                  >
                    <ModuleItemIcon type={item.type} />
                    <div className="flex-1">
                      <h4 className={`text-[14px] ${item.type === 'ExternalUrl' ? 'text-[#0084ff] hover:underline' : 'text-[#2D3B45] hover:text-[#0084ff]'}`}>
                        {item.title}
                      </h4>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Assignment Viewer */}
      {selectedItem?.type === 'Assignment' && (
        <AssignmentViewer
          courseId={courseId}
          assignmentId={selectedItem.id}
          assignmentName={selectedItem.title}
          onClose={() => setSelectedItem(null)}
          isImported={isImported}
          originalCourseId={originalCourseId}
        />
      )}

      {/* Page Viewer */}
      {selectedItem?.type === 'Page' && selectedItem.url && (
        <PageViewer
          courseId={courseId}
          pageUrl={selectedItem.url}
          pageTitle={selectedItem.title}
          onClose={() => setSelectedItem(null)}
          isImported={isImported}
          originalCourseId={originalCourseId}
        />
      )}

      {/* File Viewer */}
      {selectedItem?.type === 'File' && (
        <FileViewer
          fileId={selectedItem.id}
          courseId={courseId}
          fileName={selectedItem.fileName || selectedItem.title}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Discussion Viewer */}
      {selectedItem?.type === 'Discussion' && (
        <DiscussionViewer
          courseId={courseId}
          discussionId={selectedItem.id}
          discussionTitle={selectedItem.title}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}

function ModuleItemIcon({ type }: { type: string }) {
  const iconClass = "w-5 h-5 text-[#6B7780]";
  
  switch (type) {
    case "Assignment":
      return <CheckSquare className={iconClass} strokeWidth={1.5} />;
    case "Page":
      return <FileText className={iconClass} strokeWidth={1.5} />;
    case "Discussion":
      return <MessageSquare className={iconClass} strokeWidth={1.5} />;
    case "ExternalUrl":
      return <Link2 className={iconClass} strokeWidth={1.5} />;
    case "File":
      return <FileText className={iconClass} strokeWidth={1.5} />;
    default:
      return <BookOpen className={iconClass} strokeWidth={1.5} />;
  }
}

interface AssignmentListItemProps {
  assignment: CanvasAssignment;
  courseId: number;
  isLast: boolean;
}

function AssignmentListItem({ assignment, courseId, isLast }: AssignmentListItemProps) {
  const [showViewer, setShowViewer] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowViewer(true)}
        className={`
          w-full px-4 py-3 flex items-center justify-between hover:bg-[#F5F5F5] transition-colors text-left
          ${isLast ? 'border-b-0' : 'border-b border-[#E5E5E5]'}
        `}
      >
        <div className="flex items-center gap-3 flex-1">
          <CheckSquare className="w-5 h-5 text-[#6B7780]" strokeWidth={1.5} />
          <div className="flex-1">
            <h3 className="text-[14px] text-[#0084ff] hover:underline">{assignment.name}</h3>
            {assignment.points_possible !== null && assignment.points_possible !== undefined && (
              <p className="text-[13px] text-[#6B7780] mt-0.5">{assignment.points_possible} pts</p>
            )}
          </div>
        </div>
        <div className="text-[13px] text-[#6B7780]">
          {assignment.due_at ? (
            <span>Due {new Date(assignment.due_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: new Date(assignment.due_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
            })}</span>
          ) : (
            <span className="text-[#8B9BA8]">No due date</span>
          )}
        </div>
      </button>

      {/* Assignment Viewer Modal */}
      {showViewer && (
        <AssignmentViewer
          courseId={courseId}
          assignmentId={assignment.id}
          assignmentName={assignment.name}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  );
}