/**
 * Generate table caption suggestions using OpenAI GPT-4
 * Based on rubric standards: CVC-OEI, Peralta, and Quality Matters
 */
export async function generateTableCaptionSuggestions(
  tableHtml: string,
  context?: {
    pageTitle?: string;
    courseSubject?: string;
    contentType?: string;
    location?: string;
  }
): Promise<{ level: 'brief' | 'moderate' | 'detailed'; text: string }[]> {
  
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    throw new Error('OpenAI API key not configured');
  }

  try {
    
    // Build context string for the prompt
    let contextStr = '';
    if (context?.pageTitle) {
      contextStr += `Page: ${context.pageTitle}. `;
    }
    if (context?.courseSubject) {
      contextStr += `Course: ${context.courseSubject}. `;
    }
    if (context?.location) {
      contextStr += `Location: ${context.location}. `;
    }
    
    // Truncate table HTML to avoid token limits
    const truncatedTable = tableHtml.substring(0, 2000);
    
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
            content: `You are an accessibility expert helping create table captions for educational content, following CVC-OEI, Peralta, and Quality Matters rubric standards.

RUBRIC REQUIREMENTS:
- CVC-OEI Design Standard D3: "All data tables include clearly marked row and/or column headers and include a caption"
- Peralta Online Equity Rubric: Tables must be accessible and their purpose clearly communicated
- Quality Matters Standard 8.3: "The course provides accessible text and images in files, documents, LMS pages, and web pages"

Generate 3 versions of table captions at different detail levels: brief (3-8 words), moderate (8-15 words), and detailed (15-25 words).

Return ONLY valid JSON with no markdown formatting, exactly in this format:
[
  {"level": "brief", "text": "..."},
  {"level": "moderate", "text": "..."},
  {"level": "detailed", "text": "..."}
]

Guidelines:
- Describe the PURPOSE and CONTENT of the table clearly
- Identify what data is being compared or presented
- Include the scope (what rows/columns represent)
- Be clear and concise
- Use plain language appropriate for screen reader users
- Focus on educational context
${contextStr ? `- Context: ${contextStr}` : ''}`
          },
          {
            role: 'user',
            content: `Analyze this HTML table and provide 3 caption suggestions (brief, moderate, detailed) as JSON. The caption should help users understand the table's purpose and structure:\n\n${truncatedTable}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ OpenAI API error:', errorData);
      
      // Check for quota/rate limit errors
      if (response.status === 429 || errorData.error?.code === 'insufficient_quota') {
        throw new Error('AI_QUOTA_EXCEEDED');
      }
      
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    const messageContent = data.choices[0]?.message?.content;
    
    if (!messageContent) {
      console.error('❌ No content in OpenAI response');
      throw new Error('No suggestions generated');
    }

    // Parse the JSON response (remove markdown code blocks if present)
    let cleanedContent = messageContent.trim();
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const suggestions = JSON.parse(cleanedContent);
    
    // Validate the response format
    if (!Array.isArray(suggestions) || suggestions.length !== 3) {
      console.error('❌ Invalid suggestions format:', suggestions);
      throw new Error('Invalid response format from AI');
    }
    
    return suggestions;
    
  } catch (error) {
    console.error('❌ Error in generateTableCaptionSuggestions:', error);
    
    // Re-throw quota errors so they can be handled specially
    if (error.message === 'AI_QUOTA_EXCEEDED') {
      throw error;
    }
    
    throw new Error(`Failed to generate AI suggestions: ${error.message}`);
  }
}
