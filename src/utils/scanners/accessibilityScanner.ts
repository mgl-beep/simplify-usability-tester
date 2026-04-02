// Accessibility Scanner - CVC-OEI, Peralta, and Quality Matters Compliance
// Scans for color contrast, alt text, heading hierarchy, etc.

import type { ScanIssue } from '../../App';
import { mapIssueToQMStandards } from '../standards/qualityMatters';
import { getStandardsTagsForIssue } from '../standards/standardsMapping';
import { sanitizeHtmlForStorage } from '../htmlSanitizer';
import { checkContrast, fixContrast, normalizeColor } from '../colorContrast';
import { getCanvasConfig } from '../canvasAPI';
import { projectId, publicAnonKey } from '../supabase/info';

/**
 * Check if an image URL is accessible. Uses the Canvas proxy for Canvas file URLs,
 * and a direct Image() load for external URLs. Returns false if the image can't be loaded.
 */
async function checkImageAvailability(src: string): Promise<boolean> {
  const fileIdMatch = src.match(/\/files\/(\d+)/);
  const config = getCanvasConfig();

  if (fileIdMatch && config) {
    // Canvas file URL — check via proxy
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74508696/canvas/file`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ domain: config.domain, accessToken: config.accessToken, fileId: fileIdMatch[1] }),
          signal: controller.signal
        }
      );
      clearTimeout(timeout);
      if (!response.ok) return false;
      const data = await response.json();
      return !!data.file?.url;
    } catch {
      return false;
    }
  }

  // External URL — try direct Image() load
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => { img.src = ''; resolve(false); }, 3000);
    img.onload = () => { clearTimeout(timeout); resolve(true); };
    img.onerror = () => { clearTimeout(timeout); resolve(false); };
    img.src = src;
  });
}

interface ColorInfo {
  foreground: string;
  background: string;
  ratio: number;
}

/**
 * Scan HTML content for accessibility issues
 */
export async function scanAccessibility(
  html: string,
  location: string,
  courseId: string,
  courseName: string,
  contentId: string,
  contentType: 'page' | 'assignment' | 'announcement' | 'discussion'
): Promise<ScanIssue[]> {
  
  const issues: ScanIssue[] = [];
  
  // Parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Check for missing alt text
  issues.push(...checkAltText(doc, location, courseId, courseName, contentId, contentType));
  
  // Check heading hierarchy
  const headingIssues = checkHeadingHierarchy(doc, location, courseId, courseName, contentId, contentType);
  issues.push(...headingIssues);
  
  // Check for tables without headers
  const tableIssues = checkTableAccessibility(doc, location, courseId, courseName, contentId, contentType);
  issues.push(...tableIssues);
  
  // Check color contrast (CVC-OEI D5)
  const contrastIssues = checkColorContrast(doc, location, courseId, courseName, contentId, contentType);
  issues.push(...contrastIssues);

  // Check for color used as sole conveyor of information (CVC-OEI D6)
  const colorOnlyIssues = checkColorAsSoleConveyor(doc, location, courseId, courseName, contentId, contentType);
  issues.push(...colorOnlyIssues);

  // Check for auto-play media (CVC-OEI D16)
  const autoplayIssues = checkAutoplayMedia(doc, location, courseId, courseName, contentId, contentType);
  issues.push(...autoplayIssues);

  // Post-process: check image availability for alt-text issues
  const altTextIssues = issues.filter(i => i.category === 'alt-text' && i.title === 'Missing Alt Text');
  if (altTextIssues.length > 0) {
    await Promise.allSettled(altTextIssues.map(async (issue) => {
      try {
        const src = issue.elementHtml?.match(/src="([^"]+)"/)?.[1]
          || issue.elementHtml?.match(/src='([^']+)'/)?.[1];
        if (!src) {
          issue.title = 'Missing Alt Text (Image Not Found)';
          return;
        }
        const available = await checkImageAvailability(src);
        if (!available) {
          issue.title = 'Missing Alt Text (Image Not Found)';
        }
      } catch {
        // Leave title as-is on error
      }
    }));
  }

  return issues;
}

/**
 * Check for images without alt text (WCAG 1.1.1)
 */
function checkAltText(
  doc: Document,
  location: string,
  courseId: string,
  courseName: string,
  contentId: string,
  contentType: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const images = doc.querySelectorAll('img');

  images.forEach((img, index) => {

    const alt = img.getAttribute('alt');
    const src = img.getAttribute('src') || '';
    const fileName = src.split('/').pop() || 'unknown';

    // Skip images that have a valid accessible name via aria-label
    const ariaLabel = img.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim() !== '') return;

    // Skip images referenced by aria-labelledby (described by another element)
    const ariaLabelledBy = img.getAttribute('aria-labelledby');
    if (ariaLabelledBy && ariaLabelledBy.trim() !== '') return;

    // Get image dimensions for decorative image detection
    // NOTE: Do NOT access img.naturalWidth/naturalHeight - that triggers image fetch and CORS errors!
    // Instead, only use the width/height attributes if present
    const widthAttr = img.getAttribute('width');
    const heightAttr = img.getAttribute('height');
    const width = widthAttr ? parseInt(widthAttr) : 0;
    const height = heightAttr ? parseInt(heightAttr) : 0;
    const size = Math.max(width, height);

    // role="presentation"/"none" is only respected for SMALL images (≤50px) — genuine decorative
    // icons/spacers. Canvas instructors frequently check "Decorative Image" on large meaningful
    // images just to skip alt text. Flag those regardless of role.
    const role = img.getAttribute('role');
    const isDecorativeRole = role === 'presentation' || role === 'none';
    if (isDecorativeRole && size > 0 && size <= 50) return;

    // Check if image appears to be complex (infographic, diagram, detailed chart)
    const isComplexImage = detectComplexImage(fileName, alt, size);

    // TODO: RESUME — "Complex Image Needs Long Description" — tabled for now
    if (false && isComplexImage) {
      issues.push({
        id: `alt-text-complex-${courseId}-${contentId}-${index}`,
        type: 'accessibility',
        category: 'alt-text',
        severity: 'high',
        title: 'Complex Image Needs Long Description',
        description: `Image \"${fileName}\" appears to be a complex infographic, diagram, or detailed chart. Complex images cannot be adequately described with alt text alone and require a long description or text alternative.`,
        location: location,
        autoFixAvailable: false,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        rubricStandard: 'CVC-OEI D3: Accessibility Standards',
        standardsTags: getStandardsTagsForIssue('alt-text'),
        contentType: contentType,
        contentId: contentId,
        elementHtml: sanitizeHtmlForStorage(img.outerHTML),
        suggestedFix: 'Provide an equivalent alternative such as a nearby text explanation, a structured data table (for charts), or an accessible resource with a full text description',
        fixSteps: [
          '1. Review the image - is it an infographic, flowchart, detailed diagram, or complex chart?',
          '2. Do NOT use simple alt text for complex images',
          '3. Add a detailed text description BELOW the image on the page',
          '4. For charts/graphs: Create an accessible data table with the same information',
          '5. Use alt text like \"Learning Theory diagram - see full text description below\"',
          '6. Ensure the long description is properly associated with the image'
        ]
      });
      return; // Skip other checks for complex images
    }
    
    // MERGED Issue Type 1 & 2: Missing alt text (no attribute OR empty/whitespace-only alt)
    // Only allow alt="" to pass if we KNOW the image is small (explicit size ≤ 50px = decorative)
    // When size === 0 (no dimension attributes — very common in Canvas), treat as non-decorative and flag.
    const altText = alt?.trim() || '';
    const isKnownSmallDecorative = altText === '' && size > 0 && size <= 50;
    const isMissingAltText = alt === null || alt === undefined || (altText === '' && !isKnownSmallDecorative);
    
    if (isMissingAltText) {
      issues.push({
        id: `alt-text-missing-${courseId}-${contentId}-${index}`,
        type: 'accessibility',
        category: 'alt-text',
        severity: 'high',
        title: 'Missing Alt Text',
        description: 'Image is missing alt text.',
        location: location,
        autoFixAvailable: true,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        rubricStandard: 'CVC-OEI D3: Accessibility Standards',
        standardsTags: getStandardsTagsForIssue('alt-text'),
        contentType: contentType,
        contentId: contentId,
        elementHtml: sanitizeHtmlForStorage(img.outerHTML),
        suggestedFix: 'Add alt attribute with descriptive text explaining what the image shows',
        fixSteps: [
          '1. Open the page in Canvas editor',
          '2. Click on the image',
          '3. Select "Alt Text" or "Attributes"',
          '4. Add a clear description of what the image shows',
          '5. If decorative, use alt="" (empty string) but only for small decorative images'
        ]
      });
      return; // Skip other checks if alt text is missing
    }
    
    // Issue Type 3: Filename-only alt text (very common issue)
    if (isFilenameOnlyAltText(altText, fileName)) {
      issues.push({
        id: `alt-text-filename-${courseId}-${contentId}-${index}`,
        type: 'accessibility',
        category: 'alt-text',
        severity: 'high',
        title: 'Missing Alt Text',
        description: `Image has alt text "${altText}" which is just the filename.`,
        location: location,
        autoFixAvailable: true,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        rubricStandard: 'CVC-OEI D3: Accessibility Standards',
        standardsTags: getStandardsTagsForIssue('alt-text'),
        contentType: contentType,
        contentId: contentId,
        elementHtml: sanitizeHtmlForStorage(img.outerHTML),
        suggestedFix: 'Replace filename with descriptive text explaining what the image shows',
        fixSteps: [
          '1. Open the page in Canvas editor',
          '2. Click on the image',
          '3. Replace the filename alt text with a clear description',
          '4. Example: Instead of "IMG_1234.jpg", use "Student presenting research findings to class"'
        ]
      });
      return;
    }
    
    // Issue Type 4: Generic/poor quality alt text
    if (isGenericAltText(altText)) {
      issues.push({
        id: `alt-text-generic-${courseId}-${contentId}-${index}`,
        type: 'accessibility',
        category: 'alt-text',
        severity: 'medium',
        title: 'Missing Alt Text',
        description: `Image has generic alt text "${altText}" which doesn't describe the actual content. Alt text like "image", "picture", or "photo" provides no useful information to screen reader users. Describe what the image actually shows.`,
        location: location,
        autoFixAvailable: true,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        rubricStandard: 'CVC-OEI D3: Accessibility Standards',
        standardsTags: getStandardsTagsForIssue('alt-text'),
        contentType: contentType,
        contentId: contentId,
        elementHtml: sanitizeHtmlForStorage(img.outerHTML),
        suggestedFix: 'Replace generic text with specific description of image content',
        fixSteps: [
          '1. Open the page in Canvas editor',
          '2. Click on the image',
          '3. Replace generic alt text with a specific description',
          '4. Describe what the image actually shows, not what it is'
        ]
      });
      return;
    }
    
    // Issue Type 5: Alt text too long (>150 characters)
    if (altText.length > 150) {
      issues.push({
        id: `alt-text-long-${courseId}-${contentId}-${index}`,
        type: 'accessibility',
        category: 'alt-text',
        severity: 'low',
        title: 'Alt Text Too Long',
        description: `Alt text is ${altText.length} characters long. Alt text should be concise (under 150 characters). Use page content or a long description for detailed information.`,
        location: location,
        autoFixAvailable: true,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        rubricStandard: 'CVC-OEI D3: Accessibility Standards',
        standardsTags: getStandardsTagsForIssue('alt-text'),
        contentType: contentType,
        contentId: contentId,
        elementHtml: sanitizeHtmlForStorage(img.outerHTML),
        suggestedFix: 'Shorten alt text to essential information (under 150 characters)',
        fixSteps: [
          '1. Identify the most important information in the image',
          '2. Write a concise description (under 150 characters)',
          '3. Move detailed information to surrounding page content',
          '4. Example: "Bar chart of enrollment trends 2020-2024" instead of describing every data point'
        ]
      });
      return;
    }
  });
  
  return issues;
}

