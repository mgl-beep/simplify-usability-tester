import { useState, useEffect, useRef } from "react";
import { CanvasConnectionModal } from "./components/CanvasConnectionModal";
import { CanvasLayout } from "./components/CanvasLayout";
import { CanvasDashboard } from "./components/CanvasDashboard";
import { CanvasCourses } from "./components/CanvasCourses";
import { CourseView } from "./components/CourseView";
import { CanvasCommons } from "./components/CanvasCommons";
import { SimplifyDashboard } from "./components/SimplifyDashboard";
import { AccountPanel } from "./components/AccountPanel";
import { ScanPanel } from "./components/ScanPanel";
import { FixItModal } from "./components/FixItModal";
import { TemplatePreview } from "./components/TemplatePreview";
import { StandardsModal } from "./components/StandardsModal";
import { IssuesListModal } from "./components/IssuesListModal";
import { IssueDetailModal } from "./components/IssueDetailModal";
import { InContextFixModal } from "./components/InContextFixModal";
import { CourseSelectionModal } from "./components/CourseSelectionModal";
import { ButtonDesignVariations } from "./components/ButtonDesignVariations";
import { ContentPreviewModal } from "./components/ContentPreviewModal";
import { LoginHeaderVariants } from "./components/LoginHeaderVariants";
import { AnalyticsVariations } from "./components/AnalyticsVariations";
import { ModalDesignComparison } from "./components/ModalDesignComparison";
import { RubricTagsDemoExample } from "./components/RubricTagsDemo";
import StatusBarVariations from "./components/StatusBarVariations";
import { IssuesLayoutPicker } from "./components/IssuesLayoutPicker";
import { PilotWelcome } from "./components/PilotWelcome";
import { PrivacyStatement } from "./components/PrivacyStatement";
import { ConfirmationModal } from "./components/ui/confirmation-modal";
import { isConnectedToCanvas, getCanvasDomain, getCanvasConfig } from "./utils/canvasAPI";
import { scanCanvasCourse } from "./utils/courseScanner";
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Toaster, toast } from "sonner@2.0.3";

// 🎛️ FEATURE FLAGS - Toggle features on/off
// To re-enable a feature, change its value from false to true
const FEATURE_FLAGS = {
  ENABLE_SCAN_FROM_COURSES_TAB: false, // Set to true to re-enable "Scan Course" and "Scan with SIMPLIFY" buttons in Courses tab
};

export interface ScanIssue {
  id: string;
  type: "accessibility" | "usability" | "design";
  category: "alt-text" | "contrast" | "video-caption" | "pdf-tag" | "broken-link" | "deep-nav" | "inconsistent-heading" | "formatting" | "long-url" | "confusing-navigation" | "readability" | "deep-click-path" | "table-headers" | "table-caption" | "layout-table" | "objectives" | "color-only" | "autoplay" | "policies" | "audio-description" | "link-accessibility" | "communication-guidelines" | "module-discussion";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  location: string;
  autoFixAvailable: boolean;
  courseName?: string;
  courseId?: string;
  status?: "pending" | "staged" | "ignored" | "published" | "resolved";
  rubricStandard?: string; // Deprecated - use standardsTags instead
  standardsTags: string[]; // Array of standard tags (e.g., ["cvc-oei:D3", "qm:8.3", "peralta:E4"])
  isDemo?: boolean; // Flag to indicate sample/demo issues
  // Enhanced fields for functional scanner
  contentType?: 'page' | 'assignment' | 'announcement' | 'discussion' | 'quiz' | 'module' | 'course' | 'file';
  contentId?: string;
  canvasUrl?: string; // Deep link to Canvas editor
  elementHtml?: string; // HTML snippet of the problematic element
  textColor?: string; // For contrast issues: the detected text color (hex)
  backgroundColor?: string; // For contrast issues: the effective background color (hex)
  suggestedFix?: string; // What to do to fix it
  fixSteps?: string[]; // Step-by-step instructions
  existingObjectives?: string[]; // For objectives issues - extracted existing objectives
  whereToAdd?: string; // For objectives issues - where to add them (page name)
  whereToAddPageUrl?: string; // For objectives issues - the Canvas page URL to update (not just title)
  evidenceHtml?: string; // Evidence of the issue (for rubric scanner)
  suggestedContent?: string; // AI-suggested content to fix the issue
  impactStatement?: string; // How this impacts students
  moduleId?: string; // For module-level issues
  complexCaption?: string; // For complex images: AI-generated text description to inject below image
  // Staging workflow fields
  stagedFix?: {
    originalContent: string;
    fixedContent: string;
    timestamp: Date;
    // Custom fields for different fix types
    customAltText?: string;
    customLinkText?: string;
    customCaption?: string;
    customTextColor?: string; // For contrast fixes
    newImageSrc?: string; // For broken image fixes: new Canvas URL after upload
  };
  newImageSrc?: string; // Transient: new Canvas URL for broken image replacement
  videoSrc?: string; // For audio-description issues: the video embed URL
  videoPlatform?: string; // For audio-description issues: YouTube, Vimeo, Canvas Studio, etc.
  linkUrl?: string; // For link-accessibility issues: the external URL that was audited
  linkAccessibilityScore?: number; // 0-100 score from the accessibility check
  linkAccessibilityFailures?: string[]; // What WCAG checks failed
}

