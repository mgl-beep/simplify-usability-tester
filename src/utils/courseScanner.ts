import type { ScanIssue } from "../App";
import {
  getCanvasConfig,
  getCoursePages,
  getPage,
  getCourseAssignments,
  getCourseFrontPage,
  getCourseAnnouncements,
  getCourseModules,
  getCourseDiscussions,
  getCourseQuizzes,
  getCanvasDomain
} from "./canvasAPI";
import { scanAccessibility } from "./scanners/accessibilityScanner";
import { scanUsability } from "./scanners/usabilityScanner";
import { scanDesign } from "./scanners/designScanner";
import { scanAudioDescription } from "./scanners/audioDescriptionScanner";
import { scanLinkAccessibility } from "./scanners/linkAccessibilityScanner";
import { scanCVCOEIRubric } from "./scanners/cvcOeiRubricScanner";
import { getStandardsTagsForIssue } from "./standards/standardsMapping";

// CVC-OEI Course Design Rubric Standards
// Source: https://onlinenetworkofeducators.org/course-design-academy/
const CVC_OEI_STANDARDS = {
  "A.1": "Course Overview and Information",
  "A.2": "Alignment with Course Description",
  "A.3": "Learning Objectives/Outcomes",
  "A.4": "Assessments",
  "A.5": "Instructional Materials",
  "A.6": "Learner Interaction",
  "A.7": "Accessibility and Universal Design",
  "A.8": "Content Presentation"
};

// Peralta Online Equity Rubric Standards
const PERALTA_STANDARDS = {
  "E.1": "Equitable Access to Technology",
  "E.2": "Inclusive Content and Perspectives",
  "E.3": "Cultural Responsiveness",
  "E.4": "Accessibility for All Learners",
  "E.5": "Clear Communication"
};

/**
 * Scans an imported course from Supabase for accessibility, usability, and design issues
 */
export async function scanImportedCourse(
  courseId: string,
  courseName: string,
  enabledStandards: string[] = ['cvc-oei', 'peralta', 'quality-matters']
): Promise<ScanIssue[]> {
  
  const issues: ScanIssue[] = [];

  try {
    // Fetch course data from Supabase
    const { getCourse } = await import('./api');
    const { course } = await getCourse(courseId);

    if (!course || !course.courseData) {
      console.warn('⚠️ Course not found in Supabase');
      return [];
    }

    // Get pages and assignments from IMSCC course data
    const pages = course.courseData.pages || [];
    const assignments = course.courseData.assignments || [];
    const frontPage = course.courseData.frontPage;

    // Check if we got any content at all
    if (pages.length === 0 && assignments.length === 0 && !frontPage) {
      console.warn('⚠️ No scannable content found in imported course.');
      
      // If there are resources but no extracted pages, try to scan resources directly
      if (course.courseData.resources && course.courseData.resources.length > 0) {
        // TODO: Could scan resources here if needed
      }
      
      // Generate sample issues for demo purposes
      return generateSampleIssues(courseId, courseName);
    }

    // Scan front page if it exists
    if (frontPage) {
      try {
        const location = 'Home Page';
        
        const frontPageIssues = await Promise.all([
          scanAccessibility(frontPage, location, courseId, courseName, 'front-page', 'page'),
          scanUsability(frontPage, location, courseId, courseName, 'front-page', 'page'),
          scanDesign(frontPage, location, courseId, courseName, 'front-page', 'page'),
          scanAudioDescription(frontPage, location, courseId, courseName, 'front-page', 'page')
        ]);
        
        frontPageIssues.flat().forEach(issue => {
          issues.push(issue);
        });
      } catch (error) {
        console.error(`⚠️ Error scanning front page:`, error);
      }
    }

    // Scan all pages
    if (pages.length > 0) {
      for (const page of pages) {
        if (page.body) {
          try {
            const location = `Page: ${page.title}`;
            
            const pageIssues = await Promise.all([
              scanAccessibility(page.body, location, courseId, courseName, page.identifier, 'page'),
              scanUsability(page.body, location, courseId, courseName, page.identifier, 'page'),
              scanDesign(page.body, location, courseId, courseName, page.identifier, 'page'),
              scanAudioDescription(page.body, location, courseId, courseName, page.identifier, 'page')
            ]);
            
            pageIssues.flat().forEach(issue => {
              issues.push(issue);
            });
          } catch (error) {
            console.error(`⚠️ Error scanning page "${page.title}":`, error);
          }
        }
      }
    }

    // Scan all assignments
    if (assignments.length > 0) {
      for (const assignment of assignments) {
        if (assignment.description) {
          try {
            const location = `Assignment: ${assignment.title}`;
            
            const assignmentIssues = await Promise.all([
              scanAccessibility(assignment.description, location, courseId, courseName, assignment.identifier, 'assignment'),
              scanUsability(assignment.description, location, courseId, courseName, assignment.identifier, 'assignment'),
              scanDesign(assignment.description, location, courseId, courseName, assignment.identifier, 'assignment'),
              scanAudioDescription(assignment.description, location, courseId, courseName, assignment.identifier, 'assignment')
            ]);
            
            assignmentIssues.flat().forEach(issue => {
              issues.push(issue);
            });
          } catch (error) {
            console.error(`⚠️ Error scanning assignment "${assignment.title}":`, error);
          }
        }
      }
    }

    return issues;
    
  } catch (error) {
    console.error('❌ Error scanning imported course:', error);
    
    // Fall back to generating sample issues for demo
    return generateSampleIssues(courseId, courseName);
  }
}

