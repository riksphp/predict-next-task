import { getAISettings } from './aiSettingsStorage';

// Fallback to environment variables if no user settings
const FALLBACK_GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const FALLBACK_GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL;

export async function callGeminiApi(prompt: string): Promise<string> {
  try {
    const settings = await getAISettings();

    // Use user settings if available, otherwise fallback to environment variables
    const apiKey = settings.apiKey || FALLBACK_GEMINI_API_KEY;
    const apiUrl = settings.apiUrl || FALLBACK_GEMINI_API_URL;

    if (!apiKey) {
      throw new Error('API key not configured. Please set up your AI settings.');
    }

    if (!apiUrl) {
      throw new Error('API URL not configured. Please set up your AI settings.');
    }

    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
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
    console.error('Gemini API error:', error);
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

export async function callCustomAI(prompt: string): Promise<string> {
  try {
    const settings = await getAISettings();

    if (!settings.apiKey) {
      throw new Error('API key not configured. Please set up your AI settings.');
    }

    if (!settings.apiUrl) {
      throw new Error('API URL not configured. Please set up your AI settings.');
    }

    // Handle different API formats based on provider
    let requestBody: any;
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (settings.provider === 'openai' || settings.provider === 'groq') {
      headers['Authorization'] = `Bearer ${settings.apiKey}`;
      requestBody = {
        model: settings.modelName,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      };
    } else if (settings.provider === 'gemini') {
      // Gemini format (with API key in URL)
      requestBody = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      };
    } else {
      // Custom format - assume OpenAI-compatible by default
      headers['Authorization'] = `Bearer ${settings.apiKey}`;
      requestBody = {
        model: settings.modelName,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      };
    }

    const url =
      settings.provider === 'gemini'
        ? `${settings.apiUrl}?key=${settings.apiKey}`
        : settings.apiUrl;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Handle different response formats
    if (
      settings.provider === 'openai' ||
      settings.provider === 'groq' ||
      settings.provider === 'custom'
    ) {
      return data.choices?.[0]?.message?.content || 'No response from AI';
    } else if (settings.provider === 'gemini') {
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
    } else {
      // Try to extract response from common formats
      return (
        data.choices?.[0]?.message?.content ||
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        data.response ||
        data.text ||
        'No response from AI'
      );
    }
  } catch (error) {
    console.error('Custom AI API error:', error);
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
