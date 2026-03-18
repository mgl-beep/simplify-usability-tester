// Design Scanner - Font consistency, styling, and best practices
// Checks for font variety, size consistency, and design patterns

import { ScanIssue } from '../../App';
import { getStandardsTagsForIssue } from '../standards/standardsMapping';

interface FontUsage {
  family: string;
  occurrences: number;
  elements: string[];
}

interface FontSizeUsage {
  size: string;
  occurrences: number;
}

/**
 * Scan HTML content for design/consistency issues
 */
export async function scanDesign(
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
  
  // Check font consistency
  issues.push(...checkFontConsistency(doc, location, courseId, courseName, contentId, contentType));
  
  // Check font sizes
  issues.push(...checkFontSizes(doc, location, courseId, courseName, contentId, contentType));
  
  // TABLED: Excessive Inline Styling — disabled per user request
  // issues.push(...checkInlineStyling(doc, location, courseId, courseName, contentId, contentType));
  
  return issues;
}

/**
 * Check for too many different fonts
 */
function checkFontConsistency(
  doc: Document,
  location: string,
  courseId: string,
  courseName: string,
  contentId: string,
  contentType: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const fontUsage = new Map<string, FontUsage>();
  
  // Check all elements with font-family
  const allElements = doc.querySelectorAll('*');
  
  allElements.forEach(element => {
    const style = element.getAttribute('style') || '';
    const fontMatch = style.match(/font-family:\s*([^;]+)/i);
    
    if (fontMatch) {
      const fontFamily = normalizeFontName(fontMatch[1].trim());
      
      if (!fontUsage.has(fontFamily)) {
        fontUsage.set(fontFamily, {
          family: fontFamily,
          occurrences: 0,
          elements: []
        });
      }
      
      const usage = fontUsage.get(fontFamily)!;
      usage.occurrences++;
      usage.elements.push(element.tagName);
    }
  });
  
  // Check computed styles for elements without inline styles
  const textElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
  let defaultFontFound = false;
  
  // If more than 5 different fonts are used
  if (fontUsage.size > 5) {
    const fontList = Array.from(fontUsage.values())
      .sort((a, b) => b.occurrences - a.occurrences)
      .map(f => `${f.family} (${f.occurrences} times)`)
      .join(', ');

    issues.push({
      id: `font-variety-${courseId}-${contentId}`,
      type: 'usability',
      category: 'formatting',
      severity: 'low',
      title: 'Too Many Different Fonts',
      description: `Page uses ${fontUsage.size} different fonts: ${fontList}. Best practice is 2-3 fonts maximum for consistency.`,
      location: location,
      autoFixAvailable: true,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      rubricStandard: 'Best Practice - Design Consistency',
      standardsTags: getStandardsTagsForIssue('formatting'),
      contentType: contentType,
      contentId: contentId,
      suggestedFix: 'Standardize on 2-3 fonts: one for headings, one for body text, and optionally one for special elements',
      fixSteps: [
        '1. Choose a primary font for body text (e.g., Arial, Helvetica)',
        '2. Choose a secondary font for headings (e.g., Georgia, Verdana)',
        '3. Remove all other font specifications',
        '4. Apply consistently across all pages'
      ]
    });
  }
  
  // Check for decorative fonts that reduce readability
  // Note: Comic Sans is intentionally excluded — research shows it may help dyslexic readers.
  // WCAG does not ban any font by name.
  const decorativeFonts = ['Papyrus', 'Brush Script', 'Curlz'];

  fontUsage.forEach((usage, fontName) => {
    const isDecorative = decorativeFonts.some(bad =>
      fontName.toLowerCase().includes(bad.toLowerCase())
    );

    if (isDecorative) {
      issues.push({
        id: `problematic-font-${courseId}-${contentId}-${fontName}`,
        type: 'usability',
        category: 'formatting',
        severity: 'low',
        title: 'Decorative Font May Reduce Readability',
        description: `Font "${fontName}" is a decorative font that may be harder to read in body text. Consider a standard font like Arial or Verdana for better readability.`,
        location: location,
        autoFixAvailable: true,
        courseName: courseName,
        courseId: courseId,
        status: 'pending',
        rubricStandard: 'Best Practice - Font Accessibility',
        standardsTags: getStandardsTagsForIssue('formatting'),
        contentType: contentType,
        contentId: contentId,
        suggestedFix: 'Replace with a clear, professional font like Arial, Verdana, or Open Sans',
        fixSteps: [
          '1. Open the page in Canvas editor',
          '2. Select all text using this font',
          '3. Change font to Arial, Verdana, or Helvetica',
          '4. Save and review'
        ]
      });
    }
  });
  
  return issues;
}

/**
 * Check font sizes for accessibility
 */
