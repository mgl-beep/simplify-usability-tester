/**
 * AI Content Rewriter - Rewrites educational content using GPT-4o
 * Supports plain-language, instructions, readability, and assessment-guidance rewrites
 */

type RewriteCategory = 'plain-language' | 'instructions' | 'readability' | 'assessment-guidance';

function buildPrompt(category: RewriteCategory, content: string, context?: { pageTitle?: string; courseSubject?: string; contentType?: string }): string {
  const assignmentTitle = context?.pageTitle || 'this assignment';
  const courseSubject = context?.courseSubject || 'the course';

  const baseGuidelines = `
FORMATTING RULES:
- Return valid HTML only (no markdown, no backticks, no code blocks)
- Use <p>, <ul>, <li>, <ol>, <strong>, <h3> tags as appropriate
- Do NOT include <html>, <head>, <body>, or <style> tags
- Keep all original factual content — only restructure and clarify
`;

  switch (category) {
    case 'plain-language':
      return `You are an instructional designer helping college instructors make assignment instructions more accessible.

Rewrite the following assignment description for "${assignmentTitle}" in plain language:
- Use short sentences (under 20 words each)
- Use active voice ("You will..." not "Students are required to...")
- Replace jargon with everyday terms; define any unavoidable technical terms
- Use bullet points for lists of items or steps
- Keep all original requirements, due dates, and submission details
- Aim for 8th grade reading level
${baseGuidelines}

ORIGINAL CONTENT:
${content}

Return the rewritten HTML content only.`;

    case 'instructions':
      return `You are an instructional designer. The following assignment description for "${assignmentTitle}" in "${courseSubject}" is missing key information students need.

Rewrite and expand the instructions to include ALL of these sections:
1. **Overview** – What is this assignment and why does it matter?
2. **What To Do** – Clear numbered steps for completing the work
3. **Submission Requirements** – How, where, and in what format to submit
4. **Success Criteria** – What does a strong submission look like?

If the original content is very brief, use the assignment title and course subject to infer appropriate content and fill in the missing sections thoughtfully.

${baseGuidelines}

ORIGINAL CONTENT:
${content}

Return the complete rewritten HTML content only.`;

    case 'readability':
      return `You are an instructional designer helping a college instructor organize long text in their course.

The following paragraph is too long (over 150 words). Your job is to RESTRUCTURE it — NOT rewrite it.

Rules:
- Keep the author's original words, sentence structures, and voice as much as possible
- Break the content into shorter paragraphs (under 150 words each), where each covers one main idea
- Add a short <h3> subheading before each new section only where it genuinely helps organize the content — do not force headings where they are not needed
- If there are naturally list-like items embedded in the text (e.g., "A, B, and C"), convert them to a <ul> — but only where it flows naturally, not everywhere
- Do NOT paraphrase, simplify, or change the meaning of any sentence
- Do NOT add new information or remove any existing information
- The instructor should recognize their own writing — just chunked and structured for easier reading

${baseGuidelines}

ORIGINAL PARAGRAPH:
${content}

Return the restructured HTML only.`;

    case 'assessment-guidance':
      return `You are an instructional designer. The following assignment description for "${assignmentTitle}" needs clearer guidance for students.

Rewrite and expand to include:
1. **Task Description** – What students need to do (clear and specific)
2. **Step-by-Step Process** – Numbered steps to complete the work
3. **Grading Criteria** – What earns full credit vs. partial credit (e.g., "Full credit: includes 3 cited sources, clear argument, and proper formatting")
4. **Submission Details** – Format, location, and any special requirements

If grading criteria cannot be inferred from the original, write generic but plausible criteria appropriate for the assignment type and course subject ("${courseSubject}").

${baseGuidelines}

ORIGINAL CONTENT:
${content}

Return the complete rewritten HTML content only.`;

    default:
      return `Rewrite the following educational content to be clearer, more accessible, and better structured:\n\n${content}\n\nReturn HTML only.`;
  }
}

/**
 * Rewrite educational content using OpenAI GPT-4o
 */
export async function rewriteContent(
  content: string,
  category: RewriteCategory,
  context?: { pageTitle?: string; courseSubject?: string; contentType?: string }
): Promise<{ rewritten: string }> {

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = buildPrompt(category, content, context);

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
          content: 'You are an expert instructional designer specializing in accessible, plain-language educational content. Return only valid HTML output with no markdown formatting or code blocks.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1200,
      temperature: 0.4
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
  let rewritten = data.choices[0]?.message?.content?.trim() || '';

  // Strip markdown code blocks if model wraps in them
  if (rewritten.startsWith('```')) {
    rewritten = rewritten.replace(/^```(?:html)?\n?/, '').replace(/\n?```$/, '').trim();
  }

  if (!rewritten) {
    throw new Error('No rewritten content returned from AI');
  }

  return { rewritten };
}