/**
 * Generate sample issues for demo/testing purposes
 */
function generateSampleIssues(courseId: string, courseName: string): ScanIssue[] {
  return [
    {
      id: `demo-1-${courseId}`,
      type: 'accessibility',
      category: 'alt-text',
      severity: 'high',
      title: 'Missing Alt Text on Image',
      description: 'An image in the course homepage is missing alternative text for screen readers.',
      location: 'Home Page',
      autoFixAvailable: true,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      contentType: 'page',
      contentId: 'home',
      rubricStandard: 'A.7',
      standardsTags: getStandardsTagsForIssue('alt-text'),
      elementHtml: '<img src=\"course-banner.jpg\">',
      suggestedFix: 'Add descriptive alt text to the image',
      isDemo: true, // Mark as demo issue
    },
    {
      id: `demo-2-${courseId}`,
      type: 'accessibility',
      category: 'contrast',
      severity: 'medium',
      title: 'Low Color Contrast',
      description: 'Text color does not meet WCAG 2.2 AA contrast requirements (found 3.2:1, needs 4.5:1).',
      location: 'Module 1: Introduction',
      autoFixAvailable: true,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      contentType: 'page',
      contentId: 'module-1',
      rubricStandard: 'A.7',
      standardsTags: getStandardsTagsForIssue('contrast'),
      elementHtml: '<p style=\"color: #888888;\">Important instructions</p>',
      suggestedFix: 'Change text color to #666666 or darker',
      isDemo: true, // Mark as demo issue
    },
    {
      id: `demo-3-${courseId}`,
      type: 'usability',
      category: 'inconsistent-heading',
      severity: 'medium',
      title: 'Inconsistent Heading Structure',
      description: 'Heading jumps from H1 to H3, skipping H2. This disrupts logical flow and screen reader navigation.',
      location: 'Syllabus',
      autoFixAvailable: true,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      contentType: 'page',
      contentId: 'syllabus',
      rubricStandard: 'A.8',
      standardsTags: getStandardsTagsForIssue('inconsistent-heading'),
      elementHtml: '<h1>Course Syllabus</h1><h3>Grading Policy</h3>',
      suggestedFix: 'Change H3 to H2',
      isDemo: true, // Mark as demo issue
    },
    {
      id: `demo-4-${courseId}`,
      type: 'accessibility',
      category: 'video-caption',
      severity: 'high',
      title: 'Video Missing Captions',
      description: 'Embedded video does not have captions, required for WCAG 2.2 AA compliance.',
      location: 'Week 1 Lecture',
      autoFixAvailable: false,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      contentType: 'page',
      contentId: 'week-1',
      rubricStandard: 'A.7',
      standardsTags: getStandardsTagsForIssue('video-caption'),
      suggestedFix: 'Upload caption file (WebVTT format) to video',
      fixSteps: [
        'Download video',
        'Generate captions using YouTube or Rev.com',
        'Upload .vtt file to Canvas',
        'Associate captions with video'
      ],
      isDemo: true, // Mark as demo issue
    },
    {
      id: `demo-5-${courseId}`,
      type: 'usability',
      category: 'broken-link',
      severity: 'high',
      title: 'Broken External Link',
      description: 'Link returns 404 error. Students cannot access the referenced resource.',
      location: 'Assignment 2: Research Project',
      autoFixAvailable: true,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      contentType: 'assignment',
      contentId: 'assignment-2',
      rubricStandard: 'A.5',
      standardsTags: getStandardsTagsForIssue('broken-link'),
      elementHtml: '<a href=\"https://example.com/old-resource\">Click here</a>',
      suggestedFix: 'Replace with a valid URL and descriptive link text',
      isDemo: true, // Mark as demo issue
    }
  ];
}

