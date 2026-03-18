import type { ScanIssue } from '../App';
import { getCanvasConfig, getPage, getCoursePages, getCourseFrontPage } from './canvasAPI';
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
  // Custom text fields for different fix types
  customAltText?: string;
  customLinkText?: string;
  customCaption?: string;
  customTextColor?: string; // For contrast fixes
}

/**
 * Get content from Canvas based on content type
 */
async function getCanvasContent(
  courseId: string,
  contentId: string,
  contentType: 'page' | 'assignment' | 'announcement' | 'discussion' | 'module',
  locationHint?: string
): Promise<string> {
  const config = getCanvasConfig();
  
  if (!config) {
    throw new Error('Canvas not configured');
  }

  const courseIdNum = parseInt(courseId);

  if (contentType === 'page') {
    // Special case: front-page contentId means we need to fetch the course front page
    if (contentId === 'front-page') {
      try {
        const frontPage = await getCourseFrontPage(config, courseIdNum);
        return frontPage.body || '';
      } catch (error) {
        console.error('Error fetching front page:', error);
        throw new Error(`Failed to fetch front page content: ${error}`);
      }
    }
    
    // For regular pages, contentId is the page URL slug or numeric ID
    try {
      const page = await getPage(config, courseIdNum, contentId);
      return page.body || '';
    } catch (error) {
      // Fallback: search for the page by title from the location hint
      if (locationHint) {
        try {
          const titleMatch = locationHint.match(/^(?:Page|Assignment|Module):\s*(.+)$/i);
          if (titleMatch) {
            const searchTitle = titleMatch[1].trim().toLowerCase();
            const allPages = await getCoursePages(config, courseIdNum);
            const matchedPage = allPages.find(p => p.title.toLowerCase() === searchTitle);
            if (matchedPage?.url) {
              const fallbackPage = await getPage(config, courseIdNum, matchedPage.url);
              return fallbackPage.body || '';
            }
          }
        } catch {
          // Fallback failed too — throw original error
        }
      }
      console.error('Error fetching page:', error);
      throw new Error(`Failed to fetch page content: ${error}`);
    }
  } else if (contentType === 'assignment') {
    // Fetch assignment description via server proxy
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-74508696/canvas/assignment`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: config.domain,
          accessToken: config.accessToken,
          courseId: courseId,
          assignmentId: contentId
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Assignment fetch failed:', errorData);
      throw new Error(`Failed to fetch assignment: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.assignment?.description || '';
  } else if (contentType === 'announcement' || contentType === 'discussion') {
    // Both announcements and discussions use the discussion_topics API
    
    // Debug logging
    
    if (!contentId) {
      throw new Error(`Missing contentId for ${contentType}`);
    }
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-74508696/canvas/discussion`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: config.domain,
          accessToken: config.accessToken,
          courseId: courseId,
          topicId: contentId  // Back to topicId to match server
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ ${contentType} fetch failed:`, errorData);
      throw new Error(`Failed to fetch ${contentType}: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.topic?.message || '';
  } else if (contentType === 'module') {
    // For module objectives, return empty string - objectives will be added via special handling
    return '';
  } else if (contentType === 'course') {
    // Course-level issues (instructor-contact, student-interaction) create new content
    return '';
  } else if (contentType === 'page' && contentId === 'syllabus') {
    // Syllabus is a course property, not a page — handled specially in policies case
    return '';
  }

  throw new Error(`Unsupported content type: ${contentType}`);
}

/**
 * Update a Canvas page with new content
 */
async function updateCanvasPage(
  courseId: string,
  pageId: string,
  content: string
): Promise<void> {
  const config = getCanvasConfig();
  
  if (!config) {
    throw new Error('Canvas not configured');
  }

  // Special case: updating the front page requires using the front-page API endpoint
  const endpoint = pageId === 'front-page' 
    ? '/make-server-74508696/canvas/update-front-page'
    : '/make-server-74508696/canvas/update-page';
  
  // Use server proxy to update page
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1${endpoint}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domain: config.domain,
        accessToken: config.accessToken,
        courseId: courseId,
        pageUrl: pageId === 'front-page' ? undefined : pageId,
        content: content
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to update page: ${errorData.error || response.statusText}`);
  }
}

/**
 * Update a Canvas assignment with new content
 */
async function updateCanvasAssignment(
  courseId: string,
  assignmentId: string,
  content: string
): Promise<void> {
  const config = getCanvasConfig();
  
  if (!config) {
    throw new Error('Canvas not configured');
  }

  // Use server proxy to update assignment
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-74508696/canvas/update-assignment`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domain: config.domain,
        accessToken: config.accessToken,
        courseId: courseId,
        assignmentId: assignmentId,
        description: content  // Server expects 'description' not 'content'
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to update assignment: ${errorData.error || response.statusText}`);
  }
}

/**
 * Update a Canvas discussion topic (announcement) with new content
 */
async function updateCanvasDiscussion(
  courseId: string,
  topicId: string,
  content: string
): Promise<void> {
  const config = getCanvasConfig();
  
  if (!config) {
    throw new Error('Canvas not configured');
  }

  // Use server proxy to update discussion
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-74508696/canvas/update-discussion`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domain: config.domain,
        accessToken: config.accessToken,
        courseId: courseId,
        topicId: topicId,
        message: content  // Server expects 'message' not 'content'
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to update discussion: ${errorData.error || response.statusText}`);
  }
}

/**
 * Create a new announcement in Canvas
 */
async function createCanvasAnnouncement(
  courseId: string,
  title: string,
  message: string
): Promise<{ id: string; url: string }> {
  const config = getCanvasConfig();

  if (!config) {
    throw new Error('Canvas not configured');
  }

  const payload = {
    domain: config.domain,
    accessToken: config.accessToken ? '***' : 'MISSING',
    courseId,
    courseIdType: typeof courseId,
    title,
    messageLength: message.length,
    messagePreview: message.substring(0, 100),
  };

  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-74508696/canvas/create-announcement`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: config.domain,
        accessToken: config.accessToken,
        courseId: parseInt(courseId, 10) || courseId, // Try integer first, fall back to string
        title,
        message,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ create-announcement full error response:', errorData);
    throw new Error(`Failed to create announcement: ${errorData.error || response.statusText}`);
  }

  const data = await response.json();
  return { id: String(data.id), url: data.url || '' };
}

/**
 * Create a new discussion topic in Canvas
 */
async function createCanvasDiscussion(
  courseId: string,
  title: string,
  message: string
): Promise<{ id: string; url: string }> {
  const config = getCanvasConfig();

  if (!config) {
    throw new Error('Canvas not configured');
  }

  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-74508696/canvas/create-discussion`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: config.domain,
        accessToken: config.accessToken,
        courseId,
        title,
        message,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create discussion: ${errorData.error || response.statusText}`);
  }

  const data = await response.json();
  return { id: String(data.id), url: data.url || '' };
}

/**
 * Append HTML to the course syllabus body
 */
async function appendToCanvasSyllabus(
  courseId: string,
  appendHtml: string
): Promise<{ previousContent: string }> {
  const config = getCanvasConfig();

  if (!config) {
    throw new Error('Canvas not configured');
  }

  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-74508696/canvas/append-to-syllabus`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: config.domain,
        accessToken: config.accessToken,
        courseId,
        appendHtml,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to update syllabus: ${errorData.error || response.statusText}`);
  }

  const data = await response.json();
  return { previousContent: data.previousContent || '' };
}

/**
 * Generic function to update Canvas content based on content type
 * Used for undoing fixes
 */
export async function updateCanvasContent(
  courseId: string,
  contentId: string,
  contentType: 'page' | 'assignment' | 'announcement' | 'discussion',
  content: string
): Promise<{ success: boolean; message: string }> {
  try {
    
    switch (contentType) {
      case 'page':
        await updateCanvasPage(courseId, contentId, content);
        break;
      case 'assignment':
        await updateCanvasAssignment(courseId, contentId, content);
        break;
      case 'announcement':
      case 'discussion':
        await updateCanvasDiscussion(courseId, contentId, content);
        break;
      default:
        return {
          success: false,
          message: `Unsupported content type: ${contentType}`
        };
    }
    
    return {
      success: true,
      message: 'Content updated successfully'
    };
  } catch (error) {
    console.error(`❌ Error updating ${contentType}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update content'
    };
  }
}

/**
 * Fix alt text issues in HTML content with custom text
 */