/**
 * Check if alt text is just the filename
 */
function isFilenameOnlyAltText(altText: string, fileName: string): boolean {
  const normalizedAlt = altText.toLowerCase().trim();
  const normalizedFile = fileName.toLowerCase().trim();
  
  // Direct filename match
  if (normalizedAlt === normalizedFile) return true;
  
  // Filename without extension
  const fileWithoutExt = normalizedFile.replace(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i, '');
  if (normalizedAlt === fileWithoutExt) return true;
  
  // CRITICAL: Check if alt text contains file extension (strong indicator of filename)
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|pdf)$/i.test(normalizedAlt)) {
    return true;
  }
  
  // Common filename patterns
  const filenamePatterns = [
    /^img[_-]?\d+/i,                    // IMG_1234, img-001, img1234
    /^screenshot[_-\s]?\d*/i,           // Screenshot 2024, screenshot_1
    /^image[_-]?\d+/i,                  // image_001, image1
    /^photo[_-]?\d+/i,                  // photo_1, photo001
    /^picture[_-]?\d+/i,                // picture_1
    /^scan[_-]?\d+/i,                   // scan_001
    /^download[_-]?\d*/i,               // download, download_1
    /^untitled/i,                       // untitled
    /^dsc[_-]?\d+/i,                    // DSC_1234 (camera default)
    /^\d{8}[_-]?\d*/i,                  // 20240115_001 (date-based)
    /^[a-f0-9]{32}/i,                   // MD5 hash filenames
    /^\d+\.(jpg|jpeg|png|gif)$/i        // Just numbers with extension
  ];
  
  return filenamePatterns.some(pattern => pattern.test(normalizedAlt));
}

