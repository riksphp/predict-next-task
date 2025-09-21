import { getBaseTruths } from '../data-layer/baseTruths';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL;

export async function predictNextTask(context: string): Promise<string> {
  try {
    const baseTruths = getBaseTruths();

    const prompt = `System: Always ground reasoning in the base truths. Use user context to suggest the next meaningful task.

Base Truths:
${JSON.stringify(baseTruths, null, 2)}

User Context:
${context || 'No context provided'}

Suggest the next meaningful task:`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
  } catch (error) {
    console.error('Prediction error:', error);
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
