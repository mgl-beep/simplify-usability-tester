/**
 * AI Learning Objectives Generator
 * 
 * This module generates measurable learning outcomes aligned with:
 * - CVC-OEI Standards A1, A2, A3 (Course and unit-level learning objectives)
 * - Peralta E5 (Measurable learning outcomes)
 * - Quality Matters 2.1 (Learning objectives/competencies are clearly stated)
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

// Bloom's Taxonomy action verbs by cognitive level
const BLOOMS_TAXONOMY = {
  remember: ['Define', 'List', 'Recall', 'Identify', 'Label', 'Name', 'State'],
  understand: ['Explain', 'Describe', 'Summarize', 'Interpret', 'Classify', 'Compare', 'Discuss'],
  apply: ['Apply', 'Demonstrate', 'Use', 'Implement', 'Execute', 'Solve', 'Calculate'],
  analyze: ['Analyze', 'Examine', 'Investigate', 'Differentiate', 'Distinguish', 'Compare', 'Contrast'],
  evaluate: ['Evaluate', 'Assess', 'Critique', 'Judge', 'Justify', 'Defend', 'Argue'],
  create: ['Create', 'Design', 'Develop', 'Construct', 'Formulate', 'Compose', 'Plan']
};

interface GenerateObjectivesRequest {
  moduleTitle: string;
  moduleItems: string[];
  courseName?: string;
  courseLevel?: string; // e.g., '100', '200', '800' for different cognitive complexity
  existingObjectives?: string[]; // Existing objectives to improve
}

interface GeneratedObjective {
  text: string;
  bloomsLevel: keyof typeof BLOOMS_TAXONOMY;
  actionVerb: string;
  mappedItem?: string; // Canvas item this objective maps to
}

export async function generateLearningObjectives(
  request: GenerateObjectivesRequest
): Promise<GeneratedObjective[]> {
  const { moduleTitle, moduleItems, courseName, courseLevel, existingObjectives } = request;

  // Create OpenAI API prompt
  const existingObjectivesContext = existingObjectives && existingObjectives.length > 0
    ? `\n\nEXISTING OBJECTIVES (to improve/replace):\n${existingObjectives.map((obj, i) => `  ${i + 1}. ${obj}`).join('\n')}\n\nNOTE: The existing objectives may be vague or unmeasurable. Replace them with clear, action-oriented alternatives using Bloom's Taxonomy verbs.`
    : '';

  const prompt = `You are an expert instructional designer specializing in creating measurable learning outcomes aligned with CVC-OEI, Peralta, and Quality Matters rubric standards.

TASK: Generate 3-5 clear, concise, measurable learning outcomes for the following module.

MODULE INFORMATION:
- Course: ${courseName || 'Unknown Course'}
- Course Level: ${courseLevel || 'Graduate'}
- Module Title: "${moduleTitle}"
- Module Content Items:
${moduleItems.map((item, i) => `  ${i + 1}. ${item}`).join('\n')}${existingObjectivesContext}

REQUIREMENTS:
1. Use clear, observable Bloom's Taxonomy action verbs based on the cognitive level:
   • Remember (list, define, recall, identify, label, name, state)
   • Understand (explain, describe, summarize, interpret, classify, compare, discuss)
   • Apply (apply, demonstrate, use, implement, execute, solve, calculate)
   • Analyze (analyze, examine, investigate, differentiate, distinguish, compare, contrast)
   • Evaluate (evaluate, assess, critique, judge, justify, defend, argue)
   • Create (create, design, develop, construct, formulate, compose, plan)

2. AVOID VAGUE VERBS like "understand" or "learn" - use specific, observable action verbs instead

3. Each outcome MUST be:
   - SHORT: One clear sentence only
   - SIMPLE: Focus on the core skill or outcome
   - CONCISE: No extra wording like "by completing" or "as assessed in"
   - SPECIFIC: Directly aligned with actual module content
   - MEASURABLE: Observable action with clear criteria

4. Map each outcome to a specific Canvas item from the module content list above

FORMAT: Return ONLY a JSON array of objects. Each object must have:
- "text": The learning outcome (start with Bloom's verb, one sentence)
- "mappedItem": The exact module item name this outcome aligns with (from the list above)
- "bloomsLevel": The Bloom's taxonomy level (remember/understand/apply/analyze/evaluate/create)
- "actionVerb": The Bloom's verb used

Example format:
[
  {
    "text": "Explain the concept of equity and its importance in culturally responsive teaching.",
    "mappedItem": "How do you define equity? activity",
    "bloomsLevel": "understand",
    "actionVerb": "Explain"
  },
  {
    "text": "Analyze systemic barriers to learning by comparing different UDL principles.",
    "mappedItem": "UDL Discussion assignment",
    "bloomsLevel": "analyze",
    "actionVerb": "Analyze"
  }
]

IMPORTANT: 
- Do NOT include "Students will be able to"
- Do NOT use vague verbs like "understand" or "learn" - use "Explain", "Describe", "Analyze", etc. instead
- Do NOT include phrases like "by completing", "as assessed in", "by examining"
- Start directly with the Bloom's action verb
- Keep to ONE clear sentence per outcome
- Match each outcome to a specific item from the module content list

Generate the outcomes now:`;

  try {
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert instructional designer. You create short, simple, concise learning objectives with clear Bloom\'s taxonomy verbs. Always respond with valid JSON arrays only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    // Parse the JSON response
    let objectives: { text: string, mappedItem: string, bloomsLevel: keyof typeof BLOOMS_TAXONOMY, actionVerb: string }[];
    try {
      // Try to parse as JSON directly
      objectives = JSON.parse(content);
    } catch (e) {
      // If not valid JSON, try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\[([\s\S]*?)\]/);
      if (jsonMatch) {
        objectives = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('Could not parse objectives from response');
      }
    }

    // Validate and format objectives
    if (!Array.isArray(objectives)) {
      console.error('Invalid objectives response - not an array:', objectives);
      throw new Error('Invalid objectives format: expected array, got ' + typeof objectives);
    }
    
    if (objectives.length === 0) {
      console.error('AI returned empty objectives array');
      console.error('Module title was:', moduleTitle);
      console.error('Module items were:', moduleItems);
      throw new Error('No learning outcomes could be generated. This may be because the module lacks instructional content or the module title indicates non-instructional content (e.g., "No Class", "Holiday").');
    }

    // Validate each objective has required fields
    const validObjectives = objectives.filter(obj => {
      if (!obj || typeof obj !== 'object') {
        console.warn('Skipping invalid objective (not an object):', obj);
        return false;
      }
      if (!obj.text || typeof obj.text !== 'string') {
        console.warn('Skipping objective with invalid text:', obj);
        return false;
      }
      return true;
    });

    if (validObjectives.length === 0) {
      console.error('No valid objectives found in response:', objectives);
      throw new Error('Invalid objectives format: no valid objectives with text field');
    }

    // Map to structured format with Bloom's level detection
    const structuredObjectives: GeneratedObjective[] = validObjectives.map(obj => {
      const text = obj.text.trim();
      const mappedItem = obj.mappedItem?.trim();
      
      // Use provided Bloom's level or detect it
      let detectedLevel: keyof typeof BLOOMS_TAXONOMY = obj.bloomsLevel || 'understand';
      let actionVerb = obj.actionVerb || '';
      
      // If not provided, detect from text
      if (!actionVerb) {
        for (const [level, verbs] of Object.entries(BLOOMS_TAXONOMY)) {
          for (const verb of verbs) {
            if (text.toLowerCase().startsWith(verb.toLowerCase())) {
              detectedLevel = level as keyof typeof BLOOMS_TAXONOMY;
              actionVerb = verb;
              break;
            }
          }
          if (actionVerb) break;
        }
      }

      return {
        text,
        bloomsLevel: detectedLevel,
        actionVerb: actionVerb || text.split(' ')[0],
        mappedItem
      };
    });

    return structuredObjectives;

  } catch (error) {
    console.error('Error generating learning objectives:', error);
    
    // Fallback: Generate basic objectives based on module title
    const fallbackObjectives: GeneratedObjective[] = [
      {
        text: `Explain the key concepts and principles covered in ${moduleTitle}`,
        bloomsLevel: 'understand',
        actionVerb: 'Explain'
      },
      {
        text: `Apply knowledge from ${moduleTitle} to solve relevant problems`,
        bloomsLevel: 'apply',
        actionVerb: 'Apply'
      },
      {
        text: `Analyze the relationships between different components of ${moduleTitle}`,
        bloomsLevel: 'analyze',
        actionVerb: 'Analyze'
      }
    ];

    return fallbackObjectives;
  }
}

/**
 * Helper function to format objectives for Canvas module description
 */
export function formatObjectivesForCanvas(objectives: GeneratedObjective[]): string {
  const header = '<h3>Learning Outcomes</h3>\\n<ol>\\n';
  const items = objectives.map(obj => `  <li>${obj.text}</li>`).join('\\n');
  const footer = '\\n</ol>';
  
  return header + items + footer;
}

/**
 * Helper function to update Canvas module with objectives
 */
export async function addObjectivesToCanvasModule(
  canvasUrl: string,
  courseId: string,
  moduleId: string,
  objectives: GeneratedObjective[],
  canvasToken: string
): Promise<boolean> {
  const htmlContent = formatObjectivesForCanvas(objectives);
  
  // Update module description via Canvas API
  const response = await fetch(
    `${canvasUrl}/api/v1/courses/${courseId}/modules/${moduleId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${canvasToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        module: {
          // Prepend objectives to existing description (or create new)
          // In practice, you'd fetch the current description first
          // and intelligently merge or replace
          name: undefined, // Don't change the name
          // Note: Canvas API might require different field for description
          // This is a simplified version
        }
      })
    }
  );

  return response.ok;
}