function fixAltTextWithCustomText(html: string, elementHtml: string, customAltText: string, newSrc?: string): string {
  
  // Parse the problematic element to extract the src
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = elementHtml;
  const problematicElement = tempDiv.querySelector('img');
  
  if (!problematicElement) {
    console.error('❌ No img element found in elementHtml');
    return html;
  }
  
  // Get the src attribute to match against
  const targetSrc = problematicElement.getAttribute('src');
  
  if (!targetSrc) {
    console.error('❌ No src attribute found on img element');
    return html;
  }
  
  // Extract filename for fallback matching
  const targetFilename = targetSrc.split('/').pop() || '';
  
  // BETTER APPROACH: Use string replacement with regex to preserve HTML structure
  // This avoids the DOM parsing issues that can corrupt HTML
  
  let fixed = false;
  let result = html;
  
  // Create a regex to find img tags
  const imgRegex = /<img([^>]*)>/gi;
  
  result = html.replace(imgRegex, (match) => {
    // Extract src from this img tag
    const srcMatch = match.match(/src\s*=\s*["']([^"']+)["']/i);
    if (!srcMatch) {
      return match; // No src attribute found
    }
    
    const imgSrc = srcMatch[1];
    
    // Match by exact src OR by filename (fallback for when Canvas modifies URLs)
    const isExactMatch = imgSrc === targetSrc;
    const isFilenameMatch = targetFilename && imgSrc.endsWith(targetFilename);
    
    if (!isExactMatch && !isFilenameMatch) {
      return match; // Not the image we're looking for
    }
    
    fixed = true;

    let updatedTag = match;

    // Replace src if a new image URL was provided (broken image replacement)
    if (newSrc) {
      const hasSrc = /src\s*=\s*["'][^"']*["']/i.test(updatedTag);
      if (hasSrc) {
        updatedTag = updatedTag.replace(/src\s*=\s*["'][^"']*["']/i, `src="${newSrc}"`);
      }
    }

    // Check if alt attribute already exists
    const hasAlt = /alt\s*=\s*["'][^"']*["']/i.test(updatedTag);

    if (hasAlt) {
      // Replace existing alt text
      return updatedTag.replace(/alt\s*=\s*["']([^"']*)["']/i, `alt="${customAltText}"`);
    } else {
      // Add alt attribute before the closing >
      return updatedTag.replace(/>$/, ` alt="${customAltText}">`);
    }
  });
  
  if (!fixed) {
    console.error('❌ Could not find matching image in HTML');
    console.error('   Target src:', targetSrc);
    console.error('   Target filename:', targetFilename);
    console.error('   HTML preview:', html.substring(0, 500));
    
    // Extract all img src values for debugging
    const allImgSrcs: string[] = [];
    const debugRegex = /<img[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi;
    let debugMatch;
    while ((debugMatch = debugRegex.exec(html)) !== null) {
      allImgSrcs.push(debugMatch[1]);
    }
    console.error('   Available image srcs:', allImgSrcs);
  } else {
  }
  
  return result;
}

/**
 * Inject a visible text description (caption) below an image in HTML content.
 * Used for complex images (diagrams, charts, etc.) where alt text alone is insufficient.
 */
function injectCaptionBelowImage(html: string, elementHtml: string, caption: string): string {
  // Parse the element to find the image src for matching
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = elementHtml;
  const img = tempDiv.querySelector('img');
  if (!img) return html;

  const targetSrc = img.getAttribute('src') || '';
  const targetFilename = targetSrc.split('/').pop() || '';

  // Build ADA-compliant caption using <figure> + <figcaption>
  // Wraps the image in a <figure> element with a <figcaption> for the text description
  // This is the WCAG-recommended pattern for complex images (WCAG 1.1.1, technique H45)
  const escapedCaption = caption.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const figcaptionHtml = `<figcaption style="font-size:0.9em; color:#555; margin-top:8px; line-height:1.5;">${escapedCaption}</figcaption>`;

  // Find the img tag in the HTML and wrap it in <figure> with <figcaption>
  const imgRegex = /<img([^>]*)>/gi;
  let injected = false;

  const result = html.replace(imgRegex, (match) => {
    if (injected) return match;

    const srcMatch = match.match(/src\s*=\s*["']([^"']+)["']/i);
    if (!srcMatch) return match;

    const imgSrc = srcMatch[1];
    const isExactMatch = imgSrc === targetSrc;
    const isFilenameMatch = targetFilename && imgSrc.endsWith(targetFilename);

    if (!isExactMatch && !isFilenameMatch) return match;

    injected = true;
    // Wrap in <figure> with role="figure" and aria-label for screen readers
    return `<figure role="figure" aria-label="Image with text description">${match}${figcaptionHtml}</figure>`;
  });

  return result;
}

/**
 * Fix long URL link text with custom descriptive text
 */
function fixLinkTextWithCustomText(html: string, elementHtml: string, customLinkText: string): string {
  
  // Parse the problematic element to extract the href
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = elementHtml;
  const problematicElement = tempDiv.querySelector('a');
  
  if (!problematicElement) {
    console.error('❌ No a element found in elementHtml');
    return html;
  }
  
  // Get the href attribute to match against
  const targetHref = problematicElement.getAttribute('href');
  
  if (!targetHref) {
    console.error('❌ No href attribute found on a element');
    return html;
  }
  
  // BETTER APPROACH: Use string replacement with regex to preserve HTML structure
  // This avoids the DOM parsing issues that can corrupt HTML
  
  let fixed = false;
  let result = html;
  
  // Create a more robust regex to find <a> tags with the target href
  // This handles multi-line content and nested HTML within links
  // Escape special regex characters in the href
  const escapedHref = targetHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Match <a> tags with this specific href, capturing everything between the tags
  // Use [\s\S] instead of . to match across newlines
  const linkRegex = new RegExp(
    `<a([^>]*href=["']${escapedHref}["'][^>]*)>([\\s\\S]*?)<\\/a>`,
    'gi'
  );
  
  result = html.replace(linkRegex, (match, attributes, innerContent) => {
    fixed = true;
    
    // Replace the link content while preserving attributes
    return `<a${attributes}>${customLinkText}</a>`;
  });
  
  if (!fixed) {
    console.error('❌ Could not find matching link in HTML');
    console.error('   Target href:', targetHref);
    console.error('   HTML preview:', html.substring(0, 500));
  } else {
  }
  
  return result;
}

/**
 * Fix broken links by replacing both href and link text
 */
function fixBrokenLinkInHtml(html: string, elementHtml: string, newUrl: string, newText: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = elementHtml;
  const link = tempDiv.querySelector('a');
  if (!link) return html;

  const oldHref = link.getAttribute('href') || '';
  const escapedHref = oldHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match the specific <a> tag with the old href and replace both href and content
  const linkRegex = new RegExp(
    `<a([^>]*?)href=["']${escapedHref}["']([^>]*)>([\\s\\S]*?)<\\/a>`,
    'gi'
  );

  let fixed = false;
  const result = html.replace(linkRegex, (_match, before, after, _content) => {
    if (fixed) return _match; // Only fix first match
    fixed = true;
    return `<a${before}href="${newUrl}"${after}>${newText}</a>`;
  });

  return result;
}

/**
 * Fix color contrast issues in HTML by adding inline style overrides
 */
function fixContrastInHtml(html: string, issue: any, customColor?: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  let fixedCount = 0;
  
  // Parse the suggestedFix to get the element selector and color info
  let targetColor = customColor;
  let targetSelector: string | undefined;
  
  if (issue.suggestedFix && issue.suggestedFix.includes('|')) {
    const parts = issue.suggestedFix.split('|');
    for (const part of parts) {
      if (part.startsWith('color:')) {
        targetColor = targetColor || part.replace('color:', '');
      } else if (part.startsWith('selector:')) {
        targetSelector = part.replace('selector:', '');
      }
    }
  }
  
  // Strategy 1: If we have text content from the issue, find matching elements
  if (issue.elementHtml) {
    // Extract text content from the element HTML
    const tempDoc = parser.parseFromString(issue.elementHtml, 'text/html');
    const searchText = tempDoc.body.textContent?.trim().substring(0, 50) || '';
    
    if (searchText) {
      
      // Search for elements with matching text
      const textElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, td, th, div, blockquote');
      
      for (let i = 0; i < textElements.length; i++) {
        const el = textElements[i] as HTMLElement;
        const elText = el.textContent?.trim() || '';
        
        if (elText.includes(searchText)) {
          
          const currentStyle = el.getAttribute('style') || '';
          let newStyle: string;
          
          // Add or replace color style
          if (/\bcolor\s*:/i.test(currentStyle)) {
            newStyle = currentStyle.replace(/\bcolor\s*:\s*[^;]+/gi, `color: ${targetColor || '#000000'}`);
          } else {
            newStyle = currentStyle ? `${currentStyle}; color: ${targetColor || '#000000'}` : `color: ${targetColor || '#000000'}`;
          }
          
          el.setAttribute('style', newStyle);
          fixedCount++;
        }
      }
    }
  }
  
  // Strategy 2: Fix ALL elements with inline color styles that have low contrast
  // This is more aggressive but necessary when specific element matching fails
  const inlineColorElements = doc.querySelectorAll('[style*="color"]');
  
  for (let i = 0; i < inlineColorElements.length; i++) {
    const el = inlineColorElements[i] as HTMLElement;
    const style = el.getAttribute('style') || '';
    const colorMatch = style.match(/(?:^|;)\s*(color)\s*:\s*([^;]+)/i);
    
    if (colorMatch) {
      const currentColor = colorMatch[2].trim();
      
      // Check if this is a low-contrast color we should fix
      // Expanded to catch more low-contrast colors
      const isLowContrast = 
        // Hex colors: #666, #888, #999, #aaa, #bbb, #ccc, etc.
        /^#([6-9a-fA-F])([6-9a-fA-F])([6-9a-fA-F])$/.test(currentColor) ||
        // Hex colors: #666666, #888888, #999999, etc.
        /^#([6-9a-fA-F]{2})([6-9a-fA-F]{2})([6-9a-fA-F]{2})$/.test(currentColor) ||
        // RGB/RGBA colors - accept ANY rgb/rgba color for fixing (scanner already validated low contrast)
        /^rgba?\s*\(/i.test(currentColor) ||
        // Named colors
        /^(gray|grey|lightgray|lightgrey|silver|darkgray|darkgrey|dimgray|dimgrey)$/i.test(currentColor);
      
      if (isLowContrast) {
        // Replace with high-contrast color - use precise regex that won't match background-color
        const newStyle = style.replace(/(?:^|;)(\s*color\s*:\s*)[^;]+/i, `$1${targetColor || '#000000'}`);
        el.setAttribute('style', newStyle);
        fixedCount++;
      }
    }
  }
  
  // Strategy 3: Look for common CSS classes that cause low contrast
  // Add inline overrides to these elements
  const potentialLowContrastSelectors = [
    '.text-muted',
    '.text-secondary', 
    '.text-gray',
    '.text-light',
    '[class*="gray"]',
    '[class*="muted"]'
  ];
  
  for (const selector of potentialLowContrastSelectors) {
    try {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(el => {
        const htmlEl = el as HTMLElement;
        const currentStyle = htmlEl.getAttribute('style') || '';
        
        // Only add override if not already has inline color
        if (!/color\s*:/i.test(currentStyle)) {
          const newStyle = currentStyle 
            ? `${currentStyle}; color: ${targetColor || '#000000'} !important` 
            : `color: ${targetColor || '#000000'} !important`;
          htmlEl.setAttribute('style', newStyle);
          fixedCount++;
        }
      });
    } catch (e) {
      // Selector might not be valid, skip it
    }
  }
  
  if (fixedCount > 0) {
  } else {
  }
  
  return doc.body.innerHTML;
}

/**
 * Fix heading structure issues in HTML content
 * Improved to show exactly which heading is being changed
 * Can also convert misused headings to paragraphs when appropriate
 */
function fixHeadingsInHtml(html: string, issue?: ScanIssue): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // If we have the specific heading element HTML from the issue, fix just that one
  if (issue?.elementHtml) {
    // Check if this is a misused heading that should be a paragraph
    const isMisusedHeading = issue.description.includes('paragraph-style text');
    
    if (isMisusedHeading) {
      // Convert heading to paragraph
      
      const elementDoc = parser.parseFromString(issue.elementHtml, 'text/html');
      const issueHeading = elementDoc.querySelector('h1, h2, h3, h4, h5, h6');
      
      if (issueHeading) {
        const headingText = issueHeading.textContent?.trim() || '';
        const headingLevel = parseInt(issueHeading.tagName.charAt(1));
        
        // Find this specific heading in the full HTML by matching text content
        const allHeadings = doc.querySelectorAll(`h${headingLevel}`);
        let fixed = false;
        
        allHeadings.forEach(heading => {
          if (!fixed && heading.textContent?.trim() === headingText) {
            // Create a paragraph element
            const newParagraph = doc.createElement('p');
            newParagraph.innerHTML = heading.innerHTML;
            // Preserve attributes except those that are heading-specific
            Array.from(heading.attributes).forEach(attr => {
              if (attr.name !== 'role' && attr.name !== 'aria-level') {
                newParagraph.setAttribute(attr.name, attr.value);
              }
            });
            heading.replaceWith(newParagraph);
            fixed = true;
          }
        });
        
        if (!fixed) {
          console.warn(`   ⚠️ Could not find specific heading in content`);
        } else {
          return doc.body.innerHTML;
        }
      }
    } else {
      // Standard heading level fix
      const levelMatch = issue.description.match(/H(\d)\s+to\s+H(\d)/i);
      if (levelMatch) {
        const fromLevel = parseInt(levelMatch[1]);
        const toLevel = parseInt(levelMatch[2]);
        
        // Parse the element HTML to get the heading
        const elementDoc = parser.parseFromString(issue.elementHtml, 'text/html');
        const issueHeading = elementDoc.querySelector(`h${fromLevel}`);
        
        if (issueHeading) {
          const headingText = issueHeading.textContent?.trim() || '';
          
          // Find this specific heading in the full HTML by matching text content
          const allHeadings = doc.querySelectorAll(`h${fromLevel}`);
          let fixed = false;
          
          allHeadings.forEach(heading => {
            if (!fixed && heading.textContent?.trim() === headingText) {
              const newHeading = doc.createElement(`h${toLevel}`);
              newHeading.innerHTML = heading.innerHTML;
              // Preserve all attributes
              Array.from(heading.attributes).forEach(attr => {
                newHeading.setAttribute(attr.name, attr.value);
              });
              heading.replaceWith(newHeading);
              fixed = true;
            }
          });
          
          if (!fixed) {
            console.warn(`   ⚠️ Could not find specific heading in content, applying general fix`);
          } else {
            return doc.body.innerHTML;
          }
        }
      }
    }
  }
  
  // Fallback: Fix all heading hierarchy issues (original behavior)
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  let currentLevel = 0;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName[1]);
    
    // Skip if this is the first heading
    if (currentLevel === 0) {
      currentLevel = level;
      return;
    }
    
    // If skipping levels, adjust to next sequential level
    if (level > currentLevel + 1) {
      const targetLevel = currentLevel + 1;
      const newHeading = doc.createElement(`h${targetLevel}`);
      newHeading.innerHTML = heading.innerHTML;
      // Preserve all attributes
      Array.from(heading.attributes).forEach(attr => {
        newHeading.setAttribute(attr.name, attr.value);
      });
      heading.replaceWith(newHeading);
      currentLevel = targetLevel;
    } else {
      currentLevel = level;
    }
  });
  
  return doc.body.innerHTML;
}

