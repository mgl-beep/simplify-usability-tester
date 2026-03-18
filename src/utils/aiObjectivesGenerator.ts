/**
 * AI Learning Objectives Utilities
 * Helper functions for objectives insertion and formatting.
 * AI generation is handled server-side via the Supabase proxy endpoint
 * (/ai/generate-objectives) — no client-side API keys needed.
 */

/**
 * Insert learning objectives into module content HTML
 * Finds the best location and formats them properly
 */
export function insertObjectivesIntoHtml(
  originalHtml: string,
  objectives: string[]
): string {
  
  // Create the objectives HTML section
  const objectivesHtml = `
<div class="learning-objectives" style="background-color: #f0f7ff; border-left: 4px solid #0066cc; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <h3 style="margin-top: 0; color: #0066cc;">Learning Objectives</h3>
  <p style="margin-bottom: 12px;"><strong>By the end of this module, students will be able to:</strong></p>
  <ul style="margin: 0; padding-left: 24px;">
${objectives.map(obj => `    <li style="margin-bottom: 8px;">${obj}</li>`).join('\n')}
  </ul>
</div>
`;

  // Strategy 1: If there's an h1, h2, or h3 near the top, insert after it
  const headerMatch = originalHtml.match(/(<h[123][^>]*>.*?<\/h[123]>)/i);
  if (headerMatch) {
    const insertPoint = originalHtml.indexOf(headerMatch[0]) + headerMatch[0].length;
    return originalHtml.slice(0, insertPoint) + '\n' + objectivesHtml + '\n' + originalHtml.slice(insertPoint);
  }

  // Strategy 2: If there's a <p> tag near the top, insert before it
  const firstPMatch = originalHtml.match(/<p[^>]*>/i);
  if (firstPMatch) {
    const insertPoint = originalHtml.indexOf(firstPMatch[0]);
    return originalHtml.slice(0, insertPoint) + objectivesHtml + '\n' + originalHtml.slice(insertPoint);
  }

  // Strategy 3: If there's a <div>, insert at the beginning
  const divMatch = originalHtml.match(/<div[^>]*>/i);
  if (divMatch) {
    const insertPoint = originalHtml.indexOf(divMatch[0]) + divMatch[0].length;
    return originalHtml.slice(0, insertPoint) + '\n' + objectivesHtml + '\n' + originalHtml.slice(insertPoint);
  }

  // Strategy 4: Prepend to the entire content
  return objectivesHtml + '\n\n' + originalHtml;
}

/**
 * Format a single objective to remove "By the end of this module, students will be able to" prefix
 * (for display in bullet lists where the prefix is already in the heading)
 */
export function stripObjectivePrefix(objective: string): string {
  return objective
    .replace(/^By the end of this (?:module|unit|lesson|section),?\s+students will be able to\s+/i, '')
    .replace(/^Students will be able to\s+/i, '')
    .trim();
}