/**
 * Check if alt text is generic/unhelpful
 */
function isGenericAltText(altText: string): boolean {
  const normalizedAlt = altText.toLowerCase().trim();
  
  // List of generic/poor alt text phrases
  const genericPhrases = [
    'image',
    'picture',
    'photo',
    'graphic',
    'icon',
    'logo',
    'button',
    'click here',
    'click',
    'here',
    'link',
    'image here',
    'photo here',
    'picture here',
    'graphic here',
    'see image',
    'view image',
    'download',
    'file',
    'attachment',
    'figure',
    'chart',
    'graph',
    'diagram',
    'illustration',
    'snapshot',
    'screen shot',
    'screen capture'
  ];
  
  // Check exact matches
  if (genericPhrases.includes(normalizedAlt)) return true;
  
  // Check "image of", "picture of" patterns (still generic without specifics)
  const genericPatterns = [
    /^(image|picture|photo|graphic)\s*$/i,
    /^(image|picture|photo|graphic)\s+of\s*$/i,
    /^(image|picture|photo|graphic)\s+\d+\s*$/i,  // "image 1", "photo 2"
    /^click\s+(here|this)/i,
    /^(an?|the)\s+(image|picture|photo|graphic)\s*$/i
  ];
  
  return genericPatterns.some(pattern => pattern.test(normalizedAlt));
}

/**
 * Detect if image is too complex for simple alt text
 * Complex images include: infographics, flowcharts, detailed diagrams, complex charts, mind maps
 */
function detectComplexImage(fileName: string, altText: string | null, size: number): boolean {
  const normalizedFileName = fileName.toLowerCase();
  const normalizedAlt = (altText || '').toLowerCase();
  
  // Keywords indicating complex images
  const complexKeywords = [
    'infographic',
    'flowchart',
    'diagram',
    'mindmap',
    'mind-map',
    'mindmapping',
    'flowdiagram',
    'process-map',
    'processmap',
    'blueprint',
    'schematic',
    'wireframe',
    'sitemap',
    'site-map',
    'org-chart',
    'orgchart',
    'organizational-chart',
    'hierarchy',
    'timeline-detailed',
    'gantt',
    'network-diagram',
    'architecture',
    'model-full',
    'model-complete',
    'theory-full',
    'framework-full',
    'map-detailed',
    'chart-complex',
    'graph-detailed',
    'learning-map',
    'concept-map',
    'knowledge-map',
    'relationship-diagram',
    'system-diagram',
    'flow-process',
    'decision-tree',
    'taxonomy'
  ];
  
  // Check filename for complexity indicators
  for (const keyword of complexKeywords) {
    if (normalizedFileName.includes(keyword)) {
      return true;
    }
  }
  
  // Check alt text for complexity indicators (if someone already tried to describe it)
  if (normalizedAlt.length > 150) {
    // If alt text is very long, the image is probably too complex
    return true;
  }
  
  // Check for multiple instances of complexity words in alt text
  const complexityIndicators = [
    'diagram showing',
    'flowchart',
    'infographic',
    'detailed chart',
    'complex',
    'multiple',
    'various',
    'comprehensive',
    'overview of',
    'relationships between',
    'connections between'
  ];
  
  let complexityCount = 0;
  for (const indicator of complexityIndicators) {
    if (normalizedAlt.includes(indicator)) {
      complexityCount++;
    }
  }
  
  if (complexityCount >= 2) {
    return true; // Multiple complexity indicators suggest complex image
  }
  
  return false;
}

/**
 * Check heading hierarchy (WCAG 1.3.1)
 */
