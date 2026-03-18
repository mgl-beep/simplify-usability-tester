// Usability Scanner - CVC-OEI and Peralta Rubric Standards
// Scans for navigation consistency, chunking, multimedia, etc.

import { ScanIssue } from '../../App';
import { getStandardsTagsForIssue } from '../standards/standardsMapping';
import { sanitizeHtmlForStorage } from '../htmlSanitizer';

/**
 * Scan HTML content for usability issues
 */
export async function scanUsability(
  html: string,
  location: string,
  courseId: string,
  courseName: string,
  contentId: string,
  contentType: 'page' | 'assignment' | 'announcement' | 'discussion'
): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = [];
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Video caption check REMOVED — YouTube auto-generates captions on most videos.
  // WCAG 1.2.2 requires captions to *exist*, not be force-enabled via cc_load_policy=1.
  // We cannot reliably detect caption absence from embed URL params alone.

  // Check for long blocks of unformatted text
  issues.push(...checkTextChunking(doc, location, courseId, courseName, contentId, contentType));
  
  // Check for unclear instructions
  issues.push(...checkInstructions(doc, location, courseId, courseName, contentId, contentType));
  
  // Check navigation depth
  issues.push(...checkNavigationDepth(html, location, courseId, courseName, contentId, contentType));
  
  return issues;
}

/**
 * Check for long unbroken text blocks (CVC-OEI Standard)
 */
function checkTextChunking(
  doc: Document,
  location: string,
  courseId: string,
  courseName: string,
  contentId: string,
  contentType: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const paragraphs = doc.querySelectorAll('p');
  
  paragraphs.forEach((p, index) => {
    const text = p.textContent || '';
    const wordCount = text.split(/\s+/).length;
    
    // Flag paragraphs with more than 150 words
    if (wordCount > 150) {
      issues.push({
        id: `chunking-${courseId}-${contentId}-${index}`,
        type: 'usability',
        category: 'readability',
        severity: 'low',
        title: 'Long Text Block',
        description: `Paragraph has ${wordCount} words. Best practice is to break content into smaller chunks (under 150 words per paragraph).`,
        location: location,
        autoFixAvailable: true, // AI can break into shorter paragraphs
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        rubricStandard: 'CVC-OEI Course Design Rubric - Standard 3.1 (Content Readability)',
        standardsTags: getStandardsTagsForIssue('readability'),
        contentType: contentType,
        contentId: contentId,
        elementHtml: sanitizeHtmlForStorage(p.outerHTML), // Store full paragraph for exact match replacement
        suggestedFix: 'Break this paragraph into multiple smaller paragraphs or use bullet points',
        fixSteps: [
          '1. Open the page in Canvas editor',
          '2. Find the long paragraph',
          '3. Break it into 2-3 shorter paragraphs',
          '4. Consider using headings, bullets, or numbered lists'
        ]
      });
    }
  });
  
  return issues;
}

/**
 * Check for clear instructions (CVC-OEI Standard)
 */
function checkInstructions(
  doc: Document,
  location: string,
  courseId: string,
  courseName: string,
  contentId: string,
  contentType: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  
  // Check if content is an assignment type
  if (contentType === 'assignment') {
    const body = doc.body.textContent || '';
    
    // Check for instructional keywords
    const hasInstructions = 
      body.toLowerCase().includes('instruction') ||
      body.toLowerCase().includes('complete') ||
      body.toLowerCase().includes('submit') ||
      body.toLowerCase().includes('due');
    
    if (!hasInstructions && body.length < 50) {
      issues.push({
        id: `instructions-${courseId}-${contentId}`,
        type: 'usability',
        category: 'confusing-navigation',
        severity: 'low',
        title: 'Consider Expanding Assignment Instructions',
        description: 'Assignment description is very brief. Consider adding clearer instructions for students.',
        location: location,
        autoFixAvailable: false,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        rubricStandard: 'CVC-OEI Course Design Rubric - Standard 1.4 (Course Instructions)',
        standardsTags: getStandardsTagsForIssue('confusing-navigation'),
        contentType: contentType,
        contentId: contentId,
        suggestedFix: 'Add clear, step-by-step instructions for completing the assignment',
        fixSteps: [
          '1. Open the assignment in Canvas',
          '2. Click Edit',
          '3. Add detailed instructions including:',
          '   - What students need to do',
          '   - How to submit',
          '   - Grading criteria',
          '   - Due date reminder'
        ]
      });
    }
  }
  
  return issues;
}

/**
 * Check navigation depth (CVC-OEI Standard)
 */
function checkNavigationDepth(
  html: string,
  location: string,
  courseId: string,
  courseName: string,
  contentId: string,
  contentType: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  
  // DOM-based nesting depth check: walk the tree and count actual list nesting
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  function maxListDepth(el: Element, depth: number): number {
    let max = depth;
    for (const child of Array.from(el.children)) {
      const childDepth = (child.tagName === 'UL' || child.tagName === 'OL') ? depth + 1 : depth;
      max = Math.max(max, maxListDepth(child, childDepth));
    }
    return max;
  }

  const maxDepth = maxListDepth(doc.body, 0);

  if (maxDepth > 2) {
    issues.push({
      id: `deep-nav-${courseId}-${contentId}`,
      type: 'usability',
      category: 'deep-nav',
      severity: 'low',
      title: 'Complex Navigation Structure',
      description: 'Page has deeply nested navigation that may confuse students.',
      location: location,
      autoFixAvailable: false,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      rubricStandard: 'CVC-OEI Course Design Rubric - Standard 2.1 (Course Navigation)',
      standardsTags: getStandardsTagsForIssue('deep-nav'),
      contentType: contentType,
      contentId: contentId,
      suggestedFix: 'Simplify navigation to 2-3 levels maximum',
      fixSteps: [
        '1. Review the navigation structure',
        '2. Flatten deeply nested items',
        '3. Use clear category names',
        '4. Keep most content within 3 clicks of the home page'
      ]
    });
  }
  
  return issues;
}