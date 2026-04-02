import type { ScanIssue } from "../../App";
import { detectURLLikeLinks, detectBrokenLinks } from './linkDetector';
import { sanitizeHtmlForStorage } from '../htmlSanitizer';

/**
 * CVC-OEI Course Design Rubric Scanner
 * 
 * Implements rubric-locked scanning based ONLY on the specified criteria:
 * - A1-A3: Unit-Level Objectives
 * - A4-A8: Use of the CMS
 * - A9-A11: Learner Support (plain language + clarity)
 * - A12-A14: Institutional Support
 * - B1-B3: Instructor Contact
 * - B4-B6: Student-to-Student Interaction
 * - C1-C4: Effective Assessment
 * - C5-C8: Guidance and Feedback
 * - D: Accessibility (accessibility compliance elements)
 */

interface CourseContent {
  modules?: any[];
  pages?: any[];
  assignments?: any[];
  discussions?: any[];
  quizzes?: any[];
  files?: any[];
  syllabus?: any;
  announcements?: any[];
  frontPage?: any;
}

/**
 * Main CVC-OEI rubric scanner
 * @param content - Course content structure
 * @param courseName - Name of the course
 * @param courseId - ID of the course
 * @param enabledStandards - Array of enabled standard IDs (e.g., ['cvc-oei', 'peralta', 'quality-matters'])
 * @returns Array of scan issues
 */
export async function scanCVCOEIRubric(
  content: CourseContent,
  courseName: string,
  courseId: string,
  enabledStandards: string[] = ['cvc-oei', 'peralta', 'quality-matters']
): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = [];

  // Only scan if CVC-OEI is enabled
  if (!enabledStandards.includes('cvc-oei')) {
    return issues;
  }

  // SECTION A: Content Presentation
  issues.push(...scanSectionA(content, courseName, courseId));

  // SECTION B: Interaction
  issues.push(...scanSectionB(content, courseName, courseId));

  // SECTION C: Assessment
  issues.push(...scanSectionC(content, courseName, courseId));

  // SECTION D: Accessibility
  issues.push(...scanSectionD(content, courseName, courseId));

  return issues;
}

/**
 * SECTION A: Content Presentation
 */
function scanSectionA(content: CourseContent, courseName: string, courseId: string): ScanIssue[] {
  const issues: ScanIssue[] = [];

  // A1-A3: Unit-Level Objectives
  issues.push(...scanA1_A3_Objectives(content, courseName, courseId));

  // A4-A8: Use of the CMS
  issues.push(...scanA4_A8_CMS(content, courseName, courseId));

  // A9-A11: Learner Support (plain language + clarity)
  issues.push(...scanA9_A11_LearnerSupport(content, courseName, courseId));

  // A12-A14: Institutional Support — tabled by user
  // issues.push(...scanA12_A14_InstitutionalSupport(content, courseName, courseId));

  return issues;
}

/**
 * A1-A3: Unit-Level Objectives
 */
function scanA1_A3_Objectives(content: CourseContent, courseName: string, courseId: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const modules = content.modules || [];
  const pages = content.pages || []; // Get all course pages

  if (pages.length > 0) {
  }

  if (modules.length === 0) {
    return issues; // No modules to check
  }

  // Check each module for objectives
  modules.forEach((module, index) => {
    const moduleName = module.name || `Module ${index + 1}`;
    const hasObjectives = checkForObjectives(module, pages); // Pass pages array

    if (!hasObjectives.found) {
      // Gather module content for AI to analyze
      const moduleContent = gatherModuleContent(module);
      
      issues.push({
        id: `a1-a3-missing-objectives-${courseId}-${index}`,
        type: 'design',
        category: 'objectives',
        severity: 'high',
        title: 'Unit Objectives Missing',
        description: `Module \"${moduleName}\" does not have clear, measurable learning objectives.`,
        location: moduleName,
        // autoFixAvailable = false when no pages exist (whereToAddPageUrl is null = no target page)
        autoFixAvailable: hasObjectives.whereToAddPageUrl !== null,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        contentType: 'module',
        contentId: module.id || `module-${index}`,
        moduleId: module.id || `module-${index}`, // Store module ID for updates
        standardsTags: ['cvc-oei:A1', 'cvc-oei:A2', 'cvc-oei:A3', 'peralta:E5', 'qm:2.1'],
        suggestedFix: `Add a "Learning Objectives" section at the top of ${hasObjectives.whereToAdd || 'the module overview page'}`,
        elementHtml: moduleContent, // Store module content for AI analysis
        fixSteps: [
          `Open "${hasObjectives.whereToAdd || 'Module overview page'}" in Canvas editor`,
          'Add a "Learning Objectives" heading at the top',
          'Review AI-generated objectives below',
          'Copy and paste objectives into the page',
          'Customize as needed for your course'
        ],
        evidenceHtml: hasObjectives.evidence || 'No objectives found in module pages',
        impactStatement: 'Students cannot identify what they should learn or how content aligns with course goals',
        suggestedContent: generateSampleObjectives(moduleName),
        existingObjectives: hasObjectives.existingObjectives, // Store any extracted objectives
        whereToAdd: hasObjectives.whereToAdd, // Store where objectives should be added
        whereToAddPageUrl: hasObjectives.whereToAddPageUrl || undefined // Specific page URL to update
      });
    } else if (false && !hasObjectives.measurable) { // TEMPORARILY DISABLED for usability testing
      issues.push({
        id: `a1-a3-vague-objectives-${courseId}-${index}`,
        type: 'design',
        category: 'objectives',
        severity: 'medium',
        title: 'Objectives Not Measurable',
        description: `Module "${moduleName}" objectives use vague verbs like "understand" or "know" instead of action-oriented language.`,
        location: moduleName,
        autoFixAvailable: true, // AI can improve objectives
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        contentType: 'module',
        contentId: module.id || `module-${index}`,
        moduleId: module.id || `module-${index}`,
        standardsTags: ['cvc-oei:A1', 'cvc-oei:A2', 'cvc-oei:A3', 'qm:2.1'],
        suggestedFix: `Update objectives in "${hasObjectives.whereToAdd || 'module'}" to use measurable action verbs`,
        elementHtml: gatherModuleContent(module), // Include module content for context
        fixSteps: [
          `Open "${hasObjectives.whereToAdd || 'the page with objectives'}" in Canvas editor`,
          'Review AI-improved objectives below',
          'Replace existing objectives with measurable versions',
          'Ensure each uses Bloom\'s Taxonomy action verbs',
          'Save changes'
        ],
        evidenceHtml: hasObjectives.evidence || '',
        impactStatement: 'Objectives cannot be clearly assessed or measured',
        existingObjectives: hasObjectives.existingObjectives, // Store existing objectives for comparison
        whereToAdd: hasObjectives.whereToAdd, // Store where objectives live
        whereToAddPageUrl: hasObjectives.whereToAddPageUrl || undefined // Specific page URL to update
      });
    } else if (false) { // DISABLED: "Objectives and Content Not Clearly Mapped" check - not useful
      issues.push({
        id: `a1-a3-not-aligned-${courseId}-${index}`,
        type: 'design',
        category: 'objectives',
        severity: 'medium',
        title: 'Objectives and Content Not Clearly Mapped',
        description: `Module "${moduleName}" has objectives and content, but doesn't explicitly show which items support each objective.`,
        location: moduleName,
        autoFixAvailable: false,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        contentType: 'module',
        contentId: module.id || `module-${index}`,
        standardsTags: ['cvc-oei:A1', 'cvc-oei:A2', 'cvc-oei:A3', 'qm:2.2', 'qm:2.3'],
        suggestedFix: 'Create an explicit alignment map showing which content supports each objective',
        elementHtml: gatherModuleContent(module), // Include module content for context
        fixSteps: [
          'Add an "Alignment Map" section to the module overview',
          'List each objective',
          'Under each objective, list the pages/activities/assessments that address it',
          'Format: "Objective 1: [text] → Page: [name], Assignment: [name], Quiz: [name]"',
          'This makes it clear to students why each piece of content matters'
        ],
        evidenceHtml: hasObjectives.evidence || '',
        impactStatement: 'Students cannot see how content connects to learning goals',
        suggestedContent: generateAlignmentMap(module)
      });
    }
  });

  return issues;
}

/**
 * A4-A8: Use of the CMS
 */