function checkHeadingHierarchy(
  doc: Document,
  location: string,
  courseId: string,
  courseName: string,
  contentId: string,
  contentType: string
): ScanIssue[] {
  // TODO: RESUME — "Heading Hierarchy Skipped" — tabled for now
  return [];
  const issues: ScanIssue[] = [];
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  let previousLevel = 0;
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    
    // Check if heading skips levels (e.g., H1 -> H3)
    if (previousLevel > 0 && level > previousLevel + 1) {
      issues.push({
        id: `heading-${courseId}-${contentId}-${index}`,
        type: 'accessibility',
        category: 'inconsistent-heading',
        severity: 'medium',
        title: 'Heading Hierarchy Skipped',
        description: `Heading level jumps from H${previousLevel} to H${level}, skipping H${previousLevel + 1}. This confuses screen reader users.`,
        location: location,
        autoFixAvailable: true,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        rubricStandard: 'CVC-OEI D3: Accessibility Standards',
        standardsTags: getStandardsTagsForIssue('inconsistent-heading'),
        contentType: contentType,
        contentId: contentId,
        elementHtml: sanitizeHtmlForStorage(heading.outerHTML),
        suggestedFix: `Change this heading to H${previousLevel + 1} to maintain proper hierarchy`,
        fixSteps: [
          '1. Open the page in Canvas editor',
          '2. Select the heading text',
          `3. Change the heading style from H${level} to H${previousLevel + 1}`,
          '4. Save the page'
        ]
      });
    }
    
    previousLevel = level;
  });
  
  return issues;
}

/**
 * Walk up the DOM tree to find the nearest explicit background-color.
 * Works on detached DOMParser documents where getComputedStyle is unavailable.
 * Returns a hex color string if an explicit background was found in inline styles/attrs,
 * or null if no inline background was detected (background comes from a CSS class).
 */
function getEffectiveBackgroundColor(element: Element): string | null {
  let current: Element | null = element;
  while (current) {
    // 1. Check inline style and data-mce-style for background-color
    for (const attr of ['style', 'data-mce-style']) {
      const styleStr = current.getAttribute(attr) || '';
      const bgMatch = styleStr.match(/background-color\s*:\s*([^;]+)/i);
      if (bgMatch) {
        const bg = bgMatch[1].trim();
        // Skip transparent / no-op values
        if (
          bg === 'transparent' ||
          bg === 'inherit' ||
          bg === 'initial' ||
          /rgba\s*\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/.test(bg)
        ) {
          continue;
        }
        const normalized = normalizeColor(bg);
        if (normalized) return normalized;
        return bg;
      }
    }

    // 2. Check legacy bgcolor attribute (used by Canvas table/td cells)
    const bgAttr = current.getAttribute('bgcolor');
    if (bgAttr) {
      const normalized = normalizeColor(bgAttr.trim());
      if (normalized) return normalized;
    }

    current = current.parentElement;
  }
  // No inline background found — background is class-based (can't read from DOM)
  return null;
}

/**
 * Returns true if the hex color is "light" (luminance > 0.5).
 * Used to suppress false positives: light text on undetected (class-based) dark backgrounds.
 */
function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

/**
 * Check color contrast (CVC-OEI D5: Color Contrast)
 * Flags text with custom colors that may have insufficient contrast
 * WCAG 2.0 Level AA: 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold)
 */
