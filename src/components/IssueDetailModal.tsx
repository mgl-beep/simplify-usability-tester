import { X, Loader2, AlertCircle, CheckCircle, AlertTriangle, Check, Wand2, ChevronRight, ChevronDown, BookOpen, Lightbulb, Zap, Sparkles, ListOrdered, Send, ImageOff, Download, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import type { ScanIssue } from '../App';
import { getCanvasConfig, getPage, getAssignment, getCoursePages } from '../utils/canvasAPI';
import { toast } from 'sonner@2.0.3';
import { getStandardDescription } from '../utils/standards/standardsMapping';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { AIObjectivesGenerator } from './AIObjectivesGenerator';

interface IssueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: ScanIssue | null;
  onApplyFix: (issue: ScanIssue, customFix?: string, uploadedImageData?: string) => void;
  onResolve?: (issue: ScanIssue, reason?: string) => void;
  onIgnore?: (issue: ScanIssue) => void;
  onIgnoreSilent?: (issue: ScanIssue) => void;
  onPublishSingleIssue?: (issue: ScanIssue) => void;
  onRevertStagedFix?: (issue: ScanIssue) => void;
  onRevertAllStaged?: () => void;
  stagedCount?: number;
  enabledStandards?: string[]; // Array of enabled standard IDs (e.g., ['cvc-oei', 'peralta', 'qm'])
  // AI suggestions cache for consistency across repeated items
  aiSuggestionsCache?: Record<string, {
    suggestions: any[];
    pageInfo?: any;
    timestamp: Date;
    usedCount: number;
  }>;
  onUpdateAiCache?: (key: string, data: {
    suggestions: any[];
    pageInfo?: any;
    timestamp: Date;
    usedCount: number;
  }) => void;
}

interface AltTextSuggestion {
  level: 'brief' | 'moderate' | 'detailed';
  text: string;
}