function scanA4_A8_CMS(content: CourseContent, courseName: string, courseId: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const modules = content.modules || [];

  // Check for module structure
  if (modules.length === 0) {
    issues.push({
      id: `a4-a8-no-modules-${courseId}`,
      type: 'design',
      category: 'deep-nav',
      severity: 'high',
      title: 'Content Not Organized Into Modules',
      description: 'Course content is not structured into clearly defined modules or units.',
      location: 'Course Structure',
      autoFixAvailable: true,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      contentType: 'course',
      contentId: courseId,
      standardsTags: ['cvc-oei:A4', 'cvc-oei:A5', 'cvc-oei:A8', 'peralta:E5', 'qm:8.1'],
      suggestedFix: 'Organize content into weekly or topical modules',
      fixSteps: [
        'Create modules for each week or major topic',
        'Use a consistent pattern: Overview → Objectives → Content → Practice → Assessment',
        'Group related content together within each module',
        'Use clear, descriptive module names (e.g., "Week 1: Introduction to Course Concepts")',
        'Enable AI-powered module organization for automatic structure'
      ],
    });
  }

  // Check for navigation clarity
  // TEMPORARILY DISABLED - May reinstate later
  // modules.forEach((module, index) => {
  //   const hasOverview = module.items?.some((item: any) => 
  //     item.type === 'Page' && (item.title?.toLowerCase().includes('overview') || item.title?.toLowerCase().includes('start here'))
  //   );

  //   if (!hasOverview && index === 0) {
  //     issues.push({
  //       id: `a4-a8-no-start-${courseId}`,
  //       type: 'design',
  //       category: 'navigation',
  //       severity: 'high',
  //       title: 'Unclear Navigation - No "Start Here"',
  //       description: 'Course lacks a clear starting point or overview page telling students where to begin.',
  //       location: 'Course Home / Module 1',
  //       autoFixAvailable: false,
  //       courseName: courseName,
  //       courseId: courseId,
  //       status: 'pending',
  //       contentType: 'course',
  //       contentId: courseId,
  //       standardsTags: ['cvc-oei:A4', 'cvc-oei:A8', 'cvc-oei:A9', 'peralta:E5', 'qm:8.1'],
  //       suggestedFix: 'Create a "Start Here" or "Course Overview" page',
  //       fixSteps: [
  //         'Add a page titled "Start Here" or "Course Overview" as the first item',
  //         'Include: welcome message, course structure, how to navigate, key policies, how to succeed',
  //         'Use clear headings to organize information',
  //         'Provide a step-by-step guide for the first week'
  //       ],
  //       impactStatement: 'Students don\'t know where to start or what to do first',
  //       suggestedContent: 'Start Here page should include:\n• Welcome\n• Course structure overview\n• Navigation instructions\n• How to get help\n• First steps'
  //     });
  //   }
  // });

  // TODO: RESUME — "Page Lacks Headings" and "Inconsistent Heading Structure" — tabled for now
  // Check pages for heading structure
  const pages = content.pages || [];
  pages.forEach((page, index) => {
    if (page.body) {
      const hasHeadings = /<h[1-6][^>]*>/i.test(page.body);
      const hasInconsistentHeadings = checkHeadingStructure(page.body);

      if (false && !hasHeadings) {
        issues.push({
          id: `a4-a8-no-headings-${courseId}-page-${index}`,
          type: 'design',
          category: 'structure',
          severity: 'medium',
          title: 'Page Lacks Headings',
          description: `Page "${page.title}" has no headings, making it hard to scan and navigate.`,
          location: `Page: ${page.title}`,
          autoFixAvailable: false,
          courseName: courseName,
          courseId: courseId,
          status: 'pending',
          contentType: 'page',
          contentId: page.id || `page-${index}`,
          standardsTags: ['cvc-oei:A4', 'cvc-oei:A8', 'wcag:1.3.1', 'wcag:2.4.6', 'qm:8.2'],
          suggestedFix: 'Add headings to organize page content',
          fixSteps: [
            'Break content into logical sections',
            'Add a Heading 2 for each major section',
            'Use Heading 3 for subsections',
            'Example: H2 "Overview", H2 "Key Concepts", H3 "Concept 1", H3 "Concept 2"'
          ],
          impactStatement: 'Page is difficult to scan; screen reader users cannot navigate by headings',
          elementHtml: sanitizeHtmlForStorage(page.body?.substring(0, 300) || '<p><em>Page content not available for preview</em></p>'),
        });
      } else if (false && hasInconsistentHeadings.isInconsistent) {
        issues.push({
          id: `a4-a8-inconsistent-headings-${courseId}-page-${index}`,
          type: 'design',
          category: 'structure',
          severity: 'medium',
          title: 'Inconsistent Heading Structure',
          description: hasInconsistentHeadings.description || 'Headings skip levels or are used inconsistently',
          location: `Page: ${page.title}`,
          autoFixAvailable: false,
          courseName: courseName,
          courseId: courseId,
          status: 'pending',
          contentType: 'page',
          contentId: page.id || `page-${index}`,
          standardsTags: ['cvc-oei:A4', 'cvc-oei:A8', 'wcag:1.3.1', 'wcag:2.4.6', 'qm:8.2'],
          suggestedFix: 'Fix heading hierarchy to follow logical structure',
          fixSteps: [
            'Start with H2 for main sections (H1 is the page title)',
            'Use H3 for subsections under H2',
            'Don\'t skip levels (e.g., H2 → H4)',
            'Maintain consistent hierarchy throughout the page'
          ],
          impactStatement: 'Disrupts logical flow and screen reader navigation',
          elementHtml: sanitizeHtmlForStorage(page.body?.substring(0, 300) || '<p><em>Page content not available for preview</em></p>'),
        });
      }
    }
  });

  return issues;
}

/**
 * A9-A11: Learner Support (plain language + clarity)
 */
function scanA9_A11_LearnerSupport(content: CourseContent, courseName: string, courseId: string): ScanIssue[] {
  const issues: ScanIssue[] = [];

  // Check assignment instructions for clarity
  const assignments = content.assignments || [];
  assignments.forEach((assignment, index) => {
    // Skip assignments with no title or no description — nothing meaningful to scan
    const assignmentTitle = assignment.title?.trim();
    if (!assignmentTitle || !assignment.description?.trim()) return;

    const clarityCheck = checkInstructionClarity(assignment.description);

    if (!clarityCheck.hasWhatToDo || !clarityCheck.hasSteps || !clarityCheck.hasSubmissionInfo) {
      issues.push({
        id: `a9-a11-vague-instructions-${courseId}-assignment-${index}`,
        type: 'design',
        category: 'instructions',
        severity: 'high',
        title: 'Instructions Missing Key Information',
        description: `Assignment "${assignmentTitle}" instructions are incomplete or vague.`,
        location: `Assignment: ${assignmentTitle}`,
        autoFixAvailable: true, // AI can rewrite with complete structure
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        contentType: 'assignment',
        contentId: assignment.id || `assignment-${index}`,
        standardsTags: ['cvc-oei:A9', 'cvc-oei:A10', 'cvc-oei:A11', 'peralta:E5', 'qm:4.1'],
        suggestedFix: 'Rewrite instructions to include all required elements',
        fixSteps: [
          '✅ What to do: Clearly state the task',
          '✅ Steps: Number the steps in order',
          '✅ Where/how to submit: Tool + location',
          '✅ Success criteria: What "good" looks like',
          '✅ Constraints: Word count, format, due date, grading reference',
          'Use short sentences and bullet points',
          'Define any jargon or acronyms'
        ],
        impactStatement: 'Students cannot complete the assignment successfully or don\'t know how to submit',
        suggestedContent: generateClearInstructions(assignmentTitle),
        evidenceHtml: clarityCheck.missingElements.join(', '),
        elementHtml: sanitizeHtmlForStorage(assignment.description.substring(0, 600)),
      });
    }

    if (clarityCheck.isDense) {
      issues.push({
        id: `a9-a11-dense-instructions-${courseId}-assignment-${index}`,
        type: 'design',
        category: 'plain-language',
        severity: 'medium',
        title: 'Instructions Not in Plain Language',
        description: `Assignment "${assignmentTitle}" instructions are long, dense, or jargon-heavy.`,
        location: `Assignment: ${assignmentTitle}`,
        autoFixAvailable: true, // AI can simplify language
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        contentType: 'assignment',
        contentId: assignment.id || `assignment-${index}`,
        standardsTags: ['cvc-oei:A9', 'cvc-oei:A11', 'peralta:E5', 'qm:4.1'],
        suggestedFix: 'Simplify language and add structure',
        fixSteps: [
          'Break long paragraphs into short sentences',
          'Use numbered steps or bullet points',
          'Define technical terms in simple language',
          'Remove or explain acronyms',
          'Add a "Requirements at a Glance" checklist at the top'
        ],
        impactStatement: 'Instructions are confusing or overwhelming, especially for non-native English speakers',
        elementHtml: sanitizeHtmlForStorage(assignment.description.substring(0, 600)),
      });
    }
  });

  // Check module page content for unclear or minimal instructions
  const modules = content.modules || [];
  const pages = content.pages || [];
  const pagesByUrl = new Map(pages.map((p: any) => [p.url, p]));

  modules.forEach((module: any, moduleIndex: number) => {
    const moduleName = module.name || `Module ${moduleIndex + 1}`;
    const items = module.items || [];

    items.forEach((item: any, itemIndex: number) => {
      if (item.type !== 'Page') return;

      // Find the actual page content via URL or title
      const page: any = (item.page_url && pagesByUrl.get(item.page_url)) ||
        pages.find((p: any) => p.title?.toLowerCase() === item.title?.toLowerCase());

      if (!page?.body?.trim()) return;

      const pageTitle = (page.title || item.title || 'Untitled Page').trim();
      const pageBody: string = page.body;
      const cleanText = pageBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

      // Only consider pages with some content
      if (wordCount < 15) return;

      // Only flag pages that appear to contain instructions/activity directions
      const isInstructional = /\b(submit|complete|respond|post|write|create|answer|activity|exercise|discuss|participate|directions?|instructions?|task|assignment)\b/i.test(cleanText);
      if (!isInstructional) return;

      const clarityCheck = checkInstructionClarity(pageBody);
      const isMissingKeyInfo = !clarityCheck.hasWhatToDo || !clarityCheck.hasSubmissionInfo;

      // TODO: RESUME — "Module Page Instructions Unclear or Minimal" tabled for later development
      if (false && (wordCount < 60 || isMissingKeyInfo)) {
        issues.push({
          id: `a9-a11-page-instructions-${courseId}-module-${moduleIndex}-item-${itemIndex}`,
          type: 'design',
          category: 'instructions',
          severity: 'medium',
          title: 'Module Page Instructions Unclear or Minimal',
          description: `Page "${pageTitle}" in "${moduleName}" has incomplete or unclear instructions for students.`,
          location: `${moduleName} › ${pageTitle}`,
          autoFixAvailable: true,
          courseName: courseName,
          courseId: courseId,
          status: 'pending',
          contentType: 'page',
          contentId: page.id || `module-${moduleIndex}-item-${itemIndex}`,
          standardsTags: ['cvc-oei:A9', 'cvc-oei:A10', 'cvc-oei:A11', 'qm:4.1'],
          suggestedFix: 'Rewrite page to clearly explain what students should do',
          fixSteps: [
            '✅ What to do: State the task in plain terms',
            '✅ Steps: Number each action students need to take',
            '✅ Success criteria: Describe what a complete response looks like',
            '✅ Submission: Specify where/how to submit (if applicable)',
            'Use short sentences and bullet points'
          ],
          impactStatement: 'Students may not know what is expected or how to complete the activity',
          evidenceHtml: clarityCheck.missingElements.join(', '),
          elementHtml: sanitizeHtmlForStorage(pageBody.substring(0, 600)),
        });
      }
    });
  });

  // TODO: RESUME — "No Anonymous Feedback Mechanism" flag (cvc-oei:A11)
  // Detection logic: checkForFeedbackMechanism(content)
  // Needs: better detection heuristics + modal UI for guiding users to add a feedback form
  // const hasFeedbackMechanism = checkForFeedbackMechanism(content);
  // if (!hasFeedbackMechanism) {
  //   issues.push({
  //     id: `a9-a11-no-feedback-${courseId}`,
  //     type: 'design',
  //     category: 'learner-support',
  //     severity: 'medium',
  //     title: 'No Anonymous Feedback Mechanism',
  //     description: 'Course lacks a way for learners to provide anonymous feedback.',
  //     location: 'Course',
  //     autoFixAvailable: false,
  //     courseName: courseName,
  //     courseId: courseId,
  //     status: 'pending',
  //     contentType: 'course',
  //     contentId: courseId,
  //     standardsTags: ['cvc-oei:A11', 'peralta:E5'],
  //     suggestedFix: 'Add an anonymous feedback survey or tool',
  //     fixSteps: [
  //       'Create a Google Form or Microsoft Form with anonymous responses enabled',
  //       'Add link to course homepage or syllabus',
  //       'Label it clearly: "Anonymous Course Feedback"',
  //       'Include questions about course clarity, workload, and support'
  //     ],
  //     impactStatement: 'Students cannot provide honest feedback about course issues'
  //   });
  // }

  return issues;
}

