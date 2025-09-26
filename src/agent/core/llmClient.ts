import { AgentType } from './types';
import { callGeminiApi, callCustomAI } from '../../features/nextTaskPredictor/data-layer/geminiApi';

function ensureJsonObject(raw: string): any {
  const cleaned = raw
    .trim()
    .replace(/```json|```/g, '')
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {}
  throw new Error('LLM did not return valid JSON.');
}

export class LlmClient {
  async generateJson(agent: AgentType, prompt: string): Promise<any> {
    // For now, delegate to current provider settings via existing clients
    // Future: choose provider/model per agent
    void agent;
    const gemini = await callGeminiApi(prompt);
    try {
      return ensureJsonObject(gemini);
    } catch {
      const custom = await callCustomAI(prompt);
      return ensureJsonObject(custom);
    }
  }
}