function checkColorContrast(
  doc: Document,
  location: string,
  courseId: string,
  courseName: string,
  contentId: string,
  contentType: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  
  // Get all text-containing elements
  const textElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, td, th, div, blockquote, strong, em, b, i');
  
  let flaggedCount = 0;
  
  textElements.forEach((element, index) => {
    const textContent = element.textContent?.trim() || '';
    if (textContent.length < 3) return; // Skip very short text
    
    // Check for inline style with color.
    // Use negative lookbehind to avoid matching 'color' inside 'background-color'.
    const style = element.getAttribute('style') || '';
    const colorMatch = style.match(/(?<!-)color\s*:\s*([^;]+)/i);
    
    if (colorMatch) {
      const color = colorMatch[1].trim();
      
      // Skip CSS variables (we can't calculate their actual values)
      if (color.includes('var(') || color.includes('--')) {
        return;
      }
      
      // Skip inherit and initial
      if (color === 'inherit' || color === 'initial' || color === 'currentColor') {
        return;
      }

      // Determine the effective background color for this element.
      // Returns null if background is class-based (not readable from inline styles).
      const effectiveBg = getEffectiveBackgroundColor(element);

      // Calculate actual WCAG contrast ratio against the real background
      const hexColor = normalizeColor(color);
      if (hexColor) {
        // If no inline background was detected AND the text is light-colored, skip.
        // This prevents false positives for light/white text on dark CSS-class backgrounds
        // (e.g., white text on a dark .prompt-box — visually fine but reads as 1:1 ratio).
        if (effectiveBg === null && isLightColor(hexColor)) {
          return;
        }
        const bgForCalc = effectiveBg ?? '#ffffff';
        const contrastResult = checkContrast(hexColor, bgForCalc);
        if (contrastResult.passes) {
          return;
        }
        const inlineFix = fixContrast(hexColor, bgForCalc);
        const inlineSuggestedColor = inlineFix ? inlineFix.foreground : '#000000';
        flaggedCount++;
        issues.push({
          id: `contrast-inline-${courseId}-${contentId}-${index}`,
          type: 'accessibility',
          category: 'contrast',
          severity: 'high',
          title: 'Insufficient Color Contrast',
          description: `Text color fails WCAG AA contrast requirements:\n\n• Text Color: ${color}\n• Background: ${bgForCalc}\n• Contrast Ratio: ${contrastResult.ratio.toFixed(2)}:1 (required: 4.5:1)\n• Text: "${textContent.substring(0, 100)}"\n\nCVC-OEI D5 requires sufficient color contrast against the background (WCAG 2.0 Level AA).`,
          location: location,
          autoFixAvailable: true,
          courseName: courseName,
          courseId: courseId,
          status: 'pending',
          rubricStandard: 'CVC-OEI D5: Color Contrast',
          standardsTags: ['cvc-oei:D5'],
          contentType: contentType,
          contentId: contentId,
          elementHtml: element.outerHTML.substring(0, 500),
          textColor: hexColor,
          backgroundColor: bgForCalc,
          suggestedFix: `color:${inlineSuggestedColor}`,
          fixSteps: [
            '1. Click "Fix Now" to update the text to a high-contrast color',
            '2. Review the preview to ensure text is still readable',
            '3. Click "Publish to Canvas" to apply the fix',
            '',
            'Alternative: Manually select a high-contrast color that meets WCAG AA standards'
          ]
        });
      } else {
        // Color format not recognized — skip if light text with undetected background,
        // otherwise flag conservatively assuming white Canvas background.
        if (effectiveBg === null) {
          return;
        }
        flaggedCount++;
        issues.push({
          id: `contrast-inline-${courseId}-${contentId}-${index}`,
          type: 'accessibility',
          category: 'contrast',
          severity: 'high',
          title: 'Insufficient Color Contrast',
          description: `Text has a custom color (${color}) that could not be evaluated automatically.\n\n• Background: ${effectiveBg}\n• Text: "${textContent.substring(0, 100)}"\n\nPlease verify this color meets WCAG AA contrast requirements (4.5:1 ratio for normal text).`,
          location: location,
          autoFixAvailable: true,
          courseName: courseName,
          courseId: courseId,
          status: 'pending',
          rubricStandard: 'CVC-OEI D5: Color Contrast',
          standardsTags: ['cvc-oei:D5'],
          contentType: contentType,
          contentId: contentId,
          elementHtml: element.outerHTML.substring(0, 500),
          textColor: color,
          backgroundColor: effectiveBg,
          suggestedFix: `color:#000000`,
          fixSteps: [
            '1. Click "Fix Now" to update the text to a high-contrast color',
            '2. Review the preview to ensure text is still readable',
            '3. Click "Publish to Canvas" to apply the fix'
          ]
        });
      }
    }
    
    // CRITICAL: Check for Canvas color classes (data-mce-style attribute)
    // Canvas Rich Content Editor stores colors in data-mce-style
    const mceStyle = element.getAttribute('data-mce-style') || '';
    const mceColorMatch = mceStyle.match(/(?<!-)color\s*:\s*([^;]+)/i);

    if (mceColorMatch) {
      const color = mceColorMatch[1].trim();

      // Skip if the inline path already flagged this same element (avoid double-flagging)
      if (issues.find(i => i.id === `contrast-inline-${courseId}-${contentId}-${index}`)) {
        return;
      }

      // Skip CSS variables
      if (color.includes('var(') || color.includes('--')) {
        return;
      }

      // Determine effective background for this element.
      // Returns null if background is class-based (not readable from inline styles).
      const mceEffectiveBg = getEffectiveBackgroundColor(element);

      // Calculate actual WCAG contrast ratio against the real background
      const mceHexColor = normalizeColor(color);
      if (mceHexColor) {
        // Skip light text on undetected (class-based) backgrounds — same logic as inline path
        if (mceEffectiveBg === null && isLightColor(mceHexColor)) {
          return;
        }
        const mceBgForCalc = mceEffectiveBg ?? '#ffffff';
        const mceContrastResult = checkContrast(mceHexColor, mceBgForCalc);
        if (mceContrastResult.passes) {
          return;
        }
        const mceFix = fixContrast(mceHexColor, mceBgForCalc);
        const mceSuggestedColor = mceFix ? mceFix.foreground : '#000000';
        flaggedCount++;
        issues.push({
          id: `contrast-mce-${courseId}-${contentId}-${index}`,
          type: 'accessibility',
          category: 'contrast',
          severity: 'high',
          title: 'Insufficient Color Contrast',
          description: `Text color from Canvas editor fails WCAG AA contrast requirements:\n\n• Text Color: ${color}\n• Background: ${mceBgForCalc}\n• Contrast Ratio: ${mceContrastResult.ratio.toFixed(2)}:1 (required: 4.5:1)\n• Text: "${textContent.substring(0, 100)}"\n\nCVC-OEI D5 requires sufficient color contrast against the background (WCAG 2.0 Level AA).`,
          location: location,
          autoFixAvailable: true,
          courseName: courseName,
          courseId: courseId,
          status: 'pending',
          rubricStandard: 'CVC-OEI D5: Color Contrast',
          standardsTags: ['cvc-oei:D5'],
          contentType: contentType,
          contentId: contentId,
          elementHtml: element.outerHTML.substring(0, 500),
          textColor: mceHexColor,
          backgroundColor: mceBgForCalc,
          suggestedFix: `color:${mceSuggestedColor}`,
          fixSteps: [
            '1. Click "Fix Now" to update the text to a high-contrast color',
            '2. Review the preview',
            '3. Click "Publish to Canvas" to apply the fix'
          ]
        });
      }
    }
    
    // Check for span elements with color classes (common in Canvas)
    if (element.tagName.toLowerCase() === 'span') {
      const className = element.getAttribute('class') || '';
      const colorClasses = [
        'text-muted', 'text-secondary', 'text-gray', 'text-light',
        'text-purple', 'text-violet', 'text-lavender',
        'muted', 'secondary', 'light-text'
      ];
      
      const hasColorClass = colorClasses.some(cls => className.includes(cls));
      if (hasColorClass && !issues.find(i => i.id === `contrast-inline-${courseId}-${contentId}-${index}`)) {
        
        flaggedCount++;
        issues.push({
          id: `contrast-class-${courseId}-${contentId}-${index}`,
          type: 'accessibility',
          category: 'contrast',
          severity: 'high',
          title: 'Insufficient Color Contrast',
          description: `Text uses CSS class "${className}" which may cause insufficient color contrast:\n\n• Text: "${textContent.substring(0, 100)}"\n\nCVC-OEI D5 requires sufficient color contrast.`,
          location: location,
          autoFixAvailable: true,
          courseName: courseName,
          courseId: courseId,
          status: 'pending',
          rubricStandard: 'CVC-OEI D5: Color Contrast',
          standardsTags: ['cvc-oei:D5'],
          contentType: contentType,
          contentId: contentId,
          elementHtml: element.outerHTML.substring(0, 500),
          suggestedFix: `Remove class and use color:#000000`,
          fixSteps: [
            '1. Click "Fix Now" to remove low-contrast class',
            '2. Text will be changed to high-contrast black',
            '3. Review and click "Publish to Canvas"'
          ]
        });
      }
    }
  });
  
  return issues;
}