/**
 * Scans a Canvas course for accessibility, usability, and design issues
 * Fetches real course content and analyzes against WCAG 2.2 AA and CVC-OEI rubric
 */
export async function scanCanvasCourse(
  courseId: string,
  courseName: string,
  enabledStandards: string[] = ['cvc-oei', 'peralta', 'quality-matters']
): Promise<ScanIssue[]> {
  
  // Validate courseId can be parsed as a number
  const courseIdNum = parseInt(courseId);
  if (isNaN(courseIdNum)) {
    const errorMsg = `Invalid course ID: "${courseId}" cannot be parsed as a number`;
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }
  
  const issues: ScanIssue[] = [];
  const allHtmlContent: { html: string; location: string; contentId: string; contentType: string }[] = [];
  const domain = getCanvasDomain();

  try {
    const config = getCanvasConfig();
    
    if (!config) {
      console.error('❌ Canvas config not found');
      throw new Error('Canvas not configured. Please connect to Canvas first.');
    }

    // Fetch all course content with error handling for each type
    let pages: any[] = [];
    let assignments: any[] = [];
    let frontPage: any = null;
    let announcements: any[] = [];
    let modules: any[] = [];
    let discussions: any[] = [];
    let quizzes: any[] = [];

    // Fetch pages
    try {
      pages = await getCoursePages(config, courseIdNum);
      if (pages.length > 0) {
      }
    } catch (error) {
      console.error('⚠️ Error fetching pages:', error);
      // Continue with empty pages array
    }
    
    // Fetch assignments
    try {
      assignments = await getCourseAssignments(config, courseIdNum);
    } catch (error) {
      console.error('⚠️ Error fetching assignments:', error);
      // Continue with empty assignments array
    }
    
    // Fetch front page
    try {
      frontPage = await getCourseFrontPage(config, courseIdNum);
      if (frontPage) {
      }
    } catch (error) {
      console.error('⚠️ Error fetching front page:', error);
      // Continue without front page
    }
    
    // Fetch announcements
    try {
      announcements = await getCourseAnnouncements(config, courseIdNum);
    } catch (error) {
      console.error('⚠️ Error fetching announcements:', error);
      // Continue with empty announcements array
    }

    // Fetch modules
    try {
      modules = await getCourseModules(config, courseIdNum);
    } catch (error) {
      console.error('⚠️ Error fetching modules:', error);
      // Continue with empty modules array
    }

    // Fetch discussions
    try {
      discussions = await getCourseDiscussions(config, courseIdNum);
    } catch (error) {
      console.error('⚠️ Error fetching discussions:', error);
      // Continue with empty discussions array
    }

    // Fetch quizzes
    try {
      quizzes = await getCourseQuizzes(config, courseIdNum);
    } catch (error) {
      console.error('⚠️ Error fetching quizzes:', error);
      // Continue with empty quizzes array
    }

    // --- Module scoping ---
    // Only scan content that is actually linked inside a module.
    // Students navigate via modules; orphaned content creates noise.
    const modulePageUrls = new Set<string>();
    const moduleAssignmentIds = new Set<string>();
    const moduleDiscussionIds = new Set<string>();
    const moduleQuizIds = new Set<string>();

    for (const module of modules) {
      for (const item of (module.items || [])) {
        switch (item.type) {
          case 'Page':
            if (item.page_url) modulePageUrls.add(item.page_url);
            break;
          case 'Assignment':
            if (item.content_id) moduleAssignmentIds.add(item.content_id.toString());
            break;
          case 'Discussion':
            if (item.content_id) moduleDiscussionIds.add(item.content_id.toString());
            break;
          case 'Quiz':
            if (item.content_id) moduleQuizIds.add(item.content_id.toString());
            break;
          case 'File':
            // DISABLED: PDF conversion feature is WIP, re-enable when ready
            if (false && item.title && item.title.toLowerCase().endsWith('.pdf')) {
              issues.push({
                id: `pdf-tag-${courseId}-module-${module.id}-${item.id}`,
                type: 'accessibility',
                category: 'pdf-tag',
                severity: 'medium',
                title: 'PDF Accessibility Check Required',
                description: `PDF file "${item.title}" needs to be checked for accessibility (proper tagging, OCR for scanned documents).`,
                location: `Module: ${module.name}`,
                autoFixAvailable: true,
                courseName: courseName,
                courseId: courseId,
                status: 'pending',
                rubricStandard: 'CVC-OEI Course Design Rubric - Standard 3.3 (Document Accessibility)',
                standardsTags: getStandardsTagsForIssue('pdf-tag'),
                contentType: 'file',
                contentId: item.content_id?.toString() || item.id.toString(),
                moduleId: module.id.toString(),
                elementHtml: `<a href="${item.html_url || ''}">${item.title}</a>`,
                suggestedFix: 'Convert PDF to an accessible HTML page using AI',
                fixSteps: [
                  '1. Click "Convert to Accessible Page"',
                  '2. AI will extract the text and create structured HTML',
                  '3. Review and edit the preview if needed',
                  '4. Click "Apply Fix" to stage the change',
                  '5. Publish to create a new accessible page in the same module'
                ]
              });
            }
            break;
        }
      }
    }

    // Exclude the front page from module-scoped pages — it's already scanned separately as "Home Page"
    const moduleScopedPages = pages.filter(p => modulePageUrls.has(p.url) && (!frontPage || p.url !== frontPage.url));
    const moduleScopedAssignments = assignments.filter(a => moduleAssignmentIds.has(a.id.toString()));
    const moduleScopedDiscussions = discussions.filter(d => moduleDiscussionIds.has(d.id.toString()));
    const moduleScopedQuizzes = quizzes.filter(q => moduleQuizIds.has(q.id.toString()));

    // Check if we got any content at all
    if (moduleScopedPages.length === 0 && moduleScopedAssignments.length === 0 && !frontPage && modules.length === 0 && moduleScopedDiscussions.length === 0 && moduleScopedQuizzes.length === 0) {
      // Return empty array - no content means no issues
      return [];
    }

    // Scan front page/home page
    if (frontPage && frontPage.body) {
      try {
        
        const canvasUrl = `https://${domain}/courses/${courseId}/pages/${frontPage.url}/edit`;
        
        const fpContentId = frontPage.page_id?.toString() || 'front';
        allHtmlContent.push({ html: frontPage.body, location: 'Home Page', contentId: fpContentId, contentType: 'page' });

        const frontPageIssues = await Promise.all([
          scanAccessibility(frontPage.body, `Home Page`, courseId, courseName, fpContentId, 'page'),
          scanUsability(frontPage.body, `Home Page`, courseId, courseName, fpContentId, 'page'),
          scanDesign(frontPage.body, `Home Page`, courseId, courseName, fpContentId, 'page'),
          scanAudioDescription(frontPage.body, `Home Page`, courseId, courseName, fpContentId, 'page')
        ]);

        frontPageIssues.flat().forEach(issue => {
          issues.push({ ...issue, canvasUrl });
        });
      } catch (error) {
        console.error('⚠️ Error scanning front page:', error);
      }
    }

    // Scan module-scoped pages only
    if (moduleScopedPages.length > 0) {

      // Helper: fetch with a hard timeout so one bad page can never stall the whole scan
      const fetchBodyWithTimeout = async (page: any): Promise<string> => {
        if (page.body) return page.body;
        const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 8000));
        try {
          const result = await Promise.race([
            getPage(config, courseIdNum, page.url),
            timeout
          ]);
          if (!result) {
            console.warn(`⏱️ "${page.title}" timed out — skipping`);
            return '';
          }
          return (result as any).body || '';
        } catch (err) {
          console.error(`❌ "${page.title}" fetch error:`, err);
          return '';
        }
      };

      // Fetch all bodies in parallel
      const bodies = await Promise.all(moduleScopedPages.map(fetchBodyWithTimeout));

      // Scan each page that returned content
      for (let i = 0; i < moduleScopedPages.length; i++) {
        const page = moduleScopedPages[i];
        const body = bodies[i];
        if (!body) {
          console.warn(`⚠️ Skipping "${page.title}" — no body`);
          continue;
        }
        const imgCount = (body.match(/<img/gi) || []).length;
        try {
          const canvasUrl = `https://${domain}/courses/${courseId}/pages/${page.url}/edit`;
          const location = `Page: ${page.title}`;
          const pageContentId = page.url || page.page_id?.toString() || page.title;
          allHtmlContent.push({ html: body, location, contentId: pageContentId, contentType: 'page' });
          const pageIssues = await Promise.all([
            scanAccessibility(body, location, courseId, courseName, pageContentId, 'page'),
            scanUsability(body, location, courseId, courseName, pageContentId, 'page'),
            scanDesign(body, location, courseId, courseName, pageContentId, 'page'),
            scanAudioDescription(body, location, courseId, courseName, pageContentId, 'page')
          ]);
          pageIssues.flat().forEach(issue => issues.push({ ...issue, canvasUrl }));
        } catch (error) {
          console.error(`⚠️ Error scanning page "${page.title}":`, error);
        }
      }
    }

    // Scan module-scoped assignments only
    if (moduleScopedAssignments.length > 0) {
      for (const assignment of moduleScopedAssignments) {
        if (assignment.description) {
          try {
            const canvasUrl = `https://${domain}/courses/${courseId}/assignments/${assignment.id}/edit`;
            const location = `Assignment: ${assignment.name}`;
            allHtmlContent.push({ html: assignment.description, location, contentId: assignment.id.toString(), contentType: 'assignment' });

            const assignmentIssues = await Promise.all([
              scanAccessibility(assignment.description, location, courseId, courseName, assignment.id.toString(), 'assignment'),
              scanUsability(assignment.description, location, courseId, courseName, assignment.id.toString(), 'assignment'),
              scanDesign(assignment.description, location, courseId, courseName, assignment.id.toString(), 'assignment'),
              scanAudioDescription(assignment.description, location, courseId, courseName, assignment.id.toString(), 'assignment')
            ]);
            
            assignmentIssues.flat().forEach(issue => {
              issues.push({ ...issue, canvasUrl });
            });
          } catch (error) {
            console.error(`⚠️ Error scanning assignment "${assignment.name}":`, error);
          }
        }
      }
    }

    // Announcements are not inside modules — skip HTML content scan.
    // (Announcements are still passed to the CVC-OEI rubric scanner below for course-level checks.)
    if (false && announcements.length > 0) {
      for (const announcement of announcements) {
        if (announcement.message) {
          try {
            const canvasUrl = `https://${domain}/courses/${courseId}/discussion_topics/${announcement.id}/edit`;
            const location = `Announcement: ${announcement.title}`;
            
            const announcementIssues = await Promise.all([
              scanAccessibility(announcement.message, location, courseId, courseName, announcement.id.toString(), 'announcement'),
              scanUsability(announcement.message, location, courseId, courseName, announcement.id.toString(), 'announcement'),
              scanDesign(announcement.message, location, courseId, courseName, announcement.id.toString(), 'announcement'),
              scanAudioDescription(announcement.message, location, courseId, courseName, announcement.id.toString(), 'announcement')
            ]);
            
            announcementIssues.flat().forEach(issue => {
              issues.push({ ...issue, canvasUrl });
            });
          } catch (error) {
            console.error(`⚠️ Error scanning announcement "${announcement.title}":`, error);
          }
        }
      }
    }

    // Scan modules
    if (modules.length > 0) {
      for (const module of modules) {
        if (module.description) {
          try {
            const canvasUrl = `https://${domain}/courses/${courseId}/modules/${module.id}/edit`;
            const location = `Module: ${module.name}`;
            
            const moduleIssues = await Promise.all([
              scanAccessibility(module.description, location, courseId, courseName, module.id.toString(), 'module'),
              scanUsability(module.description, location, courseId, courseName, module.id.toString(), 'module'),
              scanDesign(module.description, location, courseId, courseName, module.id.toString(), 'module')
            ]);
            
            moduleIssues.flat().forEach(issue => {
              issues.push({ ...issue, canvasUrl });
            });
          } catch (error) {
            console.error(`⚠️ Error scanning module "${module.name}":`, error);
          }
        }
      }
    }

    // Scan module-scoped discussions only
    if (moduleScopedDiscussions.length > 0) {
      for (const discussion of moduleScopedDiscussions) {
        if (discussion.message) {
          try {
            const canvasUrl = `https://${domain}/courses/${courseId}/discussion_topics/${discussion.id}/edit`;
            const location = `Discussion: ${discussion.title}`;
            allHtmlContent.push({ html: discussion.message, location, contentId: discussion.id.toString(), contentType: 'discussion' });

            const discussionIssues = await Promise.all([
              scanAccessibility(discussion.message, location, courseId, courseName, discussion.id.toString(), 'discussion'),
              scanUsability(discussion.message, location, courseId, courseName, discussion.id.toString(), 'discussion'),
              scanDesign(discussion.message, location, courseId, courseName, discussion.id.toString(), 'discussion'),
              scanAudioDescription(discussion.message, location, courseId, courseName, discussion.id.toString(), 'discussion')
            ]);
            
            discussionIssues.flat().forEach(issue => {
              issues.push({ ...issue, canvasUrl });
            });
          } catch (error) {
            console.error(`⚠️ Error scanning discussion "${discussion.title}":`, error);
          }
        }
      }
    }

    // Scan module-scoped quizzes only
    if (moduleScopedQuizzes.length > 0) {
      for (const quiz of moduleScopedQuizzes) {
        if (quiz.description) {
          try {
            const canvasUrl = `https://${domain}/courses/${courseId}/quizzes/${quiz.id}/edit`;
            const location = `Quiz: ${quiz.title}`;
            
            const quizIssues = await Promise.all([
              scanAccessibility(quiz.description, location, courseId, courseName, quiz.id.toString(), 'quiz'),
              scanUsability(quiz.description, location, courseId, courseName, quiz.id.toString(), 'quiz'),
              scanDesign(quiz.description, location, courseId, courseName, quiz.id.toString(), 'quiz')
            ]);
            
            quizIssues.flat().forEach(issue => {
              issues.push({ ...issue, canvasUrl });
            });
          } catch (error) {
            console.error(`⚠️ Error scanning quiz "${quiz.title}":`, error);
          }
        }
      }
    }

    // Link accessibility audit — check external links for WCAG signals
    if (allHtmlContent.length > 0) {
      try {
        const linkIssues = await scanLinkAccessibility(allHtmlContent, courseId, courseName);
        issues.push(...linkIssues);
      } catch (error) {
        console.error('⚠️ Error running link accessibility audit:', error);
      }
    }

    // NEW: Run comprehensive CVC-OEI rubric scan for pedagogical issues
    try {
      // Only pass module-scoped content for HTML scanning — out-of-module content is ignored.
      // Front page is added back explicitly since it's excluded from moduleScopedPages but should still be scanned.
      const contentObject = {
        modules: modules,
        pages: [...(frontPage ? [frontPage] : []), ...moduleScopedPages],
        assignments: moduleScopedAssignments,
        discussions: moduleScopedDiscussions,
        quizzes: moduleScopedQuizzes,
        syllabus: frontPage,
        announcements: announcements,
        frontPage: frontPage
      };
      
      const rubricIssues = await scanCVCOEIRubric(
        contentObject,
        courseName,
        courseId,
        enabledStandards
      );
      
      // Merge with existing issues
      issues.push(...rubricIssues);
    } catch (error) {
      console.error('⚠️ Error running CVC-OEI rubric scan:', error);
      // Continue with existing issues even if rubric scan fails
    }

    return issues;
    
  } catch (error) {
    console.error('❌ Error scanning course:', error);
    // Re-throw with more helpful message
    if (error instanceof Error) {
      throw new Error(`Failed to scan course: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get rubric standard information
 */
export function getRubricStandard(standardCode: string): string {
  if (standardCode.startsWith("A.")) {
    return CVC_OEI_STANDARDS[standardCode as keyof typeof CVC_OEI_STANDARDS] || "Unknown Standard";
  }
  if (standardCode.startsWith("E.")) {
    return PERALTA_STANDARDS[standardCode as keyof typeof PERALTA_STANDARDS] || "Unknown Standard";
  }
  return "Unknown Standard";
}

/**
 * Get all rubric standards
 */
export function getAllStandards() {
  return {
    cvcOei: CVC_OEI_STANDARDS,
    peralta: PERALTA_STANDARDS
  };
}