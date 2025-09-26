export interface AnalysisResponse {
  control: 'FINAL_ANSWER' | 'PLAN_STEP' | 'CRITIQUE';
  insights: string[];
  trends?: string[];
  anomalies?: string[];
  recommendations?: string[];
}

export function analysisPrompt(input: { context?: Record<string, unknown> }): string {
  const system = `You are AnalysisAgent. Analyze patterns and return ONLY JSON with fields: control, insights[], trends?, anomalies?, recommendations?`;
  return `${system}\n\n${JSON.stringify(input)}`;
}
