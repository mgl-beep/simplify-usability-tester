/**
 * HTML Sanitizer Utility
 * 
 * Prevents data overflow errors by sanitizing HTML before storing in issue objects.
 * Keeps HTML readable for debugging while removing massive base64 data.
 */

const MAX_HTML_LENGTH = 5000; // Reasonable limit to prevent data overflow
const MAX_ATTRIBUTE_LENGTH = 200; // Max length for any single attribute

/**
 * Strip base64 images from HTML to reduce size
 */
function stripBase64Images(html: string): string {
  // Replace base64 image data with placeholder
  return html.replace(
    /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g,
    'data:image/...;base64,[BASE64_DATA_REMOVED]'
  );
}

/**
 * Truncate long attribute values
 */
function truncateLongAttributes(html: string): string {
  // Truncate extremely long attribute values (but keep hrefs and srcs readable)
  return html.replace(
    /(\w+)=["']([^"']{200,})["']/g,
    (match, attrName, attrValue) => {
      // For URLs, keep beginning and end
      if (attrName === 'href' || attrName === 'src') {
        if (attrValue.length > MAX_ATTRIBUTE_LENGTH) {
          const start = attrValue.substring(0, 100);
          const end = attrValue.substring(attrValue.length - 50);
          return `${attrName}="${start}...${end}"`;
        }
      }
      // For other attributes, just truncate
      return `${attrName}="${attrValue.substring(0, MAX_ATTRIBUTE_LENGTH)}..."`;
    }
  );
}

/**
 * Sanitize HTML for storage in issue objects
 * 
 * This prevents DataCloneError and other data overflow issues
 * while keeping HTML readable for debugging.
 * 
 * @param html The HTML string to sanitize
 * @param maxLength Maximum length (default 5000 chars)
 * @returns Sanitized HTML
 */
export function sanitizeHtmlForStorage(html: string | undefined, maxLength: number = MAX_HTML_LENGTH): string {
  if (!html) return '';
  
  // Step 1: Strip base64 images (can be HUGE)
  let sanitized = stripBase64Images(html);
  
  // Step 2: Truncate long attributes
  sanitized = truncateLongAttributes(sanitized);
  
  // Step 3: Final truncation if still too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...[truncated]';
  }
  
  return sanitized;
}

/**
 * Sanitize full HTML content (like page body) for logging/storage
 * Uses a larger limit since this is the full page content
 */
export function sanitizeFullContent(html: string | undefined): string {
  return sanitizeHtmlForStorage(html, 10000);
}

/**
 * Extract just the element tag and attributes without content
 * Useful for showing element identity without all the nested content
 */
export function extractElementSignature(html: string): string {
  const match = html.match(/^<[^>]+>/);
  return match ? match[0] : html.substring(0, 200);
}
