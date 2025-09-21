import { PROMPTS } from '../data-layer/prompts';
import { callGeminiApi } from '../data-layer/geminiApi';
import { getUserInputs } from '../data-layer/userInputStorage';

const ANALYSIS_KEY = 'userAnalysis';

export interface UserAnalysis {
  patterns: string[];
  interests: string[];
  workStyle: string;
  priorities: string[];
  suggestions: string[];
  lastAnalyzed: string;
}

function hasChromeStorage(): boolean {
  return Boolean(window.chrome && window.chrome.storage && window.chrome.storage.local);
}

export async function getUserAnalysis(): Promise<UserAnalysis | null> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get([ANALYSIS_KEY], (items: Record<string, unknown>) => {
          resolve((items?.[ANALYSIS_KEY] as UserAnalysis) || null);
        });
      });
    }
    const raw = localStorage.getItem(ANALYSIS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveUserAnalysis(analysis: UserAnalysis): Promise<void> {
  try {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [ANALYSIS_KEY]: analysis }, () => resolve());
      });
      return;
    }
    localStorage.setItem(ANALYSIS_KEY, JSON.stringify(analysis));
  } catch {
    // ignore
  }
}

export async function analyzeUserInputs(): Promise<UserAnalysis> {
  const userInputs = await getUserInputs();
  const inputTexts = userInputs.map((input) => `[${input.source}] ${input.text}`).join('\n');

  const prompt = PROMPTS.USER_INPUT_ANALYSIS.replace('{userInputs}', inputTexts);
  const response = await callGeminiApi(prompt);

  try {
    let jsonString = response.trim();

    // Remove any wrapping ```json ... ``` if present
    jsonString = jsonString.replace(/```json|```/g, '').trim();

    const analysis: UserAnalysis = {
      ...JSON.parse(jsonString),
      lastAnalyzed: new Date().toISOString(),
    };

    await saveUserAnalysis(analysis);
    return analysis;
  } catch (error) {
    console.error('Failed to parse analysis:', error);
    const fallbackAnalysis: UserAnalysis = {
      patterns: ['Regular input patterns detected'],
      interests: ['General productivity'],
      workStyle: 'Structured approach to tasks',
      priorities: ['Task completion'],
      suggestions: ['Continue regular input for better insights'],
      lastAnalyzed: new Date().toISOString(),
    };
    await saveUserAnalysis(fallbackAnalysis);
    return fallbackAnalysis;
  }
}
