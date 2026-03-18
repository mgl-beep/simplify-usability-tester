// Content scanner for uploaded course files
import type { ScanIssue } from "../App";
import { getStandardsTagsForIssue } from "./standards/standardsMapping";

export interface ScannedFolder {
  name: string;
  fileCount: number;
  htmlFiles: number;
  imageFiles: number;
  pdfFiles: number;
  videoFiles: number;
}

// Helper function to format file path into readable location
function formatLocation(filePath: string): string {
  // Remove folder name prefix and file extension
  const parts = filePath.split('/');
  if (parts.length > 1) {
    // Get the subfolder or section name
    const section = parts[parts.length - 2];
    return section.replace(/_/g, ' ').replace(/-/g, ' ');
  }
  return filePath;
}

export async function scanFolderContent(files: FileList): Promise<{
  folder: ScannedFolder;
  issues: ScanIssue[];
}> {
  const issues: ScanIssue[] = [];
  let htmlFiles = 0;
  let imageFiles = 0;
  let pdfFiles = 0;
  let videoFiles = 0;

  // Get folder name from first file path
  const firstFile = files[0];
  const folderName = firstFile.webkitRelativePath.split('/')[0] || 'Uploaded Folder';

  // Process each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = file.name.toLowerCase();
    const filePath = file.webkitRelativePath || file.name;

    // Count file types
    if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
      htmlFiles++;
      await scanHTMLFile(file, filePath, issues, folderName);
    } else if (fileName.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
      imageFiles++;
    } else if (fileName.endsWith('.pdf')) {
      pdfFiles++;
      scanPDFFile(file, filePath, issues, folderName);
    } else if (fileName.match(/\.(mp4|mov|avi|webm|mkv)$/)) {
      videoFiles++;
      scanVideoFile(file, filePath, issues, folderName);
    }
  }

  return {
    folder: {
      name: folderName,
      fileCount: files.length,
      htmlFiles,
      imageFiles,
      pdfFiles,
      videoFiles,
    },
    issues,
  };
}

