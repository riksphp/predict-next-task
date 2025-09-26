export interface LearningResponse {
  control: 'FINAL_ANSWER' | 'PLAN_STEP' | 'CRITIQUE';
  preferences?: Record<string, unknown>;
  skills?: string[];
  notes?: string[];
}

export function learningPrompt(input: { deltas?: Record<string, unknown> }): string {
  const system = `You are LearningAgent. Update user model and return ONLY JSON with fields: control, preferences?, skills?, notes?`;
  return `${system}\n\n${JSON.stringify(input)}`;
}
