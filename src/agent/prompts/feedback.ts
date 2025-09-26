export interface FeedbackResponse {
  control: 'FINAL_ANSWER' | 'PLAN_STEP' | 'CRITIQUE';
  sentiment: 'positive' | 'neutral' | 'negative';
  satisfaction?: number;
  comments?: string[];
}

export function feedbackPrompt(input: { transcript: string[] }): string {
  const system = `You are FeedbackAgent. Summarize user sentiment and satisfaction. Return ONLY JSON with: control, sentiment, satisfaction?, comments?`;
  return `${system}\n\n${JSON.stringify(input)}`;
}
