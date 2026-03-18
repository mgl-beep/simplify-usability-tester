/**
 * Supabase Fixer - Fixes issues in imported courses stored in Supabase
 */

import type { ScanIssue } from '../App';
import { projectId, publicAnonKey } from './supabase/info';

/**
 * Result of a fix operation
 */
export interface FixResult {
  success: boolean;
  issueId: string;
  message: string;
  originalContent?: string;
  fixedContent?: string;
  contentId?: string;
  contentType?: string;
  customAltText?: string;
  customLinkText?: string;
  customCaption?: string;
}

/**
 * Get course from Supabase
 */
async function getCourse(courseId: string) {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-74508696/courses/${courseId}`,
    {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch course from Supabase');
  }

  const data = await response.json();
  return data;
}

/**
 * Update course in Supabase
 */
async function updateCourse(courseId: string, courseData: any) {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-74508696/courses/${courseId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ courseData })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update course in Supabase');
  }
}

/**
 * Find and update content in course data
 */
function updateContentInCourse(
  courseData: any,
  contentType: string,
  contentId: string,
  newContent: string
): void {
  if (!courseData || !courseData.files) {
    throw new Error('Invalid course data structure');
  }

  let updated = false;

  // Search through all HTML files in the course
  for (const filePath in courseData.files) {
    const file = courseData.files[filePath];
    
    if (file.type === 'html') {
      // Check if this is the file we're looking for based on contentType and contentId
      // For imported courses, contentId might be the file path or a simplified identifier
      if (filePath.includes(contentId) || file.id === contentId) {
        file.content = newContent;
        updated = true;
        break;
      }
    }
  }

  if (!updated) {
    console.warn(`⚠️ Could not find content to update: ${contentType} ${contentId}`);
  }
}

/**
 * Get content from an imported course in Supabase
 */
async function getSupabaseContent(
  courseId: string,
  contentId: string,
  contentType: string
): Promise<string> {
  const { course } = await getCourse(courseId);
  
  if (!course || !course.courseData || !course.courseData.files) {
    throw new Error('Course data not found');
  }

  // Search for the content
  for (const filePath in course.courseData.files) {
    const file = course.courseData.files[filePath];
    
    if (file.type === 'html') {
      if (filePath.includes(contentId) || file.id === contentId) {
        return file.content || '';
      }
    }
  }

  throw new Error(`Content not found: ${contentType} ${contentId}`);
}

/**
 * Fix contrast issues in HTML
 */
function fixContrast(doc: Document, issue: ScanIssue): string {
  // Find elements with low contrast and apply accessible colors
  const elements = doc.querySelectorAll('[style*="color"]');
  
  elements.forEach(el => {
    const htmlEl = el as HTMLElement;
    const style = htmlEl.getAttribute('style') || '';
    
    // Replace low-contrast colors with black
    const newStyle = style.replace(
      /color:\s*#[6-9a-fA-F]{3,6}/gi,
      'color: #000000'
    );
    
    htmlEl.setAttribute('style', newStyle);
  });

  return doc.body.innerHTML;
}

/**
 * Fix alt text issues in HTML
 */
function fixAltText(doc: Document, issue: ScanIssue): string {
  if (!issue.elementHtml || !issue.suggestedFix) {
    throw new Error('Missing element HTML or suggested alt text');
  }

  // Find the image and add alt text
  const images = doc.querySelectorAll('img');
  
  for (const img of images) {
    // Match by src or other attributes
    if (issue.elementHtml.includes(img.getAttribute('src') || '')) {
      img.setAttribute('alt', issue.suggestedFix);
      break;
    }
  }

  return doc.body.innerHTML;
}

/**
 * Fix link text issues in HTML
 */
function fixLinkText(doc: Document, issue: ScanIssue): string {
  if (!issue.elementHtml || !issue.suggestedFix) {
    throw new Error('Missing element HTML or suggested link text');
  }

  // Find the link and update text
  const links = doc.querySelectorAll('a');
  
  for (const link of links) {
    // Match by href
    if (issue.elementHtml.includes(link.getAttribute('href') || '')) {
      link.textContent = issue.suggestedFix;
      break;
    }
  }

  return doc.body.innerHTML;
}

/**
 * Fix heading hierarchy issues in HTML
 */
function fixHeadings(doc: Document): string {
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  let currentLevel = 1;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName[1]);
    
    if (level > currentLevel + 1) {
      const newHeading = doc.createElement(`h${currentLevel + 1}`);
      newHeading.innerHTML = heading.innerHTML;
      newHeading.className = heading.className;
      heading.replaceWith(newHeading);
      currentLevel = currentLevel + 1;
    } else {
      currentLevel = level;
    }
  });
  
  return doc.body.innerHTML;
}

/**
 * Fix table header issues in HTML
 */
function fixTableHeaders(doc: Document): string {
  const tables = doc.querySelectorAll('table');
  
  tables.forEach(table => {
    const firstRow = table.querySelector('tr');
    if (!firstRow) return;
    
    const cells = firstRow.querySelectorAll('td');
    if (cells.length === 0) return;
    
    // Convert first row cells to header cells
    cells.forEach(cell => {
      const th = doc.createElement('th');
      th.innerHTML = cell.innerHTML;
      th.scope = 'col';
      cell.replaceWith(th);
    });
    
    // Wrap first row in thead if not already
    if (!firstRow.parentElement || firstRow.parentElement.tagName !== 'THEAD') {
      const thead = doc.createElement('thead');
      firstRow.parentElement?.insertBefore(thead, firstRow);
      thead.appendChild(firstRow);
    }
  });
  
  return doc.body.innerHTML;
}

/**
 * Fix table caption issues in HTML
 */
function fixTableCaption(doc: Document, issue: ScanIssue): string {
  const tables = doc.querySelectorAll('table');
  
  tables.forEach(table => {
    // Only add caption if it doesn't have one
    if (!table.querySelector('caption')) {
      const caption = doc.createElement('caption');
      caption.textContent = issue.suggestedFix || 'Data table';
      table.insertBefore(caption, table.firstChild);
    }
  });
  
  return doc.body.innerHTML;
}

/**
 * Main function to fix a Supabase issue (imported course)
 */
export async function fixSupabaseIssue(
  courseId: string,
  issue: ScanIssue
): Promise<FixResult> {

  if (!issue.autoFixAvailable) {
    return {
      success: false,
      issueId: issue.id,
      message: 'This issue requires manual fixing',
    };
  }

  if (!issue.contentId || !issue.contentType) {
    return {
      success: false,
      issueId: issue.id,
      message: 'Missing content information',
    };
  }

  try {
    // Get current content from Supabase
    const originalContent = await getSupabaseContent(
      courseId,
      issue.contentId,
      issue.contentType
    );

    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(originalContent, 'text/html');

    // Apply the appropriate fix
    let fixedContent = originalContent;
    let customAltText: string | undefined;
    let customLinkText: string | undefined;
    let customCaption: string | undefined;

    switch (issue.category) {
      case 'alt-text':
        fixedContent = fixAltText(doc, issue);
        customAltText = issue.suggestedFix;
        break;
      case 'long-url':
        fixedContent = fixLinkText(doc, issue);
        customLinkText = issue.suggestedFix;
        break;
      case 'contrast':
        fixedContent = fixContrast(doc, issue);
        break;
      case 'inconsistent-heading':
        fixedContent = fixHeadings(doc);
        break;
      case 'table-headers':
        fixedContent = fixTableHeaders(doc);
        break;
      case 'table-caption':
        fixedContent = fixTableCaption(doc, issue);
        customCaption = issue.suggestedFix;
        break;
      default:
        return {
          success: false,
          issueId: issue.id,
          message: `Auto-fix not yet supported for ${issue.category}`,
        };
    }

    // Check if content actually changed
    if (fixedContent === originalContent) {
      return {
        success: false,
        issueId: issue.id,
        message: 'No changes could be applied',
      };
    }

    // Update content in Supabase
    const { course } = await getCourse(courseId);
    updateContentInCourse(
      course.courseData,
      issue.contentType,
      issue.contentId,
      fixedContent
    );
    await updateCourse(courseId, course.courseData);

    return {
      success: true,
      issueId: issue.id,
      message: `Fixed ${issue.title}`,
      originalContent: originalContent,
      fixedContent: fixedContent,
      contentId: issue.contentId,
      contentType: issue.contentType,
      customAltText,
      customLinkText,
      customCaption
    };
  } catch (error) {
    console.error(`❌ Error fixing Supabase issue ${issue.id}:`, error);
    return {
      success: false,
      issueId: issue.id,
      message: error instanceof Error ? error.message : 'Failed to fix issue',
    };
  }
}

/**
 * Update content directly in an imported course (used for undo)
 */
export async function updateImportedContent(
  courseId: string,
  contentId: string,
  contentType: 'page' | 'assignment' | 'announcement' | 'discussion',
  newContent: string
): Promise<void> {
  
  // 1. Fetch course from Supabase
  const { course } = await getCourse(courseId);
  
  if (!course || !course.courseData) {
    throw new Error('Course not found in Supabase');
  }
  
  // 2. Find and update the content
  updateContentInCourse(
    course.courseData,
    contentType,
    contentId,
    newContent
  );
  
  // 3. Save back to Supabase
  await updateCourse(courseId, course.courseData);
  
}