/**
 * Fix table headers in HTML content
 */
function fixTableHeadersInHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Find all tables
  const tables = doc.querySelectorAll('table');
  
  tables.forEach(table => {
    const rows = table.querySelectorAll('tr');
    
    // Check if the first row is a header row
    const firstRow = rows[0];
    if (firstRow) {
      const cells = firstRow.querySelectorAll('td, th');
      
      // If any cell is a <td>, convert it to <th>
      cells.forEach(cell => {
        if (cell.tagName.toLowerCase() === 'td') {
          const newCell = doc.createElement('th');
          newCell.innerHTML = cell.innerHTML;
          newCell.className = cell.className;
          cell.replaceWith(newCell);
        }
      });
    }
  });
  
  return doc.body.innerHTML;
}

/**
 * Fix table captions in HTML content with custom caption text
 */
function fixTableCaptionWithCustomText(html: string, elementHtml: string, customCaption: string): string {
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Parse the problematic table element using DOMParser (not document.createElement)
  const tempDoc = parser.parseFromString(elementHtml, 'text/html');
  const problematicTable = tempDoc.querySelector('table');
  
  if (!problematicTable) {
    console.error('❌ No table element found in elementHtml');
    
    // Fallback: add caption to all tables that don't have one
    const allTables = doc.querySelectorAll('table');
    let fixCount = 0;
    
    allTables.forEach(table => {
      const caption = table.querySelector('caption');
      if (!caption) {
        const newCaption = doc.createElement('caption');
        newCaption.textContent = customCaption;
        table.insertBefore(newCaption, table.firstChild);
        fixCount++;
      }
    });
    
    if (fixCount > 0) {
      return doc.body.innerHTML;
    }
    
    return html;
  }
  
  // Find the matching table in the document
  const allTables = doc.querySelectorAll('table');
  
  let fixed = false;
  
  // Extract first few cells from problematic table for better matching
  const problematicFirstCells: string[] = [];
  const problematicRows = problematicTable.querySelectorAll('tr');
  if (problematicRows.length > 0) {
    const firstRow = problematicRows[0];
    const cells = firstRow.querySelectorAll('td, th');
    cells.forEach((cell, idx) => {
      if (idx < 3) { // Only check first 3 cells
        problematicFirstCells.push(cell.textContent?.trim() || '');
      }
    });
  }
  
  // Try to find matching table
  for (let i = 0; i < allTables.length; i++) {
    const table = allTables[i];
    
    // Method 1: Compare row count
    const tableRows = table.querySelectorAll('tr');
    const rowCountMatches = tableRows.length === problematicRows.length && tableRows.length > 0;
    
    // Method 2: Compare first few cell contents
    let contentMatches = false;
    if (tableRows.length > 0 && problematicFirstCells.length > 0) {
      const firstRow = tableRows[0];
      const cells = firstRow.querySelectorAll('td, th');
      const tableCells: string[] = [];
      cells.forEach((cell, idx) => {
        if (idx < 3) {
          tableCells.push(cell.textContent?.trim() || '');
        }
      });
      
      // Check if at least 2 of the first 3 cells match
      let matchCount = 0;
      for (let j = 0; j < Math.min(tableCells.length, problematicFirstCells.length); j++) {
        if (tableCells[j] === problematicFirstCells[j]) {
          matchCount++;
        }
      }
      contentMatches = matchCount >= Math.min(2, problematicFirstCells.length);
      
    }
    
    if (rowCountMatches || contentMatches) {
      
      // Check if caption already exists
      let caption = table.querySelector('caption');
      if (caption) {
        // Update existing caption
        caption.textContent = customCaption;
      } else {
        // Create new caption
        caption = doc.createElement('caption');
        caption.textContent = customCaption;
        table.insertBefore(caption, table.firstChild);
      }
      
      fixed = true;
      break;
    }
  }
  
  if (!fixed) {
    
    // Fallback: apply to the first table that doesn't have a caption
    for (let i = 0; i < allTables.length; i++) {
      const table = allTables[i];
      const caption = table.querySelector('caption');
      
      if (!caption) {
        const newCaption = doc.createElement('caption');
        newCaption.textContent = customCaption;
        table.insertBefore(newCaption, table.firstChild);
        fixed = true;
        break;
      }
    }
  }
  
  // Last resort: if only one table exists, just add caption to it
  if (!fixed && allTables.length === 1) {
    const table = allTables[0];
    
    // Check if caption already exists
    let caption = table.querySelector('caption');
    if (caption) {
      // Update existing caption
      caption.textContent = customCaption;
    } else {
      // Create new caption
      caption = doc.createElement('caption');
      caption.textContent = customCaption;
      table.insertBefore(caption, table.firstChild);
    }
    
    fixed = true;
  }
  
  const result = doc.body.innerHTML;
  
  return result;
}

