/**
 * AI Content Template Generator - Creates new educational content from scratch
 * Supports instructor-contact (welcome announcement), student-interaction (discussion prompt),
 * assessment-criteria (rubric/grading criteria), and policies (missing policy sections).
 */

type TemplateCategory =
  | 'instructor-contact'
  | 'student-interaction'
  | 'assessment-criteria'
  | 'policies'
  | 'module-discussion';

interface TemplateContext {
  courseName?: string;
  assignmentTitle?: string;
  assignmentPoints?: string;
  missingPolicies?: string[];
  existingContent?: string;
  moduleContent?: string;
  moduleName?: string;
}

const BASE_GUIDELINES = `
FORMATTING RULES:
- Return valid HTML only (no markdown, no backticks, no code blocks)
- Use <p>, <ul>, <li>, <ol>, <strong>, <em>, <h3>, <h4> tags as appropriate
- Do NOT include <html>, <head>, <body>, or <style> tags
- Be warm, professional, and student-focused`;

function buildTemplatePrompt(category: TemplateCategory, context: TemplateContext): string {
  const courseName = context.courseName || 'this course';

  switch (category) {
    case 'instructor-contact':
      return `Generate a warm, professional welcome announcement body for a Canvas online course called "${courseName}".

The announcement should include all of the following sections:
1. **Warm welcome** — A personal greeting expressing genuine excitement about the course
2. **About me** — Brief instructor introduction (use [Instructor Name] and [brief background] as placeholders)
3. **Getting started** — 2–3 clear steps for what students should do in Week 1 (e.g., read the syllabus, post an introduction)
4. **How to reach me** — Contact method placeholders: [email address], [office hours time/location], [expected response time within X hours/days]
5. **Encouragement** — A warm, motivating closing line

Keep it under 300 words. Students should feel welcomed and know exactly what to do first.
${BASE_GUIDELINES}

Return only the announcement body HTML (not the subject/title line).`;

    case 'student-interaction':
      return `Generate a meaningful peer discussion prompt for an online course called "${courseName}".

The discussion should include:
1. **Opening question** — A thought-provoking question that connects to course themes (use [topic] and [concept] as placeholders for subject-specific content the instructor will customize)
2. **Initial post instructions** — Clear guidance on length (2–3 paragraphs), tone, and what to include
3. **Peer response requirement** — Instructions to respond substantively to 2 classmates (what makes a quality response)
4. **Connection to learning** — A brief note on how this discussion connects to course objectives

Keep the instructions clear and under 200 words. Use a friendly but academic tone.
${BASE_GUIDELINES}

Return only the discussion prompt HTML.`;

    case 'assessment-criteria': {
      const pts = context.assignmentPoints || '100';
      const title = context.assignmentTitle || 'this assignment';
      const ptNum = parseInt(pts) || 100;

      return `Generate clear grading criteria for an assignment called "${title}" worth ${pts} points in the course "${courseName}".

Include exactly 3–5 grading criteria with these specifications:
- Criteria names should reflect common academic skills (e.g., Argument Quality, Evidence & Sources, Organization, Writing Clarity, Requirements Met)
- Point values for all criteria must sum to exactly ${ptNum} pts
- For each criterion, include three performance levels: Full Credit, Partial Credit, No/Minimal Credit — each described in one clear sentence
- Format as an HTML definition list or table that is easy to read

Example criterion format:
<p><strong>Argument Quality (30 pts)</strong></p>
<ul>
  <li><strong>Full credit (30 pts):</strong> Clear, specific thesis with 3+ well-developed supporting points.</li>
  <li><strong>Partial credit (15–29 pts):</strong> Thesis present but not fully developed; some supporting points lack depth.</li>
  <li><strong>No/minimal credit (0–14 pts):</strong> No clear thesis or argument is absent.</li>
</ul>
${BASE_GUIDELINES}

Return only the rubric/criteria HTML to be appended to the assignment description.`;
    }

    case 'policies': {
      const missing = context.missingPolicies?.length
        ? context.missingPolicies
        : ['grading', 'late work', 'communication', 'accommodations', 'academic integrity'];

      return `Generate policy section(s) for a course called "${courseName}". Write ONLY the following missing policies: ${missing.join(', ')}.

For each policy:
- Use an <h3> heading (e.g., <h3>Late Work Policy</h3>)
- Write 2–3 sentences that are clear, fair, and student-friendly
- Use placeholders like [instructor name], [X days], [X%], [course management system] where specific values are unknown
- Each policy should stand alone and be easy to find

Write ONLY the policies listed: ${missing.join(', ')}. Do not include policies that are not in that list.
${BASE_GUIDELINES}

Return the policy section HTML only (ready to be appended to the existing syllabus content).`;
    }

    case 'module-discussion': {
      const modName = context.moduleName || 'this module';
      const modContent = context.moduleContent || '';
      return `Generate a meaningful peer discussion prompt for the module "${modName}" in a course called "${courseName}".

${modContent ? `The module contains the following content and topics:\n${modContent}\n\n` : ''}The discussion MUST directly relate to the module's topics and content. Include:
1. **Opening question** — A thought-provoking question that connects to specific topics covered in this module. Require critical thinking, not just factual recall.
2. **Initial post instructions** — Clear guidance: 2–3 paragraphs, must reference module readings/content, and include a real-world example or application.
3. **Peer response requirement** — Respond substantively to at least 2 classmates. Responses should build on ideas, ask follow-up questions, or offer alternative perspectives (not just "I agree").
4. **Connection to learning** — Briefly explain how this discussion supports the module's learning objectives.

Keep instructions clear and under 250 words. Use a friendly but academic tone.
${BASE_GUIDELINES}

Return only the discussion prompt HTML.`;
    }

    default:
      return `Generate professional educational content for "${courseName}". Return HTML only.`;
  }
}

/**
 * Generate a new content template using OpenAI GPT-4o
 */
export async function generateContentTemplate(
  category: TemplateCategory,
  context: TemplateContext
): Promise<{ template: string }> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = buildTemplatePrompt(category, context);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert instructional designer specializing in accessible, student-centered educational content for Canvas LMS. Return only valid HTML output with no markdown formatting or code blocks.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1400,
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 429 || errorData.error?.code === 'insufficient_quota') {
      throw new Error('AI_QUOTA_EXCEEDED');
    }
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  let template = data.choices[0]?.message?.content?.trim() || '';

  // Strip markdown code blocks if model wraps in them
  if (template.startsWith('```')) {
    template = template.replace(/^```(?:html)?\n?/, '').replace(/\n?```$/, '').trim();
  }

  if (!template) {
    throw new Error('No template content returned from AI');
  }

  return { template };
}
