import { LlmClient } from '../../../agent/core/llmClient';

const llm = new LlmClient();

export async function summarizeConversation(
  messages: { role: string; text: string }[],
): Promise<string> {
  const convoText = messages.map((m) => `${m.role}: ${m.text}`).join('\n');
  const prompt = [
    'Summarize the following conversation into 4-6 bullet points capturing key facts and user intents.',
    'Return ONLY JSON: { "summary": string } with the bullets in a single string.',
    '',
    convoText,
  ].join('\n');
  const json = await llm.generateJson('INTERACTION', prompt);
  return String(json.summary || '');
}
