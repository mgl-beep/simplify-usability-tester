import { X, CheckCircle2, ExternalLink, Sparkles, Download, Upload, Eye, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { motion } from "motion/react";
import { useState } from "react";
import type { ScanIssue } from "../App";
import type { IMSCCCourse } from "../utils/imsccParser";
import { toast } from "sonner@2.0.3";
import JSZip from 'jszip';
import { FixPreviewModal } from "./FixPreviewModal";
import { CanvasConnectModal } from "./CanvasConnectModal";
import {
  isConnectedToCanvas,
  uploadCorrectedCourseToCanvas,
  getCourses as getCanvasCourses,
  initializeCanvas,
  getCanvasDomain
} from "../utils/canvasAPI";

interface FixItModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanResults: ScanIssue[];
  courseData?: IMSCCCourse;
  originalZip?: JSZip;
}

export function FixItModal({ isOpen, onClose, scanResults, courseData, originalZip }: FixItModalProps) {
  const [fixedIssues, setFixedIssues] = useState<Set<string>>(new Set());
  const [fixingIssue, setFixingIssue] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCanvasConnect, setShowCanvasConnect] = useState(false);
  const [isUploadingToCanvas, setIsUploadingToCanvas] = useState(false);
  const [aiMode, setAiMode] = useState(false);

  const handleAutoFix = (issueId: string) => {
    setFixingIssue(issueId);
    setTimeout(() => {
      setFixedIssues(prev => new Set([...prev, issueId]));
      setFixingIssue(null);
      toast.success('Issue fixed!');
    }, 1000);
  };

  const handleAIFixAll = async () => {
    setFixingIssue("ai-all");
    toast.loading('AI is analyzing your course...', { id: 'ai-fix' });
    
    // Simulate AI processing
    setTimeout(() => {
      setFixedIssues(new Set(scanResults.map(r => r.id)));
      setFixingIssue(null);
      toast.success('AI generated intelligent fixes for all issues!', { id: 'ai-fix' });
      
      // Show preview of AI fixes
      setTimeout(() => {
        setShowPreview(true);
      }, 500);
    }, 2500);
  };

  const handleFixAll = () => {
    setFixingIssue("all");
    setTimeout(() => {
      setFixedIssues(new Set(scanResults.filter(r => r.autoFixAvailable).map(r => r.id)));
      setFixingIssue(null);
      toast.success('All auto-fixable issues fixed!');
    }, 2000);
  };

  const handleExportCorrected = async () => {
    if (!courseData || !originalZip) {
      toast.error('No course data available for export');
      return;
    }

    setIsExporting(true);
    toast.loading('Applying fixes and generating IMSCC...', { id: 'export-imscc' });

    try {
      const { applyFixesToCourse, generateIMSCCBlob, downloadIMSCC } = await import('../utils/imsccFixer');
      
      // Get issues that have been fixed
      const issuesToFix = scanResults.filter(issue => fixedIssues.has(issue.id));
      
      if (issuesToFix.length === 0) {
        toast.error('No fixes applied yet. Please fix some issues first.', { id: 'export-imscc' });
        setIsExporting(false);
        return;
      }

      // Apply fixes to course content
      const { zip, result } = await applyFixesToCourse(originalZip, courseData, issuesToFix);
      
      // Generate downloadable blob
      const blob = await generateIMSCCBlob(zip);
      
      // Download the corrected IMSCC
      const fileName = `${courseData.title.replace(/[^a-z0-9]/gi, '_')}_CORRECTED.imscc`;
      downloadIMSCC(blob, fileName);
      
      toast.success(result.message, { id: 'export-imscc' });
    } catch (error) {
      console.error('Export error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to export corrected IMSCC';
      toast.error(errorMsg, { id: 'export-imscc' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleUploadToCanvas = async () => {
    if (!isConnectedToCanvas()) {
      setShowCanvasConnect(true);
      return;
    }

    if (!courseData || !originalZip) {
      toast.error('No course data available for upload');
      return;
    }

    setIsUploadingToCanvas(true);
    toast.loading('Preparing course for Canvas...', { id: 'canvas-upload' });

    try {
      const { applyFixesToCourse, generateIMSCCBlob } = await import('../utils/imsccFixer');
      
      const issuesToFix = scanResults.filter(issue => fixedIssues.has(issue.id));
      
      if (issuesToFix.length === 0) {
        toast.error('No fixes applied yet. Please fix some issues first.', { id: 'canvas-upload' });
        setIsUploadingToCanvas(false);
        return;
      }

      // Apply fixes
      const { zip } = await applyFixesToCourse(originalZip, courseData, issuesToFix);
      const blob = await generateIMSCCBlob(zip);

      // Get Canvas courses
      toast.loading('Fetching your Canvas courses...', { id: 'canvas-upload' });
      const domain = getCanvasDomain();
      if (!domain) throw new Error('Canvas domain not configured');
      
      const config = initializeCanvas(domain);
      const courses = await getCanvasCourses(config);

      // For demo, use the first course or let user select
      if (courses.length === 0) {
        throw new Error('No Canvas courses found. Please create a course in Canvas first.');
      }

      const targetCourse = courses[0];
      const fileName = `${courseData.title}_CORRECTED.imscc`;

      // Upload to Canvas
      await uploadCorrectedCourseToCanvas(
        targetCourse.id,
        blob,
        fileName,
        (message) => {
          toast.loading(message, { id: 'canvas-upload' });
        }
      );

      toast.success(`Successfully uploaded to "${targetCourse.name}"!`, { id: 'canvas-upload' });
    } catch (error) {
      console.error('Canvas upload error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload to Canvas';
      toast.error(errorMsg, { id: 'canvas-upload' });
    } finally {
      setIsUploadingToCanvas(false);
    }
  };

  // Generate preview data for AI fixes
  const generatePreviewChanges = () => {
    return scanResults.slice(0, 5).map(issue => ({
      issueId: issue.id,
      title: issue.title,
      category: issue.category,
      severity: issue.severity,
      before: getBeforeExample(issue),
      after: getAfterExample(issue),
      explanation: getAIExplanation(issue),
      confidence: 'high' as const
    }));
  };

  const getBeforeExample = (issue: ScanIssue) => {
    switch (issue.category) {
      case 'alt-text':
        return '<img src="photo.jpg" alt="">';
      case 'contrast':
        return '<p style="color: #ccc; background: #fff;">Low contrast text</p>';
      case 'inconsistent-heading':
        return '<h3>Module 1</h3>\n<h5>Lesson 1.1</h5>';
      case 'long-url':
        return '<a href="https://example.com/very/long/url/that/is/hard/to/read">https://example.com/very/long/url/that/is/hard/to/read</a>';
      default:
        return 'Original content with issue';
    }
  };

  const getAfterExample = (issue: ScanIssue) => {
    switch (issue.category) {
      case 'alt-text':
        return '<img src="photo.jpg" alt="Students collaborating on a group project in a modern classroom">';
      case 'contrast':
        return '<p style="color: #1d1d1f; background: #fff;">WCAG-compliant high contrast text</p>';
      case 'inconsistent-heading':
        return '<h2>Module 1</h2>\n<h3>Lesson 1.1</h3>';
      case 'long-url':
        return '<a href="https://example.com/very/long/url/that/is/hard/to/read">View Resource Guide</a>';
      default:
        return 'Fixed content meeting accessibility standards';
    }
  };

  const getAIExplanation = (issue: ScanIssue) => {
    switch (issue.category) {
      case 'alt-text':
        return 'AI analyzed the image context and generated descriptive alt text that conveys the meaning to screen reader users.';
      case 'contrast':
        return 'AI calculated WCAG AA compliant color combinations while maintaining your design aesthetic.';
      case 'inconsistent-heading':
        return 'AI corrected the heading hierarchy to follow semantic HTML standards for better navigation.';
      case 'long-url':
        return 'AI converted the raw URL into a descriptive link that\'s more user-friendly and accessible.';
      default:
        return 'AI applied intelligent fixes based on accessibility best practices.';
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[820px] p-0 gap-0 bg-white rounded-[16px] border-[#d2d2d7] overflow-hidden">
          <DialogTitle className="sr-only">Fix Course Issues</DialogTitle>
          <DialogDescription className="sr-only">
            Review and automatically fix accessibility and usability issues in your course
          </DialogDescription>
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-[#d2d2d7] bg-gradient-to-r from-[#0071e3]/5 to-[#34c759]/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-[24px] font-semibold tracking-tight text-[#1d1d1f]">Fix Issues</h2>
                  <button
                    onClick={() => setAiMode(!aiMode)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      aiMode
                        ? 'bg-gradient-to-r from-[#0071e3] to-[#34c759] text-white'
                        : 'bg-[#EEECE8] text-[#636366] hover:bg-[#e5e5e7]'
                    }`}
                  >
                    <Zap className="w-3 h-3 inline mr-1" strokeWidth={2} />
                    {aiMode ? 'AI Mode Active' : 'Enable AI'}
                  </button>
                </div>
                <p className="text-[13px] text-[#636366]">
                  {fixedIssues.size} of {scanResults.length} issues fixed
                  {aiMode && ' · AI-powered intelligent fixes enabled'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {aiMode ? (
                  <Button
                    onClick={handleAIFixAll}
                    disabled={fixingIssue !== null || fixedIssues.size === scanResults.length}
                    className="bg-gradient-to-r from-[#0071e3] to-[#34c759] hover:from-[#0077ed] hover:to-[#30b350] text-white h-[36px] px-4 rounded-[10px]"
                  >
                    <Sparkles className="w-4 h-4 mr-2" strokeWidth={2} />
                    AI Fix All
                  </Button>
                ) : (
                  <Button
                    onClick={handleFixAll}
                    disabled={fixingIssue !== null || fixedIssues.size === scanResults.length}
                    className="bg-[#34c759] hover:bg-[#30b350] text-white h-[36px] px-4 rounded-[10px]"
                  >
                    <Sparkles className="w-4 h-4 mr-2" strokeWidth={2} />
                    Auto-Fix All
                  </Button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-white/80 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-[#636366]" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="max-h-[500px]">
            <div className="p-8">
              {aiMode && fixedIssues.size === 0 && (
                <div className="mb-6 p-5 bg-gradient-to-r from-[#0071e3]/10 to-[#34c759]/10 border border-[#0071e3]/20 rounded-[12px]">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-[#0071e3] mt-0.5" strokeWidth={2} />
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">
                        AI-Powered Intelligent Fixes
                      </h3>
                      <p className="text-[13px] text-[#636366] leading-relaxed">
                        AI will analyze your course content and generate meaningful fixes like descriptive alt text,
                        WCAG-compliant colors, improved readability, and optimized navigation structure.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {scanResults.map((issue, index) => {
                  const isFixed = fixedIssues.has(issue.id);
                  const isFixing = fixingIssue === issue.id || fixingIssue === "all" || fixingIssue === "ai-all";

                  return (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border rounded-[12px] p-5 transition-all ${
                        isFixed
                          ? "border-[#34c759] bg-[#34c759]/5"
                          : "border-[#d2d2d7] bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className="mt-1">
                          {isFixed ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 rounded-full bg-[#34c759] flex items-center justify-center"
                            >
                              <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2.5} />
                            </motion.div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-[#d2d2d7]" />
                          )}
                        </div>

                        {/* Issue Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-[15px] font-medium text-[#1d1d1f]">{issue.title}</h3>
                            <Badge
                              className={`${
                                issue.severity === "high"
                                  ? "bg-[#ff3b30] text-white"
                                  : "bg-[#ff9500] text-white"
                              } text-[10px] px-1.5 py-0 h-4 border-0`}
                            >
                              {issue.severity}
                            </Badge>
                            {aiMode && <Badge className="bg-gradient-to-r from-[#0071e3] to-[#34c759] text-white text-[9px] px-1.5 py-0 h-4 border-0">
                              AI
                            </Badge>}
                          </div>

                          <p className="text-[13px] text-[#636366] mb-2">
                            {issue.description}
                          </p>

                          <div className="text-[12px] text-[#636366] mb-3">
                            📍 {issue.location}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleAutoFix(issue.id)}
                              disabled={isFixed || isFixing || !issue.autoFixAvailable}
                              size="sm"
                              className={`h-[32px] px-4 rounded-[8px] text-[13px] ${
                                isFixed
                                  ? "bg-[#34c759] hover:bg-[#34c759] text-white"
                                  : aiMode
                                  ? "bg-gradient-to-r from-[#0071e3] to-[#34c759] hover:from-[#0077ed] hover:to-[#30b350] text-white"
                                  : "bg-[#0071e3] hover:bg-[#0077ed] text-white"
                              }`}
                            >
                              {isFixing ? (
                                <>
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full mr-2"
                                  />
                                  {aiMode ? 'AI Fixing...' : 'Fixing...'}
                                </>
                              ) : isFixed ? (
                                "Fixed"
                              ) : (
                                aiMode ? "AI Fix" : "Auto-Fix"
                              )}
                            </Button>

                            {!issue.autoFixAvailable && (
                              <span className="text-[11px] text-[#636366]">Manual review required</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-[#d2d2d7] bg-[#EEECE8]">
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-[#636366]">
                {fixedIssues.size > 0 
                  ? 'Export or upload directly to Canvas' 
                  : 'Apply fixes to enable export'}
              </p>
              <div className="flex items-center gap-2">
                {aiMode && fixedIssues.size > 0 && (
                  <Button
                    onClick={() => setShowPreview(true)}
                    variant="outline"
                    className="h-[36px] px-4 rounded-[10px] border-[#0071e3] text-[#0071e3] hover:bg-[#0071e3]/10"
                  >
                    <Eye className="w-4 h-4 mr-2" strokeWidth={2} />
                    Preview Changes
                  </Button>
                )}
                
                {courseData && originalZip && fixedIssues.size > 0 && (
                  <>
                    <Button
                      onClick={handleExportCorrected}
                      disabled={isExporting}
                      variant="outline"
                      className="h-[36px] px-4 rounded-[10px] border-[#d2d2d7] hover:bg-white"
                    >
                      <Download className="w-4 h-4 mr-2" strokeWidth={2} />
                      {isExporting ? 'Exporting...' : 'Export IMSCC'}
                    </Button>
                    
                    <Button
                      onClick={handleUploadToCanvas}
                      disabled={isUploadingToCanvas}
                      className="bg-gradient-to-r from-[#0071e3] to-[#34c759] hover:from-[#0077ed] hover:to-[#30b350] text-white h-[36px] px-5 rounded-[10px]"
                    >
                      <Upload className="w-4 h-4 mr-2" strokeWidth={2} />
                      {isUploadingToCanvas ? 'Uploading...' : 'Upload to Canvas'}
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="h-[36px] px-5 rounded-[10px] border-[#d2d2d7] hover:bg-white"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <FixPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onApplyFixes={() => {
          // Fixes already applied, just close
          setShowPreview(false);
        }}
        changes={generatePreviewChanges()}
        courseName={courseData?.title || 'Course'}
      />

      {/* Canvas Connect Modal */}
      <CanvasConnectModal
        isOpen={showCanvasConnect}
        onClose={() => setShowCanvasConnect(false)}
        onConnected={() => {
          setShowCanvasConnect(false);
          // Retry upload after connecting
          setTimeout(() => handleUploadToCanvas(), 500);
        }}
      />
    </>
  );
}