function checkFontSizes(
  doc: Document,
  location: string,
  courseId: string,
  courseName: string,
  contentId: string,
  contentType: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const fontSizes = new Map<string, FontSizeUsage>();
  
  // Check all elements with font-size
  const allElements = doc.querySelectorAll('*');
  
  allElements.forEach((element, index) => {
    const style = element.getAttribute('style') || '';
    const sizeMatch = style.match(/font-size:\s*([^;]+)/i);
    
    if (sizeMatch) {
      const fontSize = sizeMatch[1].trim();
      
      if (!fontSizes.has(fontSize)) {
        fontSizes.set(fontSize, {
          size: fontSize,
          occurrences: 0
        });
      }
      
      fontSizes.get(fontSize)!.occurrences++;
      
      // Check if size is too small
      const numericSize = parseFloat(fontSize);
      const unit = fontSize.replace(/[0-9.]/g, '');
      
      if ((unit === 'px' && numericSize < 16) || 
          (unit === 'pt' && numericSize < 12) ||
          (unit === 'em' && numericSize < 1)) {
        issues.push({
          id: `small-font-${courseId}-${contentId}-${index}`,
          type: 'usability',
          category: 'formatting',
          severity: 'low',
          title: 'Small Font Size',
          description: `Text size of ${fontSize} is below the recommended 16px for readability. Note: WCAG AA does not mandate a minimum font size — this is a best practice recommendation.`,
          location: location,
          autoFixAvailable: true,
          courseName: courseName,
          courseId: courseId,
          status: 'pending',
          rubricStandard: 'CVC-OEI D1: Content Presentation',
          standardsTags: getStandardsTagsForIssue('formatting'),
          contentType: contentType,
          contentId: contentId,
          elementHtml: element.outerHTML.substring(0, 200),
          suggestedFix: 'Increase font size to at least 16px (12pt) for body text',
          fixSteps: [
            '1. Open the page in Canvas editor',
            '2. Select the text',
            '3. Change font size to 16px or larger',
            '4. Ensure text is readable at default zoom'
          ]
        });
      }
    }
  });
  
  // Check for too many different font sizes
  if (fontSizes.size > 10) {
    const sizeList = Array.from(fontSizes.values())
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 10)
      .map(s => s.size)
      .join(', ');
    
    issues.push({
      id: `font-size-variety-${courseId}-${contentId}`,
      type: 'usability',
      category: 'formatting',
      severity: 'low',
      title: 'Too Many Different Font Sizes',
      description: `Page uses ${fontSizes.size} different font sizes (${sizeList}...). Best practice is 3-4 sizes: body, headings, small print.`,
      location: location,
      autoFixAvailable: false,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      rubricStandard: 'Best Practice - Typography Consistency',
      standardsTags: getStandardsTagsForIssue('formatting'),
      contentType: contentType,
      contentId: contentId,
      suggestedFix: 'Standardize on 3-4 font sizes for visual hierarchy',
      fixSteps: [
        '1. Define standard sizes:',
        '   - Body text: 16px',
        '   - H1: 32px',
        '   - H2: 24px',
        '   - H3: 20px',
        '2. Apply consistently across all content',
        '3. Avoid random size adjustments'
      ]
    });
  }
  
  return issues;
}

/**
 * Check for overuse of inline styling
 */
function checkInlineStyling(
  doc: Document,
  location: string,
  courseId: string,
  courseName: string,
  contentId: string,
  contentType: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  
  // Count elements with inline styles
  const styledElements = doc.querySelectorAll('[style]');
  const totalElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, span').length;
  
  const percentageStyled = (styledElements.length / totalElements) * 100;
  
  if (percentageStyled > 50) {
    issues.push({
      id: `inline-styling-${courseId}-${contentId}`,
      type: 'usability',
      category: 'formatting',
      severity: 'low',
      title: 'Excessive Inline Styling',
      description: `${Math.round(percentageStyled)}% of elements use inline styles. This makes the content harder to maintain and update consistently.`,
      location: location,
      autoFixAvailable: false,
      courseName: courseName,
      courseId: courseId,
      status: 'pending',
      rubricStandard: 'Best Practice - Code Quality',
      standardsTags: getStandardsTagsForIssue('formatting'),
      contentType: contentType,
      contentId: contentId,
      suggestedFix: 'Use Canvas theme styles and heading formats instead of manual styling',
      fixSteps: [
        '1. Review the page content',
        '2. Remove unnecessary inline styles',
        '3. Use Heading 1, Heading 2, etc. from the format dropdown',
        '4. Let Canvas handle the default styling'
      ]
    });
  }
  
  return issues;
}

/**
 * Normalize font names for comparison
 */
function normalizeFontName(fontName: string): string {
  // Remove quotes and extra whitespace
  return fontName
    .replace(/["']/g, '')
    .split(',')[0]
    .trim();
}

/**
 * Analyze all fonts used across the course
 */
export function analyzeCourseFont(allHtml: string[]): {
  fonts: FontUsage[];
  issues: string[];
} {
  const fontUsage = new Map<string, FontUsage>();
  
  allHtml.forEach(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const allElements = doc.querySelectorAll('*');
    
    allElements.forEach(element => {
      const style = element.getAttribute('style') || '';
      const fontMatch = style.match(/font-family:\s*([^;]+)/i);
      
      if (fontMatch) {
        const fontFamily = normalizeFontName(fontMatch[1].trim());
        
        if (!fontUsage.has(fontFamily)) {
          fontUsage.set(fontFamily, {
            family: fontFamily,
            occurrences: 0,
            elements: []
          });
        }
        
        const usage = fontUsage.get(fontFamily)!;
        usage.occurrences++;
        usage.elements.push(element.tagName);
      }
    });
  });
  
  const fonts = Array.from(fontUsage.values()).sort((a, b) => b.occurrences - a.occurrences);
  const issues: string[] = [];
  
  if (fonts.length > 5) {
    issues.push(`Course uses ${fonts.length} different fonts - recommend 2-3 maximum`);
  }
  
  return { fonts, issues };
}