async function scanHTMLFile(file: File, filePath: string, issues: ScanIssue[], folderName: string): Promise<void> {
  try {
    const content = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // Check for images without alt text
    const images = doc.querySelectorAll('img');
    images.forEach((img, index) => {
      const alt = img.getAttribute('alt');
      if (!alt || alt.trim() === '') {
        issues.push({
          id: `alt-${filePath}-${index}`,
          type: 'accessibility',
          category: 'alt-text',
          severity: 'high',
          title: 'Missing Alt Text',
          description: `Image "${img.getAttribute('src') || 'unknown'}" is missing alt text`,
          location: formatLocation(filePath),
          autoFixAvailable: false,
          courseName: folderName,
          courseId: 'uploaded',
          status: 'pending',
          standardsTags: getStandardsTagsForIssue('alt-text'),
        });
      }
    });

    // Check for broken internal links
    const links = doc.querySelectorAll('a[href]');
    links.forEach((link, index) => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
        issues.push({
          id: `link-${filePath}-${index}`,
          type: 'accessibility',
          category: 'broken-link',
          severity: 'medium',
          title: 'Potentially Broken Link',
          description: `Link to "${href}" may be broken`,
          location: formatLocation(filePath),
          autoFixAvailable: true,
          courseName: folderName,
          courseId: 'uploaded',
          status: 'pending',
          contentType: 'page',
          contentId: filePath,
          elementHtml: link.outerHTML,
          standardsTags: getStandardsTagsForIssue('broken-link'),
        });
      }
    });

    // Check for long URLs in links (USABILITY)
    links.forEach((link, index) => {
      const href = link.getAttribute('href');
      const text = link.textContent?.trim() || '';
      if (href && text.startsWith('http') && text.length > 50) {
        issues.push({
          id: `long-url-${filePath}-${index}`,
          type: 'usability',
          category: 'long-url',
          severity: 'low',
          title: 'Long URL as Link Text',
          description: `Link displays full URL: "${text.substring(0, 50)}..."`,
          location: formatLocation(filePath),
          autoFixAvailable: true,
          courseName: folderName,
          courseId: 'uploaded',
          status: 'pending',
          standardsTags: getStandardsTagsForIssue('long-url'),
        });
      }
    });

    // USABILITY: Check for links that open in new tab without warning
    links.forEach((link, index) => {
      const target = link.getAttribute('target');
      const text = link.textContent?.trim() || '';
      if (target === '_blank' && !text.includes('(opens in new window)') && !text.includes('(external)')) {
        issues.push({
          id: `new-tab-${filePath}-${index}`,
          type: 'usability',
          category: 'confusing-navigation',
          severity: 'low',
          title: 'Unexpected New Tab',
          description: `Link "${text}" opens in new tab without warning to user`,
          location: formatLocation(filePath),
          autoFixAvailable: true,
          courseName: folderName,
          courseId: 'uploaded',
          status: 'pending',
          standardsTags: getStandardsTagsForIssue('confusing-navigation'),
        });
      }
    });

    // USABILITY: Check for excessive text without breaks
    const paragraphs = doc.querySelectorAll('p');
    paragraphs.forEach((p, index) => {
      const text = p.textContent?.trim() || '';
      const wordCount = text.split(/\s+/).length;
      if (wordCount > 200) {
        issues.push({
          id: `long-text-${filePath}-${index}`,
          type: 'usability',
          category: 'readability',
          severity: 'low',
          title: 'Long Text Block',
          description: `Paragraph contains ${wordCount} words. Consider breaking into smaller chunks for better readability`,
          location: formatLocation(filePath),
          autoFixAvailable: false,
          courseName: folderName,
          courseId: 'uploaded',
          status: 'pending',
          standardsTags: getStandardsTagsForIssue('readability'),
        });
      }
    });

    // USABILITY: Check for missing page title
    const title = doc.querySelector('title');
    if (!title || !title.textContent?.trim()) {
      issues.push({
        id: `no-title-${filePath}`,
        type: 'usability',
        category: 'confusing-navigation',
        severity: 'medium',
        title: 'Missing Page Title',
        description: 'Page lacks a descriptive title, making navigation confusing',
        location: formatLocation(filePath),
        autoFixAvailable: true,
        courseName: folderName,
        courseId: 'uploaded',
        status: 'pending',
        standardsTags: getStandardsTagsForIssue('confusing-navigation'),
      });
    }

    // USABILITY: Check for tables without headers (confusing data)
    const tables = doc.querySelectorAll('table');
    tables.forEach((table, index) => {
      const hasHeader = table.querySelector('th');
      if (!hasHeader) {
        issues.push({
          id: `table-header-${filePath}-${index}`,
          type: 'usability',
          category: 'confusing-navigation',
          severity: 'medium',
          title: 'Table Without Headers',
          description: 'Data table lacks header row, making content difficult to understand',
          location: formatLocation(filePath),
          autoFixAvailable: true,
          courseName: folderName,
          courseId: 'uploaded',
          status: 'pending',
          standardsTags: getStandardsTagsForIssue('confusing-navigation'),
        });
      }
    });

    // Check for heading hierarchy
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      if (lastLevel > 0 && level > lastLevel + 1) {
        issues.push({
          id: `heading-${filePath}-${index}`,
          type: 'accessibility',
          category: 'inconsistent-heading',
          severity: 'medium',
          title: 'Inconsistent Heading Hierarchy',
          description: `Heading jumps from H${lastLevel} to H${level}`,
          location: formatLocation(filePath),
          autoFixAvailable: true,
          courseName: folderName,
          courseId: 'uploaded',
          status: 'pending',
          standardsTags: getStandardsTagsForIssue('inconsistent-heading'),
        });
      }
      lastLevel = level;
    });

    // Check for low contrast text (simple heuristic)
    const styledElements = doc.querySelectorAll('[style*="color"]');
    styledElements.forEach((element, index) => {
      const style = element.getAttribute('style');
      if (style && (style.includes('color: #ccc') || style.includes('color: #ddd') || style.includes('color: lightgray'))) {
        issues.push({
          id: `contrast-${filePath}-${index}`,
          type: 'accessibility',
          category: 'contrast',
          severity: 'high',
          title: 'Low Contrast Text',
          description: 'Text color may not meet WCAG contrast requirements',
          location: formatLocation(filePath),
          autoFixAvailable: true,
          courseName: folderName,
          courseId: 'uploaded',
          status: 'pending',
          standardsTags: getStandardsTagsForIssue('contrast'),
        });
      }
    });

    // Check for videos without captions
    const videos = doc.querySelectorAll('video');
    videos.forEach((video, index) => {
      const tracks = video.querySelectorAll('track[kind="captions"], track[kind="subtitles"]');
      if (tracks.length === 0) {
        issues.push({
          id: `video-${filePath}-${index}`,
          type: 'accessibility',
          category: 'video-caption',
          severity: 'high',
          title: 'Missing Video Captions',
          description: `Video "${video.getAttribute('src') || 'embedded'}" lacks captions`,
          location: formatLocation(filePath),
          autoFixAvailable: false,
          courseName: folderName,
          courseId: 'uploaded',
          status: 'pending',
          standardsTags: getStandardsTagsForIssue('video-caption'),
        });
      }
    });

    // Check for iframes (embedded content)
    const iframes = doc.querySelectorAll('iframe');
    iframes.forEach((iframe, index) => {
      const title = iframe.getAttribute('title');
      if (!title || title.trim() === '') {
        issues.push({
          id: `iframe-${filePath}-${index}`,
          type: 'accessibility',
          category: 'alt-text',
          severity: 'medium',
          title: 'Missing iframe Title',
          description: 'Embedded content lacks descriptive title attribute',
          location: formatLocation(filePath),
          autoFixAvailable: true,
          courseName: folderName,
          courseId: 'uploaded',
          status: 'pending',
          standardsTags: getStandardsTagsForIssue('alt-text'),
        });
      }
    });

  } catch (error) {
    console.error(`Error scanning HTML file ${filePath}:`, error);
  }
}

function scanPDFFile(file: File, filePath: string, issues: ScanIssue[], folderName: string): void {
  // PDF Accessibility Check — re-enabled
  // PDFs require additional validation
  issues.push({
    id: `pdf-${filePath}`,
    type: 'accessibility',
    category: 'pdf-tag',
    severity: 'medium',
    title: 'PDF Accessibility Check Needed',
    description: `PDF "${file.name}" should be manually verified for tags and accessibility`,
    location: formatLocation(filePath),
    autoFixAvailable: false,
    courseName: folderName,
    courseId: 'uploaded',
    status: 'pending',
    standardsTags: getStandardsTagsForIssue('pdf-tag'),
  });
}

function scanVideoFile(file: File, filePath: string, issues: ScanIssue[], folderName: string): void {
  // Video files need caption verification
  issues.push({
    id: `video-file-${filePath}`,
    type: 'accessibility',
    category: 'video-caption',
    severity: 'high',
    title: 'Video Caption Check Needed',
    description: `Video "${file.name}" should include captions or transcript`,
    location: formatLocation(filePath),
    autoFixAvailable: false,
    courseName: folderName,
    courseId: 'uploaded',
    status: 'pending',
    standardsTags: getStandardsTagsForIssue('video-caption'),
  });
}
