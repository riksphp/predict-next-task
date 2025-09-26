export interface InteractionResponse {
  control: 'PLAN_STEP' | 'FINAL_ANSWER' | 'CRITIQUE';
  prompt: string;
  persona?: string;
  followUps?: string[];
}

export function interactionPrompt(input: {
  topic: string;
  context?: Record<string, unknown>;
}): string {
  const system = `You are InteractionAgent. Prepare dialogue with context. Return ONLY JSON with: control, prompt, persona?, followUps?`;
  return `${system}\n\n${JSON.stringify(input)}`;
}
