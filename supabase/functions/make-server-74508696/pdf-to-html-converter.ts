/**
 * AI PDF-to-HTML Converter
 * Extracts text from PDF (with safe FlateDecode decompression), then sends to GPT-4o.
 */

/**
 * Decode PDF escape sequences in parenthesized strings
 */
function decodePdfString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}

/**
 * Extract text from a PDF content stream (BT...ET blocks with Tj/TJ operators)
 */
function extractTextFromStream(content: string): string {
  const lines: string[] = [];
  const btEtRegex = /BT\s([\s\S]*?)\sET/g;
  let btMatch;

  while ((btMatch = btEtRegex.exec(content)) !== null) {
    const block = btMatch[1];
    const parts: string[] = [];

    // Tj operator: (text) Tj
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      parts.push(decodePdfString(tjMatch[1]));
    }

    // TJ operator: [(text) num (text) ...] TJ
    const tjArrayRegex = /\[((?:[^\[\]]*(?:\([^)]*\))?)*)\]\s*TJ/g;
    let tjArrayMatch;
    while ((tjArrayMatch = tjArrayRegex.exec(block)) !== null) {
      const array = tjArrayMatch[1];
      const stringRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = stringRegex.exec(array)) !== null) {
        parts.push(decodePdfString(strMatch[1]));
      }
    }

    // ' operator: (text) '
    const quoteRegex = /\(([^)]*)\)\s*'/g;
    let quoteMatch;
    while ((quoteMatch = quoteRegex.exec(block)) !== null) {
      parts.push(decodePdfString(quoteMatch[1]));
    }

    if (parts.length > 0) {
      lines.push(parts.join(''));
    }
  }

  return lines.join('\n');
}

/**
 * Safely decompress a single FlateDecode stream with size limits
 */
async function safeDecompressFlate(data: Uint8Array): Promise<Uint8Array | null> {
  const MAX_OUTPUT = 1024 * 1024; // 1MB max decompressed output per stream

  for (const format of ['deflate', 'deflate-raw'] as const) {
    try {
      const ds = new DecompressionStream(format as string);
      const writer = ds.writable.getWriter();
      const reader = ds.readable.getReader();

      writer.write(data);
      writer.close();

      const chunks: Uint8Array[] = [];
      let totalSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalSize += value.length;
        if (totalSize > MAX_OUTPUT) {
          // Decompressed output too large — likely an image, abort
          try { reader.cancel(); } catch { /* ignore */ }
          return null;
        }
        chunks.push(value);
      }

      const result = new Uint8Array(totalSize);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      return result;
    } catch {
      continue;
    }
  }
  return null; // Decompression failed for all formats
}

/**
 * Scan raw PDF binary for uncompressed text string literals (fast fallback)
 */
function extractRawTextStrings(pdfString: string): string {
  const stringRegex = /\(([^)]{4,})\)/g;
  const found: string[] = [];
  let match;

  while ((match = stringRegex.exec(pdfString)) !== null) {
    const str = decodePdfString(match[1]);
    const printable = str.replace(/[^\x20-\x7E\n]/g, '');
    if (printable.length > 3 && /[a-zA-Z]/.test(printable)) {
      found.push(printable);
    }
    if (found.length > 2000) break;
  }

  return found.join(' ').trim();
}

/**
 * Extract all readable text from a PDF binary with safety limits
 */
async function extractTextFromPdf(pdfBytes: Uint8Array): Promise<string> {
  // Only process first 5MB of the PDF to avoid memory issues
  const limit = Math.min(pdfBytes.length, 5 * 1024 * 1024);
  const pdfString = new TextDecoder('latin1').decode(pdfBytes.subarray(0, limit));
  const allText: string[] = [];

  // Find stream boundaries using indexOf (more memory-friendly than regex on huge strings)
  let searchStart = 0;
  let streamsProcessed = 0;
  const MAX_STREAMS = 80; // Limit total streams to process

  while (streamsProcessed < MAX_STREAMS) {
    const streamStart = pdfString.indexOf('stream\n', searchStart);
    if (streamStart === -1) break;

    const contentStart = streamStart + 7; // length of 'stream\n'
    const streamEnd = pdfString.indexOf('endstream', contentStart);
    if (streamEnd === -1) break;

    searchStart = streamEnd + 9;
    const streamLength = streamEnd - contentStart;

    // SAFETY: Skip streams larger than 200KB (those are images/fonts, not text)
    if (streamLength > 200 * 1024) continue;

    // SAFETY: Skip image streams
    const dictStart = Math.max(0, streamStart - 500);
    const dict = pdfString.substring(dictStart, streamStart);
    if (dict.includes('/Subtype /Image') || dict.includes('/Subtype/Image')) continue;

    streamsProcessed++;
    const streamContent = pdfString.substring(contentStart, streamEnd);

    // Check if it's FlateDecode compressed
    const isFlate = dict.includes('/FlateDecode');

    let decodedContent: string;

    if (isFlate) {
      try {
        // Convert string back to bytes for decompression
        const streamBytes = new Uint8Array(streamContent.length);
        for (let i = 0; i < streamContent.length; i++) {
          streamBytes[i] = streamContent.charCodeAt(i);
        }
        const decompressed = await safeDecompressFlate(streamBytes);
        if (!decompressed) continue; // Decompression failed or output too large
        decodedContent = new TextDecoder('latin1').decode(decompressed);
      } catch {
        continue;
      }
    } else {
      decodedContent = streamContent;
    }

    // Extract text operators from the content stream
    try {
      const text = extractTextFromStream(decodedContent);
      if (text.trim()) {
        allText.push(text);
      }
    } catch {
      continue;
    }
  }

  let result = allText.join('\n\n').trim();

  // Fallback: if structured extraction found very little, try raw string scan
  if (result.length < 50) {
    const rawText = extractRawTextStrings(pdfString);
    if (rawText.length > result.length) {
      result = rawText;
    }
  }

  return result;
}