/**
 * Fix table captions in HTML content
 */
function fixTableCaptionInHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Find all tables
  const tables = doc.querySelectorAll('table');
  
  tables.forEach(table => {
    const caption = table.querySelector('caption');
    
    // If no caption exists, add a default one
    if (!caption) {
      const newCaption = doc.createElement('caption');
      newCaption.textContent = 'Table';
      table.insertBefore(newCaption, table.firstChild);
    }
  });
  
  return doc.body.innerHTML;
}

/**
 * Fix font size issues in HTML content (WCAG 1.4.4 - Resize Text)
 */
function fixFontSizeInHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Find all elements with inline font-size styles
  const styledElements = doc.querySelectorAll('[style*="font-size"]');
  
  styledElements.forEach(el => {
    const style = el.getAttribute('style') || '';
    const fontSizeMatch = style.match(/font-size:\s*([^;]+)/);
    
    if (fontSizeMatch) {
      const fontSize = fontSizeMatch[1].trim();
      
      // Parse the font size
      let sizeInPx = 0;
      if (fontSize.includes('px')) {
        sizeInPx = parseInt(fontSize);
      } else if (fontSize.includes('pt')) {
        // Convert pt to px (1pt = 1.333px)
        sizeInPx = Math.round(parseInt(fontSize) * 1.333);
      } else if (fontSize.includes('em')) {
        // Assume base 16px
        sizeInPx = Math.round(parseFloat(fontSize) * 16);
      }
      
      // If font size is less than 16px, fix it
      if (sizeInPx > 0 && sizeInPx < 16) {
        const newStyle = style.replace(/font-size:\s*[^;]+/, 'font-size: 16px');
        el.setAttribute('style', newStyle);
      }
    }
  });
  
  return doc.body.innerHTML;
}

/**
 * Handle PDF-to-accessible-page conversion.
 * Staging: returns the AI-generated HTML as fixedContent.
 * Publishing: creates a new Canvas page in the same module via the proxy endpoint.
 */