/**
 * Check table accessibility (WCAG 1.3.1)
 */
function checkTableAccessibility(
  doc: Document,
  location: string,
  courseId: string,
  courseName: string,
  contentId: string,
  contentType: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const tables = doc.querySelectorAll('table');
  
  tables.forEach((table, index) => {
    const hasHeaders = table.querySelectorAll('th').length > 0;
    const caption = table.querySelector('caption');
    
    // Check if this is a layout table (table used for visual design, not data)
    const isLayoutTable = detectLayoutTable(table);
    
    if (false && isLayoutTable) { // TEMPORARILY DISABLED for usability testing
      issues.push({
        id: `layout-table-${courseId}-${contentId}-${index}`,
        type: 'accessibility',
        category: 'layout-table',
        severity: 'high',
        title: 'Table Used for Layout (Not Data)',
        description: 'This table appears to be used for visual layout rather than displaying tabular data. Screen readers will read this cell-by-cell in a confusing order.',
        location: location,
        autoFixAvailable: true,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        rubricStandard: 'CVC-OEI D3: Accessibility Standards',
        standardsTags: getStandardsTagsForIssue('layout-table'),
        contentType: contentType,
        contentId: contentId,
        elementHtml: table.outerHTML,
        suggestedFix: 'Select what this table is being used for and the tool will convert it to proper accessible HTML.',
        fixSteps: [
          '✨ AI-ASSISTED AUTO-FIX AVAILABLE',
          '',
          '1. Click "Fix Now" to start the AI-assisted conversion',
          '2. Select what you\'re using this table for:',
          '   • List of items',
          '   • Links/Navigation', 
          '   • Side-by-side layout',
          '   • Image gallery',
          '   • Spacing/Alignment',
          '3. Review the AI-generated replacement code',
          '4. Click "Fix Now" to automatically apply the conversion',
          '',
          'The table will be converted to accessible HTML with proper semantic structure and CSS styling.'
        ]
      });
    } else if (false && !hasHeaders) {
      // TODO: RESUME — "Table Missing Headers" tabled for later development
      // This appears to be a data table but missing headers
      
      // Get the full table HTML with proper structure
      const tableClone = table.cloneNode(true) as HTMLTableElement;
      const tableHtml = tableClone.outerHTML || table.outerHTML || '';
      
      // If table is very large, capture up to 2500 chars, otherwise full table
      const capturedHtml = tableHtml.length > 2500 ? tableHtml.substring(0, 2500) + '...' : tableHtml;
      
      issues.push({
        id: `table-headers-${courseId}-${contentId}-${index}`,
        type: 'accessibility',
        category: 'table-headers',
        severity: 'high',
        title: 'Table Missing Header Cells',
        description: 'Table does not have proper header cells (<th> tags) to help screen readers navigate.',
        location: location,
        autoFixAvailable: true,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        rubricStandard: 'CVC-OEI D3: Accessibility Standards',
        standardsTags: getStandardsTagsForIssue('table-headers'),
        contentType: contentType,
        contentId: contentId,
        elementHtml: capturedHtml, // Full table HTML for preview
        suggestedFix: 'Add <th> tags for header cells in the first row or column',
        fixSteps: [
          '1. Open the page in Canvas editor',
          '2. Edit the table',
          '3. Change the first row cells to header cells',
          '4. Add scope="col" or scope="row" attributes'
        ]
      });
    }
    
    if (false && !caption && !isLayoutTable) { // TEMPORARILY DISABLED for usability testing
      // Get the full table HTML with proper structure
      const tableClone = table.cloneNode(true) as HTMLTableElement;
      const tableHtml = tableClone.outerHTML || table.outerHTML || '';
      
      // If table is very large, capture up to 2000 chars, otherwise full table
      const capturedHtml = tableHtml.length > 2000 ? tableHtml.substring(0, 2000) + '...' : tableHtml;
      
      issues.push({
        id: `table-caption-${courseId}-${contentId}-${index}`,
        type: 'accessibility',
        category: 'table-caption',
        severity: 'low',
        title: 'Table Missing Caption',
        description: 'Table should have a caption that describes its purpose.',
        location: location,
        autoFixAvailable: true,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        rubricStandard: 'CVC-OEI D3: Accessibility Standards',
        standardsTags: getStandardsTagsForIssue('table-caption'),
        contentType: contentType,
        contentId: contentId,
        elementHtml: capturedHtml, // Full table HTML for AI analysis and preview
        suggestedFix: 'Add a <caption> element as the first child of the table',
        fixSteps: [
          '1. Open the page in Canvas editor',
          '2. Edit the table HTML',
          '3. Add <caption>Table description here</caption> after the opening <table> tag'
        ]
      });
    }
  });
  
  return issues;
}

/**
 * Detect if a table is being used for layout rather than data
 * Returns true if the table appears to be a layout table
 */