/**
 * Convert raw PDF bytes to accessible HTML using GPT-4o
 */
export async function convertPdfBytesToAccessibleHtml(
  pdfBytes: Uint8Array,
  pdfFilename: string,
  context?: { courseSubject?: string }
): Promise<{ html: string }> {

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  if (pdfBytes.length > 10 * 1024 * 1024) {
    throw new Error('PDF is too large for conversion (max 10MB). Try a smaller document.');
  }

  const courseSubject = context?.courseSubject || 'the course';

  // Extract text from PDF (with safe decompression)
  let extractedText = '';
  try {
    extractedText = await extractTextFromPdf(pdfBytes);
  } catch (err) {
    console.error('PDF text extraction error (non-fatal):', err);
  }

  if (!extractedText || extractedText.trim().length < 50) {
    throw new Error(
      'Could not extract enough text from this PDF. It may be a scanned/image-based document. ' +
      'Try using Adobe Acrobat to OCR it first, or manually copy the content into a Canvas page.'
    );
  }

  return sendTextToGpt(extractedText, pdfFilename, apiKey, courseSubject);
}

/**
 * Legacy entry point (base64 input)
 */
export async function convertPdfToAccessibleHtml(
  pdfBase64: string,
  pdfFilename: string,
  context?: { courseSubject?: string }
): Promise<{ html: string }> {
  const binaryString = atob(pdfBase64);
  const pdfBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    pdfBytes[i] = binaryString.charCodeAt(i);
  }
  return convertPdfBytesToAccessibleHtml(pdfBytes, pdfFilename, context);
}

/**
 * Send extracted text to GPT-4o for HTML structuring
 */
async function sendTextToGpt(
  extractedText: string,
  pdfFilename: string,
  apiKey: string,
  courseSubject: string
): Promise<{ html: string }> {
  const maxChars = 60000;
  const text = extractedText.length > maxChars
    ? extractedText.substring(0, maxChars) + '\n\n[Content truncated due to length]'
    : extractedText;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at converting raw text into accessible, well-structured HTML for educational use. Return only valid HTML content with no markdown or code blocks.'
        },
        {
          role: 'user',
          content: `Convert the following text extracted from a PDF file named "${pdfFilename}" (from a ${courseSubject} course) into well-structured, accessible HTML.

CRITICAL RULES:
- You MUST faithfully reproduce ALL the actual content from the extracted text below
- Do NOT invent, summarize, or add placeholder content — only use what is in the extracted text
- Return valid HTML only (no markdown, no backticks, no code blocks)
- Use semantic HTML: <h1>, <h2>, <h3> for headings, <p> for paragraphs, <ul>/<ol>/<li> for lists, <table> for tabular data
- Do NOT include <html>, <head>, <body>, or <style> tags — only the inner content
- Clean up obvious extraction artifacts (broken words, extra spaces) but keep original meaning

EXTRACTED PDF TEXT:
${text}

Return the structured HTML only.`
        }
      ],
      max_tokens: 16000,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 429 || errorData.error?.code === 'insufficient_quota') {
      throw new Error('AI_QUOTA_EXCEEDED');
    }
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  let html = data.choices[0]?.message?.content?.trim() || '';

  if (html.startsWith('```')) {
    html = html.replace(/^```(?:html)?\n?/, '').replace(/\n?```$/, '').trim();
  }

  if (!html) {
    throw new Error('No HTML content returned from AI');
  }

  return { html };
}