/**
 * A12-A14: Institutional Support
 *
 * Course-level checks that scan ALL content to determine whether:
 * - A12: Course policies are easy to find
 * - A13: Student support service links are present
 * - A14: Technology support info is available
 */
function scanA12_A14_InstitutionalSupport(content: CourseContent, courseName: string, courseId: string): ScanIssue[] {
  const issues: ScanIssue[] = [];

  // Gather ALL text from across the entire course for course-level detection
  const allCourseText = gatherAllCourseText(content);
  const allCourseTextLower = allCourseText.toLowerCase();

  // Also check page titles for policy-related pages
  const allPageTitles = [
    ...(content.pages || []).map((p: any) => (p.title || '').toLowerCase()),
    content.syllabus?.title?.toLowerCase() || '',
    content.frontPage?.title?.toLowerCase() || '',
  ].join(' ');

  // --- A12: Course Policies Easy to Find ---
  const policyKeywords = [
    /course\s*polic/i,
    /grading\s*polic/i,
    /academic\s*integrit/i,
    /academic\s*honest/i,
    /late\s*polic/i,
    /attendance\s*polic/i,
    /participation\s*polic/i,
    /\bsyllabus\b/i,
  ];
  const policyPageTitles = [
    /\bsyllabus\b/i,
    /course\s*polic/i,
    /course\s*info/i,
  ];

  const hasPolicyKeyword = policyKeywords.some(re => re.test(allCourseTextLower));
  const hasPolicyPage = policyPageTitles.some(re => re.test(allPageTitles));

  if (!hasPolicyKeyword && !hasPolicyPage) {
    issues.push({
      id: `a12-course-policies-missing-${courseId}`,
      type: 'rubric',
      category: 'policies',
      severity: 'medium',
      title: 'Course Policies Not Found',
      description: 'No course policies were detected anywhere in the course. Students need easy access to grading policies, academic integrity policies, late work policies, and other course expectations. These are typically found on a Syllabus page or a dedicated Course Policies page.',
      location: 'Course (all content)',
      autoFixAvailable: false,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      contentType: 'course',
      contentId: courseId,
      standardsTags: ['cvc-oei:A12', 'peralta:E5', 'qm:1.4'],
      suggestedFix: 'Create a Syllabus or Course Policies page with clear, easy-to-find policies',
      fixSteps: [
        'Create a page titled "Syllabus" or "Course Policies"',
        'Include grading policy (scale, grade weights, how grades are calculated)',
        'Include late work / extension policy',
        'Include academic integrity / honesty policy',
        'Include attendance and participation expectations',
        'Make the page easy to find — link from the Home page or add to Course Navigation'
      ],
      impactStatement: 'Students cannot find course policies, leading to confusion about expectations, grading, and academic integrity requirements',
      elementHtml: '<p><em>No course policies, grading policies, academic integrity statements, or syllabus content were detected in any course page, assignment, or module.</em></p>',
    });
  }

  // --- A13: Student Support Services ---
  const supportKeywords = [
    /student\s*support/i,
    /\btutoring\b/i,
    /\bcounseling\b/i,
    /disability\s*services/i,
    /\bDSPS\b/,
    /accessibility\s*services/i,
    /financial\s*aid/i,
    /student\s*services/i,
    /academic\s*support/i,
    /library\s*services/i,
    /writing\s*center/i,
  ];

  const hasSupportKeyword = supportKeywords.some(re => re.test(allCourseText));

  if (!hasSupportKeyword) {
    issues.push({
      id: `a13-student-support-missing-${courseId}`,
      type: 'rubric',
      category: 'policies',
      severity: 'medium',
      title: 'Student Support Services Not Found',
      description: 'No references to student support services were detected in the course. Students should be informed about available support resources such as tutoring, counseling, disability services (DSPS), library services, writing center, and financial aid.',
      location: 'Course (all content)',
      autoFixAvailable: false,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      contentType: 'course',
      contentId: courseId,
      standardsTags: ['cvc-oei:A13', 'peralta:E1', 'qm:7.4'],
      suggestedFix: 'Add a Student Resources section or page with links to campus support services',
      fixSteps: [
        'Create a "Student Resources" or "Student Support" page (or add a section to your Syllabus)',
        'Include links to tutoring services with a brief description',
        'Include links to counseling / mental health services',
        'Include links to disability services (DSPS / accessibility services)',
        'Include links to library services and writing center',
        'Include links to financial aid resources',
        'For each service, briefly explain what it offers and when to use it'
      ],
      impactStatement: 'Students may not know what support services are available to help them succeed, especially first-generation and underrepresented students who benefit most from proactive support referrals',
      elementHtml: '<p><em>No references to student support services (tutoring, counseling, disability services, library, writing center, financial aid) were found in any course content.</em></p>',
    });
  }

  // --- A14: Technology Support ---
  const techSupportKeywords = [
    /tech\s*support/i,
    /technical\s*support/i,
    /help\s*desk/i,
    /\bIT\s*support\b/,
    /technology\s*support/i,
    /Canvas\s*help/i,
    /Canvas\s*support/i,
    /technical\s*requirements?/i,
    /browser\s*requirements?/i,
    /system\s*requirements?/i,
  ];

  const hasTechKeyword = techSupportKeywords.some(re => re.test(allCourseText));

  if (!hasTechKeyword) {
    issues.push({
      id: `a14-tech-support-missing-${courseId}`,
      type: 'rubric',
      category: 'policies',
      severity: 'medium',
      title: 'Technology Support Information Not Found',
      description: 'No technology support information was detected in the course. Students need to know where to get help with technical issues, what technology is required, and how to contact the help desk or IT support.',
      location: 'Course (all content)',
      autoFixAvailable: false,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      contentType: 'course',
      contentId: courseId,
      standardsTags: ['cvc-oei:A14', 'peralta:E1', 'qm:7.1'],
      suggestedFix: 'Add technology support information and technical requirements to the course',
      fixSteps: [
        'Add a "Technology Support" or "Technical Requirements" section to your Syllabus or a dedicated page',
        'Include help desk / IT support contact information (phone, email, hours)',
        'Include a link to your institution\'s Canvas help resources',
        'List minimum browser and system requirements',
        'Mention any required software or plugins students need',
        'Include Canvas Student Guide link: https://community.canvaslms.com/t5/Student-Guide/tkb-p/student'
      ],
      impactStatement: 'Students who encounter technical issues have no clear path to get help, leading to frustration, missed deadlines, and potential course withdrawal',
      elementHtml: '<p><em>No technology support information (help desk, IT support, Canvas help, technical/browser/system requirements) was found in any course content.</em></p>',
    });
  }

  return issues;
}

/**
 * Gather all text content from across the entire course for course-level checks.
 * Strips HTML tags and combines text from syllabus, pages, assignments, discussions,
 * quizzes, announcements, front page, and module items.
 */