export default function App() {
  // 🧹 IMMEDIATE SCAN CACHE CLEAR - Force clear on this load
  const hasClearedScanCache = localStorage.getItem('simplify_scan_cache_cleared_v3');
  
  if (!hasClearedScanCache) {
    localStorage.removeItem('simplify_all_scan_results');
    localStorage.removeItem('simplify_all_scan_times');
    localStorage.removeItem('simplify_scan_results'); // Legacy
    localStorage.removeItem('simplify_last_scan_time'); // Legacy
    localStorage.setItem('simplify_scan_cache_cleared_v3', 'true');
  }
  
  // Connection state
  const [showConnectionModal, setShowConnectionModal] = useState(!isConnectedToCanvas());
  const [userName, setUserName] = useState("");
  const [currentView, setCurrentView] = useState<"dashboard" | "courses" | "simplify" | "calendar" | "inbox" | "history" | "commons" | "account" | "buttons" | "analytics-variations" | "modal-comparison" | "statusbar-variations" | "issues-picker">(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'issues-picker') return 'issues-picker';
    return 'simplify';
  });

  // Course view state - COMBINED to prevent race conditions
  const [selectedCourse, setSelectedCourse] = useState<{
    courseId: number;
    courseName: string;
    isImported: boolean;
    originalCourseId?: string; // Add this field
  } | null>(null); // Start empty — user picks a course from the dropdown
  const [showCourseView, setShowCourseView] = useState(false);
  const [coursesRefreshKey, setCoursesRefreshKey] = useState(0);

  // SIMPLIFY state - Load from localStorage on mount
  const [scanPanelOpen, setScanPanelOpen] = useState(false);
  const [showPilotWelcome, setShowPilotWelcome] = useState(false);
  const [triggerTour, setTriggerTour] = useState(false);
  const [showPrivacyFromWelcome, setShowPrivacyFromWelcome] = useState(false);
  const [scanOpenedFromCourses, setScanOpenedFromCourses] = useState(false); // Track entry path
  const [accountPanelOpen, setAccountPanelOpen] = useState(false);
  const [courseSelectionModalOpen, setCourseSelectionModalOpen] = useState(false);
  const [fixItModalOpen, setFixItModalOpen] = useState(false);
  const [templatePreviewOpen, setTemplatePreviewOpen] = useState(false);
  const [standardsModalOpen, setStandardsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<"navigation" | "accessibility" | null>(null);
  
  // Enabled standards for filtering scan results
  const [enabledStandards, setEnabledStandards] = useState<string[]>(() => {
    const saved = localStorage.getItem('simplify_enabled_standards');
    // Default: all educational rubrics enabled (removed WCAG as it's now implicit in the other rubrics)
    return saved ? JSON.parse(saved) : ['cvc-oei', 'peralta', 'quality-matters'];
  });
  
  // Save enabled standards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('simplify_enabled_standards', JSON.stringify(enabledStandards));
  }, [enabledStandards]);
  
  // Store scan results per course
  const [allCourseScanResults, setAllCourseScanResults] = useState<Record<string, ScanIssue[]>>(() => {
    // Restore scan results from localStorage for persistence across sessions
    const saved = localStorage.getItem('simplify_all_scan_results');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {
        console.warn('Failed to parse saved scan results:', e);
        return {};
      }
    }
    return {};
  });
  
  // Current course's scan results
  const [scanResults, setScanResults] = useState<ScanIssue[]>([]);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [issuesListModalOpen, setIssuesListModalOpen] = useState(false);
  const [selectedIssueForDetail, setSelectedIssueForDetail] = useState<ScanIssue | null>(null);
  const [showInContextFix, setShowInContextFix] = useState(false);
  
  // Publish confirmation state
  const [publishConfirmation, setPublishConfirmation] = useState<{ count: number; singleIssue?: ScanIssue } | null>(null);
  const [skipPublishConfirm, setSkipPublishConfirm] = useState(() => localStorage.getItem('simplify_skip_publish_confirm') === 'true');
  const skipPublishCheckboxRef = useRef(false);
  
  // Module organization AI state
  const [moduleOrganizationPreview, setModuleOrganizationPreview] = useState<{
    issue: ScanIssue;
    modules: any[];
    summary: { totalModules: number; totalItems: number };
  } | null>(null);
  
  // AI Suggestions Cache - ensures consistency for repeated items
  // Key format: "linkText:{url}" | "altText:{imageSrc}" | "tableCaption:{hash}"
  const [aiSuggestionsCache, setAiSuggestionsCache] = useState<Record<string, {
    suggestions: any[];
    pageInfo?: any;
    timestamp: Date;
    usedCount: number;
  }>>({});
  
  // Store last scan time per course
  const [allCourseScanTimes, setAllCourseScanTimes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('simplify_all_scan_times');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Current course's last scan time
  const [lastScanTime, setLastScanTime] = useState<Date | undefined>(() => {
    // Try to restore last scan time on mount
    if (selectedCourse) {
      const courseId = selectedCourse.courseId.toString();
      const savedTime = allCourseScanTimes[courseId];
      return savedTime ? new Date(savedTime) : undefined;
    }
    return undefined;
  });
  
  // Preview state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewIssue, setPreviewIssue] = useState<ScanIssue | null>(null);
  const [previewOriginalContent, setPreviewOriginalContent] = useState<string>("");
  const [previewFixedContent, setPreviewFixedContent] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Batch publish progress tracking (F035+F100)
  const [batchPublishProgress, setBatchPublishProgress] = useState<{
    items: Array<{
      issueId: string;
      title: string;
      location: string;
      status: 'pending' | 'publishing' | 'success' | 'failed';
      error?: string;
    }>;
    completed: number;
    total: number;
    successCount: number;
    failCount: number;
  } | null>(null);

  // Smart Batch Fix state
  const [batchFixCandidate, setBatchFixCandidate] = useState<{
    issue: ScanIssue;
    customFix?: string;
    duplicates: ScanIssue[];
    count: number;
  } | null>(null);

  // Video caption batch prompt state
  const [videoCaptionBatchPrompt, setVideoCaptionBatchPrompt] = useState<number | null>(null);

  // Contrast batch fix prompt state
  const [contrastBatchPrompt, setContrastBatchPrompt] = useState<{
    color: string;
    count: number;
    issues: ScanIssue[];
  } | null>(null);

  // Revert Confirmation state
  const [revertConfirmation, setRevertConfirmation] = useState<ScanIssue | null>(null);
  const [revertAllChecked, setRevertAllChecked] = useState(false);

  // Undo Published Fix confirmation state
  const [undoConfirmation, setUndoConfirmation] = useState<ScanIssue | null>(null);

  // Persist scan results and last scan time to localStorage whenever they change
  useEffect(() => {
    if (scanResults.length > 0) {
      const courseId = selectedCourse?.courseId.toString() || '';
      const updatedResults = {
        ...allCourseScanResults,
        [courseId]: scanResults
      };
      localStorage.setItem('simplify_all_scan_results', JSON.stringify(updatedResults));
    }
  }, [scanResults]);

  // Persist selected course to localStorage whenever it changes
  // Skip courseId <= 0 (synthetic "All Courses" value) — it is not a real Canvas course
  useEffect(() => {
    if (selectedCourse && selectedCourse.courseId > 0) {
      localStorage.setItem('simplify_last_selected_course', JSON.stringify(selectedCourse));
    }
  }, [selectedCourse]);

  // Persist scan time to localStorage whenever it changes
  useEffect(() => {
    if (lastScanTime && selectedCourse) {
      const courseId = selectedCourse.courseId.toString();
      const timeString = lastScanTime.toISOString();
      
      // Only update if the time has actually changed
      if (allCourseScanTimes[courseId] !== timeString) {
        const updatedTimes = {
          ...allCourseScanTimes,
          [courseId]: timeString
        };
        setAllCourseScanTimes(updatedTimes);
        localStorage.setItem('simplify_all_scan_times', JSON.stringify(updatedTimes));
      }
    }
  }, [lastScanTime, selectedCourse]);

  // Don't auto-restore scan results on mount — start with empty state
  // Results will populate when the user runs a scan or selects a course from the dropdown

  // Restore scan time when switching courses
  useEffect(() => {
    if (selectedCourse) {
      const courseId = selectedCourse.courseId.toString();
      const savedTime = allCourseScanTimes[courseId];
      if (savedTime) {
        setLastScanTime(new Date(savedTime));
      } else {
        setLastScanTime(undefined);
      }
    }
  }, [selectedCourse]);

  // Close account panel when view changes
  useEffect(() => {
    if (accountPanelOpen) {
      setAccountPanelOpen(false);
    }
  }, [currentView]); // Only watch currentView, not accountPanelOpen

  const handleConnected = (name: string) => {
    setUserName(name);
    setShowConnectionModal(false);
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'issues-picker') {
      setCurrentView('issues-picker');
    } else {
      setCurrentView("simplify"); // Open on SIMPLIFY Dashboard after login
    }
    // Show pilot welcome on first connection
    if (!localStorage.getItem('simplify_pilot_welcome_seen')) {
      setTimeout(() => setShowPilotWelcome(true), 500);
    }
  };

  const handleDisconnect = () => {
    // Clear Canvas connection
    localStorage.removeItem('canvas_domain');
    sessionStorage.removeItem('canvas_access_token'); // Token is in sessionStorage
    localStorage.removeItem('canvas_token'); // Keep for backwards compatibility
    // Clear persisted scan data
    localStorage.removeItem('simplify_all_scan_results');
    localStorage.removeItem('simplify_all_scan_times');
    localStorage.removeItem('simplify_last_selected_course');
    // Reset state
    setShowConnectionModal(true);
    setUserName("");
    setSelectedCourse(null);
    setShowCourseView(false);
    setScanResults([]);
    setLastScanTime(undefined);
    toast.success("Disconnected from Canvas", { duration: 1000 });
  };

  const handleSelectCourse = (courseId: number, courseName: string, isImported?: boolean, originalCourseId?: string) => {
    setSelectedCourse({ courseId, courseName, isImported: isImported === true, originalCourseId });
    setShowCourseView(true);
    setCurrentView('courses'); // Automatically switch to courses view
  };

  const handleBackToCourses = () => {
    setShowCourseView(false);
    setSelectedCourse(null);
  };

  const handleCourseDeleted = () => {
    // Go back to courses list after deletion
    handleBackToCourses();
    toast.success("Course deleted successfully", { duration: 1000 });
    // Refresh courses list
    setCoursesRefreshKey(prev => prev + 1);
  };

  const handleScanFromCourseView = () => {
    if (selectedCourse) {
      performScan(selectedCourse.courseId.toString(), selectedCourse.courseName, true); // true = open in drawer
    }
  };

  const performScan = async (courseId: string, courseName: string, openInDrawer: boolean = false) => {

    // Clear any previous scan error
    setScanError(null);

    // Clear only the current course's cached results (preserve other courses' data)
    const updatedResults = { ...allCourseScanResults };
    delete updatedResults[courseId];
    setAllCourseScanResults(updatedResults);
    localStorage.setItem('simplify_all_scan_results', JSON.stringify(updatedResults));

    setScanResults([]);
    setLastScanTime(undefined);
    
    // 3. Add random cache buster to ensure fresh fetch
    const cacheBuster = Date.now() + Math.random();
    
    // If scanning from Course View, open drawer instead of navigating
    if (openInDrawer) {
      setScanPanelOpen(true);
      setScanOpenedFromCourses(true); // Track entry path
    } else {
      // Navigate to SIMPLIFY Overview tab when scanning from dashboard
      setCurrentView("simplify");
    }
    
    setIsScanning(true);
    const scanToastId = `course-scan-${Date.now()}`;
    toast.loading(`Scanning ${courseName}...`, { id: scanToastId, duration: Infinity });

    try {
      // Check if this is an imported course
      const isImported = selectedCourse?.isImported || false;
      
      // Use appropriate scanner based on course type
      let issues: ScanIssue[] = [];
      
      if (isImported) {
        // Scan imported course from Supabase
        const { scanImportedCourse } = await import('./utils/courseScanner');
        issues = await scanImportedCourse(courseId, courseName, enabledStandards);
      } else {
        // Scan live Canvas course with cache-busting
        const { scanCanvasCourse } = await import('./utils/courseScanner');
        issues = await scanCanvasCourse(courseId, courseName, enabledStandards);
      }
      
      // Don't check for previously fixed issues - we cleared everything above
      // This ensures we show ONLY what's currently in Canvas
      
      setScanResults(issues);
      setIsScanning(false);
      localStorage.setItem('simplify_has_scanned', '1');
      toast.success(`Scan complete — ${issues.length} issue${issues.length === 1 ? '' : 's'} found`, { id: scanToastId, duration: 3000 });
      const scanTime = new Date();
      setLastScanTime(scanTime);
      // Save to scan history (keep last 5)
      const historyKey = `simplify_scan_history_${courseId}`;
      const prevHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const historyEntry = { id: scanTime.toISOString(), date: scanTime.toISOString(), courseName, results: issues };
      localStorage.setItem(historyKey, JSON.stringify([historyEntry, ...prevHistory].slice(0, 5)));
    } catch (error) {
      console.error("Error scanning course:", error);
      setIsScanning(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to scan course";
      setScanError(errorMessage);
      toast.error(errorMessage, { id: scanToastId });
      // Note: we do NOT clear scanResults here — partial results are preserved
    }
  };

  const handleRetryScan = () => {
    if (selectedCourse) {
      performScan(selectedCourse.courseId.toString(), selectedCourse.courseName);
    }
  };

  const handleDismissScanError = () => {
    setScanError(null);
  };

  const handleScanCourseFromSimplify = () => {
    // Open course selection modal
    setCourseSelectionModalOpen(true);
  };

  const handleCourseSelected = (courseId: string, courseName: string) => {
    
    // Handle "Scan All Courses"
    if (courseId === 'all') {
      handleScanAllCourses();
      return;
    }
    
    const courseIdNum = parseInt(courseId);
    
    // Validate courseId is a valid number
    if (isNaN(courseIdNum)) {
      console.error('❌ Invalid course ID:', courseId, '- Cannot parse as number');
      toast.error('Invalid course selected - please try another course');
      return;
    }
    
    setSelectedCourse({ courseId: courseIdNum, courseName, isImported: false });

    // Always run a fresh scan — never load stale cached results
    performScan(courseId, courseName);
  };

  const handleScanAllCourses = async () => {
    setCurrentView("simplify");
    setIsScanning(true);
    setScanError(null);

    toast.loading('Loading courses...', { id: 'scan-all' });
    
    try {
      const config = getCanvasConfig();
      if (!config) {
        toast.error('Canvas not configured', { id: 'scan-all' });
        setIsScanning(false);
        return;
      }

      const { getCourses } = await import('./utils/canvasAPI');
      const courses = await getCourses(config);
      
      // Also get imported courses
      const importedCoursesJson = localStorage.getItem('imported_courses');
      const importedCourses = importedCoursesJson ? JSON.parse(importedCoursesJson) : [];
      
      const allCourses = [...courses, ...importedCourses];
      const totalCourses = allCourses.length;
      
      toast.loading(`Scanning ${totalCourses} courses...`, { id: 'scan-all' });
      
      const allIssues: ScanIssue[] = [];
      const perCourseResults: Record<string, ScanIssue[]> = {};
      const perCourseTimes: Record<string, string> = {};
      let scannedCount = 0;

      for (const course of allCourses) {
        try {
          scannedCount++;
          toast.loading(`Scanning ${scannedCount}/${totalCourses}: ${course.name}...`, { id: 'scan-all' });

          const isImported = course.is_imported || false;
          const courseIdStr = course.id.toString();
          let issues: ScanIssue[] = [];

          if (isImported) {
            const { scanImportedCourse } = await import('./utils/courseScanner');
            issues = await scanImportedCourse(courseIdStr, course.name, enabledStandards);
          } else {
            const { scanCanvasCourse } = await import('./utils/courseScanner');
            issues = await scanCanvasCourse(courseIdStr, course.name, enabledStandards);
          }

          // Tag each issue with course info for grouping
          const taggedIssues = issues.map(issue => ({
            ...issue,
            courseName: course.name,
            courseId: courseIdStr
          }));

          // Cache per-course results so switching back to a single course is instant
          perCourseResults[courseIdStr] = taggedIssues;
          perCourseTimes[courseIdStr] = new Date().toISOString();

          allIssues.push(...taggedIssues);

        } catch (error) {
          console.error(`Error scanning course ${course.name}:`, error);
        }
      }

      // Persist per-course caches before switching view to "All Courses"
      setAllCourseScanResults(prev => ({ ...prev, ...perCourseResults }));
      setAllCourseScanTimes(prev => ({ ...prev, ...perCourseTimes }));

      // Set results and mark as "All Courses" scan
      setScanResults(allIssues);
      const allScanTime = new Date();
      setLastScanTime(allScanTime);
      setSelectedCourse({ courseId: 0, courseName: 'All Courses', isImported: false });
      // Save to scan history for all-courses scan
      const allHistoryKey = 'simplify_scan_history_0';
      const prevAllHistory = JSON.parse(localStorage.getItem(allHistoryKey) || '[]');
      const allHistoryEntry = { id: allScanTime.toISOString(), date: allScanTime.toISOString(), courseName: 'All Courses', results: allIssues };
      localStorage.setItem(allHistoryKey, JSON.stringify([allHistoryEntry, ...prevAllHistory].slice(0, 5)));
      setIsScanning(false);
      
      toast.success(`Scanned ${totalCourses} courses! Found ${allIssues.length} total issues`, { id: 'scan-all' });
      
    } catch (error) {
      console.error('Error batch scanning courses:', error);
      setIsScanning(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to scan courses';
      setScanError(errorMessage);
      toast.error(errorMessage, { id: 'scan-all' });
      // Note: we do NOT clear scanResults here — partial results are preserved
    }
  };

  const handleApplyTemplate = (template: "navigation" | "accessibility") => {
    setSelectedTemplate(template);
    setTemplatePreviewOpen(true);
  };

  const handleOpenIssuesList = () => {
    setIssuesListModalOpen(true);
  };

  const handleSelectIssueForDetail = (issue: ScanIssue) => {
    setSelectedIssueForDetail(issue);
  };

  const handleFixIssue = () => {
    // Instead of auto-fixing, open the in-context fix modal
    if (!selectedIssueForDetail || !selectedCourse) {
      return;
    }

    setShowInContextFix(true);
  };

  const handleApplyFixFromContext = async () => {
    if (!selectedIssueForDetail || !selectedCourse) {
      return;
    }

    toast.loading(`Fixing: ${selectedIssueForDetail.title}...`, { id: 'fix-issue' });
    
    try {
      const { fixCanvasIssue } = await import("./utils/canvasFixer");
      const result = await fixCanvasIssue(
        selectedCourse.courseId.toString(),
        selectedIssueForDetail
      );
      
      if (result.success) {
        toast.success(result.message, { id: 'fix-issue' });
        
        // Update scan results to mark as fixed
        setScanResults(prev => 
          prev.map(issue => 
            issue.id === selectedIssueForDetail.id 
              ? { ...issue, status: 'published' as const }
              : issue
          )
        );
      } else {
        toast.error(result.message, { id: 'fix-issue' });
      }
    } catch (error) {
      console.error("Error fixing issue:", error);
      toast.error("Failed to fix issue", { id: 'fix-issue' });
    }
    
    setShowInContextFix(false);
    setSelectedIssueForDetail(null);
  };

  const handleCloseInContextFix = () => {
    setShowInContextFix(false);
    setSelectedIssueForDetail(null);
  };

  const handleIgnoreIssue = () => {
    setSelectedIssueForDetail(null);
  };

  // Phase 0: Staging System Handlers
  const handleFixNow = async (issue: ScanIssue, customFix?: string, uploadedImageData?: string) => {
    if (customFix) {
    }

    // Special handling for module organization (deep-nav)
    if (issue.category === 'deep-nav') {
      await handleModuleOrganization(issue);
      return;
    }

    // For video-caption, derive fixability from elementHtml so old scan results work
    const isVideoCaptionFixable = issue.category === 'video-caption' && (() => {
      const src = issue.elementHtml?.match(/src="([^"]+)"/)?.[1] || '';
      return src.includes('youtube.com') || src.includes('youtu.be') || src.includes('vimeo.com');
    })();

    if (!issue.autoFixAvailable && !isVideoCaptionFixable) {
      toast.error("This issue requires manual fixing");
      return;
    }

    if (!selectedCourse) {
      toast.error("No course selected");
      return;
    }

    // 🎯 SMART BATCH DETECTION: Check for duplicate issues before fixing
    const duplicates = findDuplicateIssues(issue, scanResults);

    if (duplicates.length > 1) {
      // Show confirmation dialog for batch fixing
      setBatchFixCandidate({
        issue,
        customFix,
        duplicates,
        count: duplicates.length
      });
      return; // Wait for user decision
    }

    // No duplicates - proceed with single fix
    await applySingleFix(issue, customFix, uploadedImageData);
  };

  // AI Module Organization Handler
  const handleModuleOrganization = async (issue: ScanIssue) => {
    if (!selectedCourse) {
      toast.error("No course selected");
      return;
    }

    if (selectedCourse.isImported) {
      toast.error("Module organization is only available for Canvas courses");
      return;
    }

    toast.loading("Analyzing course content with AI...", { id: 'ai-organize' });

    try {
      const canvasConfig = getCanvasConfig();
      const courseId = selectedCourse.courseId.toString();

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74508696/ai-organize-modules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: getCanvasDomain(),
          accessToken: canvasConfig.accessToken,
          courseId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to organize modules');
      }

      toast.success(`AI suggested ${data.summary.totalModules} modules with ${data.summary.totalItems} items`, { id: 'ai-organize' });

      // Show preview modal
      setModuleOrganizationPreview({
        issue,
        modules: data.modules,
        summary: data.summary
      });

    } catch (error) {
      console.error("AI module organization error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to organize modules", { id: 'ai-organize' });
    }
  };

  // Apply Module Organization to Canvas
  const applyModuleOrganization = async () => {
    if (!moduleOrganizationPreview || !selectedCourse) {
      return;
    }

    toast.loading("Creating modules in Canvas...", { id: 'apply-modules' });

    try {
      const canvasConfig = getCanvasConfig();
      const courseId = selectedCourse.courseId.toString();

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74508696/apply-module-organization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: getCanvasDomain(),
          accessToken: canvasConfig.accessToken,
          courseId,
          modules: moduleOrganizationPreview.modules
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply modules');
      }

      toast.success(`Created ${data.modulesCreated} modules successfully!`, { id: 'apply-modules' });

      // Mark issue as fixed
      setScanResults(prev =>
        prev.map(i =>
          i.id === moduleOrganizationPreview.issue.id
            ? { ...i, status: 'published' as const }
            : i
        )
      );

      // Close modal
      setModuleOrganizationPreview(null);

    } catch (error) {
      console.error("Apply module organization error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to apply modules", { id: 'apply-modules' });
    }
  };

  // Helper: Apply a single fix
  const applySingleFix = async (issue: ScanIssue, customFix?: string, uploadedImageData?: string) => {
    // ALL fixes now use the staging workflow (no more immediate publishing)
    toast.loading("Staging fix...", { id: 'fix-now' });

    try {
      // Import the staging function — if chunk fails (stale cache after deploy), reload
      const { stageFix } = await import('./utils/fixStaging').catch(() => {
        toast.error('App updated — reloading...', { id: 'fix-now' });
        setTimeout(() => window.location.reload(), 1500);
        return { stageFix: null as any };
      });

      // Use the issue's courseId if available (for "All Courses" scans), otherwise use selectedCourse
      const courseIdToUse = issue.courseId || selectedCourse.courseId.toString();

      // For broken image alt text fixes: upload the replacement image to Canvas first
      let issueForFix = issue;
      if (uploadedImageData && issue.category === 'alt-text' && issue.title?.includes('Image Not Found')) {
        try {
          const { uploadImageToCanvas } = await import('./utils/canvasAPI');
          // Generate a filename from the original src or use a default
          const srcMatch = issue.elementHtml?.match(/src\s*=\s*["']([^"']+)["']/i);
          const originalFilename = srcMatch ? (srcMatch[1].split('/').pop() || 'image.png') : 'image.png';
          const fileName = `simplify_${Date.now()}_${originalFilename}`;

          toast.loading("Uploading image to Canvas...", { id: 'fix-now' });
          const uploadResult = await uploadImageToCanvas(courseIdToUse, uploadedImageData, fileName);
          issueForFix = { ...issue, newImageSrc: uploadResult.url };
        } catch (uploadErr) {
          console.warn('Image upload to Canvas failed, proceeding with alt text only:', uploadErr);
          toast.loading("Image upload failed — staging alt text fix only...", { id: 'fix-now' });
        }
      }

      // Stage the fix (doesn't publish yet)
      const result = await stageFix(
        courseIdToUse,
        issueForFix,
        selectedCourse.isImported,
        customFix // Pass custom fix to staging function
      );

      if (result.success && result.stagedFix) {
        // Update issue status to 'staged'
        setScanResults(prev =>
          prev.map(i =>
            i.id === issue.id
              ? {
                  ...i,
                  status: 'staged' as const,
                  stagedFix: result.stagedFix,
                  // Preserve suggestedFix from the staged issue (e.g. layout-table converted HTML)
                  ...(issue.suggestedFix !== undefined && { suggestedFix: issue.suggestedFix }),
                }
              : i
          )
        );

        toast.success("Draft saved. Publish when you're ready.", { id: 'fix-now' });

        // Show preview modal with before/after
        setPreviewIssue(issue);
        setPreviewOriginalContent(result.stagedFix.originalContent);
        setPreviewFixedContent(result.stagedFix.fixedContent);
        setPreviewModalOpen(true);

        // After staging a contrast fix, check for other pending contrast issues
        if (issue.category === 'contrast') {
          const raw = customFix || issue.suggestedFix || '';
          // Handle bare hex (#1f8552), color:#1f8552, or color:#1f8552|bg:#fff|ratio:2.1
          const fixColor = raw.match(/^#[0-9a-fA-F]{3,6}$/)?.[0]
            || raw.match(/color:\s*(#[0-9a-fA-F]{3,6})/)?.[1];
          if (fixColor) {
            const otherContrast = scanResults.filter(
              i => i.id !== issue.id && i.category === 'contrast' && i.status === 'pending' && i.autoFixAvailable
            );
            if (otherContrast.length > 0) {
              setContrastBatchPrompt({ color: fixColor, count: otherContrast.length, issues: otherContrast });
            }
          }
        }

      } else {
        toast.error(result.message || "Failed to stage fix", { id: 'fix-now' });
      }
    } catch (error) {
      console.error("❌ Error staging fix:", error);
      toast.error(error instanceof Error ? error.message : "Failed to stage fix", { id: 'fix-now' });
    }
  };

  const handleFixNowFromModal = async (issue: ScanIssue) => {
    if (!issue || !selectedCourse) {
      return;
    }

    toast.loading(`Staging fix for: ${issue.title}...`, { id: 'fix-issue' });
    
    try {
      // Import the staging function
      const { stageFix } = await import('./utils/fixStaging');
      
      // Use the issue's courseId if available (for "All Courses" scans), otherwise use selectedCourse
      const courseIdToUse = issue.courseId || selectedCourse.courseId.toString();
      
      // Stage the fix (doesn't publish yet)
      const result = await stageFix(
        courseIdToUse,
        issue,
        selectedCourse.isImported
      );

      if (result.success && result.stagedFix) {
        // toast.success('Fix staged! Click \"Publish to Canvas\" to apply.', { id: 'fix-issue' });
        
        // Update issue status to 'staged'
        setScanResults(prev =>
          prev.map(i =>
            i.id === issue.id
              ? {
                  ...i,
                  status: 'staged' as const,
                  stagedFix: result.stagedFix
                }
              : i
          )
        );
        
        // Close the modal
        setSelectedIssueForDetail(null);
      } else {
        toast.error(result.message || 'Failed to stage fix', { id: 'fix-issue' });
      }
    } catch (error) {
      console.error("❌ Error staging fix:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to stage fix', { id: 'fix-issue' });
    }
  };

  const handleIgnoreIssueInline = (issue: ScanIssue) => {

    // Update issue status to 'ignored'
    setScanResults(prev =>
      prev.map(i =>
        i.id === issue.id
          ? { ...i, status: 'ignored' as const }
          : i
      )
    );

    toast.info("Issue ignored");
  };

  const handleIgnoreIssueSilent = (issue: ScanIssue) => {
    setScanResults(prev =>
      prev.map(i =>
        i.id === issue.id
          ? { ...i, status: 'ignored' as const }
          : i
      )
    );
  };

  const handleResolveIssue = (issue: ScanIssue, reason?: string) => {

    // Update issue status to 'resolved'
    setScanResults(prev =>
      prev.map(i =>
        i.id === issue.id
          ? { ...i, status: 'resolved' as const }
          : i
      )
    );

    toast.success(reason || "Issue marked as resolved");
    setSelectedIssueForDetail(null);
  };

  // Phase 1.75: Batch Fix All Handler
  const handleBatchFixAll = async () => {

    if (!selectedCourse) {
      toast.error("No course selected");
      return;
    }

    const pendingAutoFixableIssues = scanResults.filter(
      issue => issue.status === 'pending' && issue.autoFixAvailable
    );

    if (pendingAutoFixableIssues.length === 0) {
      toast.info("No auto-fixable issues to stage");
      return;
    }

    toast.loading(`Staging ${pendingAutoFixableIssues.length} fixes...`, { id: 'batch-fix' });

    try {
      const { batchStageFixes } = await import('./utils/fixStaging');
      
      let completed = 0;
      const result = await batchStageFixes(
        selectedCourse.courseId.toString(),
        pendingAutoFixableIssues,
        selectedCourse.isImported,
        (current, total) => {
          completed = current;
          toast.loading(`Staging fixes: ${current}/${total}...`, { id: 'batch-fix' });
        }
      );

      if (result.success) {
        // Update all successfully staged issues
        setScanResults(prev =>
          prev.map(issue => {
            const stagedFix = result.stagedFixes.find(sf => sf.issueId === issue.id);
            if (stagedFix) {
              return {
                ...issue,
                status: 'staged' as const,
                // IMPORTANT: Update contentId and contentType if the fix changed them
                // (e.g., module objectives fixes create/update a page, so we need the page URL for undo)
                ...(stagedFix.contentId && { contentId: stagedFix.contentId }),
                ...(stagedFix.contentType && { contentType: stagedFix.contentType }),
                stagedFix: {
                  originalContent: stagedFix.originalContent,
                  fixedContent: stagedFix.fixedContent,
                  timestamp: stagedFix.timestamp,
                  // Preserve custom fields for different fix types
                  customAltText: stagedFix.customAltText,
                  customLinkText: stagedFix.customLinkText,
                  customCaption: stagedFix.customCaption,
                  customTextColor: stagedFix.customTextColor
                }
              };
            }
            return issue;
          })
        );

        toast.success(
          `Successfully staged ${result.stagedFixes.length} fixes! ${
            result.failedIssues.length > 0 
              ? `${result.failedIssues.length} failed.` 
              : ''
          }`,
          { id: 'batch-fix' }
        );
      } else {
        toast.error(result.message || "Failed to stage fixes", { id: 'batch-fix' });
      }
    } catch (error) {
      console.error("❌ Error batch staging fixes:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to batch stage fixes",
        { id: 'batch-fix' }
      );
    }
  };

  // Phase 1.75: Publish to Canvas Handler
  const handlePublishToCanvas = async () => {

    if (!selectedCourse) {
      console.error("❌ No course selected");
      toast.error("No course selected");
      return;
    }

    const stagedIssues = scanResults.filter(issue => issue.status === 'staged');

    if (stagedIssues.length === 0) {
      toast.info("No staged fixes to publish");
      return;
    }

    // Skip confirmation if user opted out
    if (skipPublishConfirm) {
      confirmPublishToCanvas(true);
      return;
    }

    // Show confirmation modal
    skipPublishCheckboxRef.current = false;
    setPublishConfirmation({ count: stagedIssues.length });
  };

  // Confirm and publish staged fixes
  const confirmPublishToCanvas = async (skipGuard = false) => {
    if (!selectedCourse || (!skipGuard && !publishConfirmation)) {
      return;
    }

    // Save "Don't show this again" preference if checkbox was checked
    if (skipPublishCheckboxRef.current) {
      setSkipPublishConfirm(true);
      localStorage.setItem('simplify_skip_publish_confirm', 'true');
    }

    const stagedIssues = scanResults.filter(issue => issue.status === 'staged');

    if (stagedIssues.length === 0) {
      toast.info("No staged fixes to publish");
      setPublishConfirmation(null);
      return;
    }

    setPublishConfirmation(null);
    setIsPublishing(true);

    // Initialize batch progress tracking
    const progressItems = stagedIssues.map(issue => ({
      issueId: issue.id,
      title: issue.title,
      location: issue.location || '',
      status: 'pending' as const,
    }));
    setBatchPublishProgress({
      items: progressItems,
      completed: 0,
      total: stagedIssues.length,
      successCount: 0,
      failCount: 0,
    });

    try {
      if (selectedCourse.isImported) {
        // Imported courses: fixes were already applied to Supabase during staging
        // Mark all as success in progress tracker
        setBatchPublishProgress(prev => prev ? {
          ...prev,
          items: prev.items.map(item => ({ ...item, status: 'success' as const })),
          completed: prev.total,
          successCount: prev.total,
        } : null);

        setScanResults(prev =>
          prev.map(issue =>
            issue.status === 'staged'
              ? { ...issue, status: 'published' as const }
              : issue
          )
        );
      } else {
        // Live Canvas courses: Apply fixes via Canvas API
        const { fixCanvasIssue } = await import('./utils/canvasFixer');

        let successCount = 0;
        let failCount = 0;

        const successfulIssueIds: string[] = [];
        const publishResults = new Map<string, { contentId?: string; contentType?: string }>();

        for (let i = 0; i < stagedIssues.length; i++) {
          const issue = stagedIssues[i];

          // Mark current item as publishing
          setBatchPublishProgress(prev => prev ? {
            ...prev,
            items: prev.items.map(item =>
              item.issueId === issue.id ? { ...item, status: 'publishing' as const } : item
            ),
          } : null);

          if (!issue.stagedFix || !issue.contentId || !issue.contentType) {
            failCount++;
            setBatchPublishProgress(prev => prev ? {
              ...prev,
              items: prev.items.map(item =>
                item.issueId === issue.id ? { ...item, status: 'failed' as const, error: 'Missing required data' } : item
              ),
              completed: i + 1,
              failCount,
              successCount,
            } : null);
            continue;
          }

          try {
            const courseIdToUse = issue.courseId || selectedCourse.courseId.toString();
            const result = await fixCanvasIssue(courseIdToUse, issue, true);

            if (result.success) {
              successCount++;
              successfulIssueIds.push(issue.id);
              publishResults.set(issue.id, { contentId: result.contentId, contentType: result.contentType });
              setBatchPublishProgress(prev => prev ? {
                ...prev,
                items: prev.items.map(item =>
                  item.issueId === issue.id ? { ...item, status: 'success' as const } : item
                ),
                completed: i + 1,
                successCount,
                failCount,
              } : null);
            } else {
              failCount++;
              setBatchPublishProgress(prev => prev ? {
                ...prev,
                items: prev.items.map(item =>
                  item.issueId === issue.id ? { ...item, status: 'failed' as const, error: result.message } : item
                ),
                completed: i + 1,
                successCount,
                failCount,
              } : null);
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            failCount++;
            setBatchPublishProgress(prev => prev ? {
              ...prev,
              items: prev.items.map(item =>
                item.issueId === issue.id ? { ...item, status: 'failed' as const, error: errorMsg } : item
              ),
              completed: i + 1,
              successCount,
              failCount,
            } : null);
          }
        }

        // Update ONLY the successfully published issues
        setScanResults(prev =>
          prev.map(issue => {
            if (!successfulIssueIds.includes(issue.id)) return issue;
            const pr = publishResults.get(issue.id);
            return {
              ...issue,
              status: 'published' as const,
              ...(pr?.contentId && { contentId: pr.contentId }),
              ...(pr?.contentType && { contentType: pr.contentType }),
            };
          })
        );
      }
    } catch (error) {
      console.error("Error publishing fixes:", error);
      // Mark all remaining as failed
      setBatchPublishProgress(prev => prev ? {
        ...prev,
        items: prev.items.map(item =>
          item.status === 'pending' || item.status === 'publishing'
            ? { ...item, status: 'failed' as const, error: 'Publish process interrupted' }
            : item
        ),
        completed: prev.total,
      } : null);
    } finally {
      setIsPublishing(false);
    }
  };

  // Phase 1.75: Publish Single Issue to Canvas Handler
  const handlePublishSingleIssue = async (issue: ScanIssue, skipConfirm = false) => {

    if (!selectedCourse) {
      toast.error("No course selected");
      return;
    }

    if (issue.status !== 'staged') {
      toast.error("Issue must be staged before publishing");
      return;
    }

    // Show confirmation modal unless user opted out or already confirmed
    if (!skipConfirm && !skipPublishConfirm) {
      skipPublishCheckboxRef.current = false;
      setPublishConfirmation({ count: 1, singleIssue: issue });
      return;
    }

    toast.loading(`Publishing fix...`, { id: `publish-${issue.id}` });

    try {
      if (selectedCourse.isImported) {
        // Imported courses: fix was already applied to Supabase during staging
        // Just update status to 'published'
        setScanResults(prev =>
          prev.map(i =>
            i.id === issue.id
              ? { ...i, status: 'published' as const }
              : i
          )
        );

        toast.success(`Published: ${issue.title}`, { id: `publish-${issue.id}` });
      } else {
        // Live Canvas courses: Apply fix via Canvas API
        if (!issue.stagedFix || !issue.contentId || !issue.contentType) {
          toast.error("Missing required data to publish", { id: `publish-${issue.id}` });
          return;
        }

        const { fixCanvasIssue } = await import('./utils/canvasFixer');
        
        // Use the issue's courseId if available (for "All Courses" scans)
        const courseIdToUse = issue.courseId || selectedCourse.courseId.toString();
        
        const result = await fixCanvasIssue(
          courseIdToUse,
          issue,
          true // Apply to Canvas
        );

        if (result.success) {
          // Update issue status to 'published', preserving updated contentId/contentType for undo
          setScanResults(prev =>
            prev.map(i =>
              i.id === issue.id
                ? {
                    ...i,
                    status: 'published' as const,
                    ...(result.contentId && { contentId: result.contentId }),
                    ...(result.contentType && { contentType: result.contentType }),
                  }
                : i
            )
          );

          toast.success(`Published: ${issue.title}`, { id: `publish-${issue.id}`, duration: 4000 });
        } else {
          toast.error(result.message || "Failed to publish", { id: `publish-${issue.id}` });
        }
      }
    } catch (error) {
      console.error("❌ Error publishing fix:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to publish",
        { id: `publish-${issue.id}` }
      );
    }
  };

  // Phase 2: Undo Published Fix Handler — shows styled confirmation first
  const handleUndoFix = (issue: ScanIssue) => {
    if (!selectedCourse || !issue.stagedFix) {
      toast.error("Cannot undo: Missing original content");
      return;
    }
    setUndoConfirmation(issue);
  };

  const confirmUndoFix = async () => {
    const issue = undoConfirmation;
    setUndoConfirmation(null);
    if (!issue || !selectedCourse) return;

    toast.loading("Undoing fix...", { id: 'undo' });

    try {
      if (selectedCourse.isImported) {
        // Imported courses: Revert content in Supabase
        const { updateImportedContent } = await import('./utils/supabaseFixer');
        
        await updateImportedContent(
          selectedCourse.courseId.toString(),
          issue.contentId || '',
          issue.contentType || 'page',
          issue.stagedFix.originalContent
        );

        // Update issue status back to 'pending' and remove stagedFix
        setScanResults(prev =>
          prev.map(i =>
            i.id === issue.id
              ? { ...i, status: 'pending' as const, stagedFix: undefined }
              : i
          )
        );

        toast.success("Fix undone successfully", { id: 'undo', duration: 4000 });
      } else {
        // Live Canvas courses: Revert via Canvas API
        const { updateCanvasContent } = await import('./utils/canvasFixer');
        
        // Use the issue's courseId if available (for "All Courses" scans)
        const courseIdToUse = issue.courseId || selectedCourse.courseId.toString();
        
        const result = await updateCanvasContent(
          courseIdToUse,
          issue.contentId || '',
          issue.contentType || 'page',
          issue.stagedFix.originalContent
        );

        if (result.success) {
          // Update issue status back to 'pending' and remove stagedFix
          setScanResults(prev =>
            prev.map(i =>
              i.id === issue.id
                ? { ...i, status: 'pending' as const, stagedFix: undefined }
                : i
            )
          );

          toast.success("Fix undone successfully", { id: 'undo', duration: 4000 });
        } else {
          toast.error(result.message || "Failed to undo fix", { id: 'undo' });
        }
      }
    } catch (error) {
      console.error("❌ Error undoing fix:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to undo fix",
        { id: 'undo' }
      );
    }
  };

  // Revert Staged Fix Handler (discard staged changes without publishing)
  const handleRevertStagedFix = (issue: ScanIssue) => {

    if (issue.status !== 'staged') {
      toast.error("Only staged fixes can be reverted");
      return;
    }

    // Show confirmation modal
    setRevertAllChecked(false);
    setRevertConfirmation(issue);
  };

  const confirmRevertStagedFix = () => {
    if (!revertConfirmation) return;

    const issue = revertConfirmation;

    if (revertAllChecked) {
      // Revert ALL staged fixes
      setScanResults(prev =>
        prev.map(i =>
          i.status === 'staged'
            ? { ...i, status: 'pending' as const, stagedFix: undefined }
            : i
        )
      );
      toast.success('All staged fixes reverted');
    } else {
      // Revert just this one
      setScanResults(prev =>
        prev.map(i =>
          i.id === issue.id
            ? { ...i, status: 'pending' as const, stagedFix: undefined }
            : i
        )
      );
    }

    // Close modal
    setRevertConfirmation(null);
  };

  // Revert ALL staged fixes at once
  const [revertAllConfirmation, setRevertAllConfirmation] = useState(false);

  const handleRevertAllStaged = () => {
    const stagedCount = scanResults.filter(r => r.status === 'staged').length;
    if (stagedCount === 0) return;
    setRevertAllConfirmation(true);
  };

  const confirmRevertAllStaged = () => {
    setScanResults(prev =>
      prev.map(i =>
        i.status === 'staged'
          ? { ...i, status: 'pending' as const, stagedFix: undefined }
          : i
      )
    );
    setRevertAllConfirmation(false);
    toast.success('All staged fixes reverted');
  };

  const handleImportCourse = (courseName: string, courseCode: string, file: File | null) => {
    
    // Generate a unique ID for the imported course
    const newCourseId = Date.now();
    
    // Get existing imported courses from localStorage
    const importedCoursesJson = localStorage.getItem('imported_courses');
    const importedCourses = importedCoursesJson ? JSON.parse(importedCoursesJson) : [];
    
    // Add the new course
    const newCourse = {
      id: newCourseId,
      name: courseName,
      course_code: courseCode,
      workflow_state: 'available',
      is_imported: true,
      imported_at: new Date().toISOString(),
      file_name: file?.name || null
    };
    
    importedCourses.push(newCourse);
    
    // Save to localStorage
    localStorage.setItem('imported_courses', JSON.stringify(importedCourses));
    
    toast.success(`Course "${courseName}" imported successfully!`);
    
    // Trigger courses refresh
    setCoursesRefreshKey(prev => prev + 1);
    
    // Switch to courses view to show the new course
    setCurrentView('courses');
  };

  // 🎯 Smart Batch Fix: Handler for "Fix All" button
  const handleBatchFixAllDuplicates = async () => {
    if (!batchFixCandidate || !selectedCourse) return;

    const { duplicates, customFix } = batchFixCandidate;
    
    toast.loading(`Staging ${duplicates.length} fixes...`, { id: 'batch-fix-duplicates' });

    try {
      const { batchStageFixes } = await import('./utils/fixStaging');
      
      const result = await batchStageFixes(
        selectedCourse.courseId.toString(),
        duplicates,
        selectedCourse.isImported,
        (current, total) => {
          toast.loading(`Staging fixes: ${current}/${total}...`, { id: 'batch-fix-duplicates' });
        },
        customFix // Pass custom fix if provided
      );

      if (result.success) {
        // Update all successfully staged issues
        setScanResults(prev =>
          prev.map(issue => {
            const stagedFix = result.stagedFixes.find(sf => sf.issueId === issue.id);
            if (stagedFix) {
              return {
                ...issue,
                status: 'staged' as const,
                // IMPORTANT: Update contentId and contentType if the fix changed them
                // (e.g., module objectives fixes create/update a page, so we need the page URL for undo)
                ...(stagedFix.contentId && { contentId: stagedFix.contentId }),
                ...(stagedFix.contentType && { contentType: stagedFix.contentType }),
                stagedFix: {
                  originalContent: stagedFix.originalContent,
                  fixedContent: stagedFix.fixedContent,
                  timestamp: stagedFix.timestamp,
                  // Preserve custom fields for different fix types
                  customAltText: stagedFix.customAltText,
                  customLinkText: stagedFix.customLinkText,
                  customCaption: stagedFix.customCaption,
                  customTextColor: stagedFix.customTextColor
                }
              };
            }
            return issue;
          })
        );

        toast.success(
          `Successfully staged ${result.stagedFixes.length} fixes!`,
          { id: 'batch-fix-duplicates' }
        );
      } else {
        toast.error(result.message || "Failed to stage fixes", { id: 'batch-fix-duplicates' });
      }
    } catch (error) {
      console.error("❌ Error batch staging fixes:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to batch stage fixes",
        { id: 'batch-fix-duplicates' }
      );
    } finally {
      setBatchFixCandidate(null); // Close dialog
    }
  };

  // 🎥 Video Caption Batch Fix: fix all remaining unfixed video-caption issues
  const handleBatchFixVideoCaptions = async () => {
    setVideoCaptionBatchPrompt(null);
    if (!selectedCourse) return;

    const remaining = scanResults.filter(
      i => i.category === 'video-caption' && i.status === 'pending' && i.autoFixAvailable
    );
    if (remaining.length === 0) return;

    toast.loading(`Staging ${remaining.length} video caption fix${remaining.length > 1 ? 'es' : ''}...`, { id: 'batch-video-fix' });

    try {
      const { batchStageFixes } = await import('./utils/fixStaging');
      const result = await batchStageFixes(
        selectedCourse.courseId.toString(),
        remaining,
        selectedCourse.isImported,
        (current, total) => {
          toast.loading(`Staging video fixes: ${current}/${total}...`, { id: 'batch-video-fix' });
        }
      );

      if (result.success) {
        setScanResults(prev =>
          prev.map(issue => {
            const stagedFix = result.stagedFixes.find(sf => sf.issueId === issue.id);
            if (stagedFix) {
              return {
                ...issue,
                status: 'staged' as const,
                ...(stagedFix.contentId && { contentId: stagedFix.contentId }),
                ...(stagedFix.contentType && { contentType: stagedFix.contentType }),
                stagedFix: {
                  originalContent: stagedFix.originalContent,
                  fixedContent: stagedFix.fixedContent,
                  timestamp: stagedFix.timestamp,
                  customAltText: stagedFix.customAltText,
                  customLinkText: stagedFix.customLinkText,
                  customCaption: stagedFix.customCaption,
                  customTextColor: stagedFix.customTextColor,
                },
              };
            }
            return issue;
          })
        );
        toast.success(`${result.stagedFixes.length} video caption fix${result.stagedFixes.length > 1 ? 'es' : ''} staged — publish when ready`, { id: 'batch-video-fix' });
      } else {
        toast.error('Some video fixes could not be staged', { id: 'batch-video-fix' });
      }
    } catch (error) {
      toast.error('Batch video fix failed', { id: 'batch-video-fix' });
    }
  };

  // 🎨 Contrast Batch Fix: fix all remaining pending contrast issues with the same color
  const handleContrastBatchFix = async () => {
    if (!contrastBatchPrompt || !selectedCourse) {
      setContrastBatchPrompt(null);
      return;
    }

    const { color, issues: remaining } = contrastBatchPrompt;
    setContrastBatchPrompt(null);

    if (remaining.length === 0) return;

    toast.loading(`Staging ${remaining.length} contrast fix${remaining.length > 1 ? 'es' : ''}...`, { id: 'batch-contrast-fix' });

    try {
      const { batchStageFixes } = await import('./utils/fixStaging');
      const result = await batchStageFixes(
        selectedCourse.courseId.toString(),
        remaining,
        selectedCourse.isImported,
        (current, total) => {
          toast.loading(`Staging contrast fixes: ${current}/${total}...`, { id: 'batch-contrast-fix' });
        },
        color // Apply the same color (bare hex) to all
      );

      if (result.success) {
        setScanResults(prev =>
          prev.map(issue => {
            const stagedFix = result.stagedFixes.find(sf => sf.issueId === issue.id);
            if (stagedFix) {
              return {
                ...issue,
                status: 'staged' as const,
                ...(stagedFix.contentId && { contentId: stagedFix.contentId }),
                ...(stagedFix.contentType && { contentType: stagedFix.contentType }),
                stagedFix: {
                  originalContent: stagedFix.originalContent,
                  fixedContent: stagedFix.fixedContent,
                  timestamp: stagedFix.timestamp,
                  customTextColor: stagedFix.customTextColor,
                },
              };
            }
            return issue;
          })
        );
        toast.success(`${result.stagedFixes.length} contrast fix${result.stagedFixes.length > 1 ? 'es' : ''} staged — publish when ready`, { id: 'batch-contrast-fix' });
      } else {
        toast.error('Some contrast fixes could not be staged', { id: 'batch-contrast-fix' });
      }
    } catch (error) {
      toast.error('Batch contrast fix failed', { id: 'batch-contrast-fix' });
    }
  };

  // 🎯 Smart Batch Fix: Handler for "Just This One" button
  const handleBatchFixJustOne = async () => {
    if (!batchFixCandidate) return;

    const { issue, customFix } = batchFixCandidate;
    setBatchFixCandidate(null); // Close dialog first
    
    // Apply single fix
    await applySingleFix(issue, customFix);
  };

  // 🎯 Smart Batch Fix: Helper to find duplicate issues
  const findDuplicateIssues = (issue: ScanIssue, allIssues: ScanIssue[]): ScanIssue[] => {
    // Only look for duplicates in pending issues
    const pendingIssues = allIssues.filter(i => i.status === 'pending');

    // Match based on issue category and specific identifiers
    switch (issue.category) {
      case 'long-url': {
        // Match by the actual URL being linked (extract from elementHtml)
        if (!issue.elementHtml) return [issue];
        
        const hrefMatch = issue.elementHtml.match(/href=["']([^"']+)["']/);
        const targetUrl = hrefMatch?.[1];
        
        if (!targetUrl) return [issue];
        
        // Find all issues with the same target URL
        return pendingIssues.filter(i => {
          if (i.category !== 'long-url' || !i.elementHtml) return false;
          const otherHrefMatch = i.elementHtml.match(/href=["']([^"']+)["']/);
          const otherUrl = otherHrefMatch?.[1];
          return otherUrl === targetUrl;
        });
      }
      
      case 'alt-text': {
        // Match by image src
        const imageSrc = issue.elementHtml?.match(/src=\"([^\"]+)\"/)?.[1];
        if (!imageSrc) return [issue];
        return pendingIssues.filter(i => {
          const otherSrc = i.elementHtml?.match(/src=\"([^\"]+)\"/)?.[1];
          return i.category === 'alt-text' && otherSrc === imageSrc;
        });
      }
      
      case 'table-caption': {
        // Match by table HTML hash (same table structure)
        if (!issue.elementHtml) return [issue];
        const tableHash = hashString(issue.elementHtml);
        return pendingIssues.filter(i => 
          i.category === 'table-caption' && 
          i.elementHtml &&
          hashString(i.elementHtml) === tableHash
        );
      }
      
      case 'broken-link': {
        // Match by broken URL (extract from elementHtml)
        if (!issue.elementHtml) return [issue];

        const hrefMatch = issue.elementHtml.match(/href=["']([^"']+)["']/);
        const brokenUrl = hrefMatch?.[1];

        if (!brokenUrl) return [issue];

        return pendingIssues.filter(i => {
          if (i.category !== 'broken-link' || !i.elementHtml) return false;
          const otherHrefMatch = i.elementHtml.match(/href=["']([^"']+)["']/);
          const otherUrl = otherHrefMatch?.[1];
          return otherUrl === brokenUrl;
        });
      }

      case 'plain-language': {
        // Match by content hash — same assignment description appearing in multiple
        // places (e.g., templated courses) gets the same AI plain-language rewrite
        if (!issue.elementHtml) return [issue];
        const contentHash = hashString(issue.elementHtml);
        return pendingIssues.filter(i =>
          i.category === 'plain-language' &&
          !!i.elementHtml &&
          hashString(i.elementHtml) === contentHash
        );
      }

      case 'instructions': {
        // Match by content hash — same assignment instructions appearing in multiple
        // places gets the same AI rewrite (complete with Overview / Steps / Criteria)
        if (!issue.elementHtml) return [issue];
        const contentHash = hashString(issue.elementHtml);
        return pendingIssues.filter(i =>
          i.category === 'instructions' &&
          !!i.elementHtml &&
          hashString(i.elementHtml) === contentHash
        );
      }

      case 'inconsistent-heading': {
        // Match by heading element HTML — the same heading (e.g., <h3>Introduction</h3>)
        // at the wrong level on multiple pages gets the same structural correction
        if (!issue.elementHtml) return [issue];
        const headingHash = hashString(issue.elementHtml);
        return pendingIssues.filter(i =>
          i.category === 'inconsistent-heading' &&
          !!i.elementHtml &&
          hashString(i.elementHtml) === headingHash
        );
      }

      case 'video-caption': {
        // Return ALL pending video-caption issues that are YouTube/Vimeo fixable
        return pendingIssues.filter(i => {
          if (i.category !== 'video-caption') return false;
          const src = i.elementHtml?.match(/src="([^"]+)"/)?.[1] || '';
          return src.includes('youtube.com') || src.includes('youtu.be') || src.includes('vimeo.com');
        });
      }

      case 'color-only': {
        // Return ALL pending color-only issues — the user's selected fix type applies to all
        return pendingIssues.filter(i => i.category === 'color-only');
      }

      default:
        // For other categories, no batch fixing (return only this issue)
        return [issue];
    }
  };

  return (
    <>
      <Toaster position="top-right" expand={true} richColors offset="96px" />

      {/* Pilot Welcome - Shows once on first connection */}
      <PilotWelcome isOpen={showPilotWelcome} onClose={() => { setShowPilotWelcome(false); setTriggerTour(true); }} onOpenPrivacy={() => setShowPrivacyFromWelcome(true)} />
      <PrivacyStatement isOpen={showPrivacyFromWelcome} onClose={() => setShowPrivacyFromWelcome(false)} />

      {/* Connection Modal - Shows on first load */}
      <CanvasConnectionModal
        isOpen={showConnectionModal}
        onConnected={handleConnected}
        onOpenPrivacy={() => setShowPrivacyFromWelcome(true)}
      />

      {/* Canvas Layout with SIMPLIFY integrated */}
      {!showConnectionModal && (
        <CanvasLayout
          userName={userName}
          currentView={currentView}
          onViewChange={setCurrentView}
          onSelectCourse={handleSelectCourse}
          selectedCourseId={selectedCourse?.courseId}
          onDisconnect={handleDisconnect}
          onAccountClick={() => setAccountPanelOpen(true)}
        >
          {/* Render different views based on currentView */}
          {currentView === "simplify" && (
            <SimplifyDashboard
              onScanCourse={handleCourseSelected}
              onOpenStandards={() => setStandardsModalOpen(true)}
              triggerTour={triggerTour}
              onTourTriggered={() => setTriggerTour(false)}
              selectedCourseName={selectedCourse?.courseName}
              selectedCourse={selectedCourse}
              scanResults={scanResults}
              lastScanTime={lastScanTime}
              isScanning={isScanning}
              onSelectIssue={handleSelectIssueForDetail}
              onBatchFixAll={handleBatchFixAll}
              onPublishToCanvas={handlePublishToCanvas}
              onPublishSingleIssue={handlePublishSingleIssue}
              handleRevertStagedFix={handleRevertStagedFix}
              onUndo={handleUndoFix}
              enabledStandards={enabledStandards}
              scanPanelOpen={scanPanelOpen}
              setScanPanelOpen={setScanPanelOpen}
              accountPanelOpen={accountPanelOpen}
              setAccountPanelOpen={setAccountPanelOpen}
              courseSelectionModalOpen={courseSelectionModalOpen}
              setCourseSelectionModalOpen={setCourseSelectionModalOpen}
              fixItModalOpen={fixItModalOpen}
              setFixItModalOpen={setFixItModalOpen}
              templatePreviewOpen={templatePreviewOpen}
              setTemplatePreviewOpen={setTemplatePreviewOpen}
              standardsModalOpen={standardsModalOpen}
              setStandardsModalOpen={setStandardsModalOpen}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              issuesListModalOpen={issuesListModalOpen}
              setIssuesListModalOpen={setIssuesListModalOpen}
              selectedIssueForDetail={selectedIssueForDetail}
              setSelectedIssueForDetail={setSelectedIssueForDetail}
              showInContextFix={showInContextFix}
              setShowInContextFix={setShowInContextFix}
              previewModalOpen={previewModalOpen}
              setPreviewModalOpen={setPreviewModalOpen}
              previewIssue={previewIssue}
              setPreviewIssue={setPreviewIssue}
              previewOriginalContent={previewOriginalContent}
              setPreviewOriginalContent={setPreviewOriginalContent}
              previewFixedContent={previewFixedContent}
              setPreviewFixedContent={setPreviewFixedContent}
              isPublishing={isPublishing}
              setIsPublishing={setIsPublishing}
              handleApplyTemplate={handleApplyTemplate}
              handleOpenIssuesList={handleOpenIssuesList}
              handleFixIssue={handleFixIssue}
              handleApplyFixFromContext={handleApplyFixFromContext}
              handleCloseInContextFix={handleCloseInContextFix}
              handleIgnoreIssue={handleIgnoreIssue}
              handleFixNow={handleFixNow}
              handleFixNowFromModal={handleFixNowFromModal}
              handleIgnoreIssueInline={handleIgnoreIssueInline}
              handleUndoFix={handleUndoFix}
              onRescan={() => selectedCourse && performScan(selectedCourse.courseId.toString(), selectedCourse.courseName)}
              scanError={scanError}
              onRetryScan={handleRetryScan}
              onDismissScanError={handleDismissScanError}
            />
          )}
          {currentView === "courses" && !showCourseView && (
            <CanvasCourses
              onSelectCourse={handleSelectCourse}
              refreshKey={coursesRefreshKey}
            />
          )}
          {currentView === "dashboard" && (
            <CanvasDashboard
              userName={userName}
              onSelectCourse={handleSelectCourse}
              refreshKey={coursesRefreshKey}
            />
          )}
          {currentView === "commons" && (
            <CanvasCommons />
          )}
          {currentView === "buttons" && (
            <ButtonDesignVariations />
          )}
          {currentView === "analytics-variations" && (
            <AnalyticsVariations />
          )}
          {currentView === "modal-comparison" && (
            <ModalDesignComparison />
          )}
          {currentView === "rubric-tags-demo" && (
            <RubricTagsDemoExample />
          )}
          {currentView === "statusbar-variations" && (
            <StatusBarVariations />
          )}
          {currentView === "issues-picker" && (
            <IssuesLayoutPicker />
          )}
          {/* CourseView should only render when explicitly in courses view */}
          {showCourseView && selectedCourse && currentView === "courses" && (
            <CourseView
              courseId={selectedCourse.courseId}
              courseName={selectedCourse.courseName}
              isImported={selectedCourse.isImported}
              onBack={handleBackToCourses}
              {...(FEATURE_FLAGS.ENABLE_SCAN_FROM_COURSES_TAB && { onScan: handleScanFromCourseView })}
            />
          )}
        </CanvasLayout>
      )}
      
      {/* Account Panel - Drawer that slides from left */}
      <AccountPanel
        isOpen={accountPanelOpen}
        onClose={() => setAccountPanelOpen(false)}
        onDisconnect={handleDisconnect}
      />
      
      {/* Scan Panel - Drawer that opens from CourseView */}
      <ScanPanel
        isOpen={scanPanelOpen}
        onClose={() => {
          setScanPanelOpen(false);
          setScanOpenedFromCourses(false); // Reset entry path when closing
        }}
        scanResults={scanResults}
        isScanning={isScanning}
        onViewDetails={() => setIssuesListModalOpen(true)}
        onApplyTemplate={(template) => {
          setSelectedTemplate(template);
          setTemplatePreviewOpen(true);
        }}
        onFixNow={handleFixNow}
        onIgnore={handleIgnoreIssue}
        onBatchFixAll={handleBatchFixAll}
        onPublishToCanvas={handlePublishToCanvas}
        onUndo={handleUndoFix}
        hideBatchFixAll={false} // Always show Batch Fix All button
        enabledStandards={enabledStandards}
        aiSuggestionsCache={aiSuggestionsCache}
        onUpdateAiCache={(key, data) => {
          setAiSuggestionsCache(prev => ({
            ...prev,
            [key]: data
          }));
        }}
        scanError={scanError}
        onRetryScan={handleRetryScan}
        onDismissScanError={handleDismissScanError}
      />

      {/* Standards Modal */}
      <StandardsModal
        isOpen={standardsModalOpen}
        onClose={() => setStandardsModalOpen(false)}
        enabledStandards={enabledStandards}
        onSaveStandards={setEnabledStandards}
      />
      
      {/* Issue Detail Modal */}
      <IssueDetailModal
        isOpen={!!selectedIssueForDetail}
        onClose={() => setSelectedIssueForDetail(null)}
        issue={selectedIssueForDetail}
        onApplyFix={handleFixNow}
        onResolve={(issue, reason) => {
          handleResolveIssue(issue, reason);
        }}
        onIgnore={() => {
          if (selectedIssueForDetail) {
            handleIgnoreIssueInline(selectedIssueForDetail);
            setSelectedIssueForDetail(null);
          }
        }}
        onIgnoreSilent={handleIgnoreIssueSilent}
        onPublishSingleIssue={handlePublishSingleIssue}
        onRevertStagedFix={handleRevertStagedFix}
        onRevertAllStaged={handleRevertAllStaged}
        stagedCount={scanResults.filter(i => i.status === 'staged').length}
        enabledStandards={enabledStandards}
        aiSuggestionsCache={aiSuggestionsCache}
        onUpdateAiCache={(key, data) => {
          setAiSuggestionsCache(prev => ({
            ...prev,
            [key]: data
          }));
        }}
      />

      {/* 🎯 Smart Batch Fix Confirmation Dialog */}
      <ConfirmationModal
        isOpen={!!batchFixCandidate}
        onClose={() => setBatchFixCandidate(null)}
        title={
          batchFixCandidate?.issue.category === 'video-caption' ? 'More Videos Without Captions'
          : batchFixCandidate?.issue.category === 'color-only' ? 'Multiple Color-Only Issues Found'
          : 'Multiple Instances Found'
        }
        message={
          batchFixCandidate ? (
            <div className="font-bold">
              {batchFixCandidate.issue.category === 'video-caption'
                ? `${batchFixCandidate.count} videos in this course are missing captions. Would you like to turn on captions for all of them?`
                : batchFixCandidate.issue.category === 'color-only'
                ? `${batchFixCandidate.count} elements use color as the only visual indicator. Apply ${
                    batchFixCandidate.customFix === 'bold-underline' ? 'Bold + Underline'
                    : batchFixCandidate.customFix === 'underline' ? 'Underline'
                    : 'Bold'
                  } to all of them?`
                : `This issue appears in ${batchFixCandidate.count} places across the course. Do you want to fix all matching instances?`
              }
            </div>
          ) : ''
        }
        compact={true}
        buttons={
          batchFixCandidate ? [
            {
              label: `Fix All ${batchFixCandidate.count}`,
              onClick: handleBatchFixAllDuplicates,
              variant: 'primary'
            },
            {
              label: 'Just This One',
              onClick: handleBatchFixJustOne,
              variant: 'secondary'
            },
            {
              label: 'Cancel',
              onClick: () => setBatchFixCandidate(null),
              variant: 'cancel'
            }
          ] : []
        }
      />

      {/* 🎥 Video Caption Batch Fix Prompt */}
      <ConfirmationModal
        isOpen={videoCaptionBatchPrompt !== null}
        onClose={() => setVideoCaptionBatchPrompt(null)}
        title="More Videos Without Captions"
        message={
          videoCaptionBatchPrompt !== null ? (
            <div>
              <span className="font-semibold">{videoCaptionBatchPrompt}</span> other {videoCaptionBatchPrompt === 1 ? 'video' : 'videos'} in this course {videoCaptionBatchPrompt === 1 ? 'is' : 'are'} missing captions. Would you like to enable captions for all of them now?
            </div>
          ) : ''
        }
        compact={true}
        buttons={
          videoCaptionBatchPrompt !== null ? [
            {
              label: `Fix All ${videoCaptionBatchPrompt}`,
              onClick: handleBatchFixVideoCaptions,
              variant: 'primary'
            },
            {
              label: 'Not Now',
              onClick: () => setVideoCaptionBatchPrompt(null),
              variant: 'cancel'
            }
          ] : []
        }
      />

      {/* 🎨 Contrast Batch Fix Prompt */}
      <ConfirmationModal
        isOpen={contrastBatchPrompt !== null}
        onClose={() => setContrastBatchPrompt(null)}
        title="Multiple Contrast Issues Found"
        message={
          contrastBatchPrompt !== null ? (
            <div>
              <span className="font-semibold">{contrastBatchPrompt.count}</span> other {contrastBatchPrompt.count === 1 ? 'element has' : 'elements have'} insufficient contrast. Apply the same fix to all?
            </div>
          ) : ''
        }
        compact={true}
        buttons={
          contrastBatchPrompt !== null ? [
            {
              label: `Fix All ${contrastBatchPrompt.count}`,
              onClick: handleContrastBatchFix,
              variant: 'primary'
            },
            {
              label: 'Just This One',
              onClick: () => setContrastBatchPrompt(null),
              variant: 'cancel'
            }
          ] : []
        }
      />

      {/* ↩️ Revert Staged Fix Confirmation Dialog */}
      <ConfirmationModal
        isOpen={!!revertConfirmation}
        onClose={() => setRevertConfirmation(null)}
        title="Revert Staged Fix?"
        message={
          revertConfirmation ? (
            <>
              <div className="font-semibold mb-2">
                Are you sure you want to revert the staged fix for "{revertConfirmation.title}"?
              </div>
              <div>
                This will discard the staged changes and return the item to pending status.
              </div>
              {scanResults.filter(r => r.status === 'staged').length > 1 && (
                <label className="flex items-center gap-2 mt-3 cursor-pointer text-[13px] text-[#636366]">
                  <input
                    type="checkbox"
                    checked={revertAllChecked}
                    onChange={(e) => setRevertAllChecked(e.target.checked)}
                    className="w-4 h-4 rounded border-[#d2d2d7] accent-[#ff3b30]"
                  />
                  Also revert all other staged fixes ({scanResults.filter(r => r.status === 'staged').length - 1} more)
                </label>
              )}
            </>
          ) : ''
        }
        compact={true}
        buttons={[
          {
            label: 'Cancel',
            onClick: () => setRevertConfirmation(null),
            variant: 'cancel'
          },
          {
            label: 'Revert',
            onClick: confirmRevertStagedFix,
            variant: 'primary'
          }
        ]}
      />

      {/* ↩️ Revert ALL Staged Fixes Confirmation Dialog */}
      <ConfirmationModal
        isOpen={revertAllConfirmation}
        onClose={() => setRevertAllConfirmation(false)}
        title="Revert All Staged Fixes?"
        message={
          <>
            <div className="font-semibold mb-2">
              Are you sure you want to revert all {scanResults.filter(r => r.status === 'staged').length} staged fixes?
            </div>
            <div>
              This will discard all staged changes and return every item to pending status.
            </div>
          </>
        }
        compact={true}
        buttons={[
          {
            label: 'Cancel',
            onClick: () => setRevertAllConfirmation(false),
            variant: 'cancel'
          },
          {
            label: 'Revert All',
            onClick: confirmRevertAllStaged,
            variant: 'primary'
          }
        ]}
      />

      {/* ↩️ Undo Published Fix Confirmation Dialog */}
      <ConfirmationModal
        isOpen={!!undoConfirmation}
        onClose={() => setUndoConfirmation(null)}
        title="Undo Fix?"
        message={
          undoConfirmation ? (
            <>
              <div className="font-semibold mb-2">
                Undo the fix for "{undoConfirmation.title}"?
              </div>
              <div className="text-[#636366] text-[13px]">
                This will restore the original content in Canvas.
              </div>
            </>
          ) : ''
        }
        compact={true}
        buttons={[
          {
            label: 'Cancel',
            onClick: () => setUndoConfirmation(null),
            variant: 'cancel'
          },
          {
            label: 'Undo Fix',
            onClick: confirmUndoFix,
            variant: 'primary'
          }
        ]}
      />

      {/* 🚀 Publish to Canvas Confirmation Dialog */}
      <ConfirmationModal
        isOpen={!!publishConfirmation}
        onClose={() => {
          setPublishConfirmation(null);
        }}
        title="Publish to Canvas"
        message={
          publishConfirmation ? (
            <div>
              <div className="font-semibold mb-2">
                {publishConfirmation.singleIssue
                  ? <>Publish fix for "{publishConfirmation.singleIssue.title}" to Canvas?</>
                  : <>Are you sure you want to publish {publishConfirmation.count} staged {publishConfirmation.count === 1 ? 'fix' : 'fixes'} to Canvas?</>
                }
              </div>
              <div className="text-[#636366] text-[13px]">
                This will modify your course content in Canvas.
              </div>
              <label className="flex items-center gap-2 mt-3 text-[13px] text-[#636366] cursor-pointer select-none">
                <input
                  type="checkbox"
                  onChange={(e) => { skipPublishCheckboxRef.current = e.target.checked; }}
                  className="accent-[#0066CC] cursor-pointer"
                />
                Don't show this again
              </label>
            </div>
          ) : ''
        }
        compact={true}
        buttons={[
          {
            label: 'Cancel',
            onClick: () => {
              setPublishConfirmation(null);
            },
            variant: 'cancel'
          },
          {
            label: 'Publish',
            onClick: () => {
              // Save "Don't show this again" preference
              if (skipPublishCheckboxRef.current) {
                setSkipPublishConfirm(true);
                localStorage.setItem('simplify_skip_publish_confirm', 'true');
              }
              if (publishConfirmation?.singleIssue) {
                const issue = publishConfirmation.singleIssue;
                setPublishConfirmation(null);
                handlePublishSingleIssue(issue, true);
              } else {
                confirmPublishToCanvas();
              }
            },
            variant: 'primary'
          }
        ]}
      />

      {/* Batch Publish Progress Modal */}
      {batchPublishProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" role="dialog" aria-modal="true" aria-labelledby="batch-publish-title">
          <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-[480px] mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#e5e5e7]">
              <h3 id="batch-publish-title" className="text-[17px] font-semibold text-[#1d1d1f]">
                {batchPublishProgress.completed < batchPublishProgress.total
                  ? 'Publishing Fixes to Canvas...'
                  : 'Publish Complete'}
              </h3>
              <p className="text-[13px] text-[#636366] mt-0.5" aria-live="polite">
                {batchPublishProgress.completed < batchPublishProgress.total
                  ? `${batchPublishProgress.completed} of ${batchPublishProgress.total} processed`
                  : `${batchPublishProgress.successCount} succeeded, ${batchPublishProgress.failCount} failed`}
              </p>
            </div>

            {/* Progress bar */}
            <div className="px-5 pt-3">
              <div
                className="h-2 bg-[#f5f5f7] rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round((batchPublishProgress.completed / batchPublishProgress.total) * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Publishing progress"
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(batchPublishProgress.completed / batchPublishProgress.total) * 100}%`,
                    backgroundColor: batchPublishProgress.failCount > 0 ? '#ff9500' : '#34c759',
                  }}
                />
              </div>
            </div>

            {/* Per-item status list */}
            <div className="px-5 py-3 max-h-[320px] overflow-y-auto">
              <div className="space-y-1.5">
                {batchPublishProgress.items.map((item) => (
                  <div
                    key={item.issueId}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] ${
                      item.status === 'publishing' ? 'bg-[#0071e3]/5' :
                      item.status === 'success' ? 'bg-[#34c759]/5' :
                      item.status === 'failed' ? 'bg-[#ff3b30]/5' :
                      'bg-[#f5f5f7]'
                    }`}
                  >
                    {/* Status indicator */}
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {item.status === 'pending' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#d2d2d7]" aria-hidden="true" />
                      )}
                      {item.status === 'publishing' && (
                        <div className="w-4 h-4 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                      )}
                      {item.status === 'success' && (
                        <svg className="w-4 h-4 text-[#34c759]" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15"/>
                          <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {item.status === 'failed' && (
                        <svg className="w-4 h-4 text-[#ff3b30]" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15"/>
                          <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>

                    {/* Issue info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[#1d1d1f] font-medium truncate">{item.title}</div>
                      {item.location && (
                        <div className="text-[11px] text-[#636366] truncate">{item.location}</div>
                      )}
                      {item.error && (
                        <div className="text-[11px] text-[#ff3b30] mt-0.5">{item.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer — only show dismiss button when complete */}
            {batchPublishProgress.completed >= batchPublishProgress.total && (
              <div className="px-5 py-4 border-t border-[#e5e5e7] flex justify-end">
                <button
                  onClick={() => setBatchPublishProgress(null)}
                  className="h-[36px] px-5 rounded-[8px] bg-[#0071e3] hover:bg-[#0077ed] text-white text-[14px] font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Module Organization Preview Modal */}
      <ConfirmationModal
        isOpen={!!moduleOrganizationPreview}
        onClose={() => setModuleOrganizationPreview(null)}
        title="AI-Suggested Module Organization"
        message={
          moduleOrganizationPreview ? (
            <div className="max-h-[400px] overflow-y-auto">
              <div className="mb-4 text-[14px] text-[#636366]">
                AI analyzed your course and suggests {moduleOrganizationPreview.summary.totalModules} modules with {moduleOrganizationPreview.summary.totalItems} items:
              </div>
              {moduleOrganizationPreview.modules.map((module, idx) => (
                <div key={idx} className="mb-4 p-3 bg-[#f5f5f7] rounded-lg">
                  <div className="font-semibold text-[15px] mb-2">{module.name}</div>
                  <div className="space-y-1">
                    {module.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="text-[13px] text-[#636366] ml-3">
                        • {item.type}: {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : ''
        }
        buttons={[
          {
            label: 'Cancel',
            onClick: () => setModuleOrganizationPreview(null),
            variant: 'cancel'
          },
          {
            label: 'Apply to Canvas',
            onClick: applyModuleOrganization,
            variant: 'primary'
          }
        ]}
      />
    </>
  );
}

// Simple hash function for table HTML
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(36);
}