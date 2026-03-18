// IMSCC (IMS Common Cartridge) Parser
// Handles extracting and analyzing .imscc course packages
import JSZip from 'jszip';
import type { ScanIssue } from '../App';

export interface IMSCCCourse {
  title: string;
  identifier: string;
  modules: IMSCCModule[];
  resources: IMSCCResource[];
  fileCount: number;
  pages?: IMSCCPage[];
  assignments?: IMSCCAssignment[];
  files?: { [key: string]: string }; // Store file paths for images/attachments
  frontPage?: string; // Home page HTML content with images
}

export interface IMSCCPage {
  identifier: string;
  title: string;
  url: string;
  body: string;
}

export interface IMSCCAssignment {
  identifier: string;
  title: string;
  description: string;
  points_possible?: number;
  due_at?: string;
}

export interface IMSCCModule {
  title: string;
  items: IMSCCItem[];
}

export interface IMSCCItem {
  title: string;
  type: string;
  identifierref?: string;
  content_id?: string; // Link to page/assignment identifier
}

export interface IMSCCResource {
  identifier: string;
  type: string;
  href?: string;
  files: string[];
}

export async function parseIMSCCFile(file: File): Promise<{
  course: IMSCCCourse;
  issues: ScanIssue[];
  zip: JSZip;
}> {
  
  try {
    const zip = await JSZip.loadAsync(file);
    
    const issues: ScanIssue[] = [];

    // Parse imsmanifest.xml
    const manifestFile = zip.file('imsmanifest.xml');
    if (!manifestFile) {
      console.error('parseIMSCCFile: imsmanifest.xml not found');
      throw new Error('Invalid IMSCC file: imsmanifest.xml not found');
    }

    const manifestContent = await manifestFile.async('text');
    
    const parser = new DOMParser();
    const manifestDoc = parser.parseFromString(manifestContent, 'text/xml');

    // Extract course metadata
    const courseTitle = manifestDoc.querySelector('metadata lom title langstring')?.textContent || 
                        manifestDoc.querySelector('organizations organization')?.getAttribute('identifier') ||
                        file.name.replace('.imscc', '').replace('.zip', '');

    const organizationId = manifestDoc.querySelector('organizations organization')?.getAttribute('identifier') || 'course';
    
    // Parse modules/items
    const modules: IMSCCModule[] = [];
    const moduleElements = manifestDoc.querySelectorAll('organizations organization item');
    
    moduleElements.forEach((moduleEl) => {
      const moduleTitle = moduleEl.querySelector(':scope > title')?.textContent || 'Untitled Module';
      const items: IMSCCItem[] = [];

      const itemElements = moduleEl.querySelectorAll(':scope > item');
      itemElements.forEach((itemEl) => {
        const itemTitle = itemEl.querySelector('title')?.textContent || 'Untitled Item';
        const identifierref = itemEl.getAttribute('identifierref') || undefined;
        items.push({
          title: itemTitle,
          type: itemEl.getAttribute('type') || 'unknown',
          identifierref,
        });
      });

      modules.push({ title: moduleTitle, items });
    });

    // Parse resources
    const resources: IMSCCResource[] = [];
    const resourceElements = manifestDoc.querySelectorAll('resources resource');
    
    resourceElements.forEach((resourceEl) => {
      const identifier = resourceEl.getAttribute('identifier') || '';
      const type = resourceEl.getAttribute('type') || 'unknown';
      const href = resourceEl.getAttribute('href') || undefined;
      const files: string[] = [];

      const fileElements = resourceEl.querySelectorAll('file');
      fileElements.forEach((fileEl) => {
        const filePath = fileEl.getAttribute('href');
        if (filePath) files.push(filePath);
      });

      resources.push({ identifier, type, href, files });
    });

    // Scan HTML content files
    for (const resource of resources) {
      if (resource.href && resource.href.endsWith('.html')) {
        const htmlFile = zip.file(resource.href);
        if (htmlFile) {
          const content = await htmlFile.async('text');
          await scanHTMLContent(content, resource.href, courseTitle, issues);
        }
      }
    }
    
    // Extract pages and assignments with content
    const pages: IMSCCPage[] = [];
    const assignments: IMSCCAssignment[] = [];
    const fileMap: { [key: string]: string } = {};
    
    // Map resources to their content
    for (const resource of resources) {
      if (resource.href && resource.href.endsWith('.html')) {
        const htmlFile = zip.file(resource.href);
        if (htmlFile) {
          const htmlContent = await htmlFile.async('text');
          
          // Extract title from HTML
          let pageTitle = resource.identifier.replace(/_/g, ' ').replace(/\.html$/, '');
          const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            pageTitle = titleMatch[1].trim();
          } else {
            // Try to get from meta title
            const metaTitleMatch = htmlContent.match(/<meta[^>]+title="([^"]+)"/i);
            if (metaTitleMatch && metaTitleMatch[1]) {
              pageTitle = metaTitleMatch[1].trim();
            }
          }
          
          // Convert relative image paths to data URLs for proper display
          const processedContent = await processHTMLImages(htmlContent, resource.href, zip);
          
          // Determine if it's a page or assignment based on type or path
          if (resource.type?.includes('webcontent') || resource.href.includes('wiki_content')) {
            pages.push({
              identifier: resource.identifier,
              title: pageTitle,
              url: resource.identifier,
              body: processedContent
            });
          }
        }
      }
    }
    
    // Also link module items to their content
    modules.forEach(module => {
      module.items.forEach(item => {
        if (item.identifierref) {
          // Find the resource for this item
          const resource = resources.find(r => r.identifier === item.identifierref);
          if (resource) {
            item.content_id = resource.identifier;
          }
        }
      });
    });
    
    // Extract front page / home page
    let frontPage: string | undefined;
    
    // Common front page locations in IMSCC files
    const frontPagePaths = [
      'wiki_content/front-page.html',
      'course_settings/front_page.html',
      'pages/front-page.html',
      'wiki_content/home.html',
      'index.html'
    ];
    
    for (const path of frontPagePaths) {
      const frontPageFile = zip.file(path);
      if (frontPageFile) {
        const frontPageHTML = await frontPageFile.async('text');
        frontPage = await processHTMLImages(frontPageHTML, path, zip);
        break;
      }
    }
    
    // If not found in standard paths, check resources for front page
    if (!frontPage) {
      const frontPageResource = resources.find(r => 
        r.identifier.includes('front') || 
        r.identifier.includes('home') ||
        r.href?.includes('front-page') ||
        r.href?.includes('home')
      );
      
      if (frontPageResource && frontPageResource.href) {
        const frontPageFile = zip.file(frontPageResource.href);
        if (frontPageFile) {
          const frontPageHTML = await frontPageFile.async('text');
          frontPage = await processHTMLImages(frontPageHTML, frontPageResource.href, zip);
        }
      }
    }
    
    if (frontPage) {
    } else {
    }

    // Count all files in the package
    const fileCount = Object.keys(zip.files).filter(name => !name.endsWith('/')).length;

    const course: IMSCCCourse = {
      title: courseTitle,
      identifier: organizationId,
      modules,
      resources,
      fileCount,
      pages,
      assignments,
      files: fileMap,
      frontPage
    };

    return { course, issues, zip };
  } catch (error) {
    console.error('parseIMSCCFile: Error occurred:', error);
    throw error;
  }
}

