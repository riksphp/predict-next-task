import { AgentType } from '../core/types';

export interface RouterResponse {
  intent: 'TASK_PLANNING' | 'CONTENT_REQUEST' | 'ANALYSIS_REQUEST' | 'LEARNING_UPDATE' | 'UNKNOWN';
  routeTo: AgentType;
  confidence: number; // 0..1
  rationale: string;
}

export function routerPrompt(params: { goal: string; context?: Record<string, unknown> }): string {
  const system = `You are RouterAgent. Decide the user's intent and which agent should handle it. Return ONLY JSON with fields intent, routeTo, confidence, rationale.`;
  const user = {
    goal: params.goal,
    context: params.context ?? {},
    agents: ['TASK_PLANNER', 'CONTENT_CREATOR', 'ANALYSIS', 'LEARNING'],
  };
  return `${system}\n\n${JSON.stringify(user)}`;
}
