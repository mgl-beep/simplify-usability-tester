/**
 * Link detector — detects URL-like link text and broken link patterns
 */

export interface URLLikeLink {
  html: string;
  text: string;
  href: string;
}

export interface BrokenLink {
  html: string;
  text: string;
  href: string;
  reason: string;
}

/**
 * Detect links with obviously broken or placeholder hrefs
 */
export function detectBrokenLinks(htmlContent: string): BrokenLink[] {
  if (!htmlContent) return [];

  const linkRegex = /<a[^>]*href=["']([^"']*?)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  const brokenLinks: BrokenLink[] = [];
  const seen = new Set<string>();

  while ((match = linkRegex.exec(htmlContent)) !== null) {
    const href = (match[1] || '').trim();
    const fullHtml = match[0];
    const text = (match[2] || '').replace(/<[^>]*>/g, '').trim();

    // Skip anchors, mailto, tel, and Canvas internal fragments
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;

    let reason = '';

    if (!href || href === '#') {
      reason = 'Link has no destination URL';
    } else if (/^javascript:/i.test(href)) {
      reason = 'Link uses javascript: instead of a real URL';
    } else if (href === 'about:blank') {
      reason = 'Link points to a blank page';
    } else if (/^https?:\/\/(www\.)?example\.(com|org|net)/i.test(href)) {
      reason = 'Link points to a placeholder example URL';
    } else if (/^https?:\/\/[^\/]+\/?$/.test(href) && /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(href)) {
      reason = 'Link points to localhost';
    } else if (href === 'http://' || href === 'https://') {
      reason = 'Link has an empty URL (just the protocol)';
    }

    if (reason && !seen.has(href + text)) {
      seen.add(href + text);
      brokenLinks.push({ html: fullHtml, text, href, reason });
    }
  }

  return brokenLinks;
}

export function detectURLLikeLinks(htmlContent: string): URLLikeLink[] {
  if (!htmlContent) {
    return [];
  }

  // Updated regex that captures ALL content between <a> tags, including nested HTML
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
  let match;
  const urlLikeLinks: URLLikeLink[] = [];
  
  let linkCount = 0;
  
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    linkCount++;
    const href = match[1];
    const fullLinkHtml = match[2] || '';
    
    // Strip all HTML tags to get plain text
    const linkText = fullLinkHtml.replace(/<[^>]*>/g, '').trim();
    
    // Detect URL-like patterns:
    // 1. Link text IS the full URL (exact match)
    // 2. Starts with http:// or https://
    // 3. Starts with www.
    // 4. Contains domain patterns (word.word/path or word.word.word)
    // 5. Is suspiciously long (>40 chars) and contains slashes or dots
    // 6. Contains query parameters (? or &) with URL patterns
    // Skip link text that's a filename (e.g., "Syllabus.pdf", "Chapter 1.docx")
    const isFilename = /\.(pdf|docx?|xlsx?|pptx?|csv|txt|rtf|zip|png|jpe?g|gif)$/i.test(linkText);

    const checks = {
      exactMatch: linkText === href,
      startsHttp: linkText.startsWith('http://') || linkText.startsWith('https://'),
      startsWww: linkText.startsWith('www.'),
      domainSubdomain: /^[a-z0-9-]+\.[a-z0-9-]+\.[a-z]{2,}/i.test(linkText),
      domainPath: /^[a-z0-9-]+\.[a-z]{2,}\//i.test(linkText),
      longWithSlashes: linkText.length > 40 && /[\/.].*[\/.]/.test(linkText) && /^https?:\/\/|^www\./i.test(linkText),
      queryParams: linkText.includes('?') && linkText.includes('=') && linkText.includes('.')
    };

    const isUrlLike = !isFilename && Object.values(checks).some(v => v);
    
    if (isUrlLike) {
      urlLikeLinks.push({ html: match[0], text: linkText, href });
    } else {
    }
  }
  
  return urlLikeLinks;
}