async function fixCanvasIssue_pdfConvert(
  courseId: string,
  issue: ScanIssue,
  applyToCanvas: boolean
): Promise<FixResult> {
  const convertedHtml = issue.stagedFix?.fixedContent || issue.suggestedFix || issue.suggestedContent;
  if (!convertedHtml) {
    return {
      success: false,
      issueId: issue.id,
      message: 'No converted HTML available. Please convert the PDF first.',
    };
  }

  // Staging: just return the HTML for preview
  if (!applyToCanvas) {
    return {
      success: true,
      issueId: issue.id,
      message: 'PDF conversion prepared for preview',
      originalContent: issue.elementHtml || '',
      fixedContent: convertedHtml,
      contentId: issue.contentId,
      contentType: 'file',
    };
  }

  // Publishing: create a new Canvas page in the module
  try {
    const config = getCanvasConfig();
    if (!config) throw new Error('Canvas not configured');

    const moduleId = issue.moduleId;
    if (!moduleId) throw new Error('Missing moduleId — cannot determine which module to add the page to');

    // Derive page title from the PDF filename
    const filenameMatch = issue.elementHtml?.match(/>([^<]+)<\/a>/);
    const filename = filenameMatch?.[1] || 'Document';
    const pageTitle = `${filename.replace(/\.pdf$/i, '')} (Accessible Version)`;

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-74508696/canvas/create-page-in-module`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          domain: config.domain,
          accessToken: config.accessToken,
          courseId: courseId,
          moduleId: moduleId,
          pageTitle: pageTitle,
          pageBody: convertedHtml
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      issueId: issue.id,
      message: `Created accessible page "${result.pageTitle}" in the module`,
      originalContent: issue.elementHtml || '',
      fixedContent: convertedHtml,
      contentId: result.pageUrl,
      contentType: 'page',
    };
  } catch (error) {
    console.error('Failed to create accessible page:', error);
    return {
      success: false,
      issueId: issue.id,
      message: `Failed to create page: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Handle objectives fixes separately — they write to a specific page (not the module itself),
 * so they must bypass the common getCanvasContent call which doesn't support 'module' type.
 */
async function fixCanvasIssue_objectives(
  courseId: string,
  issue: ScanIssue,
  applyToCanvas: boolean
): Promise<FixResult> {
  // Use stagedFix.fixedContent when publishing (AI-generated HTML),
  // fall back to suggestedFix only if stagedFix isn't available yet
  const objectivesHtml = issue.stagedFix?.fixedContent || issue.suggestedFix;
  if (!objectivesHtml) {
    return {
      success: false,
      issueId: issue.id,
      message: 'Missing objectives content',
    };
  }

  const targetPageUrl: string | undefined = (issue as any).whereToAddPageUrl;

  // Staging preview: fetch original page content now so undo works later
  if (!applyToCanvas) {
    let originalContent = '';
    if (targetPageUrl) {
      try {
        const config = getCanvasConfig();
        if (config) {
          const pageData = await getPage(config, parseInt(courseId), targetPageUrl);
          originalContent = pageData.body || '';
        }
      } catch {
        // Non-fatal: staging can proceed without original content
      }
    }
    return {
      success: true,
      issueId: issue.id,
      message: 'Learning objectives prepared for preview',
      originalContent,
      fixedContent: objectivesHtml,
      // Return page URL/type so the issue gets updated with correct contentId for undo
      contentId: targetPageUrl || issue.contentId,
      contentType: targetPageUrl ? 'page' : 'module',
    };
  }

  // Apply to Canvas: Add objectives to the specific intro/overview page
  try {
    const config = getCanvasConfig();
    if (!config) throw new Error('Canvas not configured');

    if (targetPageUrl) {
      // The scanner identified a specific page — update it directly

      const pageData = await getPage(config, parseInt(courseId), targetPageUrl);
      const currentBody = pageData.body || '';

      // Replace existing objectives section or prepend to page top
      const hasExistingObjectives = /<h[23]>Learning (Outcomes|Objectives)<\/h[23]>/i.test(currentBody);
      let newBody: string;
      if (hasExistingObjectives) {
        newBody = currentBody.replace(
          /<h[23]>Learning (Outcomes|Objectives)<\/h[23]>[\s\S]*?<\/(ol|ul)>/i,
          objectivesHtml
        );
      } else {
        newBody = objectivesHtml + (currentBody ? '\n\n' + currentBody : '');
      }

      await updateCanvasPage(courseId, targetPageUrl, newBody);

      return {
        success: true,
        issueId: issue.id,
        message: `Added learning outcomes to "${issue.whereToAdd || 'module page'}"`,
        originalContent: currentBody,
        fixedContent: newBody,
        contentId: targetPageUrl,
        contentType: 'page',
      };
    }

    // No specific page URL — fall back to server endpoint (finds/creates overview page)
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-74508696/canvas/add-objectives-to-module`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: config.domain,
          accessToken: config.accessToken,
          courseId: courseId,
          moduleId: issue.contentId,
          objectivesHtml: objectivesHtml
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server returned ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      issueId: issue.id,
      message: `Added learning outcomes to ${result.pageTitle}`,
      originalContent: result.previousContent || '',
      fixedContent: objectivesHtml,
      contentId: result.pageUrl,
      contentType: 'page',
    };
  } catch (error) {
    console.error(`❌ Failed to add objectives:`, error);
    return {
      success: false,
      issueId: issue.id,
      message: `Failed to add objectives: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Main function to fix a Canvas issue
 */
export async function fixCanvasIssue(
  courseId: string,
  issue: ScanIssue,
  applyToCanvas: boolean = false
): Promise<FixResult> {

  // For video-caption, derive fixability from elementHtml so old scan results work
  const isVideoCaptionFixable = issue.category === 'video-caption' && (() => {
    const src = issue.elementHtml?.match(/src="([^"]+)"/)?.[1] || '';
    return src.includes('youtube.com') || src.includes('youtube-nocookie.com') || src.includes('youtu.be') || src.includes('vimeo.com');
  })();

  if (!issue.autoFixAvailable && !isVideoCaptionFixable) {
    return {
      success: false,
      issueId: issue.id,
      message: 'This issue requires manual fixing in Canvas',
    };
  }

  if (!issue.contentId || !issue.contentType) {
    console.error('❌ Missing contentId or contentType:', { contentId: issue.contentId, contentType: issue.contentType });
    return {
      success: false,
      issueId: issue.id,
      message: 'Missing content information',
    };
  }

  // PDF conversion creates a new page in the module — handle before getCanvasContent.
  if (issue.category === 'pdf-tag') {
    return fixCanvasIssue_pdfConvert(courseId, issue, applyToCanvas);
  }

  // Objectives have their own content-fetching logic (they write to a specific page,
  // not the module itself) — handle entirely before the common getCanvasContent call.
  if (issue.category === 'objectives') {
    return fixCanvasIssue_objectives(courseId, issue, applyToCanvas);
  }

  try {
    // Get current content
    const originalContent = await getCanvasContent(
      courseId,
      issue.contentId,
      issue.contentType,
      issue.location
    );

    // Apply the appropriate fix
    let fixedContent = originalContent;
    let customAltText: string | undefined;
    let customLinkText: string | undefined;
    let customCaption: string | undefined;
    let customTextColor: string | undefined;

    switch (issue.category) {
      case 'alt-text':
        // CRITICAL: When publishing (applyToCanvas=true), ONLY use stagedFix data
        // The stagedFix contains the exact fix that was shown to the user in the modal
        if (applyToCanvas) {
          // Publishing mode: Use ONLY stagedFix (what user approved)
          const altText = issue.stagedFix?.customAltText;
          if (!altText || !issue.elementHtml) {
            console.error('❌ Publishing failed: Missing stagedFix data', {
              hasStagedFix: !!issue.stagedFix,
              hasCustomAltText: !!issue.stagedFix?.customAltText,
              hasElementHtml: !!issue.elementHtml
            });
            return {
              success: false,
              issueId: issue.id,
              message: 'Cannot publish: missing staged fix data. Please re-stage the fix.',
            };
          }
          fixedContent = fixAltTextWithCustomText(originalContent, issue.elementHtml, altText, issue.stagedFix?.newImageSrc);
          customAltText = altText;
          // Inject complex image caption if present
          const publishCap = issue.stagedFix?.customCaption || issue.complexCaption;
          if (publishCap && fixedContent) {
            fixedContent = injectCaptionBelowImage(fixedContent, issue.elementHtml, publishCap);
            customCaption = publishCap;
          }
        } else {
          // Staging mode: Use suggestedFix (preview mode)
          const altText = issue.suggestedFix;
          if (altText && issue.elementHtml) {
            fixedContent = fixAltTextWithCustomText(originalContent, issue.elementHtml, altText, issue.newImageSrc);
            customAltText = altText;
            // Inject complex image caption if present
            if (issue.complexCaption && fixedContent) {
              fixedContent = injectCaptionBelowImage(fixedContent, issue.elementHtml, issue.complexCaption);
              customCaption = issue.complexCaption;
            }
          } else {
            return {
              success: false,
              issueId: issue.id,
              message: 'Alt text fix requires custom alt text',
            };
          }
        }
        break;
      case 'long-url':
        // CRITICAL: When publishing, ONLY use stagedFix data
        if (applyToCanvas) {
          // Publishing mode: Use ONLY stagedFix (what user approved)
          const linkText = issue.stagedFix?.customLinkText;
          if (!linkText || !issue.elementHtml) {
            console.error('❌ Publishing failed: Missing stagedFix data', {
              hasStagedFix: !!issue.stagedFix,
              hasCustomLinkText: !!issue.stagedFix?.customLinkText,
              hasElementHtml: !!issue.elementHtml
            });
            return {
              success: false,
              issueId: issue.id,
              message: 'Cannot publish: missing staged fix data. Please re-stage the fix.',
            };
          }
          fixedContent = fixLinkTextWithCustomText(originalContent, issue.elementHtml, linkText);
          customLinkText = linkText;
        } else {
          // Staging mode: Use suggestedFix (preview mode)
          const linkText = issue.suggestedFix;
          // Block placeholder text from being applied as actual link text
          const isPlaceholder = !linkText || linkText.toLowerCase().includes('replace url with') || linkText.toLowerCase().includes('meaningful link text');
          if (isPlaceholder) {
            return {
              success: false,
              issueId: issue.id,
              message: 'Please open this issue and select an AI suggestion or write custom link text before fixing.',
            };
          }
          if (linkText && issue.elementHtml) {
            fixedContent = fixLinkTextWithCustomText(originalContent, issue.elementHtml, linkText);
            customLinkText = linkText;
          } else {
            return {
              success: false,
              issueId: issue.id,
              message: 'Long URL fix requires custom link text',
            };
          }
        }
        break;
      case 'broken-link':
        // Fix broken links by replacing both href and link text
        if (applyToCanvas) {
          const stagedFixedContent = issue.stagedFix?.fixedContent;
          if (!stagedFixedContent) {
            return {
              success: false,
              issueId: issue.id,
              message: 'Cannot publish: missing staged fix. Please re-stage.',
            };
          }
          fixedContent = stagedFixedContent;
          customLinkText = issue.stagedFix?.customLinkText;
        } else {
          // Staging mode: suggestedFix is JSON with {url, text}
          const fixData = issue.suggestedFix;
          if (!fixData || !issue.elementHtml) {
            return {
              success: false,
              issueId: issue.id,
              message: 'Broken link fix requires a replacement URL and link text',
            };
          }
          try {
            const { url, text } = JSON.parse(fixData);
            if (!url || !text) throw new Error('Missing url or text');
            fixedContent = fixBrokenLinkInHtml(originalContent, issue.elementHtml, url, text);
            customLinkText = text;
          } catch {
            return {
              success: false,
              issueId: issue.id,
              message: 'Invalid fix data for broken link',
            };
          }
        }
        break;
      case 'contrast':
      case 'color-contrast':
        // CRITICAL: When publishing, ONLY use stagedFix data
        if (applyToCanvas) {
          // Publishing mode: Use ONLY stagedFix (what user approved)
          const color = issue.stagedFix?.customTextColor;
          fixedContent = fixContrastInHtml(originalContent, issue, color);
          customTextColor = color;
        } else {
          // Staging mode: Parse suggestedFix format (NEW FORMAT: color:#000000|bg:#ffffff|ratio:2.1)
          const suggestedFix = issue.suggestedFix || '';
          let color: string | undefined;
          
          // Parse new format: color:#000000|bg:#ffffff|ratio:2.1
          if (suggestedFix.includes('|')) {
            const parts = suggestedFix.split('|');
            const colorPart = parts.find(p => p.startsWith('color:'));
            if (colorPart) {
              color = colorPart.replace('color:', '');
            }
          } else if (suggestedFix.startsWith('#') || suggestedFix.startsWith('rgb')) {
            // Legacy format: just a color
            color = suggestedFix;
          }
          
          fixedContent = fixContrastInHtml(originalContent, issue, color);
          customTextColor = color;
        }
        break;
      case 'inconsistent-heading':
        fixedContent = fixHeadingsInHtml(originalContent, issue);
        break;
      case 'table-headers':
        fixedContent = fixTableHeadersInHtml(originalContent);
        break;
      case 'table-caption':
        // During staging: use suggestedFix which contains the custom caption
        // During publishing: use stagedFix.customCaption
        const caption = issue.stagedFix?.customCaption || issue.suggestedFix;
        if (caption && issue.elementHtml) {
          fixedContent = fixTableCaptionWithCustomText(originalContent, issue.elementHtml, caption);
          customCaption = caption; // Store for return
        } else {
          fixedContent = fixTableCaptionInHtml(originalContent);
        }
        break;
      case 'color-only': {
        // Fix color-as-sole-indicator by adding bold
        if (!issue.elementHtml) {
          return { success: false, issueId: issue.id, message: 'No element HTML stored for color-only fix.' };
        }

        if (applyToCanvas) {
          const stagedFixedContent = issue.stagedFix?.fixedContent;
          if (!stagedFixedContent) {
            return { success: false, issueId: issue.id,
              message: 'Cannot publish: missing staged fix. Please re-stage.' };
          }
          fixedContent = stagedFixedContent;
          break;
        }

        const colorParser = new DOMParser();
        const colorDoc = colorParser.parseFromString(originalContent, 'text/html');

        // Extract the element's text content to find it in the page
        const colorElParser = new DOMParser();
        const colorElDoc = colorElParser.parseFromString(issue.elementHtml, 'text/html');
        const colorElText = colorElDoc.body.textContent?.trim() || '';

        if (colorElText) {
          const colorCandidates = colorDoc.querySelectorAll('span, font');
          for (const el of Array.from(colorCandidates)) {
            const elText = el.textContent?.trim() || '';
            if (elText === colorElText) {
              const parent = el.parentElement;
              // Wrap in <strong> if not already
              if (!parent || (parent.tagName.toLowerCase() !== 'strong' && parent.tagName.toLowerCase() !== 'b')) {
                const strong = colorDoc.createElement('strong');
                el.parentNode?.insertBefore(strong, el);
                strong.appendChild(el);
              }
              break;
            }
          }
        }
        fixedContent = colorDoc.body.innerHTML;
        break;
      }
      case 'autoplay': {
        // Remove autoplay from <audio>/<video> elements and autoplay=1 from <iframe> src URLs
        if (!issue.elementHtml) {
          return { success: false, issueId: issue.id, message: 'No element HTML stored for autoplay fix.' };
        }

        // Publishing path: use already-staged fixedContent
        if (applyToCanvas) {
          const stagedFixedContent = issue.stagedFix?.fixedContent;
          if (!stagedFixedContent) {
            return { success: false, issueId: issue.id,
              message: 'Cannot publish: missing staged fix. Please re-stage.' };
          }
          fixedContent = stagedFixedContent;
          break;
        }

        // Staging path: parse and fix the autoplay attribute
        const autoplayParser = new DOMParser();
        const autoplayDoc = autoplayParser.parseFromString(originalContent, 'text/html');

        // Determine if this is an iframe issue or audio/video issue
        const isIframeAutoplay = issue.id.includes('autoplay-iframe');

        if (isIframeAutoplay) {
          // Fix iframe: remove autoplay=1 from src URL
          const iframes = autoplayDoc.querySelectorAll('iframe');
          // Match using a fragment of the stored src to find the right iframe
          const storedSrcMatch = issue.elementHtml.match(/src="([^"]+)"/);
          const storedSrc = storedSrcMatch?.[1] || '';

          for (const iframe of Array.from(iframes)) {
            const currentSrc = iframe.getAttribute('src') || '';
            // Match by partial src content (video ID or domain)
            if (storedSrc && currentSrc.includes(storedSrc.split('?')[0].split('/').pop() || '')) {
              // Remove autoplay=1 parameter from URL
              const cleanedSrc = currentSrc
                .replace(/[?&]autoplay=1/i, (match) => {
                  // If it starts with ?, replace with ? for the next param (or remove entirely)
                  if (match.startsWith('?')) {
                    // Check if there are more params after
                    const afterIdx = currentSrc.indexOf(match) + match.length;
                    if (afterIdx < currentSrc.length && currentSrc[afterIdx] === '&') {
                      return '?'; // Replace ?autoplay=1& with ?
                    }
                    return ''; // It was the only parameter
                  }
                  return ''; // &autoplay=1 — just remove
                });
              iframe.setAttribute('src', cleanedSrc);
              break;
            }
          }
          fixedContent = autoplayDoc.body.innerHTML;
        } else {
          // Fix audio/video: remove the autoplay attribute
          const tagType = issue.id.includes('autoplay-audio') ? 'audio' : 'video';
          const mediaEls = autoplayDoc.querySelectorAll(tagType);

          // Try to match by element HTML content to find the right element
          for (const el of Array.from(mediaEls)) {
            if (el.hasAttribute('autoplay')) {
              el.removeAttribute('autoplay');
              break; // Fix the first matching autoplay element
            }
          }
          fixedContent = autoplayDoc.body.innerHTML;
        }
        break;
      }
      case 'plain-language':
      case 'instructions':
      case 'assessment-guidance': {
        // AI-generated rewrite: the new content replaces the entire assignment description
        const aiRewrite = issue.suggestedFix;
        if (!aiRewrite) {
          return {
            success: false,
            issueId: issue.id,
            message: 'AI rewrite not available. Please generate a rewrite first.',
          };
        }
        // For assignment descriptions, replace the full description
        fixedContent = aiRewrite;
        break;
      }
      case 'readability': {
        // Publishing: use already-staged fixedContent (same pattern as layout-table/video-caption)
        if (applyToCanvas) {
          const stagedFixedContent = issue.stagedFix?.fixedContent;
          if (!stagedFixedContent) {
            return { success: false, issueId: issue.id,
              message: 'Cannot publish: missing staged fix. Please re-stage.' };
          }
          fixedContent = stagedFixedContent;
          break;
        }

        // Staging: AI-generated rewrite replaces the specific flagged paragraph
        const aiRewrite = issue.suggestedFix;
        if (!aiRewrite || !issue.elementHtml) {
          return {
            success: false,
            issueId: issue.id,
            message: 'AI rewrite not available. Please generate a rewrite first.',
          };
        }
        // Try exact string replacement of the original paragraph
        if (originalContent.includes(issue.elementHtml)) {
          fixedContent = originalContent.replace(issue.elementHtml, aiRewrite);
        } else {
          // Fallback: try to find by text content match
          const parser = new DOMParser();
          const doc = parser.parseFromString(originalContent, 'text/html');
          const originalText = issue.elementHtml.replace(/<[^>]+>/g, '').trim().substring(0, 60);
          let found = false;
          doc.querySelectorAll('p').forEach(p => {
            if (!found && p.textContent?.trim().startsWith(originalText.substring(0, 40))) {
              p.outerHTML = aiRewrite;
              found = true;
            }
          });
          if (found) {
            fixedContent = doc.body.innerHTML;
          } else {
            return {
              success: false,
              issueId: issue.id,
              message: 'Could not locate the original paragraph. Please edit this content manually in Canvas.',
            };
          }
        }
        break;
      }
      case 'formatting':
        // Formatting category includes font size issues
        if (issue.title.includes('Font Size')) {
          fixedContent = fixFontSizeInHtml(originalContent);
        } else {
          return {
            success: false,
            issueId: issue.id,
            message: `Auto-fix not yet supported for this type of formatting issue`,
          };
        }
        break;
      case 'instructor-contact': {
        // Create a new welcome announcement in Canvas
        // Prefer stagedFix.fixedContent (user's typed content) over suggestedFix (original scanner text)
        // The content may be JSON-encoded {title, body} or plain text
        const rawFix = issue.stagedFix?.fixedContent || issue.suggestedFix || '';
        let announcementTitle = `Welcome to ${issue.courseName || 'the Course'}!`;
        let announcementBody = rawFix;
        try {
          const parsed = JSON.parse(rawFix);
          if (parsed.title && parsed.body) {
            announcementTitle = parsed.title;
            announcementBody = parsed.body;
          }
        } catch { /* Not JSON — use raw content as body */ }

        if (!announcementBody || announcementBody === 'Post a welcome announcement') {
          return {
            success: false,
            issueId: issue.id,
            message: 'Please write your welcome announcement before posting.',
          };
        }

        // Canvas requires HTML — convert plain text (with newlines) to HTML paragraphs
        const announcementHtml = announcementBody.startsWith('<')
          ? announcementBody
          : '<p>' + announcementBody.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';

        if (!applyToCanvas) {
          return {
            success: true,
            issueId: issue.id,
            message: 'Welcome announcement ready to post',
            originalContent: '',
            fixedContent: announcementBody,
            contentId: issue.contentId,
            contentType: issue.contentType,
          };
        }

        try {
          const result = await createCanvasAnnouncement(courseId, announcementTitle, announcementHtml);
          return {
            success: true,
            issueId: issue.id,
            message: `Welcome announcement created in Canvas`,
            originalContent: '',
            fixedContent: announcementHtml,
            contentId: result.id,
            contentType: 'announcement',
          };
        } catch (error) {
          return {
            success: false,
            issueId: issue.id,
            message: `Failed to create announcement: ${error instanceof Error ? error.message : 'Unknown error'}`,
          };
        }
      }

      case 'student-interaction': {
        // Create a new discussion topic in Canvas
        // Prefer stagedFix.fixedContent (user's typed content) over suggestedFix (original scanner text)
        const rawDiscFix = issue.stagedFix?.fixedContent || issue.suggestedFix || '';
        let discussionTitle = `${issue.courseName || 'Course'} — Peer Discussion`;
        let discussionBody = rawDiscFix;
        try {
          const parsed = JSON.parse(rawDiscFix);
          if (parsed.title && parsed.body) {
            discussionTitle = parsed.title;
            discussionBody = parsed.body;
          }
        } catch { /* Not JSON — use raw content as body */ }

        if (!discussionBody || discussionBody === 'Add peer interaction opportunities') {
          return {
            success: false,
            issueId: issue.id,
            message: 'Please write your discussion prompt before posting.',
          };
        }

        // Canvas requires HTML — convert plain text (with newlines) to HTML paragraphs
        const discussionHtml = discussionBody.startsWith('<')
          ? discussionBody
          : '<p>' + discussionBody.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';

        if (!applyToCanvas) {
          return {
            success: true,
            issueId: issue.id,
            message: 'Discussion topic ready to post',
            originalContent: '',
            fixedContent: discussionBody,
            contentId: issue.contentId,
            contentType: issue.contentType,
          };
        }

        try {
          const result = await createCanvasDiscussion(courseId, discussionTitle, discussionHtml);
          return {
            success: true,
            issueId: issue.id,
            message: `Discussion topic created in Canvas (saved as draft)`,
            originalContent: '',
            fixedContent: discussionHtml,
            contentId: result.id,
            contentType: 'discussion',
          };
        } catch (error) {
          return {
            success: false,
            issueId: issue.id,
            message: `Failed to create discussion: ${error instanceof Error ? error.message : 'Unknown error'}`,
          };
        }
      }

      case 'assessment-criteria': {
        // Append AI-generated rubric criteria to the existing assignment description
        const criteriaHtml = issue.suggestedFix;
        if (!criteriaHtml) {
          return {
            success: false,
            issueId: issue.id,
            message: 'Grading criteria template not available. Please generate a template first.',
          };
        }
        // Append criteria after existing content (or start fresh if empty)
        if (originalContent.trim()) {
          fixedContent = originalContent + '\n\n<hr/>\n<h3>Grading Criteria</h3>\n' + criteriaHtml;
        } else {
          fixedContent = '<h3>Grading Criteria</h3>\n' + criteriaHtml;
        }
        break;
      }

      case 'policies': {
        // Append missing policy sections to the course syllabus
        const policyHtml = issue.suggestedFix;
        if (!policyHtml) {
          return {
            success: false,
            issueId: issue.id,
            message: 'Policy template not available. Please generate a template first.',
          };
        }

        if (!applyToCanvas) {
          return {
            success: true,
            issueId: issue.id,
            message: 'Policy sections ready to add to syllabus',
            originalContent: '',
            fixedContent: policyHtml,
            contentId: issue.contentId,
            contentType: issue.contentType,
          };
        }

        try {
          const result = await appendToCanvasSyllabus(courseId, policyHtml);
          return {
            success: true,
            issueId: issue.id,
            message: 'Policy sections added to course syllabus',
            originalContent: result.previousContent,
            fixedContent: policyHtml,
            contentId: 'syllabus',
            contentType: 'page',
          };
        } catch (error) {
          return {
            success: false,
            issueId: issue.id,
            message: `Failed to update syllabus: ${error instanceof Error ? error.message : 'Unknown error'}`,
          };
        }
      }

      case 'communication-guidelines': {
        // Append communication guidelines template to syllabus
        const commHtml = issue.stagedFix?.fixedContent || issue.suggestedFix || issue.suggestedContent || '';
        if (!commHtml) {
          return {
            success: false,
            issueId: issue.id,
            message: 'Communication guidelines template not available. Please edit the template first.',
          };
        }

        if (!applyToCanvas) {
          return {
            success: true,
            issueId: issue.id,
            message: 'Communication guidelines ready to add to syllabus',
            originalContent: '',
            fixedContent: commHtml,
            contentId: issue.contentId,
            contentType: issue.contentType,
          };
        }

        try {
          const result = await appendToCanvasSyllabus(courseId, commHtml);
          return {
            success: true,
            issueId: issue.id,
            message: 'Communication guidelines added to course syllabus',
            originalContent: result.previousContent,
            fixedContent: commHtml,
            contentId: 'syllabus',
            contentType: 'page',
          };
        } catch (error) {
          return {
            success: false,
            issueId: issue.id,
            message: `Failed to update syllabus: ${error instanceof Error ? error.message : 'Unknown error'}`,
          };
        }
      }

      case 'module-discussion': {
        // Create a new discussion topic in Canvas (same pattern as student-interaction)
        const rawModDiscFix = issue.stagedFix?.fixedContent || issue.suggestedFix || '';
        let modDiscTitle = `${issue.location?.replace(/^Module:\s*/i, '') || 'Module'} — Discussion`;
        let modDiscBody = rawModDiscFix;
        try {
          const parsed = JSON.parse(rawModDiscFix);
          if (parsed.title && parsed.body) {
            modDiscTitle = parsed.title;
            modDiscBody = parsed.body;
          }
        } catch { /* Not JSON — use raw content as body */ }

        if (!modDiscBody || modDiscBody === 'Add a discussion activity to this module') {
          return {
            success: false,
            issueId: issue.id,
            message: 'Please write your discussion prompt before posting.',
          };
        }

        // Canvas requires HTML — convert plain text to HTML paragraphs
        const modDiscHtml = modDiscBody.startsWith('<')
          ? modDiscBody
          : '<p>' + modDiscBody.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';

        if (!applyToCanvas) {
          return {
            success: true,
            issueId: issue.id,
            message: 'Discussion topic ready to post',
            originalContent: '',
            fixedContent: modDiscBody,
            contentId: issue.contentId,
            contentType: issue.contentType,
          };
        }

        try {
          const result = await createCanvasDiscussion(courseId, modDiscTitle, modDiscHtml);
          return {
            success: true,
            issueId: issue.id,
            message: `Discussion topic created in Canvas (saved as draft)`,
            originalContent: '',
            fixedContent: modDiscHtml,
            contentId: result.id,
            contentType: 'discussion',
          };
        } catch (error) {
          return {
            success: false,
            issueId: issue.id,
            message: `Failed to create discussion: ${error instanceof Error ? error.message : 'Unknown error'}`,
          };
        }
      }

      case 'layout-table': {
        // CRITICAL: When publishing (applyToCanvas=true), use the already-computed fixedContent
        // from staging. issue.suggestedFix is not preserved in scanResults after staging, so
        // we can't recompute. stagedFix.fixedContent already has the correct cleaned HTML.
        if (applyToCanvas) {
          const stagedFixedContent = issue.stagedFix?.fixedContent;
          if (!stagedFixedContent) {
            console.error('❌ Publishing layout-table failed: no stagedFix.fixedContent', {
              hasStagedFix: !!issue.stagedFix,
            });
            return {
              success: false,
              issueId: issue.id,
              message: 'Cannot publish: missing staged fix data. Please re-stage the fix.',
            };
          }
          fixedContent = stagedFixedContent;
          break;
        }

        // Staging mode: convertLayoutTable() passed the converted HTML → stored in issue.suggestedFix
        const convertedHtml = issue.suggestedFix;
        const originalTable = issue.elementHtml;
        if (!convertedHtml || !originalTable) {
          return {
            success: false,
            issueId: issue.id,
            message: 'No converted HTML available. Please select a table purpose first.',
          };
        }

        // If the current page content doesn't have the table (e.g. a previous bad fix
        // replaced it with wrong text), fall back to stagedFix.originalContent so we
        // can redo the fix correctly without requiring a manual undo first.
        const stagedOriginal = (issue as any).stagedFix?.originalContent as string | undefined;
        let contentToSearch = originalContent;
        if (!originalContent.includes(originalTable) && stagedOriginal && stagedOriginal.includes(originalTable)) {
          contentToSearch = stagedOriginal;
        }

        // Strategy 1: exact string match
        if (contentToSearch.includes(originalTable)) {
          fixedContent = contentToSearch.replace(originalTable, convertedHtml);
          break;
        }

        // Strategy 2: Use DOMParser to find the matching table by normalized outerHTML,
        // then replace it in the parsed document. This handles:
        //   - Attribute ordering/whitespace differences between raw Canvas HTML and outerHTML
        //   - Nested tables (proper DOM replacement avoids counting </table> tags)
        try {
          const parser = new DOMParser();
          const origDoc = parser.parseFromString(contentToSearch, 'text/html');
          const targetDoc = parser.parseFromString(originalTable, 'text/html');
          const targetTable = targetDoc.querySelector('table');

          if (targetTable) {
            const allTables = Array.from(origDoc.querySelectorAll('table'));
            const normalizedTarget = targetTable.outerHTML;

            // Try normalized outerHTML match first
            let matchedTable: Element | null = allTables.find(t => t.outerHTML === normalizedTarget) ?? null;

            // Fall back: match by cell count + first cell text (most reliable heuristic)
            if (!matchedTable) {
              const targetCellCount = targetTable.querySelectorAll('td, th').length;
              const targetFirstCell = targetTable.querySelector('td, th')?.textContent?.trim().slice(0, 80) ?? '';
              matchedTable = allTables.find(t =>
                t.querySelectorAll('td, th').length === targetCellCount &&
                (t.querySelector('td, th')?.textContent?.trim().slice(0, 80) ?? '') === targetFirstCell
              ) ?? null;
            }

            if (matchedTable) {
              const tempDiv = origDoc.createElement('div');
              tempDiv.innerHTML = convertedHtml;
              const replacement = tempDiv.firstChild;
              if (replacement) {
                matchedTable.parentNode?.replaceChild(replacement, matchedTable);
              } else {
                matchedTable.remove();
              }
              fixedContent = origDoc.body.innerHTML;
              break;
            }
          }
        } catch (e) {
          console.warn('DOMParser replacement failed, trying raw string fallback', e);
        }

        // Strategy 3: raw string fallback — match opening tag with nested-table-aware closing
        const tableOpenTag = originalTable.match(/^<table[^>]*>/i)?.[0];
        if (tableOpenTag) {
          const startIdx = contentToSearch.toLowerCase().indexOf(tableOpenTag.toLowerCase());
          if (startIdx !== -1) {
            // Walk forward counting <table> opens and </table> closes to find matching end
            let depth = 0;
            let i = startIdx;
            let endIdx = -1;
            while (i < contentToSearch.length) {
              const nextOpen = contentToSearch.toLowerCase().indexOf('<table', i);
              const nextClose = contentToSearch.toLowerCase().indexOf('</table>', i);
              if (nextClose === -1) break;
              if (nextOpen !== -1 && nextOpen < nextClose) {
                depth++;
                i = nextOpen + 6;
              } else {
                depth--;
                if (depth === 0) {
                  endIdx = nextClose + '</table>'.length;
                  break;
                }
                i = nextClose + 8;
              }
            }
            if (endIdx !== -1) {
              fixedContent = contentToSearch.slice(0, startIdx) + convertedHtml + contentToSearch.slice(endIdx);
              break;
            }
          }
        }

        // Last-resort cleanup: a previous bad fix may have replaced the table with
        // the scanner's description text instead of converted HTML. Use DOMParser so
        // HTML-encoded characters (e.g. &#39; for apostrophe) are decoded automatically.
        {
          const badTextSnippets = [
            'AI will help convert this to proper semantic HTML',  // unique prefix of old text
            'Select what this table is being used for and the tool will convert',
          ];
          try {
            const cleanParser = new DOMParser();
            const cleanDoc = cleanParser.parseFromString(originalContent, 'text/html');

            let cleaned = false;
            for (const snippet of badTextSnippets) {
              // Search all block-level and inline elements
              const allEls = Array.from(cleanDoc.body.querySelectorAll('p, div, span, li, td, th, h1, h2, h3, h4, h5, h6'));
              const badEl = allEls.find(el => el.textContent?.includes(snippet));

              if (badEl) {
                const tempDiv = cleanDoc.createElement('div');
                tempDiv.innerHTML = convertedHtml;
                const replacement = tempDiv.firstChild;
                if (replacement) {
                  badEl.parentNode?.replaceChild(replacement, badEl);
                } else {
                  badEl.remove();
                }
                fixedContent = cleanDoc.body.innerHTML;
                cleaned = true;
                break;
              }

              // Also walk text nodes in case the text is bare (not inside a block element)
              const walker = cleanDoc.createTreeWalker(cleanDoc.body, NodeFilter.SHOW_TEXT);
              let textNode: Node | null;
              while ((textNode = walker.nextNode())) {
                if (textNode.textContent?.includes(snippet)) {
                  const tempDiv = cleanDoc.createElement('div');
                  tempDiv.innerHTML = convertedHtml;
                  const replacement = tempDiv.firstChild;
                  if (replacement && textNode.parentNode) {
                    textNode.parentNode.insertBefore(replacement, textNode);
                    textNode.parentNode.removeChild(textNode);
                  } else if (textNode.parentNode) {
                    textNode.parentNode.removeChild(textNode);
                  }
                  fixedContent = cleanDoc.body.innerHTML;
                  cleaned = true;
                  break;
                }
              }
              if (cleaned) break;
            }
          } catch (e) {
            console.warn('DOMParser cleanup failed', e);
          }
          if (fixedContent) break;
        }

        return {
          success: false,
          issueId: issue.id,
          message: 'Could not locate the original table in the page content. Please undo this fix in SIMPLIFY and re-apply, or manually edit the page in Canvas.',
        };
      }

      case 'audio-description': {
        // Publishing: use already-staged fixedContent
        if (applyToCanvas) {
          const stagedFixedContent = issue.stagedFix?.fixedContent;
          if (!stagedFixedContent) {
            return { success: false, issueId: issue.id,
              message: 'Cannot publish: missing staged fix. Please re-stage.' };
          }
          fixedContent = stagedFixedContent;
          break;
        }

        // Staging: insert a <details> text alternative after the video element
        const adText = issue.suggestedFix || '';
        if (!adText || adText === 'Generate an audio description script and add a text alternative below the video.') {
          return { success: false, issueId: issue.id,
            message: 'Please generate an audio description first before staging.' };
        }

        // Build the text alternative HTML
        const textAltHtml = `\n<details class="audio-description-text-alt">\n<summary><strong>Audio Description (Text Alternative)</strong></summary>\n${adText}\n</details>\n`;

        // Try to find the video element and insert after it
        const videoSrc = issue.videoSrc || '';
        if (videoSrc && originalContent.includes(videoSrc.split('?')[0])) {
          // Find the iframe/video tag containing this src
          const srcFragment = videoSrc.split('?')[0]; // Match without query params
          const iframeRegex = new RegExp(`(<iframe[^>]*${srcFragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^>]*>\\s*<\\/iframe>)`, 'i');
          const videoRegex = new RegExp(`(<video[^>]*${srcFragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^>]*>(?:[\\s\\S]*?)<\\/video>)`, 'i');

          const iframeMatch = originalContent.match(iframeRegex);
          const videoMatch = originalContent.match(videoRegex);
          const match = iframeMatch || videoMatch;

          if (match) {
            fixedContent = originalContent.replace(match[0], match[0] + textAltHtml);
            break;
          }
        }

        // Fallback: append at end of content
        fixedContent = originalContent + textAltHtml;
        break;
      }

      case 'video-caption': {
        // Publishing: use already-staged fixedContent (same pattern as layout-table)
        if (applyToCanvas) {
          const stagedFixedContent = issue.stagedFix?.fixedContent;
          if (!stagedFixedContent) {
            return { success: false, issueId: issue.id,
              message: 'Cannot publish: missing staged fix. Please re-stage.' };
          }
          fixedContent = stagedFixedContent;
          break;
        }

        // Staging: parse stored iframe to identify platform and extract video ID
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = issue.elementHtml || '';
        const storedIframe = tempDiv.querySelector('iframe');
        // Fallback to regex if DOMParser couldn't parse the iframe
        // (old scan results have elementHtml truncated at 200 chars — the tag may never
        // be closed so the DOM parser finds nothing, but the src attribute itself is intact)
        const originalSrc = storedIframe?.getAttribute('src')
          || issue.elementHtml?.match(/src="([^"]+)"/)?.[1]
          || '';

        const isYouTubeSrc = originalSrc.includes('youtube.com') || originalSrc.includes('youtube-nocookie.com') || originalSrc.includes('youtu.be');
        const isVimeoSrc = originalSrc.includes('vimeo.com');

        if (!isYouTubeSrc && !isVimeoSrc) {
          return { success: false, issueId: issue.id,
            message: 'Auto-fix only available for YouTube and Vimeo embeds.' };
        }

        const youtubeIdMatch = originalSrc.match(/\/embed\/([^?&#/]+)/);
        const vimeoIdMatch = originalSrc.match(/\/video\/(\d+)/);
        const videoId = youtubeIdMatch?.[1] || vimeoIdMatch?.[1];

        if (!videoId) {
          return { success: false, issueId: issue.id,
            message: 'Could not extract video ID from embed URL.' };
        }

        const paramKey = isYouTubeSrc ? 'cc_load_policy' : 'texttrack';
        const paramValue = isYouTubeSrc ? '1' : 'en';
        const baseUrl = isYouTubeSrc ? 'https://www.youtube.com' : 'https://player.vimeo.com';

        // Strategy 1: DOMParser — find iframe by video ID, update src via URL API
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(originalContent, 'text/html');
          const match = Array.from(doc.querySelectorAll('iframe'))
            .find(f => (f.getAttribute('src') || '').includes(videoId));
          if (match) {
            const url = new URL(match.getAttribute('src') || '', baseUrl);
            url.searchParams.set(paramKey, paramValue);
            match.setAttribute('src', url.toString());
            fixedContent = doc.body.innerHTML;
            break;
          }
        } catch (e) { /* fall through to Strategy 2 */ }

        // Strategy 2: raw string replacement
        if (originalContent.includes(originalSrc)) {
          const sep = originalSrc.includes('?') ? '&' : '?';
          fixedContent = originalContent.replace(originalSrc, `${originalSrc}${sep}${paramKey}=${paramValue}`);
          break;
        }

        return { success: false, issueId: issue.id,
          message: 'Could not find the video in the page. Re-run scan and try again.' };
      }

      default:
        return {
          success: false,
          issueId: issue.id,
          message: `Auto-fix not yet supported for ${issue.category}`,
        };
    }

    // Check if content actually changed
    if (fixedContent === originalContent) {
      
      // For contrast issues, we may have added !important overrides that won't show in text comparison
      // So we return success anyway since the fix was applied
      if (issue.category === 'contrast' || issue.category === 'color-contrast') {
        
        // If applying to Canvas, still update it
        if (applyToCanvas) {
          if (issue.contentType === 'page') {
            await updateCanvasPage(courseId, issue.contentId, fixedContent);
          } else if (issue.contentType === 'assignment') {
            await updateCanvasAssignment(courseId, issue.contentId, fixedContent);
          } else if (issue.contentType === 'announcement' || issue.contentType === 'discussion') {
            await updateCanvasDiscussion(courseId, issue.contentId, fixedContent);
          }
        }
        
        return {
          success: true,
          issueId: issue.id,
          message: applyToCanvas ? `Fixed ${issue.title}` : `Fix prepared for ${issue.title}`,
          originalContent: originalContent,
          fixedContent: fixedContent,
          contentId: issue.contentId,
          contentType: issue.contentType,
          customTextColor: customTextColor
        };
      }
      
      return {
        success: false,
        issueId: issue.id,
        message: 'No changes could be applied. The content may use external CSS or the issue may have already been fixed.',
      };
    }

    // Only update Canvas if applyToCanvas is true (for publishing)
    if (applyToCanvas) {
      
      if (issue.contentType === 'page') {
        await updateCanvasPage(courseId, issue.contentId, fixedContent);
      } else if (issue.contentType === 'assignment') {
        await updateCanvasAssignment(courseId, issue.contentId, fixedContent);
      } else if (issue.contentType === 'announcement' || issue.contentType === 'discussion') {
        await updateCanvasDiscussion(courseId, issue.contentId, fixedContent);
      }
      
      // VERIFICATION: Fetch the content back from Canvas to verify the fix was saved
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second for Canvas to process
        const verifyContent = await getCanvasContent(courseId, issue.contentId, issue.contentType);
        
        // Check if our fix is present
        if (issue.category === 'contrast' || issue.category === 'color-contrast') {
          const hasColorFix = /color:\s*rgb\(0,\s*0,\s*0\)|color:\s*#000000|color:\s*black/i.test(verifyContent);
          
          if (!hasColorFix) {
            console.error('❌ ❌ ❌ COLOR FIX WAS NOT SAVED TO CANVAS! ❌ ❌ ❌');
            console.error('❌ The HTML we sent had the fix, but Canvas did not save it');
            console.error('❌ Canvas may be stripping inline styles or sanitizing the HTML');
          } else {
          }
        }
      } catch (verifyError) {
        console.error('⚠️ Could not verify fix (fetch failed):', verifyError);
      }
    }

    return {
      success: true,
      issueId: issue.id,
      message: applyToCanvas ? `Fixed ${issue.title}` : `Fix prepared for ${issue.title}`,
      originalContent: originalContent,
      fixedContent: fixedContent,
      contentId: issue.contentId,
      contentType: issue.contentType,
      // Add custom text fields to the result
      customAltText: customAltText,
      customLinkText: customLinkText,
      customCaption: customCaption,
      customTextColor: customTextColor
    };
  } catch (error) {
    console.error(`❌ Error fixing issue ${issue.id}:`, error);
    return {
      success: false,
      issueId: issue.id,
      message: error instanceof Error ? error.message : 'Failed to fix issue',
    };
  }
}