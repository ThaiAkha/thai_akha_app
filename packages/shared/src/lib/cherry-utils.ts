/**
 * Cherry AI Response Utilities
 */

/**
 * 🛡️ SECURITY HELPER: Clean JSON artifacts from LLM response.
 * Handles cases where the model might wrap the response in a JSON object
 * like {"response": "..."} or starts with a JSON chunk during streaming.
 */
export const cleanCherryResponse = (text: string): string => {
  if (!text) return '';

  // Case 1: Full JSON string
  if (text.startsWith('{"') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.response) return String(parsed.response);
    } catch {
      // Not a valid JSON, continue to regex cleaning
    }
  }

  // Case 2: Partial or malformed JSON (common in streaming or truncated outputs)
  if (text.includes('{"response":"') || text.startsWith('{"')) {
    return text
      .replace(/^\{"response":"/, '') // Remove prefix if it exists
      .replace(/^\{"/, '')            // Remove generic JSON start
      .replace(/"\}$/, '')            // Remove suffix
      .replace(/\\n/g, '\n')          // Unescape newlines
      .replace(/\\"/g, '"');          // Unescape quotes
  }

  return text;
};