function detectLayoutTable(table: HTMLTableElement): boolean {
  // Heuristics to detect layout tables:
  
  // 1. Check for role="presentation" or role="none" (explicit layout table)
  const role = table.getAttribute('role');
  if (role === 'presentation' || role === 'none') {
    return true;
  }
  
  // 2. Check for nested tables (very common in layout tables)
  const nestedTables = table.querySelectorAll('table');
  if (nestedTables.length > 0) {
    return true;
  }

  // 3. border="0" alone is NOT a reliable signal — many data tables use it to hide
  // cell borders for aesthetic reasons. Only treat it as an indicator when combined
  // with other structural signs (checked below via the layoutIndicators threshold).
  
  // 4. Check table-level attributes and cell content
  const cells = table.querySelectorAll('td, th');
  let layoutIndicators = 0;
  let totalCells = cells.length;

  // border="0" contributes one indicator point at the table level (not per-cell)
  // so it can tip the scale when combined with other structural signs, but can't
  // trigger a false positive on its own.
  if (table.getAttribute('border') === '0') {
    layoutIndicators += Math.ceil(totalCells * 0.1); // adds ~10% weight
  }
  
  if (totalCells === 0) return false;
  
  cells.forEach(cell => {
    const cellHtml = cell.innerHTML.toLowerCase();
    
    // Contains navigation elements
    if (cellHtml.includes('<nav') || cellHtml.includes('navigation')) {
      layoutIndicators++;
    }
    
    // Contains multiple divs (layout structure)
    const divCount = (cellHtml.match(/<div/g) || []).length;
    if (divCount > 2) {
      layoutIndicators++;
    }
    
    // Contains headings (suggests content sections, not data)
    if (cellHtml.includes('<h1') || cellHtml.includes('<h2') || cellHtml.includes('<h3')) {
      layoutIndicators++;
    }
    
    // Cell has significant styling (suggests visual layout)
    const style = cell.getAttribute('style') || '';
    if (style.includes('width') && style.includes('height')) {
      layoutIndicators++;
    }
  });
  
  // If more than 30% of cells show layout indicators, it's likely a layout table
  return (layoutIndicators / totalCells) > 0.3;
}

/**
 * Check for color used as the sole means of conveying information (CVC-OEI D6)
 */
function checkColorAsSoleConveyor(
  doc: Document,
  location: string,
  courseId: string,
  courseName: string,
  contentId: string,
  contentType: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];

  const candidates = doc.querySelectorAll('span, font');

  candidates.forEach((el, index) => {
    let hasInlineColor = false;
    let detectedColor = '';

    const style = el.getAttribute('style') || '';
    const styleColorMatch = style.match(/(?<!-)color\s*:\s*([^;]+)/i);
    if (styleColorMatch) {
      hasInlineColor = true;
      detectedColor = styleColorMatch[1].trim();
    }

    if (!hasInlineColor) {
      const mceStyle = el.getAttribute('data-mce-style') || '';
      const mceColorMatch = mceStyle.match(/(?<!-)color\s*:\s*([^;]+)/i);
      if (mceColorMatch) {
        hasInlineColor = true;
        detectedColor = mceColorMatch[1].trim();
      }
    }

    if (!hasInlineColor && el.tagName.toLowerCase() === 'font') {
      const fontColor = el.getAttribute('color');
      if (fontColor) {
        hasInlineColor = true;
        detectedColor = fontColor.trim();
      }
    }

    if (!hasInlineColor) return;

    if (
      detectedColor.includes('var(') ||
      detectedColor.includes('--') ||
      detectedColor === 'inherit' ||
      detectedColor === 'initial' ||
      detectedColor === 'currentColor'
    ) {
      return;
    }

    const hexColor = normalizeColor(detectedColor);
    if (hexColor) {
      const hex = hexColor.replace('#', '').toLowerCase();
      const fullHex = hex.length === 3
        ? hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
        : hex;
      const r = parseInt(fullHex.slice(0, 2), 16);
      const g = parseInt(fullHex.slice(2, 4), 16);
      const b = parseInt(fullHex.slice(4, 6), 16);
      if (r < 40 && g < 40 && b < 40) return;
      if (r > 230 && g > 230 && b > 230) return;
    }

    const textContent = el.textContent?.trim() || '';
    if (textContent.length < 2) return;

    const parent = el.parentElement;
    if (parent) {
      const parentText = parent.textContent?.trim() || '';
      if (textContent === parentText) return;
    }

    let ancestor: Element | null = el;
    let insideSemanticElement = false;
    while (ancestor) {
      const tag = ancestor.tagName.toLowerCase();
      if (
        tag === 'a' ||
        tag === 'h1' || tag === 'h2' || tag === 'h3' ||
        tag === 'h4' || tag === 'h5' || tag === 'h6'
      ) {
        insideSemanticElement = true;
        break;
      }
      ancestor = ancestor.parentElement;
    }
    if (insideSemanticElement) return;

    let hasOtherEmphasis = false;

    const tagName = el.tagName.toLowerCase();
    if (tagName === 'b' || tagName === 'strong' || tagName === 'em' || tagName === 'i' || tagName === 'u') {
      hasOtherEmphasis = true;
    }

    if (!hasOtherEmphasis) {
      let wrapper: Element | null = el.parentElement;
      while (wrapper && wrapper !== doc.body) {
        const wrapperTag = wrapper.tagName.toLowerCase();
        if (wrapperTag === 'b' || wrapperTag === 'strong' || wrapperTag === 'em' ||
            wrapperTag === 'i' || wrapperTag === 'u' || wrapperTag === 'mark') {
          hasOtherEmphasis = true;
          break;
        }
        wrapper = wrapper.parentElement;
      }
    }

    if (!hasOtherEmphasis) {
      const emphasisChildren = el.querySelectorAll('b, strong, em, i, u, mark');
      if (emphasisChildren.length > 0) {
        hasOtherEmphasis = true;
      }
    }

    if (!hasOtherEmphasis) {
      const allStyles = style + ' ' + (el.getAttribute('data-mce-style') || '');
      if (/font-weight\s*:\s*(bold|[7-9]\d{2})/i.test(allStyles)) {
        hasOtherEmphasis = true;
      }
      if (/font-style\s*:\s*italic/i.test(allStyles)) {
        hasOtherEmphasis = true;
      }
      if (/text-decoration[^:]*:\s*[^;]*underline/i.test(allStyles)) {
        hasOtherEmphasis = true;
      }
    }

    if (hasOtherEmphasis) return;

    const snippet = textContent.length > 80
      ? textContent.substring(0, 80) + '...'
      : textContent;

    issues.push({
      id: `color-only-${courseId}-${contentId}-${index}`,
      type: 'accessibility',
      category: 'color-only',
      severity: 'medium',
      title: 'Color May Be Used as Sole Indicator',
      description: `"${snippet}" uses color (${detectedColor}) as the only visual indicator. WCAG 1.4.1 requires a non-color cue like bold or underline if color conveys meaning.`,
      location: location,
      autoFixAvailable: true,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      rubricStandard: 'CVC-OEI D6: Use of Color',
      standardsTags: getStandardsTagsForIssue('color-only'),
      contentType: contentType,
      contentId: contentId,
      elementHtml: sanitizeHtmlForStorage(el.outerHTML.substring(0, 500)),
      suggestedFix: 'Add bold, italic, underline, or an icon/symbol alongside the color to ensure meaning is conveyed through multiple visual channels — not color alone.',
      fixSteps: [
        '1. Review this colored text — is the color purely decorative, or does it convey meaning?',
        '2. If decorative (e.g., branding color), no action needed',
        '3. If meaningful (e.g., red = important, green = correct), add another visual indicator:',
        '   - Bold the text (<strong>)',
        '   - Add an icon or symbol (e.g., warning symbol for warnings, checkmark for correct)',
        '   - Use italic or underline as an additional cue',
        '   - Add a text label (e.g., "Important:" before the colored text)',
        '4. Save the page in Canvas'
      ]
    });
  });

  return issues;
}

