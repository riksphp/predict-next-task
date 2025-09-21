import { PROMPTS } from '../data-layer/prompts';
import { callGeminiApi } from '../data-layer/geminiApi';
import { addNewContext, ContextData } from '../data-layer/userContextStorage';
import { getBaseTruths } from '../data-layer/baseTruths';
import { getUserAnalysis } from './analysisService';

export async function extractContext(input: string): Promise<string> {
  const baseTruths = getBaseTruths();

  // Get or create user analysis for better context
  let userAnalysis = await getUserAnalysis();
  // if (!userAnalysis) {
  // userAnalysis = await analyzeUserInputs();
  // }

  const enrichedContext = {
    input,
    userAnalysis,
  };

  const prompt = PROMPTS.CONTEXT_EXTRACTION.replace(
    '{baseTruths}',
    JSON.stringify(baseTruths, null, 2),
  ).replace('{userInput}', JSON.stringify(enrichedContext, null, 2));
  const response = await callGeminiApi(prompt);

  try {
    let jsonString = response.trim();

    // Remove any wrapping ```json ... ``` if present
    jsonString = jsonString.replace(/```json|```/g, '').trim();

    // Parse JSON response
    const newContext: ContextData = JSON.parse(jsonString);

    // Extract serverResponse for UI
    const serverResponse = newContext.serverResponse || 'Thanks for sharing!';

    // Remove serverResponse from context before saving
    const { serverResponse: _, ...contextToSave } = newContext;

    // Add new context with timestamp
    await addNewContext(contextToSave);

    return serverResponse;
  } catch (error) {
    console.error('Failed to parse context:', error);
    return response; // Return raw response if parsing fails
  }
}
