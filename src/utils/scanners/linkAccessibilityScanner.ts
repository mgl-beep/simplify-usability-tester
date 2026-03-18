/**
 * Link Accessibility Scanner
 *
 * Collects all external links from course HTML content, sends them to a
 * Supabase endpoint for WCAG signal checking, and creates issues for
 * links that score below the accessibility threshold.
 *
 * WCAG checks performed server-side:
 * - <html lang="..."> attribute (WCAG 3.1.1)
 * - <meta name="viewport"> present (WCAG 1.4.4)
 * - Images without alt text (WCAG 1.1.1)
 * - Heading structure (WCAG 1.3.1)
 * - <title> tag present (WCAG 2.4.2)
 */

import type { ScanIssue } from '../../App';
import { getStandardsTagsForIssue } from '../standards/standardsMapping';

const SCORE_THRESHOLD = 100; // Links below this score generate an issue

// Internal Canvas domains to skip
const SKIP_DOMAINS = [
  'instructure.com',
  'canvas.instructure.com',
  'canvasapi.net',
  'amazonaws.com',
  'cloudfront.net',
];

/**
 * Extract all external http/https links from HTML content
 */
function extractExternalLinks(html: string): { url: string; text: string }[] {
  const links: { url: string; text: string }[] = [];
  // Match <a href="..."> tags
  const anchorRegex = /<a\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = anchorRegex.exec(html)) !== null) {
    const url = match[1].trim();
    const text = match[2].replace(/<[^>]*>/g, '').trim(); // Strip inner HTML tags
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const hostname = new URL(url).hostname;
        const isInternal = SKIP_DOMAINS.some(d => hostname.includes(d));
        if (!isInternal) {
          links.push({ url, text: text || url });
        }
      } catch {
        // Invalid URL, skip
      }
    }
  }
  return links;
}

interface LinkAuditResult {
  url: string;
  score: number;
  checks: {
    hasLang: boolean;
    hasViewport: boolean;
    hasTitle: boolean;
    hasHeadings: boolean;
    imagesWithoutAlt: number;
    totalImages: number;
  };
  error?: string;
}

/**
 * Send links to Supabase for accessibility auditing
 */
async function auditLinksViaSupabase(urls: string[]): Promise<LinkAuditResult[]> {
  const { SUPABASE_URL } = await import('../supabase/info');

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-74508696/audit-link-accessibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    });

    if (!response.ok) {
      console.error('Link accessibility audit failed:', response.status);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error calling link accessibility endpoint:', error);
    return [];
  }
}

/**
 * Get human-readable failure descriptions from audit results
 */
function getFailures(checks: LinkAuditResult['checks']): string[] {
  const failures: string[] = [];
  if (!checks.hasLang) failures.push('Missing language attribute (lang)');
  if (!checks.hasViewport) failures.push('Missing viewport meta tag');
  if (!checks.hasTitle) failures.push('Missing page title');
  if (!checks.hasHeadings) failures.push('No heading structure');
  if (checks.imagesWithoutAlt > 0) {
    failures.push(`${checks.imagesWithoutAlt} image${checks.imagesWithoutAlt > 1 ? 's' : ''} missing alt text`);
  }
  return failures;
}

/**
 * Determine severity based on score
 */
function getSeverity(score: number): 'high' | 'medium' | 'low' {
  if (score < 40) return 'high';
  if (score < 70) return 'medium';
  return 'low';
}

/**
 * Scan all course HTML for external links and audit their accessibility.
 *
 * @param allHtmlContent - Array of { html, location, contentId, contentType } from all scanned pages
 * @param courseId - The Canvas course ID
 * @param courseName - The Canvas course name
 * @returns ScanIssue[] for links below the accessibility threshold
 */
export async function scanLinkAccessibility(
  allHtmlContent: { html: string; location: string; contentId: string; contentType: string }[],
  courseId: string,
  courseName: string
): Promise<ScanIssue[]> {
  // 1. Collect all external links across all content, deduplicating by URL
  const urlMap = new Map<string, { text: string; location: string; contentId: string; contentType: string }>();

  for (const content of allHtmlContent) {
    const links = extractExternalLinks(content.html);
    for (const link of links) {
      if (!urlMap.has(link.url)) {
        urlMap.set(link.url, {
          text: link.text,
          location: content.location,
          contentId: content.contentId,
          contentType: content.contentType,
        });
      }
    }
  }

  if (urlMap.size === 0) return [];

  // 2. Send to Supabase for auditing (max 20 links to keep scan fast)
  const urls = Array.from(urlMap.keys()).slice(0, 20);
  const results = await auditLinksViaSupabase(urls);

  // 3. Create issues for links below threshold
  const issues: ScanIssue[] = [];

  for (const result of results) {
    if (result.error || result.score >= SCORE_THRESHOLD) continue;

    const linkInfo = urlMap.get(result.url);
    if (!linkInfo) continue;

    const failures = getFailures(result.checks);
    const severity = getSeverity(result.score);
    let hostname = '';
    try { hostname = new URL(result.url).hostname; } catch {}

    issues.push({
      id: `link-a11y-${courseId}-${btoa(result.url).slice(0, 12)}`,
      type: 'accessibility',
      category: 'link-accessibility',
      severity,
      title: `Linked Resource Has Accessibility Issues (${result.score}/100)`,
      description: `The external link to "${hostname}" scores ${result.score}/100 on basic WCAG checks. Issues found: ${failures.join(', ')}. Consider finding a more accessible alternative or adding context for students.`,
      location: linkInfo.location,
      autoFixAvailable: false,
      courseName,
      courseId,
      status: 'pending',
      standardsTags: getStandardsTagsForIssue('link-accessibility'),
      contentType: linkInfo.contentType as any,
      contentId: linkInfo.contentId,
      elementHtml: `<a href="${result.url}">${linkInfo.text}</a>`,
      suggestedFix: `Search for accessible alternatives: "${linkInfo.text} accessible WCAG compliant resource"`,
      linkUrl: result.url,
      linkAccessibilityScore: result.score,
      linkAccessibilityFailures: failures,
    });
  }

  return issues;
}