async function scanHTMLContent(
  content: string,
  filePath: string,
  courseName: string,
  issues: ScanIssue[]
): Promise<void> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');

  // Format location from file path
  const location = filePath.split('/').slice(0, -1).join('/') || 'Course Content';

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
        location,
        autoFixAvailable: false,
        courseName,
        courseId: 'uploaded',
        status: 'pending',
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
        location,
        autoFixAvailable: false,
        courseName,
        courseId: 'uploaded',
        status: 'pending',
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
        location,
        autoFixAvailable: false,
        courseName,
        courseId: 'uploaded',
        status: 'pending',
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
        location,
        autoFixAvailable: true,
        courseName,
        courseId: 'uploaded',
        status: 'pending',
      });
    }
    lastLevel = level;
  });

  // Check for low contrast text
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
        location,
        autoFixAvailable: true,
        courseName,
        courseId: 'uploaded',
        status: 'pending',
      });
    }
  });

  // Check for missing viewport meta tag
  const viewport = doc.querySelector('meta[name="viewport"]');
  if (!viewport) {
    issues.push({
      id: `no-viewport-${filePath}`,
      type: 'usability',
      category: 'mobile-friendly',
      severity: 'high',
      title: 'Missing Mobile Viewport',
      description: 'Page lacks viewport meta tag, causing mobile display issues',
      location,
      autoFixAvailable: true,
      courseName,
      courseId: 'uploaded',
      status: 'pending',
    });
  }

  // Check for iframes without title
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
        location,
        autoFixAvailable: true,
        courseName,
        courseId: 'uploaded',
        status: 'pending',
      });
    }
  });

  // USABILITY: Check for long text blocks
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
        description: `Paragraph contains ${wordCount} words. Consider breaking into smaller chunks`,
        location,
        autoFixAvailable: false,
        courseName,
        courseId: 'uploaded',
        status: 'pending',
      });
    }
  });

  // USABILITY: Check for links opening in new tab without warning
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
        description: `Link "${text}" opens in new tab without warning`,
        location,
        autoFixAvailable: true,
        courseName,
        courseId: 'uploaded',
        status: 'pending',
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
      location,
      autoFixAvailable: true,
      courseName,
      courseId: 'uploaded',
      status: 'pending',
    });
  }

  // USABILITY: Check for tables without headers (confusing data)
  const tables = doc.querySelectorAll('table');
  tables.forEach((table, index) => {
    const headers = table.querySelectorAll('th');
    if (headers.length === 0) {
      issues.push({
        id: `table-${filePath}-${index}`,
        type: 'usability',
        category: 'confusing-data',
        severity: 'medium',
        title: 'Table Without Headers',
        description: 'Table lacks headers, making data confusing',
        location,
        autoFixAvailable: true,
        courseName,
        courseId: 'uploaded',
        status: 'pending',
      });
    }
  });
}