/**
 * Check for auto-play media elements (CVC-OEI D16)
 * Detects <audio>, <video> with autoplay attribute, and <iframe> embeds with autoplay=1 in src URL
 */
function checkAutoplayMedia(
  doc: Document,
  location: string,
  courseId: string,
  courseName: string,
  contentId: string,
  contentType: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];

  // 1. Check <audio> and <video> elements for autoplay attribute
  const mediaElements = doc.querySelectorAll('audio, video');
  mediaElements.forEach((el, index) => {
    if (el.hasAttribute('autoplay')) {
      const tagName = el.tagName.toLowerCase();
      const label = tagName === 'audio' ? 'Audio' : 'Video';
      issues.push({
        id: `autoplay-${tagName}-${courseId}-${contentId}-${index}`,
        type: 'accessibility',
        category: 'autoplay',
        severity: 'high',
        title: `${label} Set to Auto-Play`,
        description: `A <${tagName}> element has the autoplay attribute. Auto-playing media can disorient screen reader users, cause unexpected noise in classroom settings, and consume bandwidth on mobile devices. CVC-OEI D16 requires that media does not auto-play.`,
        location: location,
        autoFixAvailable: true,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        rubricStandard: 'CVC-OEI D16: Auto-Play Media',
        standardsTags: getStandardsTagsForIssue('autoplay'),
        contentType: contentType,
        contentId: contentId,
        elementHtml: sanitizeHtmlForStorage(el.outerHTML),
        suggestedFix: `Remove the autoplay attribute from the <${tagName}> element`,
        fixSteps: [
          '1. Open the page in Canvas editor',
          '2. Switch to HTML editor view',
          `3. Find the <${tagName}> element`,
          '4. Remove the "autoplay" attribute',
          '5. Save the page'
        ]
      });
    }
  });

  // 2. Check <iframe> elements for autoplay=1 in src URL
  const iframes = doc.querySelectorAll('iframe');
  iframes.forEach((iframe, index) => {
    const src = iframe.getAttribute('src') || '';
    if (/[?&]autoplay=1/i.test(src)) {
      let platform = 'Embedded video';
      if (src.includes('youtube.com') || src.includes('youtube-nocookie.com') || src.includes('youtu.be')) {
        platform = 'YouTube video';
      } else if (src.includes('vimeo.com')) {
        platform = 'Vimeo video';
      }

      issues.push({
        id: `autoplay-iframe-${courseId}-${contentId}-${index}`,
        type: 'accessibility',
        category: 'autoplay',
        severity: 'high',
        title: `${platform} Set to Auto-Play`,
        description: `An embedded video (iframe) has autoplay=1 in its URL. Auto-playing media can disorient screen reader users, cause unexpected noise in classroom settings, and consume bandwidth on mobile devices. CVC-OEI D16 requires that media does not auto-play.`,
        location: location,
        autoFixAvailable: true,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        rubricStandard: 'CVC-OEI D16: Auto-Play Media',
        standardsTags: getStandardsTagsForIssue('autoplay'),
        contentType: contentType,
        contentId: contentId,
        elementHtml: sanitizeHtmlForStorage(iframe.outerHTML),
        suggestedFix: 'Remove autoplay=1 from the iframe src URL',
        fixSteps: [
          '1. Open the page in Canvas editor',
          '2. Switch to HTML editor view',
          '3. Find the <iframe> element',
          '4. In the src URL, remove "autoplay=1" (and the preceding ? or &)',
          '5. Save the page'
        ]
      });
    }
  });

  return issues;
}