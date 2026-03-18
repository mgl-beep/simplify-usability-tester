/**
 * Generate alt text suggestions using OpenAI GPT-4 Vision
 */
export async function generateAltTextSuggestions(
  imageUrl: string,
  context?: {
    pageTitle?: string;
    courseSubject?: string;
    contentType?: string;
  }
): Promise<{
  suggestions: { level: 'brief' | 'moderate' | 'detailed'; text: string }[];
  is_complex: boolean;
  caption: string | null;
}> {
  
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
            content: `You are an accessibility expert helping create alt text for educational content.

Your tasks:
1. Generate 3 versions of alt text at different detail levels: brief (1-3 words), moderate (5-10 words), and detailed (10-20 words).
2. Determine if the image is "complex" — meaning it is a diagram, flowchart, chart, graph, infographic, map, organizational chart, process diagram, data visualization, or any image where spatial relationships, labels, or data points convey meaning that cannot be captured in alt text alone.
3. If the image IS complex, generate a text description (caption) of 2-5 sentences that fully conveys all labels, relationships, data points, and meaning so a reader who cannot see the image can understand it completely. The caption should be written for a college-level audience and should NEVER use phrases like "the image shows", "the diagram above", "as shown", or "this figure depicts".

Return ONLY valid JSON with no markdown formatting, exactly in this format:
{
  "suggestions": [
    {"level": "brief", "text": "..."},
    {"level": "moderate", "text": "..."},
    {"level": "detailed", "text": "..."}
  ],
  "is_complex": true,
  "caption": "Full text description here..."
}

If the image is NOT complex, set is_complex to false and caption to null.

Alt text guidelines:
- Describe what the image SHOWS, not what it IS
- Include any visible text in the image
- Be concise but descriptive
- Don't start with "Image of" or "Picture of"
- Focus on educational relevance
${contextStr ? `- Context: ${contextStr}` : ''}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image. Provide 3 alt text suggestions (brief, moderate, detailed), determine if it is a complex image, and if so generate a full text description caption. Return as JSON.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 800,
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
    
    const parsed = JSON.parse(cleanedContent);

    // Handle both old array format and new object format for backwards compatibility
    if (Array.isArray(parsed)) {
      // Old format: just an array of suggestions
      return { suggestions: parsed, is_complex: false, caption: null };
    }

    // New format: object with suggestions, is_complex, caption
    if (!parsed.suggestions || !Array.isArray(parsed.suggestions) || parsed.suggestions.length !== 3) {
      console.error('❌ Invalid suggestions format:', parsed);
      throw new Error('Invalid response format from AI');
    }

    return {
      suggestions: parsed.suggestions,
      is_complex: !!parsed.is_complex,
      caption: parsed.caption || null
    };
    
  } catch (error) {
    console.error('❌ Error in generateAltTextSuggestions:', error);
    
    // Re-throw quota errors so they can be handled specially
    if (error.message === 'AI_QUOTA_EXCEEDED') {
      throw error;
    }
    
    throw new Error(`Failed to generate AI suggestions: ${error.message}`);
  }
}