function gatherAllCourseText(content: CourseContent): string {
  const textParts: string[] = [];

  const stripHtml = (html: string): string => (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  // Syllabus
  if (content.syllabus) {
    textParts.push(stripHtml(content.syllabus.body || content.syllabus.description || ''));
    textParts.push(content.syllabus.title || '');
  }

  // Front page
  if (content.frontPage) {
    textParts.push(stripHtml(content.frontPage.body || content.frontPage.description || ''));
    textParts.push(content.frontPage.title || '');
  }

  // Pages
  (content.pages || []).forEach((page: any) => {
    textParts.push(stripHtml(page.body || ''));
    textParts.push(page.title || '');
  });

  // Assignments
  (content.assignments || []).forEach((a: any) => {
    textParts.push(stripHtml(a.description || ''));
    textParts.push(a.name || a.title || '');
  });

  // Discussions
  (content.discussions || []).forEach((d: any) => {
    textParts.push(stripHtml(d.message || ''));
    textParts.push(d.title || '');
  });

  // Quizzes
  (content.quizzes || []).forEach((q: any) => {
    textParts.push(stripHtml(q.description || ''));
    textParts.push(q.title || '');
  });

  // Announcements
  (content.announcements || []).forEach((a: any) => {
    textParts.push(stripHtml(a.message || ''));
    textParts.push(a.title || '');
  });

  // Module items
  (content.modules || []).forEach((mod: any) => {
    textParts.push(mod.name || '');
    (mod.items || []).forEach((item: any) => {
      textParts.push(item.title || '');
      textParts.push(stripHtml(item.content || ''));
      textParts.push(stripHtml(item.description || ''));
    });
  });

  return textParts.join(' ');
}

/**
 * SECTION B: Interaction
 */
function scanSectionB(content: CourseContent, courseName: string, courseId: string): ScanIssue[] {
  const issues: ScanIssue[] = [];

  // B1-B3: Instructor Contact
  issues.push(...scanB1_B3_InstructorContact(content, courseName, courseId));

  // B4-B6: Student-to-Student Interaction
  issues.push(...scanB4_B6_StudentInteraction(content, courseName, courseId));

  return issues;
}

/**
 * B1-B3: Instructor Contact
 */
function scanB1_B3_InstructorContact(content: CourseContent, courseName: string, courseId: string): ScanIssue[] {
  const issues: ScanIssue[] = [];

  const announcements = content.announcements || [];
  const hasWelcomeAnnouncement = announcements.some(a => 
    a.title?.toLowerCase().includes('welcome') || a.created_at // Check if announcement exists at course start
  );

  if (!hasWelcomeAnnouncement && announcements.length === 0) {
    issues.push({
      id: `b1-b3-no-welcome-${courseId}`,
      type: 'design',
      category: 'instructor-contact',
      severity: 'high',
      title: 'No Instructor Contact at Course Start',
      description: 'No welcome announcement, intro video, or instructor contact before/at course start.',
      location: 'Announcements / Course Home',
      autoFixAvailable: true, // AI can draft a welcome announcement
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      contentType: 'course',
      contentId: courseId,
      standardsTags: ['cvc-oei:B1', 'peralta:E5', 'qm:5.2'],
      suggestedFix: 'Post a welcome announcement',
      fixSteps: [
        'Create an announcement titled "Welcome to [Course Name]!"',
        'Include: brief intro, what to do first, how to contact you, office hours',
        'Post before the course starts or on Day 1',
        'Consider adding a short intro video'
      ],
      impactStatement: 'Students feel disconnected and don\'t know if instructor is engaged',
      elementHtml: '<p><em>No welcome announcement found. Course has 0 announcements.</em></p>',
    });
  }

  // B2-B3: Communication Guidelines (RSI requirement)
  const commGuidelines = checkForCommunicationGuidelines(content);
  if (false && commGuidelines.score < 2) {
    const missing: string[] = [];
    if (!commGuidelines.hasResponseTime) missing.push('response time expectations');
    if (!commGuidelines.hasFeedbackTimeline) missing.push('feedback/grading turnaround');
    if (!commGuidelines.hasContactMethod) missing.push('preferred contact method');

    issues.push({
      id: `b2-b3-comm-guidelines-${courseId}`,
      type: 'design' as const,
      category: 'communication-guidelines' as any,
      severity: 'high' as const,
      title: 'Communication Guidelines Missing',
      description: `Course syllabus and pages are missing clear communication guidelines required for RSI compliance. Missing: ${missing.join(', ')}.`,
      location: 'Syllabus',
      autoFixAvailable: true,
      courseName: courseName,
      courseId: courseId,
      status: 'pending' as const,
      contentType: 'page' as const,
      contentId: 'syllabus',
      standardsTags: ['cvc-oei:B2', 'cvc-oei:B3', 'qm:5.3'],
      suggestedFix: 'Add communication guidelines to syllabus',
      fixSteps: [
        'Add a "Communication & Response Times" section to your syllabus',
        'Specify your preferred contact method (Canvas Inbox, email, etc.)',
        'State your response time for messages (e.g., within 24 hours M-F)',
        'State your feedback turnaround for assignments (e.g., 1 week for small, 2 weeks for major)'
      ],
      impactStatement: 'Students don\'t know when to expect responses or feedback, which is required for Regular Substantive Interaction (RSI) under Title 5',
      elementHtml: '<p><em>Syllabus and course pages do not include clear communication timelines.</em></p>',
      suggestedContent: `<h3>Communication &amp; Response Times</h3>
<p><strong>Preferred Contact Method:</strong> Please use <strong>Canvas Inbox</strong> for all course-related communication. This helps me keep track of your messages and respond promptly.</p>
<p><strong>Response Time:</strong> I will respond to messages within <strong>24 hours Monday through Friday</strong>. Messages sent over the weekend will receive a response by end of day Monday.</p>
<p><strong>Feedback on Assignments:</strong></p>
<ul>
<li>Small assignments and discussions: feedback within <strong>1 week</strong></li>
<li>Major assignments and essays: feedback within <strong>2 weeks</strong></li>
<li>Quizzes and exams: grades posted within <strong>3 business days</strong></li>
</ul>
<p><strong>Office Hours:</strong> I hold virtual office hours via Zoom on [Day/Time]. Drop-ins are welcome, or you can schedule a one-on-one appointment through Canvas.</p>`,
    });
  }

  return issues;
}

/**
 * B4-B6: Student-to-Student Interaction
 */
function scanB4_B6_StudentInteraction(content: CourseContent, courseName: string, courseId: string): ScanIssue[] {
  const issues: ScanIssue[] = [];

  const discussions = content.discussions || [];
  
  if (discussions.length === 0) {
    issues.push({
      id: `b4-b6-no-interaction-${courseId}`,
      type: 'design',
      category: 'student-interaction',
      severity: 'high',
      title: 'No Opportunities for Peer Interaction',
      description: 'Course lacks discussions, group work, peer review, or collaboration activities.',
      location: 'Course',
      autoFixAvailable: true, // AI can generate a discussion prompt template
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      contentType: 'course',
      contentId: courseId,
      standardsTags: ['cvc-oei:B4', 'cvc-oei:B5', 'peralta:E2', 'qm:3.2'],
      suggestedFix: 'Add peer interaction opportunities',
      fixSteps: [
        'Add at least 2-3 graded discussions per module',
        'Consider: peer review assignments, group projects, collaborative documents',
        'Tie interactions to course content (not just "introduce yourself")',
        'Example: "Discuss how [concept] applies to your field"'
      ],
      impactStatement: 'Students feel isolated and miss benefits of collaborative learning'
    });
  } else {
    // Check if discussions have rubrics/criteria
    discussions.forEach((discussion, index) => {
      const hasRubric = discussion.rubric || discussion.grading_criteria;
      const hasParticipationGuidance = discussion.description?.toLowerCase().includes('post') || 
                                       discussion.description?.toLowerCase().includes('respond');

      if (!hasRubric && discussion.points_possible > 0) {
        issues.push({
          id: `b4-b6-no-rubric-${courseId}-disc-${index}`,
          type: 'design',
          category: 'student-interaction',
          severity: 'medium',
          title: 'Discussion Lacks Rubric or Criteria',
          description: `Discussion "${discussion.title}" is graded but has no rubric explaining how participation is evaluated.`,
          location: `Discussion: ${discussion.title}`,
          autoFixAvailable: false,
          courseName: courseName,
          courseId: courseId,
          status: 'pending',
          contentType: 'discussion',
          contentId: discussion.id || `discussion-${index}`,
          standardsTags: ['cvc-oei:B6', 'qm:3.3', 'qm:4.2'],
          suggestedFix: 'Add a discussion rubric',
          fixSteps: [
            'Create rubric with criteria: Initial Post Quality, Peer Responses, Engagement',
            'Specify: number of posts required, response length, thoughtfulness',
            'Example: "1 initial post (150+ words), 2 peer responses (50+ words each)"'
          ],
          impactStatement: 'Students don\'t know how to earn full credit',
          elementHtml: sanitizeHtmlForStorage(discussion.description?.substring(0, 400) || `<p><em>Discussion: ${discussion.title}</em></p>`),
        });
      }

      // TODO: RESUME — "Discussion Participation Expectations Unclear" — tabled for now
      if (false && !hasParticipationGuidance) {
        issues.push({
          id: `b4-b6-unclear-expectations-${courseId}-disc-${index}`,
          type: 'design',
          category: 'student-interaction',
          severity: 'medium',
          title: 'Discussion Participation Expectations Unclear',
          description: `Discussion "${discussion.title}" doesn't specify quantity/quality expectations for posts.`,
          location: `Discussion: ${discussion.title}`,
          autoFixAvailable: false,
          courseName: courseName,
          courseId: courseId,
          status: 'pending',
          contentType: 'discussion',
          contentId: discussion.id || `discussion-${index}`,
          standardsTags: ['cvc-oei:B5', 'cvc-oei:B6', 'qm:3.3'],
          suggestedFix: 'Add clear participation instructions',
          fixSteps: [
            'Specify: "Post your initial response by [day]"',
            'Specify: "Reply to at least 2 classmates by [day]"',
            'Describe what quality looks like: "Build on others\' ideas, ask questions, provide examples"'
          ],
          impactStatement: 'Students don\'t know how much or what type of participation is expected',
          elementHtml: sanitizeHtmlForStorage(discussion.description?.substring(0, 400) || `<p><em>Discussion: ${discussion.title}</em></p>`),
        });
      }
    });
  }

  // Per-module discussion check: flag modules with no student-to-student interaction
  const modules = content.modules || [];
  if (modules.length > 0) {
    // Build a set of module IDs that contain at least one discussion
    const discussionModuleIds = new Set<string>();
    (content.discussions || []).forEach((disc: any) => {
      if (disc.assignment_group_id) {
        // Discussion linked to a module via assignment group
        modules.forEach((mod: any) => {
          const items = mod.items || [];
          items.forEach((item: any) => {
            if (item.type === 'Discussion' || item.content_id === disc.id) {
              discussionModuleIds.add(String(mod.id));
            }
          });
        });
      }
    });

    // Also check module items directly for Discussion type
    modules.forEach((mod: any) => {
      const items = mod.items || [];
      items.forEach((item: any) => {
        if (item.type === 'Discussion') {
          discussionModuleIds.add(String(mod.id));
        }
      });
    });

    modules.forEach((mod: any) => {
      const modId = String(mod.id);
      if (false && !discussionModuleIds.has(modId)) {
        // Gather module item titles for AI context
        const items = mod.items || [];
        const itemTitles = items.map((item: any) => `${item.title || 'Untitled'} (${item.type || 'Item'})`).join(', ');
        const moduleContent = gatherModuleContent(mod);

        issues.push({
          id: `b4-module-disc-${courseId}-${modId}`,
          type: 'design' as const,
          category: 'module-discussion' as any,
          severity: 'medium' as const,
          title: `No Discussion in Module: ${mod.name || 'Untitled Module'}`,
          description: `Module "${mod.name || 'Untitled Module'}" has no student-to-student discussion activity. RSI requires regular interaction opportunities in each module.`,
          location: `Module: ${mod.name || 'Untitled Module'}`,
          autoFixAvailable: true,
          courseName: courseName,
          courseId: courseId,
          status: 'pending' as const,
          contentType: 'course' as const,
          contentId: courseId,
          moduleId: modId,
          standardsTags: ['cvc-oei:B4', 'cvc-oei:B5', 'qm:3.2', 'peralta:E2'],
          suggestedFix: 'Add a discussion activity to this module',
          fixSteps: [
            'Create a discussion topic related to this module\'s content',
            'Include a thought-provoking question tied to module topics',
            'Require an initial post and 2 peer responses',
            'Consider adding grading criteria or a rubric'
          ],
          impactStatement: 'Students in this module have no opportunity for peer interaction, which is required for RSI compliance',
          elementHtml: `<p><strong>Module items:</strong> ${sanitizeHtmlForStorage(itemTitles || 'No items')}</p><p><em>${sanitizeHtmlForStorage(moduleContent.substring(0, 500))}</em></p>`,
        });
      }
    });
  }

  return issues;
}

/**
 * SECTION C: Assessment
 */
function scanSectionC(content: CourseContent, courseName: string, courseId: string): ScanIssue[] {
  const issues: ScanIssue[] = [];

  // C1-C4: Effective Assessment
  issues.push(...scanC1_C4_EffectiveAssessment(content, courseName, courseId));

  // C5-C8: Guidance and Feedback
  issues.push(...scanC5_C8_GuidanceFeedback(content, courseName, courseId));

  return issues;
}

/**
 * C1-C4: Effective Assessment
 */
function scanC1_C4_EffectiveAssessment(content: CourseContent, courseName: string, courseId: string): ScanIssue[] {
  const issues: ScanIssue[] = [];

  const assignments = content.assignments || [];
  const quizzes = content.quizzes || [];
  const discussions = content.discussions || [];

  const totalAssessments = assignments.length + quizzes.length + discussions.length;
  const assessmentTypes = new Set();
  
  if (assignments.length > 0) assessmentTypes.add('assignment');
  if (quizzes.length > 0) assessmentTypes.add('quiz');
  if (discussions.length > 0) assessmentTypes.add('discussion');

  // Check if only one assessment type
  if (assessmentTypes.size === 1 && totalAssessments > 0) {
    const onlyType = Array.from(assessmentTypes)[0];
    issues.push({
      id: `c1-c4-single-type-${courseId}`,
      type: 'design',
      category: 'assessment-variety',
      severity: 'high',
      title: 'Only One Assessment Type Used',
      description: `Course uses only ${onlyType}s for assessment. Variety is needed for different learning styles and skills.`,
      location: 'Course',
      autoFixAvailable: false,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      contentType: 'course',
      contentId: courseId,
      standardsTags: ['cvc-oei:C1', 'cvc-oei:C2', 'cvc-oei:C3', 'qm:3.1'],
      suggestedFix: 'Add varied assessment types',
      fixSteps: [
        'Mix formative and summative assessments',
        'Consider adding: discussions, low-stakes quizzes, projects, reflections, peer reviews',
        'Balance high-stakes exams with practice activities',
        'Example mix: weekly quizzes (formative) + discussions + 2 projects (summative)'
      ],
      impactStatement: 'Students who struggle with this format have no alternative ways to demonstrate learning',
      suggestedContent: 'Recommended assessment mix:\n• Formative: discussions, knowledge checks, reflections\n• Summative: projects, exams, portfolios'
    });
  }

  // Check if assessments appear high-stakes only
  const formativeAssessments = discussions.length + quizzes.filter((q: any) => q.points_possible < 20).length;
  const summativeAssessments = assignments.filter((a: any) => a.points_possible > 50).length;

  if (summativeAssessments > 0 && formativeAssessments === 0) {
    issues.push({
      id: `c1-c4-no-formative-${courseId}`,
      type: 'design',
      category: 'assessment-frequency',
      severity: 'high',
      title: 'No Formative Assessments Detected',
      description: 'Course appears to have only large, high-stakes assessments with little/no formative evaluation.',
      location: 'Course',
      autoFixAvailable: false,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      contentType: 'course',
      contentId: courseId,
      standardsTags: ['cvc-oei:C1', 'cvc-oei:C3', 'cvc-oei:C4', 'qm:3.4'],
      suggestedFix: 'Add formative evaluations to create feedback loops',
      fixSteps: [
        'Add low-stakes practice activities before major assessments',
        'Examples: knowledge checks, discussion posts, self-assessments, drafts with feedback',
        'Make these worth 5-10% of grade to encourage completion',
        'Purpose: help students gauge understanding before high-stakes work'
      ],
      impactStatement: 'Students don\'t get practice or feedback before major grades',
      suggestedContent: 'Consider adding:\n• Weekly discussion (5 pts each)\n• Knowledge checks after readings (completion grade)\n• Draft submissions with feedback\n• Reflection journals'
    });
  }

  return issues;
}

/**
 * C5-C8: Guidance and Feedback
 */
function scanC5_C8_GuidanceFeedback(content: CourseContent, courseName: string, courseId: string): ScanIssue[] {
  const issues: ScanIssue[] = [];

  const assignments = content.assignments || [];
  
  assignments.forEach((assignment, index) => {
    // Skip assignments without a title — can't meaningfully report on untitled items
    const assignmentTitle = assignment.title?.trim();
    if (!assignmentTitle) return;

    const hasRubric = assignment.rubric || assignment.rubric_settings;
    // Only consider "has detailed instructions" if description exists AND is long enough
    const descriptionText = assignment.description?.trim() || '';
    const hasDetailedInstructions = descriptionText.length > 50;

    // Check for rubric/criteria
    if (!hasRubric && assignment.points_possible > 20) {
      issues.push({
        id: `c5-c8-no-rubric-${courseId}-assignment-${index}`,
        type: 'design',
        category: 'assessment-criteria',
        severity: 'high',
        title: 'Rubric or Scoring Criteria Missing',
        description: `Assignment "${assignmentTitle}" is worth ${assignment.points_possible} points but has no rubric.`,
        location: `Assignment: ${assignmentTitle}`,
        autoFixAvailable: true, // AI can generate grading criteria
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        contentType: 'assignment',
        contentId: assignment.id || `assignment-${index}`,
        standardsTags: ['cvc-oei:C5', 'cvc-oei:C6', 'qm:3.3', 'qm:4.2'],
        suggestedFix: 'Create a rubric with clear criteria',
        fixSteps: [
          'Identify 3-5 key criteria (e.g., Argument Quality, Evidence Use, Organization, Clarity)',
          'For each criterion, define levels: Excellent, Good, Needs Improvement',
          'Use Canvas rubric tool or include criteria table in assignment description',
          'Example: "Argument Quality: Excellent (10pts) - Clear thesis with strong support"'
        ],
        impactStatement: 'Students don\'t know how they\'re being graded or what quality work looks like',
        elementHtml: `<p><strong>${assignmentTitle}</strong> — ${assignment.points_possible} pts</p>${descriptionText ? sanitizeHtmlForStorage(descriptionText.substring(0, 400)) : '<em>No description provided</em>'}`,
      });
    }

    // Only flag minimal instructions if the assignment HAS a description but it's too brief.
    // Skip completely empty assignments — no content means no instructions to assess.
    if (descriptionText && !hasDetailedInstructions) {
      issues.push({
        id: `c5-c8-minimal-instructions-${courseId}-assignment-${index}`,
        type: 'design',
        category: 'assessment-guidance',
        severity: 'medium',
        title: 'Assessment Instructions Unclear or Minimal',
        description: `Assignment "${assignmentTitle}" has very brief or unclear instructions.`,
        location: `Assignment: ${assignmentTitle}`,
        autoFixAvailable: true, // AI can expand with grading criteria and guidance
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        contentType: 'assignment',
        contentId: assignment.id || `assignment-${index}`,
        standardsTags: ['cvc-oei:C7', 'cvc-oei:C8', 'qm:4.1'],
        suggestedFix: 'Expand instructions with steps, examples, and submission details',
        fixSteps: [
          'Add: Task overview (what you\'re asking students to do)',
          'Add: Step-by-step process',
          'Add: Success criteria or example of good work',
          'Add: Submission requirements (format, length, due date)',
          'Add: Grading criteria or rubric link',
          'Use plain language and short sentences'
        ],
        impactStatement: 'Students may complete the assignment incorrectly or incompletely',
        elementHtml: `<p><strong>${assignmentTitle}</strong> — ${assignment.points_possible ?? 0} pts</p>${sanitizeHtmlForStorage(descriptionText.substring(0, 400))}`,
      });
    }
  });

  return issues;
}

/**
 * SECTION D: Accessibility
 */
function scanSectionD(content: CourseContent, courseName: string, courseId: string): ScanIssue[] {
  const issues: ScanIssue[] = [];

  const pages = content.pages || [];
  const assignments = content.assignments || [];
  const modules = content.modules || [];
  const announcements = content.announcements || [];
  const discussions = content.discussions || [];
  const quizzes = content.quizzes || [];
  
  // Combine all HTML content to scan
  const htmlContent = [
    ...pages.map(p => ({ html: p.body, location: `Page: ${p.title}`, id: p.url || p.page_id?.toString(), type: 'page' })),
    ...assignments.map(a => ({ html: a.description, location: `Assignment: ${a.title || a.name}`, id: a.id, type: 'assignment' })),
    ...modules.map(m => ({ html: m.description, location: `Module: ${m.name}`, id: m.id, type: 'module' })),
    ...announcements.map(an => ({ html: an.message, location: `Announcement: ${an.title}`, id: an.id, type: 'announcement' })),
    ...discussions.map(d => ({ html: d.message, location: `Discussion: ${d.title}`, id: d.id, type: 'discussion' })),
    ...quizzes.map(q => ({ html: q.description, location: `Quiz: ${q.title}`, id: q.id, type: 'quiz' }))
  ];

  htmlContent.forEach((item, index) => {
    if (!item.html) return;

    // D: Links with raw URLs or URL-like text (comprehensive detection)
    // Create one issue per link so each can be fixed individually
    const urlLikeLinks = detectURLLikeLinks(item.html);
    urlLikeLinks.forEach((link, linkIdx) => {
      issues.push({
        id: `d-long-url-${courseId}-${item.type}-${index}-${linkIdx}`,
        type: 'accessibility',
        category: 'long-url',
        severity: 'medium',
        title: 'Long URL as Link Text',
        description: `Link displays a URL instead of descriptive text.`,
        location: item.location,
        autoFixAvailable: true,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        contentType: item.type as any,
        contentId: item.id || `${item.type}-${index}`,
        standardsTags: ['cvc-oei:D', 'wcag:2.4.4', 'qm:8.3'],
        suggestedFix: 'Replace URL with meaningful link text',
        fixSteps: [
          'Edit each link to describe the destination',
          'Example: Change "https://example.com/report.pdf" → "Download 2023 Annual Report (PDF)"',
          'Example: Change "calendly.com/meeting" → "Schedule a Meeting"',
          'Example: Change "zoom.us/j/12345?pwd=..." → "Join Zoom Meeting"',
          'Avoid displaying raw URLs - describe what users will find',
          '**How to fix:** Highlight link in Canvas editor → Edit → Change display text'
        ],
        impactStatement: 'Screen reader users hear long URLs read aloud; links lack context',
        elementHtml: link.html
      });
    });

    // D: Broken links — empty, placeholder, or javascript: hrefs
    const brokenLinks = detectBrokenLinks(item.html);
    brokenLinks.forEach((link, linkIdx) => {
      issues.push({
        id: `d-broken-link-${courseId}-${item.type}-${index}-${linkIdx}`,
        type: 'accessibility',
        category: 'broken-link',
        severity: 'high',
        title: 'Broken or Invalid Link',
        description: `${link.reason}. Students clicking this link will encounter an error.`,
        location: item.location,
        autoFixAvailable: true,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        contentType: item.type as any,
        contentId: item.id || `${item.type}-${index}`,
        standardsTags: ['cvc-oei:D3', 'qm:8.1', 'qm:6.1', 'peralta:E1'],
        suggestedFix: 'Replace with a valid URL and descriptive link text',
        fixSteps: [
          'Enter a working replacement URL for this link',
          'Write descriptive link text that explains the destination',
          'Example: "View the Student Resources page" with a valid URL',
          '**How to fix:** In Canvas editor, click the link → Edit → Update the URL and display text'
        ],
        impactStatement: 'Students cannot access the linked resource; breaks course navigation',
        elementHtml: sanitizeHtmlForStorage(link.html)
      });
    });

    // D: Tables missing headers
    // TODO: RESUME — "Table Missing Headers" tabled for later development
    const tablesNoHeaders = item.html.match(/<table(?![^>]*<th[^>]*>).*?<\/table>/gis);
    if (false && tablesNoHeaders && tablesNoHeaders.length > 0) {
      issues.push({
        id: `d-table-headers-${courseId}-${item.type}-${index}`,
        type: 'accessibility',
        category: 'table-headers',
        severity: 'high',
        title: 'Table Missing Headers',
        description: `${tablesNoHeaders.length} table(s) lack header cells (<th>).`,
        location: item.location,
        autoFixAvailable: false,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        contentType: item.type as any,
        contentId: item.id || `${item.type}-${index}`,
        standardsTags: ['cvc-oei:D', 'wcag:1.3.1', 'qm:8.3'],
        suggestedFix: 'Convert first row to table headers',
        fixSteps: [
          'In Canvas table, select first row',
          'Right-click → Table Properties → Header',
          'Or use <th> tags instead of <td> in first row',
          '**How to fix:** Canvas editor → Select table → Table menu → Set header row'
        ],
        impactStatement: 'Screen reader users cannot understand table structure or relationships'
      });
    }

    // D: Headings visually styled but not structurally coded
    const fakeHeadings = item.html.match(/<(p|div)[^>]*style=["'][^"']*font-size:\s*(18|20|24|28)px[^"']*["'][^>]*>.*?<\/\1>/gi);
    if (fakeHeadings && fakeHeadings.length > 0) {
      issues.push({
        id: `d-fake-headings-${courseId}-${item.type}-${index}`,
        type: 'accessibility',
        category: 'heading-structure',
        severity: 'medium',
        title: 'Headings Visually Styled But Not Structurally Coded',
        description: `${fakeHeadings.length} item(s) look like headings but aren't using proper heading tags.`,
        location: item.location,
        autoFixAvailable: true,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        contentType: item.type as any,
        contentId: item.id || `${item.type}-${index}`,
        standardsTags: ['cvc-oei:D', 'wcag:1.3.1', 'wcag:2.4.6', 'qm:8.2'],
        suggestedFix: 'Convert to proper heading levels',
        fixSteps: [
          'Select the text',
          'Use Canvas "Format" menu → Choose Heading 2, Heading 3, etc.',
          'Don\'t just make text bigger/bold - use actual heading styles',
          '**How to fix:** Highlight text → Format dropdown → Select "Heading 2"'
        ],
        impactStatement: 'Screen readers cannot navigate by headings; structure is not semantic'
      });
    }

    // D: Manual lists instead of list formatting — tabled by user
    // const manualLists = item.html.match(/(<p[^>]*>[•\-*]\s*.*?<\/p>\s*){2,}/gi);
    // if (manualLists && manualLists.length > 0) {
    //   issues.push({...}); // See docs/tabled-for-later/README.md to re-enable
    // }
  });

  return issues;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function checkForObjectives(module: any, allPages: any[] = []): { found: boolean; measurable: boolean; aligned: boolean; evidence: string; existingObjectives?: string[]; whereToAdd?: string; whereToAddPageUrl?: string | null } {
  const items = module.items || [];
  
  // ============================================================================
  // STEP 0: Check if this is a non-instructional module (No Class, Holiday, etc.)
  // ============================================================================
  
  const moduleTitle = (module.name || '').toLowerCase();
  const moduleDescription = (module.description || '').toLowerCase();
  
  // Patterns that indicate non-instructional modules
  const nonInstructionalPatterns = [
    /\bno\s+class(?:\s+(?:this\s+week|today|meeting))?\b/i,  // "No Class", "No Class This Week", "No Class Meeting"
    /\bclass\s+cancel(?:ed|led)\b/i,  // "Class Canceled"
    /\bholi?day\s+(?:week|break)?\b/i,  // "Holiday", "Holiday Week", "Holiday Break"
    /\b(?:spring|winter|fall|summer)\s+break\b/i,  // Seasonal breaks
    /\bthanksgiving\b/i,  // Thanksgiving
    /\bno\s+instruction\b/i,  // "No Instruction"
    /\bbreak\s+week\b/i,  // "Break Week"
    /\bexam(?:s)?\s+week\b/i,  // "Exam Week" or "Exams Week"
    /\bfinals?\s+week\b/i,  // "Final Week" or "Finals Week"
    /\boptional\s+(?:module|week|reading)\b/i  // "Optional Module/Week"
  ];
  
  // Only formal graded assessments (Assignments, Quizzes) override a "No Class" / holiday
  // designation. Discussions and Pages alone do NOT — a "No Class Meeting" module that only
  // has a lightweight discussion or a page doesn't require formal learning objectives.
  const hasInstructionalContent = items.some((item: any) =>
    item.type === 'Assignment' ||
    item.type === 'Quiz'
  );
  
  const isNonInstructional = nonInstructionalPatterns.some(pattern => 
    pattern.test(moduleTitle) || pattern.test(moduleDescription)
  );
  
  // 🔍 DEBUG LOGGING
  
  // If patterns match BUT module has instructional content, treat it as instructional
  if (isNonInstructional && !hasInstructionalContent) {
    
    // Return as if objectives were found to prevent flagging
    return {
      found: true,
      measurable: true,
      aligned: false,
      evidence: 'Non-instructional module (No Class, Holiday, Break, etc.) - learning outcomes not required',
      whereToAddPageUrl: null
    };
  }
  
  if (isNonInstructional && hasInstructionalContent) {
  }
  
  // Helper function to find a page in allPages by URL, with title-based fallback
  const findPageByUrl = (pageUrl: string | null, pageTitle?: string) => {
    // Primary: exact URL match
    if (pageUrl) {
      const found = allPages.find(p => p.url === pageUrl);
      if (found) {
        return found;
      }
    }
    // Fallback: exact title match (case-insensitive)
    if (pageTitle) {
      const byExactTitle = allPages.find(p =>
        p.title?.toLowerCase() === pageTitle.toLowerCase()
      );
      if (byExactTitle) {
        return byExactTitle;
      }
      // Fuzzy: one title contains the other
      const byFuzzy = allPages.find(p => {
        const pt = (p.title || '').toLowerCase();
        const it = pageTitle.toLowerCase();
        return pt.includes(it) || it.includes(pt);
      });
      if (byFuzzy) {
      } else {
      }
      return byFuzzy || null;
    }
    return null;
  };

  // STEP 1: Look for overview/intro/review/summary pages (most common places for objectives)
  const overviewPageItems = items.filter((item: any) =>
    item.type === 'Page' && (
      item.title?.toLowerCase().includes('overview') ||
      item.title?.toLowerCase().includes('introduction') ||
      item.title?.toLowerCase().includes('intro') ||
      item.title?.toLowerCase().includes('start here') ||
      item.title?.toLowerCase().includes('objectives') ||
      item.title?.toLowerCase().includes('outcomes') ||
      item.title?.toLowerCase().includes('learning goals') ||
      item.title?.toLowerCase().includes('review') ||
      item.title?.toLowerCase().includes('summary') ||
      item.title?.toLowerCase().includes('wrap up') ||
      item.title?.toLowerCase().includes('wrap-up') ||
      item.title?.toLowerCase().includes('module guide')
    )
  );
  
  overviewPageItems.forEach(item => {
  });
  
  // STEP 2: Scan overview pages for objectives
  for (const pageItem of overviewPageItems) {
    // Try to find the actual page content from allPages (URL first, then title fallback)
    const actualPage = findPageByUrl(pageItem.page_url || null, pageItem.title);
    const content = actualPage?.body || pageItem.content || pageItem.body || pageItem.description || '';
    const pageTitle = actualPage?.title || pageItem.title;
    
    if (content) {
      const extractedObjectives = extractObjectivesFromText(content);
      
      // If we found objectives in the content, check if they're measurable
      // UPDATED: More comprehensive Bloom's verb list and better validation
      if (extractedObjectives.length >= 2) {
        const vagueverbs = /\b(understand|learn|know|appreciate|be aware of|familiarize)\b/i;
        const bloomsVerbs = /\b(identify|define|describe|explain|apply|demonstrate|analyze|compare|contrast|evaluate|create|design|develop|construct|formulate|synthesize|assess|critique|plan|produce|compose|investigate|examine|classify|categorize|distinguish|interpret|infer|predict|summarize|solve|calculate|implement|use|execute|relate|illustrate|extend|modify|adapt|integrate|organize|restructure|generate|hypothesize|test|measure|judge|select|choose|prioritize|rank|recommend|justify|argue|defend|support|interrogate|determine|write|take|reflect|explore|learning to|creating|developing|designing|building|expected to|participate|engage|attend|join|complete|review)\b/i;
        
        // Count how many objectives have measurable verbs
        const measurableCount = extractedObjectives.filter(obj => bloomsVerbs.test(obj)).length;
        const vagueCount = extractedObjectives.filter(obj => vagueverbs.test(obj) && !bloomsVerbs.test(obj)).length;
        
        // If at least 50% are measurable, consider them valid
        const hasMeasurable = measurableCount >= Math.ceil(extractedObjectives.length / 2);
        
        // Check if there's an alignment map
        const hasAlignment = content.toLowerCase().includes('align') || 
                            content.toLowerCase().includes('maps to') ||
                            content.toLowerCase().includes('→');
        
        return {
          found: true,
          measurable: hasMeasurable,
          aligned: hasAlignment,
          evidence: content.substring(0, 500),
          existingObjectives: extractedObjectives,
          whereToAdd: pageTitle,
          whereToAddPageUrl: actualPage?.url || pageItem.page_url || null
        };
      }
    }
  }

  // STEP 3: Check module description for objectives
  const moduleDesc = module.description || '';
  if (moduleDesc) {
    const extractedObjectives = extractObjectivesFromText(moduleDesc);
    if (extractedObjectives.length >= 2) {
      const vagueverbs = /\b(understand|learn|know|appreciate|be aware of|familiarize)\b/i;
      const bloomsVerbs = /\b(identify|define|describe|explain|apply|demonstrate|analyze|compare|contrast|evaluate|create|design|develop|construct|formulate|synthesize|assess|critique|plan|produce|compose|investigate|examine|classify|categorize|distinguish|interpret|infer|predict|summarize|solve|calculate|implement|use|execute|relate|illustrate|extend|modify|adapt|integrate|organize|restructure|generate|hypothesize|test|measure|judge|select|choose|prioritize|rank|recommend|justify|argue|defend|support|interrogate|determine|write|take|reflect|explore|learning to|creating|developing|designing|building|expected to|participate|engage|attend|join|complete|review)\b/i;
      
      const measurableCount = extractedObjectives.filter(obj => bloomsVerbs.test(obj)).length;
      const hasMeasurable = measurableCount >= Math.ceil(extractedObjectives.length / 2);
      
      return {
        found: true,
        measurable: hasMeasurable,
        aligned: false,
        evidence: extractedObjectives.join('\n'),
        existingObjectives: extractedObjectives,
        whereToAdd: 'Module description',
        whereToAddPageUrl: null // Module description has no page URL
      };
    }
  }
  
  // STEP 4: Scan ALL pages in the module as a last resort
  const allPageItems = items.filter((item: any) => item.type === 'Page');

  // If the module has NO pages at all, still flag it but signal that AI can't auto-fix
  // (whereToAddPageUrl: null is the signal — no page to inject into)
  if (allPageItems.length === 0) {
    return {
      found: false,
      measurable: false,
      aligned: false,
      evidence: 'Module has no pages',
      whereToAdd: 'Add an intro or overview page to this module first',
      whereToAddPageUrl: null
    };
  }
  for (const pageItem of allPageItems) {
    // Try to find the actual page content from allPages (URL first, then title fallback)
    const actualPage = findPageByUrl(pageItem.page_url || null, pageItem.title);
    const content = actualPage?.body || pageItem.content || pageItem.body || pageItem.description || '';
    const pageTitle = actualPage?.title || pageItem.title;
    
    if (content) {
      const extractedObjectives = extractObjectivesFromText(content);
      if (extractedObjectives.length >= 2) {
        const vagueverbs = /\b(understand|learn|know|appreciate|be aware of|familiarize)\b/i;
        const bloomsVerbs = /\b(identify|define|describe|explain|apply|demonstrate|analyze|compare|contrast|evaluate|create|design|develop|construct|formulate|synthesize|assess|critique|plan|produce|compose|investigate|examine|classify|categorize|distinguish|interpret|infer|predict|summarize|solve|calculate|implement|use|execute|relate|illustrate|extend|modify|adapt|integrate|organize|restructure|generate|hypothesize|test|measure|judge|select|choose|prioritize|rank|recommend|justify|argue|defend|support|interrogate|determine|write|take|reflect|explore|learning to|creating|developing|designing|building|expected to|participate|engage|attend|join|complete|review)\b/i;
        
        const measurableCount = extractedObjectives.filter(obj => bloomsVerbs.test(obj)).length;
        const hasMeasurable = measurableCount >= Math.ceil(extractedObjectives.length / 2);
        
        return {
          found: true,
          measurable: hasMeasurable,
          aligned: false,
          evidence: content.substring(0, 500),
          existingObjectives: extractedObjectives,
          whereToAdd: pageTitle,
          whereToAddPageUrl: actualPage?.url || pageItem.page_url || null
        };
      }
    }
  }

  const firstOverviewPage = overviewPageItems[0];
  const whereToAdd = firstOverviewPage
    ? (firstOverviewPage.title || 'Module overview page')
    : (allPageItems[0] ? (allPageItems[0].title || 'Module overview page') : 'Module overview page');
  
  // Determine the page URL for the recommended target page
  const targetPageUrl = firstOverviewPage?.page_url || allPageItems[0]?.page_url || null;

  return {
    found: false,
    measurable: false,
    aligned: false,
    evidence: 'No learning objectives found in module pages',
    whereToAdd: whereToAdd,
    whereToAddPageUrl: targetPageUrl
  };
}

/**
 * Extract objectives from text content
 * Looks for patterns like bullet points, numbered lists, or "Students will..." statements
 * UPDATED: Better recognition of objective headings and Bloom's taxonomy verbs
 */
function extractObjectivesFromText(text: string): string[] {
  const objectives: string[] = [];
  
  // Remove HTML tags for cleaner parsing
  const cleanText = text.replace(/<[^>]+>/g, '\n').replace(/&nbsp;/g, ' ');
  
  // Check if there's an objectives heading (expanded to match more variations)
  // Matches patterns like:
  // - "Module Objectives:", "Learning Objectives:", "Course Objectives:"
  // - "The training objectives for this course include:"
  // - "Training objectives:", "Lesson objectives:"
  // - "By the end of this module, you will be able to:"
  // - "In this course we will do the following:" (NEW)
  // - "Training Expectations" (NEW)
  const hasObjectivesHeading = /(?:the\s+)?(?:module|learning|course|unit|lesson|training)\s+(?:objectives|outcomes|goals|competencies|expectations)(?:\s+for\s+this\s+(?:module|course|unit|lesson))?(?:\s+(?:include|are))?[:\s]|(?:by\s+the\s+end\s+of\s+this\s+(?:module|unit|lesson|course),?\s+(?:you\s+will|students\s+will)\s+(?:be\s+able\s+to|learn))|(?:in\s+this\s+(?:course|module|unit|lesson|training)\s+(?:we\s+will|you\s+will|students\s+will)\s+(?:do\s+the\s+following|learn\s+to|be\s+expected\s+to))/i.test(cleanText);
  
  // Split by common separators
  const lines = cleanText.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
  
  // If we found an objectives heading, extract everything after it until the next heading or section break
  if (hasObjectivesHeading) {
    let inObjectivesSection = false;
    
    for (const line of lines) {
      // Check if this is the objectives heading (expanded pattern to include "expectations" and "we will do the following")
      if (/(?:the\s+)?(?:module|learning|course|unit|lesson|training)\s+(?:objectives|outcomes|goals|competencies|expectations)(?:\s+for\s+this\s+(?:module|course|unit|lesson))?(?:\s+(?:include|are))?[:\s]|(?:by\s+the\s+end\s+of\s+this\s+(?:module|unit|lesson|course),?\s+(?:you\s+will|students\s+will)\s+(?:be\s+able\s+to|learn))|(?:in\s+this\s+(?:course|module|unit|lesson|training)\s+(?:we\s+will|you\s+will|students\s+will)\s+(?:do\s+the\s+following|learn\s+to|be\s+expected\s+to))/i.test(line)) {
        inObjectivesSection = true;
        continue; // Skip the heading itself
      }
      
      // Stop if we hit another major heading (but not if it's just a sub-point)
      // Don't stop at "Move incrementally" or similar sub-headings - only stop at major section headers
      if (inObjectivesSection && /^(?:overview|introduction|content|materials|activities|assessment|readings|resources|grading|schedule|assignments):/i.test(line)) {
        break;
      }
      
      if (inObjectivesSection) {
        // Extract objective from bulleted/numbered lists or direct statements
        const numberedMatch = line.match(/^(?:\d+[\.\)])?\s*(.+)/);
        const bulletedMatch = line.match(/^[•\-*]?\s*(.+)/);
        
        const text = (numberedMatch || bulletedMatch)?.[1]?.trim() || line.trim();
        
        // Validate: Must have action language (expanded to include more verbs)
        // Include verbs like: take, reflect, explore, develop, create, apply, learn to, expected to
        const actionVerbs = /\b(identify|define|describe|explain|apply|demonstrate|analyze|compare|contrast|evaluate|create|design|develop|construct|formulate|synthesize|assess|critique|plan|produce|compose|investigate|examine|classify|categorize|distinguish|interpret|infer|predict|summarize|solve|calculate|implement|use|execute|employ|relate|illustrate|extend|modify|adapt|integrate|organize|restructure|generate|hypothesize|test|measure|judge|select|choose|prioritize|rank|recommend|justify|argue|defend|support|interrogate|determine|write|take|reflect|explore|learning to|creating|developing|designing|building|expected to|participate|engage|attend|join|complete|review)\b/i;
        
        if (text.length > 15 && actionVerbs.test(text)) {
          // Make sure it's not just the heading itself repeated
          if (!(/^(?:the\s+)?(?:module|learning|course|unit|lesson|training)\s+(?:objectives|outcomes|goals|competencies|expectations)/i.test(text))) {
            objectives.push(text);
          }
        }
      }
    }
    
    // If we found objectives in the dedicated section, return them
    if (objectives.length > 0) {
      return objectives.slice(0, 10); // Limit to first 10 objectives
    }
    
  }
  
  // Fallback: Original logic for objectives scattered throughout content
  for (const line of lines) {
    // Match patterns like:
    // - Numbered: "1. Objective text" or "1) Objective text"
    // - Bulleted: "• text" or "- text" or "* text"
    // - "Students will be able to..."
    // - Action verbs at start (Analyze, Evaluate, Create, etc.)
    
    const numberedMatch = line.match(/^(?:\d+[\.\)])\s*(.+)/);
    const bulletedMatch = line.match(/^[•\-*]\s*(.+)/);
    const swbatMatch = line.match(/(?:students will|learners will|you will|we will)(?:\s+be able to)?\s*(.+)/i);
    
    if (numberedMatch) {
      const obj = numberedMatch[1].trim();
      // Include if it has action language
      if (obj.length > 15) {
        objectives.push(obj);
      }
    } else if (bulletedMatch) {
      const text = bulletedMatch[1].trim();
      // Be more lenient - look for action verbs including "take", "reflect", "explore", "participate", "expected", etc.
      if (text.length > 15 && /\b(apply|analyze|create|evaluate|explain|identify|describe|compare|demonstrate|solve|develop|take|reflect|explore|examine|investigate|learning|designing|developing|creating|building|define|participate|engage|attend|expected|complete|review)\b/i.test(text)) {
        objectives.push(text);
      }
    } else if (swbatMatch) {
      objectives.push(swbatMatch[1].trim());
    } else if (line.length > 20 && /^(analyze|evaluate|create|apply|design|compare|explain|identify|demonstrate|describe|classify|solve|construct|formulate|develop|learning to|take a|reflect on|explore|examine|investigate|build|write|discuss|define|participate|attend|expected to|engage in|complete)/i.test(line)) {
      // Starts with action verb - likely an objective
      objectives.push(line);
    }
  }
  
  if (objectives.length > 0) {
  }
  
  return objectives.slice(0, 10); // Limit to first 10 objectives
}

function generateSampleObjectives(moduleName: string): string {
  return `Sample measurable objectives for "${moduleName}":

1. Analyze the key concepts of [topic] and their relationships
2. Evaluate [content] using [framework or criteria]
3. Create a [deliverable] that demonstrates understanding of [skill]
4. Compare and contrast [concept A] and [concept B]
5. Apply [theory] to solve [real-world problem]

Each objective should:
✓ Start with a measurable action verb (Bloom's Taxonomy)
✓ Specify what students will do
✓ Be assessable through course activities`;
}

function generateAlignmentMap(module: any): string {
  const items = module.items || [];
  return `Alignment Map Example:

Objective 1: [Text of objective]
→ Page: "Introduction to Concepts"
→ Assignment: "Concept Application Exercise"
→ Quiz: "Knowledge Check 1"

Objective 2: [Text of objective]
→ Page: "Deep Dive into Theory"
→ Discussion: "Real-World Examples"
→ Assignment: "Case Study Analysis"

This helps students see WHY each piece of content matters.`;
}

function checkHeadingStructure(html: string): { isInconsistent: boolean; description?: string } {
  const headings = html.match(/<h([1-6])[^>]*>/gi);
  if (!headings || headings.length < 2) {
    return { isInconsistent: false };
  }

  const levels = headings.map(h => parseInt(h.match(/<h([1-6])/i)?.[1] || '0'));
  
  // Check for skipped levels
  for (let i = 1; i < levels.length; i++) {
    const diff = levels[i] - levels[i - 1];
    if (diff > 1) {
      return {
        isInconsistent: true,
        description: `Heading jumps from H${levels[i - 1]} to H${levels[i]}, skipping levels`
      };
    }
  }

  return { isInconsistent: false };
}

function checkInstructionClarity(html: string): {
  hasWhatToDo: boolean;
  hasSteps: boolean;
  hasSubmissionInfo: boolean;
  isDense: boolean;
  missingElements: string[];
} {
  const text = html.replace(/<[^>]+>/g, ' ').toLowerCase();
  
  const hasWhatToDo = /\b(write|create|submit|complete|analyze|design|develop)\b/.test(text);
  const hasSteps = /\b(step|first|second|then|next|finally|\d+\.)/.test(text) || /<ol|<li/.test(html);
  const hasSubmissionInfo = /\b(submit|upload|turn in|canvas|assignment)\b/.test(text);
  
  const wordCount = text.split(/\s+/).length;
  const hasLongParagraphs = html.includes('</p>') && !html.includes('<ul') && !html.includes('<ol') && wordCount > 150;
  const isDense = hasLongParagraphs || wordCount > 300;

  const missingElements = [];
  if (!hasWhatToDo) missingElements.push('What to do');
  if (!hasSteps) missingElements.push('Steps in order');
  if (!hasSubmissionInfo) missingElements.push('Where/how to submit');

  return {
    hasWhatToDo,
    hasSteps,
    hasSubmissionInfo,
    isDense,
    missingElements
  };
}

function generateClearInstructions(assignmentTitle: string): string {
  return `Clear Instructions Template for "${assignmentTitle}":

**What You'll Do:**
[One sentence describing the task]

**Steps:**
1. [First action]
2. [Second action]
3. [Third action]

**Requirements:**
• Length: [X words/pages]
• Format: [File type]
• Due: [Date and time]

**How to Submit:**
Submit via Canvas Assignments → "${assignmentTitle}"

**What Good Looks Like:**
[Brief description or link to example]

**Grading:**
See rubric below [link to rubric]`;
}

function checkForFeedbackMechanism(content: CourseContent): boolean {
  const syllabus = content.syllabus?.body || content.frontPage?.body || '';
  const pages = content.pages || [];
  
  const allText = syllabus + pages.map(p => p.body).join(' ');
  
  return /\b(feedback|survey|anonymous|suggestions?)\b/i.test(allText);
}

function checkForPolicies(syllabus: any): { complete: boolean; missing: string[]; present: string[] } {
  const text = (syllabus.body || syllabus.description || '').toLowerCase();

  const policies = {
    'grading': /\b(grading|grade scale|grade weight)\b/.test(text),
    'late work': /\b(late|extension|deadline)\b/.test(text),
    'communication': /\b(communication|email|office hours|response time)\b/.test(text),
    'accommodations': /\b(accommodations?|disability|accessibility services)\b/.test(text),
    'academic integrity': /\b(academic integrity|plagiarism|cheating|honor code)\b/.test(text)
  };

  const missing = Object.entries(policies)
    .filter(([_, exists]) => !exists)
    .map(([name, _]) => name);

  const present = Object.entries(policies)
    .filter(([_, exists]) => exists)
    .map(([name, _]) => name);

  return {
    complete: missing.length === 0,
    missing,
    present
  };
}

function checkForStudentServiceLinks(content: CourseContent): { adequate: boolean } {
  const syllabus = content.syllabus?.body || content.frontPage?.body || '';
  const pages = content.pages || [];
  
  const allText = syllabus + pages.map(p => p.body).join(' ');
  
  const hasLibrary = /\b(library|research)\b/i.test(allText);
  const hasTutoring = /\b(tutoring|academic support)\b/i.test(allText);
  const hasTech = /\b(tech support|it help|technical)\b/i.test(allText);
  
  return {
    adequate: hasLibrary && hasTutoring && hasTech
  };
}

function checkForCommunicationGuidelines(content: CourseContent): { hasResponseTime: boolean; hasFeedbackTimeline: boolean; hasContactMethod: boolean; score: number } {
  // Gather all text from syllabus + published pages
  const textParts: string[] = [];
  if (content.syllabus?.body) textParts.push(content.syllabus.body);
  if (content.frontPage?.body) textParts.push(content.frontPage.body);
  (content.pages || []).forEach((p: any) => {
    if (p.body) textParts.push(p.body);
  });
  const allText = textParts.join(' ').toLowerCase();

  const hasResponseTime = /\b(response time|within\s+\d+\s*hours?|respond\s+within|reply\s+within|within\s+\d+\s*(business\s+)?days?|24[\s-]*hour|48[\s-]*hour)\b/i.test(allText);
  const hasFeedbackTimeline = /\b(feedback\s+within|graded?\s+within|return(ed)?\s+(grades?|assignments?|feedback)\s+within|grading\s+turnaround|1\s*week|2\s*weeks|7\s*days|14\s*days)\b/i.test(allText);
  const hasContactMethod = /\b(canvas\s+(in)?box|inbox|office\s+hours|email\s+me|contact\s+me|reach\s+me|send\s+(me\s+)?(a\s+)?message|virtual\s+office)\b/i.test(allText);

  let score = 0;
  if (hasResponseTime) score++;
  if (hasFeedbackTimeline) score++;
  if (hasContactMethod) score++;

  return { hasResponseTime, hasFeedbackTimeline, hasContactMethod, score };
}

/**
 * Gather all content from a module for AI analysis
 */
function gatherModuleContent(module: any): string {
  const items = module.items || [];
  const contentPieces: string[] = [];
  
  // Add module name
  contentPieces.push(`MODULE: ${module.name || ''}`);
  
  // Gather content from each item
  items.forEach((item: any) => {
    if (item.title) {
      // Include item type to help AI understand assessment methods
      const itemType = item.type ? ` (${item.type})` : '';
      contentPieces.push(`\nITEM: ${item.title}${itemType}`);
    }
    if (item.content) {
      // Strip HTML tags for cleaner content
      const cleanContent = item.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      contentPieces.push(cleanContent.substring(0, 1000)); // Limit per item
    }
    if (item.description) {
      const cleanDescription = item.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      contentPieces.push(cleanDescription.substring(0, 1000));
    }
  });
  
  return contentPieces.join('\n\n').substring(0, 4000); // Limit total content
}