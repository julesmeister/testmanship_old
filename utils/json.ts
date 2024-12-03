/**
 * Utility functions for handling and repairing JSON data, particularly from AI responses
 */

/**
 * Repairs malformed JSON by adding missing commas, quotes, and brackets
 * @param json The potentially malformed JSON string to repair
 * @returns A properly formatted JSON string
 */
function repairJSON(json: string): string {
  let repairedJson = json;
  
  // First fix any unclosed quotes
  const quoteCount = (json.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    // Find the last property name or value that's missing a closing quote
    repairedJson = repairedJson.replace(/(".*?)(?=[,}\]](?:[^"]*$))/, '$1"');
  }

  // Add missing commas between properties
  repairedJson = repairedJson.replace(/"\s*}\s*{/g, '"},{"');
  repairedJson = repairedJson.replace(/"\s*]\s*\[/g, '"],["');
  
  // Add missing commas between array elements
  repairedJson = repairedJson.replace(/](?=\s*[{\[])/g, '],');
  repairedJson = repairedJson.replace(/}(?=\s*[{\[])/g, '},');
  
  // Add missing commas between properties
  repairedJson = repairedJson.replace(/("(?:\\.|[^"\\])*")\s*("(?:\\.|[^"\\])*")/g, '$1,$2');
  repairedJson = repairedJson.replace(/([0-9])\s*("(?:\\.|[^"\\])*")/g, '$1,$2');
  repairedJson = repairedJson.replace(/("(?:\\.|[^"\\])*")\s*([0-9])/g, '$1,$2');
  repairedJson = repairedJson.replace(/([0-9])\s*([{\[])/g, '$1,$2');
  
  // Add missing commas in arrays
  repairedJson = repairedJson.replace(/("(?:\\.|[^"\\])*")\s*("(?:\\.|[^"\\])*")/g, '$1,$2');
  repairedJson = repairedJson.replace(/\[\s*"([^"]+)"\s*"([^"]+)"\s*\]/g, '["$1","$2"]');
  
  // Track bracket/brace structure
  const stack: string[] = [];
  const expected: { [key: string]: string } = {
    '{': '}',
    '[': ']'
  };
  
  let result = '';
  let inString = false;
  let escaped = false;
  
  // Process character by character
  for (let i = 0; i < repairedJson.length; i++) {
    const char = repairedJson[i];
    result += char;
    
    // Handle string content
    if (char === '"' && !escaped) {
      inString = !inString;
    }
    escaped = char === '\\' && !escaped;
    
    if (!inString) {
      // Handle opening brackets/braces
      if (char === '{' || char === '[') {
        stack.push(char);
      }
      // Handle closing brackets/braces
      else if (char === '}' || char === ']') {
        if (stack.length === 0) {
          // Remove unexpected closing bracket
          result = result.slice(0, -1);
        } else {
          const last = stack.pop()!;
          const expectedChar = expected[last];
          if (char !== expectedChar) {
            // Remove incorrect closing bracket
            result = result.slice(0, -1);
            // Add correct closing bracket
            result += expectedChar;
          }
        }
      }
      // Handle commas
      else if (char === ',') {
        // Check if next non-whitespace char is a closing bracket/brace
        const nextChar = repairedJson.slice(i + 1).match(/\s*([}\]])/)?.[1];
        if (nextChar) {
          // Remove trailing comma
          result = result.slice(0, -1);
        }
      }
    }
  }
  
  // Close any remaining open brackets/braces
  while (stack.length > 0) {
    const char = stack.pop()!;
    result += expected[char];
  }

  // Ensure the JSON has an outer structure if missing
  if (!result.trim().startsWith('{') && !result.trim().startsWith('[')) {
    result = '{' + result + '}';
  }

  // Try to parse and format the result
  try {
    return JSON.stringify(JSON.parse(result), null, 2);
  } catch (e) {
    console.warn('Could not format repaired JSON:', e);
    return result;
  }
}

/**
 * Extracts and repairs JSON from an AI response that may contain markdown or other formatting
 * @param aiResponse The raw AI response that may contain JSON within markdown blocks
 * @returns The parsed JSON object
 * @throws Error if no valid JSON could be found or repaired
 */
export function extractJSONFromAIResponse<T>(aiResponse: string): T {
  // Extract JSON from the response, handling various markdown formats
  const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                   aiResponse.match(/(\{[\s\S]*\})/);
                   
  if (!jsonMatch) {
    console.error('Could not find valid JSON in response');
    throw new Error('Invalid response format');
  }

  let cleanedResponse = jsonMatch[1].trim();
  
  // Try parsing as-is first
  try {
    return JSON.parse(cleanedResponse) as T;
  } catch (e) {
    // If parsing fails, try to repair it
    console.log('Initial JSON parsing failed, attempting repair...');
    cleanedResponse = repairJSON(cleanedResponse);
    console.log('Repaired JSON:', cleanedResponse);
    
    // Try parsing the repaired JSON
    try {
      return JSON.parse(cleanedResponse) as T;
    } catch (e) {
      console.error('Failed to parse repaired JSON:', e);
      throw new Error('Could not parse AI response as JSON');
    }
  }
}
