import { PROMPTS } from '../data-layer/prompts';
import { callGeminiApi } from '../data-layer/geminiApi';
import {
  getUserContext,
  saveUserContext,
  mergeUserContext,
  UserContext,
} from '../data-layer/userContextStorage';
import { getBaseTruths } from '../data-layer/baseTruths';

export async function extractContext(input: string): Promise<string> {
  const baseTruths = getBaseTruths();
  const prompt = PROMPTS.CONTEXT_EXTRACTION.replace(
    '{baseTruths}',
    JSON.stringify(baseTruths, null, 2),
  ).replace('{userInput}', input);
  const response = await callGeminiApi(prompt);

  try {
    let jsonString = response.trim();

    // Remove any wrapping ```json ... ``` if present
    jsonString = jsonString.replace(/```json|```/g, '').trim();

    // Parse JSON response
    const newContext: UserContext = JSON.parse(jsonString);

    // Extract serverResponse for UI
    const serverResponse = newContext.serverResponse || 'Thanks for sharing!';

    // Remove serverResponse from context before saving
    const { serverResponse: _, ...contextToSave } = newContext;

    // Get existing context
    const existingContext = await getUserContext();

    // Merge contexts (without serverResponse)
    const mergedContext = mergeUserContext(existingContext, contextToSave);

    // Save merged context
    await saveUserContext(mergedContext);

    return serverResponse;
  } catch (error) {
    console.error('Failed to parse context:', error);
    return response; // Return raw response if parsing fails
  }
}
