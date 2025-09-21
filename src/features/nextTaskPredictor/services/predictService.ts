import { getBaseTruths } from '../data-layer/baseTruths';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL;

export async function predictNextTask(context: string): Promise<string> {
  try {
    const baseTruths = getBaseTruths();

    const prompt = `You are a personal assistant grounded in the base truths.

Always suggest the next meaningful task for the user, even if no user context is provided. 
Each task must be a SMART action (Specific, Measurable, Achievable, Relevant, Time-bound). 
Keep answers short, practical, and actionable.

Base Truths: ${JSON.stringify(baseTruths, null, 2)}
User Context: ${context || 'No context provided'}

Respond ONLY with:
1. The next meaningful task (one sentence, SMART format)
2. A short reasoning (one line, practical, not philosophical)`;

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