export function IssueDetailModal({
  isOpen,
  onClose,
  issue,
  onApplyFix,
  onResolve,
  onIgnore,
  onIgnoreSilent,
  onPublishSingleIssue,
  onRevertStagedFix,
  onRevertAllStaged,
  stagedCount = 0,
  enabledStandards = ['cvc-oei', 'peralta', 'qm'], // Default to all educational rubrics
  aiSuggestionsCache = {},
  onUpdateAiCache
}: IssueDetailModalProps) {
  // DEBUG LOGGING FOR CONTRAST ISSUES
  if (issue?.category === 'contrast') {
  }
  
  const [isFixing, setIsFixing] = useState(false);
  const [contentHtml, setContentHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCustomFix, setShowCustomFix] = useState(false);
  const [customLinkText, setCustomLinkText] = useState('');
  const [replacementUrl, setReplacementUrl] = useState('');
  const [customAltText, setCustomAltText] = useState(''); // Always start with empty alt text - AI will populate it
  const [customTableCaption, setCustomTableCaption] = useState(''); // Table caption state
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ level: string; text: string }[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [showDecorativePrompt, setShowDecorativePrompt] = useState(true); // Show decorative check first
  const [designVariant, setDesignVariant] = useState(1); // TEMP: design switcher for objectives modal
  const [isDecorativeImage, setIsDecorativeImage] = useState<boolean | null>(null); // null = not decided yet
  const [isComplexImage, setIsComplexImage] = useState(false); // AI-detected complex image (diagram, chart, etc.)
  const [complexCaption, setComplexCaption] = useState(''); // AI-generated text description for complex images
  const [aiUnavailable, setAiUnavailable] = useState(false); // Track if AI is unavailable
  const [showTableDataPrompt, setShowTableDataPrompt] = useState(true); // Show table data check first
  const [isDataTable, setIsDataTable] = useState<boolean | null>(null); // null = not decided yet
  const [tablePurpose, setTablePurpose] = useState<string | null>(null); // Track what the user is using the table for (DEPRECATED - use tablePurposes)
  const [tablePurposes, setTablePurposes] = useState<string[]>([]); // Track MULTIPLE purposes for layout tables
  const [convertedTableHtml, setConvertedTableHtml] = useState<string | null>(null); // Store the converted HTML for preview
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewOriginal, setPreviewOriginal] = useState('');
  const [previewFixed, setPreviewFixed] = useState('');
  const [selectedContrastColor, setSelectedContrastColor] = useState<string>('#000000'); // Default to black
  const [selectedColorOnlyFix, setSelectedColorOnlyFix] = useState<'bold'>('bold'); // Color-only fix option
  const [showObjectivesGenerator, setShowObjectivesGenerator] = useState(false); // AI objectives generator modal
  const [aiGeneratedObjectives, setAiGeneratedObjectives] = useState<Array<{
    text: string;
    mappedItem?: string;
    bloomsLevel?: string;
    actionVerb?: string;
  }>>([]); // Store AI-generated objectives with mappings
  const [isGeneratingObjectives, setIsGeneratingObjectives] = useState(false); // Loading state for objectives generation

  // AI Content Rewrite state (plain-language, instructions, readability, assessment-guidance)
  const [aiRewrittenContent, setAiRewrittenContent] = useState<string>('');
  const [isRewritingContent, setIsRewritingContent] = useState(false);

  // Editable title for welcome announcement / discussion board creation
  const [announcementTitle, setAnnouncementTitle] = useState<string>('');

  // Proxied image URL for Canvas images that need auth
  const [proxyImageUrl, setProxyImageUrl] = useState<string | null>(null);

  // Broken image upload state
  const [isImageBroken, setIsImageBroken] = useState(false);
  const [uploadedImageDataUrl, setUploadedImageDataUrl] = useState<string | null>(null);

  // PDF conversion state
  const [isConvertingPdf, setIsConvertingPdf] = useState(false);
  const [convertedPdfHtml, setConvertedPdfHtml] = useState<string>('');
  const [pdfConversionError, setPdfConversionError] = useState<string | null>(null);
  const [showPdfRawEditor, setShowPdfRawEditor] = useState(false);

  // Audio Description state (WCAG 1.2.5)
  const [adScript, setAdScript] = useState<Array<{ startTime: string; endTime: string; description: string }>>([]);
  const [isGeneratingAD, setIsGeneratingAD] = useState(false);
  const [adTranscript, setAdTranscript] = useState('');
  const [adSummary, setAdSummary] = useState('');

  // Accordion state for collapsible sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['suggestions', 'alttext-suggestions', 'complex-caption']));

  // Detect if this is a link-related issue
  const isBrokenLinkIssue = issue?.category === 'broken-link';
  const isLinkIssue = isBrokenLinkIssue ||
                      issue?.title.toLowerCase().includes('link') ||
                      issue?.elementHtml?.includes('<a ');

  // Detect if this is specifically a long-url issue
  const isLongUrlIssue = issue?.category === 'long-url' || issue?.title === 'Long URL as Link Text';

  // Detect if this is an alt text issue
  const isAltTextIssue = issue?.category === 'alt-text' || issue?.title.toLowerCase().includes('alt text');

  // Detect if this is a table caption issue
  const isTableCaptionIssue = issue?.category === 'table-caption' || issue?.title === 'Table Missing Caption';
  
  // Detect if this is a table headers issue
  const isTableHeadersIssue = issue?.category === 'table-headers' || issue?.title === 'Table Missing Header';
  
  // Detect if this is a layout table issue (not a data table)
  const isLayoutTableIssue = issue?.category === 'layout-table';
  
  // Detect if this is any table-related issue
  const isTableIssue = isTableCaptionIssue || isTableHeadersIssue || isLayoutTableIssue;

  // Detect if this is a video caption issue
  const isVideoCaptionIssue = issue?.category === 'video-caption';

  // For video-caption, derive autoFixAvailable from elementHtml so old scan results
  // (stored before autoFixAvailable was set) still show the Apply Fix button
  const effectiveAutoFixAvailable = isVideoCaptionIssue
    ? (() => {
        const src = issue?.elementHtml?.match(/src="([^"]+)"/)?.[1] || '';
        return src.includes('youtube.com') || src.includes('youtube-nocookie.com') || src.includes('youtu.be') || src.includes('vimeo.com');
      })()
    : (issue?.autoFixAvailable ?? false);

  // Detect if this is an objectives issue
  const isObjectivesIssue = issue?.category === 'objectives' || issue?.title === 'Unit Objectives Missing';

  // Detect if this is a PDF accessibility issue
  const isPdfIssue = issue?.category === 'pdf-tag';

  // Detect if this is an AI-rewrite issue (content/language categories)
  const isAIRewriteIssue = ['plain-language', 'instructions', 'readability', 'assessment-guidance'].includes(issue?.category || '');

  // Detect if this is an AI-template issue (structural course content to create from scratch)
  const isTemplateIssue = ['instructor-contact', 'student-interaction', 'assessment-criteria', 'policies', 'module-discussion'].includes(issue?.category || '');

  // Welcome announcement and peer interaction have AI generation — they are NOT manual fixes
  const isWelcomeIssue = issue?.category === 'instructor-contact';
  const isPeerInteractionIssue = issue?.category === 'student-interaction';

  // RSI issues
  const isCommGuidelinesIssue = issue?.category === 'communication-guidelines';
  const isModuleDiscussionIssue = issue?.category === 'module-discussion';

  // Detect if this is a color contrast issue
  const isContrastIssue = issue?.category === 'color-contrast' || issue?.category === 'contrast' || issue?.title?.toLowerCase().includes('color contrast');

  // Detect if this is a color-as-sole-indicator issue
  const isColorOnlyIssue = issue?.category === 'color-only';

  // Detect if this is an audio description issue
  const isAudioDescriptionIssue = issue?.category === 'audio-description';

  // Detect if this is a link accessibility issue
  const isLinkAccessibilityIssue = issue?.category === 'link-accessibility';

  // Detect when there's insufficient existing content for AI to work with —
  // welcome/peer interaction issues are excluded because AI can generate from course name alone
  const elementTextLength = (issue?.elementHtml || '').replace(/<[^>]*>/g, '').trim().length;
  const needsManualFix = (isTemplateIssue && !isWelcomeIssue && !isPeerInteractionIssue && !isCommGuidelinesIssue && !isModuleDiscussionIssue && elementTextLength < 80) ||
                         (isObjectivesIssue && issue?.autoFixAvailable === false);
  
  // Accessibility: refs for focus management
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<Element | null>(null);

  // Accessibility: close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Accessibility: save and restore focus when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement;
    }
    return () => {
      if (previouslyFocusedElement.current && previouslyFocusedElement.current instanceof HTMLElement) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen]);

  // Accessibility: focus the modal container on mount
  useEffect(() => {
    if (isOpen && modalContainerRef.current) {
      modalContainerRef.current.focus();
    }
  }, [isOpen]);

  // Log issue type detection when issue changes
  useEffect(() => {
    if (issue) {
    }
  }, [issue?.id]);

  // Reset custom fix state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setShowCustomFix(false);
      setCustomLinkText('');
      setReplacementUrl('');
      setCustomAltText('');
      setCustomTableCaption('');
      setValidationResult(null);
      setAiSuggestions([]);
      setSelectedSuggestion(null);
      setShowDecorativePrompt(true); // Reset to show decorative prompt for alt text issues
      setIsDecorativeImage(null); // Reset decorative decision
      setIsComplexImage(false); // Reset complex image detection
      setComplexCaption(''); // Reset complex caption
      setShowTableDataPrompt(true); // Reset to show table data prompt for table issues
      setIsDataTable(null); // Reset table data decision
      setTablePurpose(null); // Reset table purpose selection (legacy)
      setTablePurposes([]); // Reset table purposes (multi-select)
      setConvertedTableHtml(null); // Reset converted HTML preview
      setAiUnavailable(false); // Reset AI availability
      setIsRewritingContent(false);
      // If title says "Image Not Found", start as broken
      setIsImageBroken(issue?.title?.includes('Image Not Found') || false);
      setUploadedImageDataUrl(null); // Reset uploaded image
      // Set default title for welcome / discussion creation; body is left blank for manual entry
      if (issue?.category === 'instructor-contact') {
        setAnnouncementTitle(`Welcome to ${issue.courseName || 'the Course'}!`);
      } else if (issue?.category === 'student-interaction') {
        setAnnouncementTitle(`${issue.courseName || 'Course'} — Peer Discussion`);
      } else if (issue?.category === 'module-discussion') {
        const modName = issue?.location?.replace(/^Module:\s*/i, '') || 'Module';
        setAnnouncementTitle(`${modName} — Discussion`);
      } else {
        setAnnouncementTitle('');
      }
      setAiRewrittenContent('');
      // Reset PDF conversion state
      setIsConvertingPdf(false);
      setConvertedPdfHtml('');
      setPdfConversionError(null);
      setShowPdfRawEditor(false);
      // Reset audio description state
      setAdScript([]);
      setIsGeneratingAD(false);
      setAdTranscript('');
      setAdSummary('');
    }
  }, [isOpen, issue]);

  // Validate custom link text in real-time
  useEffect(() => {
    if (isLinkIssue && customLinkText) {
      const result = validateLinkText(customLinkText);
      setValidationResult(result);
    } else if (isAltTextIssue && customAltText) {
      const result = validateAltText(customAltText);
      setValidationResult(result);
    } else if (isTableCaptionIssue && customTableCaption) {
      const result = validateTableCaption(customTableCaption);
      setValidationResult(result);
    } else {
      setValidationResult(null);
    }
  }, [customLinkText, customAltText, customTableCaption, isLinkIssue, isAltTextIssue, isTableCaptionIssue]);

  // Load content when modal opens
  useEffect(() => {
    if (isOpen && issue) {
      loadContent();
    }
  }, [isOpen, issue]);

  // Load Canvas image preview via proxy for alt text issues
  useEffect(() => {
    if (!isOpen || !issue || !isAltTextIssue) {
      setProxyImageUrl(null);
      return;
    }
    const srcMatch = issue.elementHtml?.match(/src="([^"]+)"/);
    if (!srcMatch?.[1]) return;
    const imgSrc = srcMatch[1];
    // Extract Canvas file ID from URL patterns like /files/12345/preview or /courses/xxx/files/12345/...
    const fileIdMatch = imgSrc.match(/\/files\/(\d+)/);
    if (!fileIdMatch) {
      // Not a Canvas file URL — might be an external image, let it load directly
      setProxyImageUrl(imgSrc);
      return;
    }
    const fileId = fileIdMatch[1];
    const config = getCanvasConfig();
    if (!config) return;
    // Fetch file metadata to get temporary download URL
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74508696/canvas/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
      body: JSON.stringify({ domain: config.domain, accessToken: config.accessToken, fileId })
    })
      .then(r => r.json())
      .then(data => {
        if (data.file?.url) {
          setProxyImageUrl(data.file.url);
        }
      })
      .catch(() => { /* silently fail — preview just won't show */ });
  }, [isOpen, issue?.id, isAltTextIssue]);

  // Auto-generate table caption suggestions when modal opens
  useEffect(() => {
    if (isOpen && issue && isTableCaptionIssue && !aiUnavailable) {
      // Small delay to ensure state is reset
      setTimeout(() => {
        generateTableCaptionSuggestions();
      }, 50);
    }
  }, [isOpen, issue?.id, isTableCaptionIssue]); // Use issue.id to detect changes

  // Auto-generate link text suggestions when modal opens for link issues
  useEffect(() => {
    if (isOpen && issue && isLinkIssue && !isLayoutTableIssue && !aiUnavailable) {
      // Small delay to ensure state is reset
      setTimeout(() => {
        generateLinkTextSuggestions();
      }, 50);
    }
  }, [isOpen, issue?.id, isLinkIssue, isLayoutTableIssue]);

  // Auto-generate learning objectives when modal opens for objectives issues
  useEffect(() => {
    if (isOpen && issue && isObjectivesIssue && issue.autoFixAvailable !== false) {
      // Small delay to ensure state is reset
      setTimeout(() => {
        generateLearningObjectives();
      }, 50);
    }
  }, [isOpen, issue?.id, isObjectivesIssue]); // Use issue.id to detect changes

  // Auto-generate content rewrite or template when modal opens
  // Welcome/peer issues are excluded — they use a manual form instead
  // Communication guidelines are pre-populated from suggestedContent (no AI call)
  useEffect(() => {
    if (isOpen && issue && !aiUnavailable && !needsManualFix && !isWelcomeIssue && !isPeerInteractionIssue && !isCommGuidelinesIssue) {
      if (isAIRewriteIssue && issue.elementHtml) {
        setTimeout(() => generateContentRewrite(), 50);
      } else if (isTemplateIssue) {
        setTimeout(() => generateContentRewrite(), 50);
      }
    }
    // Pre-populate communication guidelines from suggestedContent
    if (isOpen && issue && isCommGuidelinesIssue && issue.suggestedContent) {
      setAiRewrittenContent(issue.suggestedContent);
    }
  }, [isOpen, issue?.id, isAIRewriteIssue, isTemplateIssue, needsManualFix, isCommGuidelinesIssue]);

  // Auto-generate alt text suggestions when user clicks "No" (not decorative)
  // We don't auto-generate on modal open to let user choose decorative first
  useEffect(() => {
    if (isOpen && issue && isAltTextIssue && !aiUnavailable && isDecorativeImage === false && !showDecorativePrompt) {
      // Small delay to ensure state is reset
      setTimeout(() => {
        generateAltTextSuggestions(true);
      }, 50);
    }
  }, [isOpen, issue?.id, isAltTextIssue, isDecorativeImage, showDecorativePrompt]); // Use issue.id to detect changes

  // Generate a live preview of the converted HTML whenever the user picks table purposes
  useEffect(() => {
    if (tablePurposes.length === 0 || !issue?.elementHtml) { setConvertedTableHtml(null); return; }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(issue.elementHtml, 'text/html');
      const table = doc.querySelector('table');
      if (!table) { setConvertedTableHtml(null); return; }
      const cells = Array.from(table.querySelectorAll('td, th'));
      const cellContents = cells.map(cell => cell.innerHTML.trim()).filter(c => c);
      let html = '';

      // data always takes priority
      if (tablePurposes.includes('data')) {
        const rows = Array.from(table.querySelectorAll('tr'));
        let t = '<table style="width:100%;border-collapse:collapse;font-size:13px;"><caption style="text-align:left;font-weight:600;margin-bottom:4px;">Data Table</caption>';
        rows.forEach((row, ri) => {
          t += '<tr>';
          Array.from(row.querySelectorAll('td, th')).forEach((cell, ci) => {
            const content = cell.innerHTML.trim();
            const style = 'padding:4px 8px;border:1px solid #d2d2d7;';
            if (ri === 0) t += `<th scope="col" style="${style}background:#EEECE8;font-weight:600;">${content}</th>`;
            else if (ci === 0) t += `<th scope="row" style="${style}background:#EEECE8;font-weight:600;">${content}</th>`;
            else t += `<td style="${style}">${content}</td>`;
          });
          t += '</tr>';
        });
        t += '</table>';
        html = t;
      } else {
        const hasList = tablePurposes.includes('list');
        const hasLinks = tablePurposes.includes('links');
        const hasGallery = tablePurposes.includes('gallery');

        if (hasLinks && !hasList) {
          // links-only or links+gallery → <nav><ul>
          const items = cellContents.map(c => {
            const content = hasGallery && c.includes('<img')
              ? `<figure style="margin:0;padding:4px;border:1px solid #e5e5e7;border-radius:6px;">${c}</figure>`
              : c;
            return c.includes('<a ') ? `<li style="margin-bottom:6px;">${content}</li>` : `<li style="margin-bottom:6px;"><a href="#">${content}</a></li>`;
          }).join('');
          html = `<nav><ul style="list-style:none;padding:0;margin:0;">${items}</ul></nav>`;
        } else {
          // list, gallery, list+links, or list+links+gallery → <ul>
          const items = cellContents.map(c => {
            let content = c;
            if (hasGallery && content.includes('<img')) {
              content = `<figure style="margin:0;padding:4px;border:1px solid #e5e5e7;border-radius:6px;">${content}</figure>`;
            }
            return `<li style="margin-bottom:4px;">${content}</li>`;
          }).join('');
          html = `<ul style="padding-left:1.5em;margin:0;">${items}</ul>`;
        }
      }

      setConvertedTableHtml(html || null);
    } catch { setConvertedTableHtml(null); }
  }, [tablePurposes, issue?.elementHtml]);

  const loadContent = async () => {
    if (!issue || !issue.contentId || !issue.contentType) {
      // If no content metadata, show the elementHtml if available
      if (issue?.elementHtml) {
        setContentHtml(issue.elementHtml);
      }
      return;
    }
    
    // Skip loading from Canvas API for demo issues - use elementHtml instead
    if (issue.isDemo) {
      setContentHtml(issue.elementHtml || '<p>Demo content preview</p>');
      return;
    }

    // Skip Canvas fetch for issues where there is no fetchable page content:
    // - policies: contentId is 'syllabus' (not a real page URL)
    // - instructor-contact / student-interaction: contentType is 'course' (creates new content)
    // - objectives: contentType is 'module' (no single page to fetch)
    // - assessment-criteria: template content appended to assignment (handled by AI generator)
    const skipFetch =
      issue.contentId === 'syllabus' ||
      issue.contentType === 'module' ||
      issue.contentType === 'course' ||
      issue.contentType === 'file' ||
      ['policies', 'instructor-contact', 'student-interaction', 'assessment-criteria', 'objectives', 'link-accessibility', 'communication-guidelines', 'module-discussion'].includes(issue.category || '');

    if (skipFetch) {
      setContentHtml(issue.elementHtml || '');
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const config = getCanvasConfig();
      if (!config) {
        throw new Error('Canvas not configured');
      }

      if (issue.contentType === 'page') {
        let page;
        try {
          page = await getPage(config, parseInt(issue.courseId), issue.contentId);
        } catch (pageError) {
          // Fallback: find the page by title from the location field
          if (issue.location) {
            const titleMatch = issue.location.match(/^Page:\s*(.+)$/i);
            if (titleMatch) {
              const allPages = await getCoursePages(config, parseInt(issue.courseId));
              const match = allPages.find(p => p.title.toLowerCase() === titleMatch[1].trim().toLowerCase());
              if (match?.url) {
                page = await getPage(config, parseInt(issue.courseId), match.url);
                // Fix the issue's contentId for future use
                issue.contentId = match.url;
              }
            }
          }
          if (!page) throw pageError;
        }
        setContentHtml(page.body || '');
      } else if (issue.contentType === 'assignment') {
        const assignment = await getAssignment(config, parseInt(issue.courseId), issue.contentId);
        setContentHtml(assignment.description || '<p>Assignment content preview not yet available</p>');
      }
    } catch (error) {
      console.error('❌ Error loading content:', error);
      console.error('  Issue details:', {
        contentType: issue.contentType,
        courseId: issue.courseId,
        contentId: issue.contentId,
        title: issue.title
      });
      
      // Determine error type - gracefully handle all Canvas API errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('  Error message:', errorMessage);
      
      if (errorMessage.includes('Not Found') || errorMessage.includes('404') || errorMessage.includes('Canvas API error: Not Found')) {
        // Content no longer exists — silently remove the flag and close
        if (issue && onIgnoreSilent) {
          onIgnoreSilent(issue);
        }
        onClose();
        return;
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        setLoadError('You don\'t have permission to access this content. Please check your Canvas permissions.');
      } else if (errorMessage.includes('Canvas API error')) {
        // Generic Canvas API error - be helpful but not alarming
        setLoadError('Unable to load content from Canvas. The element preview below may still be helpful.');
      } else {
        setLoadError('Unable to load content from Canvas. The element preview below may still be helpful.');
      }
      
      // Fallback to elementHtml
      setContentHtml(issue?.elementHtml || '<p>Content preview unavailable</p>');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFix = async () => {
    if (!issue) return;
    
    // For objectives issues, apply the AI-generated objectives
    if (isObjectivesIssue) {
      if (aiGeneratedObjectives.length === 0) {
        toast.error('No outcomes available. Please wait for generation to complete.');
        return;
      }

      // Filter out empty objectives
      const validObjectives = aiGeneratedObjectives.filter(obj => obj.text.trim());

      if (validObjectives.length === 0) {
        toast.error('Please add at least one outcome.');
        return;
      }

      // Format objectives as HTML list with mapped items as comments
      const objectivesHtml = '<h3>Learning Outcomes</h3>\n<ol>\n' +
        validObjectives.map(obj => `  <li>${obj.text.trim()}</li>`).join('\n') +
        '\n</ol>';

      setIsFixing(true);
      try {
        onApplyFix(issue, objectivesHtml);
        toast.success('Learning outcomes applied!');
        onClose();
      } catch (error) {
        console.error('Error applying objectives fix:', error);
        toast.error('Failed to apply outcomes. Please try again.');
      } finally {
        setIsFixing(false);
      }
      return;
    }

    // For PDF issues, stage the converted HTML
    if (isPdfIssue) {
      if (!convertedPdfHtml.trim()) {
        toast.error('Please convert the PDF first.');
        return;
      }
      setIsFixing(true);
      try {
        // Pass converted HTML as the custom fix — canvasFixer will use it via suggestedContent
        onApplyFix(issue, convertedPdfHtml.trim());
        toast.success('Accessible page staged!');
        onClose();
      } catch (error) {
        console.error('Error staging PDF fix:', error);
        toast.error('Failed to stage fix. Please try again.');
      } finally {
        setIsFixing(false);
      }
      return;
    }
    
    // For audio description issues, build the text alternative HTML from the script
    if (isAudioDescriptionIssue) {
      if (adScript.length === 0) {
        toast.error('Please generate an audio description first.');
        return;
      }
      setIsFixing(true);
      try {
        const adHtml = adScript.map(entry =>
          `<p><strong>[${entry.startTime} – ${entry.endTime}]</strong> ${entry.description}</p>`
        ).join('\n');
        // Update the issue's suggestedFix so canvasFixer can use it
        const issueWithAD = { ...issue, suggestedFix: adHtml };
        onApplyFix(issueWithAD, adHtml);
        toast.success('Text alternative staged!');
        onClose();
      } catch (error) {
        console.error('Error staging audio description fix:', error);
        toast.error('Failed to stage fix. Please try again.');
      } finally {
        setIsFixing(false);
      }
      return;
    }

    // IMPORTANT: If this is a decorative image, call onResolve instead
    if (isAltTextIssue && isDecorativeImage === true && onResolve) {
      onResolve(issue, "Marked as decorative image");
      onClose();
      return;
    }
    
    // Layout tables are handled by convertLayoutTable() function instead
    if (isLayoutTableIssue && isDataTable === false && tablePurposes.length === 0) {
      toast.error('Please select at least one purpose for this table.')
      return;
    }
    
    setIsFixing(true);
    try {
      // Pass custom fix based on issue type
      let customFix: string | undefined;
      
      if ((isWelcomeIssue || isPeerInteractionIssue || isModuleDiscussionIssue) && aiRewrittenContent.trim()) {
        // Encode title + body together so canvasFixer can use the editable title
        customFix = JSON.stringify({ title: announcementTitle.trim(), body: aiRewrittenContent.trim() });
      } else if (isCommGuidelinesIssue && aiRewrittenContent.trim()) {
        customFix = aiRewrittenContent.trim();
      } else if ((isAIRewriteIssue || isTemplateIssue) && aiRewrittenContent.trim()) {
        customFix = aiRewrittenContent.trim();
      } else if (isBrokenLinkIssue && replacementUrl.trim() && customLinkText.trim()) {
        // For broken links, pass both URL and text as JSON
        customFix = JSON.stringify({ url: replacementUrl.trim(), text: customLinkText.trim() });
      } else if (isLinkIssue && customLinkText.trim()) {
        customFix = customLinkText.trim();
      } else if (isAltTextIssue && customAltText.trim()) {
        customFix = customAltText.trim();
      } else if (isTableCaptionIssue && customTableCaption.trim()) {
        customFix = customTableCaption.trim();
      } else if ((issue.category === 'color-contrast' || issue.category === 'contrast' || issue?.title?.toLowerCase().includes('color contrast')) && selectedContrastColor) {
        customFix = selectedContrastColor; // Pass the selected color
      } else if (isColorOnlyIssue && selectedColorOnlyFix) {
        customFix = selectedColorOnlyFix; // Pass 'bold', 'underline', or 'bold-underline'
      }

      // Block apply if AI rewrite or template needed but not yet generated
      if ((isAIRewriteIssue || (isTemplateIssue && !isWelcomeIssue && !isPeerInteractionIssue && !isCommGuidelinesIssue && !isModuleDiscussionIssue)) && !aiRewrittenContent.trim()) {
        toast.error('Please wait for the AI to finish generating, or click Regenerate if it failed.');
        setIsFixing(false);
        return;
      }
      
      // Pass uploaded image data for broken image alt text fixes
      const imageData = (isAltTextIssue && uploadedImageDataUrl) ? uploadedImageDataUrl : undefined;

      // For complex images, attach the caption to the issue so canvasFixer can inject it
      let issueToFix = issue;
      if (isAltTextIssue && isComplexImage && complexCaption.trim()) {
        issueToFix = { ...issue, complexCaption: complexCaption.trim() };
      }

      await onApplyFix(issueToFix, customFix, imageData);

      // Close modal after successful fix
      onClose();
    } finally {
      setIsFixing(false);
    }
  };

  const handleIgnore = () => {
    if (!issue) return;
    onIgnore?.(issue);
    onClose();
  };

  // Handle PDF-to-HTML conversion
  const handleConvertPdf = async () => {
    if (!issue) return;
    setIsConvertingPdf(true);
    setPdfConversionError(null);
    setConvertedPdfHtml('');

    try {
      const config = getCanvasConfig();
      if (!config) throw new Error('Canvas not configured');

      // Extract file ID from elementHtml href if contentType isn't 'file'
      let fileId = issue.contentId;
      if (issue.contentType !== 'file' && issue.elementHtml) {
        const fileIdMatch = issue.elementHtml.match(/\/files\/(\d+)/);
        if (fileIdMatch) fileId = fileIdMatch[1];
      }

      // Extract PDF filename from issue description or elementHtml for fallback search
      let pdfFilename = '';
      const descMatch = issue.description?.match(/"([^"]+\.pdf)"/i);
      if (descMatch) pdfFilename = descMatch[1];
      if (!pdfFilename && issue.elementHtml) {
        const textMatch = issue.elementHtml.replace(/<[^>]*>/g, '').trim();
        if (textMatch.toLowerCase().endsWith('.pdf')) pdfFilename = textMatch;
      }

      // Single server call: download PDF from Canvas + convert to HTML
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74508696/convert-pdf-from-canvas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            domain: config.domain,
            accessToken: config.accessToken,
            fileId: fileId,
            courseId: issue.courseId,
            pdfFilename: pdfFilename,
            context: { courseSubject: issue.courseName }
          })
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Conversion failed: ${response.status}`);
      }

      const { html } = await response.json();
      setConvertedPdfHtml(html);
      toast.success('PDF converted to accessible HTML!');
    } catch (error) {
      console.error('PDF conversion error:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setPdfConversionError(msg);
      toast.error(`PDF conversion failed: ${msg}`);
    } finally {
      setIsConvertingPdf(false);
    }
  };

  // Handle AI-generated objectives
  const handleObjectivesGenerated = async (objectives: string[]) => {
    if (!issue) return;
    
    // Format objectives as HTML
    const htmlContent = `<h3>Learning Outcomes</h3>
<ol>
${objectives.map(obj => `  <li>${obj}</li>`).join('\n')}
</ol>`;
    
    // Close the generator modal
    setShowObjectivesGenerator(false);
    
    // Apply the fix with the generated objectives
    await onApplyFix(issue, htmlContent);
    
    // Close the issue detail modal
    onClose();
    
    toast.success('Learning objectives generated and applied!');
  };

  // Parse module items from the elementHtml field
  const parseModuleItems = (elementHtml: string): string[] => {
    if (!elementHtml) return [];
    
    try {
      // The elementHtml contains module content as text
      // Split by common delimiters and filter out empty strings
      const items = elementHtml
        .split(/ITEM:|MODULE:/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      return items;
    } catch (error) {
      console.error('Error parsing module items:', error);
      return [elementHtml]; // Return as single item if parsing fails
    }
  };

  // Toggle accordion sections
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Handle image upload for broken/unavailable images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageDataUrl(reader.result as string);
      setIsImageBroken(false);
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  // Generate AI alt text suggestions
  const generateAltTextSuggestions = async (isAutoGenerated = false) => {
    
    setIsGenerating(true);
    setAiSuggestions([]);

    // Try multiple patterns to extract image URL
    let srcMatch = issue?.elementHtml?.match(/src=\\"([^\\"]*)\\"/); // Escaped double quotes in string
    if (!srcMatch) {
      srcMatch = issue?.elementHtml?.match(/src="([^"]*)"/); // Regular double quotes
    }
    if (!srcMatch) {
      srcMatch = issue?.elementHtml?.match(/src='([^']*)'/); // Single quotes
    }
    if (!srcMatch) {
      srcMatch = issue?.elementHtml?.match(/src=([^\s>]+)/); // No quotes
    }
    
    // Use uploaded image data URL if available, otherwise extracted URL
    const imageUrl = uploadedImageDataUrl || (srcMatch && srcMatch[1]) || null;

    if (!imageUrl) {
      console.error('❌ Could not extract image URL from elementHtml');
      if (!isAutoGenerated) {
        toast.error('Could not extract image URL');
      }
      setIsGenerating(false);
      return;
    }

    // CHECK CACHE FIRST for consistency across repeated images
    const cacheKey = `altText:${imageUrl}`;
    const cached = aiSuggestionsCache[cacheKey];
    
    if (cached && cached.suggestions.length > 0) {
      
      // Use cached suggestions
      setAiSuggestions(cached.suggestions);

      // Restore complex image state from cache
      if (cached.is_complex) {
        setIsComplexImage(true);
        setComplexCaption(cached.caption || '');
      }

      // Auto-populate the input with the moderate suggestion
      const moderateSuggestion = cached.suggestions.find((s: any) => s.level === 'moderate');
      const suggestionText = moderateSuggestion?.text || cached.suggestions[0]?.text || '';

      if (suggestionText) {
        setCustomAltText(suggestionText);
      }
      
      // Increment usage count
      if (onUpdateAiCache) {
        onUpdateAiCache(cacheKey, {
          ...cached,
          usedCount: cached.usedCount + 1
        });
      }
      
      // toast.success(`Using consistent alt text for this image (${cached.usedCount + 1} instances)`);
      setIsGenerating(false);
      return;
    }
    
    try {
      if (!isAutoGenerated) {
      } else {
      }
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74508696/generate-alt-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          context: {
            pageTitle: issue?.location,
            courseSubject: issue?.courseName,
            contentType: issue?.contentType
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Log error and show toast
        console.error('❌ Error generating alt text:', errorData);
        if (!isAutoGenerated) {
          toast.error(errorData.error || 'Failed to generate alt text. You can enter it manually below.');
        }
        setIsGenerating(false);
        return;
      }

      const data = await response.json();
      
      // Check for success flag and suggestions
      if (!data.success || !data.suggestions) {
        console.error('❌ Invalid response format - missing success flag or suggestions');
        if (!isAutoGenerated) {
          toast.error('No suggestions received from AI');
        }
        setIsGenerating(false);
        return;
      }

      setAiSuggestions(data.suggestions);

      // Capture complex image detection results
      if (data.is_complex) {
        setIsComplexImage(true);
        setComplexCaption(data.caption || '');
      } else {
        setIsComplexImage(false);
        setComplexCaption('');
      }

      // SAVE TO CACHE for consistency across repeated images
      if (onUpdateAiCache && data.suggestions.length > 0) {
        const cacheKey = `altText:${imageUrl}`;
        onUpdateAiCache(cacheKey, {
          suggestions: data.suggestions,
          is_complex: data.is_complex || false,
          caption: data.caption || null,
          timestamp: new Date(),
          usedCount: 1
        });
      }

      // Auto-populate the textarea with the moderate suggestion
      if (data.suggestions && data.suggestions.length > 0) {

        // Find the moderate suggestion, or fall back to first available
        const moderateSuggestion = data.suggestions.find((s: any) => s.level === 'moderate');

        const suggestionText = moderateSuggestion?.text || data.suggestions[0]?.text || '';

        if (suggestionText) {
          setCustomAltText(suggestionText);
        } else {
          console.warn('⚠️ No suggestion text found to populate');
        }
      } else {
        console.warn('⚠️ No suggestions array or empty array');
      }
      
      // if (!isAutoGenerated) {
      //   toast.success('AI suggestions generated!');
      // }
    } catch (error) {
      console.error('❌ Error calling alt text API:', error);
      if (!isAutoGenerated) {
        toast.error('Failed to generate suggestions. Please try again.');
      }
      setAiUnavailable(true); // Mark AI as unavailable
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate AI content rewrite or template depending on issue category
  const generateContentRewrite = async () => {
    if (!issue) return;

    setIsRewritingContent(true);
    setAiRewrittenContent('');

    try {
      let endpoint: string;
      let bodyPayload: object;

      if (isTemplateIssue) {
        // Template generation: build from scratch using course context
        endpoint = 'generate-template';
        const missingPolicies = issue.category === 'policies' && issue.evidenceHtml
          ? issue.evidenceHtml.split(',').map((s: string) => s.trim()).filter(Boolean)
          : undefined;
        const assignmentTitle = issue.category === 'assessment-criteria'
          ? issue.location?.replace(/^Assignment:\s*/i, '')
          : undefined;
        const assignmentPoints = issue.category === 'assessment-criteria'
          ? issue.description?.match(/(\d+)\s*points/)?.[1]
          : undefined;

        // Module discussion: pass module context for contextual AI prompt
        const moduleName = issue.category === 'module-discussion'
          ? issue.location?.replace(/^Module:\s*/i, '')
          : undefined;
        const moduleContent = issue.category === 'module-discussion'
          ? (issue.elementHtml || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
          : undefined;

        bodyPayload = {
          category: issue.category === 'module-discussion' ? 'module-discussion' : issue.category,
          context: {
            courseName: issue.courseName,
            assignmentTitle,
            assignmentPoints,
            missingPolicies,
            moduleName,
            moduleContent,
          },
        };
      } else {
        // Content rewrite: rework existing content
        // For readability, always use the specific flagged paragraph (elementHtml), not the full page
        const contentToRewrite = issue.category === 'readability'
          ? (issue.elementHtml || '')
          : (contentHtml || issue.elementHtml || '');
        if (!contentToRewrite) {
          setIsRewritingContent(false);
          return;
        }
        endpoint = 'rewrite-content';
        bodyPayload = {
          content: contentToRewrite,
          category: issue.category,
          context: {
            pageTitle: issue.location,
            courseSubject: issue.courseName,
            contentType: issue.contentType,
          },
        };
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74508696/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(bodyPayload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.aiUnavailable) {
          setAiUnavailable(true);
        }
        // Don't show a toast on auto-gen failure — just show the manual fallback
        setIsRewritingContent(false);
        return;
      }

      if (data.rewritten) {
        setAiRewrittenContent(data.rewritten);
      }
    } catch (error) {
      console.error('❌ Content rewrite/template error:', error);
      setAiUnavailable(true);
    } finally {
      setIsRewritingContent(false);
    }
  };

  // Generate AI table caption suggestions
  const generateTableCaptionSuggestions = async () => {
    
    setIsGenerating(true);
    setAiSuggestions([]);

    if (!issue?.elementHtml) {
      console.error('❌ No table HTML available for issue:', issue?.id);
      toast.error('Could not extract table HTML');
      setIsGenerating(false);
      return;
    }

    // CHECK CACHE FIRST for consistency across repeated tables
    // Create a simple hash of the table HTML for cache key
    const tableHash = issue.elementHtml.substring(0, 500); // Use first 500 chars as identifier
    const cacheKey = `tableCaption:${tableHash}`;
    const cached = aiSuggestionsCache[cacheKey];
    
    if (cached && cached.suggestions.length > 0) {
      
      // Use cached suggestions
      setAiSuggestions(cached.suggestions);
      
      // Auto-populate the input with the moderate suggestion
      const moderateSuggestion = cached.suggestions.find((s: any) => s.level === 'moderate');
      const suggestionText = moderateSuggestion?.text || cached.suggestions[0]?.text || '';
      
      if (suggestionText) {
        setCustomTableCaption(suggestionText);
      }
      
      // Increment usage count
      if (onUpdateAiCache) {
        onUpdateAiCache(cacheKey, {
          ...cached,
          usedCount: cached.usedCount + 1
        });
      }
      
      // toast.success(`Using consistent caption for this table (${cached.usedCount + 1} instances)`);
      setIsGenerating(false);
      return;
    }
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74508696/generate-table-caption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          tableHtml: issue.elementHtml,
          context: {
            pageTitle: issue.location,
            courseSubject: issue.courseName,
            contentType: issue.contentType,
            location: issue.location
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error generating table caption:', errorData);
        toast.error(errorData.error || 'Failed to generate table caption. You can enter it manually below.');
        setIsGenerating(false);
        return;
      }

      const data = await response.json();
      
      if (!data.success || !data.suggestions) {
        console.error('❌ Invalid response format - missing success flag or suggestions');
        toast.error('No suggestions received from AI');
        setIsGenerating(false);
        return;
      }

      setAiSuggestions(data.suggestions);
      
      // SAVE TO CACHE for consistency across repeated tables
      if (onUpdateAiCache && data.suggestions.length > 0 && issue?.elementHtml) {
        const tableHash = issue.elementHtml.substring(0, 500);
        const cacheKey = `tableCaption:${tableHash}`;
        onUpdateAiCache(cacheKey, {
          suggestions: data.suggestions,
          timestamp: new Date(),
          usedCount: 1
        });
      }
      
      // Auto-populate the textarea with the moderate suggestion
      if (data.suggestions && data.suggestions.length > 0) {
        const moderateSuggestion = data.suggestions.find((s: any) => s.level === 'moderate');
        const suggestionText = moderateSuggestion?.text || data.suggestions[0]?.text || '';
        
        if (suggestionText) {
          setCustomTableCaption(suggestionText);
        }
      }
      
      // toast.success('AI caption generated!');
    } catch (error) {
      console.error('❌ Error calling table caption API:', error);
      toast.error('Failed to generate suggestions. Please try again.');
      setAiUnavailable(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert layout table to proper HTML structure
  const convertLayoutTable = async () => {
    if (!issue?.elementHtml || tablePurposes.length === 0) {
      toast.error('Missing table data or purpose selection');
      return;
    }

    setIsGenerating(true);

    try {
      // Parse the table HTML to extract content
      const parser = new DOMParser();
      const doc = parser.parseFromString(issue.elementHtml, 'text/html');
      const table = doc.querySelector('table');

      if (!table) {
        toast.error('Could not parse table HTML');
        setIsGenerating(false);
        return;
      }

      // Extract all cell content
      const cells = Array.from(table.querySelectorAll('td, th'));
      const cellContents = cells.map(cell => cell.innerHTML.trim()).filter(content => content);

      let convertedHtml = '';

      // data always takes priority regardless of other selections
      if (tablePurposes.includes('data')) {
        const tableRows = Array.from(table.querySelectorAll('tr'));
        if (tableRows.length === 0) {
          convertedHtml = issue.elementHtml;
        } else {
          let tableHtml = '<table>\n  <caption>Data Table</caption>\n';
          tableRows.forEach((row, rowIndex) => {
            tableHtml += '  <tr>\n';
            const rowCells = Array.from(row.querySelectorAll('td, th'));
            rowCells.forEach((cell, colIndex) => {
              const content = cell.innerHTML.trim();
              if (rowIndex === 0) {
                tableHtml += `    <th scope="col">${content}</th>\n`;
              } else if (colIndex === 0) {
                tableHtml += `    <th scope="row">${content}</th>\n`;
              } else {
                tableHtml += `    <td>${content}</td>\n`;
              }
            });
            tableHtml += '  </tr>\n';
          });
          tableHtml += '</table>';
          convertedHtml = tableHtml;
        }
      } else {
        const hasList = tablePurposes.includes('list');
        const hasLinks = tablePurposes.includes('links');
        const hasGallery = tablePurposes.includes('gallery');

        if (hasLinks && !hasList) {
          // links-only or links+gallery → <nav><ul>
          const linkItems = cellContents.map(content => {
            let item = content;
            if (hasGallery && item.includes('<img')) {
              item = `<figure style="margin: 0;">\n    ${item}\n  </figure>`;
            }
            if (!item.includes('<a ')) {
              item = `<a href="#">${item}</a>`;
            }
            return `    <li>${item}</li>`;
          }).join('\n');
          convertedHtml = `<nav aria-label="Navigation">\n  <ul>\n${linkItems}\n  </ul>\n</nav>`;
        } else {
          // list, gallery, list+links, or list+links+gallery → <ul>
          const listItems = cellContents.map(content => {
            let item = content;
            if (hasGallery && item.includes('<img')) {
              item = `<figure style="margin: 0;">\n    ${item}\n  </figure>`;
            }
            return `  <li>${item}</li>`;
          }).join('\n');
          convertedHtml = `<ul>\n${listItems}\n</ul>`;
        }
      }

      // Pre-set suggestedFix on the issue copy so it's available even if customFix
      // threading breaks — canvasFixer reads issue.suggestedFix as the converted HTML
      const issueWithFix = { ...issue, suggestedFix: convertedHtml };
      onApplyFix(issueWithFix, convertedHtml);
      
      toast.success('Table converted to accessible HTML structure!', { duration: 4000 });
      onClose();

    } catch (error) {
      console.error('❌ Error converting layout table:', error);
      toast.error('Failed to convert table. Please try manual conversion.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate AI link text suggestions
  const generateLinkTextSuggestions = async () => {
    
    setIsGenerating(true);
    setAiSuggestions([]);

    if (!issue?.elementHtml) {
      console.error('❌ No link HTML available for issue:', issue?.id);
      toast.error('Could not extract link HTML');
      setIsGenerating(false);
      return;
    }

    // Extract URL from link HTML
    let hrefMatch = issue.elementHtml.match(/href=["']([^"']+)["']/);
    if (!hrefMatch || !hrefMatch[1]) {
      console.error('❌ Could not extract URL from link HTML');
      toast.error('Could not extract URL');
      setIsGenerating(false);
      return;
    }

    const url = hrefMatch[1];
    
    // CHECK CACHE FIRST for consistency across repeated links
    const cacheKey = `linkText:${url}`;
    const cached = aiSuggestionsCache[cacheKey];
    
    if (cached && cached.suggestions.length > 0) {
      
      // Use cached suggestions
      setAiSuggestions(cached.suggestions);
      
      // Auto-populate the input with the moderate suggestion
      const moderateSuggestion = cached.suggestions.find((s: any) => s.level === 'moderate');
      const suggestionText = moderateSuggestion?.text || cached.suggestions[0]?.text || '';
      
      if (suggestionText) {
        setCustomLinkText(suggestionText);
      }
      
      // Increment usage count
      if (onUpdateAiCache) {
        onUpdateAiCache(cacheKey, {
          ...cached,
          usedCount: cached.usedCount + 1
        });
      }
      
      // toast.success(`Using consistent link text for this URL (${cached.usedCount + 1} instances)`);
      setIsGenerating(false);
      return;
    }
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74508696/generate-link-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          url: url,
          context: {
            pageTitle: issue.location,
            courseSubject: issue.courseName,
            contentType: issue.contentType,
            location: issue.location
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error generating link text:', errorData);
        toast.error(errorData.error || 'Failed to generate link text. You can enter it manually below.');
        setIsGenerating(false);
        return;
      }

      const data = await response.json();
      
      // Log page info if available
      if (data.pageInfo) {
        if (data.pageInfo.title) {
          // toast.success(`Analyzed "${data.pageInfo.title}"`);
        }
        if (data.pageInfo.fetched) {
        } else {
        }
      }
      
      if (!data.success || !data.suggestions) {
        console.error('❌ Invalid response format - missing success flag or suggestions');
        toast.error('No suggestions received from AI');
        setIsGenerating(false);
        return;
      }

      setAiSuggestions(data.suggestions);
      
      // SAVE TO CACHE for consistency across repeated links
      if (onUpdateAiCache && data.suggestions.length > 0) {
        const cacheKey = `linkText:${url}`;
        onUpdateAiCache(cacheKey, {
          suggestions: data.suggestions,
          pageInfo: data.pageInfo,
          timestamp: new Date(),
          usedCount: 1
        });
      }
      
      // Auto-populate the input with the moderate suggestion
      if (data.suggestions && data.suggestions.length > 0) {
        const moderateSuggestion = data.suggestions.find((s: any) => s.level === 'moderate');
        const suggestionText = moderateSuggestion?.text || data.suggestions[0]?.text || '';
        
        if (suggestionText) {
          setCustomLinkText(suggestionText);
        }
      }
      
      // toast.success('AI link text generated!');
    } catch (error) {
      console.error('❌ Error calling link text API:', error);
      toast.error('Failed to generate suggestions. Please try again.');
      setAiUnavailable(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate AI learning objectives
  const generateLearningObjectives = async () => {
    
    setIsGeneratingObjectives(true);
    setAiGeneratedObjectives([]);

    // Try to get content from various fields
    const moduleContent = issue?.elementHtml 
      || (issue as any)?.evidenceHtml 
      || (issue as any)?.suggestedContent 
      || '';
    
    if (!moduleContent) {
      console.error('❌ No module content available for issue:', issue?.id);
      toast.error('Could not extract module content');
      setIsGeneratingObjectives(false);
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74508696/ai/generate-objectives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          moduleContent: moduleContent,
          moduleName: issue.location,
          existingObjectives: issue.existingObjectives || []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error generating objectives:', errorData);
        
        // Check if it's an empty module
        if (errorData.isEmpty) {
          toast.error('This module has no content. Add instructional materials first.');
        } else {
          toast.error(errorData.error || 'Failed to generate learning outcomes');
        }
        
        setIsGeneratingObjectives(false);
        return;
      }

      const data = await response.json();
      
      if (!data.success || !data.structuredObjectives || data.structuredObjectives.length === 0) {
        console.error('❌ Invalid response format - missing objectives');
        toast.error('No objectives received from AI');
        setIsGeneratingObjectives(false);
        return;
      }

      setAiGeneratedObjectives(data.structuredObjectives);
      
    } catch (error) {
      console.error('❌ Error calling objectives API:', error);
      toast.error('Failed to generate objectives. Please try again.');
    } finally {
      setIsGeneratingObjectives(false);
    }
  };
  
  if (!issue) return null;

  // Extract surrounding context for link issues
  const extractLinkContext = (): { context: string; linkHtml: string } | null => {
    if ((!isLinkIssue && !isLongUrlIssue) || !contentHtml || !issue.elementHtml) {
      return null;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(contentHtml, 'text/html');
      
      // Try to find the link in the document
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = issue.elementHtml;
      const targetLink = tempDiv.querySelector('a');
      
      if (!targetLink) return null;
      
      const targetHref = targetLink.getAttribute('href');
      const targetText = targetLink.textContent?.trim();
      
      // Find matching link in the full content
      const allLinks = doc.querySelectorAll('a');
      let foundLink: Element | null = null;
      
      for (const link of Array.from(allLinks)) {
        const linkHref = link.getAttribute('href');
        const linkText = link.textContent?.trim();
        
        if (linkHref === targetHref && linkText === targetText) {
          foundLink = link;
          break;
        }
      }
      
      if (!foundLink) return null;
      
      // Get the parent paragraph or containing element
      let contextElement = foundLink.closest('p, div, li, td, th, blockquote');
      
      if (!contextElement) {
        contextElement = foundLink.parentElement;
      }
      
      if (!contextElement) return null;
      
      // Get the context HTML with the link highlighted
      const contextHtml = contextElement.innerHTML;
      
      // Highlight the specific link
      const linkOuterHTML = (foundLink as HTMLElement).outerHTML;
      const highlightedContext = contextHtml.replace(
        linkOuterHTML,
        `<mark class="link-highlight" style="background-color: #fff5cc; padding: 2px 4px; border-radius: 4px; font-weight: 600;">${linkOuterHTML}</mark>`
      );
      
      return {
        context: highlightedContext,
        linkHtml: linkOuterHTML
      };
    } catch (error) {
      console.error('Error extracting link context:', error);
      return null;
    }
  };

  const linkContext = (isLinkIssue || isLongUrlIssue) ? extractLinkContext() : null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-[#ff3b30] text-white';
      case 'medium':
        return 'bg-[#ff9500] text-white';
      case 'low':
        return 'bg-[#ffcc00] text-[#1d1d1f]';
      default:
        return 'bg-[#636366] text-white';
    }
  };

  // Extract context around the flagged element for better preview
  const extractElementContext = () => {
    if (!contentHtml || !issue.elementHtml) {
      return null;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(contentHtml, 'text/html');
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = issue.elementHtml;
      const flaggedElement = tempDiv.firstChild as HTMLElement;
      
      if (!flaggedElement) return null;

      // For table cells: find the table that contains this cell
      if (flaggedElement.tagName === 'TD' || flaggedElement.tagName === 'TH') {
        const tables = doc.querySelectorAll('table');
        
        for (let i = 0; i < tables.length; i++) {
          const table = tables[i];
          const cells = table.querySelectorAll('td, th');
          
          for (const cell of Array.from(cells)) {
            const cellText = cell.textContent?.trim();
            const flaggedText = flaggedElement.textContent?.trim();
            
            // Match by text content
            if (cellText && flaggedText && cellText === flaggedText) {
              // Return ONLY the table, not parent containers (to avoid images above)
              const tableClone = table.cloneNode(true) as HTMLElement;
              const cellsInClone = tableClone.querySelectorAll('td, th');
              
              // Highlight the problematic cell
              for (const clonedCell of Array.from(cellsInClone)) {
                if (clonedCell.textContent?.trim() === flaggedText) {
                  (clonedCell as HTMLElement).style.border = '3px solid #ff9500';
                  (clonedCell as HTMLElement).style.boxShadow = '0 0 0 2px #fff3cd';
                }
              }
              return tableClone.outerHTML;
            }
          }
        }
      }

      // For headings: show heading + paragraph below
      if (flaggedElement.tagName?.match(/^H[1-6]$/)) {
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        for (const heading of Array.from(headings)) {
          if (heading.textContent?.trim() === flaggedElement.textContent?.trim()) {
            const container = document.createElement('div');
            const headingClone = heading.cloneNode(true) as HTMLElement;
            
            // Get computed styles from the original heading (includes CSS classes)
            const computedStyle = window.getComputedStyle(heading as HTMLElement);
            
            // Copy important visual styles from computed styles
            headingClone.style.backgroundColor = computedStyle.backgroundColor;
            headingClone.style.color = computedStyle.color;
            headingClone.style.fontSize = computedStyle.fontSize;
            headingClone.style.fontWeight = computedStyle.fontWeight;
            headingClone.style.padding = computedStyle.padding;
            headingClone.style.margin = computedStyle.margin;
            headingClone.style.lineHeight = computedStyle.lineHeight;
            headingClone.style.fontFamily = computedStyle.fontFamily;
            
            // Add highlight styles ON TOP of existing styles
            headingClone.style.border = '3px solid #ff9500';
            headingClone.style.boxShadow = '0 0 0 2px #fff3cd';
            headingClone.style.borderRadius = '4px';
            headingClone.style.marginBottom = '0';
            
            container.appendChild(headingClone);
            
            // Add the next sibling for context (table or paragraph)
            let nextSibling = heading.nextElementSibling;
            if (nextSibling) {
              const siblingClone = nextSibling.cloneNode(true) as HTMLElement;
              siblingClone.style.marginTop = '12px';
              siblingClone.style.opacity = '0.7';
              siblingClone.style.fontSize = '13px';
              
              // If it's a table, show just first 3 rows
              if (siblingClone.tagName === 'TABLE') {
                const rows = siblingClone.querySelectorAll('tr');
                if (rows.length > 3) {
                  for (let i = 3; i < rows.length; i++) {
                    rows[i].remove();
                  }
                  // Add a "..." indicator
                  const lastRow = siblingClone.querySelector('tbody tr:last-child, tr:last-child');
                  if (lastRow) {
                    const ellipsisRow = document.createElement('tr');
                    const ellipsisCell = document.createElement('td');
                    ellipsisCell.textContent = '...';
                    ellipsisCell.style.textAlign = 'center';
                    ellipsisCell.style.fontStyle = 'italic';
                    ellipsisCell.style.color = '#636366';
                    ellipsisCell.colSpan = 100;
                    ellipsisRow.appendChild(ellipsisCell);
                    lastRow.parentElement?.appendChild(ellipsisRow);
                  }
                }
              }
              
              container.appendChild(siblingClone);
            }
            
            return container.innerHTML;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Error extracting element context:', error);
      return null;
    }
  };

  // Render the content with the issue highlighted - Shows accurate element preview
  const renderContentPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#0071e3] animate-spin" />
        </div>
      );
    }

    // For objectives issues — Design 4 locked for "What's Flagged"
    if (isObjectivesIssue) {
      const moduleContent = issue.elementHtml || '';
      const items = moduleContent.split(/ITEM:\s*/g).filter(item => item.trim());
      const moduleName = moduleContent.match(/MODULE:\s*([^\n]+)/)?.[1] || 'Module';
      const whereToAdd = issue.whereToAdd;

      // Existing objectives
      if (issue.existingObjectives && issue.existingObjectives.length > 0) {
        return (
          <div className="text-[12px] text-[#1d1d1f]">
            <div className="text-[12px] text-[#ff9500] font-semibold mb-1">Current objectives need improvement:</div>
            {issue.existingObjectives.map((obj, index) => (
              <div key={index} className="flex items-start gap-2 py-1 border-b border-[#f0f0f0] last:border-b-0">
                <span className="text-[#ff9500] font-semibold flex-shrink-0">{index + 1}.</span>
                <span className="text-[12px]">{obj}</span>
              </div>
            ))}
          </div>
        );
      }

      // Design 4: Clean card — module name once, tip as callout, items below
      const contentItems = items.filter(item => {
        const title = item.split('\n')[0].trim();
        return title && !title.startsWith('MODULE:');
      });

      return (
        <div className="text-[12px] text-[#1d1d1f]">
          <div className="font-semibold text-[13px] mb-2">{moduleName}</div>
          {whereToAdd && (
            <div className="flex items-start gap-2 px-3 py-2 mb-2 rounded-[8px] border border-[#ff9500]/25" style={{ backgroundColor: 'rgba(255, 149, 0, 0.06)' }}>
              <span className="text-[12px] mt-px">📍</span>
              <span className="text-[12px] text-[#1d1d1f]">{whereToAdd}</span>
            </div>
          )}
          {contentItems.length > 0 && (
            <div className="border-t border-[#e5e5ea]">
              {contentItems.slice(0, 8).map((item, index) => {
                const title = item.split('\n')[0].trim();
                if (!title) return null;
                return (
                  <div key={index} className="py-[3px] border-b border-[#f5f5f5] text-[12px] flex items-center gap-1.5">
                    <span className="text-[#c7c7cc] text-[10px]">{index + 1}</span>
                    <span>{title}</span>
                  </div>
                );
              })}
            </div>
          )}
          {contentItems.length > 8 && <div className="text-[11px] text-[#636366] mt-1">+ {contentItems.length - 8} more</div>}
        </div>
      );
    }

    // For color contrast issues, try to show context
    if (issue?.category === 'contrast' || issue?.category === 'color-contrast' || issue?.title?.toLowerCase().includes('color contrast')) {
      const contextHtml = extractElementContext();

      // Determine a preview background that makes the flagged text actually visible.
      // If the scanner captured a real dark background, use it; otherwise, if the text
      // is light (e.g. white), auto-pick a dark background so the user can see the problem.
      const contrastPreviewBg = (() => {
        const storedBg = issue.backgroundColor;
        const storedText = issue.textColor || '';
        if (storedBg && storedBg !== '#ffffff') return storedBg;
        // Detect light text by checking luminance
        const hex = storedText.replace('#', '');
        if (hex.length === 6) {
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          if (lum > 0.6) return '#1a1a2e'; // light text → use dark fallback background
        }
        return undefined; // dark text on white — no override needed
      })();

      const contrastContainerStyle = contrastPreviewBg
        ? { backgroundColor: contrastPreviewBg, padding: '10px', borderRadius: '6px' }
        : undefined;

      if (contextHtml) {
        return (
          <div
            className="canvas-content-display text-[14px]"
            style={contrastContainerStyle}
            dangerouslySetInnerHTML={{ __html: contextHtml }}
          />
        );
      }

      // Fallback: show just the element
      return (
        <div
          className="canvas-content-display text-[14px]"
          style={contrastContainerStyle}
          dangerouslySetInnerHTML={{ __html: issue.elementHtml }}
        />
      );
    }

    // Content-type issues: show assignment/discussion text
    if (['instructions', 'plain-language', 'assessment-guidance', 'assessment-criteria',
         'confusing-navigation', 'readability'].includes(issue.category)) {
      if (issue.elementHtml) {
        return (
          <div className="space-y-2">
            <div
              className="canvas-content-display text-[13px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: issue.elementHtml }}
            />
            {issue.category === 'readability' && (() => {
              const text = issue.elementHtml.replace(/<[^>]*>/g, '');
              const wordCount = text.split(/\s+/).filter(Boolean).length;
              return (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-[#ff9500]/15 text-[#ff9500]">
                    {wordCount} words
                  </span>
                  <span className="text-[11px] text-[#636366]">— limit is 150 words per paragraph</span>
                </div>
              );
            })()}
          </div>
        );
      }
    }

    // Course-level checklist issues: render elementHtml as-is (it's a styled checklist)
    if (['policies', 'instructor-contact', 'student-interaction', 'learner-support',
         'institutional-support', 'assessment-variety', 'assessment-frequency'].includes(issue.category)) {
      if (issue.elementHtml) {
        return (
          <div
            className="canvas-content-display text-[13px]"
            dangerouslySetInnerHTML={{ __html: issue.elementHtml }}
          />
        );
      }
      // Fallback: show description
      return (
        <div className="text-[13px] text-[#636366] italic">
          {issue.description}
        </div>
      );
    }

    // Default: show the flagged element accurately as it appears in Canvas
    const displayHtml = issue.elementHtml || '<p class="text-[#636366] text-[13px]">No preview available</p>';
    return (
      <div
        className="canvas-content-display text-[14px]"
        dangerouslySetInnerHTML={{ __html: displayHtml }}
      />
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div
              ref={modalContainerRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="issue-modal-title"
              tabIndex={-1}
              style={{ outline: 'none' }}
              className="bg-white rounded-[16px] shadow-2xl w-full max-w-[700px] max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-[#d2d2d7] flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 id="issue-modal-title" className="text-[17px] font-semibold text-[#1d1d1f] truncate">{isAltTextIssue && isImageBroken && !issue.title.includes('Image Not Found') ? `${issue.title} (Image Not Found)` : issue.title}</h2>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${getSeverityColor(issue.severity)}`}
                        title={issue.severity === 'high' ? 'High severity (−10 pts): Blocks access for some users. Must fix.'
                             : issue.severity === 'medium' ? 'Medium severity (−5 pts): Reduces usability or fails a rubric standard.'
                             : 'Low severity (−2 pts): Best practice recommendation.'}
                      >
                        {issue.severity}
                      </span>
                    </div>
                    
                    {/* Location Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-[12px] text-[#636366]">
                      <span className="flex items-center gap-1">
                        <span>📚</span>
                        <span className="font-medium">{issue.courseName}</span>
                      </span>
                      <ChevronRight className="w-3 h-3" />
                      <span>{issue.location}</span>
                      {issue.contentType && (
                        <>
                          <ChevronRight className="w-3 h-3" />
                          <span className="capitalize">{issue.contentType}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={onClose}
                    aria-label="Close issue detail"
                    className="w-6 h-6 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center transition-colors ml-3 flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-[#636366]" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Content Area - Scrollable */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {/* Brief explanation */}
                {isContrastIssue ? (
                  <p className="text-[14px] text-[#1d1d1f] mb-4">
                    This text color doesn't stand out enough from its background, making it hard to read for some students.
                  </p>
                ) : (
                  <p className="text-[14px] text-[#1d1d1f] mb-4">
                    {issue.description}
                  </p>
                )}

                {/* Aligned Standards Tags - Only show enabled standards from Standards Alignment */}
                {issue.standardsTags && issue.standardsTags.length > 0 && (() => {
                  // Filter tags by enabled standards only
                  const cvcOeiTags = enabledStandards.includes('cvc-oei') 
                    ? issue.standardsTags.filter(tag => tag.startsWith('cvc-oei:'))
                    : [];
                  const peraltaTags = enabledStandards.includes('peralta')
                    ? issue.standardsTags.filter(tag => tag.startsWith('peralta:'))
                    : [];
                  // Check for both 'qm' and 'quality-matters' to ensure QM tags are shown
                  const qmTags = (enabledStandards.includes('qm') || enabledStandards.includes('quality-matters'))
                    ? issue.standardsTags.filter(tag => tag.startsWith('qm:'))
                    : [];
                  
                  // Only show if we have at least one enabled standard tag
                  const hasEnabledTags = cvcOeiTags.length > 0 || peraltaTags.length > 0 || qmTags.length > 0;
                  if (!hasEnabledTags) return null;
                  
                  return (
                    <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-[#fff8f0] via-white to-[#f0fdf4] border border-gray-200 rounded-lg mb-4">
                      {cvcOeiTags.length > 0 && (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-[#1d1d1f]">CVC-OEI:</span>
                          {cvcOeiTags.map((tag, index) => (
                            <span key={tag} className="inline-flex items-center gap-1">
                              {index > 0 && <span className="text-[#636366]">,</span>}
                              <span className="px-1.5 py-0.5 text-white text-[10px] font-bold rounded" style={{ background: '#ff9500' }}>
                                {tag.split(':')[1]}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                      {cvcOeiTags.length > 0 && peraltaTags.length > 0 && (
                        <div className="w-px h-4 bg-gray-300"></div>
                      )}
                      {peraltaTags.length > 0 && (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-[#1d1d1f]">PERALTA:</span>
                          {peraltaTags.map((tag, index) => (
                            <span key={tag} className="inline-flex items-center gap-1">
                              {index > 0 && <span className="text-[#636366]">,</span>}
                              <span className="px-1.5 py-0.5 text-white text-[10px] font-bold rounded" style={{ background: '#22c55e' }}>
                                {tag.split(':')[1]}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                      {(cvcOeiTags.length > 0 || peraltaTags.length > 0) && qmTags.length > 0 && (
                        <div className="w-px h-4 bg-gray-300"></div>
                      )}
                      {qmTags.length > 0 && (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-[#1d1d1f]">QM:</span>
                          {qmTags.map((tag, index) => (
                            <span key={tag} className="inline-flex items-center gap-1">
                              {index > 0 && <span className="text-[#636366]">,</span>}
                              <span className="px-1.5 py-0.5 text-white text-[10px] font-bold rounded" style={{ background: '#0071e3' }}>
                                {tag.split(':')[1]}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Design switcher removed — source labels locked to Style A */}

                {/* What's Flagged - Only show for non-alt-text, non-table issues */}
                {/* Link Accessibility Issue UI */}
                {isLinkAccessibilityIssue && issue && (
                  <div className="mb-4">
                    <div className="text-[14px] font-semibold text-[#1d1d1f] mb-3">Link Accessibility Audit</div>

                    {/* Score display */}
                    <div className="flex items-center gap-3 mb-3 p-3 bg-[#f5f5f7] rounded-[10px] border border-[#d2d2d7]">
                      <div className={`text-[28px] font-bold leading-none ${
                        (issue.linkAccessibilityScore || 0) >= 80 ? 'text-[#2e7d32]' :
                        (issue.linkAccessibilityScore || 0) >= 50 ? 'text-[#b36b00]' : 'text-[#c62828]'
                      }`}>
                        {issue.linkAccessibilityScore ?? 0}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-[#1d1d1f]">Accessibility Score</div>
                        <div className="text-[12px] text-[#636366]">
                          {(issue.linkAccessibilityScore || 0) >= 80 ? 'Passes basic checks' :
                           (issue.linkAccessibilityScore || 0) >= 50 ? 'Needs improvement' : 'Significant issues found'}
                        </div>
                      </div>
                    </div>

                    {/* Link URL */}
                    {issue.linkUrl && (
                      <div className="mb-3">
                        <div className="text-[12px] font-medium text-[#636366] mb-1">External Link</div>
                        <a
                          href={issue.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] text-[#0071e3] hover:underline break-all"
                        >
                          {issue.linkUrl}
                        </a>
                      </div>
                    )}

                    {/* Failures list */}
                    {issue.linkAccessibilityFailures && issue.linkAccessibilityFailures.length > 0 && (
                      <div className="mb-3">
                        <div className="text-[12px] font-medium text-[#636366] mb-1.5">Issues Found</div>
                        <div className="space-y-1.5">
                          {issue.linkAccessibilityFailures.map((failure, i) => (
                            <div key={i} className="flex items-start gap-2 px-3 py-2 bg-[#ffebee] rounded-[8px]">
                              <span className="text-[#c62828] text-[12px] mt-0.5">✕</span>
                              <span className="text-[13px] text-[#1d1d1f]">{failure}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI suggestion for alternatives */}
                    {issue.suggestedFix && (
                      <div className="p-3 bg-white rounded-[10px] border border-[#d2d2d7]">
                        <div className="text-[12px] font-semibold text-[#636366] mb-1.5">Find an Accessible Alternative</div>
                        <p className="text-[13px] text-[#1d1d1f] leading-relaxed mb-2">{issue.suggestedFix}</p>
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(issue.suggestedFix.replace(/^Search for accessible alternatives: "?|"$/g, ''))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[13px] text-[#0071e3] font-medium hover:underline"
                        >
                          Search now →
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {!isAltTextIssue && !isTableIssue && !isVideoCaptionIssue && !isAudioDescriptionIssue && !isLinkAccessibilityIssue && (
                  <div className="mb-4">
                    <div className="text-[14px] font-semibold text-[#1d1d1f] mb-2">What's Flagged</div>

                    {/* Error Message if content failed to load */}
                    {loadError && (
                      <div className="mb-3 px-3 py-2.5 bg-[#fff9e6] border border-[#ff9500]/30 rounded-[8px] flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#ff9500] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-[12px] font-semibold text-[#ff9500] mb-1">Content Load Issue</div>
                          <p className="text-[12px] text-[#1d1d1f] leading-relaxed">{loadError}</p>
                        </div>
                      </div>
                    )}

                    <div className={`border border-[#d2d2d7] rounded-[10px] p-2 bg-white ${isObjectivesIssue ? '' : 'max-h-[200px] overflow-y-auto'}`}>
                      {renderContentPreview()}
                    </div>
                  </div>
                )}

                {/* Video Caption "What's Flagged" — thumbnail preview */}
                {isVideoCaptionIssue && (
                  <div className="mb-4">
                    <div className="text-[14px] font-semibold text-[#1d1d1f] mb-2">What's Flagged</div>
                    {(() => {
                      const src = issue.elementHtml?.match(/src="([^"]+)"/)?.[1] || '';
                      const videoId = src.match(/\/embed\/([^?&#/]+)/)?.[1];
                      const isYT = src.includes('youtube.com') || src.includes('youtube-nocookie.com') || src.includes('youtu.be');
                      const isVimeo = src.includes('vimeo.com');

                      if (isYT && videoId) {
                        return (
                          <div className="border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                            <a href={`https://www.youtube.com/watch?v=${videoId}`}
                               target="_blank" rel="noopener noreferrer" className="block relative group">
                              <div className="relative" style={{ aspectRatio: '16/9' }}>
                                <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                     alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                  <div className="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                                  </div>
                                </div>
                              </div>
                            </a>
                            <div className="px-3 py-2 bg-[#EEECE8] flex items-center justify-between border-t border-[#d2d2d7]">
                              <span className="text-[13px] text-[#1d1d1f]"><strong>YouTube</strong> <span className="text-[#636366]">·</span> captions not enabled</span>
                              <a href={`https://www.youtube.com/watch?v=${videoId}`}
                                 target="_blank" rel="noopener noreferrer"
                                 className="text-[12px] text-[#0071e3] hover:underline">Open ↗</a>
                            </div>
                          </div>
                        );
                      }
                      if (isVimeo) {
                        const vimeoId = src.match(/video\/(\d+)/)?.[1];
                        return (
                          <div className="border border-[#d2d2d7] rounded-[10px] p-3 bg-white flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#1ab7ea]/10 flex items-center justify-center flex-shrink-0">
                              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1ab7ea"><path d="M21.426 5.523c-.185 4.03-2.995 9.549-8.426 16.554C7.51 29.068 3.96 32 1.337 32c-1.553 0-2.87-1.432-3.946-4.302L-5.93 19.44C-6.739 16.57-7.788 15.133-9 15.133c-.273 0-1.226.574-2.86 1.718l-1.715-2.213c1.8-1.58 3.574-3.16 5.316-4.74 2.4-2.074 4.2-3.164 5.4-3.273 2.837-.274 4.587 1.664 5.247 5.816.711 4.463 1.203 7.237 1.479 8.32.82 3.727 1.718 5.59 2.696 5.59.763 0 1.91-1.207 3.44-3.621 1.528-2.415 2.348-4.252 2.46-5.513.219-2.088-.601-3.134-2.46-3.134-.876 0-1.78.2-2.71.599 1.8-5.893 5.232-8.756 10.302-8.589z"/></svg>
                            </div>
                            <div className="flex-1">
                              <div className="text-[13px] font-medium text-[#1d1d1f]">Vimeo video</div>
                              <div className="text-[13px] text-[#1d1d1f]"><strong>Vimeo</strong> <span className="text-[#636366]">·</span> captions not enabled</div>
                              {vimeoId && <a href={`https://vimeo.com/${vimeoId}`} target="_blank"
                                rel="noopener noreferrer" className="text-[12px] text-[#0071e3] hover:underline">
                                Open in Vimeo ↗</a>}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="border border-[#d2d2d7] rounded-[10px] p-3 bg-white text-[13px] text-[#636366]">
                          Embedded video — open the Canvas page to view it.
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Audio Description "What's Flagged" + Generator UI */}
                {isAudioDescriptionIssue && (
                  <div className="mb-4">
                    <div className="text-[14px] font-semibold text-[#1d1d1f] mb-2">What's Flagged</div>
                    {(() => {
                      const src = issue.videoSrc || issue.elementHtml?.match(/src="([^"]+)"/)?.[1] || '';
                      const platform = issue.videoPlatform || 'Video';
                      const videoId = src.match(/\/embed\/([^?&#/]+)/)?.[1] || src.match(/video\/(\d+)/)?.[1];
                      const isYT = src.includes('youtube.com') || src.includes('youtube-nocookie.com');

                      return (
                        <div className="border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                          {isYT && videoId ? (
                            <a href={`https://www.youtube.com/watch?v=${videoId}`}
                               target="_blank" rel="noopener noreferrer" className="block relative group">
                              <div className="relative" style={{ aspectRatio: '16/9' }}>
                                <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                     alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                  <div className="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                                  </div>
                                </div>
                              </div>
                            </a>
                          ) : (
                            <div className="px-3 py-4 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-[#5856d6]/10 flex items-center justify-center flex-shrink-0">
                                <Play className="w-5 h-5 text-[#5856d6]" />
                              </div>
                              <div className="text-[13px] text-[#1d1d1f]">{platform} video embed</div>
                            </div>
                          )}
                          <div className="px-3 py-2 bg-[#EEECE8] flex items-center justify-between border-t border-[#d2d2d7]">
                            <span className="text-[13px] text-[#1d1d1f]"><strong>{platform}</strong> <span className="text-[#636366]">·</span> needs audio description</span>
                            {isYT && videoId && (
                              <a href={`https://www.youtube.com/watch?v=${videoId}`}
                                 target="_blank" rel="noopener noreferrer"
                                 className="text-[12px] text-[#0071e3] hover:underline">Open ↗</a>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Optional transcript paste area */}
                    <div className="mt-3">
                      <div className="text-[13px] font-medium text-[#1d1d1f] mb-1">Paste captions or transcript <span className="text-[#636366] font-normal">(optional — improves results)</span></div>
                      <textarea
                        value={adTranscript}
                        onChange={(e) => setAdTranscript(e.target.value)}
                        placeholder="Paste the video's captions or transcript here for better audio description timing..."
                        className="w-full h-20 px-3 py-2 text-[13px] border border-[#d2d2d7] rounded-[8px] bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3]"
                      />
                    </div>

                    {/* Generate button */}
                    <button
                      onClick={async () => {
                        if (!issue) return;
                        setIsGeneratingAD(true);
                        setAdScript([]);
                        setAdSummary('');
                        try {
                          const response = await fetch(
                            `https://${projectId}.supabase.co/functions/v1/make-server-74508696/generate-audio-description`,
                            {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
                              body: JSON.stringify({
                                videoUrl: issue.videoSrc || '',
                                transcript: adTranscript || undefined,
                                pageContent: issue.elementHtml || '',
                                pageTitle: issue.location || '',
                                courseSubject: issue.courseName || ''
                              })
                            }
                          );
                          const data = await response.json();
                          if (data.aiUnavailable) {
                            setAiUnavailable(true);
                            toast.error('AI is temporarily unavailable. Please try again later.');
                          } else if (data.entries) {
                            setAdScript(data.entries);
                            setAdSummary(data.summary || '');
                            toast.success(`Generated ${data.entries.length} audio description entries`);
                          } else {
                            toast.error(data.error || 'Failed to generate audio description');
                          }
                        } catch (err) {
                          toast.error('Failed to generate audio description');
                        } finally {
                          setIsGeneratingAD(false);
                        }
                      }}
                      disabled={isGeneratingAD || aiUnavailable}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5856d6] hover:bg-[#4a48c4] text-white rounded-[10px] text-[14px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingAD ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating Audio Description...</>
                      ) : (
                        <><Wand2 className="w-4 h-4" /> Generate Audio Description</>
                      )}
                    </button>

                    {/* AI-generated script entries */}
                    {adScript.length > 0 && (
                      <div className="mt-4">
                        <div className="text-[14px] font-semibold text-[#1d1d1f] mb-1">Audio Description Script</div>
                        {adSummary && <p className="text-[12px] text-[#636366] mb-2">{adSummary}</p>}
                        <div className="space-y-2">
                          {adScript.map((entry, idx) => (
                            <div key={idx} className="border border-[#d2d2d7] rounded-[8px] p-2.5 bg-white">
                              <div className="flex items-center gap-2 mb-1.5">
                                <input
                                  type="text"
                                  value={entry.startTime}
                                  onChange={(e) => {
                                    const updated = [...adScript];
                                    updated[idx] = { ...updated[idx], startTime: e.target.value };
                                    setAdScript(updated);
                                  }}
                                  className="w-20 px-2 py-0.5 text-[12px] font-mono border border-[#d2d2d7] rounded bg-[#f5f5f7] text-center"
                                />
                                <span className="text-[12px] text-[#636366]">→</span>
                                <input
                                  type="text"
                                  value={entry.endTime}
                                  onChange={(e) => {
                                    const updated = [...adScript];
                                    updated[idx] = { ...updated[idx], endTime: e.target.value };
                                    setAdScript(updated);
                                  }}
                                  className="w-20 px-2 py-0.5 text-[12px] font-mono border border-[#d2d2d7] rounded bg-[#f5f5f7] text-center"
                                />
                                <button
                                  onClick={() => setAdScript(adScript.filter((_, i) => i !== idx))}
                                  className="ml-auto text-[#ff3b30] hover:text-[#d63028] p-0.5"
                                  title="Remove entry"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <textarea
                                value={entry.description}
                                onChange={(e) => {
                                  const updated = [...adScript];
                                  updated[idx] = { ...updated[idx], description: e.target.value };
                                  setAdScript(updated);
                                }}
                                className="w-full text-[13px] px-2 py-1.5 border border-[#d2d2d7] rounded bg-white resize-none focus:outline-none focus:ring-1 focus:ring-[#5856d6]/30"
                                rows={2}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Download SRT button */}
                        <button
                          onClick={() => {
                            // Generate SRT content
                            const srtContent = adScript.map((entry, idx) => {
                              const start = entry.startTime.includes(',') ? entry.startTime : entry.startTime.replace('.', ',') + (entry.startTime.includes(',') ? '' : ',000');
                              const end = entry.endTime.includes(',') ? entry.endTime : entry.endTime.replace('.', ',') + (entry.endTime.includes(',') ? '' : ',000');
                              return `${idx + 1}\n${start} --> ${end}\n${entry.description}\n`;
                            }).join('\n');

                            const blob = new Blob([srtContent], { type: 'text/srt' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `audio-description-${issue.contentId || 'video'}.srt`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            toast.success('SRT file downloaded');
                          }}
                          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#d2d2d7] hover:bg-[#f5f5f7] text-[#1d1d1f] rounded-[10px] text-[13px] font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" /> Download SRT File
                        </button>

                        {/* Canvas Studio instructions */}
                        <div className="mt-3 px-3 py-2.5 bg-[#e8f4fd] border border-[#0071e3]/20 rounded-[8px]">
                          <div className="text-[12px] font-semibold text-[#0071e3] mb-1">Canvas Studio Upload Instructions</div>
                          <ol className="text-[12px] text-[#1d1d1f] leading-relaxed list-decimal list-inside space-y-0.5">
                            <li>Open your video in Canvas Studio</li>
                            <li>Go to Settings → Captions</li>
                            <li>Upload this SRT file as a caption track</li>
                            <li>Set the track type to "Descriptions"</li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Table Issues \"What's Flagged\" Section with Data Table Screening */}
                {isTableIssue && (
                  <div className="mb-4">
                    {/* What's Flagged Label */}
                    <div className="text-[14px] font-semibold text-[#1d1d1f] mb-2">What's Flagged</div>
                    
                    {/* Table Preview */}
                    <div className="mb-0">
                      <div className="border border-[#d2d2d7] border-b-0 rounded-t-[10px] p-3 bg-white">
                        {(() => {
                          // Debug logging for table HTML
                          
                          if (!issue.elementHtml) {
                            return <div className="text-[13px] text-[#636366] text-center py-3">⚠️ Table preview unavailable</div>;
                          }
                          
                          return (
                            <div 
                              className="canvas-content-display"
                              dangerouslySetInnerHTML={{ __html: issue.elementHtml }}
                            />
                          );
                        })()}
                      </div>
                    </div>

                    {/* STEP 1: Data Table Check Prompt */}
                    {showTableDataPrompt && isDataTable === null ? (
                      <div className="px-4 py-4 bg-white border border-t-0 border-[#d2d2d7] rounded-b-[10px] mb-3 shadow-sm">
                        <div className="text-[15px] font-semibold text-[#1d1d1f] mb-2">
                          Is this table being used to display data?
                        </div>
                        <p className="text-[13px] text-[#1d1d1f] mb-4 leading-relaxed">
                          Data tables organize information like enrollment numbers, schedules, or comparisons. Layout tables are used for positioning images, links, or spacing—and shouldn't be used.
                        </p>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setIsDataTable(true);
                              setShowTableDataPrompt(false);
                              // If it's a table caption issue, auto-generate caption
                              if (isTableCaptionIssue) {
                                generateTableCaptionSuggestions();
                              }
                            }}
                            className="flex-1 h-[48px] rounded-[10px] bg-[#0071e3] hover:bg-[#0077ed] text-white text-[15px] font-semibold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
                          >
                            <Check className="w-5 h-5" />
                            Yes, it's a data table
                          </button>
                          <button
                            onClick={() => {
                              setIsDataTable(false);
                              setShowTableDataPrompt(false);
                            }}
                            className="flex-1 h-[48px] rounded-[10px] bg-[#ff9500] hover:bg-[#e68600] text-white text-[15px] font-semibold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
                          >
                            <AlertTriangle className="w-5 h-5" />
                            No, it's for layout
                          </button>
                        </div>
                      </div>
                    ) : !showTableDataPrompt && isDataTable === false ? (
                      /* Layout Table AI-Assisted Purpose Selection */
                      !tablePurpose ? (
                        /* Step 1: Ask what they're using the table for */
                        <div className="px-4 py-4 bg-[#fff9e6]/60 border border-t-0 border-[#ff9500]/20 rounded-b-[10px] mb-3">
                          <div className="flex items-start gap-3 mb-4">
                            <AlertTriangle className="w-5 h-5 text-[#ff9500] flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-[14px] font-semibold text-[#1d1d1f] mb-1.5">
                                Tables should not be used for layout
                              </div>
                              <p className="text-[13px] text-[#1d1d1f] leading-relaxed">
                                Layout tables create accessibility barriers for screen reader users and violate WCAG guidelines.
                              </p>
                            </div>
                          </div>
                          
                          <div className="border-t border-[#ff9500]/15 pt-4 mt-3">
                            <div className="text-[13px] font-semibold text-[#1d1d1f] mb-1">What are you using this table for?</div>
                            <div className="text-[12px] font-medium text-[#ff9500] mb-3">Select all that apply</div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { key: 'list', emoji: '📋', label: 'List of items' },
                                { key: 'links', emoji: '🔗', label: 'Links / Navigation' },
                                { key: 'gallery', emoji: '🖼️', label: 'Image gallery' },
                                { key: 'data', emoji: '📊', label: 'Actual data' },
                              ].map(({ key, emoji, label }) => {
                                const selected = tablePurposes.includes(key);
                                return (
                                  <button
                                    key={key}
                                    onClick={() => setTablePurposes(prev =>
                                      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
                                    )}
                                    className={`h-[44px] px-3 rounded-[8px] border text-[13px] font-medium transition-colors text-left flex items-center gap-2 ${
                                      selected
                                        ? 'bg-[#0071e3]/10 border-[#0071e3] text-[#0071e3]'
                                        : 'bg-white hover:bg-[#f5f5f7] border-[#d2d2d7] text-[#1d1d1f]'
                                    }`}
                                  >
                                    <span className="flex-1">{emoji} {label}</span>
                                    {selected && <Check className="w-4 h-4 flex-shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                            {tablePurposes.length > 0 && (
                              <button
                                onClick={() => setTablePurpose('selected')}
                                className="mt-3 w-full h-[40px] rounded-[10px] bg-[#0071e3] hover:bg-[#0077ed] text-white text-[14px] font-semibold transition-colors"
                              >
                                Continue →
                              </button>
                            )}
                          </div>

                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => {
                                setShowTableDataPrompt(true);
                                setIsDataTable(null);
                                setTablePurpose(null);
                                setTablePurposes([]);
                              }}
                              className="px-4 h-[40px] rounded-[10px] border border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7] text-[14px] font-medium transition-colors"
                            >
                              ← Go Back
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Step 2: Confirm the fix — plain English, no raw HTML */
                        <div className="px-4 py-4 bg-[#fff9e6]/60 border border-t-0 border-[#ff9500]/20 rounded-b-[10px] mb-3">
                          <div className="mb-4">
                            <div className="text-[14px] font-semibold text-[#1d1d1f] mb-1">
                              {(() => {
                                if (tablePurposes.includes('data')) return '📊 Fix the table structure';
                                if (tablePurposes.length === 1) {
                                  if (tablePurposes[0] === 'list') return '📋 Convert to a bulleted list';
                                  if (tablePurposes[0] === 'links') return '🔗 Convert to a navigation section';
                                  if (tablePurposes[0] === 'gallery') return '🖼️ Convert to an image gallery';
                                }
                                const parts = [];
                                if (tablePurposes.includes('list')) parts.push('list');
                                if (tablePurposes.includes('links')) parts.push('navigation');
                                if (tablePurposes.includes('gallery')) parts.push('image gallery');
                                return `🔄 Convert to ${parts.join(' + ')}`;
                              })()}
                            </div>
                            <p className="text-[13px] text-[#636366] leading-relaxed">
                              {(() => {
                                if (tablePurposes.includes('data')) return 'The table will be kept but fixed: a caption will be added, the first row will become column headers, and the first column will become row headers. This meets CVC-OEI D3, QM 8.1, and QM 8.3.';
                                if (tablePurposes.length === 1) {
                                  if (tablePurposes[0] === 'list') return 'The table will be converted into a properly formatted bulleted list. Each table cell becomes a list item. Screen readers will announce the list correctly and users can navigate it naturally.';
                                  if (tablePurposes[0] === 'links') return 'The table will be converted into a headed navigation section with proper link formatting. Table cells containing links stay as links; plain text is preserved. No table structure remains.';
                                  if (tablePurposes[0] === 'gallery') return 'The table will be converted into an accessible image layout using figure elements. The table structure is removed. Each image is preserved with its existing alt text.';
                                }
                                const hasList = tablePurposes.includes('list');
                                const hasLinks = tablePurposes.includes('links');
                                const hasGallery = tablePurposes.includes('gallery');
                                if (hasList && hasLinks && hasGallery) return 'The table will be converted into a bulleted list that combines links and images. Each cell becomes a list item, links are preserved as links, and images are wrapped in accessible figure elements.';
                                if (hasList && hasLinks) return 'The table will be converted into a bulleted list that preserves all links. Each cell becomes a list item; cells with links keep their link formatting.';
                                if (hasList && hasGallery) return 'The table will be converted into a bulleted list with images. Each cell becomes a list item, and images are displayed with proper figure markup.';
                                if (hasLinks && hasGallery) return 'The table will be converted into a navigation section with image links. Each cell becomes a list item in a navigation region, with images wrapped in accessible figure elements.';
                                return 'The table will be converted into an accessible HTML structure based on your selections.';
                              })()}
                            </p>
                          </div>

                          {/* Live preview of the converted content */}
                          <div className="border border-[#d2d2d7] rounded-[10px] mb-4 overflow-hidden">
                            <div className="px-3 py-2 bg-[#EEECE8] border-b border-[#d2d2d7]">
                              <span className="text-[11px] font-semibold text-[#636366] uppercase tracking-wide">Preview</span>
                            </div>
                            <div
                              className="p-3 bg-white text-[13px] text-[#1d1d1f] max-h-[180px] overflow-y-auto"
                              dangerouslySetInnerHTML={{ __html: convertedTableHtml || '<span style="color:#636366">Generating preview…</span>' }}
                            />
                          </div>

                          <div className="border border-[#d2d2d7] rounded-[10px] p-3 mb-4 bg-white">
                            <div className="text-[12px] font-semibold text-[#1d1d1f] mb-1.5">Accessibility improvements:</div>
                            <ul className="text-[12px] text-[#636366] space-y-1 list-disc pl-4">
                              {tablePurposes.includes('data') ? (
                                <>
                                  <li>Caption identifies the table's purpose</li>
                                  <li>Headers with scope let screen readers navigate by row and column</li>
                                  <li>Meets CVC-OEI D3, QM 8.1, and QM 8.3</li>
                                </>
                              ) : (
                                <>
                                  <li>Table structure removed — no layout barriers for screen readers</li>
                                  {tablePurposes.includes('list') && <li>Screen readers announce item count and list structure</li>}
                                  {tablePurposes.includes('links') && <li>Proper navigation landmark for screen readers</li>}
                                  {tablePurposes.includes('gallery') && <li>Images retain their alt text and are wrapped in accessible figure elements</li>}
                                  <li>
                                    Meets CVC-OEI D3{tablePurposes.includes('links') ? ', QM 8.1' : ''}{tablePurposes.includes('gallery') ? ', QM 8.4' : ''}{(tablePurposes.includes('list') || tablePurposes.includes('links')) ? ', and QM 8.3' : ''}
                                  </li>
                                </>
                              )}
                            </ul>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setTablePurpose(null)}
                              className="px-4 h-[40px] rounded-[10px] border border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7] text-[14px] font-medium transition-colors"
                            >
                              ← Change selections
                            </button>
                            <button
                              onClick={convertLayoutTable}
                              disabled={isGenerating}
                              className="flex-1 h-[40px] rounded-[10px] bg-[#0071e3] hover:bg-[#0077ed] disabled:bg-[#d2d2d7] text-white text-[14px] font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                              {isGenerating ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Converting...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4" />
                                  Fix Now
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    ) : null}
                  </div>
                )}

                {/* Alt Text "What's Flagged" Section - Shown Before Problem Explanation */}
                {isAltTextIssue && (
                  <div className="mb-4">
                    {/* What's Flagged Label */}
                    <div className="text-[14px] font-semibold text-[#1d1d1f] mb-2">What's Flagged</div>

                    {/* Hidden file input */}
                    <input
                      id="broken-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />

                    {/* Image Preview + Decorative Question Card */}
                    {(() => {
                      const srcMatch = issue.elementHtml?.match(/src="([^"]+)"/);
                      const displayUrl = uploadedImageDataUrl || proxyImageUrl || (srcMatch && srcMatch[1]);

                      // Shared decorative buttons used by all designs
                      const decorativeButtons = showDecorativePrompt && isDecorativeImage === null ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setIsDecorativeImage(true);
                              setCustomAltText('');
                              setShowDecorativePrompt(false);
                            }}
                            className="flex-1 h-[40px] rounded-[10px] bg-[#34c759] hover:bg-[#2fb350] text-white text-[14px] font-semibold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Yes, it's decorative
                          </button>
                          <button
                            onClick={() => {
                              setIsDecorativeImage(false);
                              setShowDecorativePrompt(false);
                              generateAltTextSuggestions(true);
                            }}
                            className="flex-1 h-[40px] rounded-[10px] bg-[#0071e3] hover:bg-[#0077ed] text-white text-[14px] font-semibold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
                          >
                            <Wand2 className="w-4 h-4" />
                            No, generate alt text
                          </button>
                        </div>
                      ) : null;

                      // Working image (not broken)
                      if (displayUrl && !(isImageBroken && !uploadedImageDataUrl)) {
                        return (
                          <div className="mb-0">
                            <div className="border border-[#d2d2d7] border-b-0 rounded-t-[10px] p-2 bg-white flex justify-center">
                              <img
                                src={displayUrl}
                                alt="Image to fix"
                                className="max-h-[200px] object-contain rounded"
                                onError={() => {
                                  if (!uploadedImageDataUrl) {
                                    setIsImageBroken(true);
                                  }
                                }}
                              />
                            </div>
                            {decorativeButtons && (
                              <div className="px-3 py-3 bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] border border-t-0 border-[#d2d2d7] rounded-b-[10px] mb-3 shadow-sm">
                                <div className="text-[14px] font-semibold text-[#1d1d1f] mb-1.5">Is this image purely decorative?</div>
                                <p className="text-[12px] text-[#1d1d1f] mb-3 leading-relaxed">Decorative images add no meaningful information. Examples: borders, spacers, or aesthetic backgrounds.</p>
                                {decorativeButtons}
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Broken image — drop zone + decorative question
                      if (isImageBroken && !uploadedImageDataUrl) {
                        return (
                          <div className="mb-0">
                              <label
                                htmlFor="broken-image-upload"
                                className="block border-2 border-dashed border-[#c7c7cc] rounded-[10px] px-4 py-5 text-center cursor-pointer hover:border-[#0071e3] hover:bg-[#f0f7ff] transition-colors"
                              >
                                <ImageOff className="w-7 h-7 text-[#c7c7cc] mx-auto mb-1.5" strokeWidth={1.5} />
                                <div className="text-[13px] font-semibold text-[#1d1d1f] mb-0.5">Image not found on Canvas</div>
                                <div className="text-[12px] text-[#0071e3] font-medium">Click to upload image</div>
                                <div className="text-[11px] text-[#636366] mt-1">AI will generate alt text from the uploaded image</div>
                              </label>
                              {decorativeButtons && (
                                <div className="mt-4">
                                  {decorativeButtons}
                                </div>
                              )}
                          </div>
                        );
                      }

                      return null;
                    })()}
                  </div>
                )}

                {/* AI-Generated Learning Objectives Preview */}
                {isObjectivesIssue && needsManualFix ? (
                  <div className="mb-4 px-3 py-3 bg-[#fff9e6] border border-[#ff9500]/30 rounded-[8px]">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-[14px] flex-shrink-0">🛠️</span>
                      <h4 className="text-[13px] font-semibold text-[#1d1d1f]">Manual Fix Required</h4>
                    </div>
                    <p className="text-[13px] text-[#1d1d1f] leading-relaxed">
                      This module has no pages yet. Add an overview or intro page in Canvas first, then re-scan to get AI-generated learning outcomes.
                    </p>
                  </div>
                ) : isObjectivesIssue && (() => {
                  const bloomsColors: Record<string, { bg: string; text: string }> = {
                    remember:   { bg: '#ff3b3022', text: '#c0392b' },
                    understand: { bg: '#ff950022', text: '#b7660a' },
                    apply:      { bg: '#34c75922', text: '#1a7a3a' },
                    analyze:    { bg: '#007aff22', text: '#005ec4' },
                    evaluate:   { bg: '#af52de22', text: '#7c3aad' },
                    create:     { bg: '#ff2d5522', text: '#c0143c' },
                  };

                  // Group objectives by source (Style C locked)
                  const groupedBySource = aiGeneratedObjectives.reduce<Record<string, { objectives: typeof aiGeneratedObjectives; indices: number[] }>>((acc, obj, idx) => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = obj.mappedItem || '';
                    const key = (tempDiv.textContent || tempDiv.innerText || '').trim() || 'Other';
                    if (!acc[key]) acc[key] = { objectives: [], indices: [] };
                    acc[key].objectives.push(obj);
                    acc[key].indices.push(idx);
                    return acc;
                  }, {});

                  // Bloom's badge renderer — locked to Style D (tiny muted pill)
                  const renderBloomsBadge = (objective: typeof aiGeneratedObjectives[0]) => {
                    if (!objective.bloomsLevel) return null;
                    const level = (objective.bloomsLevel || '').toLowerCase();
                    const colors = bloomsColors[level] || { bg: '#63636622', text: '#555' };
                    return <span className="text-[7px] font-medium px-1 py-[0.5px] rounded capitalize flex-shrink-0 mt-1.5 leading-tight" style={{ backgroundColor: colors.bg, color: colors.text, opacity: 0.6 }}>{objective.bloomsLevel}</span>;
                  };

                  return (
                  <div className="mb-4">
                    <div className="text-[14px] font-semibold text-[#1d1d1f] mb-2 flex items-center gap-2">
                      <Wand2 className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
                      Outcomes
                    </div>
                    <div className="border border-[#d2d2d7] rounded-[10px] p-2 bg-[#EEECE8]">

                      {isGeneratingObjectives ? (
                        <div className="flex items-center gap-2 py-2">
                          <Loader2 className="w-4 h-4 text-[#0071e3] animate-spin" />
                          <span className="text-[12px] text-[#1d1d1f]">Generating outcomes...</span>
                        </div>
                      ) : aiGeneratedObjectives.length > 0 ? (
                        <div>
                          <div className="space-y-2">
                            {Object.entries(groupedBySource).map(([source, { objectives: groupObjs, indices }]) => (
                              <div key={source}>
                                <div className="text-[12px] text-[#1d1d1f] font-medium mb-1">{source}</div>
                                <div className="space-y-1 ml-1">
                                  {groupObjs.map((objective, gi) => {
                                    const globalIdx = indices[gi];
                                    return (
                                    <div key={globalIdx} className="group relative flex items-start gap-1.5">
                                      <span className="text-[#1d1d1f] font-semibold flex-shrink-0 mt-1 text-[12px]">{globalIdx + 1}.</span>
                                      <div className="flex-1 relative">
                                        <textarea aria-label={`Learning objective ${globalIdx + 1}`} value={objective.text} onChange={(e) => { const n = [...aiGeneratedObjectives]; n[globalIdx] = { ...n[globalIdx], text: e.target.value }; setAiGeneratedObjectives(n); }}
                                          className="w-full px-2 py-1 text-[12px] text-[#1d1d1f] leading-relaxed bg-white border border-[#d2d2d7] rounded-[4px] resize-none focus:outline-none focus:ring-1 focus:ring-[#0071e3]"
                                          rows={1} style={{ minHeight: '32px' }}
                                          onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }} />
                                        <button onClick={() => { setAiGeneratedObjectives(aiGeneratedObjectives.filter((_, i) => i !== globalIdx)); toast.success('Removed'); }}
                                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-[#ff3b30]/10 rounded" title="Delete">
                                          <X className="w-3 h-3 text-[#ff3b30]" /></button>
                                      </div>
                                      {renderBloomsBadge(objective)}
                                    </div>);
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => {
                              setAiGeneratedObjectives([
                                ...aiGeneratedObjectives,
                                { text: '', mappedItem: '', bloomsLevel: 'understand', actionVerb: '' }
                              ]);
                            }}
                            className="mt-2 text-[11px] text-[#0071e3] hover:text-[#0077ed] font-medium"
                          >
                            + Add another
                          </button>

                          <div className="mt-2 pt-1.5 border-t border-[#e5e5ea]">
                            <p className="text-[10px] text-[#636366]">
                              Edit above, then click "Fix Now" to publish to {issue.whereToAdd || 'your module'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[12px] text-[#636366] italic">
                          Unable to generate outcomes. Please create them manually.
                        </p>
                      )}
                    </div>
                  </div>
                  );
                })()}

                {/* PDF Conversion Section */}
                {isPdfIssue && (
                  <div className="mb-4">
                    <div className="px-3 py-3 bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] border border-[#0071e3]/30 rounded-[8px]">
                      <div className="flex items-start gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-[#0071e3] flex-shrink-0 mt-0.5" />
                        <h4 className="text-[13px] font-semibold text-[#0071e3]">Convert to Accessible Page</h4>
                      </div>

                      {/* Not yet converted — show convert button */}
                      {!convertedPdfHtml && !isConvertingPdf && !pdfConversionError && (
                        <div>
                          <p className="text-[12px] text-[#1d1d1f] mb-3 leading-relaxed">
                            AI will extract the text from this PDF and create a well-structured, accessible HTML page.
                            The original PDF will be kept — a new page will be added to the same module.
                          </p>
                          <button
                            onClick={handleConvertPdf}
                            className="w-full h-[44px] rounded-[10px] bg-[#0071e3] hover:bg-[#0077ed] text-white text-[14px] font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            Convert to Accessible Page
                          </button>
                        </div>
                      )}

                      {/* Converting — loading spinner */}
                      {isConvertingPdf && (
                        <div className="flex items-center gap-2 py-4">
                          <Loader2 className="w-4 h-4 text-[#0071e3] animate-spin" />
                          <span className="text-[12px] text-[#1d1d1f]">Downloading PDF and converting to accessible HTML...</span>
                        </div>
                      )}

                      {/* Error state — show retry */}
                      {pdfConversionError && !isConvertingPdf && (
                        <div>
                          <div className="flex items-start gap-2 mb-2 px-2 py-2 bg-[#fff5f5] border border-[#ff3b30]/20 rounded-[6px]">
                            <AlertCircle className="w-3.5 h-3.5 text-[#ff3b30] flex-shrink-0 mt-0.5" />
                            <p className="text-[12px] text-[#ff3b30]">{pdfConversionError}</p>
                          </div>
                          <button
                            onClick={handleConvertPdf}
                            className="w-full h-[40px] rounded-[10px] bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 mt-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            Try Again
                          </button>
                        </div>
                      )}

                      {/* Converted — show preview */}
                      {convertedPdfHtml && !isConvertingPdf && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[12px] text-[#34c759] font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Conversion complete — review the result below
                            </p>
                            <button
                              onClick={() => setShowPdfRawEditor(!showPdfRawEditor)}
                              className="text-[11px] text-[#0071e3] hover:underline font-medium"
                            >
                              {showPdfRawEditor ? 'Show Preview' : 'Edit HTML'}
                            </button>
                          </div>

                          {showPdfRawEditor ? (
                            <textarea
                              aria-label="Converted PDF HTML editor"
                              value={convertedPdfHtml}
                              onChange={(e) => setConvertedPdfHtml(e.target.value)}
                              className="w-full h-[300px] px-3 py-2 text-[12px] font-mono text-[#1d1d1f] bg-white border border-[#d2d2d7] rounded-[6px] resize-y focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent"
                            />
                          ) : (
                            <div
                              className="bg-white border border-[#d2d2d7] rounded-[6px] px-4 py-3 max-h-[300px] overflow-y-auto text-[13px] text-[#1d1d1f] leading-relaxed prose prose-sm"
                              dangerouslySetInnerHTML={{ __html: convertedPdfHtml }}
                            />
                          )}

                          <p className="text-[11px] text-[#636366] mt-2">
                            This will create a new page in the same module. The original PDF will be kept.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Why This Is a Problem - shown AFTER objectives for objectives issues; shown inside contrast section for contrast issues */}
                {(!isAltTextIssue || isDecorativeImage !== true) && !isContrastIssue && !isColorOnlyIssue ? (
                  <div className="px-3 py-3 bg-[#fff5f5] border border-[#ff3b30]/20 rounded-[8px] mb-4">
                    <div className="flex items-start gap-2 mb-1.5">
                      <AlertCircle className="w-4 h-4 text-[#ff3b30] flex-shrink-0 mt-0.5" />
                      <h4 className="text-[13px] font-semibold text-[#ff3b30]">Why This Is a Problem:</h4>
                    </div>
                    <p className="text-[13px] text-[#1d1d1f] leading-relaxed mb-1.5">
                      {isObjectivesIssue
                        ? 'Learning outcomes help students understand what they are expected to learn and how assignments connect to those outcomes.'
                        : (issue.impactStatement || getIssueExplanation(issue))
                      }
                    </p>

                    {issue.suggestedFix && !isObjectivesIssue && !isContrastIssue && (
                      <div className="pt-2 border-t border-[#ff3b30]/10">
                        <div className="text-[12px] font-semibold text-[#1d1d1f] mb-1">Suggested Fix:</div>
                        <div className="text-[12px] text-[#1d1d1f]">{issue.suggestedFix}</div>
                      </div>
                    )}
                  </div>
                ) : (isContrastIssue || isColorOnlyIssue) ? null : (
                  /* Decorative Image Confirmation Message */
                  <div className="px-3 py-3 bg-[#e8f5e9] border border-[#34c759]/20 rounded-[8px] mb-4">
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-[#34c759] flex-shrink-0 mt-0.5" />
                      <h4 className="text-[13px] font-semibold text-[#34c759]">Decorative Image - Ready to Resolve</h4>
                    </div>
                    <p className="text-[13px] text-[#1d1d1f] leading-relaxed mb-2">
                      Decorative images should have empty alt attributes (alt="") per WCAG guidelines. 
                      This issue will be marked as resolved without making changes to Canvas.
                    </p>
                    <div className="pt-2 border-t border-[#34c759]/20">
                      <div className="text-[11px] font-semibold text-[#1d1d1f] mb-1">Next step:</div>
                      <div className="text-[11px] text-[#1d1d1f]">Click "Mark as Resolved" below to complete this action.</div>
                    </div>
                  </div>
                )}

                {/* Welcome Announcement / Discussion Board Creator — manual entry */}
                {(isWelcomeIssue || isPeerInteractionIssue || isModuleDiscussionIssue) && (
                  <div className="mb-4">
                    <div className="text-[14px] font-semibold text-[#1d1d1f] mb-3">
                      {isWelcomeIssue ? 'Create Welcome Announcement' : 'Create Discussion Board'}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label htmlFor="issue-title-input" className="text-[11px] font-semibold text-[#636366] uppercase tracking-wide mb-1 block">Title</label>
                        <input
                          id="issue-title-input"
                          type="text"
                          value={announcementTitle}
                          onChange={(e) => setAnnouncementTitle(e.target.value)}
                          className="w-full text-[13px] text-[#1d1d1f] bg-white border border-[#e5e5e7] rounded-[8px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                        />
                      </div>
                      <div>
                        <label htmlFor="issue-message-textarea" className="text-[11px] font-semibold text-[#636366] uppercase tracking-wide mb-1 block">
                          {isWelcomeIssue ? 'Message' : 'Discussion Prompt'}
                        </label>
                        {isModuleDiscussionIssue ? (
                          <>
                            <textarea
                              id="issue-message-textarea"
                              value={(() => {
                                // Strip HTML tags for display — user sees clean text
                                const tmp = document.createElement('div');
                                tmp.innerHTML = aiRewrittenContent;
                                return tmp.textContent || tmp.innerText || '';
                              })()}
                              onChange={(e) => {
                                // User edits plain text — wrap in basic HTML for Canvas
                                const plainText = e.target.value;
                                const html = '<p>' + plainText.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
                                setAiRewrittenContent(html);
                              }}
                              className="w-full text-[13px] text-[#1d1d1f] bg-white border border-[#e5e5e7] rounded-[8px] p-3 resize-y leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 min-h-[300px]"
                              placeholder="AI is generating a discussion prompt for this module…"
                            />
                            <p className="text-[11px] text-[#86868b] mt-1.5">Formatting is applied automatically when published to Canvas.</p>
                          </>
                        ) : (
                          <textarea
                            id="issue-message-textarea"
                            value={aiRewrittenContent}
                            onChange={(e) => setAiRewrittenContent(e.target.value)}
                            className="w-full text-[13px] text-[#1d1d1f] bg-white border border-[#e5e5e7] rounded-[8px] p-3 resize-y leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 min-h-[120px]"
                            placeholder={isWelcomeIssue ? 'Write your welcome message here…' : 'Write your discussion prompt here…'}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Communication Guidelines — pre-populated editable template (no AI call needed) */}
                {isCommGuidelinesIssue && (
                  <div className="mb-4">
                    <div className="text-[14px] font-semibold text-[#1d1d1f] mb-2">
                      Communication &amp; Response Times Template
                    </div>
                    <p className="text-[12px] text-[#636366] mb-3">
                      Edit the template below to match your response times and contact preferences, then click Apply Fix to add it to your syllabus.
                    </p>
                    <textarea
                      value={aiRewrittenContent}
                      onChange={(e) => setAiRewrittenContent(e.target.value)}
                      className="w-full text-[13px] text-[#1d1d1f] bg-white border border-[#e5e5e7] rounded-[8px] p-3 resize-y leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 min-h-[280px]"
                      placeholder="Communication guidelines template will appear here…"
                    />
                    <p className="text-[11px] text-[#636366] mt-1 leading-relaxed">
                      Review and customize the template above, then click <strong>Apply Fix</strong> to add it to your course syllabus.
                    </p>
                  </div>
                )}

                {/* AI Content Rewrite / Template Section — hidden for welcome/peer (they have their own Create section above) */}
                {(isAIRewriteIssue || (isTemplateIssue && !isWelcomeIssue && !isPeerInteractionIssue && !isCommGuidelinesIssue && !isModuleDiscussionIssue)) && needsManualFix ? (
                  <div className="mb-4 px-3 py-3 bg-[#fff9e6] border border-[#ff9500]/30 rounded-[8px]">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-[14px] flex-shrink-0">🛠️</span>
                      <h4 className="text-[13px] font-semibold text-[#1d1d1f]">Manual Fix Required</h4>
                    </div>
                    <p className="text-[13px] text-[#1d1d1f] leading-relaxed">
                      There's no existing content for AI to improve — this needs to be built directly in Canvas.{issue.suggestedFix ? ` ${issue.suggestedFix}.` : ''}
                    </p>
                  </div>
                ) : (isAIRewriteIssue || (isTemplateIssue && !isWelcomeIssue && !isPeerInteractionIssue && !isCommGuidelinesIssue && !isModuleDiscussionIssue)) && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#0071e3]" />
                        <div className="text-[14px] font-semibold text-[#1d1d1f]">
                          {isTemplateIssue ? 'AI Template' : 'AI Rewrite'}
                        </div>
                      </div>
                      {!isRewritingContent && aiRewrittenContent && (
                        <button
                          onClick={generateContentRewrite}
                          className="text-[12px] text-[#0071e3] hover:text-[#0077ed] font-medium flex items-center gap-1"
                        >
                          ↻ Regenerate
                        </button>
                      )}
                    </div>

                    {isRewritingContent ? (
                      <div className="flex items-center gap-2 py-5 px-3 bg-[#EEECE8] border border-[#e5e5e7] rounded-[8px]">
                        <Loader2 className="w-4 h-4 text-[#0071e3] animate-spin flex-shrink-0" />
                        <span className="text-[13px] text-[#636366]">
                          {isTemplateIssue ? 'AI is generating a template…' : 'AI is rewriting this content…'}
                        </span>
                      </div>
                    ) : aiRewrittenContent ? (
                      <div className="space-y-2">
                        <textarea
                          aria-label="AI-generated content editor"
                          value={aiRewrittenContent}
                          onChange={(e) => setAiRewrittenContent(e.target.value)}
                          className="w-full text-[13px] text-[#1d1d1f] bg-white border border-[#e5e5ea] rounded-[8px] p-3 resize-y leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 min-h-[420px]"
                          placeholder={isTemplateIssue ? 'AI template will appear here…' : 'AI rewrite will appear here…'}
                        />
                        <p className="text-[11px] text-[#636366] leading-relaxed">
                          {isTemplateIssue
                            ? <>Review and edit the AI-generated template above, then click <strong>Apply Fix</strong> to add it to your Canvas course.</>
                            : <>Review and edit the AI suggestion above, then click <strong>Apply Fix</strong> to save it to Canvas.</>
                          }
                        </p>
                      </div>
                    ) : aiUnavailable ? (
                      <div className="px-3 py-3 bg-[#fff9e6] border border-[#ff9500]/30 rounded-[8px]">
                        <p className="text-[12px] text-[#1d1d1f]">
                          AI is temporarily unavailable. Use the steps above to fix this manually in Canvas.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={generateContentRewrite}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#EEECE8] border border-[#e5e5e7] rounded-[8px] hover:bg-[#ebebeb] transition-colors text-[13px] font-medium text-[#1d1d1f]"
                      >
                        <Sparkles className="w-4 h-4 text-[#0071e3]" />
                        {isTemplateIssue ? 'Generate AI Template' : 'Generate AI Rewrite'}
                      </button>
                    )}
                  </div>
                )}

                {/* Color Contrast Fix - Choose Color Preview */}
                {isContrastIssue && (
                  <div className="mb-4">
                    <div className="text-[14px] font-semibold text-[#1d1d1f] mb-2">Preview Fix Options</div>

                    {/* Compact color option */}
                    {(() => {
                      const originalBg = issue.backgroundColor || '#ffffff';
                      const fixColorMatch = (issue.suggestedFix || '').match(/color:\s*(#[0-9a-fA-F]{3,6})/);
                      const fixColor = fixColorMatch ? fixColorMatch[1] : '#000000';
                      const fixHex = fixColor.replace('#', '');
                      const fixR = parseInt(fixHex.slice(0, 2), 16);
                      const fixG = parseInt(fixHex.slice(2, 4), 16);
                      const fixB = parseInt(fixHex.slice(4, 6), 16);
                      const fixLum = (0.299 * fixR + 0.587 * fixG + 0.114 * fixB) / 255;
                      const fixLabel = fixLum < 0.5 ? 'Dark Text' : 'Light Text';

                      const tempDiv = document.createElement('div');
                      tempDiv.innerHTML = issue.elementHtml || '';
                      const textContent = tempDiv.textContent || 'Sample text';

                      // Preserve any inline background-color on the element itself (e.g. highlighted text)
                      const firstEl = tempDiv.querySelector('[style]') as HTMLElement | null;
                      const elementInlineBg = firstEl?.style?.backgroundColor || '';
                      const previewBg = elementInlineBg || originalBg;

                      return (
                        <div
                          className={`border rounded-[10px] p-3 cursor-pointer transition-all ${
                            selectedContrastColor === fixColor
                              ? 'border-[#0071e3] bg-[#0071e3]/5'
                              : 'border-[#d2d2d7] hover:border-[#0071e3]/40 bg-white'
                          }`}
                          onClick={() => setSelectedContrastColor(fixColor)}
                        >
                          {/* Compact header row */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded border border-[#d2d2d7] flex-shrink-0" style={{ backgroundColor: fixColor }} />
                            <span className="text-[13px] font-semibold text-[#1d1d1f]">{fixLabel}</span>
                            <span className="font-mono text-[11px] text-[#636366]">{fixColor}</span>
                            <span className="ml-auto text-[11px] font-semibold text-[#34c759]">Meets WCAG AA</span>
                            {selectedContrastColor === fixColor && (
                              <CheckCircle className="w-4 h-4 text-[#0071e3] flex-shrink-0" />
                            )}
                          </div>
                          {/* After fix preview */}
                          <div className="border border-[#e5e5ea] rounded-[6px] p-2 flex items-center gap-3" style={{ backgroundColor: previewBg }}>
                            <div className="text-[10px] font-semibold uppercase tracking-wide flex-shrink-0 text-[#636366]">After fix:</div>
                            <div className="text-[13px] font-medium leading-relaxed" style={{ color: fixColor }}>{textContent}</div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Why This Is a Problem - shown here for contrast issues */}
                    <div className="mt-3 px-3 py-3 bg-[#fff5f5] border border-[#ff3b30]/20 rounded-[8px]">
                      <div className="flex items-start gap-2 mb-1.5">
                        <AlertCircle className="w-4 h-4 text-[#ff3b30] flex-shrink-0 mt-0.5" />
                        <h4 className="text-[13px] font-semibold text-[#ff3b30]">Why This Is a Problem:</h4>
                      </div>
                      <p className="text-[13px] text-[#1d1d1f] leading-relaxed">
                        {issue.impactStatement || getIssueExplanation(issue)}
                      </p>
                    </div>

                    <div className="mt-3 px-3 py-2 bg-[#f0f9ff] border border-[#0071e3]/20 rounded-[8px]">
                      <div className="text-[11px] text-[#1d1d1f]">
                        <strong>💡 Tip:</strong> The suggested color is calculated to meet WCAG AA contrast requirements against the detected background.
                      </div>
                    </div>
                  </div>
                )}

                {/* Color-Only Fix - Choose Emphasis Preview */}
                {isColorOnlyIssue && (
                  <div className="mb-4">
                    <div className="text-[14px] font-semibold text-[#1d1d1f] mb-2">Preview Fix Options</div>

                    {(() => {
                      // Extract the colored text and color from the element
                      const tempDiv = document.createElement('div');
                      tempDiv.innerHTML = issue.elementHtml || '';
                      const coloredEl = tempDiv.querySelector('span, font') as HTMLElement | null;
                      const textContent = coloredEl?.textContent || tempDiv.textContent || 'Sample text';
                      const detectedColor = coloredEl?.style?.color || '#ff0000';

                      const fixOptions: Array<{
                        id: 'bold';
                        label: string;
                        description: string;
                        renderPreview: () => React.ReactNode;
                      }> = [
                        {
                          id: 'bold',
                          label: 'Add Bold',
                          description: '',
                          renderPreview: () => (
                            <span style={{ color: detectedColor, fontWeight: 'bold' }}>{textContent}</span>
                          ),
                        },
                      ];

                      return (
                        <div className="space-y-2">
                          {fixOptions.map((option, idx) => (
                            <div
                              key={option.id}
                              className={`border rounded-[10px] p-3 cursor-pointer transition-all ${
                                selectedColorOnlyFix === option.id
                                  ? 'border-[#0071e3] bg-[#0071e3]/5'
                                  : 'border-[#d2d2d7] hover:border-[#0071e3]/40 bg-white'
                              }`}
                              onClick={() => setSelectedColorOnlyFix(option.id)}
                            >
                              {/* Header row */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[13px] font-semibold text-[#636366]">{idx + 1}.</span>
                                <span className="text-[13px] font-semibold text-[#1d1d1f]">{option.label}</span>
                                {idx === 0 && (
                                  <span className="bg-[#0071e3]/10 text-[#0071e3] text-[10px] rounded-full px-2 py-0.5 font-medium">
                                    Recommended
                                  </span>
                                )}
                                {selectedColorOnlyFix === option.id && (
                                  <CheckCircle className="w-4 h-4 text-[#0071e3] flex-shrink-0 ml-auto" />
                                )}
                              </div>
                              {/* After fix preview */}
                              <div className="border border-[#e5e5ea] rounded-[6px] p-2 bg-white flex items-center gap-3">
                                <div className="text-[10px] font-semibold uppercase tracking-wide text-[#636366] flex-shrink-0">After fix:</div>
                                <div className="text-[13px] leading-relaxed">
                                  {option.renderPreview()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Why This Is a Problem */}
                    <div className="mt-3 px-3 py-3 bg-[#fff5f5] border border-[#ff3b30]/20 rounded-[8px]">
                      <div className="flex items-start gap-2 mb-1.5">
                        <AlertCircle className="w-4 h-4 text-[#ff3b30] flex-shrink-0 mt-0.5" />
                        <h4 className="text-[13px] font-semibold text-[#ff3b30]">Why This Is a Problem:</h4>
                      </div>
                      <p className="text-[13px] text-[#1d1d1f] leading-relaxed">
                        {issue.impactStatement || 'Color alone is being used to convey meaning. Users who cannot perceive color differences (colorblind, low vision) will miss this information. WCAG 1.4.1 requires a non-color visual indicator.'}
                      </p>
                    </div>

                  </div>
                )}

                {/* Replacement URL Input - Only for broken link issues */}
                {isBrokenLinkIssue && (
                  <div className="mb-4">
                    <label htmlFor="replacement-url" className="block text-[14px] font-semibold text-[#1d1d1f] mb-2">
                      Replacement URL:
                    </label>
                    <input
                      id="replacement-url"
                      type="url"
                      value={replacementUrl}
                      onChange={(e) => setReplacementUrl(e.target.value)}
                      placeholder="https://example.com/correct-page"
                      className="w-full px-3 py-2.5 border border-[#d2d2d7] rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-all"
                    />
                    {replacementUrl && (
                      <div className={`mt-1.5 text-[11px] font-medium ${
                        /^https?:\/\/.+\..+/.test(replacementUrl) ? 'text-[#34c759]' : 'text-[#ff9500]'
                      }`}>
                        {/^https?:\/\/.+\..+/.test(replacementUrl) ? 'Valid URL format' : 'Enter a complete URL starting with https://'}
                      </div>
                    )}
                  </div>
                )}

                {/* Link Text Fix Input - Only show for actual link issues, not layout tables */}
                {isLinkIssue && !isLayoutTableIssue && (
                  <div className="mb-4">
                    <label htmlFor="new-link-text" className="block text-[14px] font-semibold text-[#1d1d1f] mb-2">
                      New Link Text:
                      {isGenerating && (
                        <span className="ml-2 text-[12px] text-[#0071e3] font-normal">
                          <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
                          AI is analyzing the URL...
                        </span>
                      )}
                    </label>
                    <input
                      id="new-link-text"
                      type="text"
                      value={customLinkText}
                      onChange={(e) => setCustomLinkText(e.target.value)}
                      placeholder={isGenerating ? "AI is analyzing the destination..." : "e.g., APA Format Citation Guide"}
                      maxLength={100}
                      className="w-full px-3 py-2.5 border border-[#d2d2d7] rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-all"
                    />
                    
                    {/* Character Counter */}
                    <div className="flex items-center justify-between mt-1.5">
                      <div className={`text-[11px] ${
                        customLinkText.length === 0 ? 'text-[#636366]' :
                        customLinkText.length <= 60 ? 'text-[#34c759]' :
                        customLinkText.length <= 80 ? 'text-[#ff9500]' :
                        'text-[#ff3b30]'
                      } font-medium`}>
                        {customLinkText.length}/100 characters
                        {customLinkText.length <= 60 && customLinkText.length > 0 && ' ✓'}
                        {customLinkText.length > 80 && ' ⚠️ Too long'}
                      </div>
                      
                      {validationResult && (
                        <div className={`text-[11px] ${validationResult.isValid ? 'text-[#34c759]' : 'text-[#ff3b30]'} flex items-center gap-1`}>
                          {validationResult.isValid ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {validationResult.message}
                        </div>
                      )}
                    </div>

                    {/* AI Suggestions Section — heading outside, content in matching card */}
                    {aiSuggestions.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[14px] font-semibold text-[#1d1d1f] mb-2 flex items-center gap-2">
                          <Wand2 className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
                          AI Suggestions
                        </div>
                        <div className="border border-[#d2d2d7] rounded-[10px] p-2 bg-[#EEECE8]">
                          <div className="space-y-2">
                            {aiSuggestions.map((suggestion, index) => {
                              const isSelected = customLinkText === suggestion.text;
                              const levelLabel = suggestion.level === 'brief' ? '📝 Brief' :
                                               suggestion.level === 'moderate' ? '✍️ Moderate (Recommended)' :
                                               '📋 Detailed';
                              const levelColor = suggestion.level === 'brief' ? 'text-[#ff9500]' :
                                               suggestion.level === 'moderate' ? 'text-[#34c759]' :
                                               'text-[#0071e3]';

                              return (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setCustomLinkText(suggestion.text);
                                    setSelectedSuggestion(suggestion.text);
                                  }}
                                  className={`w-full text-left px-3 py-2.5 rounded-[8px] transition-all border-2 ${
                                    isSelected
                                      ? 'bg-white border-[#0071e3] shadow-sm'
                                      : 'bg-white border-transparent hover:bg-white hover:border-[#0071e3]/30'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className={`text-[10px] font-semibold ${levelColor} uppercase tracking-wide`}>
                                      {levelLabel}
                                    </div>
                                    {isSelected && (
                                      <CheckCircle className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
                                    )}
                                  </div>
                                  <div className="text-[12px] text-[#1d1d1f] leading-relaxed">
                                    {suggestion.text}
                                  </div>
                                  <div className="text-[10px] text-[#636366] mt-1">
                                    {suggestion.text.length} characters
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          <div className="mt-2 text-[10px] text-[#636366] text-center">
                            💡 Click a suggestion to use it, or write your own above
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Link Text Writing Tips - Collapsible Accordion */}
                    <div className="mt-3 border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                      <button
                        onClick={() => toggleSection('link-tips')}
                        className="w-full px-4 py-3 flex items-center justify-between bg-[#EEECE8] hover:bg-[#E4E2DE] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-[18px] h-[18px] text-[#0071e3]" strokeWidth={1.5} />
                          <span className="text-[13px] font-semibold text-[#1d1d1f]">Writing Tips</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[#636366] transition-transform ${expandedSections.has('link-tips') ? '' : '-rotate-90'}`} />
                      </button>
                      <AnimatePresence>
                        {expandedSections.has('link-tips') && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 py-3 bg-white">
                              <div className="text-[11px] text-[#1d1d1f] space-y-1.5">
                                <div className="flex items-start gap-1.5">
                                  <span className="text-[#34c759] flex-shrink-0 mt-0.5">✓</span>
                                  <span>Describe the <strong>destination</strong> or <strong>purpose</strong> of the link</span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <span className="text-[#34c759] flex-shrink-0 mt-0.5">✓</span>
                                  <span>Keep it brief but meaningful (under 80 chars)</span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <span className="text-[#34c759] flex-shrink-0 mt-0.5">✓</span>
                                  <span>Make it make sense out of context</span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <span className="text-[#ff3b30] flex-shrink-0 mt-0.5">✗</span>
                                  <span>Don't use "Click here" or "Read more"</span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <span className="text-[#ff3b30] flex-shrink-0 mt-0.5">✗</span>
                                  <span>Avoid long URLs as link text</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Examples - Collapsible Accordion */}
                    <div className="mt-3 border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                      <button
                        onClick={() => toggleSection('link-examples')}
                        className="w-full px-4 py-3 flex items-center justify-between bg-[#EEECE8] hover:bg-[#E4E2DE] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-[18px] h-[18px] text-[#0071e3]" strokeWidth={1.5} />
                          <span className="text-[13px] font-semibold text-[#1d1d1f]">Examples</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[#636366] transition-transform ${expandedSections.has('link-examples') ? '' : '-rotate-90'}`} />
                      </button>
                      <AnimatePresence>
                        {expandedSections.has('link-examples') && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 py-3 bg-white">
                              <div className="text-[11px] text-[#1d1d1f] space-y-2">
                                <div>
                                  <span className="text-[#ff3b30] font-medium">❌ Bad:</span> "https://www.apastyle.org/style-grammar-guidelines"
                                </div>
                                <div>
                                  <span className="text-[#34c759] font-medium">✅ Good:</span> "APA Style Guidelines"
                                </div>
                                <div className="mt-2 pt-2 border-t border-[#d2d2d7]">
                                  <span className="text-[#ff3b30] font-medium">❌ Bad:</span> "Click here"
                                </div>
                                <div>
                                  <span className="text-[#34c759] font-medium">✅ Good:</span> "Download the syllabus"
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Alt Text Fix Section - Continued (Input + Accordions) */}
                {isAltTextIssue && (
                  <div className="mb-4">
                    {/* STEP 3: Generate alt text (if not decorative) */}
                    {!showDecorativePrompt && isDecorativeImage === false ? (
                      <div>
                        <label htmlFor="new-alt-text" className="block text-[14px] font-semibold text-[#1d1d1f] mb-2">
                          New Alt Text:
                          {isGenerating && (
                            <span className="ml-2 text-[12px] text-[#0071e3] font-normal">
                              <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
                              Generating suggestion...
                            </span>
                          )}
                        </label>
                        <textarea
                          id="new-alt-text"
                          value={customAltText}
                          onChange={(e) => setCustomAltText(e.target.value)}
                          placeholder={isGenerating ? "AI is analyzing the image..." : "Describe what the image shows (e.g., Three cats with text 'CATS 101')"}
                          rows={2}
                          maxLength={150}
                          className="w-full px-3 py-2.5 border border-[#d2d2d7] rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-all resize-none"
                        />
                        
                        {/* Character Counter */}
                        <div className="flex items-center justify-between mt-1.5">
                          <div className={`text-[11px] ${
                            customAltText.length === 0 ? 'text-[#636366]' :
                            customAltText.length <= 100 ? 'text-[#E8910D]' :
                            customAltText.length <= 125 ? 'text-[#ff9500]' :
                            'text-[#ff3b30]'
                          } font-medium`}>
                            {customAltText.length}/150 characters
                            {customAltText.length <= 100 && customAltText.length > 0 && ' ✓'}
                            {customAltText.length > 125 && ' ⚠️ Too long'}
                          </div>
                          
                          {validationResult && (
                            <div className={`text-[11px] ${validationResult.isValid ? 'text-[#E8910D]' : 'text-[#ff3b30]'} flex items-center gap-1`}>
                                {validationResult.isValid ? (
                                  <CheckCircle className="w-3 h-3" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3" />
                                )}
                                {validationResult.message}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => {
                            setShowDecorativePrompt(true);
                            setIsDecorativeImage(null);
                            setCustomAltText('');
                            setAiSuggestions([]);
                          }}
                          className="mt-2 text-[13px] text-[#0071e3] hover:text-[#0077ed] font-medium underline"
                        >
                          ← Go back and change answer
                        </button>

                        {/* Complex Image Badge — shown prominently above suggestions */}
                        {isComplexImage && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-[11px] font-bold text-white bg-[#ff9500] px-2.5 py-1 rounded-full uppercase tracking-wide">Complex Image</span>
                            <span className="text-[12px] text-[#636366]">Alt text + visible description will be added</span>
                          </div>
                        )}

                        {/* AI Suggested Alt Text — shown inline, no accordion */}
                        {aiSuggestions.length > 0 && (() => {
                          const recommended = aiSuggestions.find(s => s.level === 'moderate');
                          const others = aiSuggestions.filter(s => s.level !== 'moderate');
                          return (
                            <div className="mt-3">
                              {/* Recommended suggestion — always visible */}
                              <div className="flex items-center gap-2 mb-2">
                                <Wand2 className="w-4 h-4 text-[#0071e3]" strokeWidth={1.5} />
                                <span className="text-[13px] font-semibold text-[#1d1d1f]">AI Suggested Alt Text</span>
                              </div>
                              {recommended && (
                                <button
                                  onClick={() => {
                                    setCustomAltText(recommended.text);
                                    setSelectedSuggestion(recommended.text);
                                  }}
                                  className={`w-full text-left px-3 py-2.5 rounded-[10px] transition-all border-2 ${
                                    customAltText === recommended.text
                                      ? 'bg-white border-[#0071e3]'
                                      : 'bg-white border-[#0071e3]/20 hover:border-[#0071e3]/40'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] font-semibold text-[#0071e3] uppercase">⚡ Recommended</span>
                                    {customAltText === recommended.text && (
                                      <CheckCircle className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
                                    )}
                                  </div>
                                  <div className="text-[13px] text-[#1d1d1f] leading-relaxed">{recommended.text}</div>
                                  <div className="text-[10px] text-[#636366] mt-1">{recommended.text.length} characters</div>
                                </button>
                              )}

                              {/* Toggle for other suggestions */}
                              {others.length > 0 && (
                                <div className="mt-2">
                                  <button
                                    onClick={() => toggleSection('alttext-others')}
                                    className="text-[13px] text-[#0071e3] hover:text-[#0077ed] font-medium flex items-center gap-1"
                                  >
                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expandedSections.has('alttext-others') ? 'rotate-90' : ''}`} />
                                    {expandedSections.has('alttext-others') ? 'Hide other suggestions' : 'View other suggestions'}
                                  </button>
                                  <AnimatePresence>
                                    {expandedSections.has('alttext-others') && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="mt-2 space-y-2">
                                          {others.map((suggestion, index) => {
                                            const isSelected = customAltText === suggestion.text;
                                            const levelLabel = suggestion.level === 'brief' ? '📝 Brief' : '📋 Detailed';
                                            return (
                                              <button
                                                key={index}
                                                onClick={() => {
                                                  setCustomAltText(suggestion.text);
                                                  setSelectedSuggestion(suggestion.text);
                                                }}
                                                className={`w-full text-left px-3 py-2.5 rounded-[10px] transition-all border-2 ${
                                                  isSelected
                                                    ? 'bg-white border-[#0071e3]'
                                                    : 'bg-white border-[#d2d2d7] hover:border-[#86868b]'
                                                }`}
                                              >
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[11px] font-semibold text-[#636366] uppercase">{levelLabel}</span>
                                                  {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />}
                                                </div>
                                                <div className="text-[13px] text-[#1d1d1f] leading-relaxed">{suggestion.text}</div>
                                                <div className="text-[10px] text-[#636366] mt-1">{suggestion.text.length} characters</div>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Complex Image Text Description — selected card style matching recommended */}
                        {isComplexImage && complexCaption && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-[#ff9500]" strokeWidth={1.5} />
                              <span className="text-[13px] font-semibold text-[#1d1d1f]">Suggested Text Description</span>
                            </div>
                            <div className="rounded-[10px] border-2 border-[#0071e3] bg-white p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-semibold text-[#0071e3] uppercase">✦ Will be added below image</span>
                                <CheckCircle className="w-4 h-4 text-[#0071e3] flex-shrink-0" />
                              </div>
                              <textarea
                                ref={(el) => {
                                  if (el) {
                                    el.style.height = 'auto';
                                    el.style.height = el.scrollHeight + 'px';
                                  }
                                }}
                                value={complexCaption}
                                onChange={(e) => {
                                  setComplexCaption(e.target.value);
                                  e.target.style.height = 'auto';
                                  e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                className="w-full min-h-[60px] p-0 text-[13px] text-[#1d1d1f] bg-transparent border-none rounded-none resize-none focus:outline-none leading-relaxed overflow-hidden"
                                placeholder="Text description of the complex image..."
                              />
                            </div>
                          </div>
                        )}

                        {/* Alt Text Writing Tips - Collapsible Accordion */}
                        <div className="mt-3 border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                          <button
                            onClick={() => toggleSection('alttext-tips')}
                            className="w-full px-4 py-3 flex items-center justify-between bg-[#EEECE8] hover:bg-[#E4E2DE] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Lightbulb className="w-[18px] h-[18px] text-[#0071e3]" strokeWidth={1.5} />
                              <span className="text-[13px] font-semibold text-[#1d1d1f]">Writing Tips</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-[#636366] transition-transform ${expandedSections.has('alttext-tips') ? '' : '-rotate-90'}`} />
                          </button>
                          <AnimatePresence>
                            {expandedSections.has('alttext-tips') && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 py-3 bg-white">
                                  <div className="text-[11px] text-[#1d1d1f] space-y-1.5">
                                    <div className="flex items-start gap-1.5">
                                      <span className="text-[#34c759] flex-shrink-0 mt-0.5">✓</span>
                                      <span>Describe what the image <strong>shows</strong>, not what it <strong>is</strong></span>
                                    </div>
                                    <div className="flex items-start gap-1.5">
                                      <span className="text-[#34c759] flex-shrink-0 mt-0.5">✓</span>
                                      <span>Include text visible in the image</span>
                                    </div>
                                    <div className="flex items-start gap-1.5">
                                      <span className="text-[#34c759] flex-shrink-0 mt-0.5">✓</span>
                                      <span>Be brief but descriptive (under 125 chars)</span>
                                    </div>
                                    <div className="flex items-start gap-1.5">
                                      <span className="text-[#ff3b30] flex-shrink-0 mt-0.5">✗</span>
                                      <span>Don't start with "Image of..." or "Picture of..."</span>
                                    </div>
                                    <div className="flex items-start gap-1.5">
                                      <span className="text-[#ff3b30] flex-shrink-0 mt-0.5">✗</span>
                                      <span>Avoid filenames (IMG_1234.jpg)</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Examples - Collapsible Accordion */}
                        <div className="mt-3 border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                          <button
                            onClick={() => toggleSection('alttext-examples')}
                            className="w-full px-4 py-3 flex items-center justify-between bg-[#EEECE8] hover:bg-[#E4E2DE] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-[18px] h-[18px] text-[#0071e3]" strokeWidth={1.5} />
                              <span className="text-[13px] font-semibold text-[#1d1d1f]">Examples</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-[#636366] transition-transform ${expandedSections.has('alttext-examples') ? '' : '-rotate-90'}`} />
                          </button>
                          <AnimatePresence>
                            {expandedSections.has('alttext-examples') && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 py-3 bg-white">
                                  <div className="text-[11px] text-[#1d1d1f] space-y-2">
                                    <div>
                                      <span className="text-[#ff3b30] font-medium">❌ Bad:</span> "image_001.jpg"
                                    </div>
                                    <div>
                                      <span className="text-[#34c759] font-medium">✅ Good:</span> "Student presenting research findings to class"
                                    </div>
                                    <div className="pt-2 border-t border-[#e5e5ea]">
                                      <span className="text-[#ff3b30] font-medium">❌ Bad:</span> "graph"
                                    </div>
                                    <div>
                                      <span className="text-[#34c759] font-medium">✅ Good:</span> "Bar chart of enrollment trends 2020-2024 showing 15% growth"
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Table Caption Fix Section - Only show if confirmed as data table */}
                {isTableCaptionIssue && isDataTable === true && (
                  <div className="mb-4">
                    <label htmlFor="new-table-caption" className="block text-[14px] font-semibold text-[#1d1d1f] mb-2">
                      New Table Caption:
                      {isGenerating && (
                        <span className="ml-2 text-[12px] text-[#0071e3] font-normal">
                          <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
                          AI is analyzing the table...
                        </span>
                      )}
                    </label>
                    <textarea
                      id="new-table-caption"
                      value={customTableCaption}
                      onChange={(e) => setCustomTableCaption(e.target.value)}
                      placeholder={isGenerating ? "AI is analyzing the table structure..." : "Describe the table's purpose and content"}
                      rows={3}
                      maxLength={150}
                      className="w-full px-3 py-2.5 border border-[#d2d2d7] rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-all resize-none"
                    />
                    
                    {/* Character Counter */}
                    <div className="flex items-center justify-between mt-1.5">
                      <div className={`text-[11px] ${
                        customTableCaption.length === 0 ? 'text-[#636366]' :
                        customTableCaption.length <= 100 ? 'text-[#34c759]' :
                        customTableCaption.length <= 125 ? 'text-[#ff9500]' :
                        'text-[#ff3b30]'
                      } font-medium`}>
                        {customTableCaption.length}/150 characters
                        {customTableCaption.length <= 100 && customTableCaption.length > 0 && ' ✓'}
                        {customTableCaption.length > 125 && ' ⚠️ Too long'}
                      </div>
                      
                      {validationResult && (
                        <div className={`text-[11px] ${validationResult.isValid ? 'text-[#34c759]' : 'text-[#ff3b30]'} flex items-center gap-1`}>
                            {validationResult.isValid ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            {validationResult.message}
                        </div>
                      )}
                    </div>

                    {/* AI Suggestions Section - Collapsible Accordion */}
                    {aiSuggestions.length > 0 && (
                      <div className="mt-3 border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                        <button
                          onClick={() => toggleSection('suggestions')}
                          className="w-full px-4 py-3 flex items-center justify-between bg-[#EEECE8] hover:bg-[#E4E2DE] transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Wand2 className="w-[18px] h-[18px] text-[#0071e3]" strokeWidth={1.5} />
                            <span className="text-[13px] font-semibold text-[#1d1d1f]">AI Suggested Captions</span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-[#636366] transition-transform ${expandedSections.has('suggestions') ? '' : '-rotate-90'}`} />
                        </button>
                        <AnimatePresence>
                          {expandedSections.has('suggestions') && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 space-y-2 bg-[#EEECE8]">
                                {aiSuggestions.map((suggestion, index) => {
                                  const isSelected = customTableCaption === suggestion.text;
                                  const levelLabel = suggestion.level === 'brief' ? '📝 Brief' :
                                                   suggestion.level === 'moderate' ? '⚡ Recommended' :
                                                   '📋 Detailed';
                                  const isRecommended = suggestion.level === 'moderate';

                                  return (
                                    <button
                                      key={index}
                                      onClick={() => {
                                        setCustomTableCaption(suggestion.text);
                                        setSelectedSuggestion(suggestion.text);
                                      }}
                                      className={`w-full text-left px-3 py-2.5 rounded-[8px] transition-all border-2 ${
                                        isSelected
                                          ? 'bg-white border-[#0071e3]'
                                          : isRecommended
                                          ? 'bg-white border-[#0071e3]/20 hover:border-[#0071e3]/40'
                                          : 'bg-white border-[#d2d2d7] hover:bg-white'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <div className={`text-[11px] font-semibold uppercase ${
                                          isRecommended ? 'text-[#0071e3]' : 'text-[#636366]'
                                        }`}>
                                          {levelLabel}
                                        </div>
                                        {isSelected && (
                                          <CheckCircle className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
                                        )}
                                        {!isSelected && isRecommended && (
                                          <button className="text-[11px] text-[#0071e3] font-medium hover:underline" onClick={(e) => {
                                            e.stopPropagation();
                                            setCustomTableCaption(suggestion.text);
                                            setSelectedSuggestion(suggestion.text);
                                          }}>
                                            Use This
                                          </button>
                                        )}
                                      </div>
                                      <div className="text-[13px] text-[#1d1d1f] leading-snug">
                                        {suggestion.text}
                                      </div>
                                      <div className="text-[11px] text-[#636366] mt-1">
                                        {suggestion.text.length} characters
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="px-4 pb-3 bg-[#EEECE8]">
                                <div className="text-[11px] text-[#636366] text-center">
                                  💡 Click a suggestion to use it, or write your own above
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Writing Tips - Collapsible Accordion */}
                    <div className="mt-3 border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                      <button
                        onClick={() => toggleSection('tips')}
                        className="w-full px-4 py-3 flex items-center justify-between bg-[#EEECE8] hover:bg-[#E4E2DE] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-[18px] h-[18px] text-[#0071e3]" strokeWidth={1.5} />
                          <span className="text-[13px] font-semibold text-[#1d1d1f]">Writing Tips</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[#636366] transition-transform ${expandedSections.has('tips') ? '' : '-rotate-90'}`} />
                      </button>
                      <AnimatePresence>
                        {expandedSections.has('tips') && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 py-3 bg-white">
                              <div className="text-[11px] text-[#1d1d1f] space-y-1.5">
                                <div className="flex items-start gap-1.5">
                                  <span className="text-[#34c759] flex-shrink-0 mt-0.5">✓</span>
                                  <span>Describe the <strong>purpose</strong> and <strong>content</strong></span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <span className="text-[#34c759] flex-shrink-0 mt-0.5">✓</span>
                                  <span>Include what data is being compared</span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <span className="text-[#34c759] flex-shrink-0 mt-0.5">✓</span>
                                  <span>Be clear and concise (under 150 chars)</span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <span className="text-[#ff3b30] flex-shrink-0 mt-0.5">✗</span>
                                  <span>Don't just say "Table" or "Data Table"</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Examples - Collapsible Accordion */}
                    <div className="mt-3 border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                      <button
                        onClick={() => toggleSection('examples')}
                        className="w-full px-4 py-3 flex items-center justify-between bg-[#EEECE8] hover:bg-[#E4E2DE] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-[18px] h-[18px] text-[#0071e3]" strokeWidth={1.5} />
                          <span className="text-[13px] font-semibold text-[#1d1d1f]">Examples</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[#636366] transition-transform ${expandedSections.has('examples') ? '' : '-rotate-90'}`} />
                      </button>
                      <AnimatePresence>
                        {expandedSections.has('examples') && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 py-3 bg-white">
                              <div className="text-[11px] text-[#1d1d1f] space-y-2">
                                <div>
                                  <span className="text-[#ff3b30] font-medium">❌ Bad:</span> "Table"
                                </div>
                                <div>
                                  <span className="text-[#34c759] font-medium">✅ Good:</span> "Student enrollment by major for Fall 2024"
                                </div>
                                <div className="pt-2 border-t border-[#e5e5ea]">
                                  <span className="text-[#ff3b30] font-medium">❌ Bad:</span> "Data"
                                </div>
                                <div>
                                  <span className="text-[#34c759] font-medium">✅ Good:</span> "Comparison of assignment scores across three sections"
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Preview Fix Section - For table-headers issues, only if confirmed as data table */}
                {issue?.category === 'table-headers' && issue.elementHtml && isDataTable === true && (
                  <div className="mb-4">
                    <div className="text-[14px] font-semibold text-[#1d1d1f] mb-2">Preview Fix</div>
                    
                    {/* After (Fixed) - Only showing the header row */}
                    <div>
                      <div className="text-[11px] font-semibold text-[#34c759] mb-1.5 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        AFTER (Fixed)
                      </div>
                      <div className="border border-[#34c759]/20 rounded-[10px] p-2.5 bg-white">
                        <div 
                          className="canvas-content-display text-[13px]"
                          dangerouslySetInnerHTML={{ 
                            __html: (() => {
                              // Generate preview showing only the first row (header) with th tags
                              const parser = new DOMParser();
                              const doc = parser.parseFromString(issue.elementHtml, 'text/html');
                              const table = doc.querySelector('table');
                              if (table) {
                                const firstRow = table.querySelector('tr');
                                if (firstRow) {
                                  // Convert td to th
                                  const cells = firstRow.querySelectorAll('td');
                                  cells.forEach(cell => {
                                    const newCell = doc.createElement('th');
                                    newCell.innerHTML = cell.innerHTML;
                                    newCell.className = cell.className;
                                    // Add compact styling to make cells tight
                                    newCell.style.fontWeight = 'bold';
                                    newCell.style.padding = '4px 8px';
                                    newCell.style.lineHeight = '1.3';
                                    newCell.style.height = 'auto';
                                    newCell.removeAttribute('height');
                                    cell.replaceWith(newCell);
                                  });
                                  
                                  // Create a new table with just the header row
                                  const previewTable = doc.createElement('table');
                                  previewTable.className = table.className;
                                  // Override any height styles from Canvas
                                  const existingStyle = table.getAttribute('style') || '';
                                  const cleanedStyle = existingStyle.replace(/height:\s*[^;]+;?/gi, '');
                                  previewTable.setAttribute('style', cleanedStyle);
                                  
                                  // Force compact row
                                  firstRow.style.height = 'auto';
                                  firstRow.removeAttribute('height');
                                  
                                  // Wrap first row in thead
                                  const thead = doc.createElement('thead');
                                  thead.appendChild(firstRow.cloneNode(true));
                                  previewTable.appendChild(thead);
                                  
                                  return previewTable.outerHTML;
                                }
                              }
                              return table?.outerHTML || issue.elementHtml;
                            })()
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-[#34c759] mt-1">
                        ✅ First row uses &lt;th&gt; tags (accessible)
                      </div>
                    </div>
                  </div>
                )}
                {/* Steps to Fix Accordion - for manual fixes only, shown after Writing Tips/Examples */}
                {!issue.autoFixAvailable && !isAIRewriteIssue && !isTemplateIssue && issue.fixSteps && issue.fixSteps.length > 0 && (
                  <div className="mt-3 border border-[#d2d2d7] rounded-[10px] overflow-hidden">
                    <button
                      onClick={() => toggleSection('fix-steps')}
                      className="w-full px-4 py-3 flex items-center justify-between bg-[#EEECE8] hover:bg-[#E4E2DE] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ListOrdered className="w-[18px] h-[18px] text-[#0071e3]" strokeWidth={1.5} />
                        <span className="text-[13px] font-semibold text-[#1d1d1f]">Steps to Fix</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#636366] transition-transform ${expandedSections.has('fix-steps') ? '' : '-rotate-90'}`} />
                    </button>
                    <AnimatePresence>
                      {expandedSections.has('fix-steps') && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 py-3 border-t border-[#d2d2d7] bg-white">
                            <ol className="space-y-2">
                              {issue.fixSteps.filter(s => s.trim()).map((step, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#1d1d1f]">
                                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#EEECE8] border border-[#e5e5e7] flex items-center justify-center text-[10px] font-semibold text-[#636366] mt-0.5">{i + 1}</span>
                                  <span className="leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer Actions - Fixed at bottom */}
              <div className="px-5 py-3 border-t border-[#d2d2d7] flex-shrink-0">
                {/* DEBUG LOGGING FOR OBJECTIVES ISSUES */}
                {(() => {
                  if (isObjectivesIssue) {
                  }
                  return null;
                })()}
                
                {/* Staged issue: show Publish / Revert / Revert All */}
                {issue?.status === 'staged' ? (
                  <div className="flex gap-2">
                    {onPublishSingleIssue && (
                      <button
                        onClick={() => { if (issue) { onPublishSingleIssue(issue); onClose(); } }}
                        className="flex-1 h-[44px] rounded-[10px] text-white text-[15px] font-semibold transition-colors flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#1E2E4A' }}
                      >
                        <Send className="w-4 h-4" />
                        Publish
                      </button>
                    )}
                    {onRevertStagedFix && (
                      <button
                        onClick={() => { if (issue) { onRevertStagedFix(issue); onClose(); } }}
                        className="h-[44px] px-5 rounded-[10px] border border-[#d2d2d7] text-[#636366] hover:bg-[#f5f5f7] text-[14px] font-medium transition-colors"
                      >
                        Revert
                      </button>
                    )}
                    {stagedCount > 1 && onRevertAllStaged && (
                      <button
                        onClick={() => { onRevertAllStaged(); onClose(); }}
                        className="h-[44px] px-5 rounded-[10px] border border-[#ff3b30] text-[#ff3b30] hover:bg-[#ff3b30]/10 text-[14px] font-medium transition-colors"
                      >
                        Revert All ({stagedCount})
                      </button>
                    )}
                  </div>
                ) : (isAltTextIssue || isTableCaptionIssue) ? (
                  <div className="flex gap-2">
                    {/* If decorative is confirmed, show "Save & Close" in green */}
                    {!showDecorativePrompt && isDecorativeImage === true ? (
                      <>
                        <button
                          onClick={handleApplyFix}
                          disabled={isFixing}
                          className="flex-1 h-[44px] rounded-[10px] bg-[#34c759] hover:bg-[#2fb350] disabled:bg-[#34c759]/50 text-white text-[15px] font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          {isFixing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Save & Close
                            </>
                          )}
                        </button>
                        <button
                          onClick={onClose}
                          className="h-[44px] px-5 rounded-[10px] border border-[#d2d2d7] text-[#636366] hover:bg-[#f5f5f7] text-[14px] font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      /* Normal Save & Close button for alt text or table caption entry */
                      <>
                        <button
                          onClick={handleApplyFix}
                          disabled={
                            isFixing ||
                            (isAltTextIssue && !customAltText.trim()) ||
                            (isTableCaptionIssue && (!customTableCaption.trim() || isDataTable !== true)) ||
                            (isBrokenLinkIssue && (!replacementUrl.trim() || !customLinkText.trim())) ||
                            (validationResult && !validationResult.isValid)
                          }
                          className="flex-1 h-[44px] rounded-[10px] bg-[#0071e3] hover:bg-[#0077ed] disabled:bg-[#0071e3]/50 disabled:text-white/50 disabled:cursor-not-allowed text-white text-[15px] font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          {isFixing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Save & Close
                            </>
                          )}
                        </button>
                        {onIgnore && (
                          <button
                            onClick={handleIgnore}
                            className="h-[44px] px-5 rounded-[10px] border border-[#d2d2d7] text-[#636366] hover:bg-[#f5f5f7] text-[14px] font-medium transition-colors"
                          >
                            Ignore
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ) : isLayoutTableIssue ? (
                  // Layout table: fix is handled entirely inline — footer shows only Ignore (bottom right)
                  <div className="flex justify-end w-full">
                    {onIgnore && (
                      <button
                        onClick={handleIgnore}
                        className="h-[44px] px-5 rounded-[10px] border border-[#d2d2d7] text-[#636366] hover:bg-[#f5f5f7] text-[14px] font-medium transition-colors"
                      >
                        Ignore
                      </button>
                    )}
                  </div>
                ) : effectiveAutoFixAvailable ? (
                  <div className="flex gap-2">
                    {needsManualFix ? (
                      // Manual fix issues: show Mark as Resolved instead of Fix Now
                      <>
                        <button
                          onClick={() => onResolve && issue && onResolve(issue, "Manually resolved in Canvas")}
                          className="flex-1 h-[44px] rounded-[10px] bg-[#34c759] hover:bg-[#2db44d] text-white text-[15px] font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Mark as Resolved
                        </button>
                        {onIgnore && (
                          <button
                            onClick={handleIgnore}
                            className="h-[44px] px-5 rounded-[10px] border border-[#d2d2d7] text-[#636366] hover:bg-[#f5f5f7] text-[14px] font-medium transition-colors"
                          >
                            Ignore
                          </button>
                        )}
                      </>
                    ) : (
                      // Normal AI fix issues
                      <>
                        <button
                          onClick={() => {
                            if (isAltTextIssue && isDecorativeImage === true && onResolve && issue) {
                              onResolve(issue, "Marked as decorative image");
                            } else {
                              handleApplyFix();
                            }
                          }}
                          disabled={isFixing || (isTableHeadersIssue && isDataTable !== true) || (isObjectivesIssue && (isGeneratingObjectives || aiGeneratedObjectives.length === 0)) || ((isAIRewriteIssue || isTemplateIssue) && isRewritingContent) || ((isWelcomeIssue || isPeerInteractionIssue || isModuleDiscussionIssue) && !aiRewrittenContent.trim()) || (isCommGuidelinesIssue && !aiRewrittenContent.trim()) || (isPdfIssue && (!convertedPdfHtml.trim() || isConvertingPdf)) || (isAudioDescriptionIssue && (isGeneratingAD || adScript.length === 0))}
                          className="flex-1 h-[44px] rounded-[10px] bg-[#0071e3] hover:bg-[#0077ed] disabled:bg-[#0071e3]/50 text-white text-[15px] font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          {isFixing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                              {(isWelcomeIssue || isPeerInteractionIssue || isModuleDiscussionIssue) ? 'Adding...' : isCommGuidelinesIssue ? 'Adding to Syllabus...' : isPdfIssue ? 'Staging...' : isAltTextIssue && isDecorativeImage === true ? 'Resolving...' : 'Fixing...'}
                            </>
                          ) : isObjectivesIssue && isGeneratingObjectives ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              {isWelcomeIssue ? 'Add Announcement' : (isPeerInteractionIssue || isModuleDiscussionIssue) ? 'Add Discussion' : isCommGuidelinesIssue ? 'Add to Syllabus' : isPdfIssue ? 'Apply Fix' : isAudioDescriptionIssue ? 'Stage Text Alternative' : isAltTextIssue && isDecorativeImage === true ? 'Mark as Resolved' : 'Fix Now'}
                            </>
                          )}
                        </button>
                        {onIgnore && (
                          <button
                            onClick={handleIgnore}
                            className="h-[44px] px-5 rounded-[10px] border border-[#d2d2d7] text-[#636366] hover:bg-[#f5f5f7] text-[14px] font-medium transition-colors"
                          >
                            Ignore
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleApplyFix}
                      disabled={isFixing || !customLinkText.trim() || (validationResult && !validationResult.isValid)}
                      className="flex-1 h-[44px] rounded-[10px] bg-[#e5e5ea] hover:bg-[#d1d1d6] disabled:bg-[#e5e5ea] disabled:text-[#636366] disabled:cursor-not-allowed text-[#1d1d1f] text-[15px] font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isFixing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Apply Fix
                        </>
                      )}
                    </button>
                    <button
                      onClick={onClose}
                      className="h-[44px] px-6 rounded-[10px] border border-[#d2d2d7] text-[#636366] hover:bg-[#f5f5f7] text-[14px] font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Custom styles for issue highlighting */}
          <style>{`
            .canvas-content-display {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #1d1d1f;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            
            .canvas-content-display p {
              margin-bottom: 12px;
            }
            
            .canvas-content-display p:last-child {
              margin-bottom: 0;
            }
            
            .canvas-content-display a {
              color: #0071e3;
              text-decoration: underline;
              word-break: break-all;
              overflow-wrap: break-word;
            }
            
            .flagged-link {
              background-color: #fff5cc !important;
              padding: 2px 4px !important;
              border-radius: 4px !important;
              border: 1px solid #ffc107 !important;
              font-weight: 500 !important;
              display: inline;
            }
            
            .canvas-content-display .flagged-link a {
              color: #0071e3 !important;
              text-decoration: underline !important;
            }
            
            .canvas-content-display img {
              max-width: 100%;
              height: auto;
              border-radius: 6px;
            }
            
            .canvas-content-display table {
              border-collapse: collapse;
              width: 100%;
            }
            
            .canvas-content-display table td,
            .canvas-content-display table th {
              padding: 4px 6px !important;
              border: 1px solid #d2d2d7;
              text-align: left;
              vertical-align: top;
              line-height: 1.3 !important;
              height: auto !important;
              min-height: 0 !important;
              font-size: 13px !important;
            }
            
            .canvas-content-display table th {
              font-weight: 600;
              background-color: #EEECE8;
            }
            
            .canvas-content-display table p {
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .canvas-content-display * {
              max-width: 100%;
            }
            
            .flagged-link-wrapper {
              background-color: #fff5cc !important;
              padding: 2px 4px !important;
              border-radius: 4px !important;
              border: 1px solid #ffc107 !important;
              font-weight: 500 !important;
              display: inline;
              word-break: break-all;
              overflow-wrap: break-word;
            }
            
            .canvas-content-display .flagged-link-wrapper a {
              color: #0071e3 !important;
              text-decoration: underline !important;
              word-break: break-all !important;
              overflow-wrap: break-word !important;
            }
          `}</style>
        </>
      )}
      
      {/* AI Objectives Generator Modal */}
      {showObjectivesGenerator && issue && (
        <AIObjectivesGenerator
          moduleTitle={issue.location || 'Module'}
          moduleItems={parseModuleItems(issue.elementHtml || '')}
          onGenerate={handleObjectivesGenerated}
          onCancel={() => setShowObjectivesGenerator(false)}
        />
      )}
    </AnimatePresence>
  );
}

// Parse module items from elementHtml
function parseModuleItems(elementHtml: string): string[] {
  const items: string[] = [];
  
  // elementHtml contains lines like "ITEM: Title"
  const lines = elementHtml.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('ITEM:')) {
      items.push(trimmed.substring(5).trim());
    }
  }
  
  return items.length > 0 ? items : ['Reading materials', 'Assignments', 'Discussions'];
}

// Function to get issue explanation based on issue type
function getIssueExplanation(issue: ScanIssue): string {
  switch (issue.category) {
    case 'alt-text':
      return 'This image is missing alternative text. Screen readers cannot describe the image to blind or visually impaired students, making your content inaccessible.';
    
    case 'contrast':
      return 'The text has low color contrast, which makes it difficult to read for students with visual impairments or those viewing on mobile devices in bright light. WCAG requires a contrast ratio of at least 4.5:1 for normal text.';
    
    case 'video-caption':
      return 'This video does not have captions enabled. Captions are required for deaf and hard-of-hearing students, and also benefit ESL students and those in noisy environments.';
    
    case 'inconsistent-heading':
      return 'The heading hierarchy is incorrect. Screen readers use heading levels to help students navigate the page. Skipping heading levels (e.g., H1 to H3) makes navigation confusing.';
    
    case 'table-headers':
      return 'This table does not have proper header cells (<th> tags). Screen reader users rely on table headers to understand the structure and navigate between cells. Without headers, the table is inaccessible.';
    
    case 'table-caption':
      return 'This table is missing a caption that describes its purpose and content. According to CVC-OEI Design Standard D3, Peralta rubric, and Quality Matters 8.3, all data tables must include a clear caption. Captions help screen reader users understand the table before navigating through it.';
    
    case 'formatting':
      return 'The text uses a font size that is too small, making it difficult to read. WCAG recommends a minimum font size of 16px for body text to ensure readability.';
    
    case 'broken-link':
      return 'This link is broken or inaccessible. Students clicking this link will encounter an error, preventing them from accessing important course resources.';
    
    case 'pdf-tag':
      return 'This PDF may not be properly tagged for accessibility. Untagged PDFs cannot be read by screen readers, making them inaccessible to blind students.';
    
    case 'long-url':
      return 'This link displays a long URL as the link text instead of descriptive text. Screen readers will announce the entire URL character-by-character, which is confusing and time-consuming for users. According to WCAG 2.4.4 (Link Purpose), CVC-OEI Design Standards, Peralta rubric, and Quality Matters 8.2, links must have meaningful text that describes the destination. Replace the URL with descriptive text like "APA Citation Guide" or "Purdue OWL Writing Resources."';

    case 'instructions':
      return 'Students cannot complete the assignment successfully without knowing what to do, how to submit, or what quality looks like. Clear instructions reduce confusion and support equity.';

    case 'plain-language':
      return 'Dense or jargon-heavy instructions create barriers for non-native English speakers, students with learning disabilities, and first-generation college students. Plain language improves completion rates.';

    case 'readability':
      return 'Long unbroken text blocks are harder to scan and comprehend, especially on mobile devices. Breaking content into shorter chunks with headings improves reading and retention.';

    case 'confusing-navigation':
      return 'When assignment instructions are unclear or very short, students may submit incomplete work, miss requirements, or feel unsupported. Brief instructions often signal missing context.';

    case 'assessment-criteria':
      return 'Without a rubric or grading criteria, students cannot judge the quality of their own work before submitting. This creates anxiety and often leads to lower-quality submissions.';

    case 'assessment-guidance':
      return 'Minimal instructions leave students uncertain about what they need to do, what format to use, or how to submit. This disproportionately affects first-generation students.';

    case 'assessment-variety':
      return 'Relying on a single assessment type disadvantages students whose strengths align with other formats. Multiple assessment types measure learning more fairly and completely.';

    case 'assessment-frequency':
      return 'Without low-stakes practice activities, students go into high-stakes assessments without feedback or a chance to gauge their understanding. Formative assessment improves outcomes.';

    case 'instructor-contact':
      return 'Students in online courses need to feel a human presence from their instructor. A welcome message and clear communication policies reduce anxiety and improve persistence.';

    case 'student-interaction':
      return 'Peer interaction is essential for online learning equity. Without collaborative activities, students lose opportunities for diverse perspectives and community building.';

    case 'policies':
      return 'Students need clear course policies to understand their rights and responsibilities. Missing policies (grading, late work, accommodations) create confusion and legal risk.';

    case 'learner-support':
      return 'Anonymous feedback mechanisms allow students to communicate concerns they may be too anxious to share directly, helping instructors improve the course mid-semester.';

    case 'institutional-support':
      return 'First-generation and underrepresented students are less likely to seek help if support resources are not explicitly introduced in the course context.';

    case 'structure':
      return 'Pages without headings are hard to scan and navigate. Screen reader users rely on headings to move through content efficiently. Heading structure also clarifies the page logic for all students.';

    case 'deep-nav':
      return 'Deeply nested navigation or overly complex page structure makes it hard for students to find content and understand the course flow, increasing cognitive load.';

    default:
      return issue.description;
  }
}

// Function to validate link text
function validateLinkText(text: string): { isValid: boolean; message: string } {
  // Check if empty
  if (!text || text.trim().length === 0) {
    return { isValid: false, message: 'Please enter link text' };
  }

  // Check if it's a URL (we want descriptive text, NOT URLs)
  const urlPattern = /(https?:\/\/|www\.|\.com|\.org|\.edu|\.net)/i;
  if (urlPattern.test(text)) {
    return { isValid: false, message: 'Link text should be descriptive, not a URL' };
  }

  // Check length (3-50 characters)
  if (text.trim().length < 3) {
    return { isValid: false, message: 'Link text must be at least 3 characters' };
  }
  if (text.trim().length > 50) {
    return { isValid: false, message: 'Link text must be less than 50 characters' };
  }

  // Check for non-descriptive phrases
  const nonDescriptivePatterns = [
    /^click here$/i,
    /^link$/i,
    /^read more$/i,
    /^more$/i,
    /^here$/i,
    /^this$/i,
    /^download$/i
  ];

  for (const pattern of nonDescriptivePatterns) {
    if (pattern.test(text.trim())) {
      return { isValid: false, message: 'Please use more descriptive text (avoid "click here", "link", etc.)' };
    }
  }

  // Check for excessive special characters
  const specialCharCount = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  if (specialCharCount > text.length * 0.3) {
    return { isValid: false, message: 'Too many special characters - use plain descriptive text' };
  }

  // All checks passed!
  return { isValid: true, message: '✓ Good descriptive link text' };
}

// Function to validate alt text
function validateAltText(text: string): { isValid: boolean; message: string } {
  // Check if empty
  if (!text || text.trim().length === 0) {
    return { isValid: false, message: 'Please enter alt text' };
  }

  // Check length (3-100 characters)
  if (text.trim().length < 3) {
    return { isValid: false, message: 'Alt text must be at least 3 characters' };
  }
  if (text.trim().length > 100) {
    return { isValid: false, message: 'Alt text must be less than 100 characters' };
  }

  // Check for excessive special characters
  const specialCharCount = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  if (specialCharCount > text.length * 0.3) {
    return { isValid: false, message: 'Too many special characters - use plain descriptive text' };
  }

  // All checks passed!
  return { isValid: true, message: '✓ Good alt text' };
}

// Function to validate table caption
function validateTableCaption(text: string): { isValid: boolean; message: string } {
  // Check if empty
  if (!text || text.trim().length === 0) {
    return { isValid: false, message: 'Please enter a table caption' };
  }

  // Check length (3-150 characters)
  if (text.trim().length < 3) {
    return { isValid: false, message: 'Table caption must be at least 3 characters' };
  }
  if (text.trim().length > 150) {
    return { isValid: false, message: 'Table caption must be less than 150 characters' };
  }

  // Check for excessive special characters
  const specialCharCount = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  if (specialCharCount > text.length * 0.3) {
    return { isValid: false, message: 'Too many special characters - use plain descriptive text' };
  }

  // All checks passed!
  return { isValid: true, message: '✓ Good table caption' };
}