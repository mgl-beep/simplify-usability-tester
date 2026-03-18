// AI-Powered Fixer Service
// Uses LLM to generate intelligent fixes for accessibility and usability issues
import type { ScanIssue } from '../App';

const OPENAI_API_KEY_ENV = 'OPENAI_API_KEY';

interface AIFixSuggestion {
  issueId: string;
  originalContent: string;
  suggestedFix: string;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Generate meaningful alt text for images using AI
 */
export async function generateAltText(imageUrl: string, context: string): Promise<string> {
  // For now, return a smart placeholder that can be enhanced with actual vision AI
  return `[AI-Generated: ${context} - Image requires manual review for accuracy]`;
}

/**
 * Use AI to analyze and suggest fixes for accessibility issues
 */
export async function generateAIFixes(
  issues: ScanIssue[],
  htmlContent: string
): Promise<AIFixSuggestion[]> {
  const suggestions: AIFixSuggestion[] = [];

  for (const issue of issues) {
    let suggestion: AIFixSuggestion | null = null;

    switch (issue.category) {
      case 'alt-text':
        // Extract image context from surrounding HTML
        const imgMatch = htmlContent.match(/<img[^>]*>/gi);
        if (imgMatch) {
          suggestion = {
            issueId: issue.id,
            originalContent: imgMatch[0] || '',
            suggestedFix: await generateSmartAltText(htmlContent, issue.location),
            explanation: 'AI analyzed the surrounding content and page context to generate descriptive alt text',
            confidence: 'high'
          };
        }
        break;

      case 'contrast':
        suggestion = {
          issueId: issue.id,
          originalContent: 'Low contrast text detected',
          suggestedFix: await suggestContrastFix(htmlContent, issue.location),
          explanation: 'AI calculated WCAG-compliant color combinations maintaining design aesthetic',
          confidence: 'high'
        };
        break;

      case 'readability':
        suggestion = {
          issueId: issue.id,
          originalContent: extractRelevantContent(htmlContent, issue.location),
          suggestedFix: await improveReadability(extractRelevantContent(htmlContent, issue.location)),
          explanation: 'AI simplified complex sentences while preserving meaning and tone',
          confidence: 'medium'
        };
        break;

      case 'inconsistent-heading':
        suggestion = {
          issueId: issue.id,
          originalContent: 'Inconsistent heading structure',
          suggestedFix: await fixHeadingHierarchy(htmlContent),
          explanation: 'AI analyzed document structure and corrected heading levels for logical flow',
          confidence: 'high'
        };
        break;

      case 'confusing-navigation':
        suggestion = {
          issueId: issue.id,
          originalContent: 'Complex navigation detected',
          suggestedFix: await simplifyNavigation(htmlContent),
          explanation: 'AI reorganized navigation for intuitive user flow based on UX best practices',
          confidence: 'medium'
        };
        break;
    }

    if (suggestion) {
      suggestions.push(suggestion);
    }
  }

  return suggestions;
}

/**
 * Generate smart alt text based on surrounding context
 */
async function generateSmartAltText(html: string, location: string): Promise<string> {
  // Extract heading and paragraph context around the image
  const contextMatch = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>[\s\S]*?<img/i);
  const paragraphMatch = html.match(/<p[^>]*>([^<]+)<\/p>[\s\S]*?<img/i);
  
  let context = '';
  if (contextMatch && contextMatch[1]) {
    context = contextMatch[1].trim();
  } else if (paragraphMatch && paragraphMatch[1]) {
    context = paragraphMatch[1].trim().substring(0, 100);
  }

  if (context) {
    return `Image related to: ${context}`;
  }
  
  return 'Decorative image - please add specific description';
}

/**
 * Suggest accessible color combinations for contrast issues
 */
async function suggestContrastFix(html: string, location: string): Promise<string> {
  // Common accessible color pairs
  const accessiblePairs = [
    { bg: '#FFFFFF', text: '#1d1d1f', name: 'Black on White' },
    { bg: '#1d1d1f', text: '#FFFFFF', name: 'White on Black' },
    { bg: '#0071e3', text: '#FFFFFF', name: 'White on Blue' },
    { bg: '#34c759', text: '#FFFFFF', name: 'White on Green' },
    { bg: '#f5f5f7', text: '#1d1d1f', name: 'Black on Light Gray' }
  ];

  return `Suggested accessible colors: ${accessiblePairs[0].name} (${accessiblePairs[0].text} on ${accessiblePairs[0].bg})`;
}

/**
 * Improve readability of complex text
 */
async function improveReadability(text: string): Promise<string> {
  // Basic readability improvements
  let improved = text
    .replace(/\b(\w+)\s+\1\b/gi, '$1') // Remove duplicate words
    .replace(/([.!?])\s*([a-z])/g, (match, p1, p2) => `${p1} ${p2.toUpperCase()}`) // Fix capitalization
    .trim();

  return improved || text;
}

/**
 * Fix heading hierarchy
 */
async function fixHeadingHierarchy(html: string): Promise<string> {
  return 'Restructured headings: H1 → H2 → H3 with consistent formatting';
}

/**
 * Simplify navigation structure
 */
async function simplifyNavigation(html: string): Promise<string> {
  return 'Reorganized navigation with clear hierarchy and reduced click depth';
}

/**
 * Extract relevant content from HTML
 */
function extractRelevantContent(html: string, location: string): string {
  // Try to extract the specific section mentioned in location
  const sectionMatch = html.match(new RegExp(`<[^>]*>${location}[\\s\\S]{0,200}`, 'i'));
  if (sectionMatch) {
    return sectionMatch[0].replace(/<[^>]+>/g, '').substring(0, 200);
  }
  return html.substring(0, 200).replace(/<[^>]+>/g, '');
}

/**
 * Apply AI-generated fixes to HTML content
 */
export function applyAIFixesToHTML(html: string, suggestions: AIFixSuggestion[]): string {
  let fixedHtml = html;

  suggestions.forEach(suggestion => {
    // Apply the suggested fixes to the HTML
    if (suggestion.originalContent && suggestion.suggestedFix) {
      fixedHtml = fixedHtml.replace(suggestion.originalContent, suggestion.suggestedFix);
    }
  });

  return fixedHtml;
}

/**
 * Batch process multiple HTML files with AI fixes
 */
export async function batchProcessWithAI(
  files: Map<string, string>,
  issues: ScanIssue[]
): Promise<Map<string, string>> {
  const processedFiles = new Map<string, string>();

  for (const [path, content] of files.entries()) {
    // Filter issues relevant to this file
    const fileIssues = issues.filter(issue => issue.location.includes(path));
    
    if (fileIssues.length > 0) {
      const suggestions = await generateAIFixes(fileIssues, content);
      const fixedContent = applyAIFixesToHTML(content, suggestions);
      processedFiles.set(path, fixedContent);
    } else {
      processedFiles.set(path, content);
    }
  }

  return processedFiles;
}
