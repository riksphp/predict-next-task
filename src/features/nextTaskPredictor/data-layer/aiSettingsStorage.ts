const AI_SETTINGS_KEY = 'aiSettings';

export interface AISettings {
  provider?: 'gemini' | 'openai' | 'groq' | 'custom';
  apiKey?: string;
  apiUrl?: string;
  modelName?: string;
  lastUpdated?: string;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'gemini',
  apiKey: '',
  apiUrl:
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
  modelName: 'gemini-1.5-flash-latest',
};

function hasChromeStorage(): boolean {
  return Boolean(window.chrome && window.chrome.storage && window.chrome.storage.local);
}

export async function getAISettings(): Promise<AISettings> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get([AI_SETTINGS_KEY], (items: Record<string, unknown>) => {
          const settings = (items?.[AI_SETTINGS_KEY] as AISettings) || {};
          resolve({ ...DEFAULT_AI_SETTINGS, ...settings });
        });
      });
    }
    const raw = localStorage.getItem(AI_SETTINGS_KEY);
    const settings = raw ? JSON.parse(raw) : {};
    return { ...DEFAULT_AI_SETTINGS, ...settings };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export async function saveAISettings(settings: AISettings): Promise<void> {
  const withTimestamp: AISettings = { ...settings, lastUpdated: new Date().toISOString() };
  try {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [AI_SETTINGS_KEY]: withTimestamp }, () => resolve());
      });
      return;
    }
    localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(withTimestamp));
  } catch {
    // ignore
  }
}

export async function updateAISettings(partial: Partial<AISettings>): Promise<AISettings> {
  const existing = await getAISettings();
  const merged = { ...existing, ...partial, lastUpdated: new Date().toISOString() };
  await saveAISettings(merged);
  return merged;
}

export function getProviderDefaults(provider: string): Partial<AISettings> {
  switch (provider) {
    case 'openai':
      return {
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        modelName: 'gpt-4o-mini',
      };
    case 'groq':
      return {
        apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
        modelName: 'llama-3.1-8b-instant',
      };
    case 'gemini':
      return {
        apiUrl:
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
        modelName: 'gemini-1.5-flash-latest',
      };
    default:
      return {};
  }
}
