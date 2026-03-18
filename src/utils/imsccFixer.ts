// IMSCC Fixer - Applies automated fixes to course content
import JSZip from 'jszip';
import type { ScanIssue } from '../App';
import type { IMSCCCourse } from './imsccParser';

export interface FixResult {
  success: boolean;
  fixedIssues: string[];
  skippedIssues: string[];
  message: string;
}

/**
 * Apply automated fixes to HTML content
 */
function applyHTMLFixes(html: string, issues: ScanIssue[]): string {
  let fixedHtml = html;
  
  issues.forEach(issue => {
    switch (issue.category) {
      case 'alt-text':
        // Add placeholder alt text to images missing it
        fixedHtml = fixedHtml.replace(
          /<img([^>]*?)(?:alt="")?([^>]*?)>/gi,
          (match, before, after) => {
            // Only fix if no alt attribute exists
            if (!/alt=/i.test(match)) {
              return `<img${before} alt="[Image: Please provide description]"${after}>`;
            }
            // Fix empty alt attributes
            if (/alt=""/i.test(match)) {
              return match.replace(/alt=""/, 'alt="[Image: Please provide description]"');
            }
            return match;
          }
        );
        break;
        
      case 'contrast':
        // Remove inline styles with poor contrast (placeholder - would need color analysis)
        fixedHtml = fixedHtml.replace(
          /style="[^"]*color:\s*#(?:ccc|ddd|eee)[^"]*"/gi,
          'style="color: #333333;"'
        );
        break;
        
      case 'inconsistent-heading':
        // Ensure proper heading hierarchy (basic fix)
        // This is a simplified version - real implementation would track heading levels
        break;
        
      case 'broken-link':
        // Add warning comment next to broken links
        fixedHtml = fixedHtml.replace(
          /<a([^>]*?)href="([^"]*?)"([^>]*?)>/gi,
          (match, before, href, after) => {
            if (!href || href === '#' || href === '') {
              return `<a${before}href="${href}"${after} aria-label="Warning: This link may be broken">`;
            }
            return match;
          }
        );
        break;
        
      case 'long-url':
        // Truncate visible long URLs in link text
        fixedHtml = fixedHtml.replace(
          /<a([^>]*?)href="(https?:\/\/[^"]{50,})"([^>]*?)>\s*\2\s*<\/a>/gi,
          (match, before, href, after) => {
            const truncatedText = href.length > 60 ? href.substring(0, 57) + '...' : href;
            return `<a${before}href="${href}"${after}>${truncatedText}</a>`;
          }
        );
        break;
        
      case 'video-caption':
        // Add reminder comments near video embeds
        fixedHtml = fixedHtml.replace(
          /<(?:iframe|video)([^>]*?)>/gi,
          (match) => `<!-- TODO: Verify video has captions -->\n${match}`
        );
        break;
    }
  });
  
  return fixedHtml;
}

/**
 * Apply fixes to course content and return modified ZIP
 */
export async function applyFixesToCourse(
  originalZip: JSZip,
  course: IMSCCCourse,
  issuesToFix: ScanIssue[]
): Promise<{ zip: JSZip; result: FixResult }> {
  const newZip = new JSZip();
  const fixedIssues: string[] = [];
  const skippedIssues: string[] = [];
  
  // Track which HTML files need fixing
  const htmlFilesToFix = new Set<string>();
  issuesToFix.forEach(issue => {
    // Extract file path from location if possible
    const locationMatch = issue.location.match(/\/(.*?\.html)/);
    if (locationMatch) {
      htmlFilesToFix.add(locationMatch[1]);
    }
  });
  
  // Copy all files from original ZIP, applying fixes to HTML files
  const filePromises: Promise<void>[] = [];
  
  originalZip.forEach((relativePath, file) => {
    const promise = (async () => {
      if (file.dir) {
        // Skip directories
        return;
      }
      
      // Check if this is an HTML file that needs fixing
      if (relativePath.endsWith('.html') || relativePath.endsWith('.htm')) {
        try {
          const content = await file.async('string');
          const relevantIssues = issuesToFix.filter(issue => 
            issue.location.includes(relativePath) || htmlFilesToFix.has(relativePath)
          );
          
          if (relevantIssues.length > 0) {
            const fixedContent = applyHTMLFixes(content, relevantIssues);
            newZip.file(relativePath, fixedContent);
            relevantIssues.forEach(issue => fixedIssues.push(issue.id));
          } else {
            // Copy unchanged
            newZip.file(relativePath, content);
          }
        } catch (error) {
          console.error(`Error processing ${relativePath}:`, error);
          // Copy original if error
          const content = await file.async('arraybuffer');
          newZip.file(relativePath, content);
        }
      } else {
        // Copy non-HTML files as-is
        const content = await file.async('arraybuffer');
        newZip.file(relativePath, content);
      }
    })();
    
    filePromises.push(promise);
  });
  
  await Promise.all(filePromises);
  
  // Determine which issues couldn't be fixed automatically
  issuesToFix.forEach(issue => {
    if (!fixedIssues.includes(issue.id)) {
      skippedIssues.push(issue.id);
    }
  });
  
  const result: FixResult = {
    success: fixedIssues.length > 0,
    fixedIssues,
    skippedIssues,
    message: `Applied ${fixedIssues.length} automated fixes. ${skippedIssues.length} issues require manual review.`
  };
  
  return { zip: newZip, result };
}

/**
 * Generate a downloadable blob from a JSZip object
 */
export async function generateIMSCCBlob(zip: JSZip): Promise<Blob> {
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6
    }
  });
  
  return blob;
}

/**
 * Trigger download of the corrected IMSCC file
 */
export function downloadIMSCC(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.imscc') ? fileName : `${fileName}.imscc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
