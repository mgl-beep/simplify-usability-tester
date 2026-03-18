// Audio Description Scanner — WCAG 2.1 SC 1.2.5
// Detects videos that may need audio descriptions for visual content

import type { ScanIssue } from '../../App';
import { getStandardsTagsForIssue } from '../standards/standardsMapping';
import { sanitizeHtmlForStorage } from '../htmlSanitizer';

// Keywords that suggest visual-heavy content needing audio description
const HIGH_PRIORITY_KEYWORDS = [
  'lab', 'demonstration', 'demo', 'technique', 'exercise', 'procedure',
  'experiment', 'dissection', 'anatomy', 'sculpture', 'physical',
  'hands-on', 'watch', 'observe', 'tutorial', 'step-by-step',
  'how to', 'how-to', 'performance', 'studio', 'workshop',
  'cooking', 'recipe', 'dance', 'yoga', 'fitness', 'art',
  'drawing', 'painting', 'pottery', 'welding', 'woodworking',
  'medical', 'surgical', 'clinical', 'nursing', 'emt',
  'sign language', 'asl', 'chemistry', 'biology', 'physics'
];

// Keywords that suggest talking-head / slides content — skip these
const SKIP_KEYWORDS = [
  'lecture', 'presentation', 'slideshow', 'slides', 'overview',
  'welcome', 'introduction video', 'meet your instructor',
  'office hours', 'q&a', 'discussion recap', 'announcements'
];

// Video platform patterns
const VIDEO_PATTERNS = [
  { regex: /youtube\.com\/embed/i, platform: 'YouTube' },
  { regex: /youtube-nocookie\.com\/embed/i, platform: 'YouTube' },
  { regex: /youtu\.be/i, platform: 'YouTube' },
  { regex: /player\.vimeo\.com/i, platform: 'Vimeo' },
  { regex: /instructuremedia\.com/i, platform: 'Canvas Studio' },
  { regex: /arc\.instructure\.com/i, platform: 'Canvas Studio' },
];

function getVideoPlatform(src: string): string | null {
  for (const pattern of VIDEO_PATTERNS) {
    if (pattern.regex.test(src)) return pattern.platform;
  }
  return null;
}

function getSurroundingText(doc: Document, element: Element): string {
  // Get text from the element's parent and nearby siblings
  const parent = element.parentElement;
  if (!parent) return '';
  const parentText = parent.textContent || '';
  // Also check previous/next siblings
  const prev = element.previousElementSibling?.textContent || '';
  const next = element.nextElementSibling?.textContent || '';
  return `${prev} ${parentText} ${next}`.toLowerCase();
}

function hasExistingAudioDescription(doc: Document, element: Element): boolean {
  // Check for <track kind="descriptions"> inside <video>
  if (element.tagName === 'VIDEO') {
    const tracks = element.querySelectorAll('track[kind="descriptions"]');
    if (tracks.length > 0) return true;
  }

  // Check surrounding text for existing audio description / text alternative
  const surrounding = getSurroundingText(doc, element);
  return surrounding.includes('audio description') ||
         surrounding.includes('text alternative') ||
         surrounding.includes('described version');
}

function triageVideoContext(surroundingText: string): { priority: 'high' | 'medium' | 'skip'; reason: string } {
  const text = surroundingText.toLowerCase();

  // Check skip keywords first
  for (const keyword of SKIP_KEYWORDS) {
    if (text.includes(keyword)) {
      return { priority: 'skip', reason: `Appears to be a ${keyword} — likely talking-head or slides` };
    }
  }

  // Check high priority keywords
  for (const keyword of HIGH_PRIORITY_KEYWORDS) {
    if (text.includes(keyword)) {
      return { priority: 'high', reason: `Contains "${keyword}" — visual content likely central to understanding` };
    }
  }

  // Default: medium priority (unknown context)
  return { priority: 'medium', reason: 'Video may contain visual content that needs description' };
}

export async function scanAudioDescription(
  html: string,
  location: string,
  courseId: string,
  courseName: string,
  contentId: string,
  contentType: 'page' | 'assignment' | 'announcement' | 'discussion'
): Promise<ScanIssue[]> {
  if (!html) return [];

  const issues: ScanIssue[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Find all iframes and video elements
  const iframes = Array.from(doc.querySelectorAll('iframe'));
  const videos = Array.from(doc.querySelectorAll('video'));

  const videoElements: { element: Element; src: string; platform: string }[] = [];

  for (const iframe of iframes) {
    const src = iframe.getAttribute('src') || '';
    const platform = getVideoPlatform(src);
    if (platform) {
      videoElements.push({ element: iframe, src, platform });
    }
  }

  for (const video of videos) {
    const src = video.getAttribute('src') || video.querySelector('source')?.getAttribute('src') || '';
    videoElements.push({ element: video, src, platform: 'HTML5 Video' });
  }

  for (const { element, src, platform } of videoElements) {
    // Skip if already has audio description
    if (hasExistingAudioDescription(doc, element)) continue;

    const surroundingText = getSurroundingText(doc, element);
    const triage = triageVideoContext(surroundingText);

    // Skip low-priority videos (lectures, presentations)
    if (triage.priority === 'skip') continue;

    const severity = triage.priority === 'high' ? 'high' : 'medium';
    const elementHtml = sanitizeHtmlForStorage(element.outerHTML);

    // Extract a title from surrounding context
    const parent = element.parentElement;
    const heading = parent?.closest('div')?.querySelector('h1, h2, h3, h4')?.textContent?.trim();
    const title = element.getAttribute('title') || heading || '';

    issues.push({
      id: `ad-${contentId}-${issues.length}`,
      courseId,
      courseName,
      title: title ? `Video needs audio description: ${title}` : 'Video needs audio description',
      description: `${platform} video on "${location}" may need an audio description (WCAG 1.2.5). ${triage.reason}. Audio descriptions narrate important visual content for blind and low-vision users.`,
      category: 'audio-description',
      severity,
      location,
      elementHtml,
      contentType,
      contentId,
      suggestedFix: 'Generate an audio description script and add a text alternative below the video.',
      autoFixAvailable: true,
      standardsTags: getStandardsTagsForIssue('audio-description'),
      rubricStandard: 'WCAG 2.1 SC 1.2.5 — Audio Description (Prerecorded)',
      videoSrc: src,
      videoPlatform: platform,
    });
  }

  return issues;
}