async function processHTMLImages(htmlContent: string, filePath: string, zip: JSZip): Promise<string> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const images = doc.querySelectorAll('img');
  for (const img of images) {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
      // Resolve relative path from the HTML file's location
      const htmlDir = filePath.substring(0, filePath.lastIndexOf('/') + 1);
      let imagePath = src;
      
      // Handle relative paths
      if (src.startsWith('../')) {
        // Go up directory levels
        const upLevels = src.match(/\.\.\//g)?.length || 0;
        const pathParts = htmlDir.split('/').filter(p => p);
        const resolvedDir = pathParts.slice(0, pathParts.length - upLevels).join('/') + '/';
        imagePath = resolvedDir + src.replace(/\.\.\//g, '');
      } else if (src.startsWith('./')) {
        // Current directory
        imagePath = htmlDir + src.substring(2);
      } else if (!src.startsWith('/')) {
        // Relative to current directory
        imagePath = htmlDir + src;
      } else {
        // Absolute path from root
        imagePath = src.substring(1);
      }
      
      const imageFile = zip.file(imagePath);
      if (imageFile) {
        try {
          const imageData = await imageFile.async('base64');
          // Detect image type from extension
          let mimeType = 'image/png';
          const ext = imagePath.split('.').pop()?.toLowerCase();
          if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
          else if (ext === 'gif') mimeType = 'image/gif';
          else if (ext === 'svg') mimeType = 'image/svg+xml';
          else if (ext === 'webp') mimeType = 'image/webp';
          
          const dataUrl = `data:${mimeType};base64,${imageData}`;
          img.setAttribute('src', dataUrl);
        } catch (error) {
          console.error('❌ Error converting image:', imagePath, error);
        }
      } else {
        console.warn('⚠️ Image file not found in IMSCC:', imagePath);
      }
    }
  }

  return doc.body.innerHTML;
}